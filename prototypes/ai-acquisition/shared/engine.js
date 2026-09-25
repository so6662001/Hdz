/* 货袋子 · AI 获客 · 规则模拟引擎（意图识别 / 话术匹配 / 变量渲染 / 内容安全 / 自然语言解析 / 流程推进）
   正式实现中标注 [LLM] 的部分由 ModelGateway 调用大模型完成，这里用规则模拟以演示交互。 */
(function (w) {
  const S = w.ACQ;
  const INTENT_RULES = [
    { intent: 'ASK_PRICE', words: ['多少钱', '价格', '报价', '单价', '什么价', '报个价'], score: 78 },
    { intent: 'INQUIRY', words: ['有没有货', '有货', '谁有', '求购', '找货', '要 ', '急要', '吨'], score: 74 },
    { intent: 'ASK_RECOMMEND', words: ['求推荐', '推荐', '靠谱', '哪家', '找供应商', '哪里有'], score: 66 },
    { intent: 'ASK_MATERIAL', words: ['有没有资料', '资料', '规格表', '价格表', '发我', '目录'], score: 58 },
    { intent: 'SIGNUP', words: ['怎么报名', '报名', '参加', '怎么加入'], score: 60 },
  ];
  const ENTITY_RE = { quantity: /(\d+(?:\.\d+)?)\s*(吨|t|车|件|米)/i, spec: /(HRB\d{3}[E]?|Q\d{3}[A-D]?|Φ?\s?\d{1,2}(?:-\d{1,2})?\s*(?:mm|的|个)?|\d{1,2}\s*mm)/i, address: /(发到|送到|到)\s*([\u4e00-\u9fa5]{2,8}?(?:市|区|园区|工地|仓|县))/, delivery: /(明天|后天|下周|本周|月底|\d+\s*天内|急)/ };
  const CATEGORY_OF = { PRICE: 'ASK_PRICE', CASE: 'ASK_CASE', MATERIAL: 'ASK_MATERIAL', OBJECTION: 'CONSIDERING', GREETING: 'INQUIRY', CLOSING: 'CONTRACT' };

  const Engine = {
    /* 意图识别：规则优先，未命中模拟 LLM */
    classifyIntent(text) {
      for (const r of INTENT_RULES) { const hit = r.words.find(wd => text.includes(wd.trim())); if (hit) { const bonus = Engine.extractEntities(text).count * 6; return { intent: r.intent, score: Math.min(98, r.score + bonus), source: 'RULE', reason: `命中意图短语「${hit.trim()}」` + (bonus ? `，含 ${Engine.extractEntities(text).count} 个实体 +${bonus}` : '') }; } }
      if (/[?？]|吗|呢|怎么|哪|多少/.test(text)) return { intent: 'INQUIRY', score: 52, source: 'LLM', reason: '[LLM] 疑问句式，判断为泛需求（置信度 0.63）' };
      return { intent: 'IRRELEVANT', score: 18, source: 'LLM', reason: '[LLM] 未表达采购/咨询意图' };
    },
    extractEntities(text) {
      const e = {}; let count = 0;
      for (const k in ENTITY_RE) { const m = text.match(ENTITY_RE[k]); if (m) { e[k] = (k === 'address' ? m[2] : m[0]).trim(); count++; } }
      e.count = count; return e;
    },
    isRefusal(text) { return S.refusals.find(r => text.includes(r)); },
    /* 回复匹配：黑名单词 → 关键词规则（按优先级）→ 模拟 LLM 语义分类 → 无 */
    matchScript(text, scene) {
      const ref = Engine.isRefusal(text); if (ref) return { refusal: true, rule: `拒绝词「${ref}」`, source: 'RULE' };
      const cands = S.scripts.filter(s => s.enabled && (s.keywords || []).length && (!scene || s.scene === scene || (scene === 'REPLY' && s.scene === 'REPLY'))).sort((a, b) => a.priority - b.priority);
      for (const s of cands) { const kw = s.keywords.find(k => text.includes(k)); if (kw) return { script: s, source: 'RULE', rule: `${s.category === 'PRICE' ? '价格' : s.category === 'CASE' ? '案例' : s.category === 'MATERIAL' ? '资料' : s.category === 'OBJECTION' ? '异议' : s.category === 'CLOSING' ? '合同' : ''}关键词「${kw}」`, category: CATEGORY_OF[s.category] || s.category, confidence: 1 }; }
      // [LLM] 语义兜底
      const ents = Engine.extractEntities(text);
      if (ents.quantity || ents.spec) return { script: S.scripts.find(s => s.id === 108), source: 'LLM', rule: '[LLM] 语义：提出具体规格/数量 → 需求确认', category: 'INQUIRY', confidence: 0.84, entities: ents };
      if (/加工|切割|定尺|折弯|开票|发票|送货|物流/.test(text)) return { script: null, source: 'LLM', rule: '[LLM] 语义：服务/加工类问题，话术库无对应分类', category: 'OTHER', confidence: 0.42 };
      if (/谢谢|好的|收到|嗯|行/.test(text) && text.length < 8) return { script: null, source: 'LLM', rule: '[LLM] 客户确认语，无需回复', category: 'ACK', confidence: 0.9, noReply: true };
      return { script: null, source: 'LLM', rule: '[LLM] 语义分类置信度 0.38 < 0.7，转人工', category: 'OTHER', confidence: 0.38 };
    },
    /* 变量与渲染 */
    vars(lead, opt) {
      opt = opt || {}; const owner = S.users.find(u => u.id === lead.owner);
      const lastIn = (S.conversations.find(c => c.leadId === lead.id) || { messages: [] }).messages.filter(m => m.dir === 'IN').slice(-1)[0];
      return { nickname: lead.nickname || '', source_channel: lead.sourceChannel || '', source_excerpt: lead.sourceExcerpt ? `「${lead.sourceExcerpt}」` : '', last_interaction: lastIn ? lastIn.text : '', product: lead.product && lead.product !== '—' ? lead.product : (S.merchant.products[0] || ''), sales_name: opt.salesName || (owner ? owner.name : S.merchant.defaultVars.sales_name), company: S.merchant.name, case_link: S.merchant.defaultVars.case_link, company_intro: S.merchant.intro };
    },
    PERSONAL_VARS: ['nickname', 'source_channel', 'source_excerpt', 'last_interaction'],
    render(script, lead, opt) {
      opt = opt || {}; const v = Engine.vars(lead, opt); const tpl = opt.variant != null && script.variants && script.variants[opt.variant] ? script.variants[opt.variant] : script.content;
      const used = [...tpl.matchAll(/\{(\w+)\}/g)].map(m => m[1]);
      const missing = used.filter(k => !v[k]); const required = (script.requiredVars || []).filter(k => !v[k]);
      const text = tpl.replace(/\{(\w+)\}/g, (m, k) => v[k] || (k === 'nickname' ? '您好' : ''));
      const hits = Engine.PERSONAL_VARS.filter(k => used.includes(k) && v[k]);
      const problems = [];
      if (required.length) problems.push({ code: 'ACQ-2001', level: 'error', text: `缺少必需变量 ${required.map(k => k).join(', ')}` + (required.includes('nickname') ? '（线索昵称为空）' : '') });
      else if (hits.length < (S.merchant.personalizationMin || 1)) problems.push({ code: 'ACQ-2001', level: 'error', text: `个性化变量不足：需 ≥${S.merchant.personalizationMin || 1} 个，实际 ${hits.length}` });
      const mod = Engine.moderate(text, lead.platform); if (!mod.pass) problems.push({ code: 'ACQ-2002', level: 'error', text: mod.reasons.join('；') });
      if (script.scene === 'OUTREACH' && !used.some(k => k.startsWith('source_'))) problems.push({ level: 'warn', text: '首触话术未引用来源变量（source_*），建议补充' });
      return { text: text.replace(/\s{2,}/g, ' '), vars: v, used, missing, hits, problems, ok: !problems.some(p => p.level === 'error') };
    },
    moderate(text, platform) {
      const reasons = []; (S.merchant.forbiddenWords || []).forEach(wd => { if (text.includes(wd)) reasons.push(`含广告法禁用/商家禁词「${wd}」`); });
      if (platform === 'XIAOHONGSHU' && /(微信|vx|VX|手机|电话|1[3-9]\d{9})/.test(text)) reasons.push('小红书渠道禁止出现联系方式，请改为「戳我主页」');
      if (text.length > 300) reasons.push('超过 300 字');
      return { pass: !reasons.length, reasons };
    },
    pacing(account) { const p = S.riskPolicies.find(r => r.platform === account.platform && r.tier === account.tier && r.platformDefault) || S.riskPolicies[0]; const mu = (p.delayMin + p.delayMax) / 2, sd = (p.delayMax - p.delayMin) / 4; let x = mu + sd * (Math.random() + Math.random() + Math.random() - 1.5) * 1.6; x = Math.max(p.delayMin, Math.min(p.delayMax, Math.round(x))); return { preDelaySec: x, typingCps: 6, postDelaySec: Math.round(x / 3), policy: p }; },
    quota(account) { const remainDay = account.daily - account.todaySent; const warm = account.warmupDay ? (account.warmupDay <= 3 ? .2 : account.warmupDay <= 7 ? .5 : 1) : 1; return { remainDay: Math.max(0, Math.round(account.daily * warm) - account.todaySent), effectiveDaily: Math.round(account.daily * warm), warm, hourly: account.hourly, circuit: account.status === 'RESTRICTED', offline: account.status === 'OFFLINE' }; },

    /* [LLM] 自然语言 → JobSpec */
    parseJob(text) {
      const t = text.replace(/\s+/g, ''); const amb = [], warn = [];
      let action = 'CUSTOM', name = text.slice(0, 20);
      if (/抓取|采集|扫描|找线索|抓线索/.test(t)) { action = 'CAPTURE'; name = '抓取线索'; }
      else if (/跟进|未回复|没回复|再发/.test(t)) { action = 'FOLLOW_UP'; name = '跟进未回复客户'; }
      else if (/触达|发送|发话术|首触|发消息/.test(t)) { action = 'OUTREACH'; name = '发送触达'; }
      else if (/看板|报表|统计|更新数据/.test(t)) { action = 'REFRESH_DASHBOARD'; name = '更新看板'; }
      else if (/海报|分发|发朋友圈|发群/.test(t)) { action = 'POSTER_DISPATCH'; name = '海报分发'; }
      else amb.push('未能识别动作类型（抓取 / 触达 / 跟进 / 更新看板 / 海报分发），请补充');
      // 时间
      let hour = 9, minute = 0, dow = null, human = '每天';
      const cn = { 零: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10, 十一: 11, 十二: 12 };
      const num = s => /^\d+$/.test(s) ? +s : (cn[s] != null ? cn[s] : (s.startsWith('十') ? 10 + (cn[s.slice(1)] || 0) : null));
      const tm = t.match(/(早上|上午|中午|下午|晚上)?(\d{1,2}|[一二两三四五六七八九十]{1,2})[点:：](半|\d{1,2}|[一二三四五六七八九十]{1,2}分?)?/);
      if (tm) { hour = num(tm[2]) || 9; if (tm[3] === '半') minute = 30; else if (tm[3]) minute = num(tm[3].replace('分', '')) || 0; if ((tm[1] === '下午' || tm[1] === '晚上') && hour < 12) hour += 12; if (tm[1] === '中午' && hour < 11) hour += 12; }
      else amb.push('未指定时间，默认 09:00');
      const dm = t.match(/每周([一二三四五六日天])|周([一二三四五六日天])/); if (dm) { const map = { 一: 'MON', 二: 'TUE', 三: 'WED', 四: 'THU', 五: 'FRI', 六: 'SAT', 日: 'SUN', 天: 'SUN' }; dow = map[dm[1] || dm[2]]; human = '每周' + (dm[1] || dm[2]); }
      else if (/工作日/.test(t)) { dow = 'MON-FRI'; human = '每个工作日'; }
      const cron = dow ? `0 ${minute} ${hour} ? * ${dow}` : `0 ${minute} ${hour} * * ?`;
      const pad = n => String(n).padStart(2, '0'); human += ` ${pad(hour)}:${pad(minute)}`;
      // 参数
      const params = { maxCount: action === 'CAPTURE' ? 500 : 200 };
      const plats = []; if (/抖音/.test(t)) plats.push('DOUYIN'); if (/小红书/.test(t)) plats.push('XIAOHONGSHU'); if (/论坛/.test(t)) plats.push('FORUM'); if (/企微|企业微信/.test(t)) plats.push('WECOM'); if (/微信群|个人微信|朋友圈/.test(t)) plats.push('WECHAT_PERSONAL'); if (/站内|圈子/.test(t)) plats.push('HDZ_INTERNAL');
      if (action === 'CAPTURE') { params.platforms = plats.length ? plats : S.captureRules.filter(r => r.enabled).map(r => r.platform).filter((v, i, a) => a.indexOf(v) === i); params.captureRuleIds = S.captureRules.filter(r => r.enabled && params.platforms.includes(r.platform)).map(r => r.id); if (!plats.length) amb.push('未指定渠道，默认使用全部已启用的抓取规则'); }
      if (action === 'OUTREACH') { const sc = t.match(/(\d{2})分以上|意图分(\d{2})|分数.*?(\d{2})/); params.filter = { stage: ['NEW'], minScore: sc ? +(sc[1] || sc[2] || sc[3]) : 60, createdWithinDays: 3 }; params.scriptId = 101; params.channelAccountIds = S.accounts.filter(a => a.status === 'ONLINE' && a.caps.includes('SEND_DM')).map(a => a.id); if (!sc) amb.push('未指定意图分阈值，默认 ≥60'); if (!/话术/.test(t)) amb.push('未指定话术，默认「首触 · 钢材现货（带来源）」'); }
      if (action === 'FOLLOW_UP') { const dd = t.match(/(\d+|[一二两三四五六七])天/); params.filter = { noReplyDays: dd ? (num(dd[1]) || 3) : null, dueBefore: 'now', stage: ['CONTACTED', 'REPLIED'] }; if (/案例/.test(t)) params.scriptId = 102; else if (/活动|优惠/.test(t)) params.scriptId = 105; else params.scriptId = 107; if (!dd) warn.push('未指定“几天没回复”，按流程/跟进到期时间处理'); }
      if (action === 'POSTER_DISPATCH') { params.posterId = 'PS3'; params.targets = ['企微客户群', '微信群', '朋友圈']; amb.push('未指定海报，默认最近一张「深夜行情早报」'); }
      return { name, action, cron, scheduleText: human, timezone: 'Asia/Shanghai', params, guardrails: { requireApproval: false, notifyOnFinish: ['owner'] }, ambiguities: amb, warnings: warn, confidence: amb.length ? 0.78 : 0.93, model: 'Qwen3.5-Plus (JSON Schema)' };
    },

    /* [LLM] 自然语言 → 跟进流程 DAG（简化规则模拟） */
    parseFlow(text) {
      const t = text.replace(/\s+/g, ''); const nodes = {}; const amb = []; let seq = 0; const nid = () => 'n' + (++seq);
      const first = nid(); nodes[first] = { type: 'Send', scriptId: 101, next: null };
      const num = s => ({ 一: 1, 两: 2, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7 }[s] || +s || 3);
      const segs = t.split(/[;；。]/).filter(Boolean);
      let cur = first; const w1 = nid(); nodes[cur].next = w1; nodes[w1] = { type: 'WaitForReply', timeoutHours: 72, autoReplyByScriptLib: true, branches: { REFUSED: 'end_lost', '*': 'end_human' } };
      segs.forEach(sg => {
        const m = sg.match(/(\d+|[一两二三四五六七])天(没|未|不)回复(?:就|再|则)?(发|发送)?(案例|资料|活动|优惠|话术)?(静默|结束|交给销售|转人工)?/);
        if (m) { const hrs = num(m[1]) * 24; const target = m[4]; const w = Object.values(nodes).filter(n => n.type === 'WaitForReply').pop(); if (w) w.timeoutHours = hrs;
          if (target) { const s = nid(); nodes[s] = { type: 'Send', scriptId: target === '案例' ? 102 : target === '资料' ? 104 : target === '活动' || target === '优惠' ? 105 : 107, next: null }; w.branches.NO_REPLY = s; const w2 = nid(); nodes[s].next = w2; nodes[w2] = { type: 'WaitForReply', timeoutHours: 72, autoReplyByScriptLib: true, branches: { REFUSED: 'end_lost', '*': 'end_human', NO_REPLY: 'end_silent' } }; }
          else if (m[5]) { w.branches.NO_REPLY = /静默|结束/.test(m[5]) ? 'end_silent' : 'end_human'; }
        }
        if (/问价|价格|报价/.test(sg) && /人工|销售/.test(sg)) { const h = nid(); nodes[h] = { type: 'HumanTask', kind: 'QUOTE', escalateAfterHours: 2, next: 'end_human' }; Object.values(nodes).filter(n => n.type === 'WaitForReply').forEach(n => n.branches.ASK_PRICE = h); }
        if (/再考虑|考虑/.test(sg)) { const dm = sg.match(/(\d+|[一两二三四五六七])天后?(发|发送)?(活动|优惠|案例)?/); const wt = nid(); nodes[wt] = { type: 'Wait', hours: dm ? num(dm[1]) * 24 : 72, next: null }; const s = nid(); nodes[s] = { type: 'Send', scriptId: dm && dm[3] === '案例' ? 102 : 105, next: 'end_human' }; nodes[wt].next = s; Object.values(nodes).filter(n => n.type === 'WaitForReply')[0].branches.CONSIDERING = wt; }
      });
      if (!Object.values(nodes).some(n => n.type === 'WaitForReply' && n.branches.NO_REPLY)) { nodes[w1].branches.NO_REPLY = 'end_silent'; amb.push('未说明首次未回复如何处理，默认置为静默'); }
      amb.push('未说明「其他回复」如何处理，默认交给人工');
      nodes.end_silent = { type: 'End', stage: 'SILENT' }; nodes.end_lost = { type: 'End', stage: 'LOST', reason: 'REFUSED' }; nodes.end_human = { type: 'End', handoff: true };
      return { name: '由描述生成的流程', nlDescription: text, trigger: { on: 'STAGE_ENTER', stage: 'NEW', minScore: 60, priority: 30 }, guardrails: { maxAutoSends: 4, maxLoops: 2 }, nodes, first, ambiguities: amb, confidence: 0.86 };
    },

    /* 流程：校验与推进（与 02 分册 5A 一致） */
    flow: {
      NODE_META: { Send: ['发送话术', 'send', '✉️'], Wait: ['等待', 'wait', '⏳'], WaitForReply: ['等待回复', 'wait', '💬'], Branch: ['条件分支', 'branch', '⑂'], HumanTask: ['人工任务', 'human', '👤'], SetStage: ['置阶段', 'set', '🏷️'], Tag: ['打标签', 'set', '🔖'], Notify: ['通知', 'set', '🔔'], GoTo: ['回到', 'goto', '↺'], End: ['结束', 'end', '◼'] },
      BRANCH_LABEL: { NO_REPLY: '未回复（超时）', REFUSED: '拒绝', ASK_PRICE: '问价格', ASK_CASE: '问案例', ASK_MATERIAL: '求资料', CONSIDERING: '再考虑', HAS_ENTITIES: '提到数量/规格', INQUIRY: '询货', CONTRACT: '问合同/账期', '*': '其他回复', DONE: '完成', ESCALATED: '升级' },
      label(def, id) { const n = def.nodes[id]; if (!n) return id; const M = Engine.flow.NODE_META[n.type]; switch (n.type) { case 'Send': { const s = S.scripts.find(x => x.id === n.scriptId); return `发送话术「${s ? s.name : n.scriptId}」`; } case 'Wait': return `等待 ${n.hours >= 24 ? n.hours / 24 + ' 天' : n.hours + ' 小时'}`; case 'WaitForReply': return `等待回复 · 最长 ${n.timeoutHours >= 24 ? n.timeoutHours / 24 + ' 天' : n.timeoutHours + ' 小时'}`; case 'HumanTask': return `人工任务 · ${{ QUOTE: '报价', CONTRACT: '合同', FOLLOW_UP: '跟进', CUSTOM: '自定义' }[n.kind] || n.kind}${n.escalateAfterHours ? ` · ${n.escalateAfterHours}h 未处理升级` : ''}`; case 'SetStage': return `置阶段为「${{ HOT: '高意向', SILENT: '静默', LOST: '流失' }[n.stage] || n.stage}」`; case 'Notify': return `通知 ${n.to === 'owner' ? '负责人' : n.to}`; case 'GoTo': return `回到「${Engine.flow.label(def, n.target)}」 · 上限 ${n.maxLoops} 次`; case 'End': return `结束${n.stage ? ' · 置为 ' + ({ SILENT: '静默', LOST: '流失' }[n.stage] || n.stage) : ''}${n.handoff ? ' · 交人工' : ''}`; case 'Tag': return `打标签 ${n.tags}`; default: return M ? M[0] : n.type; } },
      validate(def) {
        const errors = [], warnings = []; const ids = Object.keys(def.nodes); const reach = new Set(); const stack = [def.first];
        while (stack.length) { const id = stack.pop(); if (!id || reach.has(id)) continue; reach.add(id); const n = def.nodes[id]; if (!n) { errors.push(`节点 ${id} 不存在（被引用）`); continue; } const outs = n.type === 'WaitForReply' || n.type === 'Branch' ? Object.values(n.branches || {}) : n.type === 'GoTo' ? [n.target, n.onExceed] : n.type === 'HumanTask' ? [n.next, n.onEscalate] : n.type === 'End' ? [] : [n.next]; outs.forEach(o => { if (o && !def.nodes[o]) errors.push(`节点「${id}」的出口指向不存在的节点 ${o}`); else if (o) stack.push(o); }); if (n.type !== 'End' && n.type !== 'GoTo' && n.type !== 'WaitForReply' && n.type !== 'Branch' && !n.next) errors.push(`节点「${id}」缺少下一步`); if (n.type === 'Send' && !S.scripts.find(s => s.id === n.scriptId)) errors.push(`节点「${id}」引用的话术不存在`); if (n.type === 'WaitForReply' && !(n.branches && n.branches['*'])) warnings.push(`节点「${id}」未配置「其他回复」出口，默认回到等待`); }
        ids.forEach(id => { if (!reach.has(id)) warnings.push(`节点「${id}」不可达（孤立）`); });
        if (!ids.some(id => def.nodes[id].type === 'End' && reach.has(id))) errors.push('没有任何可达的结束节点');
        const sends = ids.filter(id => def.nodes[id].type === 'Send').length; if (def.guardrails && sends > def.guardrails.maxAutoSends) warnings.push(`发送节点数 ${sends} 超过护栏 maxAutoSends=${def.guardrails.maxAutoSends}，部分路径会被护栏截断`);
        return { errors, warnings, ok: !errors.length };
      },
      /* 推进：从当前节点按事件走到下一个等待点，返回 trace */
      advance(inst, def, event) {
        const trace = []; let cur = inst.currentNode; let guard = 0; let ev = event;
        const step = (node, outcome, extra) => { inst.stepSeq++; trace.push(Object.assign({ seq: inst.stepSeq, node, type: def.nodes[node].type, event: ev ? ev.type + (ev.category ? ':' + ev.category : '') : 'ENTER', outcome, label: Engine.flow.label(def, node) }, extra || {})); ev = null; };
        while (cur && guard++ < 40) {
          const n = def.nodes[cur]; if (!n) break;
          if (n.type === 'Send') { if (inst.autoSends >= (def.guardrails?.maxAutoSends || 4)) { step(cur, 'GUARDRAIL_MAX_SENDS'); inst.status = 'TERMINATED'; inst.endReason = 'GUARDRAIL_MAX_SENDS'; break; } inst.autoSends++; step(cur, 'next', { send: n.scriptId }); cur = n.next; continue; }
          if (n.type === 'Wait') { if (ev && ev.type === 'TIMEOUT') { step(cur, 'TIMEOUT'); cur = n.next; continue; } step(cur, `WAITING(${n.hours}h)`); inst.status = 'WAITING'; inst.waitingType = 'TIMER'; inst.currentNode = cur; inst.waitingUntil = Date.now() + n.hours * 3600e3; return trace; }
          if (n.type === 'WaitForReply') {
            if (ev && (ev.type === 'TIMEOUT' || ev.type === 'REPLY')) { let key = ev.type === 'TIMEOUT' ? 'NO_REPLY' : (ev.refusal ? 'REFUSED' : (ev.entities && (ev.entities.quantity || ev.entities.spec) && n.branches.HAS_ENTITIES ? 'HAS_ENTITIES' : (n.branches[ev.category] ? ev.category : '*'))); const to = n.branches[key] || n.branches['*'] || cur; step(cur, key); cur = to; if (to === inst.currentNode && key === '*') { /* 回到自身等待 */ } continue; }
            step(cur, `WAITING(${n.timeoutHours}h)`); inst.status = 'WAITING'; inst.waitingType = 'REPLY'; inst.currentNode = cur; inst.waitingUntil = Date.now() + n.timeoutHours * 3600e3; return trace;
          }
          if (n.type === 'HumanTask') { if (ev && ev.type === 'HUMAN_DONE') { step(cur, 'DONE'); cur = n.next; continue; } if (ev && ev.type === 'TIMEOUT') { step(cur, 'ESCALATED'); cur = n.onEscalate || n.next; continue; } step(cur, `WAITING(人工 · ${n.escalateAfterHours || 24}h 升级)`); inst.status = 'WAITING'; inst.waitingType = 'HUMAN_TASK'; inst.currentNode = cur; inst.waitingUntil = Date.now() + (n.escalateAfterHours || 24) * 3600e3; return trace; }
          if (n.type === 'SetStage') { step(cur, n.stage, { setStage: n.stage }); cur = n.next; continue; }
          if (n.type === 'Tag' || n.type === 'Notify') { step(cur, 'next'); cur = n.next; continue; }
          if (n.type === 'Branch') { const key = Object.keys(n.branches).find(k => k !== 'default' && ev && ev.category === k) || 'default'; step(cur, key); cur = n.branches[key]; continue; }
          if (n.type === 'GoTo') { inst.loops = inst.loops || {}; inst.loops[cur] = (inst.loops[cur] || 0) + 1; if (inst.loops[cur] > n.maxLoops) { step(cur, `超出 ${n.maxLoops} 次 → onExceed`); cur = n.onExceed; continue; } step(cur, `→ ${Engine.flow.label(def, n.target)} (${inst.loops[cur]}/${n.maxLoops})`); cur = n.target; continue; }
          if (n.type === 'End') { step(cur, n.handoff ? 'HANDOFF' : (n.stage || 'END')); inst.status = 'COMPLETED'; inst.currentNode = cur; inst.endReason = 'END_NODE' + (n.stage ? '(' + n.stage + ')' : n.handoff ? '(handoff)' : ''); inst.endedAt = Date.now(); inst.waitingType = null; return trace; }
          break;
        }
        inst.currentNode = cur || inst.currentNode; return trace;
      },
    },
  };
  w.Engine = Engine;
})(window);
