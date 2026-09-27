/* 找顺路车 · 模拟数据（纯前端原型） */
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
/* 周边城市（约 50~100km，用于"周边出发"推荐） */
HDZ.NEAR = { '上海': ['嘉兴', '苏州'], '嘉兴': ['上海', '杭州', '湖州', '苏州'], '苏州': ['上海', '无锡', '嘉兴'], '杭州': ['嘉兴', '绍兴', '湖州'], '南京': ['常州'], '宁波': ['绍兴'], '无锡': ['苏州', '常州'] };

/* ---------- 用车需求（找车方发布的信息） ----------
   平台只做展示与按线路/时间/装备推荐，不派单、不接单、不确认成交、不定价。
   司机自己查看货主电话联系；货主自己查看匹配车辆电话联系。 */
HDZ.SHIPPERS = {
  s1: { id: 's1', company: '上海某钢贸有限公司', short: '沪', certified: true, contact: '张经理', phone: '138****0921', phoneFull: '138 0166 0921', needs: 23, found: 19, complaints: 0, since: '2021-04', tip: '货袋子认证企业 · 平台交易 386 单' },
  s2: { id: 's2', company: '杭州某建材有限公司', short: '杭', certified: true, contact: '周总', phone: '139****5580', phoneFull: '139 5711 5580', needs: 8, found: 7, complaints: 0, since: '2023-02', tip: '货袋子认证企业 · 平台交易 92 单' },
  s3: { id: 's3', company: '上海某建筑工程有限公司', short: '建', certified: true, contact: '李工', phone: '137****2264', phoneFull: '137 0192 2264', needs: 15, found: 11, complaints: 1, since: '2022-09', tip: '货袋子认证企业 · 平台采购 148 单' },
  s4: { id: 's4', company: '宁波某物资经营部', short: '甬', certified: false, contact: '陈先生', phone: '150****7731', phoneFull: '150 5847 7731', needs: 2, found: 1, complaints: 0, since: '2026-08', tip: '手机号实名 · 未做企业认证' },
  s5: { id: 's5', company: '苏州某钢结构有限公司', short: '苏', certified: true, contact: '王经理', phone: '136****9016', phoneFull: '136 6212 9016', needs: 31, found: 27, complaints: 0, since: '2020-11', tip: '货袋子认证企业 · 平台交易 512 单' },
  s6: { id: 's6', company: '南京某贸易有限公司', short: '宁', certified: true, contact: '赵经理', phone: '135****4488', phoneFull: '135 8451 4488', needs: 6, found: 5, complaints: 0, since: '2024-05', tip: '货袋子认证企业 · 平台交易 47 单' },
};

