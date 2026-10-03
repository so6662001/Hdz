/* 货袋子 · 接单方案引擎（Order Plan Engine）· 规则模拟
 * 输入：询价原文 / 客户 / 库存 / 外部货源 / 物流 / 拼车窗口 / 参数
 * 输出：解析后的询价行、若干可交付的接单方案（配货 + 物流 + 到岸成本 + 报价 + 毛利 + 守门结论 + 后续动作）
 * 规则文档：docs/ai-steel-ops/02-接单方案引擎规则.md */
(function (w) {
  const R10 = (n) => Math.round(n / 10) * 10;
  const r1 = (n) => Math.round(n * 10) / 10;

  /* ---------- 1. 需求解析 ---------- */
  const ZONE_WORDS = [['相城', 'XC'], ['产业园', 'XC'], ['黄埭', 'XC'], ['园区', 'SIP'], ['唯亭', 'SIP'], ['吴中', 'WZ'], ['昆山', 'KS'], ['花桥', 'KS'], ['无锡', 'WX'], ['张家港', 'ZJG'], ['杨舍', 'ZJG'], ['南通', 'NT']];
  function parse(text, Q) {
    const t = String(text || '').replace(/[Φφ直径]/g, 'Φ').replace(/\s+/g, ' ');
    const segs = t.split(/[，,。；;\n、]/).map(s => s.trim()).filter(Boolean);
    const lines = [], problems = [];
    let qLast = null;
    segs.forEach(seg => {
      const qm = seg.match(/(\d+(?:\.\d+)?)\s*(吨|t|T)(?!\S)/) || seg.match(/(\d+(?:\.\d+)?)\s*(吨|t|T)/);
      const qty = qm ? parseFloat(qm[1]) : null;
      const each = /各\s*\d/.test(seg);
      const found = [];
      let m;
      // 螺纹 / 盘螺：  20 的螺纹 | 螺纹 Φ20 | Φ20 螺纹钢 | 16 螺纹
      const re1 = /(?:Φ?\s*(\d{1,2})\s*(?:的|个|mm)?\s*(螺纹钢|螺纹|盘螺|高线|线材))|(?:(螺纹钢|螺纹|盘螺|高线|线材)\s*Φ?\s*(\d{1,2})(?!\d))/g;
      while ((m = re1.exec(seg))) { const size = m[1] || m[4]; const nm = m[2] || m[3]; const cat = /螺纹/.test(nm) ? '螺纹钢' : /盘螺/.test(nm) ? '盘螺' : '线材'; const grade = cat === '线材' ? 'HPB300' : 'HRB400E'; found.push({ key: `${cat}|${grade}|Φ${size}`, conf: .95, raw: m[0] }); }
      // H 型钢
      const re2 = /(?:(\d{2,3})\s*[×x*X]\s*(\d{2,3})\s*(?:的)?\s*H\s*型钢)|(?:H\s*型钢\s*(\d{2,3})\s*[×x*X]\s*(\d{2,3}))/g;
      while ((m = re2.exec(seg))) { const a = m[1] || m[3], b = m[2] || m[4]; found.push({ key: `H型钢|Q355B|${a}×${b}`, conf: .9, raw: m[0], note: '材质默认 Q355B' }); }
      // 中板
      const re3 = /(?:(\d{1,2}(?:\.\d+)?)\s*(?:个厚|mm|毫米|厚)?\s*(?:的)?\s*(Q355B?|Q235B?)?\s*中板)|(?:(Q355B?|Q235B?)\s*中板\s*(\d{1,2}(?:\.\d+)?)\s*(?:mm|毫米|个厚)?)|(?:中板\s*(\d{1,2}(?:\.\d+)?)\s*(?:mm|毫米|个厚))/g;
      while ((m = re3.exec(seg))) { const th = m[1] || m[4] || m[5]; let g = (m[2] || m[3] || '').toUpperCase(); if (!g) g = 'Q235B'; if (!/B$/.test(g)) g += 'B'; if (!th) continue; found.push({ key: `中板|${g}|${parseFloat(th)}mm`, conf: m[2] || m[3] ? .92 : .75, raw: m[0], note: m[2] || m[3] ? null : '材质未说明，默认 Q235B' }); }
      // 热卷
      const re4 = /(\d(?:\.\d+)?)\s*(?:mm|毫米|个厚|的)?\s*热(?:轧)?卷/g;
      while ((m = re4.exec(seg))) found.push({ key: `热卷|Q235B|${m[1]}mm`, conf: .9, raw: m[0], note: '材质默认 Q235B' });
      // 方管
      const re5 = /方管\s*(\d{2,3})\s*[×x*X]\s*(\d{2,3})\s*[×x*X]\s*(\d(?:\.\d+)?)/g;
      while ((m = re5.exec(seg))) found.push({ key: `方管|Q235B|${m[1]}×${m[2]}×${m[3]}`, conf: .9, raw: m[0] });
      if (found.length && qty != null) {
        found.forEach(f => lines.push(Object.assign({ qty: each ? qty : (found.length > 1 ? r1(qty / found.length) : qty), seg }, f)));
        qLast = null;
      } else if (found.length) { found.forEach(f => lines.push(Object.assign({ qty: null, seg }, f))); }
      else if (qty != null && lines.length && lines[lines.length - 1].qty == null) { lines[lines.length - 1].qty = qty; }
      else if (qty != null) qLast = qty;
    });
    lines.forEach(l => { if (!Q.specs[l.key]) { l.conf = Math.min(l.conf, .6); l.note = (l.note ? l.note + '；' : '') + '规格不在目录，需人工核对'; } if (l.qty == null) { l.conf = Math.min(l.conf, .5); l.note = (l.note ? l.note + '；' : '') + '未识别数量'; } });
    if (!lines.length) problems.push('未识别到任何规格 / 数量');
    const delivery = { mode: /自提|来拉|自己拉|自己来/.test(t) && !/能送|送到|送/.test(t) ? 'PICKUP' : 'DELIVER', pickupOk: /自提|来拉|自己拉|自己来/.test(t), addr: (t.match(/送(?:到|至)?\s*([^\s，,。；;]{2,14})/) || [])[1] || (t.match(/(老地方|原地址)/) || [])[1] || null, zoneHint: (ZONE_WORDS.find(z => t.includes(z[0])) || [])[1] || null, deadlineDays: /今天|今日|下午/.test(t) ? 0 : /明天|明早|明上午/.test(t) ? 1 : /后天/.test(t) ? 2 : /这周|本周|周内/.test(t) ? 5 : /急/.test(t) ? 1 : null };
    delivery.deadlineText = { 0: '今天', 1: '明天', 2: '后天', 5: '本周内' }[delivery.deadlineDays] || '未指定';
    const payment = /先发货后付款|账期|月结|照旧|挂账/.test(t) ? 'CREDIT' : /现款|现金|款到|先款/.test(t) ? 'CASH' : null;
    const flags = []; if (/老价格|原价|上次的价|还是那个价|便宜点|优惠/.test(t)) flags.push('PRICE_CHALLENGE'); if (/急/.test(t)) flags.push('URGENT'); if (/先合作一单|看看|试试/.test(t)) flags.push('TRIAL');
    return { lines, delivery, payment, flags, problems };
  }

  /* ---------- 2. 工具 ---------- */
  const dayLabel = (h) => h <= 9 ? '今天' : h <= 33 ? '明天' : h <= 57 ? '后天' : `${Math.ceil(h / 24)} 天内`;
  const deadlineH = (days) => days == null ? Infinity : days === 0 ? 9 : days === 1 ? 33 : days === 2 ? 57 : 24 * days + 9;
  function distKm(Q, a, b) { return (Q.dist[a] && Q.dist[a][b]) || (Q.dist[b] && Q.dist[b][a]) || 60; }

  /* ---------- 3. 货源选项：每个询价行 × （来源 × 物流方式） ---------- */
  function options(line, ctx) {
    const { Q, cfg, cust, pay, terms, deadline } = ctx; const key = line.key; const need = line.qty; const out = [];
    const creditCost = (base) => pay === 'CREDIT' && terms > 0 ? base * cfg.creditCostAnnual * terms / 365 : 0;
    const push = (o) => { o.landed = r1(o.base + o.freight + o.handling + o.fee + o.credit + o.extra); out.push(o); };
    const addSource = (src, srcKey, altOf) => {
      const km = src.zone === cust.zone ? Math.max(cust.km || 0, 8) : distKm(Q, src.zone, cust.zone);
      const deadhead = src.type === 'OWN' ? 0 : Math.min(...Object.values(Q.warehouses).map(wh => wh.zone === src.zone ? 6 : distKm(Q, wh.zone, src.zone)));
      const q = Math.min(need, src.avail); if (q <= 0) return;
      const common = { key: srcKey, altOf: altOf || null, qty: q, partial: q < need, src, km, base: src.base, credit: r1(creditCost(src.base)), fee: src.type === 'PLATFORM' ? cfg.platformFee : 0, extra: src.extraCost || 0, flags: [].concat(src.flags || []) };
      // a) 专车直送
      { const cap = q > 18 ? 32 : 18; const trip = Q.logistics.tripFee(km + deadhead, cap); const freight = r1(trip / q); const h = (src.leadH || 0) + 2 + (km + deadhead) / 40; push(Object.assign({}, common, { mode: 'DEDICATED', deadhead, freight, handling: Q.logistics.handling, etaH: h, eta: dayLabel(h), modeText: `专车直送（${cap} t 车，${km} km${deadhead ? '，空驶提货 ' + deadhead + ' km' : ''}，一趟 ¥${trip}）`, flags: common.flags.concat(q < cfg.transferMinQty && src.type !== 'OWN' ? ['SMALL_TRANSFER'] : []) })); }
      // b) 拼车窗口
      Q.windows.filter(wd => wd.zone === cust.zone && wd.remaining >= q && (wd.date - Q.NOW) / Q.D <= cfg.consolidateMaxDays).forEach(wd => {
        const originZone = Q.warehouses[wd.originWh].zone; const swing = src.type === 'OWN' ? (src.wh === wd.originWh ? 0 : 15) : (src.zone === originZone ? 15 : null);
        if (swing == null) return; const h = Math.round((wd.date - Q.NOW) / Q.H) + 4;
        push(Object.assign({}, common, { mode: 'WINDOW', window: wd, freight: wd.pricePerTon + swing, handling: Q.logistics.handling, etaH: h, eta: wd.label, modeText: `拼车 ${wd.label}（${wd.note}，余位 ${wd.remaining} t${swing ? '，顺路提货 +15' : ''}）` }));
      });
      // c) 货源直发客户
      if (src.dropship && src.type !== 'OWN') { const h = (src.leadH || 0) + km / 40 + 1; push(Object.assign({}, common, { mode: 'DROPSHIP', freight: src.dropFee, handling: 0, etaH: h, eta: dayLabel(h), modeText: `${src.name} 直发客户（运费 ¥${src.dropFee}/t，不过手）` })); }
      // d) 客户自提
      { const h = (src.leadH || 0) + 1; push(Object.assign({}, common, { mode: 'PICKUP', freight: 0, handling: Q.logistics.handling, etaH: h, eta: src.type === 'OWN' ? '随时自提' : `${dayLabel(h)}起可提`, modeText: `客户到 ${src.name} 自提（让利 ¥${cfg.pickupDiscount}/t）` })); }
    };
    // 自有库存
    Q.inventory.filter(i => i.key === key && i.qty > 0).forEach(i => addSource({ type: 'OWN', id: i.wh, name: Q.warehouses[i.wh].name, wh: i.wh, zone: Q.warehouses[i.wh].zone, base: i.cost, avail: i.qty, leadH: 0, age: i.age, flags: i.age >= cfg.agingDays ? ['AGING'] : [] }, key));
    // 外部货源
    Q.suppliers.forEach(s => s.offers.filter(o => o.key === key && o.qty > 0).forEach(o => {
      const stale = (Q.NOW - o.t) / Q.H > cfg.offerStaleH; const base = { type: s.type, id: s.id, name: s.name, zone: s.zone, base: o.price, leadH: o.leadH, dropship: o.dropship, dropFee: o.dropFee || 0, offerT: o.t, flags: stale ? ['STALE_OFFER'] : [] };
      if (need >= o.moq || !o.moq) addSource(Object.assign({}, base, { avail: o.qty, moq: o.moq }), key);
      else if (o.qty >= o.moq) { // 起订量未达：买足起订量，余量入库
        const rest = o.moq - need; const carry = r1(rest * o.price * cfg.creditCostAnnual * 30 / 365 / need);
        addSource(Object.assign({}, base, { avail: o.qty, moq: o.moq, moqStock: rest, flags: base.flags.concat(['MOQ_STOCK']), extraCost: carry }), key);
      }
    }));
    // 替代规格（仅自有库存，需客户确认）
    (cfg.altSpecs[key] || []).forEach(ak => Q.inventory.filter(i => i.key === ak && i.qty > 0).forEach(i => addSource({ type: 'OWN', id: i.wh, name: Q.warehouses[i.wh].name, wh: i.wh, zone: Q.warehouses[i.wh].zone, base: i.cost, avail: i.qty, leadH: 0, age: i.age, flags: ['ALT_SPEC'].concat(i.age >= cfg.agingDays ? ['AGING'] : []) }, ak, key)));
    out.forEach(o => { o.meetsDeadline = o.etaH <= deadline; price(o, ctx); });
    return out;
  }

  /* ---------- 4. 定价 ---------- */
  function price(o, ctx) {
    const { Q, cfg, cust } = ctx; const idx = (Q.specs[o.key] || {}).index || o.base + 60; const hist = cust.hist[o.key];
    o.flags = o.flags.filter(f => f !== 'ABOVE_HIST' && f !== 'BELOW_FLOOR');
    let target = cfg.targetMargin[cust.grade] || 50; const notes = [];
    if (o.flags.includes('AGING')) { target -= cfg.agingDiscount; notes.push(`老库存（${o.src.age} 天）让利 ¥${cfg.agingDiscount} 出清`); }
    if (o.mode === 'PICKUP') { target -= cfg.pickupDiscount; }
    let p = o.landed + target;
    if (hist && p < hist - 30) { p = hist - 10; notes.push(`按客户上次成交价 ${hist} 微让 10 元`); }
    const hi = idx + cfg.marketBand.high, lo = idx + cfg.marketBand.low;
    if (p > hi) { p = hi; notes.push(`已压到市场带上限（指数 ${idx} + ${cfg.marketBand.high}）`); }
    if (p < lo) { p = lo; notes.push(`抬到市场带下限（指数 ${idx} ${cfg.marketBand.low}），避免扰乱行情`); }
    p = R10(p); o.price = p; o.margin = r1(p - o.landed); o.index = idx; o.hist = hist || null; o.notes = notes;
    if (hist && p - hist > cfg.histTolerance) o.flags.push('ABOVE_HIST');
    if (o.margin < cfg.floorMargin) o.flags.push('BELOW_FLOOR');
  }

  /* ---------- 5. 方案组合 ---------- */
  const SRC_CERT = { OWN: 1, UPSTREAM: .85, PLATFORM: .75 }; const MODE_CERT = { DEDICATED: 1, WINDOW: .85, DROPSHIP: .8, PICKUP: .9 };
  function pick(opts, pred, by) { const c = opts.filter(pred); if (!c.length) return null; return c.sort(by)[0]; }
  const byCost = (a, b) => a.landed - b.landed || a.etaH - b.etaH; const byEta = (a, b) => a.etaH - b.etaH || a.landed - b.landed; const byMargin = (a, b) => b.margin - a.margin || a.etaH - b.etaH;
  const feasible = (o) => !o.flags.includes('STALE_OFFER') && !o.flags.includes('BELOW_FLOOR') && !o.partial;
  const notAlt = (o) => !o.altOf;

  function plan(rfq, Q, over) {
    over = over || {}; const cfg = Object.assign({}, Q.config, over.config || {}); const cust = Q.customer(rfq.customerId);
    const parsed = rfq.parsed || parse(rfq.raw, Q); const lines = (over.lines || parsed.lines).filter(l => l.qty);
    const pay = over.payment || parsed.payment || (cust.terms > 0 ? 'CREDIT' : 'CASH'); const terms = pay === 'CREDIT' ? (cust.terms || 30) : 0;
    const deadlineDays = over.deadlineDays !== undefined ? over.deadlineDays : parsed.delivery.deadlineDays; const deadline = deadlineH(deadlineDays);
    const deadlineText = { 0: '今天', 1: '明天', 2: '后天', 5: '本周内' }[deadlineDays] || '未指定';
    const ctx = { Q, cfg, cust, pay, terms, deadline, deadlineText, pickupOk: parsed.delivery.pickupOk || parsed.delivery.mode === 'PICKUP' };
    const per = lines.map(l => ({ line: l, opts: options(l, ctx) }));
    const mk = (id, name, desc, chooser) => {
      const chosen = per.map(p => ({ line: p.line, opt: chooser(p.opts, p.line) }));
      if (chosen.every(c => !c.opt)) return null;
      const L = chosen.map(c => c.opt ? Object.assign({ lineKey: c.line.key, need: c.line.qty, conf: c.line.conf }, c.opt, { flags: c.opt.flags.slice(), notes: c.opt.notes.slice() }) : { lineKey: c.line.key, need: c.line.qty, conf: c.line.conf, missing: true });
      // 同一来源多行专车直送：合并成一车，运费按总吨位摊
      const groups = {}; L.filter(x => !x.missing && x.mode === 'DEDICATED').forEach(x => (groups[x.src.id] = groups[x.src.id] || []).push(x));
      Object.values(groups).filter(g => g.length > 1).forEach(g => { const tq = g.reduce((s, x) => s + x.qty, 0); const cap = tq > 18 ? 32 : 18; const trip = Q.logistics.tripFee(g[0].km + (g[0].deadhead || 0), cap); g.forEach(x => { x.freight = r1(trip / tq); x.modeText = `专车直送（${cap} t 车，${x.km} km${x.deadhead ? '，空驶提货 ' + x.deadhead + ' km' : ''}，一趟 ¥${trip}，${g.length} 行同车分摊）`; x.flags = x.flags.filter(f => f !== 'SMALL_TRANSFER'); x.landed = r1(x.base + x.freight + x.handling + x.fee + x.credit + x.extra); price(x, ctx); }); });
      const ok = L.filter(x => !x.missing); const amount = ok.reduce((s, x) => s + x.price * x.qty, 0); const cost = ok.reduce((s, x) => s + x.landed * x.qty, 0); const margin = r1(amount - cost); const tons = ok.reduce((s, x) => s + x.qty, 0);
      const p = { id, name, desc, lines: L, amount: Math.round(amount), cost: Math.round(cost), margin: Math.round(margin), tons, marginPerTon: tons ? r1(margin / tons) : 0, etaH: Math.max(...ok.map(x => x.etaH)), partial: L.some(x => x.missing || x.partial) };
      p.eta = ok.every(x => x.mode === 'PICKUP') ? ok.map(x => x.eta)[0] : dayLabel(p.etaH); p.meetsDeadline = p.etaH <= deadline;
      gate(p, ctx, parsed); score(p, ctx); p.actions = actions(p, ctx); p.sig = L.map(x => x.missing ? '-' : `${x.key}:${x.src.id}:${x.mode}`).join('|');
      return p;
    };
    const cands = [];
    const nd = (x) => x.mode !== 'PICKUP'; const dl = (x) => x.meetsDeadline;
    cands.push(mk('A', '成本最优 · 可按期交付', '每行取到岸成本最低、满足交期、无硬伤的货源与运输方式；缺货行允许替代规格', (o) => pick(o, x => feasible(x) && notAlt(x) && dl(x) && nd(x), byMargin) || pick(o, x => feasible(x) && x.altOf && dl(x) && nd(x), byMargin) || pick(o, x => notAlt(x) && dl(x) && nd(x), byMargin) || pick(o, x => notAlt(x) && nd(x), byMargin)));
    cands.push(mk('F', '专车直送 · 同车分摊', '所有行一车送达，运费按总吨位分摊；多行同仓时通常最省', (o) => pick(o, x => notAlt(x) && x.mode === 'DEDICATED' && !x.flags.includes('STALE_OFFER') && dl(x), byMargin)));
    cands.push(mk('B', '最快到货', '不计成本先满足交期，用于急单', (o) => pick(o, x => notAlt(x) && !x.flags.includes('STALE_OFFER') && nd(x), byEta)));
    cands.push(mk('C', '客户自提', '客户到仓 / 货源地自提，零运费并让利；适合小单、无车可配', (o) => pick(o, x => notAlt(x) && x.mode === 'PICKUP' && feasible(x), byMargin) || pick(o, x => x.altOf && x.mode === 'PICKUP' && feasible(x), byMargin) || pick(o, x => notAlt(x) && x.mode === 'PICKUP' && !x.flags.includes('STALE_OFFER'), byMargin)));
    cands.push(mk('D', '替代规格 / 部分报价', '缺货行用自有库存的替代规格（需客户确认），仍无则只报有货的行', (o) => pick(o, x => x.src.type === 'OWN' && feasible(x) && dl(x) && nd(x) && !x.altOf, byMargin) || pick(o, x => x.altOf && feasible(x) && dl(x) && nd(x), byMargin) || pick(o, x => x.altOf && dl(x), byMargin)));
    cands.push(mk('E', '全部拼车', '所有行都搭已排定的车，运费最低，交期以车期为准', (o) => pick(o, x => notAlt(x) && x.mode === 'WINDOW', byMargin)));
    const seen = new Set(); const plans = cands.filter(p => p && !seen.has(p.sig) && seen.add(p.sig)).filter(p => !(p.id === 'E' && p.lines.some(x => x.missing)) && !(p.id === 'D' && !p.lines.some(x => x.altOf || x.missing)));
    plans.sort((a, b) => b.score - a.score);
    const noPickup = (p) => ctx.pickupOk || !p.lines.some(x => !x.missing && x.mode === 'PICKUP');
    const clean = (p) => p.gate.decision !== 'MANUAL' && !p.partial && !p.lines.some(x => !x.missing && x.flags.includes('BELOW_FLOOR'));
    const rec = plans.find(p => clean(p) && noPickup(p) && p.meetsDeadline) || plans.find(p => clean(p) && noPickup(p)) || plans.find(p => clean(p) && p.meetsDeadline) || plans.find(clean) || plans.find(p => p.gate.decision !== 'MANUAL') || plans[0];
    if (rec) rec.recommended = true;
    return { rfq, cust, parsed, lines, pay, terms, deadlineDays, deadlineText: { 0: '今天', 1: '明天', 2: '后天', 5: '本周内' }[deadlineDays] || '未指定', plans, options: per, cfg, validUntil: Q.NOW + cfg.quoteValidH * Q.H };
  }

  /* ---------- 6. 守门 ---------- */
  function gate(p, ctx, parsed) {
    const { cfg, cust, pay } = ctx; const reasons = []; let level = 0; // 0 auto, 1 review, 2 manual
    const add = (lv, code, text, fix) => { reasons.push({ code, text, fix }); level = Math.max(level, lv); };
    if (p.lines.some(x => x.missing)) add(2, 'NO_SOURCE', `${p.lines.filter(x => x.missing).map(x => ctx.Q.specName(x.lineKey)).join('、')} 无可用货源`, '建议：补充上游询价 / 推荐替代规格 / 只报有货行');
    if (p.lines.some(x => !x.missing && x.conf < .8)) add(2, 'PARSE_LOW', '有规格解析置信度不足，需人工核对', '核对后重新生成');
    if (cust.overdue) add(1, 'OVERDUE', `客户存在逾期应收，不自动放账`, '建议改为现款发货；或经理审批');
    if (cust.grade === 'N') add(1, 'NEW_CUSTOMER', '新客户首单', '建议现款 / 预付；核实工商与收货地址');
    if (pay === 'CREDIT') { const over = cust.creditUsed + p.amount - cust.creditLimit; if (over > 0) add(1, 'CREDIT_LIMIT', `账期下单后超信用额度 ¥${fmtN(over)}`, '建议部分现款或缩短账期'); }
    if (!cfg.autoSend.grades.includes(cust.grade)) add(1, 'GRADE', `客户等级 ${cust.grade} 不在自动发出范围`, '人工确认后发出');
    if (p.amount > cfg.autoSend.maxAmount) add(1, 'AMOUNT', `金额 ¥${fmtN(p.amount)} 超自动发出上限 ¥${fmtN(cfg.autoSend.maxAmount)}`, '经理确认');
    const okL = p.lines.filter(x => !x.missing);
    okL.filter(x => x.flags.includes('BELOW_FLOOR')).forEach(x => add(1, 'BELOW_FLOOR', `${ctx.Q.specName(x.key)} 毛利 ¥${x.margin}/t 低于下限 ¥${cfg.floorMargin}`, '换货源 / 自提 / 拼车 / 放弃该行'));
    if (okL.length && Math.min(...okL.map(x => x.margin)) < cfg.autoSend.minMargin && !okL.some(x => x.flags.includes('BELOW_FLOOR'))) add(1, 'THIN_MARGIN', `最低行毛利 ¥${Math.min(...okL.map(x => x.margin))}/t 低于自动发出要求 ¥${cfg.autoSend.minMargin}`, '确认后发出');
    okL.filter(x => x.flags.includes('STALE_OFFER')).forEach(x => add(1, 'STALE_OFFER', `${x.src.name} 的报价已超过 ${cfg.offerStaleH} 小时`, '刷新上游报价后重算'));
    okL.filter(x => x.flags.includes('SMALL_TRANSFER')).forEach(x => add(1, 'SMALL_TRANSFER', `${ctx.Q.specName(x.key)} ${x.qty} t 单独专车调货不经济`, '改拼车 / 直发 / 自提'));
    okL.filter(x => x.flags.includes('MOQ_STOCK')).forEach(x => add(1, 'MOQ_STOCK', `${x.src.name} 起订 ${x.src.moq} t，需多买 ${x.src.moqStock} t 入库`, `建议向客户提议增量到 ${x.src.moq} t，或确认余量可销`));
    okL.filter(x => x.altOf).forEach(x => add(1, 'ALT_SPEC', `${ctx.Q.specName(x.altOf)} 以 ${ctx.Q.specName(x.key)} 替代，需客户确认`, '报价单注明替代并等待确认'));
    okL.filter(x => x.flags.includes('ABOVE_HIST')).forEach(x => add(1, 'ABOVE_HIST', `${ctx.Q.specName(x.key)} 报价 ${x.price} 高于客户上次成交 ${x.hist}`, '确认是否按行情上调，或微调到历史价附近'));
    if (parsed.flags.includes('PRICE_CHALLENGE')) add(1, 'PRICE_CHALLENGE', '客户在询价中提到老价格 / 优惠', '人工决定让价幅度（不低于毛利下限）');
    if (!p.meetsDeadline) add(1, 'DEADLINE', `最晚到货 ${p.eta}，晚于客户要求（${ctx.deadlineText}）`, '选更快方案或与客户确认交期');
    if (p.partial) add(1, 'PARTIAL', '部分行未报价', '报价单注明');
    p.gate = { decision: level === 0 ? 'AUTO_SEND' : level === 1 ? 'NEED_REVIEW' : 'MANUAL', reasons };
  }
  const fmtN = (n) => Number(n || 0).toLocaleString('zh-CN');

  /* ---------- 7. 打分（毛利 50% · 交期 25% · 确定性 15% · 简单度 10%；部分报价 ×0.6、客户未提自提 ×0.8；可自动发出 +6、转人工 −15） ---------- */
  function score(p, ctx) {
    const ok = p.lines.filter(x => !x.missing); if (!ok.length) { p.score = 0; return; }
    const m = Math.max(-1, Math.min(1, p.marginPerTon / 60)); const d = p.meetsDeadline ? 1 : 0.2;
    const cert = ok.reduce((s, x) => s + SRC_CERT[x.src.type] * MODE_CERT[x.mode] * (x.altOf ? .6 : 1) * (x.flags.includes('MOQ_STOCK') ? .7 : 1), 0) / ok.length;
    const origins = new Set(ok.map(x => x.src.id + x.mode)).size; const simp = origins <= 1 ? 1 : origins === 2 ? .8 : .6;
    const partial = p.partial ? .6 : 1; const pickupPen = ok.some(x => x.mode === 'PICKUP') && !ctx.pickupOk ? .7 : 1;
    p.score = Math.max(0, Math.round((m * .5 + d * .25 + cert * .15 + simp * .1) * 100 * partial * pickupPen) + (p.gate.decision === 'AUTO_SEND' ? 6 : p.gate.decision === 'MANUAL' ? -15 : 0));
  }

  /* ---------- 8. 后续动作 ---------- */
  function actions(p, ctx) {
    const a = []; const Q = ctx.Q;
    p.lines.filter(x => !x.missing).forEach(x => {
      const nm = Q.specName(x.key); const t = x.src.type;
      if (t === 'OWN' && x.mode === 'DEDICATED') a.push({ type: 'OUTBOUND', text: `${x.src.name} 出库 ${nm} ${x.qty} t · 派 ${x.qty > 18 ? '13 m' : '9.6 m'} 平板 → ${ctx.cust.addr}` });
      if (t === 'OWN' && x.mode === 'WINDOW') a.push({ type: 'CONSOLIDATE', text: `加入拼车 ${x.window.id}（${x.window.label}）：${nm} ${x.qty} t，锁定库存` });
      if (t !== 'OWN' && x.mode === 'WINDOW') a.push({ type: 'PURCHASE', text: `向 ${x.src.name} 采购 ${nm} ${x.qty} t @ ¥${x.base}，${x.window.label} 顺路提货并入 ${x.window.id}` });
      if (t !== 'OWN' && x.mode === 'DEDICATED') a.push({ type: 'PURCHASE', text: `向 ${x.src.name} 采购 ${nm} ${x.qty} t @ ¥${x.base}，专车提货直送客户` });
      if (x.mode === 'DROPSHIP') a.push({ type: 'PURCHASE', text: `向 ${x.src.name} 采购 ${nm} ${x.qty}${x.src.moqStock ? ' + ' + x.src.moqStock + '（余量入库）' : ''} t @ ¥${x.base}，由其直发 ${ctx.cust.addr}` });
      if (x.mode === 'PICKUP') a.push({ type: 'PICKUP', text: `${x.src.name} 备货 ${nm} ${x.qty} t，通知客户自提（车号 / 提货码）${t !== 'OWN' ? '，先向货源下采购单' : ''}` });
      if (x.src.moqStock && x.mode !== 'DROPSHIP') a.push({ type: 'STOCK', text: `${nm} 余量 ${x.src.moqStock} t 入库，挂牌到平台待售` });
    });
    a.push({ type: 'FOLLOW', text: `报价有效 ${ctx.cfg.quoteValidH} 小时；未回复 2 小时后进入「报价跟单 SOP」（提醒 → 电话）` });
    return a;
  }

  /* ---------- 9. 报价单文本（客户视角，微信可直接发送） ---------- */
  function quoteText(res, p) {
    const Q = res.rfq.__Q || w.QUOTE; const c = res.cust; const d = new Date(res.validUntil);
    const L = p.lines.filter(x => !x.missing).map(x => `· ${Q.specName(x.key)}${x.altOf ? `（替代原询 ${Q.specName(x.altOf)}，请确认）` : ''} ${x.qty} 吨 × ¥${x.price}/吨${x.mode === 'PICKUP' ? '（自提价）' : ''}，${x.eta}${x.mode === 'DROPSHIP' ? '直送' : x.mode === 'PICKUP' ? '' : '送到'}`);
    const miss = p.lines.filter(x => x.missing).map(x => `· ${Q.specName(x.lineKey)} ${x.need} 吨：暂无合适货源，稍后单独回复`);
    return `${c.contact}您好，${(p.lines[0].key || p.lines[0].lineKey).split('|')[0]}等 ${p.lines.length} 项报价如下（含税${res.pay === 'CREDIT' ? `，账期 ${res.terms} 天` : '，现款'}）：\n${L.concat(miss).join('\n')}\n合计约 ${p.tons} 吨 / ¥${fmtN(p.amount)}${p.lines.some(x => x.mode !== 'PICKUP') ? `，送至 ${c.addr}` : ''}。\n价格有效至今天 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}（行情波动大，过期请再确认）。需要我现在锁货吗？`;
  }

  w.QuoteEngine = { parse, plan, quoteText, dayLabel, SRC_CERT, MODE_CERT,
    MODE_TEXT: { DEDICATED: '专车直送', WINDOW: '拼车', DROPSHIP: '货源直发', PICKUP: '客户自提' },
    SRC_TEXT: { OWN: '自有库存', UPSTREAM: '上游', PLATFORM: '平台货源' },
    DECISION: { AUTO_SEND: ['可自动发出', 'success'], NEED_REVIEW: ['需确认后发出', 'warning'], MANUAL: ['转人工', 'danger'] },
  };
})(typeof window !== 'undefined' ? window : globalThis);
