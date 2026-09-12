/* 货袋子 · 落地页原型通用工具
 * - HDZ.qr(el, size)            伪二维码（原型占位，真实环境由平台生成带 spread_code 的小程序码/二维码）
 * - HDZ.spark(el, arr, opts)    行情走势折线 SVG
 * - HDZ.chg(change)             涨跌 HTML
 * - HDZ.countUp(el, to, ms)     数字滚动
 * - HDZ.inquiry()               打开留资底部弹层（闭环关键：扫码 → 留资 → 归因到销售员/企业）
 * - HDZ.call() / HDZ.wechat()   拨号 / 复制微信
 * - HDZ.poster(opts)            一键生成 9:16 海报图预览层（同风格）
 * - HDZ.mountCommon()           注入留资弹层、海报层、原型角标
 */
(function () {
  const H = (window.HDZ = window.HDZ || {});
  const D = () => H.data;

  /* ---------- 伪二维码 ---------- */
  H.qr = function (el, size, dark, light) {
    if (!el) return;
    size = size || 96;
    dark = dark || "#111";
    light = light || "#fff";
    const n = 25;
    const cell = size / n;
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    let rects = "";
    const finder = (x, y) => {
      rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell * 7}" height="${cell * 7}" fill="${dark}"/>`;
      rects += `<rect x="${(x + 1) * cell}" y="${(y + 1) * cell}" width="${cell * 5}" height="${cell * 5}" fill="${light}"/>`;
      rects += `<rect x="${(x + 2) * cell}" y="${(y + 2) * cell}" width="${cell * 3}" height="${cell * 3}" fill="${dark}"/>`;
    };
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const inFinder = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
        if (inFinder) continue;
        if (rnd() > 0.55) rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="${dark}"/>`;
      }
    }
    finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
    el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="display:block;background:${light};border-radius:4px">${rects}</svg>`;
  };

  /* ---------- 走势图 ---------- */
  H.spark = function (el, arr, opts) {
    if (!el) return;
    opts = Object.assign({ w: 320, h: 90, color: "#e5312b", fill: true, dots: true, labels: null, grid: true, stroke: 2.2 }, opts || {});
    const { w, h, color } = opts;
    const pad = 8;
    const min = Math.min(...arr), max = Math.max(...arr);
    const rng = max - min || 1;
    const pts = arr.map((v, i) => {
      const x = pad + (i / (arr.length - 1)) * (w - pad * 2);
      const y = pad + (1 - (v - min) / rng) * (h - pad * 2 - (opts.labels ? 14 : 0));
      return [x, y];
    });
    const path = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const id = "g" + Math.random().toString(36).slice(2, 8);
    let svg = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" style="display:block;overflow:visible">`;
    svg += `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".35"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>`;
    if (opts.grid) for (let i = 0; i < 3; i++) { const y = pad + (i / 2) * (h - pad * 2 - (opts.labels ? 14 : 0)); svg += `<line x1="${pad}" x2="${w - pad}" y1="${y}" y2="${y}" stroke="currentColor" stroke-opacity=".08" stroke-dasharray="3 3"/>`; }
    if (opts.fill) svg += `<path d="${path} L${pts[pts.length - 1][0]} ${h - pad - (opts.labels ? 14 : 0)} L${pts[0][0]} ${h - pad - (opts.labels ? 14 : 0)} Z" fill="url(#${id})"/>`;
    svg += `<path d="${path}" fill="none" stroke="${color}" stroke-width="${opts.stroke}" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (opts.dots) pts.forEach((p, i) => { const last = i === pts.length - 1; svg += `<circle cx="${p[0]}" cy="${p[1]}" r="${last ? 4 : 2.2}" fill="${last ? color : "#fff"}" stroke="${color}" stroke-width="1.5"/>`; });
    if (opts.labels) pts.forEach((p, i) => { svg += `<text x="${p[0]}" y="${h - 2}" font-size="9" text-anchor="middle" fill="currentColor" fill-opacity=".55">${opts.labels[i]}</text>`; });
    svg += "</svg>";
    el.innerHTML = svg;
  };

  /* ---------- 涨跌 ---------- */
  H.chg = function (c, withSign) {
    if (c > 0) return `<span class="up">${withSign === false ? "" : "▲"}${c}</span>`;
    if (c < 0) return `<span class="down">${withSign === false ? "" : "▼"}${Math.abs(c)}</span>`;
    return `<span class="flat">— 平</span>`;
  };
  H.cls = (c) => (c > 0 ? "up" : c < 0 ? "down" : "flat");

  /* ---------- 数字滚动 ---------- */
  H.countUp = function (el, to, ms) {
    if (!el) return;
    ms = ms || 900;
    const start = performance.now();
    const from = 0;
    const step = (t) => {
      const p = Math.min(1, (t - start) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---------- 动作 ---------- */
  H.call = function () { alert(`拨打 ${D().sales.name} ${D().sales.phone}\n（原型：真实环境直接 tel: 拨号，并记录归因 ${D().spreadCode}）`); };
  H.wechat = function () { alert(`已复制微信号 ${D().sales.wechat}\n（原型：真实环境弹出企微二维码/一键加好友）`); };
  H.share = function () { alert("原型：真实环境调起微信分享，分享链接携带 spread_code 追踪码，被分享者的留资归因到当前销售员。"); };

  /* ---------- 留资弹层 ---------- */
  H.inquiry = function (preset) {
    const m = document.getElementById("hdz-sheet");
    if (!m) return;
    m.classList.add("show");
    const body = m.querySelector(".sheet");
    const res = D().resources;
    body.innerHTML = `
      <h3>询价 / 留下需求</h3>
      <p class="sub">${D().sales.name} 将在 30 分钟内回复 · 报价仅您可见</p>
      <div class="row">
        <div class="field"><label>品名</label><select id="q-name">${[...new Set(res.map((r) => r.name))].map((n) => `<option ${preset && preset.name === n ? "selected" : ""}>${n}</option>`).join("")}</select></div>
        <div class="field"><label>规格</label><input id="q-spec" placeholder="如 Φ16 HRB400E" value="${(preset && preset.spec) || ""}"></div>
      </div>
      <div class="row">
        <div class="field"><label>数量（吨）</label><input inputmode="numeric" placeholder="如 50"></div>
        <div class="field"><label>交期</label><select><option>今天</option><option>3 天内</option><option>一周内</option></select></div>
      </div>
      <div class="field"><label>手机号</label><input inputmode="tel" placeholder="接收报价（已实名用户自动填充）"></div>
      <div class="field"><label>备注</label><textarea placeholder="付款方式、提货仓库等"></textarea></div>
      <button class="submit" onclick="HDZ._submitInquiry()">提交询价</button>
      <p class="tip">提交即视为同意平台服务协议 · 归因码 ${D().spreadCode}</p>`;
  };
  H._submitInquiry = function () {
    const body = document.querySelector("#hdz-sheet .sheet");
    body.innerHTML = `<div class="ok"><div class="icon">✓</div><h3>需求已送达 ${D().sales.name}</h3><p class="sub" style="margin-top:6px">这条线索已归因到 <b>${D().company.short}</b>（${D().spreadCode}）<br>预计 30 分钟内电话/微信回复</p>
      <button class="submit" style="margin-top:14px" onclick="HDZ.wechat()">加微信 ${D().sales.wechat}</button>
      <button class="submit" style="margin-top:8px;background:#f2f3f5;color:#333" onclick="HDZ.closeSheet()">继续看资源</button></div>`;
  };
  H.closeSheet = function () { document.getElementById("hdz-sheet").classList.remove("show"); };

  /* ---------- 海报生成层 ---------- */
  H.poster = function (opts) {
    opts = Object.assign({ bg: "#fff", fg: "#111", accent: "#e5312b", brand: "#1f5eff", title: "今日钢市行情", sub: "" }, opts || {});
    const m = document.getElementById("hdz-poster");
    if (!m) return;
    const d = D();
    m.classList.add("show");
    const card = m.querySelector(".poster-card");
    card.style.setProperty("--poster-bg", opts.bg);
    card.style.setProperty("--poster-fg", opts.fg);
    card.style.fontFamily = opts.font || "inherit";
    const q = d.quotes.slice(0, 4);
    const r = d.resources.slice(0, 3);
    card.innerHTML = `
      <div style="padding:18px 18px 0;display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;align-items:center;gap:8px"><div style="width:28px;height:28px;border-radius:7px;background:${opts.brand};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800">${d.company.logoText}</div><b style="font-size:13px">${d.company.short}</b></div>
        <span style="font-size:10px;opacity:.6">${d.date} ${d.weekday}</span>
      </div>
      <div style="padding:14px 18px 0"><div style="font-size:26px;font-weight:900;letter-spacing:1px;line-height:1.1">${opts.title}</div><div style="font-size:11px;opacity:.7;margin-top:4px">${opts.sub || d.company.slogan}</div></div>
      <div style="margin:14px 18px 0;border-radius:10px;background:rgba(127,127,127,.08);padding:10px 12px">
        ${q.map((x) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px dashed rgba(127,127,127,.2)"><div><b style="font-size:13px">${x.name}</b><span style="font-size:10px;opacity:.6;margin-left:6px">${x.spec}</span></div><div style="text-align:right"><b style="font-size:15px">${x.price}</b> <span style="font-size:11px">${H.chg(x.change)}</span></div></div>`).join("")}
      </div>
      <div style="margin:12px 18px 0;font-size:11px;font-weight:700;opacity:.85">我司现货 · 当日提</div>
      <div style="margin:6px 18px 0">
        ${r.map((x) => `<div style="display:flex;justify-content:space-between;font-size:11px;padding:4px 0"><span>${x.name} ${x.spec} · ${x.mill}</span><b style="color:${opts.accent}">¥${x.price}</b></div>`).join("")}
      </div>
      <div style="position:absolute;left:0;right:0;bottom:0;padding:14px 18px;background:${opts.brand};color:#fff;display:flex;align-items:center;gap:12px">
        <div id="poster-qr" style="background:#fff;padding:4px;border-radius:6px"></div>
        <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:800">${d.sales.name} · ${d.sales.title}</div><div style="font-size:11px;opacity:.9">${d.sales.phone}</div><div style="font-size:10px;opacity:.8;margin-top:4px">长按识别二维码 · 查看更多现货并询价</div></div>
      </div>`;
    H.qr(card.querySelector("#poster-qr"), 62);
  };
  H.closePoster = function () { document.getElementById("hdz-poster").classList.remove("show"); };

  /* ---------- 挂载通用层 ---------- */
  H.mountCommon = function (opts) {
    opts = opts || {};
    if (window.self !== window.top) opts.badge = false; // 被画廊 iframe 嵌入时不显示原型角标
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="sheet-mask" id="hdz-sheet" onclick="if(event.target===this)HDZ.closeSheet()"><div class="sheet"></div></div>
      <div class="poster-mask" id="hdz-poster" onclick="if(event.target===this)HDZ.closePoster()">
        <div class="poster-card"></div>
        <div class="poster-actions"><button onclick="HDZ.closePoster()">返回</button><button class="primary" onclick="alert('原型：真实环境服务端渲染为图片并保存到相册 / 直接分享到微信')">保存海报图</button><button onclick="HDZ.share()">分享到微信</button></div>
        <div class="poster-hint">海报与落地页同风格 · 二维码携带销售员追踪码</div>
      </div>
      ${opts.badge === false ? "" : `<div class="proto-badge">原型 · ${opts.name || ""}<a href="../index.html">← 全部风格</a></div>`}`;
    document.body.appendChild(wrap);
  };
})();
