/* 货袋子 · AI 获客 · 原型壳层与通用组件（纯前端，无依赖） */
(function (w) {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const qs = (k, d) => { const v = new URLSearchParams(location.search).get(k); return v == null ? d : v; };
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = {
    time(t) { const d = new Date(t); return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`; },
    hm(t) { const d = new Date(t); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; },
    date(t) { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; },
    md(t) { const d = new Date(t); return `${d.getMonth() + 1}/${d.getDate()}`; },
    ago(t) { const s = Math.max(0, (Date.now() - t) / 1000); if (s < 60) return '刚刚'; if (s < 3600) return `${Math.floor(s / 60)} 分钟前`; if (s < 86400) return `${Math.floor(s / 3600)} 小时前`; if (s < 86400 * 7) return `${Math.floor(s / 86400)} 天前`; return fmt.date(t); },
    left(t) { const s = (t - Date.now()) / 1000; if (s <= 0) return '已到期'; if (s < 3600) return `${Math.ceil(s / 60)} 分钟后`; if (s < 86400) return `${Math.floor(s / 3600)} 小时后`; return `${Math.floor(s / 86400)} 天 ${Math.floor((s % 86400) / 3600)} 小时后`; },
    pct(a, b) { return b ? (a / b * 100).toFixed(1) + '%' : '—'; },
    money(n) { return '¥' + Number(n || 0).toLocaleString('zh-CN'); },
    num(n) { return Number(n || 0).toLocaleString('zh-CN'); },
  };

  /* ---------- 图标（线性 SVG，扁平风格） ---------- */
  const ICONS = {
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    chat: '<path d="M21 12a8 8 0 0 1-8 8H5l-2 2V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M17.5 14a5.5 5.5 0 0 1 4 5.5"/>',
    building: '<rect x="4" y="3" width="16" height="18"/><path d="M9 21v-4h6v4"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2"/>',
    crane: '<path d="M3 21h18"/><path d="M6 21V8l12-4"/><path d="M6 8h12"/><path d="M14 8v6"/><circle cx="14" cy="15.5" r="1.5"/><path d="M6 12h4M6 16h4"/>',
    inbox: '<path d="M3 13h5l2 3h4l2-3h5"/><path d="M5 4h14l2 9v7H3v-7z"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    send: '<path d="M21 3L10 14"/><path d="M21 3l-7 18-4-7-7-4z"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>',
    route: '<circle cx="6" cy="5" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M6 7.5V13a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3"/>',
    check: '<path d="M4 12.5l5 5L20 6.5"/>',
    doc: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/>',
    bot: '<rect x="4" y="8" width="16" height="12"/><path d="M12 4v4"/><circle cx="12" cy="3.5" r="1"/><path d="M9 13h.01M15 13h.01"/><path d="M9 17h6"/>',
    image: '<rect x="3" y="4" width="18" height="16"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-9 9"/>',
    radio: '<circle cx="12" cy="12" r="2.5"/><path d="M7.5 16.5a6.5 6.5 0 0 1 0-9"/><path d="M16.5 7.5a6.5 6.5 0 0 1 0 9"/><path d="M4.5 19.5a10.5 10.5 0 0 1 0-15"/><path d="M19.5 4.5a10.5 10.5 0 0 1 0 15"/>',
    shield: '<path d="M12 2.5l8 3.5v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    rocket: '<path d="M5 15l-2 6 6-2"/><path d="M14 4c3-1 6 0 7 1s0 4-1 7c-2 4-6 7-9 8l-4-4c1-3 4-7 7-12z"/><circle cx="15" cy="9" r="1.5"/>',
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v11h14V10"/><path d="M10 21v-6h4v6"/>',
    database: '<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    handshake: '<path d="M2 10l4-4 5 3 4-3 7 6"/><path d="M6 6l-4 4 6 6 3-1 3 3 2-2 2 2 2-2 2 2"/><path d="M11 9l-4 4 2 2"/>',
    phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
    smartphone: '<rect x="6" y="2.5" width="12" height="19" rx="1.5"/><path d="M11 18h2"/>',
    tablet: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M12 17h.01"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 21a2 2 0 0 0 4 0"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    upload: '<path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 17v3h16v-3"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="13.5" r="3.5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5"/>',
    qr: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM19 14h2M14 19h2M19 19h2v2"/>',
    coin: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v10M9.5 9.5h3.5a1.5 1.5 0 0 1 0 3H11a1.5 1.5 0 0 0 0 3h3.5"/>',
    truck: '<path d="M2 6h12v10H2z"/><path d="M14 10h5l3 3v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    file: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/>',
    warn: '<path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17.5h.01"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    arrow: '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    star: '<path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.3L12 17.4l-5.6 3 1.1-6.3L3 9.7l6.2-.9z"/>',
    flame: '<path d="M12 22c-4 0-7-3-7-7 0-3 2-5 3-7 0 2 1 3 2 3 0-4 2-7 5-9 0 3 1 5 3 7s2 4 2 6c0 4-3 7-8 7z"/>',
    map: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    play: '<path d="M7 4l13 8-13 8z"/>',
    pause: '<path d="M7 4h4v16H7zM13 4h4v16h-4z"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.3-5.7"/><path d="M20 4v5h-5"/>',
    scale: '<path d="M12 3v18M4 21h16"/><path d="M6 7h12"/><path d="M6 7l-3 6h6zM18 7l-3 6h6z"/>',
    pin: '<path d="M9 3h6l-1 6 3 3H7l3-3z"/><path d="M12 12v9"/>',
  };
  const icon = (name, cls) => `<svg class="i ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.info}</svg>`;

  /* ---------- 导航 ---------- */
  const NAV = [
    { group: '总览' },
    { id: 'dashboard', ic: 'grid', label: '看板', href: 'dashboard.html' },
    { id: 'workbench', ic: 'chat', label: '会话工作台', href: 'workbench.html', badgeKey: 'needHuman' },
    { id: 'quote', ic: 'scale', label: '报价工作台', href: 'quote.html', badgeKey: 'rfq', isNew: true },
    { group: '线索' },
    { id: 'leads', ic: 'users', label: '线索列表', href: 'leads.html' },
    { id: 'projects', ic: 'crane', label: '项目线索', href: 'projects.html' },
    { id: 'companies', ic: 'building', label: '企业档案', href: 'companies.html' },
    { id: 'intake', ic: 'inbox', label: '线索投喂箱', href: 'intake.html', badgeKey: 'intake' },
    { id: 'capture', ic: 'search', label: '抓取记录', href: 'channels.html?tab=raw' },
    { group: '触达与跟进' },
    { id: 'outreach', ic: 'send', label: '触达记录', href: 'outreach.html' },
    { id: 'follow-ups', ic: 'clock', label: '跟进待办', href: 'follow-ups.html', badgeKey: 'dueToday' },
    { id: 'flows', ic: 'route', label: '跟进流程（SOP）', href: 'flows.html' },
    { id: 'approvals', ic: 'check', label: '审核', href: 'approvals.html', badgeKey: 'approvals' },
    { group: '渠道' },
    { id: 'sources', ic: 'database', label: '线索渠道目录', href: 'sources.html' },
    { id: 'referrals', ic: 'handshake', label: '介绍人与分成', href: 'referrals.html' },
    { id: 'channels', ic: 'radio', label: '触达账号与设备', href: 'channels.html' },
    { id: 'poster', ic: 'image', label: '海报分发', href: 'poster-dispatch.html' },
    { group: '配置' },
    { id: 'scripts', ic: 'doc', label: '话术库', href: 'scripts.html' },
    { id: 'jobs', ic: 'bot', label: '自动化任务', href: 'jobs.html' },
    { id: 'risk', ic: 'shield', label: '风控', href: 'risk.html' },
    { id: 'settings', ic: 'gear', label: '设置', href: 'risk.html?tab=settings' },
    { group: '' },
    { id: 'wizard', ic: 'rocket', label: '开通向导', href: 'wizard.html' },
    { id: 'mobile', ic: 'smartphone', label: '销售企微 H5', href: 'mobile.html' },
    { id: 'app', ic: 'tablet', label: '执行端 App', href: 'app.html' },
    { id: 'index', ic: 'home', label: '原型总览', href: 'index.html' },
  ];
  const SALES_ONLY = new Set(['dashboard', 'workbench', 'quote', 'leads', 'projects', 'companies', 'intake', 'follow-ups', 'approvals', 'referrals', 'mobile', 'index']);

  const App = {
    role() { return localStorage.getItem('acq:role') || 'admin'; },
    setRole(r) { localStorage.setItem('acq:role', r); location.reload(); },
    me() { return this.role() === 'admin' ? { id: 1, name: '陈总', role: 'admin', short: '陈' } : { id: 2, name: '张三', role: 'sales', short: '张' }; },
    mount(opt) {
      const me = this.me();
      const badges = (w.ACQ && w.ACQ.badges) ? w.ACQ.badges() : {};
      if (w.QUOTE) badges.rfq = w.QUOTE.rfqs.filter(r => r.status === 'NEW' && (me.role === 'admin' || r.by === me.id)).length;
      const navHtml = NAV.filter(n => n.group !== undefined || me.role === 'admin' || SALES_ONLY.has(n.id)).map(n => {
        if (n.group !== undefined) return n.group ? `<div class="nav-group">${n.group}</div>` : '<div style="height:10px"></div>';
        const b = n.badgeKey && badges[n.badgeKey] ? `<span class="badge">${badges[n.badgeKey]}</span>` : '';
        return `<a href="${n.href}" class="${n.id === opt.active ? 'active' : ''}"><span class="ic">${icon(n.ic)}</span>${n.label}${b}</a>`;
      }).join('');
      document.body.innerHTML = `
      <div class="layout">
        <aside class="sidebar">
          <div class="brand"><div class="logo">货</div><div><b>货袋子 · AI 获客</b><small>hdz-ai-acquisition 原型</small></div></div>
          <nav class="nav">${navHtml}</nav>
        </aside>
        <div class="main">
          <div class="topbar">
            <div class="crumbs">获客<span>/</span><b>${esc(opt.title)}</b>${opt.crumb ? `<span>/</span>${esc(opt.crumb)}` : ''}</div>
            <div class="sp"></div>
            <span class="muted small">商家：华东钢贸（演示）</span>
            <div class="role-switch" title="切换视角"><button class="${me.role === 'admin' ? 'on' : ''}" onclick="App.setRole('admin')">管理员</button><button class="${me.role === 'sales' ? 'on' : ''}" onclick="App.setRole('sales')">销售·张三</button></div>
            <span class="bell" title="企微通知" onclick="App.notices()">${icon('bell')}<i></i></span>
            <button class="btn ghost sm" onclick="App.resetData()" title="清除 localStorage 中的演示数据并重载">重置演示数据</button>
            <div class="avatar">${me.short}</div>
          </div>
          <div class="content" id="content"></div>
        </div>
      </div>
      <div class="toasts" id="toasts"></div>`;
      document.title = `${opt.title} · 货袋子 AI 获客原型`;
      return $('#content');
    },
    resetData() { Object.keys(localStorage).filter(k => k.startsWith('acq:') && k !== 'acq:role').forEach(k => localStorage.removeItem(k)); location.reload(); },
    notices() {
      const list = (w.ACQ && Array.isArray(ACQ.notices)) ? ACQ.notices : [];
      Drawer.open({ title: '企业微信通知（模拟）', narrow: true, body: `<div class="timeline">${list.map(n => `<div class="tl ${n.cls || 'sys'}"><div class="t">${fmt.time(n.t)}</div><div class="s">${n.text}</div>${n.link ? `<div class="d"><a href="${n.link}">打开 →</a></div>` : ''}</div>`).join('') || '<div class="empty">暂无通知</div>'}</div>` });
    },
    /* 电话触达（Q13）：人工拨打 + 系统记录结果；可选带电话开场白话术与流程 Call 节点推进 */
    recordCall(leadId, opt) {
      opt = opt || {}; const l = w.ACQ.lead(leadId); if (!l) return; const E = w.Engine; const scr = w.ACQ.script(opt.scriptId || (l.leadType === 'COMPANY' || (l.companyId && !l.projectId) ? 125 : 124)); const r = scr ? E.render(scr, l) : null;
      const inst = w.ACQ.instanceOf(leadId); const def = inst && w.ACQ.flow(inst.flowId); const atCall = inst && def && def.nodes[inst.currentNode] && def.nodes[inst.currentNode].type === 'Call';
      const RES = E.flow.CALL_RESULTS;
      Modal.open({ title: `${icon('phone')} 电话 · ${esc(l.nickname || l.company || l.id)}${l.phone ? ` <span class="mono muted small">${esc(l.phone)}</span>` : ''}`, width: 680, body: `
        ${atCall ? `<div class="alert info small mb12">流程「${esc(def.name)}」当前在电话节点：${esc(E.flow.label(def, inst.currentNode))}。记录结果后自动按分支推进。</div>` : ''}
        ${r ? `<div class="card mb12"><div class="card-h" style="padding:8px 12px"><h3 class="small">开场白 · ${esc(scr.name)}</h3><a class="small" href="scripts.html?open=${scr.id}">编辑</a></div><div class="card-b small" style="line-height:1.8">${UI.hlVars(r.text)}${scr.callTips ? `<ul class="xs muted mt8" style="margin-left:16px">${scr.callTips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}</div></div>` : ''}
        <div class="grid g2"><div class="field"><label>通话结果</label><select class="select" id="cl_res">${Object.entries(RES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div><div class="field"><label>时长</label><div class="row"><input class="input" id="cl_dur" type="number" value="180" style="width:100px"><span class="small muted">秒</span></div></div></div>
        <div class="field"><label>要点 / 下一步</label><textarea class="input" id="cl_note" rows="3" placeholder="对方关注点、规格与吨位、决策人、约定时间…（语音输入可自动转写）"></textarea></div>
        <div class="row small"><label class="checkbox"><input type="checkbox" id="cl_fu" checked> 创建跟进待办</label><select class="select sm" id="cl_fuh"><option value="24">明天</option><option value="48">2 天后</option><option value="168">下周</option></select><span class="sp"></span><label class="checkbox"><input type="checkbox" id="cl_wx" checked> 通话后发企微 / 微信资料</label></div>`,
        footer: `<button class="btn" data-close>取消</button><button class="btn primary" id="cl_ok">${icon('check')} 记录并推进</button>`, onMount(m, close) {
          $('#cl_ok', m).onclick = () => {
            const res = $('#cl_res', m).value, dur = +$('#cl_dur', m).value || 0, note = $('#cl_note', m).value.trim();
            l.calls = l.calls || []; l.calls.unshift({ t: Date.now(), by: App.me().id, dur: res === 'CONNECTED' ? dur : 0, result: res, note }); l.lastContactedAt = Date.now(); l.outreachCount = (l.outreachCount || 0) + 1;
            w.ACQ.addEvent(l, { cls: 'user', text: `电话 · ${RES[res]}${dur && res === 'CONNECTED' ? ` · ${Math.round(dur / 60)} 分钟` : ''}${note ? ' · ' + note : ''}` });
            let trace = [];
            if (atCall) { trace = E.flow.advance(inst, def, { type: 'CALL', result: res }); inst.log = (inst.log || []).concat(trace.map(t => Object.assign({ t: Date.now() }, t))); trace.forEach(t => { if (t.setStage) l.stage = t.setStage; }); }
            else if (res === 'CONNECTED' && l.stage === 'NEW') l.stage = 'CONTACTED';
            if (res === 'REFUSED') { l.stage = 'LOST'; l.lostReason = 'REFUSED'; }
            if ($('#cl_fu', m).checked && res !== 'REFUSED') w.ACQ.followUps.unshift({ id: 'FU' + Date.now().toString(36), leadId: l.id, owner: App.me().id, type: res === 'CONNECTED' ? 'MANUAL' : 'CALL', reason: 'HUMAN_SET', dueAt: Date.now() + (+$('#cl_fuh', m).value) * 3600e3, status: 'PENDING', note: note || (res === 'CONNECTED' ? '电话后跟进' : '再次电话') });
            w.ACQ.save(); close(); toast(`已记录通话：${RES[res]}${trace.length ? ` · 流程推进 ${trace.map(t => t.outcome).join(' → ')}` : ''}`, 'ok'); if (opt.onDone) opt.onDone(res, trace);
          };
        } });
    },
    /* 投喂箱入库（Q15）：把一条已抽取的投喂记录写成项目 / 企业 / 线索；后台、企微 H5、执行端 App 共用 */
    commitIntake(it, opt) {
      opt = opt || {}; const A = w.ACQ, E = w.Engine, ex = it.extracted, src = A.source(it.sourceCode), by = opt.by || App.me().id, now = Date.now();
      const num = s => parseFloat(String(s || '').replace(/[^\d.]/g, '')) || 0;
      const newLead = (o) => { const lid = 'L' + String(A.leads.length + 1).padStart(3, '0'); A.leads.push(Object.assign({ id: lid, leadType: 'PERSON', platform: 'PHONE', sourceType: 'INTAKE', sourceCode: it.sourceCode, sourceChannel: `投喂箱-${it.title}`, sourceExcerpt: it.raw.slice(0, 60), intent: 'UNKNOWN', score: 50, stage: 'NEW', owner: by, region: '江苏', phone: ex.phone || '', tags: [], events: [], createdAt: now, lastActiveAt: now }, o)); return lid; };
      if (!ex) return { error: '尚未完成抽取' };
      if (ex.entity === 'PROJECT') {
        if (!ex.project_name && !opt.mergeTo) return { error: '项目名称为必填' };
        if (opt.mergeTo) { const p = A.project(opt.mergeTo); p.sources.push({ code: it.sourceCode, t: now, text: `投喂箱 · ${it.title}` }); p.signals++; p.score = Math.min(99, p.score + 3); it.projectId = p.id; }
        else {
          const area = ex.area ? num(ex.area) * (/万/.test(ex.area) ? 10000 : 1) : null; const t = E.estimateTon(area, 'COMMERCIAL'); const qty = ex.quantity ? parseInt(String(ex.quantity).replace(/[^\d]/g, '')) : 0; const pid = 'PJ' + (A.projects.length + 1);
          A.projects.unshift({ id: pid, name: ex.project_name, type: '待分类', region: '江苏', distanceKm: 60, stage: /中标/.test(it.raw) ? 'BID' : /许可|铭牌|开工/.test(it.raw + it.title) ? 'PERMIT' : 'PLAN', stageText: `投喂箱入库 · ${it.title}`, area, structure: 'COMMERCIAL', estTon: t || (qty ? [qty, qty] : null), estTonBasis: t ? `${fmt.num(area)} ㎡ × 55–90 kg/㎡（默认商业 / 公建，可改）` : qty ? '公告工程量' : '待补充面积', window: {}, ownerOrg: ex.owner_org || '—', contractorOrg: ex.contractor_org || '（未知）', supervisorOrg: ex.supervisor_org || '', contractAmount: ex.contract_amount ? Math.round(num(ex.contract_amount) * (/亿/.test(ex.contract_amount) ? 10000 : 1)) : null, sources: [{ code: it.sourceCode, t: now, text: `投喂箱 · ${it.title}` }], signals: 1, score: src ? src.scoring.base + (t ? Math.min(20, Math.round(t[1] / 500)) : 5) : 50, scoreDims: { ton: t ? Math.min(30, Math.round(t[1] / 400)) : 8, window: 10, chain: ex.contact_name ? 6 : 2, credit: 10, logistics: 10 }, owner: by, status: 'NEW', companyIds: [], contacts: ex.contact_name ? [{ name: ex.contact_name, role: '项目经理', org: ex.contractor_org || '—', phone: ex.phone || '—', leadId: null }] : [], nextAction: ex.contact_name ? '电话首呼' : '查找项目部联系人', createdAt: now, updatedAt: now }); it.projectId = pid;
          const lid = newLead({ nickname: ex.contact_name || ex.project_name.slice(0, 12) + '项目部', leadType: ex.contact_name ? 'PERSON' : 'PROJECT', role: ex.contact_name ? '项目经理' : '', projectId: pid, platform: 'GOV', score: A.project(pid).score, product: ex.spec || '螺纹钢', company: ex.contractor_org || '' }); it.leadId = lid; if (ex.contact_name) A.project(pid).contacts[0].leadId = lid;
        }
      } else if (ex.entity === 'COMPANY') {
        if (!ex.company_name) return { error: '企业名称为必填' };
        const cid = 'CO' + (A.companies.length + 1); const ton = ex.need ? parseInt((String(ex.need).match(/(\d+)\s*吨/) || [])[1]) || null : null;
        A.companies.unshift({ id: cid, name: ex.company_name, type: ex.company_type || 'MANUFACTURER', region: '江苏', distanceKm: 80, regCapital: 0, established: '—', scope: ex.company_scope || '—', credit: { level: 'OK', text: '入库后自动查询工商 / 信用' }, signals: [{ code: it.sourceCode, t: now, text: `投喂箱 · ${it.title}${ex.need ? ' · ' + ex.need : ''}` }], estMonthlyTon: ton, score: ton ? Math.min(85, 50 + Math.round(ton / 20)) : 50, stage: 'NEW', owner: by, leadIds: [], projectIds: [], contacts: [], createdAt: now, updatedAt: now }); it.companyId = cid;
        if (ex.contact_name) { const lid = newLead({ nickname: ex.contact_name, companyId: cid, intent: ex.need ? 'INQUIRY' : 'UNKNOWN', score: A.company(cid).score, product: ex.need || '', company: ex.company_name }); A.company(cid).leadIds.push(lid); A.company(cid).contacts.push({ name: ex.contact_name, role: '', leadId: lid }); it.leadId = lid; }
      } else {
        if (!ex.name && !ex.org) return { error: '姓名或单位至少填一项' };
        it.leadId = newLead({ nickname: ex.name || ex.org, region: '', company: ex.org || '' });
      }
      it.status = 'DONE'; it.confirmedBy = by; it.confirmedAt = now; A.save();
      return { ok: true, msg: `已入库${it.projectId ? ` · 项目 ${it.projectId}` : ''}${it.companyId ? ` · 企业 ${it.companyId}` : ''}${it.leadId ? ` · 线索 ${it.leadId}` : ''} · 已按渠道评分并分配` };
    },
    pageHead(title, desc, actions) { return `<div class="page-head"><div><h1>${title}</h1>${desc ? `<p>${desc}</p>` : ''}</div><div class="actions">${actions || ''}</div></div>`; },
    note(html) { if (sessionStorage.getItem('acq:note:' + location.pathname)) return; const d = document.createElement('div'); d.className = 'demo-note'; d.innerHTML = html + ' <span style="opacity:.7;cursor:pointer;margin-left:6px">✕</span>'; d.title = '点击关闭'; d.onclick = () => { d.remove(); sessionStorage.setItem('acq:note:' + location.pathname, '1'); }; document.body.appendChild(d); setTimeout(() => d.remove(), 15000); },
  };

  /* ---------- Toast / Modal / Drawer ---------- */
  const toast = (msg, type) => { const t = document.createElement('div'); t.className = 'toast ' + (type || ''); t.innerHTML = msg; $('#toasts').appendChild(t); setTimeout(() => { t.style.opacity = 0; t.style.transition = '.3s'; setTimeout(() => t.remove(), 300); }, 2600); };
  const Modal = {
    open({ title, body, footer, width, onMount }) {
      const m = document.createElement('div'); m.className = 'mask';
      m.innerHTML = `<div class="modal" style="${width ? 'width:' + width + 'px' : ''}"><div class="modal-h"><h3>${title}</h3><button class="x">×</button></div><div class="modal-b">${body}</div>${footer !== false ? `<div class="modal-f">${footer || '<button class="btn" data-close>关闭</button>'}</div>` : ''}</div>`;
      document.body.appendChild(m);
      const close = () => m.remove();
      m.querySelector('.x').onclick = close; $$('[data-close]', m).forEach(b => b.onclick = close);
      m.addEventListener('click', e => { if (e.target === m) close(); });
      if (onMount) onMount(m, close);
      return { el: m, close };
    },
    confirm(title, text, ok, opt) { return this.open({ title, body: `<div style="font-size:13.5px;line-height:1.7">${text}</div>`, footer: `<button class="btn" data-close>取消</button><button class="btn ${opt && opt.danger ? 'danger' : 'primary'}" id="__ok">${(opt && opt.okText) || '确定'}</button>`, onMount(m, close) { $('#__ok', m).onclick = () => { close(); ok && ok(); }; } }); },
  };
  const Drawer = {
    open({ title, body, footer, wide, narrow, onMount, sub }) {
      const m = document.createElement('div'); m.className = 'drawer-mask';
      m.innerHTML = `<div class="drawer ${wide ? 'wide' : ''} ${narrow ? 'narrow' : ''}"><div class="drawer-h"><div><h3>${title}</h3>${sub ? `<div class="muted small">${sub}</div>` : ''}</div><button class="x">×</button></div><div class="drawer-b">${body}</div>${footer ? `<div class="drawer-f">${footer}</div>` : ''}</div>`;
      document.body.appendChild(m);
      const close = () => m.remove();
      m.querySelector('.x').onclick = close; $$('[data-close]', m).forEach(b => b.onclick = close);
      m.addEventListener('click', e => { if (e.target === m) close(); });
      if (onMount) onMount(m, close);
      return { el: m, close };
    },
  };

  /* ---------- 通用渲染 ---------- */
  const UI = {
    tag(text, type) { return `<span class="tag ${type || ''}">${text}</span>`; },
    stage(s) { const L = { NEW: '新线索', CONTACTED: '已触达', REPLIED: '已回复', HOT: '高意向', WON: '已成交', LOST: '已流失', SILENT: '静默', IGNORED: '已忽略' }; return `<span class="tag stage-${s}">${L[s] || s}</span>`; },
    platform(p, withName) { const N = { WECOM: '企微', WECHAT_PERSONAL: '微信', DOUYIN: '抖音', XIAOHONGSHU: '小红书', FORUM: '论坛', HDZ_INTERNAL: '站内', GOV: '政务公开', DATA: '数据源', PHONE: '电话' }; const S = { WECOM: '企', WECHAT_PERSONAL: '微', DOUYIN: '抖', XIAOHONGSHU: '红', FORUM: '坛', HDZ_INTERNAL: '货', GOV: '政', DATA: '数', PHONE: '话' }; return `<span class="pf pf-${p}" title="${N[p]}">${S[p] || '?'}</span>${withName ? N[p] : ''}`; },
    platformName(p) { return { WECOM: '企业微信', WECHAT_PERSONAL: '个人微信', DOUYIN: '抖音', XIAOHONGSHU: '小红书', FORUM: '行业论坛', HDZ_INTERNAL: '货袋子站内', GOV: '政务公开数据', DATA: '付费数据源', PHONE: '电话' }[p] || p; },
    leadType(t) { const L = { PROJECT: '项目', COMPANY: '企业', PERSON: '个人' }; return `<span class="lt lt-${t || 'PERSON'}">${L[t] || '个人'}</span>`; },
    family(f) { const L = { PROJECT: '项目族', COMPANY: '企业族', RELATION: '关系族', INTENT: '意图族', CONTENT: '内容族', FIELD: '现场族' }; return `<span class="fam fam-${f}">${L[f] || f}</span>`; },
    grade(g) { return g === '✗' ? '<span class="grade" style="background:var(--danger)">✗</span>' : `<span class="grade grade-${g}" title="数据可得性 ${g} 级">${g}</span>`; },
    score(n) { return `<span class="score ${n >= 80 ? 'hot' : ''}">${n >= 80 ? icon('flame') : ''}${n}</span>`; },
    intent(i) { const L = { INQUIRY: '询货', ASK_PRICE: '问价', ASK_MATERIAL: '求资料', ASK_RECOMMEND: '求推荐', SIGNUP: '报名', IRRELEVANT: '无关', UNKNOWN: '未知' }; return L[i] || i; },
    status(s) { const M = { QUEUED: ['排队中', 'primary'], SENDING: ['发送中', 'primary'], SENT: ['已发送', 'success'], FAILED: ['失败', 'danger'], BLOCKED: ['被限制', 'danger'], CANCELLED: ['已取消', ''], PENDING_APPROVAL: ['待审核', 'warning'], DRAFT: ['草稿', ''], PENDING: ['待处理', 'warning'], DONE: ['已完成', 'success'], SKIPPED: ['已跳过', ''], OVERDUE: ['已逾期', 'danger'], ONLINE: ['在线', 'success'], OFFLINE: ['离线', ''], RESTRICTED: ['熔断中', 'danger'], NEED_VERIFY: ['需验证', 'warning'], BANNED: ['已封禁', 'danger'], DISABLED: ['已停用', ''], ACTIVE: ['推进中', 'primary'], WAITING: ['等待中', 'warning'], PAUSED: ['已暂停', ''], COMPLETED: ['已完成', 'success'], TERMINATED: ['已终止', 'danger'], PREEMPTED: ['被抢占', ''], RUNNING: ['运行中', 'primary'], SUCCESS: ['成功', 'success'], PARTIAL: ['部分成功', 'warning'], PUBLISHED: ['已发布', 'success'], APPROVED_SENT: ['已批准发送', 'success'], REJECTED: ['已驳回', 'danger'], SCHEDULED: ['已定时', 'primary'], AUTO: ['机器处理', 'ai'], NEED_HUMAN: ['待人工', 'danger'], HUMAN: ['人工接管', 'primary'], CLOSED: ['已关闭', ''] }; const x = M[s] || [s, '']; return `<span class="tag ${x[1]}">${x[0]}</span>`; },
    kpi(label, value, delta, unit, href) { const up = delta > 0; return `<div class="card kpi" ${href ? `onclick="location.href='${href}'"` : ''}><div class="l">${label}</div><div class="v">${value}${unit ? `<small>${unit}</small>` : ''}</div>${delta != null ? `<div class="d ${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${Math.abs(delta)} 较上期</div>` : '<div class="d muted">—</div>'}</div>`; },
    table(cols, rows, opt) { opt = opt || {}; if (!rows.length) return `<div class="empty">${opt.empty || '暂无数据'}</div>`; return `<table class="table"><thead><tr>${cols.map(c => `<th class="${c.sort ? 'sort' : ''}" style="${c.w ? 'width:' + c.w : ''}">${c.label}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr ${opt.rowAttr ? opt.rowAttr(r) : ''}>${cols.map(c => `<td class="${c.cls || ''}">${c.render ? c.render(r) : esc(r[c.key])}</td>`).join('')}</tr>`).join('')}</tbody>${opt.foot ? `<tfoot><tr>${opt.foot}</tr></tfoot>` : ''}</table>`; },
    vars(text, missing) { return esc(text).replace(/\{(\w+)\}/g, (m, k) => `<span class="var ${missing && missing.includes(k) ? 'miss' : ''}">{${k}}</span>`); },
    hlVars(text) { return esc(text).replace(/(张总|李工|王经理|赵老板|周总|孙经理|吴工|郑总|刘经理|陈老板|您好)/g, '<span class="hl">$1</span>'); },
    bar(pct, cls) { return `<div class="progress ${cls || ''}"><i style="width:${Math.min(100, pct)}%"></i></div>`; },
    switchEl(on, attr) { return `<span class="switch ${on ? 'on' : ''}" ${attr || ''} onclick="this.classList.toggle('on');${attr ? '' : ''}"></span>`; },
  };

  /* ---------- 图表（Canvas，无依赖） ---------- */
  const Chart = {
    line(canvas, series, opt) {
      opt = opt || {}; const dpr = w.devicePixelRatio || 1; const W = canvas.clientWidth || 600, H = canvas.clientHeight || 220;
      canvas.width = W * dpr; canvas.height = H * dpr; const c = canvas.getContext('2d'); c.scale(dpr, dpr); c.clearRect(0, 0, W, H);
      const P = { l: 36, r: 12, t: 14, b: 26 }; const n = series[0].data.length; const max = Math.max(1, ...series.flatMap(s => s.data)) * 1.15;
      const x = i => P.l + (W - P.l - P.r) * (n === 1 ? 0 : i / (n - 1)); const y = v => H - P.b - (H - P.t - P.b) * v / max;
      c.strokeStyle = '#e6eaef'; c.lineWidth = 1; c.font = '11px sans-serif'; c.fillStyle = '#98a2ae'; c.textAlign = 'right';
      for (let g = 0; g <= 4; g++) { const v = max / 4 * g; c.beginPath(); c.moveTo(P.l, y(v)); c.lineTo(W - P.r, y(v)); c.stroke(); c.fillText(Math.round(v), P.l - 6, y(v) + 4); }
      c.textAlign = 'center'; (opt.labels || []).forEach((l, i) => { if (n <= 8 || i % Math.ceil(n / 8) === 0) c.fillText(l, x(i), H - 8); });
      series.forEach(s => {
        c.strokeStyle = s.color; c.lineWidth = 2; c.beginPath(); s.data.forEach((v, i) => i ? c.lineTo(x(i), y(v)) : c.moveTo(x(i), y(v))); c.stroke();
        if (s.fill) { c.lineTo(x(n - 1), y(0)); c.lineTo(x(0), y(0)); c.closePath(); c.fillStyle = s.color + '22'; c.fill(); }
        c.fillStyle = s.color; s.data.forEach((v, i) => { c.beginPath(); c.arc(x(i), y(v), 2.5, 0, 7); c.fill(); });
      });
      if (opt.legend !== false) { let lx = P.l; c.textAlign = 'left'; c.font = '11px sans-serif'; series.forEach(s => { c.fillStyle = s.color; c.fillRect(lx, 2, 10, 3); c.fillStyle = '#6b7684'; c.fillText(s.name, lx + 14, 7); lx += c.measureText(s.name).width + 30; }); }
    },
    spark(canvas, data, color) {
      const dpr = w.devicePixelRatio || 1; const W = canvas.clientWidth || 80, H = canvas.clientHeight || 24; canvas.width = W * dpr; canvas.height = H * dpr; const c = canvas.getContext('2d'); c.scale(dpr, dpr);
      const max = Math.max(1, ...data); const x = i => 2 + (W - 4) * i / (data.length - 1); const y = v => H - 2 - (H - 4) * v / max;
      c.strokeStyle = color || '#1b4f8a'; c.lineWidth = 1.5; c.beginPath(); data.forEach((v, i) => i ? c.lineTo(x(i), y(v)) : c.moveTo(x(i), y(v))); c.stroke();
    },
    bars(canvas, items, opt) {
      opt = opt || {}; const dpr = w.devicePixelRatio || 1; const W = canvas.clientWidth || 400, H = canvas.clientHeight || 200; canvas.width = W * dpr; canvas.height = H * dpr; const c = canvas.getContext('2d'); c.scale(dpr, dpr);
      const P = { l: 90, r: 40, t: 8, b: 8 }; const max = Math.max(1, ...items.map(i => i.value)); const bh = Math.min(26, (H - P.t - P.b) / items.length - 6);
      c.font = '12px sans-serif';
      items.forEach((it, i) => { const yy = P.t + i * ((H - P.t - P.b) / items.length); const wdt = (W - P.l - P.r) * it.value / max; c.fillStyle = '#6b7684'; c.textAlign = 'right'; c.fillText(it.label, P.l - 8, yy + bh / 2 + 4); c.fillStyle = it.color || '#1b4f8a'; c.fillRect(P.l, yy, wdt, bh); c.fillStyle = '#1c2430'; c.textAlign = 'left'; c.fillText(it.text || it.value, P.l + wdt + 6, yy + bh / 2 + 4); });
    },
    funnel(el, stages) {
      const max = stages[0].value || 1;
      el.innerHTML = stages.map((s, i) => { const wdt = 40 + 60 * s.value / max; const conv = i ? fmt.pct(s.value, stages[i - 1].value) : ''; return `<div style="display:flex;align-items:center;gap:10px;margin:6px 0"><div style="width:70px;font-size:12px;color:var(--text-3);text-align:right">${s.label}</div><div style="flex:1"><div style="width:${wdt}%;background:${s.color};color:#fff;border-radius:3px;padding:5px 10px;font-weight:700;font-size:13px">${s.value}</div></div><div style="width:64px;font-size:11.5px;color:var(--text-4)">${conv ? '转化 ' + conv : ''}</div></div>`; }).join('');
    },
  };

  App.icon = icon; App.ICONS = ICONS; w.App = App; w.UI = UI; w.Chart = Chart; w.Modal = Modal; w.Drawer = Drawer; w.toast = toast; w.fmt = fmt; w.esc = esc; w.qs = qs; w.$ = $; w.$$ = $$;
})(window);
