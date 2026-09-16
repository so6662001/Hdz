/* AI 企业经营海报 · 原型引擎
 * - SCENES / STYLES：场景库与风格库
 * - mockPlan(prompt, ctx)：模拟"多模态大模型规划"，输出设计 JSON（正式版由 ModelGateway.plan 替换）
 * - mockRefine(spec, instruction, ctx)：模拟"微调指令 → JSON Patch"（正式版由 ModelGateway.refine 替换）
 * - renderPoster(spec, ctx, width)：渲染引擎（前后端共用），输出 HTML 字符串
 * 说明：原型中的"大模型"为规则模拟，仅用于演示交互与版式；精确信息（电话/价格/企业名）始终由引擎排版，不经过图像模型。
 */
(function () {
  const AP = (window.AP = {});

  /* ---------- 品牌与素材（演示默认值） ---------- */
  AP.defaultBrand = { company: "上海鑫钢贸易有限公司", short: "鑫钢贸易", slogan: "华东现货 · 一手货源 · 当日提货", person: "王建国", phone: "138 0000 8888", addr: "上海宝山钢材市场 A 区 12 号", color: "#1f5eff" };

  const svg = (s) => "data:image/svg+xml;utf8," + encodeURIComponent(s);
  AP.sampleAssets = [
    { id: "ast_logo", type: "logo", name: "企业 Logo", tags: ["logo", "透明底"], url: svg(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' rx='40' fill='#1f5eff'/><text x='100' y='128' font-size='96' font-weight='900' text-anchor='middle' fill='#fff' font-family='PingFang SC,Microsoft YaHei,sans-serif'>鑫</text></svg>`) },
    { id: "ast_ware", type: "photo", name: "仓库实拍", tags: ["仓库", "钢卷"], url: svg(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#3b4557'/><stop offset='1' stop-color='#141a24'/></linearGradient></defs><rect width='800' height='600' fill='url(#g)'/><g fill='#6b7a90'><ellipse cx='200' cy='420' rx='150' ry='150'/><ellipse cx='460' cy='430' rx='140' ry='140'/><ellipse cx='690' cy='440' rx='120' ry='120'/></g><g fill='#2a3242'><ellipse cx='200' cy='420' rx='60' ry='60'/><ellipse cx='460' cy='430' rx='55' ry='55'/><ellipse cx='690' cy='440' rx='48' ry='48'/></g><rect y='560' width='800' height='40' fill='#0d1117'/><g stroke='#8b98ad' stroke-width='6' opacity='.5'><line x1='0' y1='90' x2='800' y2='90'/><line x1='120' y1='0' x2='120' y2='90'/><line x1='400' y1='0' x2='400' y2='90'/><line x1='680' y1='0' x2='680' y2='90'/></g></svg>`) },
    { id: "ast_rebar", type: "photo", name: "螺纹钢产品", tags: ["产品", "螺纹钢"], url: svg(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'><rect width='800' height='600' fill='#1b1f27'/><g transform='rotate(-18 400 300)'>${Array.from({ length: 9 }, (_, i) => `<rect x='-100' y='${120 + i * 44}' width='1000' height='26' rx='13' fill='${i % 2 ? "#6f5a45" : "#8a6f52"}'/><rect x='-100' y='${126 + i * 44}' width='1000' height='6' rx='3' fill='#b08c66' opacity='.6'/>`).join("")}</g></svg>`) },
    { id: "ast_cert", type: "cert", name: "代理授权书", tags: ["资质", "授权"], url: svg(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 800'><rect width='600' height='800' fill='#f7f1e3'/><rect x='30' y='30' width='540' height='740' fill='none' stroke='#c9a14a' stroke-width='8'/><text x='300' y='180' font-size='44' text-anchor='middle' fill='#8a2b1d' font-weight='900' font-family='Songti SC,serif'>授权证书</text><g fill='#7a7a7a'>${Array.from({ length: 9 }, (_, i) => `<rect x='90' y='${260 + i * 40}' width='${420 - (i % 3) * 60}' height='12' rx='6'/>`).join("")}</g><circle cx='440' cy='680' r='60' fill='none' stroke='#c8102e' stroke-width='6' opacity='.8'/></svg>`) },
    { id: "ast_team", type: "photo", name: "团队合影", tags: ["人物", "团队"], url: svg(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'><rect width='800' height='600' fill='#dfe6f0'/><g fill='#2f3a4f'>${[120, 260, 400, 540, 680].map((x, i) => `<circle cx='${x}' cy='${250 + (i % 2) * 20}' r='48'/><rect x='${x - 90}' y='${300 + (i % 2) * 20}' width='180' height='300' rx='60'/>`).join("")}</g></svg>`) },
  ];

  /* ---------- 场景库 ---------- */
  AP.SCENES = [
    { id: "recruit", name: "招聘", icon: "🧑‍💼", kw: ["招聘", "招人", "诚聘", "岗位", "薪", "招销售", "招司机", "招业务"], layout: "list", style: "business", example: "招 5 名钢材销售，底薪 6000 加高提成，五险包住，有钢贸经验优先，电话 138 0000 8888" },
    { id: "promo", name: "促销特价", icon: "🔥", kw: ["促销", "特价", "清仓", "优惠", "降价", "让利", "秒杀", "限时", "抢购", "低价"], layout: "hero", style: "festive", example: "本周螺纹钢 Φ12-25 特价 3690 元/吨，限 500 吨，周日截止，现货当天提" },
    { id: "festival", name: "节日祝福", icon: "🎉", kw: ["中秋", "国庆", "春节", "新年", "元旦", "端午", "五一", "劳动节", "祝福", "佳节", "元宵", "除夕", "感恩节"], layout: "card", style: "festive", example: "中秋节祝福海报，感谢客户一路相伴，喜庆一点" },
    { id: "opening", name: "开业周年", icon: "🎊", kw: ["开业", "周年", "乔迁", "新店", "盛大", "庆典"], layout: "hero", style: "festive", example: "公司成立 10 周年庆，10 月 18 日当天下单每吨立减 30 元，欢迎老客户光临" },
    { id: "intro", name: "企业介绍", icon: "🏭", kw: ["介绍", "实力", "公司简介", "关于我们", "库存", "仓库", "代理", "成立"], layout: "split", style: "industrial", example: "企业实力介绍：成立 12 年，常备库存 3 万吨，沙钢永钢一级代理，宝山 3 个仓库，当日提货" },
    { id: "catalog", name: "产品目录", icon: "📋", kw: ["目录", "产品", "品种", "规格表", "主营", "经营范围"], layout: "list", style: "minimal", example: "主营产品：螺纹钢、盘螺、热卷、中厚板、镀锌板、工字钢，钢厂沙钢永钢中天，宝山库当日提" },
    { id: "honor", name: "资质荣誉", icon: "🏅", kw: ["资质", "荣誉", "授权", "证书", "认证", "获评", "荣获"], layout: "split", style: "paper", example: "荣获沙钢 2026 年度优秀代理商，晒授权证书，稳重一点" },
    { id: "event", name: "活动邀请", icon: "📅", kw: ["邀请", "邀请函", "展会", "论坛", "沙龙", "会议", "活动", "订货会"], layout: "card", style: "black", example: "邀请老客户参加 10 月 20 日下午 2 点的秋季订货会，地点宝山钢材市场 3 楼会议室" },
    { id: "arrival", name: "到货通知", icon: "🚚", kw: ["到货", "新到", "进货", "新品", "补货", "刚到"], layout: "hero", style: "industrial", example: "今天新到沙钢螺纹钢 Φ16-25 共 800 吨，宝山库现货，欢迎询价" },
    { id: "thanks", name: "客户感谢", icon: "🤝", kw: ["感谢", "致谢", "感恩", "服务承诺", "承诺", "回馈"], layout: "card", style: "business", example: "感谢新老客户 2026 年的支持，承诺当日提货、质保书齐全、磅差包赔" },
    { id: "franchise", name: "招商合作", icon: "🤲", kw: ["招商", "加盟", "合作", "代理商", "分销", "合伙"], layout: "hero", style: "black", example: "招募区域分销合作伙伴，无需囤货，一手价供货，返利政策优厚" },
    { id: "notice", name: "通知公告", icon: "📢", kw: ["通知", "公告", "放假", "调价", "搬迁", "停业", "上班", "营业时间"], layout: "card", style: "minimal", example: "国庆放假通知：10 月 1 日至 3 日休息，4 日正常上班，假期可电话预约提货" },
  ];

  /* ---------- 风格与配色 ---------- */
  AP.STYLES = {
    business: { name: "商务稳重", palette: { bg: "#0b1a33", bg2: "#12305e", fg: "#ffffff", mute: "#9fb0cc", accent: "#ff8a2b", accent2: "#3f8cff", mode: "dark" }, bgfx: "glow", visual: "深蓝色商务氛围背景，右上角柔和橙色光晕，左侧留白，无文字无 Logo" },
    festive: { name: "红金喜庆", palette: { bg: "#b3121b", bg2: "#7a0a12", fg: "#fff6e5", mute: "#f3c9a1", accent: "#ffd166", accent2: "#ff8a2b", mode: "dark" }, bgfx: "confetti", visual: "中国红渐变背景，金色光点与祥云暗纹，顶部留白，无文字" },
    industrial: { name: "工业硬朗", palette: { bg: "#1b1f27", bg2: "#2b323f", fg: "#f4f6fa", mute: "#a7b0c0", accent: "#ff6a2b", accent2: "#ffc53d", mode: "dark" }, bgfx: "stripes", visual: "深灰钢材质感背景，斜向警示条纹与金属高光，左下留白，无文字" },
    minimal: { name: "简洁白", palette: { bg: "#ffffff", bg2: "#f2f5fa", fg: "#111827", mute: "#6b7280", accent: "#1f5eff", accent2: "#ff6a2b", mode: "light" }, bgfx: "none", visual: "纯白极简背景，右上角一抹浅蓝几何色块，大面积留白，无文字" },
    tech: { name: "科技蓝", palette: { bg: "#03101f", bg2: "#062a4a", fg: "#e6f4ff", mute: "#8fb3d9", accent: "#19d3ff", accent2: "#7c5cff", mode: "dark" }, bgfx: "grid", visual: "深蓝科技网格背景，青色光线，中心留白，无文字" },
    black: { name: "黑金高端", palette: { bg: "#0c0c0e", bg2: "#1c1a16", fg: "#f5ecd7", mute: "#a89f8a", accent: "#d4af37", accent2: "#f0d78c", mode: "dark" }, bgfx: "rings", visual: "黑色哑光背景，金色细线圆环与颗粒质感，中部留白，无文字" },
    paper: { name: "国风纸质", palette: { bg: "#f6efe0", bg2: "#ede2c8", fg: "#2b2118", mute: "#8b7a63", accent: "#b3402b", accent2: "#c9a14a", mode: "light" }, bgfx: "paper", visual: "米色宣纸纹理背景，淡墨山影与朱砂印章暗纹，上方留白，无文字" },
    green: { name: "清新绿", palette: { bg: "#0f3d2e", bg2: "#155f45", fg: "#f2fff8", mute: "#a5d8bf", accent: "#ffd166", accent2: "#7be495", mode: "dark" }, bgfx: "glow", visual: "墨绿渐变背景，柔和黄绿光晕，左侧留白，无文字" },
  };
  const COLOR_WORDS = [["红", "festive"], ["喜庆", "festive"], ["蓝", "business"], ["商务", "business"], ["稳重", "business"], ["工业", "industrial"], ["硬朗", "industrial"], ["钢铁", "industrial"], ["橙", "industrial"], ["白", "minimal"], ["简洁", "minimal"], ["极简", "minimal"], ["清爽", "minimal"], ["科技", "tech"], ["青", "tech"], ["黑金", "black"], ["高端", "black"], ["高级", "black"], ["金色", "black"], ["黑", "black"], ["国风", "paper"], ["中式", "paper"], ["古风", "paper"], ["纸", "paper"], ["绿", "green"]];
  const STYLE_ORDER = Object.keys(AP.STYLES);
  const LAYOUTS = ["hero", "split", "list", "card"];
  AP.LAYOUT_NAMES = { hero: "主视觉大字", split: "上图下文", list: "标题 + 要点卡", card: "居中卡片" };
  AP.RATIOS = { "3:4": [1080, 1440], "9:16": [1080, 1920], "1:1": [1080, 1080] };

  /* ---------- 工具 ---------- */
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  AP.esc = esc;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  AP.clone = clone;
  const pick = (arr, seed) => arr[Math.abs(seed) % arr.length];
  const hash = (s) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
  const fmtPhone = (p) => { const d = p.replace(/\D/g, ""); return d.length === 11 ? `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7)}` : p; };

  /* ---------- 模拟大模型：规划 ---------- */
  function detectScene(text) {
    let best = null, bestN = 0;
    for (const s of AP.SCENES) { const n = s.kw.reduce((a, k) => a + (text.includes(k) ? 1 : 0), 0); if (n > bestN) { bestN = n; best = s; } }
    return best;
  }
  function detectStyle(text) { for (const [w, s] of COLOR_WORDS) if (text.includes(w)) return s; return null; }
  function detectRatio(text) { if (/9[:：]16|竖屏|全屏|抖音|视频号封面/.test(text)) return "9:16"; if (/1[:：]1|方图|正方/.test(text)) return "1:1"; return "3:4"; }
  function extract(text) {
    const e = {};
    const ph = text.match(/1[3-9]\d{9}|1[3-9]\d[\s-]?\d{4}[\s-]?\d{4}/); if (ph) e.phone = fmtPhone(ph[0]);
    const date = text.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*[日号]?(?:\s*(?:至|到|-|~|—)\s*(\d{1,2})\s*[日号]?)?/); if (date) e.date = date[3] ? `${date[1]} 月 ${date[2]} 日 - ${date[3]} 日` : `${date[1]} 月 ${date[2]} 日`;
    const time = text.match(/(上午|下午|晚上)?\s*(\d{1,2})\s*[点:：]\s*(\d{2})?\s*分?/); if (time && !/\d\s*月/.test(time[0])) e.time = `${time[1] || ""}${time[2]}:${time[3] || "00"}`;
    const price = text.match(/(\d{3,5})\s*(元\s*\/\s*吨|元每吨|块|元)/); if (price) e.price = price[1];
    const price2 = text.match(/(?:立减|直降|减|降)\s*(\d{1,4})\s*元/); if (price2) e.discount = price2[1];
    const spec = text.match(/[ΦφΦ]\s*\d{1,2}\s*[-~至]\s*\d{1,2}|[ΦφΦ]\s*\d{1,2}/); if (spec) e.spec = spec[0].replace(/[φΦ]/, "Φ").replace(/\s/g, "");
    const tons = text.match(/(\d[\d,.]*)\s*(万)?\s*吨/); if (tons) e.tons = `${tons[1]}${tons[2] || ""} 吨`;
    const years = text.match(/(\d{1,2})\s*(周年|年)/); if (years) e.years = years[1];
    const salary = text.match(/(\d{3,5}|\d{1,2}[kK])\s*[-~至]\s*(\d{3,5}|\d{1,2}[kK])/); if (salary) e.salary = `${salary[1]}~${salary[2]}`;
    const base = text.match(/底薪\s*(\d{3,5})/); if (base) e.base = base[1];
    const count = text.match(/招\s*(\d{1,2})\s*[名个位]|(\d{1,2})\s*[名个位]/); if (count) e.count = count[1] || count[2];
    const post = text.match(/(销售|业务员|司机|仓管|会计|文员|采购|经理|叉车工|理货员|客服|行车工)/g); if (post) e.posts = [...new Set(post)];
    const mills = text.match(/(沙钢|永钢|中天|萍钢|方大|马钢|宝钢|鞍钢|首钢|日照|敬业|新兴)/g); if (mills) e.mills = [...new Set(mills)];
    const prods = text.match(/(螺纹钢|盘螺|线材|热卷|冷轧|中厚板|镀锌板|镀锌管|工字钢|H型钢|角钢|槽钢|方管|圆钢|花纹板|彩涂)/g); if (prods) e.prods = [...new Set(prods)];
    const fest = text.match(/(中秋|国庆|春节|新年|元旦|端午|五一|劳动节|元宵|除夕|感恩节)/); if (fest) e.fest = fest[1];
    const place = text.match(/(?:地点|地址|在)\s*([^\s，,。;；]{4,24})/); if (place) e.place = place[1];
    return e;
  }

  const COPY = {
    recruit: (e, b) => ({ eyebrow: `${b.short} · 诚聘英才`, headline: `招聘${e.posts ? e.posts[0] : "钢材销售"}${e.count ? ` ${e.count} 名` : ""}`, sub: [e.base ? `底薪 ${e.base}` : null, "高提成", /五险/.test(e._t) ? "五险" : null, /包住|住宿/.test(e._t) ? "包住" : null].filter(Boolean).join(" · ") || "高薪诚聘 · 待遇优厚", bullets: [/经验/.test(e._t) ? "有钢贸经验优先" : "行业经验不限，带薪培训", /开车|驾照/.test(e._t) ? "会开车加分" : "沟通能力强，责任心好", "上升空间大，师徒带教"], highlight: e.salary ? { label: "月薪", value: e.salary.replace(/k/gi, "K"), unit: "" } : null, cta: "扫码投递简历 / 电话咨询" }),
    promo: (e, b) => ({ eyebrow: `${b.short} · 限时特价`, headline: e.prods ? `${e.prods[0]}${e.spec ? " " + e.spec : ""} 特价` : "本周特价 · 现货直供", sub: [e.tons ? `限量 ${e.tons}` : null, e.date ? `${e.date} 截止` : /周日|周末|截止/.test(e._t) ? "本周日截止" : "先到先得", "现货当天提"].filter(Boolean).join(" · "), bullets: [e.mills ? `钢厂：${e.mills.join(" / ")}` : "一线钢厂 · 质保书齐全", "过磅计重 · 磅差包赔", "宝山库自提 / 可配送"], highlight: e.price ? { label: "特价", value: Number(e.price).toLocaleString("en-US"), unit: "元/吨" } : e.discount ? { label: "每吨立减", value: e.discount, unit: "元" } : { label: "直降", value: "30", unit: "元/吨" }, cta: "扫码锁价 · 电话询价" }),
    festival: (e, b) => { const f = e.fest || "中秋"; const wish = { 中秋: ["花好月圆 · 人和事顺", "月满中秋 · 情满钢城"], 国庆: ["祝祖国繁荣昌盛", "举国同庆 · 共赴新程"], 春节: ["新春大吉 · 生意兴隆", "金龙纳福 · 钢市长虹"], 新年: ["新年新气象 · 携手再出发", "岁岁常欢愉 · 年年皆胜意"], 元旦: ["元启新岁 · 万事顺遂", "新年新气象 · 携手再出发"], 端午: ["粽情端午 · 安康顺遂", "龙舟竞渡 · 一往无前"], 五一: ["致敬每一位劳动者", "劳动最光荣 · 实干赢未来"], 劳动节: ["致敬每一位劳动者", "劳动最光荣 · 实干赢未来"], 元宵: ["灯火可亲 · 团圆美满", "月圆人圆 · 事事圆满"], 除夕: ["辞旧迎新 · 阖家团圆", "岁末感恩 · 来年更好"], 感恩节: ["感恩相伴 · 一路同行", "感谢信任 · 继续同行"] }[f] || ["佳节愉快 · 万事顺遂"]; return { eyebrow: `${b.short} 祝您`, headline: `${f}快乐`, sub: wish[0], bullets: [/客户|相伴|感谢/.test(e._t) ? "感谢新老客户一路相伴" : "愿每一份信任都有回响", `${b.short} 全体同仁 敬祝`], highlight: null, cta: "节后现货照常供应 · 欢迎询价" }; },
    opening: (e, b) => ({ eyebrow: `${b.short}${e.years ? ` · ${e.years} 周年` : " · 盛大开业"}`, headline: e.years ? `${e.years} 周年 感恩钜惠` : "盛大开业 · 感恩钜惠", sub: [e.date ? e.date : null, e.discount ? `当天下单每吨立减 ${e.discount} 元` : "当天下单享专属优惠"].filter(Boolean).join(" · "), bullets: [`${e.years ? e.years + " 年" : "多年"}专注钢材现货 · 感谢一路同行`, "老客户到店有礼", e.place || b.addr], highlight: e.discount ? { label: "每吨立减", value: e.discount, unit: "元" } : null, cta: "扫码预约 · 到店有礼" }),
    intro: (e, b) => ({ eyebrow: `${b.short} · 企业实力`, headline: e.years ? `${e.years} 年专注钢材现货` : "专注钢材现货供应", sub: b.slogan, bullets: [e.tons ? `常备库存 ${e.tons}` : "常备库存充足", e.mills ? `${e.mills.join(" / ")} ${/一级|一代/.test(e._t) ? "一级代理" : "长期合作"}` : "一线钢厂长期协议户", /仓库|库/.test(e._t) ? (e._t.match(/(\d)\s*个仓库/) ? `${e._t.match(/(\d)\s*个仓库/)[1]} 个自营仓库 · 当日提货` : "自营仓库 · 当日提货") : "自营仓库 · 当日提货", "加工配送 · 质保书齐全"], highlight: e.tons ? { label: "常备库存", value: e.tons.replace(" 吨", ""), unit: "吨" } : e.years ? { label: "成立", value: e.years, unit: "年" } : null, cta: "扫码看实时库存" }),
    catalog: (e, b) => ({ eyebrow: `${b.short} · 主营产品`, headline: "主营品种一览", sub: [e.mills ? `钢厂：${e.mills.join(" / ")}` : "一线钢厂", /当日|当天/.test(e._t) ? "当日提货" : "现货充足"].join(" · "), bullets: (e.prods && e.prods.length ? e.prods : ["螺纹钢", "盘螺", "热卷", "中厚板", "镀锌板", "工字钢"]).slice(0, 6), highlight: null, cta: "扫码看完整规格与报价" }),
    honor: (e, b) => ({ eyebrow: `${b.short} · 资质荣誉`, headline: e.mills ? `${e.mills[0]} ${e._t.match(/(\d{4})\s*年/) ? e._t.match(/(\d{4})\s*年/)[1] + " 年度" : ""}优秀代理商` : "荣誉见证实力", sub: "感谢钢厂与客户的信任", bullets: [e.mills ? `${e.mills.join(" / ")} 官方授权` : "一线钢厂官方授权", "质保书齐全 · 一票制", "以诚经营 · 以质取信"], highlight: null, cta: "扫码查看授权证书" }),
    event: (e, b) => ({ eyebrow: `${b.short} · 邀请函`, headline: /订货会/.test(e._t) ? "秋季订货会" : /展会/.test(e._t) ? "展会邀请" : "诚邀莅临", sub: [e.date, e.time].filter(Boolean).join(" ") || "敬请届时光临", bullets: [e.place ? `地点：${e.place}` : `地点：${b.addr}`, "现场签约享专属政策", "凭邀请函到场有礼"], highlight: null, cta: "扫码报名 · 回复确认" }),
    arrival: (e, b) => ({ eyebrow: `${b.short} · 到货通知`, headline: e.prods ? `${e.mills ? e.mills[0] + " " : ""}${e.prods[0]} 到货` : "新货到库", sub: [e.spec ? `规格 ${e.spec}` : null, e.tons ? `共 ${e.tons}` : null, /宝山|库/.test(e._t) ? "宝山库现货" : "现货可提"].filter(Boolean).join(" · "), bullets: ["质保书齐全 · 过磅计重", "当日提货 · 可配送", "欢迎询价锁货"], highlight: e.tons ? { label: "到货", value: e.tons.replace(" 吨", ""), unit: "吨" } : null, cta: "扫码询价 · 电话锁货" }),
    thanks: (e, b) => ({ eyebrow: `${b.short} · 致新老客户`, headline: "感谢一路同行", sub: e._t.match(/(\d{4})\s*年/) ? `${e._t.match(/(\d{4})\s*年/)[1]} 年，因您更好` : "每一份信任，我们都用心对待", bullets: [/当日/.test(e._t) ? "当日提货" : "准时交付", /质保/.test(e._t) ? "质保书齐全" : "正品保障", /磅差/.test(e._t) ? "磅差包赔" : "售后无忧"], highlight: null, cta: "服务承诺 · 扫码联系" }),
    franchise: (e, b) => ({ eyebrow: `${b.short} · 招商合作`, headline: "招募区域分销伙伴", sub: [/无需囤货|不囤货/.test(e._t) ? "无需囤货" : null, /一手/.test(e._t) ? "一手价供货" : "价格优势", /返利/.test(e._t) ? "返利优厚" : null].filter(Boolean).join(" · ") || "共享货源 · 共赢市场", bullets: ["一手货源 · 价格透明", "平台线索共享", "培训与物流支持"], highlight: null, cta: "扫码了解合作政策" }),
    notice: (e, b) => ({ eyebrow: `${b.short} · 通知`, headline: e.fest ? `${e.fest}放假通知` : /调价/.test(e._t) ? "调价通知" : /搬迁/.test(e._t) ? "搬迁公告" : "重要通知", sub: e.date ? `${e.date} 休息` : "请知悉并合理安排", bullets: [e._t.match(/(\d{1,2})\s*[日号]\s*(?:正常)?(?:上班|营业)/) ? `${e._t.match(/(\d{1,2})\s*[日号]\s*(?:正常)?(?:上班|营业)/)[1]} 日正常上班` : "节后正常营业", /预约|电话/.test(e._t) ? "假期可电话预约提货" : "紧急事项请电话联系", "感谢理解与支持"], highlight: null, cta: "如有需要请提前联系" }),
  };

  AP.mockPlan = function (prompt, ctx) {
    const text = (prompt || "").trim();
    const brand = Object.assign({}, AP.defaultBrand, ctx.brand || {});
    const assets = ctx.assets || [];
    const scene = AP.SCENES.find((s) => s.id === ctx.scene) || detectScene(text) || AP.SCENES[4];
    const style = detectStyle(text) || scene.style;
    const e = extract(text); e._t = text;
    const copy = COPY[scene.id](e, brand);
    const logo = assets.find((a) => a.type === "logo");
    const photoPref = { intro: ["仓库", "厂房", "门头", "钢卷"], catalog: ["产品"], arrival: ["产品", "仓库"], honor: ["资质", "授权"], thanks: ["团队", "人物"], recruit: ["团队", "人物", "仓库"], promo: ["产品"], opening: ["门头", "仓库"], event: ["团队"], franchise: ["仓库"], festival: [], notice: [] }[scene.id] || [];
    let photo = null;
    for (const p of photoPref) { photo = assets.find((a) => a.type !== "logo" && (a.tags || []).some((t) => t.includes(p))); if (photo) break; }
    if (!photo && ["intro", "catalog", "arrival", "honor", "recruit"].includes(scene.id)) photo = assets.find((a) => a.type !== "logo") || null;
    let layout = scene.layout; if (photo && ["intro", "honor"].includes(scene.id)) layout = "split"; if (!photo && layout === "split") layout = "hero";
    const st = AP.STYLES[style];
    const spec = {
      scene: scene.id, ratio: ctx.ratio || detectRatio(text), layout, style, palette: clone(st.palette), bgfx: st.bgfx, fontScale: 1, density: 2,
      copy, contact: { company: brand.company, person: brand.person, phone: e.phone || brand.phone, addr: brand.addr },
      assets: { logo: logo ? logo.id : null, photo: photo ? photo.id : null },
      flags: { showQR: true, showLogo: !!logo, showPhone: true, showAddr: ["opening", "event", "intro", "recruit", "notice"].includes(scene.id) },
      visual: { prompt: st.visual, seed: hash(text) % 10000, imageId: null },
      notes: [],
    };
    if (/不要二维码|去掉二维码|无二维码/.test(text)) spec.flags.showQR = false;
    if (!e.phone) spec.notes.push("未在需求中识别到电话，已使用品牌资料中的联系方式");
    if (scene.id === "promo" && !e.price && !e.discount) spec.notes.push("未识别到具体价格，已用占位「直降 30 元/吨」，请在微调中告知真实价格");
    if (scene.id === "recruit" && !e.salary) spec.notes.push("未识别到薪资范围，未展示薪资大字；可说「薪资 8K~15K」补上");
    spec._meta = { sceneName: scene.name, styleName: st.name, detected: e, reason: `识别为「${scene.name}」场景${detectStyle(text) ? `，按你的描述采用「${st.name}」风格` : `，默认采用「${st.name}」风格`}；${photo && layout === "split" ? `选用素材「${photo.name}」作为主视觉，` : ""}版式「${AP.LAYOUT_NAMES[layout]}」。` };
    return spec;
  };

  /* ---------- 模拟大模型：微调 ---------- */
  AP.mockRefine = function (spec0, instr, ctx) {
    const spec = clone(spec0); const changes = []; let regen = false; const t = (instr || "").trim();
    const assets = ctx.assets || [];
    const setStyle = (s) => { if (!AP.STYLES[s] || spec.style === s) return; spec.style = s; spec.palette = clone(AP.STYLES[s].palette); spec.bgfx = AP.STYLES[s].bgfx; spec.visual.prompt = AP.STYLES[s].visual; regen = true; changes.push(`风格改为「${AP.STYLES[s].name}」并重绘背景`); };
    let m;
    if ((m = t.match(/标题(?:改成|改为|换成|叫|写)\s*[「"“『]?([^」"”』]+?)[」"”』]?\s*$/))) { spec.copy.headline = m[1].trim(); changes.push(`标题改为「${spec.copy.headline}」`); }
    if ((m = t.match(/副标题(?:改成|改为|换成)\s*[「"“『]?([^」"”』]+?)[」"”』]?\s*$/))) { spec.copy.sub = m[1].trim(); changes.push(`副标题改为「${spec.copy.sub}」`); }
    if ((m = t.match(/(?:电话|手机|联系方式)(?:改成|改为|换成|是)?\s*(1[3-9]\d[\s-]?\d{4}[\s-]?\d{4})/))) { spec.contact.phone = fmtPhone(m[1]); spec.flags.showPhone = true; changes.push(`电话改为 ${spec.contact.phone}`); }
    if ((m = t.match(/(?:地址|地点)(?:改成|改为|换成|是)\s*([^\s，,。]{4,30})/))) { spec.contact.addr = m[1]; spec.flags.showAddr = true; changes.push(`地址改为「${m[1]}」`); }
    if ((m = t.match(/(?:联系人|姓名|名字)(?:改成|改为|换成|是)\s*([^\s，,。]{2,6})/))) { spec.contact.person = m[1]; changes.push(`联系人改为「${m[1]}」`); }
    if ((m = t.match(/(?:价格|特价|售价)(?:改成|改为|换成|是)?\s*(\d{3,5})/))) { spec.copy.highlight = { label: "特价", value: Number(m[1]).toLocaleString("en-US"), unit: "元/吨" }; changes.push(`价格改为 ${m[1]} 元/吨`); }
    if ((m = t.match(/(?:薪资|工资|月薪)(?:改成|改为|换成|是)?\s*(\d{1,2}[kK]|\d{3,5})\s*[-~至]\s*(\d{1,2}[kK]|\d{3,5})/))) { spec.copy.highlight = { label: "月薪", value: `${m[1]}~${m[2]}`.replace(/k/g, "K"), unit: "" }; changes.push(`薪资改为 ${spec.copy.highlight.value}`); }
    if ((m = t.match(/把\s*[「"“]?(.+?)[」"”]?\s*(?:改成|改为|换成|替换为)\s*[「"“]?(.+?)[」"”]?\s*$/)) && !changes.length) { const [_, a, b] = m; let n = 0; const rep = (s) => (typeof s === "string" && s.includes(a) ? (n++, s.split(a).join(b)) : s); spec.copy.headline = rep(spec.copy.headline); spec.copy.sub = rep(spec.copy.sub); spec.copy.eyebrow = rep(spec.copy.eyebrow); spec.copy.cta = rep(spec.copy.cta); spec.copy.bullets = spec.copy.bullets.map(rep); spec.contact.addr = rep(spec.contact.addr); if (n) changes.push(`将「${a}」替换为「${b}」（${n} 处）`); else changes.push(`未找到「${a}」，已忽略替换`); }
    if (/字(?:体|号)?(?:再)?(?:大|放大|加大)/.test(t)) { spec.fontScale = Math.min(1.4, +(spec.fontScale + 0.12).toFixed(2)); changes.push(`字号放大至 ${Math.round(spec.fontScale * 100)}%`); }
    if (/字(?:体|号)?(?:再)?(?:小|缩小|减小)/.test(t)) { spec.fontScale = Math.max(0.75, +(spec.fontScale - 0.12).toFixed(2)); changes.push(`字号缩小至 ${Math.round(spec.fontScale * 100)}%`); }
    if (/(?:更|再)?(?:简洁|简单|少一点|精简|清爽)/.test(t) && !/丰富/.test(t)) { spec.density = Math.max(1, spec.density - 1); changes.push(`信息密度降为「${["", "简洁", "标准", "丰富"][spec.density]}」`); }
    if (/(?:更|再)?(?:丰富|多一点|详细|饱满)/.test(t)) { spec.density = Math.min(3, spec.density + 1); changes.push(`信息密度升为「${["", "简洁", "标准", "丰富"][spec.density]}」`); }
    if (/(?:去掉|不要|隐藏|删掉|删除)[^，,。]*二维码/.test(t)) { spec.flags.showQR = false; changes.push("隐藏二维码"); } else if (/(?:加|放|显示|要|带)[^，,。]*二维码/.test(t)) { spec.flags.showQR = true; changes.push("显示二维码"); }
    if (/(?:去掉|不要|隐藏|删掉|删除)[^，,。]*(?:地址|地点)/.test(t)) { spec.flags.showAddr = false; changes.push("隐藏地址"); } else if (/(?:加|放|显示|要|带)(?:上|个)?[^，,。]*(?:地址|地点)/.test(t) && !changes.some((c) => c.startsWith("地址改为"))) { spec.flags.showAddr = true; changes.push("显示地址"); }
    if (/(?:去掉|不要|隐藏|删掉|删除)[^，,。]*(?:电话|手机)/.test(t)) { spec.flags.showPhone = false; changes.push("隐藏电话"); }
    if (/(?:去掉|不要|隐藏|删掉|删除)[^，,。]*(?:logo|Logo|LOGO|标志)/.test(t)) { spec.flags.showLogo = false; changes.push("隐藏 Logo"); } else if (/(?:加|放|显示|要|带)[^，,。]*(?:logo|Logo|LOGO|标志)/.test(t)) { spec.flags.showLogo = true; if (!spec.assets.logo) { const l = assets.find((a) => a.type === "logo"); if (l) spec.assets.logo = l.id; } changes.push("显示 Logo"); }
    if (/(?:去掉|不要|隐藏|删掉|删除)[^，,。]*(?:副标题)/.test(t)) { spec.copy.sub = ""; changes.push("去掉副标题"); }
    if (/(?:去掉|不要|隐藏|删掉)[^，,。]*(?:图片|照片|配图)/.test(t)) { spec.assets.photo = null; if (spec.layout === "split") spec.layout = "hero"; changes.push("移除配图"); }
    if ((m = t.match(/(?:用|换成|改用|使用)第\s*([一二三四五六七八九1-9])\s*张/))) { const idx = "一二三四五六七八九".indexOf(m[1]) >= 0 ? "一二三四五六七八九".indexOf(m[1]) : +m[1] - 1; const cand = assets.filter((a) => a.type !== "logo"); if (cand[idx]) { spec.assets.photo = cand[idx].id; if (spec.layout !== "split") { spec.layout = "split"; changes.push("版式改为「上图下文」"); } changes.push(`配图换为「${cand[idx].name}」`); } else changes.push(`素材库中没有第 ${idx + 1} 张图`); }
    else if (/(?:换成|用|使用)[^，,。]*(?:刚上传|最新上传|新上传|上传的)[^，,。]*(?:图|照片)/.test(t)) { const cand = assets.filter((a) => a.type !== "logo" && a.uploaded); const p = cand[cand.length - 1]; if (p) { spec.assets.photo = p.id; if (spec.layout !== "split") spec.layout = "split"; changes.push(`配图换为刚上传的「${p.name}」`); } else changes.push("没有找到新上传的图片"); }
    else if (/(?:加|放|配)(?:上|个|张)?[^，,。]*(?:图片|照片|配图|实拍)/.test(t) && !spec.assets.photo) { const p = assets.find((a) => a.type !== "logo"); if (p) { spec.assets.photo = p.id; spec.layout = "split"; changes.push(`加入配图「${p.name}」，版式改为「上图下文」`); } }
    if (/9[:：]16|竖屏|全屏|抖音/.test(t)) { spec.ratio = "9:16"; changes.push("画幅改为 9:16 竖屏"); regen = true; } else if (/1[:：]1|方图|正方/.test(t)) { spec.ratio = "1:1"; changes.push("画幅改为 1:1 方图"); regen = true; } else if (/3[:：]4|朋友圈/.test(t)) { spec.ratio = "3:4"; changes.push("画幅改为 3:4"); regen = true; }
    if (/换(?:个|一个|种)?(?:版式|排版|布局)/.test(t)) { spec.layout = LAYOUTS[(LAYOUTS.indexOf(spec.layout) + 1) % LAYOUTS.length]; if (spec.layout === "split" && !spec.assets.photo) spec.layout = "list"; changes.push(`版式改为「${AP.LAYOUT_NAMES[spec.layout]}」`); }
    else if ((m = t.match(/(?:版式|排版|布局)(?:改成|改为|换成|用)\s*(大字|上图下文|要点|卡片|居中)/))) { spec.layout = { 大字: "hero", 上图下文: "split", 要点: "list", 卡片: "card", 居中: "card" }[m[1]]; changes.push(`版式改为「${AP.LAYOUT_NAMES[spec.layout]}」`); }
    const sty = detectStyle(t); const negColor = /(?:不要|去掉|别用|不用|别)[^，,。]{0,4}(?:红|蓝|黑|白|金|绿|青|橙|喜庆|商务)/.test(t); if (sty && !negColor) setStyle(sty);
    if (/换(?:个|一个|张)?(?:背景|底图|风格)|背景(?:换|改)/.test(t) && !sty) { const i = STYLE_ORDER.indexOf(spec.style); setStyle(STYLE_ORDER[(i + 1) % STYLE_ORDER.length]); }
    if (/背景(?:更|再)?(?:亮|浅)/.test(t)) { spec.palette.mode === "dark" ? setStyle(spec.style === "festive" ? "paper" : "minimal") : changes.push("背景已是浅色"); }
    if (/背景(?:更|再)?(?:暗|深)/.test(t) && spec.palette.mode === "light") setStyle("business");
    if (/(?:加|多|来)(?:点|些|一点)?(?:金色|粒子|光|装饰|氛围)/.test(t)) { spec.bgfx = spec.bgfx === "confetti" ? "rings" : "confetti"; regen = true; changes.push("背景加入金色粒子装饰"); }
    if (/(?:更|再)(?:好看|高级|精致|专业)一?点?/.test(t) && !changes.length) { setStyle(spec.style === "black" ? "business" : "black"); spec.fontScale = Math.min(1.4, spec.fontScale + 0.05); spec.density = 2; changes.push("收紧信息密度、微调字号层级"); }
    if (/(?:换|改)(?:个|一)?(?:文案|说法|标题)|(?:再|重新)写/.test(t) && !changes.length) { const alt = { promo: ["现货直供 · 本周特价", "限量特价 · 先到先得"], recruit: ["加入我们 · 一起做大生意", "高薪诚聘 · 期待你的加入"], festival: [spec.copy.headline, "佳节安康 · 万事顺遂"], intro: ["深耕钢贸 · 值得托付", "一手货源 · 现货直供"], arrival: ["新货到库 · 现货可提", "刚到 · 抓紧锁货"], thanks: ["因您而更好", "感谢信任 · 继续同行"] }[spec.scene] || [spec.copy.headline + " · 现货直供"]; spec.copy.headline = alt.find((a) => a !== spec.copy.headline) || alt[0]; changes.push(`标题换一种说法：「${spec.copy.headline}」`); }
    if (!changes.length) { spec.visual.seed = (spec.visual.seed + 1) % 10000; regen = true; changes.push("已按你的描述整体微调（原型为规则模拟；正式版由大模型理解任意自然语言指令）"); }
    spec.visual.imageId = regen ? null : spec.visual.imageId;
    const tips = { promo: "要不要把截止日期放大做成倒计时？", recruit: spec.copy.highlight ? "还可以说「换个版式」看看别的排法。" : "可以补一句「薪资 8K~15K」让待遇更醒目。", festival: "想换成竖屏 9:16 发抖音吗？", intro: "可以说「用第二张图」换主视觉。", default: "还可以说「更简洁」「换个背景」「字大一点」。" };
    return { spec, changes, regen, reply: `${changes.join("；")}。${tips[spec.scene] || tips.default}` };
  };

  /* ---------- 渲染引擎 ---------- */
  function qrSvg(seed, size, dark, light) {
    const n = 25; const cells = []; let s = seed || 1; const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    const finder = (x, y) => `<rect x='${x}' y='${y}' width='7' height='7' fill='${dark}'/><rect x='${x + 1}' y='${y + 1}' width='5' height='5' fill='${light}'/><rect x='${x + 2}' y='${y + 2}' width='3' height='3' fill='${dark}'/>`;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const inF = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9); if (!inF && rnd() > 0.55) cells.push(`<rect x='${x}' y='${y}' width='1' height='1'/>`); }
    return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${n} ${n}' width='${size}' height='${size}' shape-rendering='crispEdges'><rect width='${n}' height='${n}' fill='${light}'/><g fill='${dark}'>${cells.join("")}</g>${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}</svg>`;
  }
  function bgLayer(spec, W, H) {
    const p = spec.palette; const g = `linear-gradient(160deg,${p.bg2},${p.bg} 55%,${p.bg})`;
    const fx = {
      glow: `radial-gradient(circle at 82% 8%,${p.accent}55,transparent 32%),radial-gradient(circle at 10% 95%,${p.accent2}33,transparent 35%),${g}`,
      confetti: `radial-gradient(circle at 15% 20%,${p.accent}66 0 6px,transparent 7px),radial-gradient(circle at 80% 30%,${p.accent}55 0 4px,transparent 5px),radial-gradient(circle at 60% 12%,${p.accent2}66 0 5px,transparent 6px),radial-gradient(circle at 30% 70%,${p.accent}44 0 3px,transparent 4px),radial-gradient(circle at 88% 78%,${p.accent2}55 0 6px,transparent 7px),radial-gradient(circle at 50% 50%,${p.accent}22,transparent 60%),${g}`,
      stripes: `repeating-linear-gradient(115deg,transparent 0 ${W * 0.05}px,${p.fg}0a ${W * 0.05}px ${W * 0.056}px),linear-gradient(90deg,${p.accent} 0 ${W * 0.012}px,transparent ${W * 0.012}px),${g}`,
      grid: `linear-gradient(${p.fg}12 1px,transparent 1px),linear-gradient(90deg,${p.fg}12 1px,transparent 1px),radial-gradient(circle at 50% 30%,${p.accent}33,transparent 45%),${g}`,
      rings: `radial-gradient(circle at 85% 15%,transparent 0 ${W * 0.16}px,${p.accent}55 ${W * 0.16}px ${W * 0.163}px,transparent ${W * 0.166}px ${W * 0.24}px,${p.accent}33 ${W * 0.24}px ${W * 0.243}px,transparent ${W * 0.246}px),${g}`,
      paper: `repeating-linear-gradient(0deg,transparent 0 3px,${p.fg}05 3px 4px),radial-gradient(ellipse at 50% 100%,${p.mute}55,transparent 55%),${g}`,
      none: g,
    }[spec.bgfx] || g;
    const size = spec.bgfx === "grid" ? `background-size:${W * 0.06}px ${W * 0.06}px,${W * 0.06}px ${W * 0.06}px,auto,auto;` : "";
    return `<div style="position:absolute;inset:0;background:${fx};${size}"></div>`;
  }
  AP.renderPoster = function (spec, ctx, W) {
    W = W || 1080; const [w0, h0] = AP.RATIOS[spec.ratio] || AP.RATIOS["3:4"]; const H = Math.round((W * h0) / w0);
    const u = (n) => Math.round(n * (W / 1080) * 10) / 10 + "px"; const fs = spec.fontScale || 1; const f = (n) => u(n * fs);
    const p = spec.palette; const c = spec.copy; const assets = ctx.assets || []; const asset = (id) => assets.find((a) => a.id === id);
    const logo = spec.flags.showLogo && asset(spec.assets.logo); const photo = asset(spec.assets.photo);
    const light = p.mode === "light"; const pad = u(64); const font = spec.style === "paper" ? '"Songti SC","STSong","Noto Serif SC",serif' : '-apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
    const bullets = (c.bullets || []).slice(0, spec.density === 1 ? 2 : spec.density === 2 ? 4 : 6);
    const showSub = spec.density >= 1 && c.sub; const showBullets = spec.density >= 2 || spec.layout === "list";
    const tall = spec.ratio === "9:16"; const square = spec.ratio === "1:1";
    const head = `<div style="position:relative;display:flex;justify-content:space-between;align-items:center;padding:${u(56)} ${pad} 0">
      <div style="display:flex;align-items:center;gap:${u(16)}">${logo ? `<img src="${logo.url}" style="width:${u(72)};height:${u(72)};border-radius:${u(16)};object-fit:contain;background:${light ? "transparent" : "rgba(255,255,255,.9)"};padding:${logo.type === "logo" ? 0 : u(4)}">` : `<div style="width:${u(72)};height:${u(72)};border-radius:${u(16)};background:${p.accent};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:${u(38)}">${esc((spec.contact.company || "钢")[0])}</div>`}
        <div><div style="font-size:${u(30)};font-weight:800">${esc(spec.contact.company)}</div><div style="font-size:${u(20)};color:${p.mute};margin-top:${u(4)}">${esc(c.eyebrow || "")}</div></div></div>
      <div style="font-size:${u(20)};color:${p.mute};text-align:right">${esc(ctx.date || new Date().toLocaleDateString("zh-CN"))}</div></div>`;
    const qr = spec.flags.showQR ? `<div style="text-align:center;flex:none"><div style="display:inline-block;background:#fff;padding:${u(10)};border-radius:${u(16)};border:${u(4)} solid ${p.accent}">${qrSvg(hash(spec.contact.phone || "x"), Math.round(W * 0.165), "#111", "#fff")}</div><div style="font-size:${u(20)};color:${p.accent};font-weight:700;margin-top:${u(8)}">扫码联系 · 看实时报价</div></div>` : "";
    const contactBlock = `<div style="flex:1;min-width:0"><div style="font-size:${u(34)};font-weight:900">${esc(spec.contact.person || "")}${spec.contact.person ? " · " : ""}<span style="font-weight:600;font-size:${u(26)};color:${p.mute}">${esc(spec.contact.company.replace(/有限公司|股份有限公司/g, ""))}</span></div>${spec.flags.showPhone ? `<div style="font-size:${u(44)};font-weight:900;letter-spacing:${u(1)};margin-top:${u(8)};font-variant-numeric:tabular-nums;color:${p.accent}">${esc(spec.contact.phone)}</div>` : ""}${spec.flags.showAddr && spec.contact.addr ? `<div style="font-size:${u(22)};color:${p.mute};margin-top:${u(8)}">📍 ${esc(spec.contact.addr)}</div>` : ""}</div>`;
    const foot = `<div style="position:absolute;left:0;right:0;bottom:0;padding:${u(36)} ${pad} ${u(44)};display:flex;align-items:center;gap:${u(28)};background:${light ? p.bg2 : "rgba(0,0,0,.28)"};border-top:1px solid ${light ? "rgba(0,0,0,.06)" : "rgba(255,255,255,.1)"}">${contactBlock}${qr}</div>`;
    const cta = c.cta ? `<div style="display:inline-block;align-self:flex-start;margin-top:${u(28)};padding:${u(14)} ${u(30)};border-radius:${u(999)};background:${p.accent};color:${light || spec.style === "festive" || spec.style === "black" ? "#111" : "#fff"};font-weight:800;font-size:${f(24)}">${esc(c.cta)}</div>` : "";
    const hl = c.highlight ? `<div style="margin-top:${u(28)};display:flex;align-items:baseline;gap:${u(12)}"><span style="font-size:${f(26)};color:${p.mute}">${esc(c.highlight.label)}</span><span style="font-size:${f(tall ? 150 : 128)};font-weight:900;line-height:1;letter-spacing:-${u(3)};color:${p.accent};font-variant-numeric:tabular-nums">${esc(c.highlight.value)}</span><span style="font-size:${f(28)};color:${p.mute}">${esc(c.highlight.unit || "")}</span></div>` : "";
    const bulletList = (style) => showBullets && bullets.length ? `<div style="margin-top:${u(28)};display:grid;gap:${u(12)}">${bullets.map((b, i) => style === "card" ? `<div style="display:flex;align-items:center;gap:${u(16)};padding:${u(20)} ${u(24)};background:${light ? "rgba(0,0,0,.04)" : "rgba(255,255,255,.08)"};border-radius:${u(18)};font-size:${f(28)};font-weight:700"><span style="width:${u(44)};height:${u(44)};border-radius:50%;background:${p.accent};color:${light || spec.style === "festive" || spec.style === "black" ? "#111" : "#fff"};display:flex;align-items:center;justify-content:center;font-size:${u(22)};flex:none">${i + 1}</span>${esc(b)}</div>` : `<div style="display:flex;align-items:center;gap:${u(14)};font-size:${f(28)}"><span style="width:${u(12)};height:${u(12)};border-radius:50%;background:${p.accent};flex:none"></span>${esc(b)}</div>`).join("")}</div>` : "";
    const hSize = (base) => f(c.headline.length > 10 ? base * 0.78 : c.headline.length > 7 ? base * 0.9 : base);
    let body = "";
    const footH = 0.19; const bodyTop = 0.16;
    if (spec.layout === "hero") {
      body = `<div style="position:absolute;left:${pad};right:${pad};top:${Math.round(H * bodyTop)}px;bottom:${Math.round(H * footH)}px;display:flex;flex-direction:column;justify-content:center">
        <div style="font-size:${hSize(tall ? 104 : 92)};font-weight:900;line-height:1.12;letter-spacing:-${u(2)}">${esc(c.headline)}</div>
        ${showSub ? `<div style="font-size:${f(32)};color:${p.mute};margin-top:${u(18)};line-height:1.5">${esc(c.sub)}</div>` : ""}${hl}${bulletList("dot")}${cta}</div>`;
    } else if (spec.layout === "split" && photo) {
      const ph = Math.round(H * (tall ? 0.36 : square ? 0.34 : 0.4));
      body = `<div style="position:absolute;left:0;right:0;top:${Math.round(H * 0.14)}px;height:${ph}px;overflow:hidden"><img src="${photo.url}" style="width:100%;height:100%;object-fit:cover;display:block"><div style="position:absolute;inset:0;background:linear-gradient(180deg,${p.bg}cc,transparent 30%,transparent 65%,${p.bg})"></div></div>
        <div style="position:absolute;left:${pad};right:${pad};top:${Math.round(H * 0.14) + ph - Math.round(H * 0.06)}px;bottom:${Math.round(H * footH)}px;display:flex;flex-direction:column;justify-content:flex-start">
        <div style="font-size:${hSize(tall ? 88 : 76)};font-weight:900;line-height:1.12;letter-spacing:-${u(2)}">${esc(c.headline)}</div>
        ${showSub ? `<div style="font-size:${f(30)};color:${p.mute};margin-top:${u(14)};line-height:1.5">${esc(c.sub)}</div>` : ""}${c.highlight && spec.density >= 2 ? hl : ""}${bulletList("dot")}${spec.density >= 2 ? cta : ""}</div>`;
    } else if (spec.layout === "list") {
      body = `<div style="position:absolute;left:${pad};right:${pad};top:${Math.round(H * bodyTop)}px;bottom:${Math.round(H * footH)}px;display:flex;flex-direction:column;justify-content:center">
        <div style="font-size:${hSize(tall ? 96 : 84)};font-weight:900;line-height:1.12;letter-spacing:-${u(2)}">${esc(c.headline)}</div>
        ${showSub ? `<div style="font-size:${f(30)};color:${p.mute};margin-top:${u(14)};line-height:1.5">${esc(c.sub)}</div>` : ""}${hl}${bulletList("card")}${cta}</div>`;
    } else {
      const cardBg = light ? "#fff" : "rgba(255,255,255,.08)";
      body = `<div style="position:absolute;left:${pad};right:${pad};top:${Math.round(H * (tall ? 0.2 : 0.17))}px;bottom:${Math.round(H * (footH + 0.03))}px;display:flex;align-items:center;justify-content:center">
        <div style="width:100%;padding:${u(64)} ${u(56)};border-radius:${u(36)};background:${cardBg};border:1px solid ${light ? "rgba(0,0,0,.06)" : "rgba(255,255,255,.14)"};text-align:center;box-shadow:0 ${u(30)} ${u(80)} rgba(0,0,0,${light ? ".08" : ".35"});backdrop-filter:blur(6px)">
          <div style="display:inline-block;padding:${u(8)} ${u(22)};border-radius:${u(999)};border:1px solid ${p.accent};color:${p.accent};font-size:${f(22)};letter-spacing:${u(2)}">${esc(c.eyebrow)}</div>
          <div style="font-size:${hSize(tall ? 108 : 96)};font-weight:900;line-height:1.1;margin-top:${u(28)};letter-spacing:-${u(2)}">${esc(c.headline)}</div>
          ${showSub ? `<div style="font-size:${f(34)};color:${p.accent};margin-top:${u(20)};font-weight:700;letter-spacing:${u(2)}">${esc(c.sub)}</div>` : ""}
          ${showBullets && bullets.length ? `<div style="margin-top:${u(30)};font-size:${f(26)};color:${p.mute};line-height:1.9">${bullets.map(esc).join("<br>")}</div>` : ""}${c.highlight ? hl.replace("display:flex", "display:flex;justify-content:center") : ""}${cta}</div></div>`;
    }
    const decoLine = `<div style="position:absolute;left:${pad};top:${Math.round(H * 0.135)}px;width:${u(96)};height:${u(8)};border-radius:${u(4)};background:${p.accent}"></div>`;
    const badge = ctx.watermark === false ? "" : `<div style="position:absolute;right:${pad};top:${Math.round(H * 0.128)}px;font-size:${u(18)};color:${p.mute};opacity:.8">${esc(ctx.badge || "由货袋子 AI 生成")}</div>`;
    return `<div class="ap-poster" style="position:relative;width:${W}px;height:${H}px;overflow:hidden;background:${p.bg};color:${p.fg};font-family:${font};border-radius:inherit">${bgLayer(spec, W, H)}${head}${spec.layout === "split" ? "" : decoLine}${badge}${body}${foot}</div>`;
  };

  AP.STEPS = [
    { k: "understand", t: "理解需求", d: "多模态大模型读取提示词与素材", model: "Seed 2.0 Pro" },
    { k: "plan", t: "设计版式", d: "输出设计 JSON：版式 / 配色 / 文案 / 选图", model: "Seed 2.0 Pro" },
    { k: "visual", t: "生成视觉", d: "图像模型生成无文字背景与氛围", model: "Seedream 5.0" },
    { k: "render", t: "精确排版", d: "渲染引擎绘制文案 / 电话 / 二维码 / Logo", model: "渲染引擎" },
    { k: "qa", t: "质检", d: "溢出 / 对比度 / 敏感词 / 内容安全", model: "规则 + 审核 API" },
  ];
  AP.encode = (spec) => btoa(unescape(encodeURIComponent(JSON.stringify(spec))));
  AP.decode = (s) => JSON.parse(decodeURIComponent(escape(atob(s))));
  AP.quickChips = ["字大一点", "更喜庆", "更商务", "更简洁", "换个背景", "换个版式", "加二维码", "去掉地址", "改成竖屏 9:16", "换一种说法"];
})();