HDZ.NEEDS = [
  { id: 'n2001', shipper: 's1', from: '嘉兴', fromDetail: '南湖区 · 恒源钢构仓', to: ['上海'], toDetail: '宝山 · 某钢材市场', day: '今天', when: '今天 15:00-19:00 装车', validUntil: '2026-09-27T19:00:00',
    cargo: { steel: '热卷', tons: 31.6, pieces: '3 卷', note: '每卷约 10.5t，需鞍座固定' }, req: { type: '平板半挂', len: '17.5m', equip: ['鞍座'], whole: true },
    budget: 30, budgetUnit: '吨', posted: '2026-09-27T09:05:00', views: 46, calls: 3, status: 'active', source: 'order', orderNo: 'HD2609270019', desc: '嘉兴仓 3 卷热卷回上海宝山，下午装，今天到就行，现场有吊车。' },
  { id: 'n2002', shipper: 's2', from: '杭州', fromDetail: '萧山区 · 建材市场', to: ['上海'], toDetail: '松江 · 工地', day: '明天', when: '明天 上午 8:00-11:00 装车', validUntil: '2026-09-28T11:00:00',
    cargo: { steel: '冷轧/镀锌', tons: 28, pieces: '6 卷', note: '怕雨，必须篷布' }, req: { type: '平板半挂', len: '', equip: ['篷布', '鞍座'], whole: true },
    budget: null, budgetUnit: '吨', posted: '2026-09-27T08:30:00', views: 31, calls: 1, status: 'active', source: 'manual', desc: '镀锌卷 28 吨到松江工地，明早装，工地白天可卸，价格电话谈。' },
  { id: 'n2003', shipper: 's3', from: '上海', fromDetail: '松江区 · 某钢材市场', to: ['苏州'], toDetail: '昆山 · 工地', day: '明天', when: '明天 08:00 左右 装车', validUntil: '2026-09-28T09:00:00',
    cargo: { steel: '螺纹钢', tons: 10, pieces: '12m 定尺', note: '10 吨可拼车' }, req: { type: '', len: '', equip: ['可装 12m 长材'], whole: false },
    budget: 1200, budgetUnit: '车', posted: '2026-09-27T09:12:00', views: 18, calls: 0, status: 'active', source: 'order', orderNo: 'HD2609260087', desc: '10 吨螺纹钢 12 米定尺到昆山工地，可以拼别人的车，按车 1200 左右。' },
  { id: 'n2004', shipper: 's4', from: '上海', fromDetail: '宝山区 · 大仓', to: ['宁波'], toDetail: '北仑 · 仓库', day: '后天', when: '后天 全天 装车', validUntil: '2026-09-29T18:00:00',
    cargo: { steel: '中厚板', tons: 30, pieces: '18 张', note: '' }, req: { type: '平板半挂', len: '', equip: [], whole: true },
    budget: 55, budgetUnit: '吨', posted: '2026-09-26T20:10:00', views: 52, calls: 2, status: 'active', source: 'manual', desc: '宝山提 30 吨中厚板到北仑，后天装，时间灵活。' },
  { id: 'n2005', shipper: 's5', from: '苏州', fromDetail: '张家港 · 某钢厂仓', to: ['上海'], toDetail: '嘉定 · 钢构厂', day: '明天', when: '明天 10:00-14:00 装车', validUntil: '2026-09-28T14:00:00',
    cargo: { steel: '型钢（H型/槽/角）', tons: 26, pieces: 'H 型钢 12m', note: '需绑带固定' }, req: { type: '平板半挂', len: '13m', equip: ['绑带/链条', '可装 12m 长材'], whole: true },
    budget: 28, budgetUnit: '吨', posted: '2026-09-27T09:18:00', views: 9, calls: 0, status: 'active', source: 'order', orderNo: 'HD2609270031', desc: '张家港装 26 吨 H 型钢到嘉定，明天上午，常年有货，找长期回程车。' },
  { id: 'n2006', shipper: 's6', from: '南京', fromDetail: '江宁区 · 物流园', to: ['上海'], toDetail: '青浦 · 仓库', day: '今天', when: '今天 17:00 后 装车', validUntil: '2026-09-27T22:00:00',
    cargo: { steel: '钢管', tons: 20, pieces: '6m 焊管', note: '高栏或平板都可以' }, req: { type: '', len: '', equip: ['绑带/链条'], whole: true },
    budget: 50, budgetUnit: '吨', posted: '2026-09-27T07:50:00', views: 27, calls: 2, status: 'active', source: 'manual', desc: '20 吨焊管今晚走，明早到青浦就行。' },
];

/* 找车方自己的需求（货袋子端「我的需求」） */
HDZ.MY_NEEDS = [
  Object.assign({}, HDZ.NEEDS[0], { matched: 2, contacts: [{ who: '王师傅 · 沪D·8K3** · 悟运履约 126 单', what: '查看了您的电话', when: '09:11' }, { who: '周师傅 · 苏B·9C6**', what: '查看了您的电话', when: '09:14' }, { who: '您', what: '查看了 王师傅 的电话', when: '09:16' }] }),
  { id: 'n1996', shipper: 's1', from: '上海', fromDetail: '宝山区 · 宝钢大仓', to: ['南通'], toDetail: '海门 · 工地', day: '明天', when: '明天 下午 装车', validUntil: '2026-09-28T18:00:00', cargo: { steel: '螺纹钢', tons: 32, pieces: '12m 定尺', note: '' }, req: { type: '平板半挂', len: '', equip: ['可装 12m 长材'], whole: true }, budget: 40, budgetUnit: '吨', posted: '2026-09-26T09:00:00', views: 38, calls: 1, status: 'confirming', matched: 0, contacts: [{ who: '李师傅 · 苏E·3F1**', what: '查看了您的电话', when: '昨天 15:20' }] },
  { id: 'n1990', shipper: 's1', from: '上海', fromDetail: '宝山区', to: ['嘉兴'], toDetail: '南湖 · 恒源钢构', day: '9月25日', when: '9月25日 上午 装车', validUntil: '2026-09-25T12:00:00', cargo: { steel: '热卷', tons: 31.6, pieces: '3 卷', note: '' }, req: { type: '平板半挂', len: '17.5m', equip: ['鞍座'], whole: true }, budget: 30, budgetUnit: '吨', posted: '2026-09-24T16:00:00', views: 71, calls: 5, status: 'found', matched: 3, endReason: '已找到车（顺路车 · 王师傅 沪D·8K3**）', endAt: '9月24日 17:05' },
  { id: 'n1985', shipper: 's1', from: '上海', fromDetail: '宝山区', to: ['杭州'], toDetail: '萧山', day: '9月22日', when: '9月22日 全天 装车', validUntil: '2026-09-22T18:00:00', cargo: { steel: '中厚板', tons: 30, pieces: '', note: '' }, req: { type: '平板半挂', len: '', equip: [], whole: true }, budget: 42, budgetUnit: '吨', posted: '2026-09-21T10:00:00', views: 40, calls: 2, status: 'expired', matched: 1, endReason: '装车时间已过，系统自动下架', endAt: '9月22日 18:00' },
  { id: 'n1978', shipper: 's1', from: '苏州', fromDetail: '张家港', to: ['上海'], toDetail: '宝山', day: '9月19日', when: '9月19日 下午 装车', validUntil: '2026-09-19T18:00:00', cargo: { steel: '热卷', tons: 32, pieces: '3 卷', note: '' }, req: { type: '平板半挂', len: '17.5m', equip: ['鞍座'], whole: true }, budget: 27, budgetUnit: '吨', posted: '2026-09-19T08:00:00', views: 22, calls: 0, status: 'withdrawn', matched: 2, endReason: '您手动下架（改用自有车辆）', endAt: '9月19日 10:30' },
];

