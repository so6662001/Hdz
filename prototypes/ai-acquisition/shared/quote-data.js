/* 货袋子 · 报价工作台 · 演示数据（接单方案引擎输入：客户 / 规格 / 库存 / 货源 / 物流 / 拼车窗口 / 询价 / 参数） */
(function (w) {
  const VERSION = 'acq:quote:v2';
  const NOW = Date.now(), H = 3600e3, D = 24 * H;
  const ago = (h) => NOW - h * H;

  function build() {
    /* 规格目录：key = 品名|材质|规格 ；index = 本地市场指数（苏州，含税）
     * unit 结算单位（默认 吨）；kgPerM 理重（kg/m）与 stdLen 定尺（m）用于「支 / 根 / 米」换算；
     * kgPerPiece 单件重量（管件，按 个 / 片 结算）；marginAdd 品类目标毛利加成（元/吨）；band 市场带覆盖 */
    const pipe = (name, index, kgPerM, extra) => Object.assign({ name, index, unit: '吨', kgPerM, stdLen: 6, marginAdd: 60, band: { low: -40, high: 60 }, bandBasis: 'exw' }, extra || {});
    const piece = (name, index, kgPerPiece) => ({ name, index, unit: '个', kgPerPiece });
    const specs = {
      /* —— 管型材（量小而杂，按 支 / 米 询、按吨结）—— */
      '镀锌管|Q235B|DN100×3.75': pipe('镀锌管 Q235B DN100×3.75（4 寸）', 4620, 10.6, { dn: 100, inch: 4 }),
      '镀锌管|Q235B|DN50×3.0': pipe('镀锌管 Q235B DN50×3.0（2 寸）', 4680, 4.39, { dn: 50, inch: 2 }),
      '镀锌管|Q235B|DN25×2.75': pipe('镀锌管 Q235B DN25×2.75（1 寸）', 4750, 2.17, { dn: 25, inch: 1 }),
      '焊管|Q235B|DN100×3.75': pipe('焊管 Q235B DN100×3.75（4 寸）', 4180, 10.19, { dn: 100, inch: 4 }),
      '焊管|Q235B|DN50×3.0': pipe('焊管 Q235B DN50×3.0（2 寸）', 4230, 4.22, { dn: 50, inch: 2 }),
      '无缝管|20#|Φ108×4': pipe('无缝管 20# Φ108×4', 4850, 10.26, { marginAdd: 80 }),
      '方管|Q235B|50×50×2.5': pipe('方管 Q235B 50×50×2.5', 4260, 3.73),
      '角钢|Q235B|50×5': pipe('角钢 Q235B 50×5', 4020, 3.77, { marginAdd: 40 }),
      '槽钢|Q235B|10#': pipe('槽钢 Q235B 10#', 4050, 10.0, { marginAdd: 40 }),
      '弯头|碳钢|DN100': piece('冲压弯头 碳钢 DN100', 36, 1.6),
      '弯头|碳钢|DN50': piece('冲压弯头 碳钢 DN50', 9, 0.45),
      '法兰|碳钢|DN100': Object.assign(piece('平焊法兰 碳钢 DN100', 30, 2.2), { unit: '片' }),
      /* —— 建材 / 板材 / 型钢 —— */
      '螺纹钢|HRB400E|Φ12': { name: '螺纹钢 HRB400E Φ12', index: 3830, unit: '吨' },
      '螺纹钢|HRB400E|Φ16': { name: '螺纹钢 HRB400E Φ16', index: 3800, unit: '吨' },
      '螺纹钢|HRB400E|Φ20': { name: '螺纹钢 HRB400E Φ20', index: 3800, unit: '吨' },
      '螺纹钢|HRB400E|Φ25': { name: '螺纹钢 HRB400E Φ25', index: 3810, unit: '吨' },
      '盘螺|HRB400E|Φ8': { name: '盘螺 HRB400E Φ8', index: 3930, unit: '吨' },
      '盘螺|HRB400E|Φ10': { name: '盘螺 HRB400E Φ10', index: 3900, unit: '吨' },
      '盘螺|HRB400E|Φ12': { name: '盘螺 HRB400E Φ12', index: 3930, unit: '吨' },
      '线材|HPB300|Φ8': { name: '高线 HPB300 Φ8', index: 3920, unit: '吨' },
      'H型钢|Q355B|200×200': { name: 'H 型钢 Q355B 200×200', index: 3980, unit: '吨' },
      'H型钢|Q355B|300×300': { name: 'H 型钢 Q355B 300×300', index: 4010, unit: '吨' },
      '中板|Q355B|12mm': { name: '中板 Q355B 12 mm', index: 3960, unit: '吨' },
      '中板|Q235B|10mm': { name: '中板 Q235B 10 mm', index: 3780, unit: '吨' },
      '热卷|Q235B|5.75mm': { name: '热轧卷 Q235B 5.75 mm', index: 3740, unit: '吨' },
      '方管|Q235B|100×100×4': pipe('方管 Q235B 100×100×4', 4150, 12.06),
    };
    /* 寸 → DN 对照（询价常说「4 寸管」） */
    const inchToDn = { 0.5: 15, 0.75: 20, 1: 25, 1.2: 32, 1.25: 32, 1.5: 40, 2: 50, 2.5: 65, 3: 80, 4: 100, 5: 125, 6: 150 };
    /* 区域与距离（公里）：仓库 / 货源 / 客户都挂在区域上 */
    const zones = { XC: '苏州 相城', SIP: '苏州 园区', WZ: '苏州 吴中', KS: '昆山', WX: '无锡', ZJG: '张家港', NT: '南通' };
    const dist = {
      XC: { XC: 10, SIP: 22, WZ: 30, KS: 38, WX: 45, ZJG: 70, NT: 115 },
      SIP: { XC: 22, SIP: 8, WZ: 18, KS: 25, WX: 62, ZJG: 85, NT: 120 },
      WZ: { XC: 30, SIP: 18, WZ: 8, KS: 40, WX: 70, ZJG: 95, NT: 135 },
      KS: { XC: 38, SIP: 25, WZ: 40, KS: 8, WX: 75, ZJG: 90, NT: 110 },
      ZJG: { XC: 70, SIP: 85, WZ: 95, KS: 90, WX: 55, ZJG: 8, NT: 60 },
    };
    const warehouses = { W1: { name: '相城主仓', zone: 'XC' }, W2: { name: '园区加工配送点', zone: 'SIP' } };
    /* 自有库存：qty 可用（已扣锁定），cost 加权成本，age 库龄天 */
    const inventory = [
      { wh: 'W1', key: '螺纹钢|HRB400E|Φ20', qty: 46, locked: 12, cost: 3720, age: 22 },
      { wh: 'W1', key: '螺纹钢|HRB400E|Φ16', qty: 18, locked: 0, cost: 3735, age: 48 },
      { wh: 'W1', key: '螺纹钢|HRB400E|Φ25', qty: 31, locked: 6, cost: 3715, age: 15 },
      { wh: 'W1', key: '盘螺|HRB400E|Φ10', qty: 9, locked: 0, cost: 3810, age: 53 },
      { wh: 'W1', key: '线材|HPB300|Φ8', qty: 12, locked: 0, cost: 3835, age: 31 },
      { wh: 'W2', key: 'H型钢|Q355B|200×200', qty: 24, locked: 0, cost: 3880, age: 19 },
      { wh: 'W2', key: '中板|Q355B|12mm', qty: 15, locked: 5, cost: 3860, age: 40 },
      { wh: 'W2', key: '方管|Q235B|100×100×4', qty: 6, locked: 0, cost: 4040, age: 67 },
      /* 管型材：吨数小、件数多；管件按 个 */
      { wh: 'W1', key: '方管|Q235B|50×50×2.5', qty: 2.1, locked: 0, cost: 4180, age: 30 },
      { wh: 'W1', key: '镀锌管|Q235B|DN50×3.0', qty: 1.4, locked: 0, cost: 4590, age: 58 },
      { wh: 'W1', key: '角钢|Q235B|50×5', qty: 3.2, locked: 0, cost: 3930, age: 21 },
      { wh: 'W1', key: '弯头|碳钢|DN100', qty: 40, locked: 0, cost: 28, age: 90 },
      { wh: 'W1', key: '弯头|碳钢|DN50', qty: 120, locked: 0, cost: 7, age: 90 },
    ];
    /* 外部货源：UPSTREAM 上游（钢厂代理 / 一级商）、PLATFORM 货袋子平台其他商家挂牌、MARKET 同一钢材市场内档口互调（距离 0、当天、含搬运费 pickFee 元/吨） */
    const suppliers = [
      { id: 'S6', type: 'MARKET', name: '市场内 · 友发总代（B 区 12 号）', zone: 'XC', offers: [
        { key: '镀锌管|Q235B|DN100×3.75', price: 4530, qty: 30, moq: 0, leadH: 1, dropship: false, pickFee: 15, t: ago(1.5) },
        { key: '镀锌管|Q235B|DN50×3.0', price: 4600, qty: 20, moq: 0, leadH: 1, dropship: false, pickFee: 15, t: ago(1.5) },
        { key: '焊管|Q235B|DN100×3.75', price: 4090, qty: 40, moq: 0, leadH: 1, dropship: false, pickFee: 15, t: ago(1.5) },
      ] },
      { id: 'S7', type: 'MARKET', name: '市场内 · 鑫达型材（C 区 3 号）', zone: 'XC', offers: [
        { key: '方管|Q235B|50×50×2.5', price: 4210, qty: 8, moq: 0, leadH: 1, dropship: false, pickFee: 15, t: ago(0.8) },
        { key: '槽钢|Q235B|10#', price: 3960, qty: 15, moq: 0, leadH: 1, dropship: false, pickFee: 15, t: ago(0.8) },
        { key: '法兰|碳钢|DN100', price: 24, qty: 60, moq: 0, leadH: 1, dropship: false, pickFee: 0, t: ago(0.8) },
      ] },
      { id: 'S1', type: 'UPSTREAM', name: '沙钢代理 · 相城库', zone: 'XC', offers: [
        { key: '盘螺|HRB400E|Φ12', price: 3850, qty: 120, moq: 10, leadH: 4, dropship: true, dropFee: 30, t: ago(2) },
        { key: '螺纹钢|HRB400E|Φ12', price: 3790, qty: 200, moq: 10, leadH: 4, dropship: true, dropFee: 30, t: ago(2) },
        { key: '盘螺|HRB400E|Φ8', price: 3890, qty: 60, moq: 10, leadH: 4, dropship: true, dropFee: 30, t: ago(2) },
      ] },
      { id: 'S2', type: 'UPSTREAM', name: '永钢一级商 · 吴中库', zone: 'WZ', offers: [
        { key: '盘螺|HRB400E|Φ12', price: 3835, qty: 80, moq: 0, leadH: 20, dropship: false, t: ago(5) },
        { key: '螺纹钢|HRB400E|Φ20', price: 3745, qty: 300, moq: 30, leadH: 20, dropship: false, t: ago(5) },
        { key: '线材|HPB300|Φ8', price: 3850, qty: 40, moq: 0, leadH: 20, dropship: false, t: ago(5) },
      ] },
      { id: 'S3', type: 'PLATFORM', name: '平台商家 · 苏州某钢贸（相城）', zone: 'XC', offers: [
        { key: '盘螺|HRB400E|Φ12', price: 3865, qty: 28, moq: 0, leadH: 3, dropship: true, dropFee: 25, t: ago(1) },
        { key: '螺纹钢|HRB400E|Φ12', price: 3815, qty: 40, moq: 0, leadH: 3, dropship: true, dropFee: 25, t: ago(1) },
      ] },
      { id: 'S4', type: 'PLATFORM', name: '平台商家 · 昆山某物资', zone: 'KS', offers: [
        { key: 'H型钢|Q355B|300×300', price: 3925, qty: 36, moq: 0, leadH: 6, dropship: true, dropFee: 45, t: ago(3) },
        { key: '中板|Q235B|10mm', price: 3700, qty: 50, moq: 5, leadH: 6, dropship: true, dropFee: 45, t: ago(9) },
      ] },
      { id: 'S5', type: 'UPSTREAM', name: '鞍钢代理 · 张家港库', zone: 'ZJG', offers: [
        { key: '热卷|Q235B|5.75mm', price: 3660, qty: 500, moq: 25, leadH: 24, dropship: true, dropFee: 60, t: ago(4) },
        { key: '中板|Q355B|12mm', price: 3845, qty: 200, moq: 20, leadH: 24, dropship: true, dropFee: 60, t: ago(4) },
      ] },
    ];
    /* 物流：整车 / 零担价表（元），按起运区域 → 目的区域距离分段 */
    const logistics = {
      trucks: [{ name: '9.6 m 平板', cap: 18 }, { name: '13 m 平板', cap: 32 }],
      tripFee(km, cap) { const base = cap >= 30 ? 520 : 380; return Math.round(base + km * (cap >= 30 ? 9 : 6.5)); },
      handling: 8,             // 装卸 元/吨
      minLtlFee: 300,          // 零担最低一趟
      /* 市区配送（管型材零碎单）：整单一车按总重选车型，一趟费 = 起步 + 公里 × 单价；超过 10 t 走专车 */
      cityTrucks: [{ name: '三轮 / 小厢货', cap: 1.5, base: 120, perKm: 3 }, { name: '4.2 m 货车', cap: 5, base: 220, perKm: 5 }, { name: '6.8 m 货车', cap: 10, base: 320, perKm: 7 }],
      cityTrip(km, tons) { const t = this.cityTrucks.find(x => tons <= x.cap); return t ? { truck: t.name, fee: Math.round(t.base + km * t.perKm) } : null; },
    };
    /* 拼车窗口：已排定或在途的车，剩余吨位可带货 */
    const windows = [
      { id: 'TW1', date: NOW + D, label: '明天上午', originWh: 'W1', zone: 'XC', remaining: 14, cap: 32, pricePerTon: 25, note: '发 相城 · 智能装备产业园 / 黄埭工地' },
      { id: 'TW2', date: NOW + 2 * D, label: '后天', originWh: 'W1', zone: 'SIP', remaining: 9, cap: 18, pricePerTon: 30, note: '发 园区 · 唯亭' },
      { id: 'TW3', date: NOW + D, label: '明天下午', originWh: 'W2', zone: 'KS', remaining: 11, cap: 18, pricePerTon: 35, note: '发 昆山 · 花桥' },
    ];
    /* 客户：grade A 核心 / B 常规 / C 零散 / N 新客户 */
    const customers = [
      { id: 'CU1', name: '中建某局华东分公司 · 智能装备产业园项目部', contact: '李工', leadId: 'L033', projectId: 'PJ1', grade: 'B', zone: 'XC', addr: '相城区 智能装备产业园二期工地', km: 18, creditLimit: 300000, creditUsed: 118000, terms: 30, overdue: false, hist: { '螺纹钢|HRB400E|Φ20': 3790, '盘螺|HRB400E|Φ12': 3905 }, deals: 6 },
      { id: 'CU2', name: '苏州某机械制造有限公司', contact: '张总', leadId: 'L001', grade: 'A', zone: 'SIP', addr: '园区 唯亭 厂区', km: 20, creditLimit: 500000, creditUsed: 90000, terms: 45, overdue: false, hist: { 'H型钢|Q355B|200×200': 3965, '中板|Q355B|12mm': 3940 }, deals: 23 },
      { id: 'CU3', name: '昆山某钢结构工程', contact: '周总', leadId: 'L002', grade: 'C', zone: 'KS', addr: '昆山 花桥 加工厂', km: 36, creditLimit: 80000, creditUsed: 76000, terms: 0, overdue: true, hist: { 'H型钢|Q355B|300×300': 4000 }, deals: 3 },
      { id: 'CU4', name: '张家港某钢构有限公司', contact: '徐厂长', leadId: null, grade: 'N', zone: 'ZJG', addr: '张家港 杨舍镇', km: 70, creditLimit: 0, creditUsed: 0, terms: 0, overdue: false, hist: {}, deals: 0 },
      { id: 'CU5', name: '苏州某建筑劳务（黄埭工地）', contact: '王经理', leadId: 'L006', grade: 'B', zone: 'XC', addr: '相城 黄埭 安置房工地', km: 14, creditLimit: 150000, creditUsed: 20000, terms: 15, overdue: false, hist: { '螺纹钢|HRB400E|Φ16': 3800 }, deals: 4 },
      { id: 'CU6', name: '苏州某装饰工程（郭巷项目）', contact: '赵老板', leadId: null, grade: 'B', zone: 'WZ', addr: '吴中 郭巷 商业街改造工地', km: 25, creditLimit: 60000, creditUsed: 8000, terms: 15, overdue: false, hist: { '方管|Q235B|50×50×2.5': 4330, '弯头|碳钢|DN100': 35 }, deals: 9 },
    ];
    /* 询价：原文（微信 / 语音 / 企微 / 电话 / 平台） */
    const rfqs = [
      { id: 'Q1', t: ago(0.4), via: 'WECHAT', customerId: 'CU1', by: 2, status: 'NEW', raw: '李工：20 的螺纹来 8 吨，12 的盘螺 5 吨，送相城产业园工地，最好明天到。老价格还能做吗？' },
      { id: 'Q2', t: ago(1.2), via: 'VOICE', customerId: 'CU2', by: 2, status: 'NEW', raw: '（语音转写）张总：H 型钢 200×200 要 12 吨，12 个厚的 Q355 中板 6 吨，老地方，这周内到就行，账期照旧。' },
      { id: 'Q3', t: ago(2.5), via: 'PHONE', customerId: 'CU3', by: 3, status: 'NEW', raw: '周总电话：300×300 的 H 型钢 10 吨急用，后天前到花桥，问能不能先发货后付款。' },
      { id: 'Q4', t: ago(3.1), via: 'WECOM', customerId: 'CU4', by: 2, status: 'NEW', raw: '徐厂长：Q355B 中板 12mm 要 30 吨，5.75 热卷 20 吨，送张家港杨舍，报个到厂价，先合作一单看看。' },
      { id: 'Q5', t: ago(4.6), via: 'WECHAT', customerId: 'CU5', by: 2, status: 'NEW', raw: '王经理：16 的螺纹 3 吨，8 的盘螺 2 吨，黄埭工地，今天下午能送吗，我们自己也可以来拉。' },
      { id: 'Q7', t: ago(0.2), via: 'WECHAT', customerId: 'CU6', by: 3, status: 'NEW', raw: '赵老板：50×50×2.5 方管 30 支，4 寸镀锌管 20 支，DN100 弯头 10 个，送吴中郭巷工地，今天下午要，还是月结。' },
      { id: 'Q6', t: ago(26), via: 'HDZ', customerId: 'CU2', by: 2, status: 'SENT', raw: '平台询价：方管 100×100×4 共 6 吨，园区唯亭，自提。', quoteId: 'QT1' },
    ];
    const quotes = [
      { id: 'QT1', rfqId: 'Q6', t: ago(25), by: 2, decision: 'AUTO_SEND', status: 'ACCEPTED', total: 25020, margin: 480, lines: [{ key: '方管|Q235B|100×100×4', qty: 6, price: 4170, source: '相城主仓', mode: 'PICKUP', eta: '随时自提' }], note: '客户 1 小时内接受，已生成出库单' },
    ];
    /* 规则参数（商家可配，页面「规则参数」Tab 可改并即时重算） */
    const config = {
      targetMargin: { A: 30, B: 40, C: 55, N: 60 },   // 目标毛利 元/吨
      floorMargin: 15,                                   // 毛利下限 元/吨（低于则不自动发出）
      marketBand: { low: -30, high: 40 },                // 报价允许偏离市场指数区间
      histTolerance: 30,                                 // 高于客户上次成交价超过此值提示
      autoSend: { grades: ['A', 'B'], maxAmount: 150000, minMargin: 25 },
      transferMinQty: 5,                                 // 无拼车窗口时，调货最小吨位（低于则不单独调）
      consolidateMaxDays: 2,                             // 可接受的拼车等待天数
      offerStaleH: 6,                                    // 上游报价超过 N 小时视为过期
      quoteValidH: 4,                                    // 报价有效期（小时）
      creditCostAnnual: 0.10,                            // 账期资金成本（年化）
      pickupDiscount: 10,                                // 自提让利 元/吨
      platformFee: 5,                                    // 平台货源服务费 元/吨
      altSpecs: {                                        // 替代规格（需客户确认）
        '盘螺|HRB400E|Φ12': ['盘螺|HRB400E|Φ10', '螺纹钢|HRB400E|Φ12'],
        '盘螺|HRB400E|Φ8': ['线材|HPB300|Φ8', '盘螺|HRB400E|Φ10'],
        'H型钢|Q355B|300×300': [],
        '中板|Q235B|10mm': ['中板|Q355B|12mm'],
      },
      agingDays: 45,                                     // 库龄超过 N 天的库存优先出、可让利
      agingDiscount: 10,                                 // 老库存可额外让利 元/吨
      /* 管型材 / 管件扩展 */
      cityMaxKm: 60,                                     // 市区配送最远公里数（超过走专车）
      maxFreightPerTon: 300,                             // 单行运费上限 元/吨（超过视为不可行：客户不会接受）
      pieceMarginRate: 0.18,                             // 管件（按 个 / 片）目标毛利率
      pieceFloorRate: 0.06,                              // 管件毛利率下限
      pieceBand: { low: -0.08, high: 0.15 },             // 管件报价相对参考价的允许区间
      autoSendMinMarginRate: 0.08,                       // 管件行自动发出要求的最低毛利率
    };
    return { v: VERSION, specs, inchToDn, zones, dist, warehouses, inventory, suppliers, logistics, windows, customers, rfqs, quotes, config, NOW, D, H };
  }

  function load() {
    try { const s = JSON.parse(localStorage.getItem(VERSION)); if (s && s.v === VERSION) { const b = build(); s.logistics = b.logistics; s.specs = b.specs; s.inchToDn = b.inchToDn; s.dist = b.dist; s.zones = b.zones; s.warehouses = b.warehouses; return s; } } catch (e) { /* ignore */ }
    const b = build(); save(b); return b;
  }
  function save(s) { try { const c = Object.assign({}, s); delete c.logistics; localStorage.setItem(VERSION, JSON.stringify(c)); } catch (e) { /* ignore */ } }

  const Q = (typeof localStorage !== 'undefined') ? load() : build();
  Q.save = () => save(Q);
  Q.reset = () => { try { localStorage.removeItem(VERSION); } catch (e) { /* ignore */ } location.reload(); };
  Q.customer = (id) => Q.customers.find(c => c.id === id);
  Q.rfq = (id) => Q.rfqs.find(r => r.id === id);
  Q.quote = (id) => Q.quotes.find(q => q.id === id);
  Q.supplier = (id) => Q.suppliers.find(s => s.id === id);
  Q.specName = (key) => (Q.specs[key] || {}).name || key;
  Q.build = build;
  w.QUOTE = Q;
})(typeof window !== 'undefined' ? window : globalThis);
