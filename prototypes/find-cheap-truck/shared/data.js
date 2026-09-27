/* 找特价车 · 模拟数据（纯前端原型） */
window.HDZ = window.HDZ || {};

HDZ.now = new Date('2026-09-27T09:20:00');

/* 车型、板长、装备、常拉品种 */
HDZ.VEHICLE_TYPES = [
  { id: 'flat',  name: '平板半挂', desc: '钢材主力车型，卷/板/长材通用' },
  { id: 'low',   name: '低平板',   desc: '重型、超高件、设备' },
  { id: 'fence', name: '高栏',     desc: '管材、小件、加固货' },
  { id: 'warehouse', name: '仓栏/厢式', desc: '怕雨小件、线材' },
  { id: 'single', name: '单桥/前四后八', desc: '短驳、市区、小吨位' },
  { id: 'dump',  name: '自卸',     desc: '废钢、散料' },
];
HDZ.LENGTHS = ['6.8m', '9.6m', '13m', '17.5m', '其他'];
HDZ.EQUIP = [
  { id: 'saddle', name: '鞍座', tip: '装卷板必需，防滚动' },
  { id: 'tarp',   name: '篷布', tip: '薄板/冷轧/镀锌怕雨' },
  { id: 'strap',  name: '绑带/链条', tip: '长材、型材捆扎固定' },
  { id: 'corner', name: '护角/垫木', tip: '保护板边、卷边不压伤' },
  { id: 'long',   name: '可装 12m 长材', tip: '螺纹钢、槽钢定尺 12 米' },
  { id: 'multi',  name: '可多点装卸', tip: '同方向多个工地/仓库' },
  { id: 'gps',    name: '车载定位', tip: '可开放在途位置' },
];
HDZ.STEELS = ['热卷', '冷轧/镀锌', '中厚板', '螺纹钢', '型钢（H型/槽/角）', '钢管', '线材', '不锈钢'];

/* 说明模板短句（发布 / 添加车辆 用） */
HDZ.DESC_TEMPLATES = [
  '常年拉钢材，装卸熟练',
  '配鞍座可装卷板',
  '篷布齐全，薄板不淋雨',
  '可多点装、多点卸',
  '可进仓库过磅，配合出库手续',
  '有钢厂/大仓提货经验',
  '价格好商量，回程只求不放空',
  '不超载，按合规吨位装',
  '可加急，随叫随走',
];

/* 线路参考价（元/吨，基于历史撮合与市场询价，原型为模拟数值） */
HDZ.REF_PRICE = {
  '上海-杭州': [40, 46], '上海-嘉兴': [30, 34], '上海-苏州': [28, 33], '上海-南京': [60, 68], '上海-宁波': [58, 66],
  '嘉兴-上海': [30, 34], '杭州-上海': [40, 46], '苏州-上海': [28, 33], '南京-上海': [60, 68], '宁波-上海': [58, 66],
  '无锡-上海': [34, 40], '常州-上海': [46, 52], '上海-无锡': [34, 40], '上海-常州': [46, 52], '南通-上海': [36, 42],
  '杭州-宁波': [40, 46], '唐山-天津': [38, 44], '天津-北京': [40, 46], '佛山-广州': [22, 26], '乐从-深圳': [45, 52],
};
HDZ.refPrice = function (from, to) {
  var k = from + '-' + to;
  return HDZ.REF_PRICE[k] || [38, 46];
};