HDZ.NEED_STATUS = {
  active: { name: '展示中', cls: 'st-active' },
  confirming: { name: '待确认', cls: 'st-confirming' },
  found: { name: '已找到车', cls: 'st-booked' },
  expired: { name: '已过期', cls: 'st-expired' },
  withdrawn: { name: '已下架', cls: 'st-withdrawn' },
};

/* ---------- 地址：我司位置 / 地址簿 / 示意地图 ----------
   录入需求时线路不用手打：一键"我司位置"、常用仓库与工地、最近用过、订单地址，或在地图上点一下。
   地图是示意图：坐标为 0-100 的百分比，POI 命中半径内取 POI 名称，否则取最近区县 + "地图选点"。 */
HDZ.MY_COMPANY = { name: '上海某钢贸有限公司', short: '我司', city: '上海', district: '宝山区', detail: '宝山区 · 某钢材市场 3 号库', addr: '上海市宝山区沪太路 ×××× 号 某钢材市场 3 号库', x: 46, y: 28, verified: true, contact: '张经理 138****0921', hours: '周一至周六 8:00-17:30 收货' };
HDZ.ADDR_BOOK = [
  { id: 'a1', tag: '我司', name: '公司仓库（默认收货）', city: '上海', detail: '宝山区 · 某钢材市场 3 号库', x: 46, y: 28, used: 38 },
  { id: 'a2', tag: '常用', name: '宝钢大仓', city: '上海', detail: '宝山区 · 宝钢大仓', x: 54, y: 16, used: 21 },
  { id: 'a3', tag: '常用', name: '恒源钢构仓', city: '嘉兴', detail: '南湖区 · 恒源钢构仓', x: 58, y: 46, used: 12 },
  { id: 'a4', tag: '常用', name: '松江钢材市场', city: '上海', detail: '松江区 · 某钢材市场', x: 26, y: 78, used: 7 },
  { id: 'a5', tag: '最近', name: '昆山花桥工地', city: '苏州', detail: '昆山 · 花桥 工地', x: 78, y: 58, used: 1, when: '昨天' },
  { id: 'a6', tag: '最近', name: '海门工地', city: '南通', detail: '海门 · 工地', x: 70, y: 40, used: 1, when: '9月26日' },
];
HDZ.MAP = {
  '上海': { districts: [{ n: '宝山区', x: 50, y: 20 }, { n: '嘉定区', x: 14, y: 16 }, { n: '浦东新区', x: 78, y: 54 }, { n: '松江区', x: 16, y: 88 }, { n: '闵行区', x: 52, y: 72 }, { n: '青浦区', x: 10, y: 52 }, { n: '市区', x: 56, y: 42 }, { n: '奉贤区', x: 56, y: 90 }],
    pois: [{ n: '某钢材市场 3 号库', d: '宝山区', x: 46, y: 28, my: true }, { n: '宝钢大仓', d: '宝山区', x: 54, y: 16 }, { n: '松江钢材市场', d: '松江区', x: 26, y: 78 }, { n: '闵行物流园', d: '闵行区', x: 42, y: 62 }, { n: '外高桥码头仓', d: '浦东新区', x: 84, y: 34 }, { n: '嘉定钢材城', d: '嘉定区', x: 18, y: 30 }],
    roads: ['M 0 40 L 100 36', 'M 48 0 L 52 100', 'M 10 10 L 90 90', 'M 0 70 L 100 62', 'M 20 0 L 26 100', 'M 75 0 L 80 100'], river: 'M 0 58 C 20 50, 40 74, 60 56 S 85 30, 100 26' },
  '嘉兴': { districts: [{ n: '南湖区', x: 58, y: 48 }, { n: '秀洲区', x: 34, y: 40 }, { n: '海宁', x: 40, y: 80 }, { n: '平湖', x: 80, y: 62 }, { n: '嘉善', x: 78, y: 26 }, { n: '桐乡', x: 16, y: 66 }],
    pois: [{ n: '恒源钢构仓', d: '南湖区', x: 58, y: 46 }, { n: '嘉兴钢材市场', d: '秀洲区', x: 36, y: 44 }, { n: '海宁物流园', d: '海宁', x: 42, y: 84 }, { n: '嘉善工业区', d: '嘉善', x: 76, y: 30 }],
    roads: ['M 0 50 L 100 44', 'M 40 0 L 46 100', 'M 0 20 L 100 80', 'M 70 0 L 76 100'], river: 'M 0 30 C 30 40, 50 20, 100 40' },
  '苏州': { districts: [{ n: '张家港', x: 40, y: 14 }, { n: '常熟', x: 60, y: 26 }, { n: '太仓', x: 84, y: 40 }, { n: '昆山', x: 76, y: 60 }, { n: '市区', x: 40, y: 62 }, { n: '吴江', x: 34, y: 88 }],
    pois: [{ n: '某钢厂仓（张家港）', d: '张家港', x: 42, y: 16 }, { n: '昆山花桥工地', d: '昆山', x: 78, y: 58 }, { n: '苏州钢材市场', d: '市区', x: 44, y: 66 }, { n: '太仓港仓', d: '太仓', x: 88, y: 36 }],
    roads: ['M 0 60 L 100 52', 'M 40 0 L 44 100', 'M 10 0 L 90 100', 'M 0 30 L 100 24'], river: 'M 0 10 C 30 20, 60 8, 100 18' },
  '_': { districts: [{ n: '市区', x: 50, y: 50 }, { n: '开发区', x: 74, y: 30 }, { n: '物流园', x: 26, y: 70 }],
    pois: [{ n: '钢材市场', d: '市区', x: 54, y: 46 }, { n: '物流园仓库', d: '物流园', x: 28, y: 72 }],
    roads: ['M 0 50 L 100 46', 'M 50 0 L 54 100', 'M 0 20 L 100 80'], river: 'M 0 70 C 30 60, 60 80, 100 64' },
};
HDZ.HERE = { city: '上海', district: '宝山区', detail: '宝山区 · 沪太路附近（当前位置）', x: 47, y: 31 };

