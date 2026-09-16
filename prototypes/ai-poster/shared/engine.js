/* AI 企业经营海报 · 原型引擎
 * - GROUPS / SCENES / STYLES：场景库（6 大类 36 场景）与风格库
 * - mockPlan(prompt, ctx)：模拟"多模态大模型规划"，输出设计 JSON（正式版由 ModelGateway.plan 替换）
 * - mockRefine(spec, instruction, ctx)：模拟"微调指令 → JSON Patch"（正式版由 ModelGateway.refine 替换）
 * - renderPoster(spec, ctx, width)：渲染引擎（前后端共用），7 种版式 × 3 种画幅，输出 HTML 字符串
 * 说明：原型中的"大模型"为规则模拟，仅用于演示交互与版式；精确信息（电话/价格/企业名）始终由引擎排版，不经过图像模型。
 */
(function () {
  const AP = (window.AP = {});

  /* ---------- 品牌与素材（演示默认值） ---------- */
  AP.defaultBrand = { company: "上海鑫钢贸易有限公司", short: "鑫钢贸易", slogan: "华东现货 · 一手货源 · 当日提货", person: "王建国", phone: "138 0000 8888", addr: "上海宝山钢材市场 A 区 12 号", color: "#1f5eff" };

  const svg = (s) => "data:image/svg+xml;utf8," + encodeURIComponent(s);
  const ph = (w, h, bg, draw) => svg(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'><rect width='${w}' height='${h}' fill='${bg}'/>${draw}</svg>`);
  AP.sampleAssets = [
    { id: "ast_logo", type: "logo", name: "企业 Logo", tags: ["logo", "透明底"], url: svg(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' rx='40' fill='#1f5eff'/><text x='100' y='128' font-size='96' font-weight='900' text-anchor='middle' fill='#fff' font-family='PingFang SC,Microsoft YaHei,sans-serif'>鑫</text></svg>`) },
    { id: "ast_ware", type: "photo", name: "仓库实拍", tags: ["仓库", "钢卷", "现场"], url: ph(800, 600, "#2a3140", `<defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#3b4557'/><stop offset='1' stop-color='#141a24'/></linearGradient></defs><rect width='800' height='600' fill='url(#g)'/><g fill='#6b7a90'><ellipse cx='200' cy='420' rx='150' ry='150'/><ellipse cx='460' cy='430' rx='140' ry='140'/><ellipse cx='690' cy='440' rx='120' ry='120'/></g><g fill='#2a3242'><ellipse cx='200' cy='420' rx='60' ry='60'/><ellipse cx='460' cy='430' rx='55' ry='55'/><ellipse cx='690' cy='440' rx='48' ry='48'/></g><rect y='560' width='800' height='40' fill='#0d1117'/><g stroke='#8b98ad' stroke-width='6' opacity='.5'><line x1='0' y1='90' x2='800' y2='90'/><line x1='120' y1='0' x2='120' y2='90'/><line x1='400' y1='0' x2='400' y2='90'/><line x1='680' y1='0' x2='680' y2='90'/></g>`) },
    { id: "ast_rebar", type: "photo", name: "螺纹钢产品", tags: ["产品", "螺纹钢"], url: ph(800, 600, "#1b1f27", `<g transform='rotate(-18 400 300)'>${Array.from({ length: 9 }, (_, i) => `<rect x='-100' y='${120 + i * 44}' width='1000' height='26' rx='13' fill='${i % 2 ? "#6f5a45" : "#8a6f52"}'/><rect x='-100' y='${126 + i * 44}' width='1000' height='6' rx='3' fill='#b08c66' opacity='.6'/>`).join("")}</g>`) },
    { id: "ast_truck", type: "photo", name: "装车发货", tags: ["发货", "装车", "现场", "物流"], url: ph(800, 600, "#4a5568", `<rect y='420' width='800' height='180' fill='#2d3748'/><rect x='80' y='250' width='520' height='170' rx='10' fill='#c53030'/><rect x='600' y='300' width='150' height='120' rx='12' fill='#e53e3e'/><rect x='620' y='315' width='90' height='50' rx='6' fill='#bee3f8'/><g fill='#8a6f52'>${Array.from({ length: 6 }, (_, i) => `<rect x='${100 + i * 80}' y='210' width='64' height='40' rx='6'/>`).join("")}</g><circle cx='180' cy='430' r='46' fill='#111'/><circle cx='480' cy='430' r='46' fill='#111'/><circle cx='690' cy='430' r='46' fill='#111'/><rect x='0' y='60' width='800' height='30' fill='#f6ad55' opacity='.6'/><rect x='300' y='0' width='40' height='250' fill='#a0aec0'/>`) },
    { id: "ast_machine", type: "photo", name: "加工车间", tags: ["加工", "车间", "现场", "开平"], url: ph(800, 600, "#1a202c", `<rect x='60' y='200' width='680' height='260' rx='16' fill='#4a5568'/><rect x='100' y='240' width='600' height='40' fill='#2d3748'/><circle cx='200' cy='380' r='70' fill='#718096'/><circle cx='200' cy='380' r='30' fill='#2d3748'/><rect x='300' y='330' width='400' height='24' fill='#cbd5e0'/><rect x='300' y='370' width='400' height='8' fill='#f6ad55'/><g fill='#f6e05e' opacity='.9'><circle cx='560' cy='320' r='5'/><circle cx='590' cy='300' r='4'/><circle cx='540' cy='295' r='3'/></g><rect y='460' width='800' height='140' fill='#0d1117'/>`) },
    { id: "ast_visit", type: "photo", name: "客户接待", tags: ["接待", "客户", "人物", "现场"], url: ph(800, 600, "#3b4557", `<rect y='0' width='800' height='320' fill='#2a3140'/><g fill='#6b7a90'><ellipse cx='150' cy='300' rx='120' ry='120'/><ellipse cx='400' cy='300' rx='110' ry='110'/><ellipse cx='650' cy='300' rx='110' ry='110'/></g><g><circle cx='330' cy='330' r='40' fill='#e2c9a8'/><rect x='285' y='372' width='90' height='200' rx='30' fill='#1a365d'/><circle cx='450' cy='340' r='40' fill='#e2c9a8'/><rect x='405' y='382' width='90' height='190' rx='30' fill='#2b6cb0'/><circle cx='560' cy='335' r='38' fill='#e2c9a8'/><rect x='517' y='375' width='86' height='195' rx='30' fill='#4a5568'/></g><rect y='570' width='800' height='30' fill='#0d1117'/>`) },
    { id: "ast_site", type: "photo", name: "工程现场", tags: ["工程", "案例", "工地", "现场"], url: ph(800, 600, "#a0aec0", `<rect y='0' width='800' height='300' fill='#bee3f8'/><g fill='#718096'>${Array.from({ length: 5 }, (_, i) => `<rect x='${60 + i * 150}' y='${180 - i * 20}' width='110' height='${420 + i * 20}'/>`).join("")}</g><g stroke='#e53e3e' stroke-width='10'><line x1='100' y1='60' x2='700' y2='60'/><line x1='700' y1='60' x2='700' y2='240'/></g><g fill='#2d3748'>${Array.from({ length: 12 }, (_, i) => `<rect x='${70 + (i % 4) * 80}' y='${360 + Math.floor(i / 4) * 70}' width='40' height='40'/>`).join("")}</g><rect y='560' width='800' height='40' fill='#4a5568'/>`) },
    { id: "ast_cert", type: "cert", name: "代理授权书", tags: ["资质", "授权"], url: ph(600, 800, "#f7f1e3", `<rect x='30' y='30' width='540' height='740' fill='none' stroke='#c9a14a' stroke-width='8'/><text x='300' y='180' font-size='44' text-anchor='middle' fill='#8a2b1d' font-weight='900' font-family='Songti SC,serif'>授权证书</text><g fill='#7a7a7a'>${Array.from({ length: 9 }, (_, i) => `<rect x='90' y='${260 + i * 40}' width='${420 - (i % 3) * 60}' height='12' rx='6'/>`).join("")}</g><circle cx='440' cy='680' r='60' fill='none' stroke='#c8102e' stroke-width='6' opacity='.8'/>`) },
    { id: "ast_team", type: "photo", name: "团队合影", tags: ["人物", "团队"], url: ph(800, 600, "#dfe6f0", `<g fill='#2f3a4f'>${[120, 260, 400, 540, 680].map((x, i) => `<circle cx='${x}' cy='${250 + (i % 2) * 20}' r='48'/><rect x='${x - 90}' y='${300 + (i % 2) * 20}' width='180' height='300' rx='60'/>`).join("")}</g>`) },
  ];

  /* ---------- 场景库：6 大类 36 场景 ---------- */
  AP.GROUPS = [
    { id: "supply", name: "产品与货源", desc: "新品 / 到货 / 卖点 / 目录 / 库存表 / 加工 / 配送" },
    { id: "site", name: "现场与实力", desc: "发货 / 加工 / 接待 / 案例 / 实力 / 资质 / 签约 / 团队" },
    { id: "promo", name: "促销活动", desc: "特价 / 节假日 / 周年庆 / 秒杀 / 清仓 / 拼单 / 开业" },
    { id: "brand", name: "品牌与关系", desc: "节日 / 节气日签 / 感谢 / 见证 / 喜报 / 邀请 / 展会 / 直播" },
    { id: "hr", name: "人才与招商", desc: "招聘 / 招商合作" },
    { id: "notice", name: "通知与提醒", desc: "公告 / 调价 / 天气 / 开工 / 科普" },
  ];
  // photos：主视觉偏好标签（按顺序找）；multi：多图版式取几张
  AP.SCENES = [
    // 产品与货源
    { id: "newproduct", g: "supply", name: "新品上市", icon: "🆕", kw: ["新品", "新产品", "上市", "首发", "新规格", "新材质", "新到品种", "试样"], layout: "split", style: "tech", tag: "NEW", photos: ["产品", "钢卷"], example: "新品上市：新到宝钢 SPHC 热轧酸洗板 2.0-6.0mm，表面无氧化皮，适合汽配冲压，欢迎试样" },
    { id: "arrival", g: "supply", name: "到货通知", icon: "🚚", kw: ["到货", "新到", "进货", "补货", "刚到", "到库"], layout: "hero", style: "industrial", photos: ["产品", "仓库"], example: "今天新到沙钢螺纹钢 Φ16-25 共 800 吨，宝山库现货，欢迎询价" },
    { id: "feature", g: "supply", name: "产品特色", icon: "⭐", kw: ["特色", "卖点", "优势", "特点", "区别", "为什么选", "好在哪"], layout: "split", style: "minimal", photos: ["产品"], example: "推广我们的镀锌管卖点：热镀锌层厚≥65μm、锌花均匀、每支带钢印、国标壁厚不缩水" },
    { id: "catalog", g: "supply", name: "主营目录", icon: "📋", kw: ["目录", "品种", "规格表", "主营", "经营范围"], layout: "list", style: "minimal", example: "主营产品：螺纹钢、盘螺、热卷、中厚板、镀锌板、工字钢，钢厂沙钢永钢中天，宝山库当日提" },
    { id: "stock", g: "supply", name: "库存资源表", icon: "📊", kw: ["库存表", "资源表", "今日库存", "现货表", "报价单", "今日报价", "库存报价"], layout: "table", style: "minimal", example: "今日库存表：螺纹钢 Φ12-25 沙钢 3690，盘螺 Φ8-10 永钢 3750，热卷 3.0-11.75 日照 3810，中厚板 Q235B 鞍钢 3820，宝山库当日提" },
    { id: "service", g: "supply", name: "加工服务", icon: "🔧", kw: ["加工服务", "剪切", "开平", "纵剪", "折弯", "切割", "激光", "来料加工", "定尺"], layout: "list", style: "industrial", photos: ["加工", "车间"], example: "加工服务：开平、纵剪、剪切、折弯、激光切割，24 小时出货，来料加工也接" },
    { id: "logistics", g: "supply", name: "物流配送", icon: "🛻", kw: ["配送", "送货", "物流", "运费", "专线", "车队", "时效", "当日达"], layout: "hero", style: "business", photos: ["物流", "发货"], example: "送货服务升级：上海全境当日达，苏州无锡次日达，50 吨以上免运费，自有车队 12 台" },
    // 现场与实力
    { id: "shipping", g: "site", name: "仓库发货现场", icon: "📦", kw: ["发货现场", "装车", "出库", "仓库现场", "今日发货", "吊装", "发往", "发货", "卸车", "卸完", "实拍", "到工地"], layout: "photo", style: "industrial", tag: "现场直击", photos: ["发货", "装车", "仓库"], multi: 3, example: "今天宝山库发货现场，8 车 320 吨螺纹钢发往苏州工地，装车实拍" },
    { id: "processing", g: "site", name: "加工现场", icon: "⚙️", kw: ["加工现场", "开平中", "切割中", "正在加工", "生产现场", "车间", "加工进行中", "进行中", "交付"], layout: "photo", style: "industrial", tag: "加工现场", photos: ["加工", "车间"], multi: 3, example: "加工现场：客户 2000 吨热卷开平纵剪进行中，明早全部交付" },
    { id: "visit", g: "site", name: "客户接待", icon: "🤝", kw: ["接待", "陪同", "参观", "来访", "考察", "陪逛", "带客户", "到访", "莅临", "看货"], layout: "gallery", style: "business", tag: "客户来访", photos: ["接待", "客户", "人物"], multi: 3, example: "今天陪同江苏某钢构客户参观宝山仓库，实地看货验货，当场敲定 500 吨" },
    { id: "case", g: "site", name: "工程案例", icon: "🏗️", kw: ["案例", "项目供货", "供应了", "中标供货", "大桥", "大厦", "地铁", "厂房项目", "供货案例", "项目"], layout: "gallery", style: "business", tag: "工程案例", photos: ["工程", "工地", "案例"], multi: 3, example: "工程案例：为某新能源电池厂房项目供货 H 型钢 1800 吨，45 天分批交付零延误" },
    { id: "intro", g: "site", name: "企业实力", icon: "🏭", kw: ["介绍", "实力", "公司简介", "关于我们", "成立", "常备库存", "自营仓库", "一级代理"], layout: "split", style: "industrial", photos: ["仓库", "钢卷", "现场"], example: "企业实力介绍：成立 12 年，常备库存 3 万吨，沙钢永钢一级代理，宝山 3 个仓库，当日提货" },
    { id: "honor", g: "site", name: "资质荣誉", icon: "🏅", kw: ["资质", "荣誉", "授权", "证书", "认证", "获评", "荣获"], layout: "split", style: "paper", photos: ["资质", "授权"], example: "荣获沙钢 2026 年度优秀代理商，晒授权证书，稳重一点" },
    { id: "signing", g: "site", name: "签约合作", icon: "✍️", kw: ["签约", "战略合作", "合作协议", "达成合作", "签署", "授牌", "签订"], layout: "photo", style: "black", tag: "战略合作", photos: ["接待", "人物", "团队"], example: "与永钢集团签署 2027 年度战略合作协议，年供货 5 万吨" },
    { id: "team", g: "site", name: "团队风采", icon: "👥", kw: ["团队", "员工", "团建", "风采", "全体", "合影", "晨会", "培训"], layout: "gallery", style: "business", tag: "团队风采", photos: ["团队", "人物"], multi: 3, example: "鑫钢销售团队晨会，新的一天从行情开始，为客户找到最合适的货" },
    // 促销活动
    { id: "promo", g: "promo", name: "特价促销", icon: "🔥", kw: ["促销", "特价", "优惠", "降价", "让利", "抢购", "低价", "特惠"], layout: "hero", style: "festive", photos: ["产品"], example: "本周螺纹钢 Φ12-25 特价 3690 元/吨，限 500 吨，周日截止，现货当天提" },
    { id: "holidaypromo", g: "promo", name: "节假日促销", icon: "🎁", kw: ["国庆钜惠", "中秋特惠", "节日特惠", "假日促销", "节日优惠", "双节", "元旦促销", "春节备货", "开年特惠", "节前备货", "五一特惠", "端午特惠"], layout: "hero", style: "festive", tag: "节日特惠", example: "国庆钜惠：10 月 1 日至 7 日下单，每吨立减 20 元，满 100 吨再送运费" },
    { id: "anniversary", g: "promo", name: "周年庆促销", icon: "🎂", kw: ["周年庆", "周年", "店庆", "感恩回馈", "庆典"], layout: "hero", style: "black", tag: "周年庆", example: "鑫钢 10 周年庆：10 月 18 日至 20 日，全场每吨立减 30 元，老客户加赠加工费" },
    { id: "flash", g: "promo", name: "限时秒杀", icon: "⏰", kw: ["秒杀", "倒计时", "限时", "今日限", "仅剩", "最后", "一口价", "抢"], layout: "hero", style: "festive", tag: "限时", example: "限时秒杀：今天 14 点至 18 点，Φ12 螺纹钢 200 吨 3650 一口价，仅剩 4 小时" },
    { id: "clearance", g: "promo", name: "清仓甩货", icon: "🏷️", kw: ["清仓", "甩货", "尾货", "非标", "降价处理", "库存处理", "处理"], layout: "list", style: "industrial", tag: "清仓", example: "库存清仓：非标热卷 120 吨、短尺螺纹 60 吨、锈蚀中板 40 吨，低于市场价 100 处理，欢迎看货" },
    { id: "groupbuy", g: "promo", name: "拼单团购", icon: "🧲", kw: ["拼单", "团购", "凑单", "拼车", "凑量", "凑满", "直发", "已拼"], layout: "list", style: "green", tag: "拼单直发", example: "拼单直发：永钢螺纹钢凑满 300 吨钢厂直发，每吨比市场低 40，已拼 180 吨，还差 120 吨" },
    { id: "opening", g: "promo", name: "开业乔迁", icon: "🎊", kw: ["开业", "乔迁", "新店", "盛大", "新仓", "启用"], layout: "hero", style: "festive", example: "宝山新仓库 10 月 18 日启用，开业当天下单每吨立减 30 元，欢迎老客户光临" },
    // 品牌与关系
    { id: "festival", g: "brand", name: "节日祝福", icon: "🎉", kw: ["中秋", "国庆", "春节", "新年", "元旦", "端午", "五一", "劳动节", "祝福", "佳节", "元宵", "除夕", "感恩节", "快乐"], layout: "card", style: "festive", example: "中秋节祝福海报，感谢客户一路相伴，喜庆一点" },
    { id: "solar", g: "brand", name: "节气日签", icon: "🍃", kw: ["节气", "日签", "早安", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至", "小寒", "大寒"], layout: "card", style: "paper", example: "白露节气日签，一句早安，提醒客户早晚温差大注意身体" },
    { id: "thanks", g: "brand", name: "客户感谢", icon: "💐", kw: ["感谢", "致谢", "感恩", "服务承诺", "承诺", "回馈"], layout: "card", style: "business", example: "感谢新老客户 2026 年的支持，承诺当日提货、质保书齐全、磅差包赔" },
    { id: "testimonial", g: "brand", name: "客户见证", icon: "💬", kw: ["好评", "见证", "评价", "客户说", "回头客", "感谢信", "复购", "口碑"], layout: "card", style: "minimal", tag: "客户见证", example: "客户见证：合作 3 年的苏州某机械厂说「鑫钢的货从来没让我们停过线」，复购 46 次" },
    { id: "win", g: "brand", name: "中标喜报", icon: "🏆", kw: ["喜报", "中标", "成交", "签下", "突破", "大单", "捷报", "再下一城"], layout: "card", style: "festive", tag: "喜报", example: "喜报：成功中标某市政道路项目钢材供应，供货 3200 吨" },
    { id: "event", g: "brand", name: "活动邀请", icon: "📅", kw: ["邀请", "邀请函", "论坛", "沙龙", "会议", "订货会", "答谢会", "年会"], layout: "card", style: "black", example: "邀请老客户参加 10 月 20 日下午 2 点的秋季订货会，地点宝山钢材市场 3 楼会议室" },
    { id: "expo", g: "brand", name: "展会现场", icon: "🎪", kw: ["展会", "参展", "展位", "展台", "博览会", "展馆", "号馆", "钢铁展", "国际展", "现场有礼"], layout: "photo", style: "tech", tag: "展会现场", photos: ["接待", "团队", "人物"], example: "我们在上海国际钢铁展 3 号馆 B12 展位，欢迎莅临，现场有礼" },
    { id: "live", g: "brand", name: "直播预告", icon: "📺", kw: ["直播", "视频号", "开播", "预告", "看货直播", "直播间"], layout: "card", style: "tech", tag: "直播预告", example: "今晚 8 点视频号直播，带大家逛宝山库，现场报价，直播间下单每吨减 10" },
    // 人才与招商
    { id: "recruit", g: "hr", name: "招聘", icon: "🧑‍💼", kw: ["招聘", "招人", "诚聘", "岗位", "薪", "招销售", "招司机", "招业务"], layout: "list", style: "business", example: "招 5 名钢材销售，底薪 6000 加高提成，五险包住，有钢贸经验优先，电话 138 0000 8888" },
    { id: "franchise", g: "hr", name: "招商合作", icon: "🤲", kw: ["招商", "加盟", "代理商", "分销", "合伙", "招募"], layout: "hero", style: "black", example: "招募区域分销合作伙伴，无需囤货，一手价供货，返利政策优厚" },
    // 通知与提醒
    { id: "notice", g: "notice", name: "通知公告", icon: "📢", kw: ["通知", "公告", "放假", "搬迁", "停业", "上班", "营业时间", "休息"], layout: "card", style: "minimal", example: "国庆放假通知：10 月 1 日至 3 日休息，4 日正常上班，假期可电话预约提货" },
    { id: "pricenotice", g: "notice", name: "调价通知", icon: "📈", kw: ["调价", "涨价", "价格调整", "上调", "下调", "价格通知", "锁价"], layout: "card", style: "business", tag: "调价", example: "调价通知：受钢厂上调影响，明日起螺纹钢每吨上调 30 元，今日锁价仍按现价执行" },
    { id: "weather", g: "notice", name: "天气提醒", icon: "🌧️", kw: ["天气", "降温", "台风", "暴雨", "大雪", "高温", "大风", "路况", "预警", "雨天", "路滑", "照常", "注意安全"], layout: "card", style: "business", tag: "温馨提醒", example: "台风预警：明天上海大风暴雨，宝山库照常发货，工地请提前安排卸货，注意安全" },
    { id: "reopen", g: "notice", name: "开工大吉", icon: "🧧", kw: ["开工", "复工", "开门", "开市", "开张", "到岗"], layout: "card", style: "festive", example: "正月初八开工大吉，鑫钢全体到岗，现货充足，新年开单有礼" },
    { id: "knowledge", g: "notice", name: "知识科普", icon: "📚", kw: ["科普", "知识", "怎么看", "如何辨别", "选购", "什么是", "小知识", "教你", "误区"], layout: "list", style: "minimal", tag: "钢材小课堂", example: "科普：三分钟教你看螺纹钢质保书，钢厂、炉号、力学性能三处对不上就要小心" },
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
  const LAYOUTS = ["hero", "split", "list", "card", "photo", "gallery", "table"];
  AP.LAYOUT_NAMES = { hero: "主视觉大字", split: "上图下文", list: "标题 + 要点卡", card: "居中卡片", photo: "全图实拍", gallery: "多图拼贴", table: "表格清单" };
  const NEED_PHOTO = ["split", "photo", "gallery"];
  AP.RATIOS = { "3:4": [1080, 1440], "9:16": [1080, 1920], "1:1": [1080, 1080] };

  /* ---------- 工具 ---------- */
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  AP.esc = esc;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  AP.clone = clone;
  const hash = (s) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
  const fmtPhone = (p) => { const d = p.replace(/\D/g, ""); return d.length === 11 ? `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7)}` : p; };
  const fmtN = (n) => Number(String(n).replace(/,/g, "")).toLocaleString("en-US");
  const has = (t, re) => re.test(t);

  /* ---------- 模拟大模型：规划 ---------- */
  function detectScene(text) {
    // 节日 + 促销词 → 节假日促销；周年 + 促销词 → 周年庆
    if (/中秋|国庆|春节|新年|元旦|端午|五一|双节|开年|节前/.test(text) && /促销|特惠|钜惠|优惠|立减|活动|让利|备货/.test(text)) return AP.SCENES.find((s) => s.id === "holidaypromo");
    if (/周年|店庆/.test(text)) return AP.SCENES.find((s) => s.id === "anniversary");
    if (/招\s*[一二两三四五六七八九十\d]+\s*[名个位]/.test(text)) return AP.SCENES.find((s) => s.id === "recruit");
    let best = null, bestN = 0;
    for (const s of AP.SCENES) { const n = s.kw.reduce((a, k) => a + (text.includes(k) ? (k.length >= 4 ? 3 : k.length >= 3 ? 2 : 1) : 0), 0); if (n > bestN) { bestN = n; best = s; } }
    return best;
  }
  function detectStyle(text) { for (const [w, s] of COLOR_WORDS) if (text.includes(w)) return s; return null; }
  function detectRatio(text) { if (/9[:：]16|竖屏|全屏|抖音|视频号封面/.test(text)) return "9:16"; if (/1[:：]1|方图|正方/.test(text)) return "1:1"; return "3:4"; }
  function extract(text) {
    const e = {};
    let m;
    if ((m = text.match(/1[3-9]\d{9}|1[3-9]\d[\s-]?\d{4}[\s-]?\d{4}/))) e.phone = fmtPhone(m[0]);
    if ((m = text.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*[日号]?(?:\s*(?:至|到|-|~|—)\s*(?:(\d{1,2})\s*月\s*)?(\d{1,2})\s*[日号]?)?/))) e.date = m[4] ? `${m[1]} 月 ${m[2]} 日 - ${m[3] ? m[3] + " 月 " : ""}${m[4]} 日` : `${m[1]} 月 ${m[2]} 日`;
    if ((m = text.match(/(今晚|今天|明天|后天|明日|今日)?\s*(上午|下午|晚上|晚)?\s*(\d{1,2})\s*[点:：]\s*(\d{2})?\s*分?(?:\s*(?:至|到|-|~)\s*(\d{1,2})\s*[点:：]?\s*(\d{2})?)?/))) e.time = `${m[1] || ""}${m[2] ? m[2].replace("晚", "晚上") : ""} ${m[3]}:${m[4] || "00"}${m[5] ? ` - ${m[5]}:${m[6] || "00"}` : ""}`.trim();
    if ((m = text.match(/(\d{3,5})\s*(?:元\s*\/\s*吨|元每吨|一口价|块|元)/))) e.price = m[1];
    if ((m = text.match(/(?:立减|直降|减|降|低|上调|下调|涨|优惠)\s*(\d{1,4})\s*(?:元)?/))) e.delta = m[1];
    if ((m = text.match(/(\d{1,2})\s*折/))) e.discount = m[1];
    if ((m = text.match(/[ΦφΦ]\s*\d{1,2}\s*[-~至]\s*\d{1,2}|[ΦφΦ]\s*\d{1,2}|\d+(?:\.\d+)?\s*[-~]\s*\d+(?:\.\d+)?\s*mm/))) e.spec = m[0].replace(/[φΦ]/, "Φ").replace(/\s/g, "");
    const tons = [...text.matchAll(/(\d[\d,.]*)\s*(万)?\s*吨/g)].map((x) => `${x[1]}${x[2] || ""}`); if (tons.length) { e.tons = tons[0] + " 吨"; e.tonsAll = tons; }
    if ((m = text.match(/(\d{1,2})\s*车/))) e.trucks = m[1];
    if ((m = text.match(/(\d{1,3})\s*(?:周年|年(?!度))/))) e.years = m[1];
    if ((m = text.match(/(\d{4})\s*年/))) e.year = m[1];
    if ((m = text.match(/(\d{3,5}|\d{1,2}[kK])\s*[-~至]\s*(\d{3,5}|\d{1,2}[kK])(?!\s*mm)/))) e.salary = `${m[1]}~${m[2]}`;
    if ((m = text.match(/底薪\s*(\d{3,5})/))) e.base = m[1];
    if ((m = text.match(/招\s*([一二两三四五六七八九十\d]{1,2})\s*[名个位]|([一二两三四五六七八九十\d]{1,2})\s*[名个位]/))) { const cn = { 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 }; const v = m[1] || m[2]; e.count = String(cn[v] || v); }
    if ((m = text.match(/(销售|业务员|司机|仓管|会计|文员|采购|经理|叉车工|理货员|客服|行车工)/g))) e.posts = [...new Set(m)];
    if ((m = text.match(/(沙钢|永钢|中天|萍钢|方大|马钢|宝钢|鞍钢|首钢|日照|敬业|新兴|宝武|柳钢|三钢)/g))) e.mills = [...new Set(m)];
    if ((m = text.match(/(螺纹钢|盘螺|线材|热卷|冷轧|中厚板|中板|镀锌板|镀锌管|工字钢|H\s?型钢|角钢|槽钢|方管|圆钢|花纹板|彩涂|酸洗板|无缝管|焊管)/g))) e.prods = [...new Set(m.map((x) => x.replace(/\s/g, "")))];
    if ((m = text.match(/(中秋|国庆|春节|新年|元旦|端午|五一|劳动节|元宵|除夕|感恩节|双节)/))) e.fest = m[1];
    if ((m = text.match(/(立春|雨水|惊蛰|春分|清明|谷雨|立夏|小满|芒种|夏至|小暑|大暑|立秋|处暑|白露|秋分|寒露|霜降|立冬|小雪|大雪|冬至|小寒|大寒)/))) e.solar = m[1];
    if ((m = text.match(/(?:地点|地址|在)\s*([^\s，,。;；]{4,24})/))) e.place = m[1];
    if ((m = text.match(/([^\s，,。：:为]{2,12}(?:项目|工程|大桥|大厦|地铁|厂房|产业园|学校|医院|道路))/))) e.project = m[1].replace(/^(成功中标|成功|中标|为|供货)/, "");
    if ((m = text.match(/([^\s，,。：:的]{2,14}(?:公司|集团|钢构|机械厂|工厂|建设|建筑|钢厂|客户))/))) e.client = m[1].replace(/^(今天|今日|明天|昨天|上午|下午)?(陪同|接待|带|参观|拜访|感谢|与|和|为)?/, "");
    if ((m = text.match(/(开平|纵剪|剪切|折弯|激光切割|切割|喷砂|镀锌|定尺|打孔)/g))) e.process = [...new Set(m)];
    if ((m = text.match(/(\d{1,2})\s*天/))) e.days = m[1];
    if ((m = text.match(/(\d{1,3})\s*次/))) e.times = m[1];
    if ((m = text.match(/[「"“]([^」"”]{4,40})[」"”]/))) e.quote = m[1];
    if ((m = text.match(/(台风|暴雨|大雪|高温|大风|降温|寒潮|雾|冰冻)/))) e.weather = m[1];
    if ((m = text.match(/(\d+)\s*号馆\s*([A-Za-z]?\d+)?\s*(?:展位)?/))) e.booth = `${m[1]} 号馆${m[2] ? " " + m[2] : ""}`;
    if ((m = text.match(/(\d{1,3})\s*台/))) e.vehicles = m[1];
    if ((m = text.match(/(?:满|超过|以上)\s*(\d{1,4})\s*吨/))) e.threshold = m[1];
    return e;
  }

  const T = (arr) => arr.filter(Boolean).join(" · ");
  const COPY = {
    newproduct: (e, b) => ({ eyebrow: `${b.short} · 新品上市`, headline: `${e.mills ? e.mills[0] + " " : ""}${e.prods ? e.prods[0] : "新品"} 到货`, sub: T([e.spec ? `规格 ${e.spec}` : null, /汽配|冲压|机械|钢构|家电/.test(e._t) ? `适用 ${e._t.match(/(汽配|冲压|机械|钢构|家电)/)[1]}` : null, "欢迎试样"]), bullets: [/无氧化皮|表面/.test(e._t) ? "表面无氧化皮 · 无需二次处理" : "一线钢厂 · 质保书齐全", /试样|样品/.test(e._t) ? "支持小批量试样" : "支持定尺加工", "首批到货 · 数量有限"], highlight: null, cta: "扫码看规格与报价" }),
    arrival: (e, b) => ({ eyebrow: `${b.short} · 到货通知`, headline: e.prods ? `${e.mills ? e.mills[0] + " " : ""}${e.prods[0]} 到货` : "新货到库", sub: T([e.spec ? `规格 ${e.spec}` : null, e.tons ? `共 ${e.tons}` : null, /宝山|库/.test(e._t) ? "宝山库现货" : "现货可提"]), bullets: ["质保书齐全 · 过磅计重", "当日提货 · 可配送", "欢迎询价锁货"], highlight: e.tons ? { label: "到货", value: e.tons.replace(" 吨", ""), unit: "吨" } : null, cta: "扫码询价 · 电话锁货" }),
    feature: (e, b) => { const pts = e._t.split(/[：:，,、；;]/).map((s) => s.trim()).filter((s) => /≥|≤|不|均匀|带|国标|厚|每|保证|支持|全/.test(s) && s.length <= 16).slice(0, 4); return { eyebrow: `${b.short} · 为什么选我们的${e.prods ? e.prods[0] : "钢材"}`, headline: `${e.prods ? e.prods[0] : "产品"}，好在哪`, sub: "四个硬指标，一眼看懂", bullets: pts.length >= 2 ? pts : ["一线钢厂 · 质保书齐全", "国标壁厚 · 不缩水", "每支带钢印 · 可追溯", "过磅计重 · 磅差包赔"], highlight: null, cta: "扫码看检测报告" }; },
    catalog: (e, b) => ({ eyebrow: `${b.short} · 主营产品`, headline: "主营品种一览", sub: T([e.mills ? `钢厂：${e.mills.join(" / ")}` : "一线钢厂", /当日|当天/.test(e._t) ? "当日提货" : "现货充足"]), bullets: (e.prods && e.prods.length ? e.prods : ["螺纹钢", "盘螺", "热卷", "中厚板", "镀锌板", "工字钢"]).slice(0, 6), highlight: null, cta: "扫码看完整规格与报价" }),
    stock: (e, b) => { const rows = []; const re = /(螺纹钢|盘螺|线材|热卷|冷轧|中厚板|中板|镀锌板|镀锌管|工字钢|H\s?型钢|角钢|槽钢|方管|圆钢|酸洗板)\s*([ΦφΦ]?\s*[\d.]+\s*[-~至]?\s*[\d.]*|Q\d{3}[A-Z]?)?\s*(沙钢|永钢|中天|萍钢|方大|马钢|宝钢|鞍钢|首钢|日照|敬业|新兴|柳钢)?\s*(\d{3,5})?/g; let m; while ((m = re.exec(e._t)) && rows.length < 6) rows.push({ name: m[1], spec: (m[2] || "").replace(/[φΦ]/, "Φ").replace(/\s/g, "") || "—", mill: m[3] || "—", price: m[4] ? fmtN(m[4]) : "电议" }); return { eyebrow: `${b.short} · 今日库存报价`, headline: "今日库存表", sub: T([/宝山/.test(e._t) ? "宝山库" : "现货库", "当日提货", "价格以电话确认为准"]), bullets: ["过磅计重 · 质保书齐全", "更多规格扫码查看"], rows: rows.length ? rows : [{ name: "螺纹钢", spec: "Φ12-25", mill: "沙钢", price: "3,690" }, { name: "盘螺", spec: "Φ8-10", mill: "永钢", price: "3,750" }, { name: "热卷", spec: "3.0-11.75", mill: "日照", price: "3,810" }], highlight: null, cta: "扫码看完整库存表" }; },
    service: (e, b) => ({ eyebrow: `${b.short} · 加工配送`, headline: "加工服务 一站搞定", sub: T([/24\s*小时/.test(e._t) ? "24 小时出货" : "快速出货", /来料/.test(e._t) ? "来料加工也接" : "配送到厂"]), bullets: (e.process && e.process.length ? e.process : ["开平", "纵剪", "剪切", "折弯", "激光切割"]).map((p) => `${p}`), highlight: null, cta: "扫码咨询加工价格" }),
    logistics: (e, b) => ({ eyebrow: `${b.short} · 物流配送`, headline: /升级/.test(e._t) ? "送货服务升级" : "送货到厂 · 准时可靠", sub: T([/当日达/.test(e._t) ? `${(e._t.match(/([^\s，,。：:]{2,6})全境当日达/) || [])[1] || "本地"}当日达` : null, /次日达/.test(e._t) ? `${(e._t.match(/([^\s，,。：:]{2,8})次日达/) || [])[1] || "周边"}次日达` : null]) || "自有车队 · 专线直达", bullets: [e.threshold ? `${e.threshold} 吨以上免运费` : "大单免运费", e.vehicles ? `自有车队 ${e.vehicles} 台` : "自有车队 · 随叫随到", "全程可追踪 · 卸货到位"], highlight: e.vehicles ? { label: "自有车队", value: e.vehicles, unit: "台" } : null, cta: "扫码查看配送范围" }),
    shipping: (e, b) => ({ eyebrow: `${b.short} · 发货现场`, headline: `今日发货${e.tons ? " " + e.tons : ""}`, sub: T([e.trucks ? `${e.trucks} 车` : null, e.prods ? e.prods[0] : null, (e._t.match(/发往([^\s，,。]{2,10})/) || [])[1] ? `发往${e._t.match(/发往([^\s，,。]{2,10})/)[1]}` : null]) || "装车实拍 · 准时出库", bullets: ["装车过磅 · 质保书随车", "当日提货 · 说到就到"], highlight: null, cta: "现货充足 · 扫码询价" }),
    processing: (e, b) => ({ eyebrow: `${b.short} · 加工现场`, headline: `${e.process ? e.process.join(" + ") : "加工"}进行中`, sub: T([e.tons ? `客户 ${e.tons}${e.prods ? " " + e.prods[0] : ""}` : null, /明早|明天|今晚|今天/.test(e._t) ? `${e._t.match(/(明早|明天|今晚|今天)/)[1]}交付` : "按时交付"]), bullets: ["自有加工线 · 精度有保障", "来料加工 · 定尺定做"], highlight: null, cta: "扫码咨询加工" }),
    visit: (e, b) => ({ eyebrow: `${b.short} · 客户来访`, headline: /敲定|成交|签/.test(e._t) && e.tons ? `实地看货 · 当场敲定 ${e.tons}` : "欢迎实地看货", sub: T([e.client ? `${e.client.replace(/客户$/, "")}客户来访` : "客户实地考察", /仓库/.test(e._t) ? "参观宝山仓库" : null]), bullets: ["货在眼前 · 眼见为实", "验货过磅 · 现场报价", "欢迎预约到仓看货"], highlight: null, cta: "扫码预约看货" }),
    case: (e, b) => ({ eyebrow: `${b.short} · 工程案例`, headline: e.project || "项目供货案例", sub: T([e.prods ? `供货 ${e.prods[0]}` : "钢材供应", e.tons ? e.tons : null]), bullets: [e.days ? `${e.days} 天分批交付 · 零延误` : "分批交付 · 零延误", "质保书齐全 · 见证取样一次通过", "配送到工地 · 夜间可卸"], highlight: e.tons ? { label: "供货", value: e.tons.replace(" 吨", ""), unit: "吨" } : null, cta: "扫码了解工程供货方案" }),
    intro: (e, b) => ({ eyebrow: `${b.short} · 企业实力`, headline: e.years ? `${e.years} 年专注钢材现货` : "专注钢材现货供应", sub: b.slogan, bullets: [e.tons ? `常备库存 ${e.tons}` : "常备库存充足", e.mills ? `${e.mills.join(" / ")} ${/一级|一代/.test(e._t) ? "一级代理" : "长期合作"}` : "一线钢厂长期协议户", (e._t.match(/(\d)\s*个仓库/) ? `${e._t.match(/(\d)\s*个仓库/)[1]} 个自营仓库 · 当日提货` : "自营仓库 · 当日提货"), "加工配送 · 质保书齐全"], highlight: e.tons ? { label: "常备库存", value: e.tons.replace(" 吨", ""), unit: "吨" } : e.years ? { label: "成立", value: e.years, unit: "年" } : null, cta: "扫码看实时库存" }),
    honor: (e, b) => ({ eyebrow: `${b.short} · 资质荣誉`, headline: e.mills ? `${e.mills[0]} ${e.year ? e.year + " 年度" : ""}优秀代理商` : "荣誉见证实力", sub: "感谢钢厂与客户的信任", bullets: [e.mills ? `${e.mills.join(" / ")} 官方授权` : "一线钢厂官方授权", "质保书齐全 · 一票制", "以诚经营 · 以质取信"], highlight: null, cta: "扫码查看授权证书" }),
    signing: (e, b) => ({ eyebrow: `${b.short} · 战略合作`, headline: e.mills ? `与${e.mills[0]}达成战略合作` : e.client ? `与${e.client}签约` : "战略合作签约", sub: T([e.year ? `${e.year} 年度合作协议` : "合作协议正式签署", e.tons ? `年供货 ${e.tons}` : null]), bullets: ["货源更稳 · 价格更优", "一手资源 · 持续供应"], highlight: e.tons ? { label: "年供货", value: e.tons.replace(" 吨", ""), unit: "吨" } : null, cta: "扫码了解合作资源" }),
    team: (e, b) => ({ eyebrow: `${b.short} · 团队风采`, headline: /晨会/.test(e._t) ? "新的一天，从行情开始" : /培训/.test(e._t) ? "学习，是为了更懂客户" : "我们是鑫钢人", sub: /为客户/.test(e._t) ? e._t.match(/为客户[^，,。]{2,16}/)[0] : "专业的人，做专业的事", bullets: ["每天 8:00 行情早会", "每单跟到底 · 每车送到位"], highlight: null, cta: "扫码认识你的专属顾问" }),
    promo: (e, b) => ({ eyebrow: `${b.short} · 限时特价`, headline: e.prods ? `${e.prods[0]}${e.spec ? " " + e.spec : ""} 特价` : "本周特价 · 现货直供", sub: T([e.tons ? `限量 ${e.tons}` : null, e.date ? `${e.date} 截止` : /周日|周末|截止/.test(e._t) ? "本周日截止" : "先到先得", "现货当天提"]), bullets: [e.mills ? `钢厂：${e.mills.join(" / ")}` : "一线钢厂 · 质保书齐全", "过磅计重 · 磅差包赔", "宝山库自提 / 可配送"], highlight: e.price ? { label: "特价", value: fmtN(e.price), unit: "元/吨" } : e.delta ? { label: "每吨立减", value: e.delta, unit: "元" } : { label: "直降", value: "30", unit: "元/吨" }, cta: "扫码锁价 · 电话询价" }),
    holidaypromo: (e, b) => { const f = e.fest || "节日"; return { eyebrow: `${b.short} · ${f}特惠`, headline: `${f}钜惠 · 备货正当时`, sub: T([e.date ? e.date : null, e.delta ? `下单每吨立减 ${e.delta} 元` : "下单享专属优惠"]), bullets: [e.threshold ? `满 ${e.threshold} 吨再送运费` : "满量再送运费", "假期照常发货", "质保书齐全 · 磅差包赔"], highlight: e.delta ? { label: "每吨立减", value: e.delta, unit: "元" } : null, cta: "扫码锁价 · 节前备货" }; },
    anniversary: (e, b) => ({ eyebrow: `${b.short}${e.years ? ` · ${e.years} 周年庆` : " · 周年庆"}`, headline: e.years ? `${e.years} 周年 感恩钜惠` : "周年庆 感恩回馈", sub: T([e.date, e.delta ? `全场每吨立减 ${e.delta} 元` : "全场专属优惠"]), bullets: [`${e.years ? e.years + " 年" : "多年"}专注钢材现货 · 感谢一路同行`, /加工费/.test(e._t) ? "老客户加赠加工费" : "老客户到店有礼", e.place || b.addr], highlight: e.delta ? { label: "每吨立减", value: e.delta, unit: "元" } : e.years ? { label: "感恩", value: e.years, unit: "周年" } : null, cta: "扫码领取周年福利" }),
    flash: (e, b) => ({ eyebrow: `${b.short} · 限时秒杀`, headline: `${e.prods ? e.prods[0] : "现货"}${e.spec ? " " + e.spec : ""} 一口价`, sub: T([e.time ? e.time : "今日限时", e.tons ? `仅 ${e.tons}` : null, (e._t.match(/仅剩\s*\d+\s*小时/) || [])[0]]), bullets: ["先到先得 · 售完即止", "现货当天提 · 质保书齐全"], highlight: e.price ? { label: "秒杀价", value: fmtN(e.price), unit: "元/吨" } : { label: "限时", value: (e._t.match(/仅剩\s*(\d+)\s*小时/) || [])[1] || "4", unit: "小时" }, cta: "扫码抢购 · 电话锁货" }),
    clearance: (e, b) => { const items = [...e._t.matchAll(/([^\s，,。：:、]{2,10}?)\s*(\d[\d,.]*)\s*吨/g)].map((m) => `${m[1]} ${m[2]} 吨`).slice(0, 5); return { eyebrow: `${b.short} · 库存清仓`, headline: "清仓处理 · 低于市场价", sub: T([e.delta ? `低于市场价 ${e.delta} 元/吨` : "价格好谈", "欢迎到库看货"]), bullets: items.length ? items : ["非标热卷", "短尺螺纹", "锈蚀中板"], highlight: e.delta ? { label: "低于市场价", value: e.delta, unit: "元/吨" } : null, cta: "扫码看清仓清单" }; },
    groupbuy: (e, b) => { const all = e.tonsAll || []; return { eyebrow: `${b.short} · 拼单直发`, headline: `${e.mills ? e.mills[0] + " " : ""}${e.prods ? e.prods[0] : "钢材"} 拼单直发`, sub: T([all[0] ? `凑满 ${all[0]} 吨钢厂直发` : "凑量拿钢厂直发价", e.delta ? `每吨比市场低 ${e.delta}` : null]), bullets: [all[1] ? `已拼 ${all[1]} 吨` : "多家同拼", all[2] ? `还差 ${all[2]} 吨` : "名额有限", "钢厂直发 · 质保书齐全"], highlight: all[1] && all[0] ? { label: "已拼", value: `${Math.round((+all[1].replace(/,/g, "") / +all[0].replace(/,/g, "")) * 100)}%`, unit: "" } : null, cta: "扫码参与拼单" }; },
    opening: (e, b) => ({ eyebrow: `${b.short} · ${/乔迁|新仓|搬/.test(e._t) ? "乔迁启用" : "盛大开业"}`, headline: /新仓/.test(e._t) ? "新仓启用 · 感恩钜惠" : "盛大开业 · 感恩钜惠", sub: T([e.date, e.delta ? `当天下单每吨立减 ${e.delta} 元` : "当天下单享专属优惠"]), bullets: ["库容更大 · 提货更快", "老客户到店有礼", e.place || b.addr], highlight: e.delta ? { label: "每吨立减", value: e.delta, unit: "元" } : null, cta: "扫码预约 · 到店有礼" }),
    festival: (e, b) => { const f = e.fest || "中秋"; const wish = { 中秋: ["花好月圆 · 人和事顺", "月满中秋 · 情满钢城"], 国庆: ["祝祖国繁荣昌盛", "举国同庆 · 共赴新程"], 春节: ["新春大吉 · 生意兴隆", "金龙纳福 · 钢市长虹"], 新年: ["新年新气象 · 携手再出发", "岁岁常欢愉 · 年年皆胜意"], 元旦: ["元启新岁 · 万事顺遂"], 端午: ["粽情端午 · 安康顺遂"], 五一: ["致敬每一位劳动者"], 劳动节: ["致敬每一位劳动者"], 元宵: ["灯火可亲 · 团圆美满"], 除夕: ["辞旧迎新 · 阖家团圆"], 感恩节: ["感恩相伴 · 一路同行"], 双节: ["双节同庆 · 喜乐安康"] }[f] || ["佳节愉快 · 万事顺遂"]; return { eyebrow: `${b.short} 祝您`, headline: `${f}快乐`, sub: wish[0], bullets: [/客户|相伴|感谢/.test(e._t) ? "感谢新老客户一路相伴" : "愿每一份信任都有回响", `${b.short} 全体同仁 敬祝`], highlight: null, cta: "节后现货照常供应 · 欢迎询价" }; },
    solar: (e, b) => { const s = e.solar || "白露"; const line = { 白露: "露从今夜白 · 早晚添件衣", 秋分: "昼夜均分 · 秋高气爽", 立秋: "一叶知秋 · 暑去凉来", 寒露: "露气寒冷 · 将凝为霜", 霜降: "霜降水返壑 · 风落木归山", 立冬: "冬始于此 · 万物收藏", 冬至: "冬至阳生 · 春又不远", 小雪: "小雪封地 · 大雪封河", 大雪: "瑞雪兆丰年", 立春: "一年之计在于春", 清明: "清明时节 · 万物生长", 夏至: "昼长夜短 · 热在三伏", 大寒: "寒尽春生 · 静待花开" }[s] || "顺时而动 · 不负光阴"; return { eyebrow: `${b.short} · 二十四节气`, headline: s, sub: line, bullets: [/早安/.test(e._t) ? "早安，愿您今日订单顺利" : "愿您今日订单顺利", /温差|注意/.test(e._t) ? "早晚温差大，注意身体" : "钢市如节气，静待时机"], highlight: null, cta: "今日行情已更新 · 扫码查看" }; },
    thanks: (e, b) => ({ eyebrow: `${b.short} · 致新老客户`, headline: "感谢一路同行", sub: e.year ? `${e.year} 年，因您更好` : "每一份信任，我们都用心对待", bullets: [/当日/.test(e._t) ? "当日提货" : "准时交付", /质保/.test(e._t) ? "质保书齐全" : "正品保障", /磅差/.test(e._t) ? "磅差包赔" : "售后无忧"], highlight: null, cta: "服务承诺 · 扫码联系" }),
    testimonial: (e, b) => ({ eyebrow: `${b.short} · 客户见证`, headline: e.quote ? `「${e.quote}」` : "客户怎么说", sub: T([e.client ? e.client : "老客户", e.years ? `合作 ${e.years} 年` : null]), bullets: [e.times ? `复购 ${e.times} 次` : "长期复购", "从未停线 · 从未延误", "口碑，是最好的广告"], highlight: e.times ? { label: "复购", value: e.times, unit: "次" } : null, cta: "扫码看更多客户评价" }),
    win: (e, b) => ({ eyebrow: `${b.short} · 喜报`, headline: e.project ? `中标 ${e.project}` : "喜报 · 再下一城", sub: T([e.prods ? `供货 ${e.prods[0]}` : "钢材供应", e.tons ? e.tons : null]), bullets: ["感谢客户信任", "全程供货保障 · 准时交付"], highlight: e.tons ? { label: "供货", value: e.tons.replace(" 吨", ""), unit: "吨" } : null, cta: "工程供货 · 扫码咨询" }),
    event: (e, b) => ({ eyebrow: `${b.short} · 邀请函`, headline: /订货会/.test(e._t) ? "秋季订货会" : /答谢/.test(e._t) ? "客户答谢会" : /年会/.test(e._t) ? "年度答谢晚宴" : "诚邀莅临", sub: T([e.date, e.time]) || "敬请届时光临", bullets: [e.place ? `地点：${e.place}` : `地点：${b.addr}`, "现场签约享专属政策", "凭邀请函到场有礼"], highlight: null, cta: "扫码报名 · 回复确认" }),
    expo: (e, b) => ({ eyebrow: `${b.short} · 展会现场`, headline: e.booth ? `${e.booth} 等您来` : "我们在展会现场", sub: T([(e._t.match(/([^\s，,。]{2,14}(?:展|博览会))/) || [])[1], "欢迎莅临"]), bullets: ["现场看样 · 现场报价", /有礼/.test(e._t) ? "到展位有礼" : "扫码预约洽谈"], highlight: null, cta: "扫码预约展位洽谈" }),
    live: (e, b) => ({ eyebrow: `${b.short} · 直播预告`, headline: /逛|看货/.test(e._t) ? "直播带你逛仓库" : "现场报价直播", sub: T([e.time || "今晚 8 点", /视频号/.test(e._t) ? "视频号开播" : "准时开播"]), bullets: ["现场看货 · 实时报价", e.delta ? `直播间下单每吨减 ${e.delta}` : "直播间专属价"], highlight: null, cta: "扫码预约直播提醒" }),
    recruit: (e, b) => ({ eyebrow: `${b.short} · 诚聘英才`, headline: `招聘${e.posts ? e.posts[0] : "钢材销售"}${e.count ? ` ${e.count} 名` : ""}`, sub: T([e.base ? `底薪 ${e.base}` : null, "高提成", /五险/.test(e._t) ? "五险" : null, /包住|住宿/.test(e._t) ? "包住" : null]) || "高薪诚聘 · 待遇优厚", bullets: [/经验/.test(e._t) ? "有钢贸经验优先" : "行业经验不限，带薪培训", /开车|驾照/.test(e._t) ? "会开车加分" : "沟通能力强，责任心好", "上升空间大，师徒带教"], highlight: e.salary ? { label: "月薪", value: e.salary.replace(/k/gi, "K"), unit: "" } : null, cta: "扫码投递简历 / 电话咨询" }),
    franchise: (e, b) => ({ eyebrow: `${b.short} · 招商合作`, headline: "招募区域分销伙伴", sub: T([/无需囤货|不囤货/.test(e._t) ? "无需囤货" : null, /一手/.test(e._t) ? "一手价供货" : "价格优势", /返利/.test(e._t) ? "返利优厚" : null]) || "共享货源 · 共赢市场", bullets: ["一手货源 · 价格透明", "平台线索共享", "培训与物流支持"], highlight: null, cta: "扫码了解合作政策" }),
    notice: (e, b) => ({ eyebrow: `${b.short} · 通知`, headline: e.fest ? `${e.fest}放假通知` : /搬迁/.test(e._t) ? "搬迁公告" : /营业时间/.test(e._t) ? "营业时间调整" : "重要通知", sub: e.date ? `${e.date} 休息` : "请知悉并合理安排", bullets: [(e._t.match(/(\d{1,2})\s*[日号]\s*(?:正常)?(?:上班|营业)/) ? `${e._t.match(/(\d{1,2})\s*[日号]\s*(?:正常)?(?:上班|营业)/)[1]} 日正常上班` : "节后正常营业"), /预约|电话/.test(e._t) ? "假期可电话预约提货" : "紧急事项请电话联系", "感谢理解与支持"], highlight: null, cta: "如有需要请提前联系" }),
    pricenotice: (e, b) => { const up = /上调|涨/.test(e._t); return { eyebrow: `${b.short} · 调价通知`, headline: `${e.prods ? e.prods[0] : "钢材"}价格${up ? "上调" : "下调"}通知`, sub: T([/明日|明天/.test(e._t) ? "明日起执行" : "即日起执行", e.delta ? `每吨${up ? "上调" : "下调"} ${e.delta} 元` : null]), bullets: [/钢厂/.test(e._t) ? "受钢厂调价影响" : "随行就市", /锁价|今日/.test(e._t) ? "今日锁价仍按现价执行" : "已签合同不受影响", "如需备货请尽快联系"], highlight: e.delta ? { label: up ? "每吨上调" : "每吨下调", value: (up ? "+" : "-") + e.delta, unit: "元" } : null, cta: "扫码锁价 · 电话确认" }; },
    weather: (e, b) => ({ eyebrow: `${b.short} · 温馨提醒`, headline: `${e.weather || "天气"}预警`, sub: T([/明天|明日/.test(e._t) ? "明天" : "近日", (e._t.match(/(上海|江苏|苏州|无锡|浙江|华东)[^\s，,。]{0,6}/) || [])[0]]) || "请注意天气变化", bullets: [/照常/.test(e._t) ? "仓库照常发货" : "发货以电话确认为准", /工地|卸货/.test(e._t) ? "工地请提前安排卸货" : "请提前安排提货时间", "注意安全 · 平安第一"], highlight: null, cta: "如需调整提货 · 扫码联系" }),
    reopen: (e, b) => ({ eyebrow: `${b.short} · 开工大吉`, headline: "开工大吉", sub: T([(e._t.match(/正月初[一二三四五六七八九十]+|\d+\s*月\s*\d+\s*[日号]/) || [])[0], /全体到岗|到岗/.test(e._t) ? "全体到岗" : "正式开工"]) || "新年新起点", bullets: [/现货充足/.test(e._t) ? "现货充足 · 随时提货" : "现货已备好", /开单有礼|有礼/.test(e._t) ? "新年开单有礼" : "开年首单享优惠", "祝您生意兴隆 · 大展宏图"], highlight: null, cta: "开年首单 · 扫码询价" }),
    knowledge: (e, b) => { const pts = e._t.split(/[，,；;]/).slice(1).map((s) => s.trim()).filter((s) => s.length >= 4 && s.length <= 18).slice(0, 4); return { eyebrow: `${b.short} · 钢材小课堂`, headline: (e._t.match(/教你([^\s，,。]{2,14})/) || [])[1] ? `三分钟${e._t.match(/教你([^\s，,。]{2,14})/)[1]}` : /辨别|区别/.test(e._t) ? "怎么辨别真假好坏" : "钢材选购小知识", sub: "买钢材不踩坑，这几点要记牢", bullets: pts.length >= 2 ? pts : ["看钢厂 · 看炉号 · 看力学性能", "质保书三处对不上要小心", "过磅计重比理计更放心"], highlight: null, cta: "扫码看完整科普" }; },
  };

  AP.mockPlan = function (prompt, ctx) {
    const text = (prompt || "").trim();
    const brand = Object.assign({}, AP.defaultBrand, ctx.brand || {});
    const assets = ctx.assets || [];
    const scene = AP.SCENES.find((s) => s.id === ctx.scene) || detectScene(text) || AP.SCENES.find((s) => s.id === "intro");
    const style = detectStyle(text) || scene.style;
    const e = extract(text); e._t = text;
    const copy = COPY[scene.id](e, brand);
    if (scene.tag) copy.tag = scene.tag;
    const logo = assets.find((a) => a.type === "logo");
    const cand = assets.filter((a) => a.type !== "logo");
    const byPref = (prefs) => { for (const p of prefs || []) { const f = cand.find((a) => (a.tags || []).some((t) => t.includes(p))); if (f) return f; } return null; };
    let photo = byPref(scene.photos);
    if (!photo && NEED_PHOTO.includes(scene.layout)) photo = cand[0] || null;
    let layout = scene.layout;
    if (!photo && NEED_PHOTO.includes(layout)) layout = layout === "gallery" ? "list" : "hero";
    const photos = [];
    if (scene.multi && photo) { photos.push(photo.id); for (const a of cand) { if (photos.length >= scene.multi) break; if (!photos.includes(a.id)) photos.push(a.id); } }
    const st = AP.STYLES[style];
    const spec = {
      scene: scene.id, ratio: ctx.ratio || detectRatio(text), layout, style, palette: clone(st.palette), bgfx: st.bgfx, fontScale: 1, density: 2,
      copy, contact: { company: brand.company, person: brand.person, phone: e.phone || brand.phone, addr: brand.addr },
      assets: { logo: logo ? logo.id : null, photo: photo ? photo.id : null, photos },
      flags: { showQR: true, showLogo: !!logo, showPhone: true, showAddr: ["opening", "event", "intro", "recruit", "notice", "expo", "anniversary"].includes(scene.id) },
      visual: { prompt: st.visual, seed: hash(text) % 10000, imageId: null },
      notes: [],
    };
    if (/不要二维码|去掉二维码|无二维码/.test(text)) spec.flags.showQR = false;
    if (!e.phone) spec.notes.push("未在需求中识别到电话，已使用品牌资料中的联系方式");
    if (["promo", "flash"].includes(scene.id) && !e.price && !e.delta) spec.notes.push("未识别到具体价格，已用占位数字，请在微调中告知真实价格");
    if (scene.id === "recruit" && !e.salary) spec.notes.push("未识别到薪资范围，未展示薪资大字；可说「薪资 8K~15K」补上");
    if (NEED_PHOTO.includes(scene.layout) && !cand.some((a) => a.uploaded)) spec.notes.push("现场类海报建议上传当天实拍图，效果远好于示例图");
    const g = AP.GROUPS.find((x) => x.id === scene.g);
    spec._meta = { sceneName: scene.name, groupName: g ? g.name : "", styleName: st.name, detected: e, reason: `识别为「${g ? g.name + " / " : ""}${scene.name}」场景${detectStyle(text) ? `，按你的描述采用「${st.name}」风格` : `，默认采用「${st.name}」风格`}；${photo && NEED_PHOTO.includes(layout) ? `选用素材「${photo.name}」${photos.length > 1 ? `等 ${photos.length} 张` : ""}作为主视觉，` : ""}版式「${AP.LAYOUT_NAMES[layout]}」。` };
    return spec;
  };

  /* ---------- 模拟大模型：微调 ---------- */
  AP.mockRefine = function (spec0, instr, ctx) {
    const spec = clone(spec0); const changes = []; let regen = false; const t = (instr || "").trim();
    const assets = ctx.assets || []; const cand = assets.filter((a) => a.type !== "logo");
    if (!spec.assets.photos) spec.assets.photos = spec.assets.photo ? [spec.assets.photo] : [];
    const setStyle = (s) => { if (!AP.STYLES[s] || spec.style === s) return; spec.style = s; spec.palette = clone(AP.STYLES[s].palette); spec.bgfx = AP.STYLES[s].bgfx; spec.visual.prompt = AP.STYLES[s].visual; regen = true; changes.push(`风格改为「${AP.STYLES[s].name}」并重绘背景`); };
    const setLayout = (l) => { if (NEED_PHOTO.includes(l) && !spec.assets.photo) { const p = cand[0]; if (!p) { changes.push("素材库里没有图片，无法使用图片版式"); return; } spec.assets.photo = p.id; } if (l === "gallery" && spec.assets.photos.length < 2) { spec.assets.photos = [spec.assets.photo, ...cand.filter((a) => a.id !== spec.assets.photo).map((a) => a.id)].slice(0, 3); } spec.layout = l; changes.push(`版式改为「${AP.LAYOUT_NAMES[l]}」`); };
    let m;
    if ((m = t.match(/标题(?:改成|改为|换成|叫|写)\s*[「"“『]?([^」"”』]+?)[」"”』]?\s*$/))) { spec.copy.headline = m[1].trim(); changes.push(`标题改为「${spec.copy.headline}」`); }
    if ((m = t.match(/副标题(?:改成|改为|换成)\s*[「"“『]?([^」"”』]+?)[」"”』]?\s*$/))) { spec.copy.sub = m[1].trim(); changes.push(`副标题改为「${spec.copy.sub}」`); }
    if ((m = t.match(/(?:电话|手机|联系方式)(?:改成|改为|换成|是)?\s*(1[3-9]\d[\s-]?\d{4}[\s-]?\d{4})/))) { spec.contact.phone = fmtPhone(m[1]); spec.flags.showPhone = true; changes.push(`电话改为 ${spec.contact.phone}`); }
    if ((m = t.match(/(?:地址|地点)(?:改成|改为|换成|是)\s*([^\s，,。]{4,30})/))) { spec.contact.addr = m[1]; spec.flags.showAddr = true; changes.push(`地址改为「${m[1]}」`); }
    if ((m = t.match(/(?:联系人|姓名|名字)(?:改成|改为|换成|是)\s*([^\s，,。]{2,6})/))) { spec.contact.person = m[1]; changes.push(`联系人改为「${m[1]}」`); }
    if ((m = t.match(/(?:价格|特价|售价|一口价)(?:改成|改为|换成|是)?\s*(\d{3,5})/))) { spec.copy.highlight = { label: spec.scene === "flash" ? "秒杀价" : "特价", value: fmtN(m[1]), unit: "元/吨" }; changes.push(`价格改为 ${m[1]} 元/吨`); }
    if ((m = t.match(/(?:薪资|工资|月薪)(?:改成|改为|换成|是)?\s*(\d{1,2}[kK]|\d{3,5})\s*[-~至]\s*(\d{1,2}[kK]|\d{3,5})/))) { spec.copy.highlight = { label: "月薪", value: `${m[1]}~${m[2]}`.replace(/k/g, "K"), unit: "" }; changes.push(`薪资改为 ${spec.copy.highlight.value}`); }
    if ((m = t.match(/(?:立减|每吨减|降)\s*(\d{1,4})\s*元?/)) && !changes.length) { spec.copy.highlight = { label: "每吨立减", value: m[1], unit: "元" }; changes.push(`优惠改为每吨立减 ${m[1]} 元`); }
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
    if (/(?:去掉|不要|隐藏|删掉|删除)[^，,。]*(?:角标|标签|tag)/i.test(t)) { spec.copy.tag = null; changes.push("去掉角标"); }
    if (/(?:去掉|不要|隐藏|删掉)[^，,。]*(?:图片|照片|配图)/.test(t)) { spec.assets.photo = null; spec.assets.photos = []; if (NEED_PHOTO.includes(spec.layout)) spec.layout = "hero"; changes.push("移除配图"); }
    if ((m = t.match(/(?:用|换成|改用|使用)第\s*([一二三四五六七八九1-9])\s*张/))) { const idx = "一二三四五六七八九".indexOf(m[1]) >= 0 ? "一二三四五六七八九".indexOf(m[1]) : +m[1] - 1; if (cand[idx]) { spec.assets.photo = cand[idx].id; spec.assets.photos = [cand[idx].id, ...spec.assets.photos.filter((x) => x !== cand[idx].id)].slice(0, 3); if (!NEED_PHOTO.includes(spec.layout)) setLayout("split"); changes.push(`主视觉换为「${cand[idx].name}」`); } else changes.push(`素材库中没有第 ${idx + 1} 张图`); }
    else if (/(?:换成|用|使用)[^，,。]*(?:刚上传|最新上传|新上传|上传的)[^，,。]*(?:图|照片)/.test(t)) { const ups = cand.filter((a) => a.uploaded); const p = ups[ups.length - 1]; if (p) { spec.assets.photo = p.id; spec.assets.photos = [p.id, ...spec.assets.photos.filter((x) => x !== p.id)].slice(0, 3); if (!NEED_PHOTO.includes(spec.layout)) setLayout("split"); changes.push(`主视觉换为刚上传的「${p.name}」`); } else changes.push("没有找到新上传的图片"); }
    else if (/(?:加|放|配)(?:上|个|张)?[^，,。]*(?:图片|照片|配图|实拍)/.test(t) && !spec.assets.photo) { const p = cand[0]; if (p) { spec.assets.photo = p.id; spec.assets.photos = [p.id]; setLayout("split"); } }
    if (/9[:：]16|竖屏|全屏(?!图)|抖音/.test(t)) { spec.ratio = "9:16"; changes.push("画幅改为 9:16 竖屏"); regen = true; } else if (/1[:：]1|方图|正方/.test(t)) { spec.ratio = "1:1"; changes.push("画幅改为 1:1 方图"); regen = true; } else if (/3[:：]4|朋友圈/.test(t)) { spec.ratio = "3:4"; changes.push("画幅改为 3:4"); regen = true; }
    if (/(?:多图|三张图|几张图|拼贴|九宫格|多张)/.test(t)) setLayout("gallery");
    else if (/(?:全图|大图|整图|满屏|铺满|全幅)/.test(t)) setLayout("photo");
    else if (/(?:表格|清单|列表版式)/.test(t)) setLayout("table");
    else if (/换(?:个|一个|种)?(?:版式|排版|布局)/.test(t)) { let i = LAYOUTS.indexOf(spec.layout); for (let k = 0; k < LAYOUTS.length; k++) { i = (i + 1) % LAYOUTS.length; const l = LAYOUTS[i]; if (l === "table" && !spec.copy.rows) continue; if (NEED_PHOTO.includes(l) && !cand.length) continue; setLayout(l); break; } }
    else if ((m = t.match(/(?:版式|排版|布局)(?:改成|改为|换成|用)\s*(大字|上图下文|要点|卡片|居中|全图|多图|表格)/))) setLayout({ 大字: "hero", 上图下文: "split", 要点: "list", 卡片: "card", 居中: "card", 全图: "photo", 多图: "gallery", 表格: "table" }[m[1]]);
    const sty = detectStyle(t); const negColor = /(?:不要|去掉|别用|不用|别)[^，,。]{0,4}(?:红|蓝|黑|白|金|绿|青|橙|喜庆|商务)/.test(t); if (sty && !negColor) setStyle(sty);
    if (/换(?:个|一个|张)?(?:背景|底图|风格)|背景(?:换|改)/.test(t) && !sty) { const i = STYLE_ORDER.indexOf(spec.style); setStyle(STYLE_ORDER[(i + 1) % STYLE_ORDER.length]); }
    if (/背景(?:更|再)?(?:亮|浅)/.test(t)) { spec.palette.mode === "dark" ? setStyle(spec.style === "festive" ? "paper" : "minimal") : changes.push("背景已是浅色"); }
    if (/背景(?:更|再)?(?:暗|深)/.test(t) && spec.palette.mode === "light") setStyle("business");
    if (/(?:加|多|来)(?:点|些|一点)?(?:金色|粒子|光|装饰|氛围)/.test(t)) { spec.bgfx = spec.bgfx === "confetti" ? "rings" : "confetti"; regen = true; changes.push("背景加入金色粒子装饰"); }
    if (/(?:更|再)(?:好看|高级|精致|专业)一?点?/.test(t) && !changes.length) { setStyle(spec.style === "black" ? "business" : "black"); spec.fontScale = Math.min(1.4, spec.fontScale + 0.05); spec.density = 2; changes.push("收紧信息密度、微调字号层级"); }
    if (/(?:换|改)(?:个|一)?(?:文案|说法|标题)|(?:再|重新)写/.test(t) && !changes.length) { const alt = { promo: ["现货直供 · 本周特价", "限量特价 · 先到先得"], recruit: ["加入我们 · 一起做大生意", "高薪诚聘 · 期待你的加入"], festival: [spec.copy.headline, "佳节安康 · 万事顺遂"], intro: ["深耕钢贸 · 值得托付", "一手货源 · 现货直供"], arrival: ["新货到库 · 现货可提", "刚到 · 抓紧锁货"], thanks: ["因您而更好", "感谢信任 · 继续同行"], shipping: ["说到就到 · 今日发货", "又是发货的一天"], visit: ["货在眼前 · 眼见为实", "欢迎到仓看货"], case: ["用交付说话", "又一个项目顺利交付"] }[spec.scene] || [spec.copy.headline + " · 现货直供"]; spec.copy.headline = alt.find((a) => a !== spec.copy.headline) || alt[0]; changes.push(`标题换一种说法：「${spec.copy.headline}」`); }
    if (!changes.length) { spec.visual.seed = (spec.visual.seed + 1) % 10000; regen = true; changes.push("已按你的描述整体微调（原型为规则模拟；正式版由大模型理解任意自然语言指令）"); }
    spec.visual.imageId = regen ? null : spec.visual.imageId;
    const tips = { promo: "要不要把截止日期放大做成倒计时？", recruit: spec.copy.highlight ? "还可以说「换个版式」看看别的排法。" : "可以补一句「薪资 8K~15K」让待遇更醒目。", festival: "想换成竖屏 9:16 发抖音吗？", intro: "可以说「用第二张图」换主视觉。", shipping: "可以说「多图拼贴」把几张现场图都放上。", visit: "可以说「全图」让照片铺满，更有现场感。", default: "还可以说「更简洁」「换个背景」「字大一点」。" };
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
    const photos = (spec.assets.photos || []).map(asset).filter(Boolean); if (photo && !photos.length) photos.push(photo);
    const light = p.mode === "light"; const pad = u(64); const font = spec.style === "paper" ? '"Songti SC","STSong","Noto Serif SC",serif' : '-apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
    const onAcc = light || spec.style === "festive" || spec.style === "black" ? "#111" : "#fff";
    const bullets = (c.bullets || []).slice(0, spec.density === 1 ? 2 : spec.density === 2 ? 4 : 6);
    const showSub = spec.density >= 1 && c.sub; const showBullets = spec.density >= 2 || spec.layout === "list";
    const tall = spec.ratio === "9:16"; const square = spec.ratio === "1:1";
    const isPhoto = spec.layout === "photo" && photo;
    const head = `<div style="position:relative;display:flex;justify-content:space-between;align-items:center;padding:${u(56)} ${pad} 0">
      <div style="display:flex;align-items:center;gap:${u(16)}">${logo ? `<img src="${logo.url}" style="width:${u(72)};height:${u(72)};border-radius:${u(16)};object-fit:contain;background:${light && !isPhoto ? "transparent" : "rgba(255,255,255,.9)"};padding:${logo.type === "logo" ? 0 : u(4)}">` : `<div style="width:${u(72)};height:${u(72)};border-radius:${u(16)};background:${p.accent};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:${u(38)}">${esc((spec.contact.company || "钢")[0])}</div>`}
        <div><div style="font-size:${u(30)};font-weight:800">${esc(spec.contact.company)}</div><div style="font-size:${u(20)};color:${isPhoto ? "rgba(255,255,255,.75)" : p.mute};margin-top:${u(4)}">${esc(c.eyebrow || "")}</div></div></div>
      <div style="font-size:${u(20)};color:${isPhoto ? "rgba(255,255,255,.75)" : p.mute};text-align:right">${esc(ctx.date || new Date().toLocaleDateString("zh-CN"))}</div></div>`;
    const qr = spec.flags.showQR ? `<div style="text-align:center;flex:none"><div style="display:inline-block;background:#fff;padding:${u(10)};border-radius:${u(16)};border:${u(4)} solid ${p.accent}">${qrSvg(hash(spec.contact.phone || "x"), Math.round(W * 0.165), "#111", "#fff")}</div><div style="font-size:${u(20)};color:${p.accent};font-weight:700;margin-top:${u(8)}">扫码联系 · 看实时报价</div></div>` : "";
    const contactBlock = `<div style="flex:1;min-width:0"><div style="font-size:${u(34)};font-weight:900">${esc(spec.contact.person || "")}${spec.contact.person ? " · " : ""}<span style="font-weight:600;font-size:${u(26)};color:${p.mute}">${esc(spec.contact.company.replace(/有限公司|股份有限公司/g, ""))}</span></div>${spec.flags.showPhone ? `<div style="font-size:${u(44)};font-weight:900;letter-spacing:${u(1)};margin-top:${u(8)};font-variant-numeric:tabular-nums;color:${p.accent}">${esc(spec.contact.phone)}</div>` : ""}${spec.flags.showAddr && spec.contact.addr ? `<div style="font-size:${u(22)};color:${p.mute};margin-top:${u(8)}">📍 ${esc(spec.contact.addr)}</div>` : ""}</div>`;
    const foot = `<div style="position:absolute;left:0;right:0;bottom:0;padding:${u(36)} ${pad} ${u(44)};display:flex;align-items:center;gap:${u(28)};background:${light && !isPhoto ? p.bg2 : "rgba(0,0,0,.28)"};border-top:1px solid ${light && !isPhoto ? "rgba(0,0,0,.06)" : "rgba(255,255,255,.1)"}">${contactBlock}${qr}</div>`;
    const cta = c.cta ? `<div style="display:inline-block;align-self:flex-start;margin-top:${u(28)};padding:${u(14)} ${u(30)};border-radius:${u(999)};background:${p.accent};color:${onAcc};font-weight:800;font-size:${f(24)}">${esc(c.cta)}</div>` : "";
    const hl = c.highlight ? `<div style="margin-top:${u(28)};display:flex;align-items:baseline;gap:${u(12)}"><span style="font-size:${f(26)};color:${p.mute}">${esc(c.highlight.label)}</span><span style="font-size:${f(tall ? 150 : 128)};font-weight:900;line-height:1;letter-spacing:-${u(3)};color:${p.accent};font-variant-numeric:tabular-nums">${esc(c.highlight.value)}</span><span style="font-size:${f(28)};color:${p.mute}">${esc(c.highlight.unit || "")}</span></div>` : "";
    const tag = c.tag ? `<div style="position:absolute;right:${pad};top:${Math.round(H * 0.165)}px;padding:${u(10)} ${u(22)};border-radius:${u(8)};background:${p.accent};color:${onAcc};font-weight:900;font-size:${u(24)};letter-spacing:${u(2)};transform:rotate(3deg);box-shadow:0 ${u(8)} ${u(24)} rgba(0,0,0,.25)">${esc(c.tag)}</div>` : "";
    const bulletList = (style) => showBullets && bullets.length ? `<div style="margin-top:${u(28)};display:grid;gap:${u(12)}">${bullets.map((b, i) => style === "card" ? `<div style="display:flex;align-items:center;gap:${u(16)};padding:${u(20)} ${u(24)};background:${light ? "rgba(0,0,0,.04)" : "rgba(255,255,255,.08)"};border-radius:${u(18)};font-size:${f(28)};font-weight:700"><span style="width:${u(44)};height:${u(44)};border-radius:50%;background:${p.accent};color:${onAcc};display:flex;align-items:center;justify-content:center;font-size:${u(22)};flex:none">${i + 1}</span>${esc(b)}</div>` : `<div style="display:flex;align-items:center;gap:${u(14)};font-size:${f(28)}"><span style="width:${u(12)};height:${u(12)};border-radius:50%;background:${p.accent};flex:none"></span>${esc(b)}</div>`).join("")}</div>` : "";
    const hSize = (base) => f(c.headline.length > 14 ? base * 0.66 : c.headline.length > 10 ? base * 0.78 : c.headline.length > 7 ? base * 0.9 : base);
    let body = "", bgExtra = "";
    const footH = 0.19; const bodyTop = 0.16;
    if (spec.layout === "hero" || (NEED_PHOTO.includes(spec.layout) && !photo && spec.layout !== "gallery")) {
      body = `<div style="position:absolute;left:${pad};right:${pad};top:${Math.round(H * bodyTop)}px;bottom:${Math.round(H * footH)}px;display:flex;flex-direction:column;justify-content:center">
        <div style="font-size:${hSize(tall ? 104 : 92)};font-weight:900;line-height:1.12;letter-spacing:-${u(2)}">${esc(c.headline)}</div>
        ${showSub ? `<div style="font-size:${f(32)};color:${p.mute};margin-top:${u(18)};line-height:1.5">${esc(c.sub)}</div>` : ""}${hl}${bulletList("dot")}${cta}</div>`;
    } else if (spec.layout === "split") {
      const phh = Math.round(H * (tall ? 0.36 : square ? 0.34 : 0.4));
      const splitBullets = tall ? bullets : bullets.slice(0, c.highlight ? (square ? 1 : 2) : square ? 2 : 3);
      const splitList = showBullets && splitBullets.length ? `<div style="margin-top:${u(24)};display:grid;gap:${u(10)}">${splitBullets.map((b) => `<div style="display:flex;align-items:center;gap:${u(14)};font-size:${f(28)}"><span style="width:${u(12)};height:${u(12)};border-radius:50%;background:${p.accent};flex:none"></span>${esc(b)}</div>`).join("")}</div>` : "";
      body = `<div style="position:absolute;left:0;right:0;top:${Math.round(H * 0.14)}px;height:${phh}px;overflow:hidden"><img src="${photo.url}" style="width:100%;height:100%;object-fit:cover;display:block"><div style="position:absolute;inset:0;background:linear-gradient(180deg,${p.bg}cc,transparent 30%,transparent 65%,${p.bg})"></div></div>
        <div style="position:absolute;left:${pad};right:${pad};top:${Math.round(H * 0.14) + phh - Math.round(H * 0.06)}px;bottom:${Math.round(H * footH)}px;display:flex;flex-direction:column;justify-content:flex-start">
        <div style="font-size:${hSize(tall ? 88 : 76)};font-weight:900;line-height:1.12;letter-spacing:-${u(2)}">${esc(c.headline)}</div>
        ${showSub ? `<div style="font-size:${f(30)};color:${p.mute};margin-top:${u(14)};line-height:1.5">${esc(c.sub)}</div>` : ""}${c.highlight && spec.density >= 2 ? hl : ""}${splitList}${spec.density >= 2 && (tall || !c.highlight) ? cta : ""}</div>`;
    } else if (spec.layout === "photo") {
      bgExtra = `<div style="position:absolute;inset:0"><img src="${photo.url}" style="width:100%;height:100%;object-fit:cover;display:block"><div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,.05) 28%,rgba(0,0,0,.1) 45%,rgba(0,0,0,.82) 75%,rgba(0,0,0,.9))"></div></div>`;
      body = `<div style="position:absolute;left:${pad};right:${pad};top:${Math.round(H * 0.3)}px;bottom:${Math.round(H * footH)}px;display:flex;flex-direction:column;justify-content:flex-end;color:#fff">
        <div style="font-size:${hSize(tall ? 100 : 88)};font-weight:900;line-height:1.12;letter-spacing:-${u(2)};text-shadow:0 ${u(4)} ${u(20)} rgba(0,0,0,.5)">${esc(c.headline)}</div>
        ${showSub ? `<div style="font-size:${f(32)};color:rgba(255,255,255,.85);margin-top:${u(16)};line-height:1.5">${esc(c.sub)}</div>` : ""}${c.highlight ? hl.split(`color:${p.mute}`).join("color:rgba(255,255,255,.7)") : ""}${showBullets && bullets.length ? `<div style="margin-top:${u(22)};display:flex;flex-wrap:wrap;gap:${u(10)}">${bullets.slice(0, 3).map((b) => `<span style="font-size:${f(24)};padding:${u(8)} ${u(18)};border-radius:${u(999)};background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.25)">${esc(b)}</span>`).join("")}</div>` : ""}${cta}</div>`;
    } else if (spec.layout === "gallery") {
      const top = Math.round(H * 0.14); const bigH = Math.round(H * (tall ? 0.3 : square ? 0.26 : 0.3)); const smallH = Math.round(H * (tall ? 0.15 : square ? 0.12 : 0.14)); const gap = Math.round(W * 0.016);
      const others = photos.slice(1, 3);
      body = `<div style="position:absolute;left:${pad};right:${pad};top:${top}px"><div style="height:${bigH}px;border-radius:${u(24)};overflow:hidden;position:relative"><img src="${photos[0].url}" style="width:100%;height:100%;object-fit:cover;display:block">${c.tag ? "" : ""}</div>
        ${others.length ? `<div style="display:flex;gap:${gap}px;margin-top:${gap}px">${others.map((a) => `<div style="flex:1;height:${smallH}px;border-radius:${u(18)};overflow:hidden"><img src="${a.url}" style="width:100%;height:100%;object-fit:cover;display:block"></div>`).join("")}${others.length === 1 ? `<div style="flex:1;height:${smallH}px;border-radius:${u(18)};background:${light ? "rgba(0,0,0,.05)" : "rgba(255,255,255,.08)"};display:flex;align-items:center;justify-content:center;color:${p.mute};font-size:${u(22)}">+ 上传更多现场图</div>` : ""}</div>` : ""}</div>
        <div style="position:absolute;left:${pad};right:${pad};top:${top + bigH + (others.length ? smallH + gap * 2 : gap) + Math.round(H * 0.01)}px;bottom:${Math.round(H * footH)}px;display:flex;flex-direction:column;justify-content:flex-start">
        <div style="font-size:${hSize(tall ? 80 : 68)};font-weight:900;line-height:1.15;letter-spacing:-${u(2)}">${esc(c.headline)}</div>
        ${showSub ? `<div style="font-size:${f(28)};color:${p.mute};margin-top:${u(12)};line-height:1.5">${esc(c.sub)}</div>` : ""}${showBullets && bullets.length ? `<div style="margin-top:${u(16)};display:flex;flex-wrap:wrap;gap:${u(10)}">${bullets.slice(0, 3).map((b) => `<span style="font-size:${f(22)};padding:${u(6)} ${u(16)};border-radius:${u(999)};background:${light ? "rgba(0,0,0,.05)" : "rgba(255,255,255,.1)"};color:${light ? p.fg : "#fff"}">${esc(b)}</span>`).join("")}</div>` : ""}${tall ? cta : ""}</div>`;
    } else if (spec.layout === "table") {
      const rows = (c.rows || []).slice(0, tall ? 8 : 6);
      const cell = (t, w, b, al) => `<div style="flex:${w};font-size:${f(b ? 28 : 26)};font-weight:${b ? 800 : 500};text-align:${al || "left"};font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(t)}</div>`;
      body = `<div style="position:absolute;left:${pad};right:${pad};top:${Math.round(H * 0.16)}px;bottom:${Math.round(H * footH)}px;display:flex;flex-direction:column">
        <div style="font-size:${hSize(tall ? 92 : 80)};font-weight:900;line-height:1.12;letter-spacing:-${u(2)}">${esc(c.headline)}</div>
        ${showSub ? `<div style="font-size:${f(26)};color:${p.mute};margin-top:${u(12)}">${esc(c.sub)}</div>` : ""}
        <div style="margin-top:${u(28)};border-radius:${u(20)};overflow:hidden;border:1px solid ${light ? "rgba(0,0,0,.08)" : "rgba(255,255,255,.14)"}">
          <div style="display:flex;gap:${u(12)};padding:${u(16)} ${u(22)};background:${p.accent};color:${onAcc}">${cell("品名", 3, 1)}${cell("规格", 3, 1)}${cell("钢厂", 2, 1)}${cell("价格 元/吨", 3, 1, "right")}</div>
          ${rows.map((r, i) => `<div style="display:flex;gap:${u(12)};padding:${u(18)} ${u(22)};background:${i % 2 ? (light ? "rgba(0,0,0,.03)" : "rgba(255,255,255,.05)") : "transparent"};border-top:1px solid ${light ? "rgba(0,0,0,.06)" : "rgba(255,255,255,.08)"}">${cell(r.name, 3, 1)}${cell(r.spec, 3)}${cell(r.mill, 2)}<div style="flex:3;text-align:right;font-size:${f(30)};font-weight:900;color:${p.accent};font-variant-numeric:tabular-nums">${esc(r.price)}</div></div>`).join("")}
        </div>${bullets.length ? `<div style="margin-top:${u(18)};font-size:${f(22)};color:${p.mute}">${bullets.map(esc).join(" · ")}</div>` : ""}${tall ? cta : ""}</div>`;
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
    const decoLine = ["split", "photo", "gallery"].includes(spec.layout) ? "" : `<div style="position:absolute;left:${pad};top:${Math.round(H * 0.135)}px;width:${u(96)};height:${u(8)};border-radius:${u(4)};background:${p.accent}"></div>`;
    const badge = ctx.watermark === false ? "" : `<div style="position:absolute;right:${pad};top:${Math.round(H * 0.128)}px;font-size:${u(18)};color:${isPhoto ? "rgba(255,255,255,.7)" : p.mute};opacity:.8">${esc(ctx.badge || "由货袋子 AI 生成")}</div>`;
    return `<div class="ap-poster" style="position:relative;width:${W}px;height:${H}px;overflow:hidden;background:${p.bg};color:${isPhoto ? "#fff" : p.fg};font-family:${font};border-radius:inherit">${bgLayer(spec, W, H)}${bgExtra}${head}${decoLine}${badge}${body}${tag}${foot}</div>`;
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
  AP.quickChips = ["字大一点", "更喜庆", "更商务", "更简洁", "换个背景", "换个版式", "全图铺满", "多图拼贴", "加二维码", "去掉地址", "改成竖屏 9:16", "换一种说法"];
})();
