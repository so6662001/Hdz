/* 货袋子 · 行情海报落地页原型 — 模拟数据
 * 真实环境由平台行情服务 + 商家现货资源 + 销售员名片动态注入 */
window.HDZ = window.HDZ || {};

HDZ.data = {
  platform: { name: "货袋子", slogan: "钢铁现货资源平台" },
  date: "2026-09-12",
  weekday: "周六",
  lunar: "农历八月初二",
  spreadCode: "HDZ-9F3K2A",

  company: {
    name: "上海鑫钢贸易有限公司",
    short: "鑫钢贸易",
    logoText: "鑫",
    slogan: "华东现货 · 一手货源 · 当日提货",
    tags: ["沙钢一级代理", "宝山库自提", "开票即发"],
    address: "上海市宝山区宝杨路 1000 号钢材市场 A 区",
    years: 12,
    dealsThisYear: "18.6 万吨"
  },

  sales: {
    name: "王建国",
    title: "销售总监",
    avatar: "王",
    phone: "138 0000 8888",
    wechat: "xingang_wang",
    intro: "12 年钢贸从业，华东建材/板材现货，报价实在、提货快。"
  },

  quotes: [
    { name: "螺纹钢", spec: "HRB400E Φ16-25", region: "上海", price: 3680, change: 20 },
    { name: "热轧卷板", spec: "Q235B 5.75×1500", region: "上海", price: 3750, change: -10 },
    { name: "线材", spec: "HPB300 Φ8-10", region: "上海", price: 3890, change: 30 },
    { name: "中厚板", spec: "Q235B 20mm", region: "上海", price: 3820, change: 0 },
    { name: "冷轧卷板", spec: "SPCC 1.0×1250", region: "上海", price: 4380, change: -20 },
    { name: "镀锌板", spec: "DX51D+Z 1.0×1250", region: "上海", price: 4560, change: 10 }
  ],

  trend: [3610, 3625, 3620, 3640, 3655, 3650, 3660, 3680],
  trendLabels: ["9/5", "9/6", "9/7", "9/8", "9/9", "9/10", "9/11", "9/12"],

  comment:
    "今日沪市建材小幅上涨。周末成交一般，商家心态偏稳，钢厂调价预期偏强，下周初或延续小涨。刚需可适量备货。",

  resources: [
    { name: "螺纹钢", spec: "Φ16 HRB400E", mill: "沙钢", warehouse: "宝山库", qty: 320, price: 3690, tag: "现货" },
    { name: "螺纹钢", spec: "Φ20 HRB400E", mill: "永钢", warehouse: "宝山库", qty: 186, price: 3670, tag: "特价" },
    { name: "热轧卷板", spec: "5.75×1500 Q235B", mill: "日照", warehouse: "月浦库", qty: 240, price: 3760, tag: "现货" },
    { name: "线材", spec: "Φ8 HPB300", mill: "中天", warehouse: "宝山库", qty: 95, price: 3900, tag: "少量" },
    { name: "中厚板", spec: "20×2200 Q235B", mill: "鞍钢", warehouse: "罗泾库", qty: 150, price: 3830, tag: "现货" },
    { name: "镀锌板", spec: "1.0×1250 DX51D", mill: "宝钢", warehouse: "月浦库", qty: 60, price: 4570, tag: "新到" }
  ],

  stats: { views: 1286, leads: 37, shares: 214 }
};