/* 司机 */
HDZ.DRIVERS = {
  d1: { id: 'd1', name: '王师傅', surname: '王', years: 12, steelYears: 8, wyOrders: 126, good: 98, valid: 96, complaints: 0, phone: '138****6210', phoneFull: '138 2201 6210', certs: ['实名+人脸', '驾驶证 A2', '从业资格证', '行驶证', '道路运输证'], joined: '2024-03', steels: ['热卷', '中厚板', '螺纹钢'], intro: '常年跑宝山、张家港大仓到江浙工地，卷板有鞍座，认真负责不放鸽子。' },
  d2: { id: 'd2', name: '李师傅', surname: '李', years: 9, steelYears: 5, wyOrders: 64, good: 96, valid: 91, complaints: 1, phone: '139****3327', phoneFull: '139 1066 3327', certs: ['实名+人脸', '驾驶证 A2', '从业资格证', '行驶证', '道路运输证'], joined: '2024-11', steels: ['螺纹钢', '型钢（H型/槽/角）', '钢管'], intro: '主要拉螺纹钢、型材到工地，可多点卸货，工地路况熟。' },
  d3: { id: 'd3', name: '陈师傅', surname: '陈', years: 15, steelYears: 11, wyOrders: 212, good: 99, valid: 98, complaints: 0, phone: '137****8890', phoneFull: '137 6155 8890', certs: ['实名+人脸', '驾驶证 A2', '从业资格证', '行驶证', '道路运输证'], joined: '2023-08', steels: ['热卷', '冷轧/镀锌', '不锈钢'], intro: '带篷布，冷轧、镀锌、不锈钢不淋雨；自备护角垫木。' },
  d4: { id: 'd4', name: '赵师傅', surname: '赵', years: 6, steelYears: 2, wyOrders: 18, good: 94, valid: 88, complaints: 0, phone: '150****4412', phoneFull: '150 0021 4412', certs: ['实名+人脸', '驾驶证 A2', '行驶证'], joined: '2026-05', steels: ['螺纹钢', '钢管'], intro: '高栏车，管材、小件、加固货都可以。' },
  d5: { id: 'd5', name: '周师傅', surname: '周', years: 11, steelYears: 9, wyOrders: 97, good: 97, valid: 95, complaints: 0, phone: '136****7756', phoneFull: '136 5183 7756', certs: ['实名+人脸', '驾驶证 A2', '从业资格证', '行驶证', '道路运输证'], joined: '2024-06', steels: ['热卷', '中厚板'], intro: '17.5 米大板，鞍座 4 组，一车 32 吨卷板正好。' },
  d6: { id: 'd6', name: '吴师傅', surname: '吴', years: 8, steelYears: 6, wyOrders: 41, good: 95, valid: 93, complaints: 0, phone: '135****2098', phoneFull: '135 8890 2098', certs: ['实名+人脸', '驾驶证 B2', '从业资格证', '行驶证', '道路运输证'], joined: '2025-02', steels: ['螺纹钢', '线材'], intro: '9.6 米单桥，市区短驳、工地小批量首选。' },
};

/* 车辆 */
HDZ.VEHICLES = {
  v1: { id: 'v1', plate: '沪D·8K3**', plateFull: '沪D 8K372', type: '平板半挂', len: '17.5m', load: 32, equip: ['鞍座', '篷布', '绑带/链条', '可装 12m 长材', '车载定位'], year: 2021, verified: true, desc: '17.5 米平板半挂，核载 32 吨，配鞍座 4 组可装卷板，篷布齐全，常年拉钢材。' },
  v2: { id: 'v2', plate: '苏E·3F1**', plateFull: '苏E 3F168', type: '平板半挂', len: '13m', load: 30, equip: ['绑带/链条', '可装 12m 长材', '可多点装卸'], year: 2020, verified: true, desc: '13 米平板，螺纹钢、型材 12 米定尺没问题，可多点卸货。' },
  v3: { id: 'v3', plate: '浙A·6L9**', plateFull: '浙A 6L920', type: '平板半挂', len: '13m', load: 30, equip: ['鞍座', '篷布', '护角/垫木', '车载定位'], year: 2022, verified: true, desc: '13 米平板带篷布，冷轧、镀锌、不锈钢专用，自备护角垫木。' },
  v4: { id: 'v4', plate: '皖A·2T5**', plateFull: '皖A 2T588', type: '高栏', len: '13m', load: 28, equip: ['绑带/链条', '可多点装卸'], year: 2019, verified: false, desc: '13 米高栏，钢管、小件。' },
  v5: { id: 'v5', plate: '苏B·9C6**', plateFull: '苏B 9C610', type: '平板半挂', len: '17.5m', load: 32, equip: ['鞍座', '绑带/链条', '车载定位'], year: 2023, verified: true, desc: '17.5 米大板，鞍座 4 组，卷板专拉。' },
  v6: { id: 'v6', plate: '沪C·5M2**', plateFull: '沪C 5M217', type: '单桥/前四后八', len: '9.6m', load: 15, equip: ['绑带/链条', '可多点装卸'], year: 2021, verified: true, desc: '9.6 米单桥，市区短驳、工地小批量。' },
};

