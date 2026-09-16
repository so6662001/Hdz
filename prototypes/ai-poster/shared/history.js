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

  /* ---------- 存取 ---------- */
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
  function write(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch (e) { return false; } }
  H.load = () => { let list = read(); if (!list) { list = H.seed(); write(list); } return list; };
  H.save = (list) => write(list);
  H.get = (id) => H.load().find((r) => r.id === id);
  H.remove = (id) => { const list = H.load().filter((r) => r.id !== id); write(list); return list; };
  H.clearDemo = () => { const list = H.load().filter((r) => !r.demo); write(list); return list; };
  H.star = (id) => { const list = H.load(); const r = list.find((x) => x.id === id); if (r) r.starred = !r.starred; write(list); return r && r.starred; };
  H.bump = (id, field) => { const list = H.load(); const r = list.find((x) => x.id === id); if (r) { r[field] = (r[field] || 0) + 1; r.status = field === "shares" ? "已分享" : field === "exports" ? "已导出" : r.status; write(list); } };
  // 会话 → 记录（每次生成 / 微调后调用，按 id 覆盖）
  H.upsert = (sess) => {
    const list = H.load(); const spec = sess.versions[sess.cur] && sess.versions[sess.cur].spec; if (!spec) return list;
    const sc = AP.SCENES.find((s) => s.id === spec.scene) || {}; const g = AP.GROUPS.find((x) => x.id === sc.g) || {};
    const old = list.find((r) => r.id === sess.id); const t = H.now();
    const used = new Set([spec.assets.logo, spec.assets.photo, ...(spec.assets.photos || [])].filter(Boolean));
    const assets = (sess.assets || []).filter((a) => a.uploaded && used.has(a.id)).map((a) => ({ id: a.id, type: a.type, name: a.name, tags: a.tags, url: a.url, uploaded: true }));
    const rec = Object.assign(old || { id: sess.id, createdAt: t, exports: 0, shares: 0, starred: false, status: "草稿", channel: sess.channel || "pc", prompt: sess.prompt || "" }, {
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
    if (f.status) out = out.filter((r) => (f.status === "exported" ? (r.exports || r.shares) : !(r.exports || r.shares)));
    if (f.range && f.range !== "all") { const n = H.now(); const span = { today: 1, week: 7, month: 30 }[f.range] * 864e5; const dayStart = new Date(n); dayStart.setHours(0, 0, 0, 0); out = out.filter((r) => (f.range === "today" ? r.updatedAt >= dayStart.getTime() : n - r.updatedAt < span)); }
    if (f.q) { const q = f.q.trim().toLowerCase(); if (q) out = out.filter((r) => [r.title, r.prompt, r.sceneName, r.groupName, ...(r.versions[r.cur] ? r.versions[r.cur].spec.copy.bullets || [] : []), r.versions[r.cur] ? r.versions[r.cur].spec.copy.sub : ""].join(" ").toLowerCase().includes(q)); }
    const sort = f.sort || "updated";
    out.sort((a, b) => sort === "created" ? b.createdAt - a.createdAt : sort === "versions" ? b.versions.length - a.versions.length : sort === "used" ? (b.exports + b.shares) - (a.exports + a.shares) : b.updatedAt - a.updatedAt);
    if (f.pinStar !== false) out.sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));
    return out;
  };
  H.groupByDay = (list) => { const m = {}; list.forEach((r) => { const k = H.dayKey(r.updatedAt); (m[k] = m[k] || []).push(r); }); return H.DAY_ORDER.filter((k) => m[k]).map((k) => ({ key: k, items: m[k] })); };
  H.stats = (list) => { const n = H.now(); const wk = list.filter((r) => n - r.updatedAt < 7 * 864e5).length; const ex = list.reduce((a, r) => a + (r.exports || 0) + (r.shares || 0), 0); const byScene = {}; list.forEach((r) => (byScene[r.sceneName] = (byScene[r.sceneName] || 0) + 1)); const top = Object.entries(byScene).sort((a, b) => b[1] - a[1]).slice(0, 3); return { total: list.length, week: wk, used: ex, top }; };

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
    return items.map((it, i) => {
      const sc = AP.SCENES.find((s) => s.id === it.scene); const g = AP.GROUPS.find((x) => x.id === sc.g); const t0 = day(it.d, it.h, it.m); const prompt = it.prompt || sc.example;
      let spec = AP.mockPlan(prompt, ctx); const versions = [{ spec: strip(spec), label: "生成", t: t0 }];
      it.refine.forEach((r, j) => { const res = AP.mockRefine(versions[versions.length - 1].spec, r, ctx); versions.push({ spec: strip(res.spec), label: r.slice(0, 8), t: t0 + (j + 1) * 90e3 }); });
      const last = versions[versions.length - 1].spec;
      return { id: "demo_" + i, demo: true, title: last.copy.headline, scene: sc.id, sceneName: sc.name, group: sc.g, groupName: g.name, style: last.style, layout: last.layout, ratio: last.ratio, prompt, channel: it.ch, createdAt: t0, updatedAt: t0 + it.refine.length * 90e3, date: H.posterDate(t0), versions, cur: versions.length - 1, exports: it.exports, shares: it.shares, starred: !!it.starred, status: it.shares ? "已分享" : it.exports ? "已导出" : "草稿", assets: [] };
    });
  };
})();
