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

  /* ---------- 导航 ---------- */
  const NAV = [
    { group: '总览' },
    { id: 'dashboard', ic: '📊', label: '看板', href: 'dashboard.html' },
    { id: 'workbench', ic: '💬', label: '会话工作台', href: 'workbench.html', badgeKey: 'needHuman' },
    { group: '线索' },
    { id: 'leads', ic: '👥', label: '线索列表', href: 'leads.html' },
    { id: 'capture', ic: '🔎', label: '抓取记录', href: 'channels.html?tab=raw' },
    { group: '触达与跟进' },
    { id: 'outreach', ic: '📨', label: '触达记录', href: 'outreach.html' },
    { id: 'follow-ups', ic: '⏰', label: '跟进待办', href: 'follow-ups.html', badgeKey: 'dueToday' },
    { id: 'flows', ic: '🧭', label: '跟进流程（SOP）', href: 'flows.html' },
    { id: 'approvals', ic: '✅', label: '审核', href: 'approvals.html', badgeKey: 'approvals' },
    { group: '配置' },
    { id: 'scripts', ic: '📝', label: '话术库', href: 'scripts.html' },
    { id: 'jobs', ic: '🤖', label: '自动化任务', href: 'jobs.html' },
    { id: 'poster', ic: '🖼️', label: '海报分发', href: 'poster-dispatch.html' },
    { id: 'channels', ic: '📡', label: '渠道与设备', href: 'channels.html' },
    { id: 'risk', ic: '🛡️', label: '风控', href: 'risk.html' },
    { id: 'settings', ic: '⚙️', label: '设置', href: 'risk.html?tab=settings' },
    { group: '' },
    { id: 'wizard', ic: '🚀', label: '开通向导', href: 'wizard.html' },
    { id: 'index', ic: '🏠', label: '原型总览', href: 'index.html' },
  ];
  const SALES_ONLY = new Set(['dashboard', 'workbench', 'leads', 'follow-ups', 'approvals', 'index']);

  const App = {
    role() { return localStorage.getItem('acq:role') || 'admin'; },
    setRole(r) { localStorage.setItem('acq:role', r); location.reload(); },
    me() { return this.role() === 'admin' ? { id: 1, name: '陈总', role: 'admin', short: '陈' } : { id: 2, name: '张三', role: 'sales', short: '张' }; },
    mount(opt) {
      const me = this.me();
      const badges = (w.ACQ && w.ACQ.badges) ? w.ACQ.badges() : {};
      const navHtml = NAV.filter(n => n.group !== undefined || me.role === 'admin' || SALES_ONLY.has(n.id)).map(n => {
        if (n.group !== undefined) return n.group ? `<div class="nav-group">${n.group}</div>` : '<div style="height:10px"></div>';
        const b = n.badgeKey && badges[n.badgeKey] ? `<span class="badge">${badges[n.badgeKey]}</span>` : '';
        return `<a href="${n.href}" class="${n.id === opt.active ? 'active' : ''}"><span class="ic">${n.ic}</span>${n.label}${b}</a>`;
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
            <span class="bell" title="企微通知" onclick="App.notices()">🔔<i></i></span>
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
    platform(p, withName) { const N = { WECOM: '企微', WECHAT_PERSONAL: '微信', DOUYIN: '抖音', XIAOHONGSHU: '小红书', FORUM: '论坛', HDZ_INTERNAL: '站内' }; const S = { WECOM: '企', WECHAT_PERSONAL: '微', DOUYIN: '抖', XIAOHONGSHU: '红', FORUM: '坛', HDZ_INTERNAL: '货' }; return `<span class="pf pf-${p}" title="${N[p]}">${S[p] || '?'}</span>${withName ? N[p] : ''}`; },
    platformName(p) { return { WECOM: '企业微信', WECHAT_PERSONAL: '个人微信', DOUYIN: '抖音', XIAOHONGSHU: '小红书', FORUM: '行业论坛', HDZ_INTERNAL: '货袋子站内' }[p] || p; },
    score(n) { return `<span class="score ${n >= 80 ? 'hot' : ''}">${n >= 80 ? '🔥' : ''}${n}</span>`; },
    intent(i) { const L = { INQUIRY: '询货', ASK_PRICE: '问价', ASK_MATERIAL: '求资料', ASK_RECOMMEND: '求推荐', SIGNUP: '报名', IRRELEVANT: '无关', UNKNOWN: '未知' }; return L[i] || i; },
    status(s) { const M = { QUEUED: ['排队中', 'primary'], SENDING: ['发送中', 'primary'], SENT: ['已发送', 'success'], FAILED: ['失败', 'danger'], BLOCKED: ['被限制', 'danger'], CANCELLED: ['已取消', ''], PENDING_APPROVAL: ['待审核', 'warning'], DRAFT: ['草稿', ''], PENDING: ['待处理', 'warning'], DONE: ['已完成', 'success'], SKIPPED: ['已跳过', ''], OVERDUE: ['已逾期', 'danger'], ONLINE: ['在线', 'success'], OFFLINE: ['离线', ''], RESTRICTED: ['熔断中', 'danger'], NEED_VERIFY: ['需验证', 'warning'], BANNED: ['已封禁', 'danger'], DISABLED: ['已停用', ''], ACTIVE: ['推进中', 'primary'], WAITING: ['等待中', 'warning'], PAUSED: ['已暂停', ''], COMPLETED: ['已完成', 'success'], TERMINATED: ['已终止', 'danger'], PREEMPTED: ['被抢占', ''], RUNNING: ['运行中', 'primary'], SUCCESS: ['成功', 'success'], PARTIAL: ['部分成功', 'warning'], PUBLISHED: ['已发布', 'success'], APPROVED_SENT: ['已批准发送', 'success'], REJECTED: ['已驳回', 'danger'], SCHEDULED: ['已定时', 'primary'], AUTO: ['机器处理', 'ai'], NEED_HUMAN: ['待人工', 'danger'], HUMAN: ['人工接管', 'primary'], CLOSED: ['已关闭', ''] }; const x = M[s] || [s, '']; return `<span class="tag ${x[1]}">${x[0]}</span>`; },
    kpi(label, value, delta, unit, href) { const up = delta > 0; return `<div class="card kpi" ${href ? `onclick="location.href='${href}'"` : ''}><div class="l">${label}</div><div class="v">${value}${unit ? `<small>${unit}</small>` : ''}</div>${delta != null ? `<div class="d ${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${Math.abs(delta)}${typeof delta === 'number' && Math.abs(delta) < 1 && delta !== 0 ? '' : ''} 较上期</div>` : '<div class="d muted">—</div>'}</div>`; },
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
      c.strokeStyle = '#eef0f5'; c.lineWidth = 1; c.font = '11px sans-serif'; c.fillStyle = '#9ca3af'; c.textAlign = 'right';
      for (let g = 0; g <= 4; g++) { const v = max / 4 * g; c.beginPath(); c.moveTo(P.l, y(v)); c.lineTo(W - P.r, y(v)); c.stroke(); c.fillText(Math.round(v), P.l - 6, y(v) + 4); }
      c.textAlign = 'center'; (opt.labels || []).forEach((l, i) => { if (n <= 8 || i % Math.ceil(n / 8) === 0) c.fillText(l, x(i), H - 8); });
      series.forEach(s => {
        c.strokeStyle = s.color; c.lineWidth = 2; c.beginPath(); s.data.forEach((v, i) => i ? c.lineTo(x(i), y(v)) : c.moveTo(x(i), y(v))); c.stroke();
        if (s.fill) { c.lineTo(x(n - 1), y(0)); c.lineTo(x(0), y(0)); c.closePath(); c.fillStyle = s.color + '22'; c.fill(); }
        c.fillStyle = s.color; s.data.forEach((v, i) => { c.beginPath(); c.arc(x(i), y(v), 2.5, 0, 7); c.fill(); });
      });
      if (opt.legend !== false) { let lx = P.l; c.textAlign = 'left'; c.font = '11px sans-serif'; series.forEach(s => { c.fillStyle = s.color; c.fillRect(lx, 2, 10, 3); c.fillStyle = '#6b7280'; c.fillText(s.name, lx + 14, 7); lx += c.measureText(s.name).width + 30; }); }
    },
    spark(canvas, data, color) {
      const dpr = w.devicePixelRatio || 1; const W = canvas.clientWidth || 80, H = canvas.clientHeight || 24; canvas.width = W * dpr; canvas.height = H * dpr; const c = canvas.getContext('2d'); c.scale(dpr, dpr);
      const max = Math.max(1, ...data); const x = i => 2 + (W - 4) * i / (data.length - 1); const y = v => H - 2 - (H - 4) * v / max;
      c.strokeStyle = color || '#1f5eff'; c.lineWidth = 1.5; c.beginPath(); data.forEach((v, i) => i ? c.lineTo(x(i), y(v)) : c.moveTo(x(i), y(v))); c.stroke();
    },
    bars(canvas, items, opt) {
      opt = opt || {}; const dpr = w.devicePixelRatio || 1; const W = canvas.clientWidth || 400, H = canvas.clientHeight || 200; canvas.width = W * dpr; canvas.height = H * dpr; const c = canvas.getContext('2d'); c.scale(dpr, dpr);
      const P = { l: 90, r: 40, t: 8, b: 8 }; const max = Math.max(1, ...items.map(i => i.value)); const bh = Math.min(26, (H - P.t - P.b) / items.length - 6);
      c.font = '12px sans-serif';
      items.forEach((it, i) => { const yy = P.t + i * ((H - P.t - P.b) / items.length); const wdt = (W - P.l - P.r) * it.value / max; c.fillStyle = '#6b7280'; c.textAlign = 'right'; c.fillText(it.label, P.l - 8, yy + bh / 2 + 4); c.fillStyle = it.color || '#1f5eff'; c.beginPath(); c.roundRect ? c.roundRect(P.l, yy, wdt, bh, 4) : c.rect(P.l, yy, wdt, bh); c.fill(); c.fillStyle = '#111827'; c.textAlign = 'left'; c.fillText(it.text || it.value, P.l + wdt + 6, yy + bh / 2 + 4); });
    },
    funnel(el, stages) {
      const max = stages[0].value || 1;
      el.innerHTML = stages.map((s, i) => { const wdt = 40 + 60 * s.value / max; const conv = i ? fmt.pct(s.value, stages[i - 1].value) : ''; return `<div style="display:flex;align-items:center;gap:10px;margin:6px 0"><div style="width:70px;font-size:12px;color:var(--text-3);text-align:right">${s.label}</div><div style="flex:1"><div style="width:${wdt}%;background:${s.color};color:#fff;border-radius:6px;padding:5px 10px;font-weight:700;font-size:13px">${s.value}</div></div><div style="width:64px;font-size:11.5px;color:var(--text-4)">${conv ? '转化 ' + conv : ''}</div></div>`; }).join('');
    },
  };

  w.App = App; w.UI = UI; w.Chart = Chart; w.Modal = Modal; w.Drawer = Drawer; w.toast = toast; w.fmt = fmt; w.esc = esc; w.qs = qs; w.$ = $; w.$$ = $$;
})(window);