/* ---------- 意向（司机对需求一键"有意向"） ----------
   不是报价、不是接单、不锁定：司机只是告诉货主"我能接这单"，可选填一个参考价（以电话为准）。
   货主看到的是"谁有意向、大概什么价、先打给谁"，不排序、不比价；24 小时未联系自动过期。
   一条需求最多 5 位司机有意向，达到后暂停推送，提示货主尽快联系。 */
HDZ.INTENT_CAP = 5;
HDZ.INTENTS = [
  { id: 'i1', need: 'n2001', driver: 'd1', vehicle: 'v1', post: 'p1001', ref: 29, refUnit: '吨', note: '嘉兴卸完 14:00 就能到恒源仓，有鞍座 4 组', at: '2026-09-27T09:11:00', called: true, calledAt: '09:16' },
  { id: 'i2', need: 'n2001', driver: 'd5', vehicle: 'v5', post: 'p1003', ref: null, refUnit: '吨', note: '车在宝山闲着，随时能过去，价格电话谈', at: '2026-09-27T09:14:00', called: false },
  { id: 'i3', need: 'n2001', driver: 'd2', vehicle: 'v2', post: 'p1005', ref: 27, refUnit: '吨', note: '今晚从南京回，明早到嘉兴装可以吗', at: '2026-09-27T09:21:00', called: false },
  { id: 'i4', need: 'n1996', driver: 'd2', vehicle: 'v2', post: 'p1004', ref: 38, refUnit: '吨', note: '12 米定尺没问题，可多点卸', at: '2026-09-26T15:20:00', called: false },
  { id: 'i5', need: 'n1990', driver: 'd1', vehicle: 'v1', post: 'p0991', ref: 30, refUnit: '吨', note: '', at: '2026-09-24T16:30:00', called: true, calledAt: '9月24日 16:40', chosen: true, result: '如约到车' },
  { id: 'i6', need: 'n1990', driver: 'd5', vehicle: 'v5', post: 'p1003', ref: 31, refUnit: '吨', note: '', at: '2026-09-24T16:35:00', called: false, notified: true },
  { id: 'i7', need: 'n1990', driver: 'd3', vehicle: 'v3', post: 'p1002', ref: null, refUnit: '吨', note: '', at: '2026-09-24T16:52:00', called: false, notified: true },
  /* 当前司机（d1 王师傅）已对这条需求表达意向，等货主回电 */
  { id: 'i8', need: 'n2005', driver: 'd1', vehicle: 'v1', post: 'p1007', ref: 27, refUnit: '吨', note: '明天张家港卸完顺路，10 点前能到', at: '2026-09-27T09:19:00', called: false, mine: true },
];
/* 需求卡片上展示的意向人数（含非本司机的） */
HDZ.INTENT_COUNT = { n2001: 3, n2002: 1, n2003: 0, n2004: 5, n2005: 1, n2006: 0 };
HDZ.ME_DRIVER = 'd1';