/* 运力信息（找车方看到的） */
HDZ.POSTS = [
  { id: 'p1001', kind: 'return', from: '嘉兴', fromDetail: '南湖区 · 距您搜索出发地 28km', to: ['上海'], toDetail: '宝山 / 松江 / 浦东 均可', depart: '今天 14:00-20:00', validUntil: '2026-09-27T20:00:00', price: 28, priceUnit: '吨', spareTons: 32, driver: 'd1', vehicle: 'v1', posted: '2026-09-27T08:55:00', views: 128, calls: 6, favs: 3, desc: '早上宝山提的卷到嘉兴卸完，下午空车回上海，顺路带一车不放空。有鞍座，卷板板材都行，价格好谈。', locOK: true, status: 'active' },
  { id: 'p1002', kind: 'return', from: '杭州', fromDetail: '萧山区', to: ['上海', '苏州'], toDetail: '上海全境 / 苏州昆山太仓', depart: '明天 06:00-12:00', validUntil: '2026-09-28T12:00:00', price: 36, priceUnit: '吨', spareTons: 30, driver: 'd3', vehicle: 'v3', posted: '2026-09-27T07:40:00', views: 96, calls: 4, favs: 5, desc: '带篷布，冷轧镀锌不淋雨。明早萧山卸货后回程，上海苏州方向都可以。', locOK: true, status: 'active' },
  { id: 'p1003', kind: 'idle', from: '上海', fromDetail: '宝山区 · 车在宝山大仓附近', to: ['方向不限'], toDetail: '江浙沪 300km 内均可', depart: '今天起 3 天内', validUntil: '2026-09-30T00:00:00', price: null, priceUnit: '吨', spareTons: 32, driver: 'd5', vehicle: 'v5', posted: '2026-09-26T18:20:00', views: 210, calls: 11, favs: 9, desc: '车在宝山闲两三天，江浙沪哪都去。17.5 米大板鞍座 4 组，一车 32 吨卷正好。价格面议，肯定比市场便宜。', locOK: true, status: 'active' },
  { id: 'p1004', kind: 'share', from: '上海', fromDetail: '松江区', to: ['南京'], toDetail: '沿线 苏州/无锡/常州 可捎', depart: '明天 08:00 左右', validUntil: '2026-09-28T08:00:00', price: 55, priceUnit: '吨', spareTons: 12, driver: 'd2', vehicle: 'v2', posted: '2026-09-27T09:02:00', views: 42, calls: 1, favs: 2, desc: '明早松江装 18 吨螺纹钢去南京江宁，还剩 12 吨位，沿线苏锡常可捎，12 米定尺没问题。', locOK: true, status: 'active' },
  { id: 'p1005', kind: 'return', from: '南京', fromDetail: '江宁区', to: ['上海'], toDetail: '上海 / 嘉兴', depart: '今天 16:00 后', validUntil: '2026-09-27T23:00:00', price: 52, priceUnit: '吨', spareTons: 30, driver: 'd2', vehicle: 'v2', posted: '2026-09-27T06:30:00', views: 77, calls: 3, favs: 1, desc: '今天江宁工地卸完回上海，晚上走，明早到。', locOK: true, status: 'active' },
  { id: 'p1006', kind: 'idle', from: '上海', fromDetail: '闵行区', to: ['上海市内', '苏州', '嘉兴'], toDetail: '短驳 150km 内', depart: '随时', validUntil: '2026-09-29T00:00:00', price: 850, priceUnit: '车', spareTons: 15, driver: 'd6', vehicle: 'v6', posted: '2026-09-27T08:10:00', views: 55, calls: 2, favs: 0, desc: '9.6 米单桥闲着，市内短驳、工地小批量螺纹钢线材随叫随走，按车算。', locOK: true, status: 'active' },
  { id: 'p1007', kind: 'return', from: '苏州', fromDetail: '张家港', to: ['上海'], toDetail: '宝山 / 嘉定 / 青浦', depart: '明天 10:00-16:00', validUntil: '2026-09-28T16:00:00', price: 27, priceUnit: '吨', spareTons: 32, driver: 'd1', vehicle: 'v1', posted: '2026-09-27T09:15:00', views: 12, calls: 0, favs: 0, desc: '明天张家港卸完回上海，正常 30 左右，回程 27 就走。', locOK: true, status: 'active' },
  { id: 'p1008', kind: 'return', from: '宁波', fromDetail: '北仑区', to: ['上海'], toDetail: '上海全境', depart: '后天 06:00-12:00', validUntil: '2026-09-29T12:00:00', price: 54, priceUnit: '吨', spareTons: 28, driver: 'd4', vehicle: 'v4', posted: '2026-09-26T21:00:00', views: 33, calls: 1, favs: 1, desc: '高栏车，管材小件合适。', locOK: false, status: 'active' },
];

