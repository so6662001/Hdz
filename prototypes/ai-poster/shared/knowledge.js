/* AI 企业经营海报 · 企业资料库（原型）
 * 企业素材库 = 图片库（AP.sampleAssets + 上传）+ 资料库（本文件）。
 * 资料库是"可编辑的企业方案文本"：企业介绍 / 品牌介绍 / 产品介绍 / 服务介绍 / 优势卖点 / 资质荣誉 / 客户案例 / 团队介绍 / 服务承诺。
 * 一条资料 = { id, cat, title, points[](海报直接可用的短句要点), body(长文本, 供大模型理解), tags[], images[](关联图片库素材), facts{}(数字事实) }。
 * 生成时：用户勾选 → 精确引用；未勾选 → 按场景 + 关键词自动检索（正式版为向量检索 RAG），引用结果在海报与对话中标注来源。
 * 原型用 localStorage 持久化（key: ap-kb），PC / H5 共用。
 */
(function () {
  const AP = window.AP; if (!AP) return;
  const KEY = "ap-kb";
  const K = (AP.KB = {});

  // scenes：该类资料默认会被哪些场景自动引用；"*" 表示通用兜底（仅在要点不足时补充）
  K.CATS = [
    { id: "company", name: "企业介绍", icon: "🏭", desc: "成立年限、规模、仓库、库存、定位", scenes: ["intro", "recruit", "franchise", "anniversary", "opening", "event", "expo", "signing", "visit"] },
    { id: "brand", name: "品牌介绍", icon: "✨", desc: "品牌主张、口号、价值观", scenes: ["festival", "solar", "thanks", "anniversary", "team", "testimonial", "reopen"] },
    { id: "product", name: "产品介绍", icon: "🧱", desc: "每个品种一条：规格、钢厂、卖点、适用", scenes: ["newproduct", "arrival", "feature", "catalog", "stock", "promo", "flash", "groupbuy", "clearance", "holidaypromo", "pricenotice", "knowledge"] },
    { id: "service", name: "服务介绍", icon: "🔧", desc: "加工、配送、售后、结算（每项服务一条）", scenes: ["service", "logistics", "processing", "shipping"] },
    { id: "advantage", name: "优势卖点", icon: "🏆", desc: "与同行的差异，一句一个硬指标", scenes: ["intro", "feature", "catalog", "promo", "holidaypromo", "anniversary", "flash", "groupbuy", "opening", "thanks", "testimonial", "franchise", "*"] },
    { id: "honor", name: "资质荣誉", icon: "🏅", desc: "代理授权、认证、获奖", scenes: ["honor", "intro", "signing", "win", "franchise"] },
    { id: "case", name: "客户案例", icon: "🏗️", desc: "项目、品种、吨位、交付表现", scenes: ["case", "win", "testimonial", "visit", "intro"] },
    { id: "team", name: "团队介绍", icon: "👥", desc: "人数、分工、响应承诺", scenes: ["team", "recruit", "visit", "live"] },
    { id: "promise", name: "服务承诺", icon: "🤝", desc: "写进任何海报都不出错的承诺话术", scenes: ["promo", "flash", "arrival", "thanks", "shipping", "logistics", "pricenotice", "holidaypromo", "clearance", "*"] },
  ];
  K.cat = (id) => K.CATS.find((c) => c.id === id) || { id, name: id, icon: "📄", scenes: [] };

  K.DEFAULTS = [
    { id: "kb_company", cat: "company", title: "企业介绍 · 鑫钢贸易", points: ["成立 12 年 · 深耕华东钢材现货", "常备库存 3 万吨 · 宝山 3 个自营仓库", "沙钢 / 永钢 一级代理", "年销量 40 万吨 · 服务客户 2,000+"], body: "上海鑫钢贸易有限公司成立于 2014 年，是沙钢、永钢华东区一级代理商，主营螺纹钢、盘螺、热卷、中厚板、镀锌板管等建筑与工业用钢。公司在上海宝山钢材市场拥有 3 个自营仓库，常备库存 3 万吨，配套开平 / 纵剪 / 剪切加工线与 12 台自有运输车辆，年销量 40 万吨，累计服务钢构、机械、市政、地产等客户 2,000 余家。", tags: ["公司", "简介", "实力", "仓库", "库存"], images: ["ast_ware", "ast_logo"], facts: { years: 12, stock: "3万", warehouses: 3, clients: "2,000+", annual: "40万" } },
    { id: "kb_brand", cat: "brand", title: "品牌介绍 · 鑫钢", points: ["华东现货 · 一手货源 · 当日提货", "不赚差价，赚信任", "每一吨都可追溯 · 每一单都有人跟"], body: "「鑫钢」品牌主张：让买钢材像买日用品一样简单可靠。我们坚持一手货源、透明报价、当日提货，用长期主义经营每一位客户。", tags: ["品牌", "口号", "理念"], images: ["ast_logo"] },
    { id: "kb_prod_rebar", cat: "product", title: "产品 · 螺纹钢 / 盘螺", points: ["沙钢 / 永钢 HRB400E · Φ12-32 全规格", "常备 8,000 吨 · 宝山库当日提", "质保书随车 · 炉号可查", "支持定尺切割 · 配送到工地"], body: "螺纹钢、盘螺为公司核心品种，主供沙钢、永钢 HRB400E，规格 Φ12-32 全覆盖，宝山库常备 8,000 吨，主要面向钢构、市政、地产项目，支持定尺切割与工地直送。", tags: ["螺纹钢", "盘螺", "线材", "建筑钢材"], images: ["ast_rebar"] },
    { id: "kb_prod_coil", cat: "product", title: "产品 · 热卷 / 开平板", points: ["日照 / 鞍钢 Q235B · 1.5-11.75mm", "常备 6,000 吨 · 可开平定尺", "宽度 1250 / 1500 · 表面无锈", "适用钢构 / 机械 / 汽配"], body: "热卷、开平板主供日照、鞍钢 Q235B / Q355B，厚度 1.5-11.75mm，宽度 1250 / 1500，常备 6,000 吨，配套开平线可按尺定做。", tags: ["热卷", "开平板", "中厚板", "中板", "冷轧"], images: ["ast_ware"] },
    { id: "kb_prod_galv", cat: "product", title: "产品 · 镀锌管 / 镀锌板", points: ["热镀锌层 ≥65μm · 锌花均匀", "国标壁厚不缩水 · 每支带钢印", "友发 / 正大 长期协议户", "适用消防 / 幕墙 / 农业大棚"], body: "镀锌管、镀锌板为友发、正大长期协议货源，热镀锌层厚度 ≥65μm，国标壁厚，每支带钢印可追溯，适用于消防、幕墙、农业设施等领域。", tags: ["镀锌管", "镀锌板", "方管", "焊管"], images: [] },
    { id: "kb_service_proc", cat: "service", title: "服务 · 加工", points: ["开平 / 纵剪 / 剪切 / 折弯 / 激光切割", "2 条开平线 · 1 条纵剪线", "24 小时出货 · 来料加工也接", "精度 ±1mm · 按图定尺"], body: "公司配套 2 条开平线、1 条纵剪线及剪切、折弯、激光切割设备，24 小时出货，接受来料加工，定尺精度 ±1mm。", tags: ["加工", "开平", "纵剪", "剪切", "折弯", "切割", "车间", "定尺"], images: ["ast_machine"] },
    { id: "kb_service_ship", cat: "service", title: "服务 · 配送物流", points: ["自有车队 12 台 · 上海全境当日达", "苏州 / 无锡 次日达", "50 吨以上免运费", "装车过磅 · 质保书随车"], body: "自有运输车辆 12 台，上海全境当日达，苏州、无锡次日达，50 吨以上免运费；装车过磅、质保书随车，卸货到位。", tags: ["配送", "物流", "发货", "送货", "装车", "车队", "运费", "出库"], images: ["ast_truck"] },
    { id: "kb_adv", cat: "advantage", title: "优势卖点", points: ["一级代理 · 一手价格", "过磅计重 · 磅差包赔", "当日提货 · 说到就到", "质保书齐全 · 一票制开票"], body: "与同行相比：一级代理拿一手价；全部过磅计重，磅差包赔；宝山三库当日提货；质保书随车、一票制开票。", tags: ["优势", "卖点", "为什么选我们"], images: [] },
    { id: "kb_honor", cat: "honor", title: "资质荣誉", points: ["沙钢 2026 年度优秀代理商", "永钢华东区核心分销商", "ISO9001 质量管理体系认证", "上海市钢贸商会理事单位"], body: "公司为沙钢 2026 年度优秀代理商、永钢华东区核心分销商，通过 ISO9001 质量管理体系认证，是上海市钢贸商会理事单位。", tags: ["资质", "荣誉", "授权", "认证"], images: ["ast_cert"] },
    { id: "kb_case", cat: "case", title: "客户案例", points: ["某新能源电池厂房 · H 型钢 1,800 吨 · 45 天零延误", "某市政道路项目 · 螺纹钢 3,200 吨", "苏州某机械厂 · 合作 3 年复购 46 次", "某地铁站点 · 中厚板 900 吨"], body: "典型案例：某新能源电池厂房项目供货 H 型钢 1,800 吨，45 天分批交付零延误；某市政道路项目供货螺纹钢 3,200 吨；苏州某机械厂连续合作 3 年、复购 46 次；某地铁站点供货中厚板 900 吨。", tags: ["案例", "项目", "工程", "客户"], images: ["ast_site"] },
    { id: "kb_team", cat: "team", title: "团队介绍", points: ["销售团队 18 人 · 平均从业 6 年", "每天 8:00 行情早会", "专属顾问一对一 · 每单跟到底", "7×12 小时电话响应"], body: "销售团队 18 人，平均钢贸从业 6 年，每天 8:00 行情早会；每位客户配专属顾问，从询价到卸货全程跟进，7×12 小时电话响应。", tags: ["团队", "销售", "顾问", "服务"], images: ["ast_team", "ast_visit"] },
    { id: "kb_promise", cat: "promise", title: "服务承诺", points: ["当日提货 · 逾期赔付", "磅差包赔 · 多退少补", "质保书随车 · 假一罚十", "未加工货物 7 天可退换"], body: "服务承诺：当日提货，逾期赔付；过磅计重，磅差包赔、多退少补；质保书随车，假一罚十；未加工货物 7 天内可退换。", tags: ["承诺", "售后", "保障"], images: [] },
  ].map((x) => Object.assign({ builtin: true, updatedAt: new Date(2026, 8, 1).getTime() }, x));

  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } };
  const write = (list) => { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} };
  K.load = () => { const l = read(); return Array.isArray(l) ? l : AP.clone(K.DEFAULTS); };
  K.save = (list) => write(list);
  K.get = (id) => K.load().find((x) => x.id === id);
  K.newId = () => "kb_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  K.upsert = (item) => { const l = K.load(); const i = l.findIndex((x) => x.id === item.id); item.updatedAt = Date.now(); item.points = (item.points || []).map((s) => s.trim()).filter(Boolean); if (i >= 0) l[i] = Object.assign(l[i], item, { builtin: false }); else l.push(Object.assign({ id: K.newId(), tags: [], images: [], points: [] }, item)); write(l); return item; };
  K.remove = (id) => { write(K.load().filter((x) => x.id !== id)); };
  K.reset = () => { localStorage.removeItem(KEY); };
  K.byCat = (list) => K.CATS.map((c) => ({ cat: c, items: (list || K.load()).filter((x) => x.cat === c.id) })).filter((g) => g.items.length);
  K.shortTitle = (it) => it.title.replace(/^(产品|服务介绍|企业介绍|品牌介绍)\s*[·\-：:]\s*/, "");

  /* 模拟"从一段介绍提炼要点"（正式版：Seed 2.0 Lite，输出 ≤4 条、每条 ≤14 字、保留数字） */
  K.distill = (body) => {
    const parts = String(body || "").split(/[。；;，\n]|,(?!\d)/).map((s) => s.trim().replace(/^(公司|我们|鑫钢|上海鑫钢贸易有限公司)?(在|是|为|坚持|拥有|配套|提供|主营|通过)?/, "")).filter((s) => s.length >= 4 && s.length <= 20);
    const scored = parts.map((s, i) => ({ s, i, n: (s.match(/\d/g) || []).length * 2 + (/年|吨|台|家|小时|天|%|≥|一级|当日|认证|代理/.test(s) ? 2 : 0) })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 4).sort((a, b) => a.i - b.i);
    return scored.map(({ s }) => s.replace(/、/g, " / "));
  };

  /* 检索：pick 有值 → 精确引用（manual）；否则按场景 + 关键词打分（auto，模拟向量检索）。
   * 规则：同一类资料只取最相关的一条（产品类按提到的品种匹配，可多条）；自动引用最多 2 条（主营目录可 3 条），宁缺毋滥。 */
  K.retrieve = (sceneId, e, list, pick, text) => {
    list = list || K.load(); e = e || {}; text = text || e._t || "";
    if (pick && pick.length) return { mode: "manual", items: pick.map((id) => list.find((x) => x.id === id)).filter(Boolean) };
    const sc = (AP.SCENES || []).find((x) => x.id === sceneId) || { kw: [], name: "" };
    const hit = (t) => text.includes(t) || sc.name.includes(t) || sc.kw.some((k) => k.includes(t) || t.includes(k));
    const scored = list.map((it) => {
      const c = K.cat(it.cat); let n = 0; const primary = c.scenes.includes(sceneId);
      if (primary) n += 3;
      const tagHits = (it.tags || []).filter(hit).length; n += Math.min(tagHits, 3) * 2;
      if (it.cat === "product") { if (e.prods && e.prods.length) n = (it.tags || []).some((t) => e.prods.includes(t)) ? n + 4 : -9; else if (sceneId !== "catalog") n = -9; }
      if (it.cat === "service" && !tagHits) n -= 3;
      if (it.cat === "case" && e.project) n += 1;
      if (c.scenes.includes("*") && !primary) n = Math.min(n, 1);
      return { it, n };
    }).filter((x) => x.n >= 3).sort((a, b) => b.n - a.n);
    const out = []; const seen = {}; const cap = sceneId === "catalog" ? 3 : 2;
    for (const { it } of scored) { if (it.cat !== "product" && seen[it.cat]) continue; seen[it.cat] = 1; out.push(it); if (out.length >= cap) break; }
    return { mode: out.length ? "auto" : "none", items: out };
  };

  /* 把引用的资料融进文案。提示词里的具体信息永远优先；介绍类场景资料要点靠前，其他场景资料要点排在场景文案之后补位；语义相近的要点去重。
   * 正式版由大模型在规划时直接消化资料文本（RAG 上下文），此处为规则模拟。 */
  const INTRO_SCENES = ["intro", "feature", "catalog", "service", "logistics", "honor", "team", "case", "franchise", "testimonial", "knowledge"];
  const norm = (s) => String(s || "").replace(/[\s·，。,、/／:：+\-~]/g, "");
  const similar = (a, b) => { const x = norm(a), y = norm(b); if (!x || !y) return false; if (x.includes(y) || y.includes(x)) return true; for (let i = 0; i + 4 <= x.length; i++) if (y.includes(x.slice(i, i + 4))) return true; return false; };
  const merge = (lists, cap) => { const out = []; for (const l of lists) for (const b of l || []) { if (!b || out.length >= cap) continue; if (!out.some((o) => similar(o, b))) out.push(b); } return out; };
  K.apply = (copy, items, sceneId, e) => {
    if (!items || !items.length) return;
    const text = (e && e._t) || "";
    const fromPrompt = (b) => { for (let i = 0; i + 3 <= b.length; i++) { const w = b.slice(i, i + 3); if (/^[\u4e00-\u9fa5A-Za-z0-9]+$/.test(w) && text.includes(w)) return true; } return false; };
    const own = copy.bullets || []; const specific = own.filter((b) => /\d/.test(b) || fromPrompt(b)); const generic = own.filter((b) => !specific.includes(b));
    const brand = items.find((it) => it.cat === "brand"); const body = items.filter((it) => it.cat !== "brand");
    const primary = body.filter((it) => K.cat(it.cat).scenes.includes(sceneId)); const rest = body.filter((it) => !primary.includes(it));
    const pPts = primary.flatMap((it) => it.points || []); const rPts = rest.flatMap((it) => it.points || []);
    if (sceneId === "catalog" && !(e && e.prods)) { const prods = items.filter((it) => it.cat === "product").flatMap((it) => K.shortTitle(it).split(/\s*\/\s*/)); if (prods.length >= 2) copy.bullets = merge([prods, rPts], 6); }
    else if (sceneId === "stock") { /* 表格版式：资料不进要点 */ }
    else if (INTRO_SCENES.includes(sceneId) && primary.length) copy.bullets = merge([specific, pPts, rPts, generic], 6);
    else copy.bullets = merge([own, pPts, rPts], 5);
    if (brand) { if (!copy.sub) copy.sub = brand.points[0]; else if (copy.bullets.length < 3) copy.bullets = merge([copy.bullets, [brand.points[0]]], 4); }
    const co = items.find((it) => it.cat === "company");
    if (co && co.facts && !copy.highlight && ["intro", "franchise", "recruit", "opening", "expo", "event"].includes(sceneId)) copy.highlight = co.facts.stock ? { label: "常备库存", value: co.facts.stock, unit: "吨" } : co.facts.years ? { label: "成立", value: String(co.facts.years), unit: "年" } : null;
    if (co && co.facts && sceneId === "intro" && !/\d/.test(copy.headline || "") && co.facts.years) copy.headline = `${co.facts.years} 年专注钢材现货`;
    if (copy.highlight) copy.bullets = (copy.bullets || []).filter((b) => !similar(b, `${copy.highlight.label || ""}${copy.highlight.value || ""}`));
    const cs = items.find((it) => it.cat === "case"); if (cs && sceneId === "testimonial" && !copy.highlight) { const m = (cs.points.join(" ").match(/复购\s*(\d+)\s*次/) || []); if (m[1]) copy.highlight = { label: "复购", value: m[1], unit: "次" }; }
  };
})();