/* ---------- 分享闭环 ----------
   微信规则：小程序卡片只能分享"本小程序"的页面。货主要把需求发到司机微信群，司机要打开的是悟运，
   所以跨小程序只能走 海报 + 另一小程序的小程序码（getUnlimited，scene = 需求ID + 分享人）。
   分享统计只做归因展示（谁的分享带来多少打开 / 查看电话 / 新注册），不分成、不发现金。 */
HDZ.SHARE_STATS = {
  n2001: { groups: 2, opens: 12, calls: 2, intents: 1, newUsers: 1, at: '09:08', by: '张经理' },
  p1001: { groups: 3, opens: 31, calls: 3, intents: 0, newUsers: 2, at: '09:00', by: '王师傅' },
};
HDZ.SHARE_SCENE = function (kind, id, who) { return 'scene=' + id + '_' + (who || 'me') + '&t=' + (kind === 'need' ? 'n' : 'p'); };

/* ---------- 联系结果反馈（替代互评） ----------
   只在真实联系过的双方之间发生；是几个结构化选项，不是打分，不公开展示。
   负面项累计触发现有的核验 / 黑名单流程，不需要平台判定"完成"。 */
HDZ.FEEDBACK = {
  shipper: [ /* 货主反馈司机 */
    { k: 'ok', t: '如约到车', cls: 'ok', msg: '感谢反馈！这条记录只用于司机的真实履约，不公开评分。' },
    { k: 'talk', t: '在沟通', cls: '', msg: '已记录' },
    { k: 'no', t: '没谈成', cls: '', msg: '已记录，不影响双方' },
    { k: 'miss', t: '司机爽约', cls: 'warn', msg: '已记录。同一司机累计 2 次爽约将暂停展示并人工核实' },
    { k: 'raise', t: '坐地起价', cls: 'warn', msg: '已记录。多位货主反馈将核实并处理该账号' },
    { k: 'fake', t: '信息不实', cls: 'warn', msg: '已提交核实，属实将下架并处理该账号，感谢！' },
  ],
  driver: [ /* 司机反馈货主 */
    { k: 'ok', t: '如约装车', cls: 'ok', msg: '祝顺利！运费、装卸请电话说清并留好凭证。平台不参与结算。' },
    { k: 'talk', t: '在沟通', cls: '', msg: '已记录' },
    { k: 'no', t: '没谈成', cls: '', msg: '已记录，不影响双方' },
    { k: 'found', t: '货主已找到车', cls: '', msg: '已记录，将提醒货主标记「已找到车」；2 位以上司机反馈后自动隐藏' },
    { k: 'empty', t: '货主放空', cls: 'warn', msg: '已记录。同一货主累计 2 次放空将限制发布并人工核实' },
    { k: 'press', t: '电话里压价', cls: 'warn', msg: '已记录。预算是货主自填，多位司机反馈将提示其调整' },
    { k: 'fake', t: '信息不实', cls: 'warn', msg: '已提交核实，属实将下架并处理该账号，感谢！' },
  ],
};