/* 驾驶员自己的运力（悟运端） */
HDZ.MY_POSTS = [
  { id: 'p1001', kind: 'return', from: '嘉兴', to: ['上海'], toDetail: '宝山 / 松江 / 浦东 均可', depart: '今天 14:00-20:00', validUntil: '2026-09-27T20:00:00', price: 28, priceUnit: '吨', vehicle: 'v1', posted: '2026-09-27T08:55:00', views: 128, calls: 6, favs: 3, status: 'active', feedback: [{ who: '上海某钢贸 · 认证企业', what: '已电话联系', when: '09:05' }, { who: '嘉兴某建筑公司', what: '已电话联系', when: '09:12' }] },
  { id: 'p1007', kind: 'return', from: '苏州', to: ['上海'], toDetail: '宝山 / 嘉定 / 青浦', depart: '明天 10:00-16:00', validUntil: '2026-09-28T16:00:00', price: 27, priceUnit: '吨', vehicle: 'v1', posted: '2026-09-27T09:15:00', views: 12, calls: 0, favs: 0, status: 'active', feedback: [] },
  { id: 'p0991', kind: 'return', from: '上海', to: ['嘉兴'], depart: '9月25日 14:00-20:00', validUntil: '2026-09-25T20:00:00', price: 30, priceUnit: '吨', vehicle: 'v1', posted: '2026-09-25T08:00:00', views: 143, calls: 8, favs: 4, status: 'booked', endReason: '已接到生意（货袋子用户 · 上海某钢贸）', endAt: '9月25日 10:42' },
  { id: 'p0985', kind: 'idle', from: '上海', to: ['方向不限'], depart: '9月22日起 2 天内', validUntil: '2026-09-24T00:00:00', price: null, priceUnit: '吨', vehicle: 'v1', posted: '2026-09-22T09:30:00', views: 88, calls: 2, favs: 1, status: 'expired', endReason: '有效期到，系统自动下架', endAt: '9月24日 00:00' },
  { id: 'p0979', kind: 'return', from: '南京', to: ['上海'], depart: '9月20日 16:00 后', validUntil: '2026-09-20T23:00:00', price: 52, priceUnit: '吨', vehicle: 'v1', posted: '2026-09-20T07:00:00', views: 61, calls: 3, favs: 0, status: 'departed', endReason: '司机标记「已出发」', endAt: '9月20日 17:20' },
  { id: 'p0970', kind: 'return', from: '杭州', to: ['上海'], depart: '9月18日 全天', validUntil: '2026-09-18T23:00:00', price: 38, priceUnit: '吨', vehicle: 'v1', posted: '2026-09-18T06:10:00', views: 40, calls: 1, favs: 0, status: 'withdrawn', endReason: '司机手动下架（线下接了熟客）', endAt: '9月18日 09:30' },
];

HDZ.MY_VEHICLES = [
  Object.assign({}, HDZ.VEHICLES.v1, { isDefault: true, photos: 3, docs: { license: 'ok', transport: 'ok' } }),
  Object.assign({}, HDZ.VEHICLES.v6, { plate: '沪C·5M2**', isDefault: false, photos: 2, docs: { license: 'ok', transport: 'pending' } }),
];

/* 当前悟运运单（用于"卸货后一键发返程"） */
HDZ.CURRENT_ORDER = { no: 'WY20260927001', from: '上海宝山 · 宝钢大仓', to: '嘉兴南湖 · 恒源钢构', goods: '热卷 31.6t', status: '在途', eta: '预计 11:30 到达卸货', vehicle: 'v1' };

HDZ.KIND = {
  return: { name: '返程车', short: '返程', cls: 'hot', tip: '卸完货空车回程，运费最有优势' },
  idle:   { name: '闲置车', short: '闲置', cls: 'idle', tip: '车在等货，方向灵活、时间灵活' },
  share:  { name: '顺路捎货', short: '顺路', cls: 'share', tip: '已有货但没装满，沿线可捎' },
};
HDZ.STATUS = {
  active: { name: '展示中', cls: 'st-active' },
  confirming: { name: '待确认', cls: 'st-confirming' },
  pending: { name: '待核验', cls: 'st-pending' },
  expired: { name: '已到期', cls: 'st-expired' },
  departed: { name: '已出发', cls: 'st-departed' },
  booked: { name: '已接单', cls: 'st-booked' },
  withdrawn: { name: '已下架', cls: 'st-withdrawn' },
};

HDZ.HOT_ROUTES = ['上海 → 杭州', '上海 → 南京', '嘉兴 → 上海', '苏州 → 上海', '宁波 → 上海', '无锡 → 上海'];
HDZ.CITIES = ['上海', '苏州', '无锡', '常州', '南京', '南通', '杭州', '嘉兴', '宁波', '湖州', '绍兴', '合肥', '方向不限'];
