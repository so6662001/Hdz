/* AI 企业经营海报 · 历史记录（原型）
 * 一条记录 = 一次海报会话（从首次生成到所有微调版本），对应正式版的 poster_session + poster_version[]。
 * 原型用 localStorage 持久化（key: ap-history），PC / H5 共用同一份数据，模拟"多端同步"。
 * 首次打开无数据时写入一组示例记录（demo: true），便于演示筛选 / 分组 / 打开继续微调。
 */
(function () {
  const AP = window.AP; if (!AP) return;
  const KEY = "ap-history";
  const NOW = new Date(2026, 8, 16, 10, 30).getTime(); // 原型固定"今天"为 2026-09-16，保证演示分组稳定
  const H = (AP.History = {});
  const pad = (n) => String(n).padStart(2, "0");
  H.now = () => Math.max(Date.now(), NOW);
  H.posterDate = (t) => { const d = new Date(t); return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`; };
  H.fmtTime = (t) => {
    const d = new Date(t), n = new Date(H.now()); const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const day0 = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime(); const diff = Math.round((day0(n) - day0(d)) / 864e5);
    if (diff === 0) return `今天 ${hm}`; if (diff === 1) return `昨天 ${hm}`; if (diff < 7) return `周${"日一二三四五六"[d.getDay()]} ${hm}`;
    if (d.getFullYear() === n.getFullYear()) return `${d.getMonth() + 1} 月 ${d.getDate()} 日`; return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  H.dayKey = (t) => { const d = new Date(t), n = new Date(H.now()); const day0 = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime(); const diff = Math.round((day0(n) - day0(d)) / 864e5); return diff === 0 ? "今天" : diff === 1 ? "昨天" : diff < 7 ? "本周" : diff < 30 ? "本月" : "更早"; };
  H.DAY_ORDER = ["今天", "昨天", "本周", "本月", "更早"];

  /* ---------- 发布人（团队成员；原型固定当前登录用户为第一位） ---------- */
  H.OWNERS = [
    { id: "u_wang", name: "王建国", role: "总经理", color: "#1f5eff" },
    { id: "u_li", name: "李敏", role: "销售经理", color: "#059669" },
    { id: "u_zhang", name: "张伟", role: "业务员", color: "#d97706" },
    { id: "u_chen", name: "陈晓", role: "运营", color: "#7c3aed" },
  ];
  H.me = () => H.OWNERS[0];
  H.owner = (id) => H.OWNERS.find((o) => o.id === id) || { id, name: "已离职", role: "", color: "#94a3b8" };
  H.avatar = (id, size) => { const o = H.owner(id); size = size || 18; return `<i class="av" title="${o.name} · ${o.role}" style="display:inline-flex;width:${size}px;height:${size}px;border-radius:50%;background:${o.color};color:#fff;font-style:normal;font-size:${Math.round(size * .55)}px;align-items:center;justify-content:center;font-weight:700;flex:none">${o.name.slice(0, 1)}</i>`; };

  /* ---------- 扫码追踪：分享即出渠道码 ---------- */
  // 同一张海报、同一份设计，二维码里的码却按"发到哪里"不同：用户点分享时先选渠道（朋友圈 / 微信群 / 发给客户 / 打印或其他），
  // 系统为该渠道生成（或复用）一个追踪码 = 记录基码 + 渠道后缀（如 Q0ABC-M），只重绘二维码区域。扫码落到 /q/{code}，由码反查渠道，
  // 所以"来源"不是猜的，是"哪个码被扫了"——口径叫「首发渠道」（图片被二次转发到别处仍记在首发渠道）。
  // 一条记录 = 一个 poster_session；r.channels[ch] = 一条 poster_share（code / 首次分享时间 / 分享次数 / 扫码 / 咨询）。
  H.SOURCES = [["moments", "朋友圈"], ["group", "微信群"], ["chat", "发给客户"], ["other", "打印 / 其他"]];
  H.SRC_NAME = Object.fromEntries(H.SOURCES);
  H.CH = { moments: { sfx: "M", icon: "🟢", desc: "保存图片后发朋友圈，同一海报复用同一个码", tip: "去朋友圈发布" }, group: { sfx: "G", icon: "👥", desc: "发到客户群 / 同行群，可多群共用", tip: "去群里发送" }, chat: { sfx: "S", icon: "💬", desc: "一对一发给客户，适合关怀 / 报价类", tip: "去发给客户" }, other: { sfx: "O", icon: "🖨", desc: "打印张贴、发抖音 / 快手、放到店铺页等", tip: "已复制链接" } };
  H.DAYS = 14;
  H.newCode = () => { const A = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; let s = ""; for (let i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)]; return s; };
  H.emptyTrack = () => ({ scans: 0, leads: 0, scanDays: Array(H.DAYS).fill(0), scanFrom: { moments: 0, group: 0, chat: 0, other: 0 }, leadList: [], channels: {} });
  H.chCode = (r, ch) => `${r.code}-${H.CH[ch].sfx}`;
  H.chUrl = (r, ch) => `hdz.cn/q/${H.chCode(r, ch)}`;
  // 渠道列表（已出码的在前，按扫码数排序）
  H.channelsOf = (r) => H.SOURCES.map(([k, name]) => Object.assign({ key: k, name, icon: H.CH[k].icon, has: !!(r.channels || {})[k] }, (r.channels || {})[k] ? { code: H.chCode(r, k), url: H.chUrl(r, k) } : {}, (r.channels || {})[k] || { shares: 0, scans: 0, leads: 0, at: 0 }));
  // 分享 = 出渠道码（原型：PC / H5 分享弹层选渠道后调用；正式版 POST /posters/sessions/{id}/shares {channel} → {code, url, image}）
  H.share = (id, ch) => {
    const list = H.load(); const r = list.find((x) => x.id === id); if (!r) return null; H.ensureTrack(r);
    const reused = !!r.channels[ch]; const c = r.channels[ch] || (r.channels[ch] = { at: H.now(), shares: 0, scans: 0, leads: 0 });
    c.shares++; c.lastAt = H.now(); r.shares = (r.shares || 0) + 1; r.status = "已分享"; if (!r.publishedAt) r.publishedAt = H.now();
    write(list); return { code: H.chCode(r, ch), url: H.chUrl(r, ch), reused, share: c, rec: r };
  };
  const LEAD_CITIES = ["苏州", "无锡", "常州", "南通", "嘉兴", "上海浦东", "上海松江", "杭州", "宁波", "合肥"];
  const LEAD_TYPES = ["工程项目方", "钢材门店", "终端用料企业", "小贸易商", "个人采购"];
  // 记一次扫码（原型：分享页 / 表格里"模拟扫码"，正式版由 /q/{code} 落地页上报）
  // 只有已出码的渠道才可能被扫（正式版由 /q/{code} 反查 poster_share 得到渠道）
  H.scan = (id, src, lead) => {
    const list = H.load(); const r = list.find((x) => x.id === id); if (!r) return;
    H.ensureTrack(r); const has = Object.keys(r.channels); if (!has.length) return null; if (!src || !r.channels[src]) src = has[Math.floor(Math.random() * has.length)];
    r.scans++; r.scanDays[H.DAYS - 1]++; r.scanFrom[src] = (r.scanFrom[src] || 0) + 1; r.channels[src].scans++;
    if (lead) { r.leads++; r.channels[src].leads++; r.leadList.unshift({ t: H.now(), src, city: LEAD_CITIES[Math.floor(Math.random() * LEAD_CITIES.length)], type: LEAD_TYPES[Math.floor(Math.random() * LEAD_TYPES.length)], isNew: Math.random() < .7 }); r.leadList = r.leadList.slice(0, 20); }
    write(list); return r;
  };
  H.ensureTrack = (r) => { const e = H.emptyTrack(); ["scans", "leads"].forEach((k) => { if (typeof r[k] !== "number") r[k] = 0; }); if (!Array.isArray(r.scanDays) || r.scanDays.length !== H.DAYS) r.scanDays = e.scanDays; r.scanFrom = Object.assign(e.scanFrom, r.scanFrom || {}); if (!Array.isArray(r.leadList)) r.leadList = []; if (!r.owner) r.owner = H.me().id; if (!r.code) r.code = H.newCode();
    if (!r.channels) { // 旧数据回填：按来源分布反推每个渠道一条 poster_share
      r.channels = {}; const srcs = H.SOURCES.map((x) => x[0]).filter((k) => r.scanFrom[k] > 0); const at = r.publishedAt || r.updatedAt || H.now();
      if (!srcs.length && r.shares) srcs.push("moments");
      const per = Math.max(1, Math.floor((r.shares || srcs.length) / (srcs.length || 1)));
      srcs.forEach((k, i) => { r.channels[k] = { at: at + i * 3600e3, lastAt: at + i * 3600e3, shares: i === srcs.length - 1 ? Math.max(1, (r.shares || srcs.length) - per * (srcs.length - 1)) : per, scans: r.scanFrom[k], leads: r.leadList.filter((l) => l.src === k).length }; });
      const sumLeads = Object.values(r.channels).reduce((a, c) => a + c.leads, 0); if (r.leads > sumLeads && srcs.length) r.channels[srcs[0]].leads += r.leads - sumLeads;
      r.shares = Object.values(r.channels).reduce((a, c) => a + c.shares, 0); // 新口径：分享次数 = 各渠道出码 / 复用次数之和
    }
    return r; };
  H.statusOf = (r) => (r.leads ? { key: "lead", name: "已带来咨询", color: "#dc2626" } : r.scans ? { key: "scan", name: "已被扫码", color: "#d97706" } : r.shares ? { key: "shared", name: "已分享", color: "#059669" } : r.exports ? { key: "exported", name: "已导出", color: "#059669" } : { key: "draft", name: "草稿", color: "#6b7280" });
  H.rate = (leads, scans) => (scans ? Math.round((leads / scans) * 100) + "%" : "—");
  H.trackUrl = (r) => `hdz.cn/q/${r.code}`;

  /* ---------- 存取 ---------- */
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
  function write(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch (e) { return false; } }
  H.load = () => { let list = read(); if (!list) { list = H.seed(); write(list); } let dirty = false; list.forEach((r) => { if (typeof r.scans !== "number" || !r.owner || !r.channels) { H.ensureTrack(r); dirty = true; } }); if (dirty) write(list); return list; };
  H.save = (list) => write(list);
  H.get = (id) => H.load().find((r) => r.id === id);
  H.remove = (id) => { const list = H.load().filter((r) => r.id !== id); write(list); return list; };
  H.clearDemo = () => { const list = H.load().filter((r) => !r.demo); write(list); return list; };
  H.star = (id) => { const list = H.load(); const r = list.find((x) => x.id === id); if (r) r.starred = !r.starred; write(list); return r && r.starred; };
  H.bump = (id, field) => { if (field === "shares") return H.share(id, "moments"); const list = H.load(); const r = list.find((x) => x.id === id); if (r) { r[field] = (r[field] || 0) + 1; r.status = field === "exports" && r.status === "草稿" ? "已导出" : r.status; write(list); } };
  // 会话 → 记录（每次生成 / 微调后调用，按 id 覆盖）
  H.upsert = (sess) => {
    const list = H.load(); const spec = sess.versions[sess.cur] && sess.versions[sess.cur].spec; if (!spec) return list;
    const sc = AP.SCENES.find((s) => s.id === spec.scene) || {}; const g = AP.GROUPS.find((x) => x.id === sc.g) || {};
    const old = list.find((r) => r.id === sess.id); const t = H.now();
    const used = new Set([spec.assets.logo, spec.assets.photo, ...(spec.assets.photos || [])].filter(Boolean));
    const assets = (sess.assets || []).filter((a) => a.uploaded && used.has(a.id)).map((a) => ({ id: a.id, type: a.type, name: a.name, tags: a.tags, url: a.url, uploaded: true }));
    const rec = Object.assign(old || Object.assign({ id: sess.id, createdAt: t, exports: 0, shares: 0, starred: false, status: "草稿", channel: sess.channel || "pc", prompt: sess.prompt || "", owner: sess.owner || H.me().id, code: H.newCode() }, H.emptyTrack()), {
      title: spec.copy.headline, scene: spec.scene, sceneName: sc.name || "", group: sc.g || "", groupName: g.name || "", style: spec.style, layout: spec.layout, ratio: spec.ratio,
      versions: sess.versions.map((v) => ({ spec: strip(v.spec), label: v.label, t: v.t || t })), cur: sess.cur, updatedAt: t, date: (old && old.date) || H.posterDate(t), assets,
    });
    if (sess.prompt && !rec.prompt) rec.prompt = sess.prompt;
    const next = [rec, ...list.filter((r) => r.id !== sess.id)];
    if (!write(next)) { rec.assets = []; if (!write(next)) { write(next.slice(0, 30)); } }
    return next;
  };
  const strip = (spec) => { const s = AP.clone(spec); delete s._meta; return s; };
  H.newId = () => "ps_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  /* ---------- 筛选 ---------- */
  H.filter = (list, f) => {
    f = f || {}; let out = list.slice();
    if (f.group) out = out.filter((r) => r.group === f.group);
    if (f.scene) out = out.filter((r) => r.scene === f.scene);
    if (f.starred) out = out.filter((r) => r.starred);
    if (f.channel) out = out.filter((r) => r.channel === f.channel);
    if (f.owner) out = out.filter((r) => r.owner === f.owner);
    if (f.status) out = out.filter((r) => (f.status === "exported" ? (r.exports || r.shares) : f.status === "scanned" ? r.scans > 0 : f.status === "lead" ? r.leads > 0 : !(r.exports || r.shares)));
    if (f.range && f.range !== "all") { const n = H.now(); const span = { today: 1, week: 7, month: 30 }[f.range] * 864e5; const dayStart = new Date(n); dayStart.setHours(0, 0, 0, 0); out = out.filter((r) => (f.range === "today" ? r.updatedAt >= dayStart.getTime() : n - r.updatedAt < span)); }
    if (f.q) { const q = f.q.trim().toLowerCase(); if (q) out = out.filter((r) => [r.title, r.prompt, r.sceneName, r.groupName, ...(r.versions[r.cur] ? r.versions[r.cur].spec.copy.bullets || [] : []), r.versions[r.cur] ? r.versions[r.cur].spec.copy.sub : ""].join(" ").toLowerCase().includes(q)); }
    const sort = f.sort || "updated", dir = f.dir === "asc" ? -1 : 1;
    const KEY = { created: (r) => r.createdAt, updated: (r) => r.updatedAt, versions: (r) => r.versions.length, used: (r) => r.exports + r.shares, exports: (r) => r.exports, shares: (r) => r.shares, scans: (r) => r.scans, leads: (r) => r.leads, rate: (r) => (r.scans ? r.leads / r.scans : -1), title: (r) => r.title, scene: (r) => r.sceneName, owner: (r) => H.owner(r.owner).name, channel: (r) => r.channel, status: (r) => (r.leads ? 4 : r.scans ? 3 : r.shares ? 2 : r.exports ? 1 : 0) };
    const k = KEY[sort] || KEY.updated;
    out.sort((a, b) => { const x = k(a), y = k(b); return (typeof x === "string" ? y.localeCompare(x, "zh") : y - x) * dir || b.updatedAt - a.updatedAt; });
    if (f.pinStar !== false) out.sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));
    return out;
  };
  H.groupByDay = (list) => { const m = {}; list.forEach((r) => { const k = H.dayKey(r.updatedAt); (m[k] = m[k] || []).push(r); }); return H.DAY_ORDER.filter((k) => m[k]).map((k) => ({ key: k, items: m[k] })); };
  H.stats = (list) => {
    const n = H.now(); const sum = (k) => list.reduce((a, r) => a + (r[k] || 0), 0);
    const wk = list.filter((r) => n - r.updatedAt < 7 * 864e5).length; const byScene = {}; list.forEach((r) => (byScene[r.sceneName] = (byScene[r.sceneName] || 0) + 1));
    const top = Object.entries(byScene).sort((a, b) => b[1] - a[1]).slice(0, 3); const shares = sum("shares"), exports = sum("exports"), scans = sum("scans"), leads = sum("leads");
    const trend = H.trend(list); const wkScans = trend.slice(-7).reduce((a, b) => a + b, 0), prevScans = trend.slice(0, 7).reduce((a, b) => a + b, 0);
    return { total: list.length, week: wk, used: exports + shares, exports, shares, scans, leads, rate: H.rate(leads, scans), top, wkScans, prevScans, scanPerShare: shares ? (scans / shares).toFixed(1) : "—" };
  };

  /* ---------- 扫码分析聚合 ---------- */
  H.trend = (list) => { const d = Array(H.DAYS).fill(0); list.forEach((r) => (r.scanDays || []).forEach((v, i) => (d[i] += v))); return d; };
  H.trendLabels = () => { const out = []; for (let i = H.DAYS - 1; i >= 0; i--) { const x = new Date(H.now()); x.setDate(x.getDate() - i); out.push(`${x.getMonth() + 1}/${x.getDate()}`); } return out; };
  H.bySource = (list) => { const m = { moments: 0, group: 0, chat: 0, other: 0 }; list.forEach((r) => Object.keys(m).forEach((k) => (m[k] += (r.scanFrom || {})[k] || 0))); const tot = Object.values(m).reduce((a, b) => a + b, 0); return H.SOURCES.map(([k, name]) => ({ key: k, name, n: m[k], pct: tot ? Math.round((m[k] / tot) * 100) : 0 })); };
  H.byOwner = (list) => { const m = {}; list.forEach((r) => { const o = (m[r.owner] = m[r.owner] || { owner: r.owner, posters: 0, shares: 0, exports: 0, scans: 0, leads: 0, last: 0 }); o.posters++; o.shares += r.shares || 0; o.exports += r.exports || 0; o.scans += r.scans || 0; o.leads += r.leads || 0; o.last = Math.max(o.last, r.updatedAt); }); return Object.values(m).map((o) => Object.assign(o, { rate: H.rate(o.leads, o.scans), avg: o.posters ? Math.round(o.scans / o.posters) : 0 })).sort((a, b) => b.scans - a.scans); };
  H.byScene = (list, key) => { key = key || "scene"; const m = {}; list.forEach((r) => { const id = r[key]; const o = (m[id] = m[id] || { id, name: key === "group" ? r.groupName : r.sceneName, posters: 0, shares: 0, scans: 0, leads: 0 }); o.posters++; o.shares += r.shares || 0; o.scans += r.scans || 0; o.leads += r.leads || 0; }); return Object.values(m).map((o) => Object.assign(o, { rate: H.rate(o.leads, o.scans), avg: o.posters ? Math.round(o.scans / o.posters) : 0 })).sort((a, b) => b.scans - a.scans); };
  H.topScanned = (list, n) => list.slice().filter((r) => r.scans > 0).sort((a, b) => b.scans - a.scans).slice(0, n || 5);
  // 迷你趋势图（内联 SVG，柱状）
  H.spark = (days, w, h, color) => { w = w || 72; h = h || 20; color = color || "#1f5eff"; const mx = Math.max(1, ...days); const bw = w / days.length; return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block;overflow:visible">${days.map((v, i) => { const bh = v ? Math.max(2, Math.round((v / mx) * (h - 2))) : 1; return `<rect x="${(i * bw + 1).toFixed(1)}" y="${h - bh}" width="${Math.max(1, bw - 2).toFixed(1)}" height="${bh}" rx="1" fill="${v ? color : "#e2e8f0"}"${i === days.length - 1 && v ? ' opacity="1"' : v ? ' opacity=".55"' : ""}/>`; }).join("")}</svg>`; };
  // 大趋势图（分析视图）
  H.bars = (days, labels, h, color) => { h = h || 120; color = color || "#1f5eff"; const mx = Math.max(1, ...days); return `<div class="hbars" style="height:${h + 36}px">${days.map((v, i) => `<div class="hb" title="${labels[i]}：${v} 次"><i>${v || ""}</i><b style="height:${v ? Math.max(3, Math.round((v / mx) * h)) : 2}px;background:${v ? color : "#e2e8f0"};opacity:${i === days.length - 1 ? 1 : .7}"></b><small>${i % 2 ? "" : labels[i]}</small></div>`).join("")}</div>`; };

  /* ---------- 缩略图 ---------- */
  H.thumb = (rec, ctx, boxW, boxH) => {
    const v = rec.versions[rec.cur] || rec.versions[rec.versions.length - 1]; if (!v) return "";
    const [w, h] = AP.RATIOS[v.spec.ratio] || AP.RATIOS["3:4"]; const sc = Math.min(boxW / w, boxH / h);
    const c = Object.assign({}, ctx, { assets: [...(ctx.assets || []), ...(rec.assets || []).filter((a) => !(ctx.assets || []).some((x) => x.id === a.id))], date: rec.date, watermark: false });
    return `<div style="position:relative;width:${Math.round(w * sc)}px;height:${Math.round(h * sc)}px;overflow:hidden;border-radius:inherit"><div style="transform:scale(${sc});transform-origin:0 0;position:absolute;left:0;top:0">${AP.renderPoster(v.spec, c, w)}</div></div>`;
  };
  H.ratioBox = (rec, boxW) => { const v = rec.versions[rec.cur]; const [w, h] = AP.RATIOS[(v && v.spec.ratio) || "3:4"]; return Math.round((boxW * h) / w); };

  /* ---------- 示例数据 ---------- */
  H.seed = () => {
    const ctx = { assets: AP.sampleAssets, brand: AP.defaultBrand };
    const day = (d, hh, mm) => { const x = new Date(NOW); x.setDate(x.getDate() - d); x.setHours(hh, mm || 0, 0, 0); return x.getTime(); };
    const items = [
      { scene: "shipping", d: 0, h: 9, m: 12, ch: "h5", refine: ["多图拼贴"], exports: 1, shares: 2 },
      { scene: "birthday", d: 0, h: 7, m: 50, ch: "h5", refine: ["暖一点"], exports: 1, shares: 1, prompt: "明天是苏州华建的张总生日，做一张生日祝福海报，合作 5 年了，暖一点" },
      { scene: "coopanniv", d: 5, h: 9, m: 0, ch: "pc", refine: [], exports: 1, shares: 2 },
      { scene: "care", d: 40, h: 8, m: 20, ch: "h5", refine: [], exports: 0, shares: 3, prompt: "连续高温天，给工地上的客户兄弟们送清凉：注意防暑，卸货尽量安排早晚" },
      { scene: "stock", d: 0, h: 8, m: 5, ch: "pc", refine: [], exports: 1, shares: 1, starred: true },
      { scene: "visit", d: 1, h: 16, m: 40, ch: "h5", refine: ["全图铺满", "字大一点"], exports: 0, shares: 1 },
      { scene: "pricenotice", d: 1, h: 18, m: 20, ch: "pc", refine: [], exports: 1, shares: 3 },
      { scene: "holidaypromo", d: 2, h: 14, m: 3, ch: "pc", refine: ["更喜庆", "标题改成「国庆备货 · 每吨立减 20」", "加二维码"], exports: 2, shares: 4, starred: true },
      { scene: "recruit", d: 3, h: 10, m: 30, ch: "pc", refine: ["薪资 8K~15K", "更商务"], exports: 1, shares: 0 },
      { scene: "case", d: 4, h: 11, m: 15, ch: "pc", refine: ["多图拼贴"], exports: 1, shares: 2 },
      { scene: "solar", d: 5, h: 7, m: 30, ch: "h5", refine: [], exports: 0, shares: 1 },
      { scene: "processing", d: 6, h: 15, m: 50, ch: "h5", refine: [], exports: 0, shares: 0 },
      { scene: "anniversary", d: 9, h: 13, m: 0, ch: "pc", refine: ["黑金", "改成竖屏 9:16"], exports: 1, shares: 2 },
      { scene: "newproduct", d: 12, h: 9, m: 45, ch: "pc", refine: ["用第二张图"], exports: 1, shares: 1 },
      { scene: "festival", d: 15, h: 20, m: 10, ch: "h5", refine: ["改成竖屏 9:16"], exports: 1, shares: 5, prompt: "中秋节祝福海报，感谢客户一路相伴，喜庆一点" },
      { scene: "clearance", d: 18, h: 16, m: 25, ch: "pc", refine: ["更简洁"], exports: 0, shares: 0 },
      { scene: "team", d: 22, h: 8, m: 40, ch: "h5", refine: [], exports: 0, shares: 1 },
      { scene: "shipping", d: 2, h: 17, m: 30, ch: "h5", refine: [], exports: 0, shares: 1, prompt: "下午宝山库装车，5 车 200 吨盘螺发往无锡，实拍" },
      { scene: "stock", d: 1, h: 8, m: 2, ch: "pc", refine: [], exports: 1, shares: 1, prompt: "今日库存表：螺纹钢 Φ12-25 沙钢 3700，盘螺 Φ8-10 永钢 3760，热卷 3.0-11.75 日照 3800，宝山库当日提" },
      { scene: "shipping", d: 7, h: 10, m: 20, ch: "h5", refine: ["全图铺满"], exports: 1, shares: 2, prompt: "今天发货现场，3 车 120 吨热卷发往常州，装车实拍" },
      { scene: "pricenotice", d: 8, h: 18, m: 40, ch: "pc", refine: [], exports: 1, shares: 2, prompt: "调价通知：钢厂下调，明日起热卷每吨下调 20 元" },
      { scene: "stock", d: 3, h: 8, m: 6, ch: "pc", refine: [], exports: 1, shares: 0, prompt: "今日库存表：螺纹钢 Φ12-25 沙钢 3680，热卷 3.0-11.75 日照 3790，中厚板 Q235B 鞍钢 3810，宝山库当日提" },
      { scene: "notice", d: 34, h: 17, m: 5, ch: "pc", refine: [], exports: 1, shares: 2 },
      { scene: "intro", d: 41, h: 10, m: 0, ch: "pc", refine: ["用第二张图", "字大一点"], exports: 1, shares: 1 },
    ];
    // 发布人：老板做企业 / 促销 / 通知类，业务员做发货 / 库存 / 客户接待类，运营做节日 / 团队类
    const OWNER_BY_SCENE = { intro: "u_wang", honor: "u_wang", holidaypromo: "u_wang", anniversary: "u_wang", pricenotice: "u_wang", notice: "u_wang", recruit: "u_wang", newproduct: "u_li", case: "u_li", clearance: "u_li", stock: "u_li", shipping: "u_zhang", visit: "u_zhang", processing: "u_zhang", solar: "u_zhang", festival: "u_chen", team: "u_chen", birthday: "u_li", coopanniv: "u_wang", vip: "u_wang", care: "u_zhang", congrats: "u_li", gift: "u_chen", hello: "u_zhang" };
    const rnd = (a, b) => { const x = Math.sin(a * 9301 + b * 49297) * 233280; return x - Math.floor(x); }; // 确定性伪随机，保证示例数据稳定
    // 扫码量与分享次数、场景相关：促销 / 库存表 / 调价通知扫码多；团队 / 招聘少
    const SCAN_W = { holidaypromo: 22, promo: 20, flash: 20, clearance: 16, stock: 18, pricenotice: 15, shipping: 9, newproduct: 12, case: 8, visit: 6, festival: 7, anniversary: 14, intro: 6, recruit: 3, team: 2, solar: 4, processing: 5, notice: 6, birthday: 3, coopanniv: 5, care: 3, vip: 14, congrats: 4, gift: 5, hello: 8 };
    const LEAD_R = { holidaypromo: .18, promo: .2, clearance: .22, stock: .25, pricenotice: .15, shipping: .1, newproduct: .16, case: .12, visit: .1, anniversary: .12, intro: .08, vip: .2, hello: .15, coopanniv: .1 };
    return items.map((it, i) => {
      const sc = AP.SCENES.find((s) => s.id === it.scene); const g = AP.GROUPS.find((x) => x.id === sc.g); const t0 = day(it.d, it.h, it.m); const prompt = it.prompt || sc.example;
      let spec = AP.mockPlan(prompt, ctx); const versions = [{ spec: strip(spec), label: "生成", t: t0 }];
      it.refine.forEach((r, j) => { const res = AP.mockRefine(versions[versions.length - 1].spec, r, ctx); versions.push({ spec: strip(res.spec), label: r.slice(0, 8), t: t0 + (j + 1) * 90e3 }); });
      const last = versions[versions.length - 1].spec;
      const owner = it.owner || OWNER_BY_SCENE[it.scene] || (it.ch === "h5" ? "u_zhang" : "u_wang"); const tr = H.emptyTrack();
      if (it.shares) {
        const total = Math.round(it.shares * (SCAN_W[it.scene] || 6) * (0.7 + rnd(i, 1) * .8));
        // 分布到发布日之后的 14 天窗口：发布当天最多，随后衰减
        for (let d = 0; d < H.DAYS; d++) { const ago = H.DAYS - 1 - d; if (ago > it.d) continue; const age = it.d - ago; const w = Math.exp(-age / 3) * (0.6 + rnd(i, d + 2) * .8); tr.scanDays[d] = Math.round(total * w * .45); }
        tr.scans = tr.scanDays.reduce((a, b) => a + b, 0); if (it.d >= H.DAYS) tr.scans = total; // 更早的海报：扫码已发生在 14 天窗口之外
        const mix = [0.5 + rnd(i, 30) * .2, 0.2 + rnd(i, 31) * .15, 0.1 + rnd(i, 32) * .1]; const s = mix.reduce((a, b) => a + b, 0) + .05;
        tr.scanFrom.moments = Math.round(tr.scans * mix[0] / s); tr.scanFrom.group = Math.round(tr.scans * mix[1] / s); tr.scanFrom.chat = Math.round(tr.scans * mix[2] / s); tr.scanFrom.other = Math.max(0, tr.scans - tr.scanFrom.moments - tr.scanFrom.group - tr.scanFrom.chat);
        tr.leads = Math.round(tr.scans * (LEAD_R[it.scene] || .05) * (0.7 + rnd(i, 40) * .6));
        for (let k = 0; k < Math.min(tr.leads, 6); k++) tr.leadList.push({ t: t0 + Math.round(rnd(i, 50 + k) * Math.min(it.d, 13) * 864e5) + 3600e3 * (1 + Math.round(rnd(i, 60 + k) * 10)), src: H.SOURCES[Math.floor(rnd(i, 70 + k) * 3)][0], city: LEAD_CITIES[Math.floor(rnd(i, 80 + k) * LEAD_CITIES.length)], type: LEAD_TYPES[Math.floor(rnd(i, 90 + k) * LEAD_TYPES.length)], isNew: rnd(i, 100 + k) < .7 });
        tr.leadList.sort((a, b) => b.t - a.t);
        // 每个有扫码的渠道一条 poster_share；分享次数按渠道扫码占比分摊，至少 1 次
        const srcs = H.SOURCES.map((x) => x[0]).filter((k) => tr.scanFrom[k] > 0); if (!srcs.length) srcs.push("moments");
        let left = Math.max(it.shares, srcs.length); srcs.forEach((k, j) => { const n = j === srcs.length - 1 ? left : Math.max(1, Math.round(it.shares * (tr.scanFrom[k] / Math.max(1, tr.scans)))); left -= n; tr.channels[k] = { at: t0 + it.refine.length * 90e3 + 600e3 + j * 5400e3, lastAt: t0 + it.refine.length * 90e3 + 600e3 + j * 5400e3 + Math.round(rnd(i, 110 + j) * 2) * 864e5, shares: n, scans: tr.scanFrom[k], leads: tr.leadList.filter((l) => l.src === k).length }; });
        const sumLeads = Object.values(tr.channels).reduce((a, c) => a + c.leads, 0); if (tr.leads > sumLeads) tr.channels[srcs[0]].leads += tr.leads - sumLeads;
      }
      return Object.assign({ id: "demo_" + i, demo: true, title: last.copy.headline, scene: sc.id, sceneName: sc.name, group: sc.g, groupName: g.name, style: last.style, layout: last.layout, ratio: last.ratio, prompt, channel: it.ch, owner, code: "Q" + (1000 + i * 37).toString(36).toUpperCase().padStart(5, "0"), publishedAt: it.shares ? t0 + it.refine.length * 90e3 + 600e3 : 0, createdAt: t0, updatedAt: t0 + it.refine.length * 90e3, date: H.posterDate(t0), versions, cur: versions.length - 1, exports: it.exports, shares: Object.values(tr.channels).reduce((a, c) => a + c.shares, 0), starred: !!it.starred, status: it.shares ? "已分享" : it.exports ? "已导出" : "草稿", assets: [] }, tr);
    });
  };
})();
