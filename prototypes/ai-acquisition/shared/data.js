/* 货袋子 · AI 获客 · 演示数据（localStorage 持久化，可一键重置） */
(function (w) {
  const NOW = Date.now(), H = 3600e3, D = 24 * H;
  const ago = (h) => NOW - h * H, later = (h) => NOW + h * H;
  const VERSION = 'acq:state:v7';
  const rnd = (() => { let s = 20260925; return () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648; })();
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));

  function build() {
    const users = [
      { id: 1, name: '陈总', role: 'admin', short: '陈' },
      { id: 2, name: '张三', role: 'sales', short: '张' },
      { id: 3, name: '李四', role: 'sales', short: '李' },
      { id: 4, name: '王五', role: 'sales', short: '王' },
    ];
    const merchant = {
      id: 1001, name: '华东钢贸', intro: '沙钢/永钢一级代理，常备螺纹钢、盘螺、线材 3 万吨现货，苏州仓 24 小时发货。', products: ['螺纹钢', '盘螺', '线材', '中厚板'],
      defaultVars: { company: '华东钢贸', case_link: 'https://hdz.cn/c/su-case-0921', sales_name: '张三' },
      intentThreshold: 40, hotThreshold: 80, maxAutoFollowUps: 2, silentDays: 30, activeHours: '08:30-21:30', assignStrategy: 'ROUND_ROBIN',
      aiPolishNeedsConfirm: true, testPeers: ['张三-测试号', '陈总微信'], wizardStep: 4, syncToLeadCenter: true,
      publicCommentCaptureEnabled: true, riskNoticeAcceptedAt: ago(30 * 24), riskNoticeBy: '陈总',
      dailyReportEnabled: true, dailyReportRemindAt: '18:00', personalizationMin: 1, plan: 'PRO', seatLimit: 5, deviceLimit: 4, expireAt: later(200 * 24),
      forbiddenWords: ['最低价', '第一', '国家级', '百分百'],
    };
    const devices = [
      { id: 'd1', name: '小米 12（工作机 A）', type: 'PHONE', os: 'Android 14', app: '1.4.2', status: 'ONLINE', apps: { wechat: '8.0.56', douyin: '32.1.0', xhs: '8.62' }, lastHeartbeat: NOW - 12e3, boundAt: ago(9 * 24), battery: 78, net: 'Wi-Fi' },
      { id: 'd2', name: '红米 Note 13（张三主号机）', type: 'PHONE', os: 'Android 13', app: '1.4.2', status: 'OFFLINE', apps: { wechat: '8.0.55' }, lastHeartbeat: ago(3), boundAt: ago(20 * 24), battery: 12, net: '—' },
    ];
    const accounts = [
      { id: 'a1', platform: 'WECOM', exec: 'API', name: '华东钢贸·企业微信', key: 'corp:ww9f…', tier: 'MAJOR', status: 'ONLINE', todaySent: 18, todayBlocked: 0, daily: 200, hourly: 60, owner: 1, caps: ['CAPTURE_MOMENTS', 'CAPTURE_GROUP', 'SEND_DM', 'REPLY_GROUP', 'POST_MOMENT', 'PULL_INBOX'] },
      { id: 'a2', platform: 'WECHAT_PERSONAL', exec: 'RPA', name: '钢贸小助手A（小号）', tier: 'MINOR', device: 'd1', status: 'ONLINE', todaySent: 23, todayBlocked: 0, daily: 40, hourly: 8, warmupDay: 9, owner: 2, caps: ['CAPTURE_GROUP', 'CAPTURE_MOMENTS', 'SEND_DM', 'REPLY_GROUP', 'POST_MOMENT', 'PULL_INBOX'], queue: 2 },
      { id: 'a3', platform: 'WECHAT_PERSONAL', exec: 'RPA', name: '张三-主号', tier: 'MAJOR', device: 'd2', status: 'OFFLINE', todaySent: 6, todayBlocked: 0, daily: 60, hourly: 10, warmupDay: 20, owner: 2, caps: ['SEND_DM', 'REPLY_GROUP', 'PULL_INBOX'], note: '主号仅回复，不主动触达陌生人' },
      { id: 'a4', platform: 'DOUYIN', exec: 'API', name: '华东钢贸 官方抖音（企业号）', tier: 'MAJOR', status: 'ONLINE', todaySent: 9, todayBlocked: 0, daily: 100, hourly: 30, owner: 1, caps: ['CAPTURE_OWN_COMMENTS', 'REPLY_COMMENT', 'SEND_DM', 'PULL_INBOX'] },
      { id: 'a5', platform: 'XIAOHONGSHU', exec: 'HTTP', name: '华东钢贸专业号（网页版）', tier: 'MAJOR', status: 'ONLINE', todaySent: 3, todayBlocked: 0, daily: 30, hourly: 5, owner: 1, caps: ['CAPTURE_OWN_COMMENTS', 'REPLY_COMMENT', 'PUBLISH_POST'] },
      { id: 'a6', platform: 'FORUM', exec: 'HTTP', name: '中国钢材网论坛 · hdz_steel', tier: 'MAJOR', status: 'ONLINE', todaySent: 14, todayBlocked: 0, daily: 100, hourly: 20, owner: 3, caps: ['CAPTURE_PUBLIC_COMMENTS', 'SEND_DM', 'REPLY_COMMENT', 'PUBLISH_POST', 'PULL_INBOX'] },
      { id: 'a7', platform: 'HDZ_INTERNAL', exec: 'API', name: '货袋子站内（圈子/询价/海报扫码）', tier: 'MAJOR', status: 'ONLINE', todaySent: 31, todayBlocked: 0, daily: 500, hourly: 60, owner: 1, caps: ['CAPTURE_OWN_COMMENTS', 'SEND_DM', 'PUBLISH_POST', 'PULL_INBOX'] },
      { id: 'a8', platform: 'DOUYIN', exec: 'RPA', name: '抖音小号（采集）', tier: 'MINOR', device: 'd1', status: 'RESTRICTED', circuitUntil: later(2.3), todaySent: 4, todayBlocked: 2, daily: 20, hourly: 5, warmupDay: 4, owner: 2, caps: ['CAPTURE_PUBLIC_COMMENTS', 'SEND_DM'], lastError: '1h 内 2 次「操作频繁」提示，已熔断 4 小时' },
      { id: 'a9', platform: 'XIAOHONGSHU', exec: 'RPA', name: '小红书小号（采集）', tier: 'MINOR', device: 'd1', status: 'ONLINE', todaySent: 2, todayBlocked: 0, daily: 20, hourly: 5, warmupDay: 6, owner: 2, caps: ['CAPTURE_PUBLIC_COMMENTS', 'SEND_DM'] },
    ];
    const captureRules = [
      { id: 'r1', name: '抖音 · 钢材求购评论区', platform: 'DOUYIN', scope: 'PUBLIC_COMMENTS', keywords: ['螺纹钢批发', '钢材 求购', '钢厂直发'], intents: ['求推荐', '有没有货', '多少钱', '怎么拿货', '哪里有'], accounts: ['a8'], max: 45, lookback: 24, enabled: true, lastRun: ago(3), lastStats: { raw: 38, leads: 6, dedup: 11 } },
      { id: 'r2', name: '小红书 · 自家笔记评论', platform: 'XIAOHONGSHU', scope: 'OWN_CONTENT', keywords: [], intents: ['求推荐', '有没有资料', '怎么报名', '价格'], accounts: ['a5'], max: 200, lookback: 24, enabled: true, lastRun: ago(3), lastStats: { raw: 14, leads: 3, dedup: 2 } },
      { id: 'r3', name: '微信群 · 华东钢贸交流群 ×3', platform: 'WECHAT_PERSONAL', scope: 'GROUP', keywords: ['求购', '谁有', '找货', '报价'], intents: ['谁有', '求购', '有没有', '多少钱'], targets: ['华东钢贸交流群', '苏州建材采购群', '长三角工程采购群'], accounts: ['a2'], max: 300, lookback: 24, enabled: true, lastRun: ago(3), lastStats: { raw: 212, leads: 9, dedup: 40 } },
      { id: 'r4', name: '中国钢材网论坛 · 供求版块', platform: 'FORUM', scope: 'BOARD', keywords: ['求购', '螺纹钢', 'HRB400', '盘螺'], intents: ['求购', '求报价', '有货联系', '推荐'], targets: ['https://bbs.example-steel.com/board/supply'], accounts: ['a6'], max: 100, lookback: 48, enabled: true, lastRun: ago(3), lastStats: { raw: 27, leads: 5, dedup: 3 } },
      { id: 'r5', name: '货袋子站内 · 圈子/询价', platform: 'HDZ_INTERNAL', scope: 'INTERNAL', keywords: [], intents: ['求推荐', '找供应商', '询价'], accounts: ['a7'], max: 500, lookback: 24, enabled: true, lastRun: ago(3), lastStats: { raw: 19, leads: 8, dedup: 1 } },
      { id: 'r6', name: '企微 · 客户朋友圈互动', platform: 'WECOM', scope: 'MOMENTS', keywords: [], intents: ['点赞', '评论'], accounts: ['a1'], max: 200, lookback: 24, enabled: false, lastRun: ago(27), lastStats: { raw: 33, leads: 2, dedup: 0 } },
      { id: 'r7', name: '抖音 · 自家视频评论', platform: 'DOUYIN', scope: 'OWN_CONTENT', keywords: [], intents: ['多少钱', '有没有货', '怎么买'], accounts: ['a4'], max: 200, lookback: 24, enabled: true, lastRun: ago(3), lastStats: { raw: 41, leads: 4, dedup: 6 } },
    ];
    const scripts = [
      { id: 101, name: '首触 · 钢材现货（带来源）', category: 'FIRST_TOUCH', scene: 'OUTREACH', platforms: [], keywords: [], priority: 10, content: '{nickname}，看到您在{source_channel}问{source_excerpt}，我们是{company}，常备沙钢/永钢螺纹钢 3 万吨现货，可以按您的规格发份今日库存表参考？—{sales_name}', variants: ['{nickname}您好，刷到您在{source_channel}提到{source_excerpt}。{company}苏州仓有现货可当天发，要不要我先把今日价格表发您看看？—{sales_name}'], requiredVars: ['nickname', 'source_channel'], aiPolish: false, requiresHuman: false, followUpAfter: 72, followUpScript: 107, sent7: 186, reply7: 61, sent30: 702, reply30: 218, enabled: true, source: 'INDUSTRY_PACK', version: 3 },
      { id: 112, name: '首触 · 企微存量激活（朋友圈点赞）', category: 'FIRST_TOUCH', scene: 'OUTREACH', platforms: ['WECOM'], keywords: [], priority: 20, content: '{nickname}您好，看到您给我们{source_excerpt}点了赞，本周螺纹钢价格有波动，给您发份行情参考？—{sales_name}', requiredVars: ['nickname'], followUpAfter: 96, followUpScript: 107, sent7: 42, reply7: 9, sent30: 160, reply30: 38, enabled: true, source: 'MANUAL', version: 1 },
      { id: 108, name: '需求确认 · 吨位与地点', category: 'GREETING', scene: 'REPLY', keywords: ['有货', '有没有', '要货', '需要', '在吗', '你好'], priority: 50, content: '{nickname}，有的。方便说下大概吨位和发到哪里？我按您的量给您配货方案。', sent7: 74, reply7: 51, sent30: 260, reply30: 176, enabled: true, source: 'INDUSTRY_PACK', version: 2 },
      { id: 103, name: '报价 · 过渡语（转人工）', category: 'PRICE', scene: 'REPLY', keywords: ['价格', '多少钱', '报价', '单价', '一吨', '什么价'], priority: 20, content: '收到{nickname}，这边马上给您核一下今天的出厂价，稍后回您。', requiresHuman: true, approvalType: 'QUOTE', sent7: 58, reply7: 44, sent30: 201, reply30: 150, enabled: true, source: 'INDUSTRY_PACK', version: 2 },
      { id: 102, name: '案例 · 制造业月度供货', category: 'CASE', scene: 'REPLY', keywords: ['案例', '合作过', '做过', '客户', '靠谱'], priority: 40, content: '{nickname}，刚帮一家苏州的制造业客户做了同规格的月度供货方案，附案例：{case_link}，您看是否类似？', attachments: [{ type: 'LINK', name: '苏州制造业客户案例', url: 'https://hdz.cn/c/su-case-0921' }], followUpAfter: 72, followUpScript: 107, sent7: 39, reply7: 15, sent30: 140, reply30: 52, enabled: true, source: 'INDUSTRY_PACK', version: 1 },
      { id: 104, name: '资料 · 今日库存与规格表', category: 'MATERIAL', scene: 'REPLY', keywords: ['资料', '库存表', '规格表', '发我', '价格表', '目录'], priority: 40, content: '{nickname}，今日库存与规格表在这：{case_link}，如需特定规格我帮您查。', attachments: [{ type: 'FILE', name: '库存表-0925.pdf' }], sent7: 47, reply7: 21, sent30: 170, reply30: 71, enabled: true, source: 'INDUSTRY_PACK', version: 2 },
      { id: 106, name: '异议 · 再考虑（3 天后跟进）', category: 'OBJECTION', scene: 'REPLY', keywords: ['考虑', '再看看', '再说', '不急', '先看看', '回头'], priority: 30, content: '好的{nickname}，不着急，您先看看。我这边把今日行情发您一份，方便对比。', followUpAfter: 72, followUpScript: 105, sent7: 22, reply7: 6, sent30: 88, reply30: 27, enabled: true, source: 'INDUSTRY_PACK', version: 1 },
      { id: 105, name: '活动 · 新客锁价 7 天', category: 'FOLLOW_UP', scene: 'FOLLOW_UP', keywords: [], priority: 60, content: '{nickname}，上次您说再考虑，本月我们对新客户有锁价 7 天的活动，需要我给您留个额度吗？', sent7: 18, reply7: 7, sent30: 66, reply30: 22, enabled: true, source: 'MANUAL', version: 1 },
      { id: 107, name: '二次跟进 · 无回复', category: 'FOLLOW_UP', scene: 'FOLLOW_UP', keywords: [], priority: 60, content: '{nickname}，前两天给您发的{product}资料看了吗？如有需要随时找我，今天苏州仓又到了一批{product}。', requiredVars: ['nickname'], sent7: 63, reply7: 9, sent30: 240, reply30: 41, enabled: true, source: 'INDUSTRY_PACK', version: 2 },
      { id: 109, name: '群回复 · 询货', category: 'GREETING', scene: 'GROUP_REPLY', keywords: ['谁有', '求购', '哪里有', '找货'], priority: 30, content: '@{nickname} 我们有现货，规格齐，私您一份库存表～', sent7: 31, reply7: 12, sent30: 120, reply30: 44, enabled: true, source: 'INDUSTRY_PACK', version: 1 },
      { id: 111, name: '朋友圈回复 · 到货', category: 'GREETING', scene: 'MOMENT_REPLY', keywords: ['到货', '现场', '好货'], priority: 50, content: '{nickname} 这批货刚到，明天可以来看现场～', sent7: 8, reply7: 2, sent30: 30, reply30: 9, enabled: true, source: 'MANUAL', version: 1 },
      { id: 113, name: '合同 · 付款条款（转人工）', category: 'CLOSING', scene: 'REPLY', keywords: ['合同', '付款', '账期', '发票', '定金'], priority: 20, content: '{nickname}，合同和付款条款我让同事整理好发您确认。', requiresHuman: true, approvalType: 'CONTRACT', sent7: 6, reply7: 5, sent30: 21, reply30: 17, enabled: true, source: 'MANUAL', version: 1 },
      { id: 114, name: '首触 · 通用模板（无来源，示例反面）', category: 'FIRST_TOUCH', scene: 'OUTREACH', keywords: [], priority: 90, content: '您好，我们是华东钢贸，主营螺纹钢、盘螺、线材，价格优惠，欢迎咨询。', requiredVars: ['nickname'], sent7: 40, reply7: 2, sent30: 130, reply30: 6, enabled: false, source: 'MANUAL', version: 1, warn: '不含个性化变量，回复率 4.6%，已停用' },
    ];
    const refusals = ['别发了', '不需要', '不用了', '别烦', '举报', '骚扰', '滚', '再发拉黑'];

    /* 线索 */
    const L = [];
    const mk = (o) => { const id = 'L' + String(L.length + 1).padStart(3, '0'); L.push(Object.assign({ id, tags: [], outreachCount: 0, autoFollowCount: 0, replyCount: 0, isTest: false, events: [] }, o)); return L[L.length - 1]; };
    mk({ nickname: '张总', platform: 'DOUYIN', platformUserId: 'dy_9f2a1', sourceType: 'COMMENT', sourceChannel: '抖音-#钢材批发', sourceExcerpt: '有没有货，螺纹钢 HRB400 20 的', sourceUrl: 'https://v.douyin.com/xxx', intent: 'INQUIRY', score: 86, stage: 'HOT', owner: 2, product: '螺纹钢 HRB400 Φ20', region: '江苏 苏州', company: '苏州某机械制造', outreachCount: 1, replyCount: 3, createdAt: ago(27), lastActiveAt: ago(0.2), lastContactedAt: ago(25), entities: { spec: 'HRB400 Φ20', quantity: '200 吨', address: '苏州' } });
    mk({ nickname: '王经理', platform: 'WECOM', platformUserId: 'wm_ext_01', sourceType: 'MOMENT', sourceChannel: '企微-客户朋友圈点赞', sourceExcerpt: '「苏州仓到货 2000 吨盘螺」', intent: 'ASK_RECOMMEND', score: 64, stage: 'REPLIED', owner: 3, product: '盘螺', region: '江苏 无锡', outreachCount: 1, replyCount: 1, createdAt: ago(50), lastActiveAt: ago(1.1), lastContactedAt: ago(48) });
    mk({ nickname: '李工', platform: 'FORUM', platformUserId: 'bbs_ligong', sourceType: 'TOPIC', sourceChannel: '中国钢材网论坛-供求版块', sourceExcerpt: '求购 HRB400E Φ12-25 螺纹钢 300 吨，苏北工地', sourceUrl: 'https://bbs.example-steel.com/t/88213', intent: 'INQUIRY', score: 78, stage: 'REPLIED', owner: 2, product: '螺纹钢 HRB400E', region: '江苏 徐州', outreachCount: 1, replyCount: 1, createdAt: ago(30), lastActiveAt: ago(3.2), lastContactedAt: ago(28) });
    mk({ nickname: '赵老板', platform: 'WECHAT_PERSONAL', sourceType: 'GROUP', sourceChannel: '微信群-苏州建材采购群', sourceExcerpt: '谁有盘螺 8 个的，急要 50 吨', intent: 'INQUIRY', score: 82, stage: 'CONTACTED', owner: 2, product: '盘螺 Φ8', region: '江苏 苏州', outreachCount: 1, createdAt: ago(31), lastActiveAt: ago(31), lastContactedAt: ago(31) });
    mk({ nickname: '周总', platform: 'HDZ_INTERNAL', platformUserId: 'hdz_u_5521', sourceType: 'INQUIRY', sourceChannel: '货袋子-圈子', sourceExcerpt: '求推荐苏州附近靠谱的螺纹钢供应商，月用量 500 吨', intent: 'ASK_RECOMMEND', score: 90, stage: 'HOT', owner: 3, product: '螺纹钢', region: '江苏 苏州', phone: '138****6621', company: '苏州某建工', outreachCount: 1, replyCount: 2, createdAt: ago(20), lastActiveAt: ago(0.6), lastContactedAt: ago(19), entities: { quantity: '500 吨/月' } });
    mk({ nickname: '孙经理', platform: 'XIAOHONGSHU', platformUserId: 'xhs_sun88', sourceType: 'COMMENT', sourceChannel: '小红书-自家笔记「钢材验货 5 步」', sourceExcerpt: '有没有资料，想学习一下怎么看质保书', intent: 'ASK_MATERIAL', score: 58, stage: 'REPLIED', owner: 4, product: '—', region: '上海', outreachCount: 1, replyCount: 1, createdAt: ago(75), lastActiveAt: ago(70), lastContactedAt: ago(72) });
    mk({ nickname: '吴工', platform: 'FORUM', platformUserId: 'bbs_wug', sourceType: 'TOPIC', sourceChannel: '中国钢材网论坛-供求版块', sourceExcerpt: '中厚板 Q235B 16mm 谁有货，要 80 吨', intent: 'INQUIRY', score: 71, stage: 'SILENT', owner: 3, product: '中厚板 Q235B', region: '浙江 嘉兴', outreachCount: 3, autoFollowCount: 2, createdAt: ago(9 * 24), lastActiveAt: ago(3 * 24), lastContactedAt: ago(3 * 24), silentUntil: later(27 * 24) });
    mk({ nickname: '郑总', platform: 'WECHAT_PERSONAL', sourceType: 'GROUP', sourceChannel: '微信群-华东钢贸交流群', sourceExcerpt: '有做线材的吗，报个价', intent: 'ASK_PRICE', score: 75, stage: 'LOST', lostReason: 'REFUSED', owner: 2, product: '线材', outreachCount: 1, replyCount: 1, createdAt: ago(4 * 24), lastActiveAt: ago(3.5 * 24), lastContactedAt: ago(4 * 24) });
    mk({ nickname: '刘经理', platform: 'DOUYIN', platformUserId: 'dy_liu77', sourceType: 'COMMENT', sourceChannel: '抖音-自家视频「装车现场」', sourceExcerpt: '这个多少钱一吨？发到杭州', intent: 'ASK_PRICE', score: 80, stage: 'WON', owner: 2, product: '螺纹钢', region: '浙江 杭州', wonAmount: 186000, wonAt: ago(2 * 24), outreachCount: 1, replyCount: 5, createdAt: ago(8 * 24), lastActiveAt: ago(2 * 24), lastContactedAt: ago(7 * 24), phone: '139****0021' });
    mk({ nickname: '陈老板', platform: 'HDZ_INTERNAL', platformUserId: 'hdz_u_1298', sourceType: 'POSTER_SCAN', sourceChannel: '海报扫码-微信群码 Q7K2MV-G', sourceExcerpt: '扫码「9 月锁价活动」海报并点击咨询', intent: 'INQUIRY', score: 68, stage: 'NEW', owner: 2, product: '螺纹钢', region: '江苏 南通', createdAt: ago(2.5), lastActiveAt: ago(2.5) });
    mk({ nickname: '钢铁小哥', platform: 'DOUYIN', platformUserId: 'dy_g0001', sourceType: 'COMMENT', sourceChannel: '抖音-#钢材批发', sourceExcerpt: '求推荐一家能开票的钢贸公司', intent: 'ASK_RECOMMEND', score: 62, stage: 'NEW', owner: 3, createdAt: ago(3), lastActiveAt: ago(3) });
    mk({ nickname: '', platform: 'FORUM', platformUserId: 'bbs_anon_331', sourceType: 'TOPIC', sourceChannel: '中国钢材网论坛-供求版块', sourceExcerpt: '求购盘螺 100 吨 到南京', intent: 'INQUIRY', score: 70, stage: 'NEW', owner: 2, product: '盘螺', region: '江苏 南京', createdAt: ago(3), lastActiveAt: ago(3), note: '论坛匿名用户，昵称为空（试运行会暴露缺少昵称变量）' });
    mk({ nickname: '测试-张三', platform: 'WECOM', platformUserId: 'test_01', sourceType: 'MANUAL', sourceChannel: '手工录入-测试', sourceExcerpt: '测试：想了解螺纹钢价格', intent: 'ASK_PRICE', score: 70, stage: 'NEW', owner: 2, isTest: true, createdAt: ago(1), lastActiveAt: ago(1) });
    mk({ nickname: '测试-李四', platform: 'WECOM', platformUserId: 'test_02', sourceType: 'MANUAL', sourceChannel: '手工录入-测试', sourceExcerpt: '测试：有没有盘螺现货', intent: 'INQUIRY', score: 65, stage: 'NEW', owner: 3, isTest: true, createdAt: ago(1), lastActiveAt: ago(1) });
    const names = ['马总', '朱经理', '胡工', '林老板', '何总', '高经理', '罗工', '梁总', '宋老板', '唐经理', '许工', '韩总', '冯老板', '曹经理', '彭工', '曾总', '萧经理', '蔡老板'];
    const srcs = [['DOUYIN', 'COMMENT', '抖音-#钢材批发', ['谁有螺纹钢现货', '求推荐钢贸', '多少钱一吨', '有没有 HRB400E']], ['FORUM', 'TOPIC', '中国钢材网论坛-供求版块', ['求购螺纹钢 200 吨', '求购盘螺 60 吨', '找 Q235B 中厚板']], ['WECHAT_PERSONAL', 'GROUP', '微信群-长三角工程采购群', ['谁有盘螺 10 的', '找货 螺纹钢 苏州', '有做线材的吗']], ['HDZ_INTERNAL', 'INQUIRY', '货袋子-询价', ['询价 螺纹钢 HRB400 Φ16 100 吨', '求推荐供应商']], ['XIAOHONGSHU', 'COMMENT', '小红书-自家笔记', ['价格能发我吗', '有资料吗']], ['WECOM', 'MOMENT', '企微-客户朋友圈评论', ['这批货不错', '价格怎么样']]];
    const stages = ['NEW', 'NEW', 'CONTACTED', 'CONTACTED', 'CONTACTED', 'REPLIED', 'REPLIED', 'HOT', 'LOST', 'SILENT', 'WON'];
    names.forEach((n, i) => { const s = srcs[i % srcs.length]; const st = stages[i % stages.length]; const c = ri(2, 12 * 24); mk({ nickname: n, platform: s[0], platformUserId: s[0].slice(0, 2).toLowerCase() + '_' + (1000 + i), sourceType: s[1], sourceChannel: s[2], sourceExcerpt: pick(s[3]), intent: pick(['INQUIRY', 'ASK_PRICE', 'ASK_RECOMMEND']), score: ri(42, 92), stage: st, owner: [2, 3, 4][i % 3], product: pick(merchant.products), region: pick(['江苏 苏州', '江苏 南京', '上海', '浙江 杭州', '安徽 合肥']), outreachCount: st === 'NEW' ? 0 : ri(1, 3), replyCount: ['REPLIED', 'HOT', 'WON', 'LOST'].includes(st) ? ri(1, 4) : 0, createdAt: ago(c), lastActiveAt: ago(Math.max(0.3, c - ri(1, 20))), lastContactedAt: st === 'NEW' ? null : ago(c - 1), wonAmount: st === 'WON' ? ri(5, 30) * 10000 : null, lostReason: st === 'LOST' ? pick(['NO_REPLY', 'NOT_TARGET', 'REFUSED']) : null }); });
    L.forEach(l => { if (l.score >= 80 && l.stage === 'HOT') l.tags.push('高意向'); if (l.isTest) l.tags.push('测试'); });

    /* 会话与消息 */
    const conversations = [];
    const convo = (leadId, acc, status, msgs, extra) => { const id = 'C' + (conversations.length + 1); const m = msgs.map((x, i) => Object.assign({ id: id + '-' + (i + 1) }, x)); conversations.push(Object.assign({ id, leadId, account: acc, status, messages: m, unread: m.filter(x => x.dir === 'IN' && !x.read).length, lastAt: m[m.length - 1].t }, extra || {})); };
    convo('L001', 'a4', 'NEED_HUMAN', [
      { dir: 'IN', from: 'CUSTOMER', text: '有没有货，螺纹钢 HRB400 20 的', t: ago(27), read: true },
      { dir: 'OUT', from: 'AI', text: '张总，看到您在抖音-#钢材批发问「有没有货，螺纹钢 HRB400 20 的」，我们是华东钢贸，常备沙钢/永钢螺纹钢 3 万吨现货，可以按您的规格发份今日库存表参考？—张三', t: ago(25), scriptId: 101, hits: ['nickname', 'source_channel', 'source_excerpt'], read: true },
      { dir: 'IN', from: 'CUSTOMER', text: '要 200 吨左右，发到苏州工业园区，多少钱一吨？', t: ago(0.25), match: { source: 'RULE', rule: '价格关键词「多少钱」', scriptId: 103 }, entities: { quantity: '200 吨', address: '苏州工业园区', spec: 'HRB400 Φ20' } },
      { dir: 'OUT', from: 'AI', text: '收到张总，这边马上给您核一下今天的出厂价，稍后回您。', t: ago(0.24), scriptId: 103, transition: true, read: true },
    ], { needHumanReason: 'APPROVAL', flowNote: '流程分支 ASK_PRICE → 人工报价' });
    convo('L005', 'a7', 'NEED_HUMAN', [
      { dir: 'IN', from: 'CUSTOMER', text: '求推荐苏州附近靠谱的螺纹钢供应商，月用量 500 吨', t: ago(20), read: true },
      { dir: 'OUT', from: 'AI', text: '周总，看到您在货袋子-圈子问「求推荐苏州附近靠谱的螺纹钢供应商」，我们是华东钢贸，苏州仓常备 3 万吨现货，可以按您的规格发份今日库存表参考？—李四', t: ago(19), scriptId: 101, hits: ['nickname', 'source_channel', 'source_excerpt'], read: true },
      { dir: 'IN', from: 'CUSTOMER', text: '你们和哪些工地合作过？有案例吗', t: ago(5), read: true, match: { source: 'RULE', rule: '案例关键词「案例」', scriptId: 102 } },
      { dir: 'OUT', from: 'AI', text: '周总，刚帮一家苏州的制造业客户做了同规格的月度供货方案，附案例：https://hdz.cn/c/su-case-0921，您看是否类似？', t: ago(4.9), scriptId: 102, read: true },
      { dir: 'IN', from: 'CUSTOMER', text: '看了，比较接近。我们下周开标，能不能派人来一趟聊聊账期？', t: ago(0.6), match: { source: 'LLM', category: 'CONTRACT', confidence: 0.81, scriptId: 113 }, entities: { delivery: '下周' } },
      { dir: 'OUT', from: 'AI', text: '周总，合同和付款条款我让同事整理好发您确认。', t: ago(0.59), scriptId: 113, transition: true, read: true },
    ], { needHumanReason: 'HOT' });
    convo('L003', 'a6', 'AUTO', [
      { dir: 'OUT', from: 'AI', text: '李工，看到您在中国钢材网论坛-供求版块问「求购 HRB400E Φ12-25 螺纹钢 300 吨，苏北工地」，我们是华东钢贸，常备沙钢/永钢螺纹钢 3 万吨现货，可以按您的规格发份今日库存表参考？—张三', t: ago(28), scriptId: 101, hits: ['nickname', 'source_channel', 'source_excerpt'], read: true },
      { dir: 'IN', from: 'CUSTOMER', text: '发我一份规格表和价格表吧', t: ago(3.3), read: true, match: { source: 'RULE', rule: '资料关键词「规格表」', scriptId: 104 } },
      { dir: 'OUT', from: 'AI', text: '李工，今日库存与规格表在这：https://hdz.cn/c/su-case-0921，如需特定规格我帮您查。', t: ago(3.2), scriptId: 104, attachments: [{ type: 'FILE', name: '库存表-0925.pdf' }], read: true },
    ]);
    convo('L002', 'a1', 'AUTO', [
      { dir: 'OUT', from: 'AI', text: '王经理您好，看到您给我们「苏州仓到货 2000 吨盘螺」点了赞，本周螺纹钢价格有波动，给您发份行情参考？—李四', t: ago(48), scriptId: 112, hits: ['nickname', 'source_excerpt'], read: true },
      { dir: 'IN', from: 'CUSTOMER', text: '好的我看看，最近不急', t: ago(1.1), read: true, match: { source: 'RULE', rule: '异议关键词「不急」', scriptId: 106 } },
      { dir: 'OUT', from: 'AI', text: '好的王经理，不着急，您先看看。我这边把今日行情发您一份，方便对比。', t: ago(1.05), scriptId: 106, read: true },
    ], { flowNote: '流程分支 CONSIDERING → 等待 7 天 → 发活动话术' });
    convo('L006', 'a5', 'AUTO', [
      { dir: 'IN', from: 'CUSTOMER', text: '有没有资料，想学习一下怎么看质保书', t: ago(75), read: true },
      { dir: 'OUT', from: 'AI', text: '孙经理，看到您在小红书-自家笔记「钢材验货 5 步」问「有没有资料，想学习一下怎么看质保书」，我们是华东钢贸，可以发您一份质保书解读资料参考？—王五', t: ago(72), scriptId: 101, read: true },
      { dir: 'IN', from: 'CUSTOMER', text: '谢谢，发我吧', t: ago(70), read: true, match: { source: 'RULE', rule: '资料关键词「发我」', scriptId: 104 } },
      { dir: 'OUT', from: 'AI', text: '孙经理，今日库存与规格表在这：https://hdz.cn/c/su-case-0921，如需特定规格我帮您查。', t: ago(69.9), scriptId: 104, read: true },
    ]);
    convo('L008', 'a2', 'CLOSED', [
      { dir: 'OUT', from: 'AI', text: '郑总，看到您在微信群-华东钢贸交流群问「有做线材的吗，报个价」，我们是华东钢贸，常备线材现货，可以按您的规格发份今日库存表参考？—张三', t: ago(4 * 24), scriptId: 101, read: true },
      { dir: 'IN', from: 'CUSTOMER', text: '别发了，不需要', t: ago(3.5 * 24), read: true, match: { source: 'RULE', rule: '拒绝词「别发了」→ 拉黑', refusal: true } },
    ]);
    convo('L009', 'a4', 'HUMAN', [
      { dir: 'IN', from: 'CUSTOMER', text: '这个多少钱一吨？发到杭州', t: ago(8 * 24), read: true },
      { dir: 'OUT', from: 'AI', text: '收到刘经理，这边马上给您核一下今天的出厂价，稍后回您。', t: ago(8 * 24 + 0.1), scriptId: 103, transition: true, read: true },
      { dir: 'OUT', from: 'USER', by: 2, text: '刘经理，今日沙钢 HRB400 Φ16-25 苏州仓出厂 3,860/吨，杭州到货约 +45 运费，量大可谈。', t: ago(7.9 * 24), approvalId: 'AP003', read: true },
      { dir: 'IN', from: 'CUSTOMER', text: '行，先来 50 吨试试，合同发我', t: ago(7 * 24), read: true },
      { dir: 'OUT', from: 'USER', by: 2, text: '好的刘经理，合同和付款条款已发您邮箱，签好回传即可安排发货。', t: ago(6.9 * 24), read: true },
      { dir: 'IN', from: 'CUSTOMER', text: '已签，安排吧', t: ago(2 * 24), read: true },
    ], { takenBy: 2, takenAt: ago(7.95 * 24) });
    convo('L016', 'a6', 'NEED_HUMAN', [
      { dir: 'OUT', from: 'AI', text: '马总，看到您在中国钢材网论坛-供求版块问「求购螺纹钢 200 吨」，我们是华东钢贸，常备现货可当天发，要不要我先把今日价格表发您看看？—张三', t: ago(30), scriptId: 101, read: true },
      { dir: 'IN', from: 'CUSTOMER', text: '你们能做代加工吗？切割成 6 米', t: ago(2), match: { source: 'LLM', category: 'OTHER', confidence: 0.42 } },
    ], { needHumanReason: 'NO_MATCH' });

    /* 跟进流程定义 */
    const flows = [
      {
        id: 'F1', name: '标准跟进 SOP', description: '首触 → 等待回复 72h → 未回复发案例 / 问价转人工 / 再考虑 7 天后发活动 / 提到数量规格置高意向', status: 'PUBLISHED', version: 2, publishedVersion: 2, priority: 10, source: 'TEMPLATE', createdAt: ago(20 * 24), updatedAt: ago(2 * 24),
        trigger: { on: 'STAGE_ENTER', stage: 'NEW', minScore: 60, platforms: [], priority: 10 }, guardrails: { maxAutoSends: 4, maxLoops: 2 },
        nodes: {
          n1: { type: 'Send', scriptId: 101, next: 'n2' },
          n2: { type: 'WaitForReply', timeoutHours: 72, autoReplyByScriptLib: true, branches: { NO_REPLY: 'n3', REFUSED: 'end_lost', ASK_PRICE: 'n5', CONSIDERING: 'n4', HAS_ENTITIES: 'n6', '*': 'n2b' } },
          n3: { type: 'Send', scriptId: 102, next: 'n3w' },
          n3w: { type: 'WaitForReply', timeoutHours: 72, autoReplyByScriptLib: true, branches: { NO_REPLY: 'end_silent', REFUSED: 'end_lost', '*': 'n2b' } },
          n4: { type: 'Wait', hours: 168, next: 'n7' },
          n5: { type: 'HumanTask', kind: 'QUOTE', escalateAfterHours: 2, next: 'n2b', onEscalate: 'n8' },
          n6: { type: 'SetStage', stage: 'HOT', next: 'n8' },
          n7: { type: 'Send', scriptId: 105, next: 'n3w' },
          n8: { type: 'Notify', to: 'owner', next: 'end_human' },
          n2b: { type: 'GoTo', target: 'n2', maxLoops: 2, onExceed: 'end_human' },
          end_silent: { type: 'End', stage: 'SILENT' }, end_lost: { type: 'End', stage: 'LOST', reason: 'REFUSED' }, end_human: { type: 'End', handoff: true },
        }, first: 'n1', stats30: { entered: 312, completed: 96, silent: 61, lost: 22, handoff: 74, active: 59 },
      },
      {
        id: 'F2', name: '沉默唤醒 SOP', description: '静默期结束或再次抓到意图 → 发活动 → 等待 5 天 → 未回复结束', status: 'PUBLISHED', version: 1, publishedVersion: 1, priority: 50, source: 'MANUAL', createdAt: ago(10 * 24), updatedAt: ago(10 * 24),
        trigger: { on: 'STAGE_ENTER', stage: 'NEW', minScore: 50, fromStage: 'SILENT', priority: 50 }, guardrails: { maxAutoSends: 2, maxLoops: 1 },
        nodes: { n1: { type: 'Send', scriptId: 105, next: 'n2' }, n2: { type: 'WaitForReply', timeoutHours: 120, autoReplyByScriptLib: true, branches: { NO_REPLY: 'end_silent', REFUSED: 'end_lost', '*': 'end_human' } }, end_silent: { type: 'End', stage: 'SILENT' }, end_lost: { type: 'End', stage: 'LOST', reason: 'REFUSED' }, end_human: { type: 'End', handoff: true } }, first: 'n1', stats30: { entered: 41, completed: 11, silent: 24, lost: 2, handoff: 4, active: 0 },
      },
      {
        id: 'F3', name: '报价跟单 SOP（草稿）', description: '人工报价后 24h 未回复 → 追问 → 48h 未回复 → 发案例 → 结束交人工', status: 'DRAFT', version: 0, publishedVersion: null, priority: 30, source: 'NL_PARSED', nlDescription: '报价发出后一天没回复就追问一下，再过两天没回复发个案例，还是没回复就交给销售', createdAt: ago(2), updatedAt: ago(2),
        trigger: { on: 'MANUAL', priority: 30 }, guardrails: { maxAutoSends: 3, maxLoops: 1 },
        nodes: { n1: { type: 'WaitForReply', timeoutHours: 24, autoReplyByScriptLib: true, branches: { NO_REPLY: 'n2', REFUSED: 'end_lost', '*': 'end_human' } }, n2: { type: 'Send', scriptId: 107, next: 'n3' }, n3: { type: 'WaitForReply', timeoutHours: 48, autoReplyByScriptLib: true, branches: { NO_REPLY: 'n4', '*': 'end_human' } }, n4: { type: 'Send', scriptId: 102, next: 'end_human' }, end_lost: { type: 'End', stage: 'LOST', reason: 'REFUSED' }, end_human: { type: 'End', handoff: true } }, first: 'n1', stats30: { entered: 0, completed: 0, silent: 0, lost: 0, handoff: 0, active: 0 },
      },
    ];
    const flowInstances = [
      { id: 'FI1', flowId: 'F1', version: 2, leadId: 'L001', status: 'WAITING', currentNode: 'n5', waitingType: 'HUMAN_TASK', waitingUntil: later(1.75), stepSeq: 4, loops: {}, autoSends: 2, startedAt: ago(27), log: [{ seq: 1, node: 'n1', type: 'Send', event: 'ENTER', outcome: 'next', t: ago(27), ref: '触达 OT001' }, { seq: 2, node: 'n2', type: 'WaitForReply', event: 'ENTER', outcome: 'WAITING(72h)', t: ago(25) }, { seq: 3, node: 'n2', type: 'WaitForReply', event: 'REPLY:ASK_PRICE', outcome: 'ASK_PRICE', t: ago(0.25) }, { seq: 4, node: 'n5', type: 'HumanTask', event: 'ENTER', outcome: 'WAITING(2h 升级)', t: ago(0.25), ref: '审核单 AP001' }] },
      { id: 'FI2', flowId: 'F1', version: 2, leadId: 'L004', status: 'WAITING', currentNode: 'n2', waitingType: 'REPLY', waitingUntil: later(41), stepSeq: 2, loops: {}, autoSends: 1, startedAt: ago(31), log: [{ seq: 1, node: 'n1', type: 'Send', event: 'ENTER', outcome: 'next', t: ago(31) }, { seq: 2, node: 'n2', type: 'WaitForReply', event: 'ENTER', outcome: 'WAITING(72h)', t: ago(31) }] },
      { id: 'FI3', flowId: 'F1', version: 2, leadId: 'L002', status: 'WAITING', currentNode: 'n4', waitingType: 'TIMER', waitingUntil: later(167), stepSeq: 4, loops: {}, autoSends: 2, startedAt: ago(48), log: [{ seq: 1, node: 'n1', type: 'Send', event: 'ENTER', outcome: 'next', t: ago(48) }, { seq: 2, node: 'n2', type: 'WaitForReply', event: 'ENTER', outcome: 'WAITING(72h)', t: ago(48) }, { seq: 3, node: 'n2', type: 'WaitForReply', event: 'REPLY:CONSIDERING', outcome: 'CONSIDERING', t: ago(1.1) }, { seq: 4, node: 'n4', type: 'Wait', event: 'ENTER', outcome: 'WAITING(168h)', t: ago(1.1) }] },
      { id: 'FI4', flowId: 'F1', version: 2, leadId: 'L003', status: 'WAITING', currentNode: 'n2', waitingType: 'REPLY', waitingUntil: later(44), stepSeq: 4, loops: { n2b: 1 }, autoSends: 2, startedAt: ago(28), log: [{ seq: 1, node: 'n1', type: 'Send', event: 'ENTER', outcome: 'next', t: ago(28) }, { seq: 2, node: 'n2', type: 'WaitForReply', event: 'ENTER', outcome: 'WAITING(72h)', t: ago(28) }, { seq: 3, node: 'n2', type: 'WaitForReply', event: 'REPLY:ASK_MATERIAL', outcome: '*', t: ago(3.3) }, { seq: 4, node: 'n2b', type: 'GoTo', event: 'ENTER', outcome: '→ n2 (1/2)', t: ago(3.3) }] },
      { id: 'FI5', flowId: 'F1', version: 2, leadId: 'L005', status: 'COMPLETED', currentNode: 'end_human', waitingType: null, stepSeq: 7, loops: { n2b: 1 }, autoSends: 3, startedAt: ago(19), endedAt: ago(0.59), endReason: 'END_NODE(handoff)', log: [{ seq: 1, node: 'n1', type: 'Send', event: 'ENTER', outcome: 'next', t: ago(19) }, { seq: 2, node: 'n2', type: 'WaitForReply', event: 'ENTER', outcome: 'WAITING', t: ago(19) }, { seq: 3, node: 'n2', type: 'WaitForReply', event: 'REPLY:ASK_CASE', outcome: '*', t: ago(5) }, { seq: 4, node: 'n2b', type: 'GoTo', event: 'ENTER', outcome: '→ n2 (1/2)', t: ago(5) }, { seq: 5, node: 'n2', type: 'WaitForReply', event: 'REPLY:CONTRACT+entities', outcome: 'HAS_ENTITIES', t: ago(0.6) }, { seq: 6, node: 'n6', type: 'SetStage', event: 'ENTER', outcome: 'HOT', t: ago(0.6) }, { seq: 7, node: 'n8', type: 'Notify', event: 'ENTER', outcome: 'owner 已通知 → End(handoff)', t: ago(0.59) }] },
      { id: 'FI6', flowId: 'F1', version: 1, leadId: 'L007', status: 'COMPLETED', currentNode: 'end_silent', stepSeq: 6, loops: {}, autoSends: 3, startedAt: ago(9 * 24), endedAt: ago(3 * 24), endReason: 'END_NODE(SILENT)', log: [] },
      { id: 'FI7', flowId: 'F1', version: 1, leadId: 'L008', status: 'TERMINATED', currentNode: 'n2', stepSeq: 2, loops: {}, autoSends: 1, startedAt: ago(4 * 24), endedAt: ago(3.5 * 24), endReason: 'BLACKLISTED', log: [] },
      { id: 'FI8', flowId: 'F1', version: 2, leadId: 'L016', status: 'PAUSED', currentNode: 'n2', waitingType: 'REPLY', waitingUntil: later(42), stepSeq: 2, loops: {}, autoSends: 1, startedAt: ago(30), pausedReason: '会话待人工（无话术命中）', log: [] },
    ];

    /* 跟进待办 */
    const followUps = [
      { id: 'FU1', leadId: 'L001', owner: 2, type: 'FLOW_HUMAN_TASK', reason: 'FLOW_HUMAN_TASK', flowInstanceId: 'FI1', nodeId: 'n5', dueAt: later(1.75), status: 'PENDING', note: '报价审核 · 2h 未处理升级主管' },
      { id: 'FU2', leadId: 'L004', owner: 2, type: 'FLOW_TIMER', reason: 'FLOW_WAIT_REPLY', flowInstanceId: 'FI2', nodeId: 'n2', dueAt: later(41), status: 'PENDING' },
      { id: 'FU3', leadId: 'L002', owner: 3, type: 'FLOW_TIMER', reason: 'FLOW_WAIT', flowInstanceId: 'FI3', nodeId: 'n4', dueAt: later(167), status: 'PENDING' },
      { id: 'FU4', leadId: 'L003', owner: 2, type: 'FLOW_TIMER', reason: 'FLOW_WAIT_REPLY', flowInstanceId: 'FI4', nodeId: 'n2', dueAt: later(44), status: 'PENDING' },
      { id: 'FU5', leadId: 'L005', owner: 3, type: 'MANUAL', reason: 'HUMAN_SET', dueAt: later(20), status: 'PENDING', note: '下周开标，约上门聊账期（周总）' },
      { id: 'FU6', leadId: 'L017', owner: 3, type: 'AUTO', reason: 'NO_REPLY', plannedScript: 107, dueAt: ago(2), status: 'PENDING', note: '简易链：首触 72h 未回复' },
      { id: 'FU7', leadId: 'L019', owner: 4, type: 'MANUAL', reason: 'HUMAN_SET', dueAt: ago(20), status: 'PENDING', note: '电话回访' },
      { id: 'FU8', leadId: 'L021', owner: 2, type: 'AUTO', reason: 'CONSIDERING', plannedScript: 105, dueAt: later(6), status: 'PENDING' },
      { id: 'FU9', leadId: 'L009', owner: 2, type: 'MANUAL', reason: 'HUMAN_SET', dueAt: ago(2 * 24), status: 'DONE', doneAt: ago(2 * 24), result: 'WON', note: '合同已签，首批 50 吨' },
      { id: 'FU10', leadId: 'L006', owner: 4, type: 'AUTO', reason: 'NO_REPLY', plannedScript: 107, dueAt: later(3), status: 'PENDING' },
    ];

    /* 自动化任务 */
    const jobs = [
      { id: 'J1', name: '每日抓取线索', nl: '每天早上 9 点抓取线索', action: 'CAPTURE', cron: '0 0 9 * * ?', scheduleText: '每天 09:00', spec: { platforms: ['DOUYIN', 'XIAOHONGSHU', 'FORUM', 'WECHAT_PERSONAL', 'HDZ_INTERNAL'], captureRuleIds: ['r1', 'r2', 'r3', 'r4', 'r5', 'r7'], maxCount: 500 }, enabled: true, lastRun: ago(3), lastStatus: 'SUCCESS', nextRun: later(21), runs: 14 },
      { id: 'J2', name: '每日发送触达', nl: '每天 10 点给意图分 60 以上的新线索发送首触话术', action: 'OUTREACH', cron: '0 0 10 * * ?', scheduleText: '每天 10:00', spec: { filter: { stage: ['NEW'], minScore: 60, createdWithinDays: 3 }, scriptId: 101, channelAccountIds: ['a1', 'a2', 'a6', 'a7'], maxCount: 200 }, enabled: true, lastRun: ago(2), lastStatus: 'PARTIAL', nextRun: later(22), runs: 14 },
      { id: 'J3', name: '跟进未回复客户', nl: '下午 2 点跟进未回复客户', action: 'FOLLOW_UP', cron: '0 0 14 * * ?', scheduleText: '每天 14:00', spec: { filter: { dueBefore: 'now' }, maxCount: 200 }, enabled: true, lastRun: ago(26), lastStatus: 'SUCCESS', nextRun: later(2), runs: 13 },
      { id: 'J4', name: '更新看板', nl: '下午 5 点更新看板', action: 'REFRESH_DASHBOARD', cron: '0 0 17 * * ?', scheduleText: '每天 17:00', spec: {}, enabled: true, lastRun: ago(23), lastStatus: 'SUCCESS', nextRun: later(5), runs: 13 },
      { id: 'J5', name: '周一案例再触达', nl: '每周一早上八点半给三天没回复的人再发一次案例', action: 'FOLLOW_UP', cron: '0 30 8 ? * MON', scheduleText: '每周一 08:30', spec: { filter: { noReplyDays: 3, stage: ['CONTACTED'] }, scriptId: 102, maxCount: 100 }, enabled: false, lastRun: null, lastStatus: null, nextRun: null, runs: 0 },
    ];
    const jobRuns = [
      { id: 'JR101', jobId: 'J1', action: 'CAPTURE', trigger: 'CRON', status: 'SUCCESS', startedAt: ago(3), finishedAt: ago(2.9), total: 351, success: 351, failed: 0, skipped: 0, summary: { raw: 351, dedup: 63, classified: 288, leadsCreated: 35, reactivated: 4, ignored: 249 } },
      { id: 'JR102', jobId: 'J2', action: 'OUTREACH', trigger: 'CRON', status: 'PARTIAL', startedAt: ago(2), finishedAt: ago(1.6), total: 38, success: 35, failed: 3, skipped: 0, summary: { sent: 35, failed: 3, blocked: 0, missingVars: 1 }, errors: ['L012：缺少变量 nickname（论坛匿名用户）', 'a8：账号熔断中，2 条改期'] },
      { id: 'JR103', jobId: 'J3', action: 'FOLLOW_UP', trigger: 'CRON', status: 'SUCCESS', startedAt: ago(26), finishedAt: ago(25.8), total: 21, success: 19, failed: 0, skipped: 2, summary: { flowTimers: 12, simpleChain: 7, silent: 2 } },
      { id: 'JR104', jobId: 'J4', action: 'REFRESH_DASHBOARD', trigger: 'CRON', status: 'SUCCESS', startedAt: ago(23), finishedAt: ago(22.99), total: 1, success: 1, failed: 0, skipped: 0, summary: { rows: 12 } },
      { id: 'JR105', jobId: 'J2', action: 'OUTREACH', trigger: 'DRY_RUN', status: 'PARTIAL', startedAt: ago(1 * 24 + 3), finishedAt: ago(1 * 24 + 2.99), total: 5, success: 4, failed: 1, skipped: 0, summary: { preview: 5, missingVars: 1 }, errors: ['L012：缺少变量 nickname'] },
    ];

    /* 触达记录 */
    const outreach = [
      { id: 'OT001', leadId: 'L001', account: 'a4', trigger: 'JOB', round: 1, scriptId: 101, content: '张总，看到您在抖音-#钢材批发问「有没有货，螺纹钢 HRB400 20 的」…', hits: ['nickname', 'source_channel', 'source_excerpt'], status: 'SENT', sentAt: ago(25), replied: true, repliedAt: ago(0.25), jobRunId: 'JR102x', evidence: true },
      { id: 'OT002', leadId: 'L003', account: 'a6', trigger: 'JOB', round: 1, scriptId: 101, content: '李工，看到您在中国钢材网论坛-供求版块问「求购 HRB400E…」…', hits: ['nickname', 'source_channel', 'source_excerpt'], status: 'SENT', sentAt: ago(28), replied: true, repliedAt: ago(3.3) },
      { id: 'OT003', leadId: 'L004', account: 'a2', trigger: 'JOB', round: 1, scriptId: 101, content: '赵老板，看到您在微信群-苏州建材采购群问「谁有盘螺 8 个的，急要 50 吨」…', hits: ['nickname', 'source_channel', 'source_excerpt'], status: 'SENT', sentAt: ago(31), replied: false, evidence: true, pacing: { pre: 137, typing: 6 } },
      { id: 'OT004', leadId: 'L005', account: 'a7', trigger: 'JOB', round: 1, scriptId: 101, content: '周总，看到您在货袋子-圈子问「求推荐苏州附近靠谱的螺纹钢供应商」…', hits: ['nickname', 'source_channel', 'source_excerpt'], status: 'SENT', sentAt: ago(19), replied: true, repliedAt: ago(5) },
      { id: 'OT005', leadId: 'L002', account: 'a1', trigger: 'JOB', round: 1, scriptId: 112, content: '王经理您好，看到您给我们「苏州仓到货 2000 吨盘螺」点了赞…', hits: ['nickname', 'source_excerpt'], status: 'SENT', sentAt: ago(48), replied: true, repliedAt: ago(1.1) },
      { id: 'OT006', leadId: 'L012', account: 'a6', trigger: 'JOB', round: 1, scriptId: 101, content: '', hits: [], status: 'FAILED', failCode: 'MISSING_VAR', failMessage: '缺少必需变量 nickname（论坛匿名用户）', sentAt: null, replied: false, jobRunId: 'JR102' },
      { id: 'OT007', leadId: 'L011', account: 'a8', trigger: 'JOB', round: 1, scriptId: 101, content: '钢铁小哥，看到您在抖音-#钢材批发问「求推荐一家能开票的钢贸公司」…', hits: ['nickname', 'source_channel', 'source_excerpt'], status: 'BLOCKED', failCode: 'DY_FREQ_LIMIT', failMessage: '抖音提示操作频繁，账号已熔断', sentAt: null, jobRunId: 'JR102' },
      { id: 'OT008', leadId: 'L010', account: 'a2', trigger: 'MANUAL', round: 1, scriptId: 101, content: '陈老板，看到您扫了我们「9 月锁价活动」的海报…', hits: ['nickname', 'source_excerpt'], status: 'QUEUED', scheduledAt: later(0.05), queuePos: 1 },
      { id: 'OT009', leadId: 'L017', account: 'a2', trigger: 'FOLLOW_UP', round: 2, scriptId: 107, content: '朱经理，前两天给您发的螺纹钢资料看了吗？…', hits: ['nickname', 'product'], status: 'QUEUED', scheduledAt: later(0.1), queuePos: 2 },
      { id: 'OT010', leadId: 'L007', account: 'a6', trigger: 'FOLLOW_UP', round: 3, scriptId: 105, content: '吴工，上次您说再考虑，本月我们对新客户有锁价 7 天的活动…', hits: ['nickname'], status: 'SENT', sentAt: ago(3 * 24), replied: false },
      { id: 'OT011', leadId: 'L009', account: 'a4', trigger: 'AUTO_REPLY', round: 1, scriptId: 103, content: '收到刘经理，这边马上给您核一下今天的出厂价，稍后回您。', hits: ['nickname'], status: 'SENT', sentAt: ago(8 * 24), replied: true },
      { id: 'OT012', leadId: 'L008', account: 'a2', trigger: 'JOB', round: 1, scriptId: 101, content: '郑总，看到您在微信群-华东钢贸交流群问「有做线材的吗，报个价」…', hits: ['nickname', 'source_channel', 'source_excerpt'], status: 'SENT', sentAt: ago(4 * 24), replied: true, repliedAt: ago(3.5 * 24) },
    ];
    for (let i = 13; i <= 30; i++) { const l = L[ri(15, L.length - 1)]; outreach.push({ id: 'OT' + String(i).padStart(3, '0'), leadId: l.id, account: pick(['a1', 'a2', 'a6', 'a7', 'a4']), trigger: pick(['JOB', 'JOB', 'FOLLOW_UP', 'AUTO_REPLY']), round: ri(1, 2), scriptId: pick([101, 107, 108, 104]), content: `${l.nickname}，看到您在${l.sourceChannel}问「${l.sourceExcerpt}」…`, hits: ['nickname', 'source_channel'], status: pick(['SENT', 'SENT', 'SENT', 'SENT', 'FAILED']), sentAt: ago(ri(1, 6 * 24)), replied: rnd() < 0.32 }); }

    /* 审核单 */
    const approvals = [
      { id: 'AP001', leadId: 'L001', convId: 'C1', type: 'QUOTE', assignee: 2, status: 'PENDING', createdAt: ago(0.25), dueAt: later(1.75), triggerText: '要 200 吨左右，发到苏州工业园区，多少钱一吨？', aiSuggestion: '张总，今日沙钢 HRB400 Φ20 苏州仓出厂价 3,850 元/吨（含税），200 吨可按 3,830 谈，园区内送到约 +30/吨，下午 4 点前下单明天可到。（AI 依据：企业资料库「今日价格表 0925」；仅供参考，请核实后发送）' },
      { id: 'AP002', leadId: 'L005', convId: 'C2', type: 'CONTRACT', assignee: 3, status: 'PENDING', createdAt: ago(0.59), dueAt: later(1.4), triggerText: '我们下周开标，能不能派人来一趟聊聊账期？', aiSuggestion: '周总，账期我们对月用量 500 吨的客户可支持 30 天，具体条款需签框架合同。我周二上午可以到贵司拜访，方便吗？（AI 草拟，账期条款须由负责人确认）' },
      { id: 'AP003', leadId: 'L009', convId: 'C7', type: 'QUOTE', assignee: 2, status: 'APPROVED_SENT', createdAt: ago(8 * 24), decidedAt: ago(7.9 * 24), triggerText: '这个多少钱一吨？发到杭州', finalContent: '刘经理，今日沙钢 HRB400 Φ16-25 苏州仓出厂 3,860/吨，杭州到货约 +45 运费，量大可谈。' },
      { id: 'AP004', leadId: 'L020', convId: null, type: 'AI_POLISH', assignee: 2, status: 'PENDING', createdAt: ago(0.8), dueAt: later(3), triggerText: 'AI 润色首触话术待确认', aiSuggestion: '胡工您好，刷到您在论坛找 Q235B 中厚板，我们苏州仓这周正好到了一批 16mm 的，给您发个规格和价格看看？—张三' },
    ];

    /* 海报（来自海报系统）与分发 */
    const posters = [
      { id: 'PS1', title: '9 月新客锁价 7 天', scene: '促销活动', bg: 'linear-gradient(135deg,#ff6b6b,#ffb457)', baseCode: 'Q7K2MV', scans: 143, leads: 9 },
      { id: 'PS2', title: '苏州仓到货 2000 吨盘螺', scene: '到货通知', bg: 'linear-gradient(135deg,#1f5eff,#7c3aed)', baseCode: 'H3N8PD', scans: 88, leads: 4 },
      { id: 'PS3', title: '深夜行情早报 · 9.25', scene: '行情', bg: 'linear-gradient(135deg,#0f1b33,#1f5eff)', baseCode: 'M9C1XA', scans: 212, leads: 6 },
      { id: 'PS4', title: '国庆假期发货安排', scene: '通知公告', bg: 'linear-gradient(135deg,#16a34a,#a3e635)', baseCode: 'T5R2KQ', scans: 0, leads: 0 },
    ];
    const posterDispatches = [
      { id: 'PD1', posterId: 'PS1', caption: '9 月新客锁价 7 天，扫码看详情 — {company}', scheduledAt: ago(26), status: 'PARTIAL', createdBy: 1, items: [
        { id: 'PDI1', account: 'a1', platform: 'WECOM', targetType: 'GROUP', targetName: '企微·苏州客户群 A', shareChannel: 'group', trackCode: 'Q7K2MV-G', status: 'SENT', sentAt: ago(26), scans: 61, leads: 4 },
        { id: 'PDI2', account: 'a1', platform: 'WECOM', targetType: 'WECOM_MOMENTS', targetName: '企微·客户朋友圈', shareChannel: 'moments', trackCode: 'Q7K2MV-M', status: 'SENT', sentAt: ago(25.5), scans: 48, leads: 3 },
        { id: 'PDI3', account: 'a2', platform: 'WECHAT_PERSONAL', targetType: 'GROUP', targetName: '微信群·华东钢贸交流群', shareChannel: 'group', trackCode: 'Q7K2MV-G', status: 'SENT', sentAt: ago(25), scans: 61, leads: 4, evidence: true },
        { id: 'PDI4', account: 'a2', platform: 'WECHAT_PERSONAL', targetType: 'MOMENTS', targetName: '个人微信·朋友圈', shareChannel: 'moments', trackCode: 'Q7K2MV-M', status: 'SENT', sentAt: ago(24.8), scans: 48, leads: 3, evidence: true },
        { id: 'PDI5', account: 'a6', platform: 'FORUM', targetType: 'FORUM_POST', targetName: '论坛·供求版块', shareChannel: 'other', trackCode: 'Q7K2MV-O', status: 'SENT', sentAt: ago(25.9), scans: 34, leads: 2 },
        { id: 'PDI6', account: 'a5', platform: 'XIAOHONGSHU', targetType: 'XHS_NOTE', targetName: '小红书·发笔记', shareChannel: 'other', trackCode: 'Q7K2MV-O', status: 'FAILED', failCode: 'XHS_CONTENT_REVIEW', failMessage: '笔记含促销词「锁价」进入人工审核，24h 内未过审' },
      ] },
      { id: 'PD2', posterId: 'PS3', caption: '今日行情已更新 — {company}', scheduledAt: later(0.5), status: 'SCHEDULED', createdBy: 2, items: [
        { id: 'PDI7', account: 'a1', platform: 'WECOM', targetType: 'GROUP', targetName: '企微·苏州客户群 A', shareChannel: 'group', trackCode: 'M9C1XA-G', status: 'QUEUED' },
        { id: 'PDI8', account: 'a2', platform: 'WECHAT_PERSONAL', targetType: 'GROUP', targetName: '微信群·苏州建材采购群', shareChannel: 'group', trackCode: 'M9C1XA-G', status: 'QUEUED' },
        { id: 'PDI9', account: 'a2', platform: 'WECHAT_PERSONAL', targetType: 'MOMENTS', targetName: '个人微信·朋友圈', shareChannel: 'moments', trackCode: 'M9C1XA-M', status: 'QUEUED' },
      ] },
    ];

    /* 看板日报（14 天） */
    const days = []; for (let i = 13; i >= 0; i--) { const d = NOW - i * D; const g = 1 + (13 - i) * 0.06; days.push({ date: d, captured: Math.round((180 + ri(-30, 60)) * g), leadsNew: Math.round((22 + ri(-6, 10)) * g), outreachSent: Math.round((110 + ri(-20, 40)) * g), replied: Math.round((28 + ri(-8, 14)) * g), hot: ri(2, 7), won: ri(0, 3), lost: ri(2, 6), autoReplies: Math.round((60 + ri(-15, 25)) * g), humanReplies: ri(8, 20), escalated: ri(4, 12), posterScans: ri(10, 60), aiCost: +(ri(8, 20) / 10).toFixed(1) }); }
    days[13].outreachSent = 312; days[13].replied = 100; days[13].hot = 6; days[13].won = 1; days[13].leadsNew = 35; days[13].captured = 351;
    const byOwner = [{ owner: 2, sent: 128, replied: 46, hot: 8, won: 2, wonAmount: 236000 }, { owner: 3, sent: 104, replied: 31, hot: 6, won: 1, wonAmount: 88000 }, { owner: 4, sent: 80, replied: 23, hot: 4, won: 1, wonAmount: 52000 }];
    const byChannel = [{ platform: 'HDZ_INTERNAL', captured: 19, leads: 8, sent: 31, replyRate: 0.48, health: 'ONLINE' }, { platform: 'WECOM', captured: 33, leads: 2, sent: 18, replyRate: 0.39, health: 'ONLINE' }, { platform: 'FORUM', captured: 27, leads: 5, sent: 14, replyRate: 0.29, health: 'ONLINE' }, { platform: 'WECHAT_PERSONAL', captured: 212, leads: 9, sent: 29, replyRate: 0.34, health: 'ONLINE' }, { platform: 'DOUYIN', captured: 79, leads: 10, sent: 13, replyRate: 0.23, health: 'RESTRICTED' }, { platform: 'XIAOHONGSHU', captured: 14, leads: 3, sent: 5, replyRate: 0.20, health: 'ONLINE' }];

    /* 风控 */
    const riskPolicies = [
      { id: 'RP1', platform: 'WECHAT_PERSONAL', tier: 'MINOR', name: '个人微信 · 小号（平台默认）', hourly: 8, daily: 40, newContacts: 20, minInterval: 90, delayMin: 60, delayMax: 240, hours: '08:30-21:30', warmup: [[3, .2], [7, .5], [9999, 1]], maxPerLead: 3, circuitThreshold: 2, circuitMinutes: 240, platformDefault: true },
      { id: 'RP2', platform: 'WECHAT_PERSONAL', tier: 'MAJOR', name: '个人微信 · 主号（仅回复）', hourly: 10, daily: 60, newContacts: 0, minInterval: 60, delayMin: 30, delayMax: 180, hours: '08:30-21:30', maxPerLead: 3, circuitThreshold: 2, circuitMinutes: 240, platformDefault: true },
      { id: 'RP3', platform: 'WECOM', tier: 'MAJOR', name: '企业微信（官方限制）', hourly: 60, daily: 200, newContacts: 100, minInterval: 5, delayMin: 5, delayMax: 20, hours: '08:30-21:30', maxPerLead: 3, circuitThreshold: 5, circuitMinutes: 60, platformDefault: true },
      { id: 'RP4', platform: 'DOUYIN', tier: 'MINOR', name: '抖音 · RPA 小号', hourly: 5, daily: 20, newContacts: 10, minInterval: 120, delayMin: 90, delayMax: 300, hours: '09:00-22:00', maxPerLead: 2, circuitThreshold: 2, circuitMinutes: 240, publicCapture: { contentsPerDay: 15, pagesPerContent: 3, dwell: [30, 120], sessions: 2, sessionMax: 40 }, platformDefault: true },
      { id: 'RP5', platform: 'XIAOHONGSHU', tier: 'MINOR', name: '小红书 · RPA 小号', hourly: 5, daily: 20, newContacts: 10, minInterval: 120, delayMin: 90, delayMax: 300, hours: '09:00-22:00', maxPerLead: 2, circuitThreshold: 2, circuitMinutes: 240, publicCapture: { contentsPerDay: 15, pagesPerContent: 3, dwell: [30, 120], sessions: 2, sessionMax: 40 }, platformDefault: true },
      { id: 'RP6', platform: 'FORUM', tier: 'MAJOR', name: '行业论坛', hourly: 20, daily: 100, newContacts: 50, minInterval: 10, delayMin: 10, delayMax: 60, hours: '00:00-24:00', maxPerLead: 3, circuitThreshold: 3, circuitMinutes: 120, platformDefault: true },
      { id: 'RP7', platform: 'HDZ_INTERNAL', tier: 'MAJOR', name: '货袋子站内', hourly: 60, daily: 500, newContacts: 200, minInterval: 2, delayMin: 0, delayMax: 5, hours: '00:00-24:00', maxPerLead: 5, circuitThreshold: 99, circuitMinutes: 0, platformDefault: true },
      { id: 'RP8', platform: 'WECHAT_PERSONAL', tier: 'MINOR', name: '商家自定义 · 小号更保守', hourly: 6, daily: 30, newContacts: 15, minInterval: 120, delayMin: 90, delayMax: 300, hours: '09:00-20:30', maxPerLead: 2, circuitThreshold: 1, circuitMinutes: 480, platformDefault: false },
    ];
    const incidents = [
      { id: 'RI1', t: ago(1.7), account: 'a8', signal: 'FREQ_LIMIT_TOAST', level: 'danger', text: '抖音提示「操作频繁，请稍后再试」，1h 内第 2 次 → 账号熔断 240 分钟', handled: false, evidence: true },
      { id: 'RI2', t: ago(2.1), account: 'a8', signal: 'FREQ_LIMIT_TOAST', level: 'warning', text: '抖音提示「操作频繁」，1h 内第 1 次', handled: true },
      { id: 'RI3', t: ago(20), account: 'a2', signal: 'CAPTCHA_SHOWN', level: 'danger', text: '微信出现滑块验证 → 账号 NEED_VERIFY，人工在设备上完成后已恢复', handled: true, handledBy: '张三', evidence: true },
      { id: 'RI4', t: ago(2 * 24 + 4), account: 'a2', signal: 'UI_CHANGED', level: 'warning', text: '微信 8.0.56 群成员列表控件变化，技能脚本 WxReadGroup v1.3 → 已更新至 v1.4 并恢复', handled: true, handledBy: '运营' },
      { id: 'RI5', t: ago(3 * 24), account: 'a3', signal: 'LOGGED_OUT', level: 'warning', text: '主号在设备上退出登录 → 账号 OFFLINE，待重新登录', handled: false },
    ];
    const blacklist = [
      { id: 'BL1', platform: 'WECHAT_PERSONAL', peer: '郑总（华东钢贸交流群）', leadId: 'L008', reason: 'REFUSED', evidence: '别发了，不需要', t: ago(3.5 * 24) },
      { id: 'BL2', platform: 'DOUYIN', peer: 'dy_u_77213', leadId: null, reason: 'COMPLAINT', evidence: '客户投诉骚扰（平台侧）', t: ago(6 * 24) },
      { id: 'BL3', platform: 'FORUM', peer: 'bbs_competitor_x', leadId: null, reason: 'COMPETITOR', evidence: '同行账号', t: ago(12 * 24) },
    ];
    const dailyReports = [];
    [2, 3, 4].forEach(u => { for (let i = 1; i <= 6; i++) { if (u === 4 && i === 1) continue; const neg = ri(50, 75), pros = ri(5, 15), fu = ri(10, 25); dailyReports.push({ owner: u, date: fmt_date(NOW - i * D), negotiation: neg, prospecting: pros, followUp: fu, other: Math.max(0, 100 - neg - pros - fu), manualDeals: ri(0, 1), note: '' }); } });
    function fmt_date(t) { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }

    const notices = [
      { t: ago(0.25), cls: 'flow', text: '【待审核】张总（抖音）询价：200 吨 HRB400 Φ20 → 审核单 AP001，2 小时内未处理将升级主管', link: 'approvals.html' },
      { t: ago(0.6), cls: 'flow', text: '【高意向】周总（货袋子）提到「下周开标 / 账期」，流程已置 HOT 并交人工', link: 'workbench.html?c=C2' },
      { t: ago(1.7), cls: 'sys', text: '【账号异常】抖音小号（采集）1h 内 2 次操作频繁提示，已熔断 4 小时', link: 'risk.html?tab=incidents' },
      { t: ago(2), cls: 'sys', text: '【任务】每日发送触达 完成：35 成功 / 3 失败（1 条缺少昵称变量）', link: 'jobs.html' },
      { t: ago(2), cls: 'user', text: '【待人工】马总（论坛）问「能做代加工吗」无话术命中，请在会话工作台处理', link: 'workbench.html?c=C8' },
      { t: ago(23), cls: 'sys', text: '【填报提醒】王五 昨日「销售时间分配」未填报', link: 'dashboard.html' },
    ];

    return { users, merchant, devices, accounts, captureRules, scripts, refusals, leads: L, conversations, flows, flowInstances, followUps, jobs, jobRuns, outreach, approvals, posters, posterDispatches, days, byOwner, byChannel, riskPolicies, incidents, blacklist, dailyReports, notices, globalSwitch: { rpaEnabled: true, paused: [] } };
  }

  let S;
  try { const raw = localStorage.getItem(VERSION); S = raw ? JSON.parse(raw) : null; } catch (e) { S = null; }
  if (!S) { S = build(); }
  const ACQ = S;
  ACQ.save = () => { try { localStorage.setItem(VERSION, JSON.stringify(S, (k, v) => typeof v === 'function' ? undefined : v)); } catch (e) { } };
  ACQ.lead = (id) => S.leads.find(l => l.id === id);
  ACQ.user = (id) => S.users.find(u => u.id === id) || { name: '—', short: '?' };
  ACQ.script = (id) => S.scripts.find(s => s.id === id);
  ACQ.account = (id) => S.accounts.find(a => a.id === id);
  ACQ.flow = (id) => S.flows.find(f => f.id === id);
  ACQ.instanceOf = (leadId) => S.flowInstances.find(i => i.leadId === leadId && ['ACTIVE', 'WAITING', 'PAUSED'].includes(i.status));
  ACQ.convOf = (leadId) => S.conversations.find(c => c.leadId === leadId);
  ACQ.badges = () => ({ needHuman: S.conversations.filter(c => c.status === 'NEED_HUMAN').length, dueToday: S.followUps.filter(f => f.status === 'PENDING' && f.dueAt <= NOW + D && f.type !== 'FLOW_TIMER').length, approvals: S.approvals.filter(a => a.status === 'PENDING').length });
  ACQ.myLeads = (me) => me.role === 'admin' ? S.leads : S.leads.filter(l => l.owner === me.id);
  ACQ.addEvent = (lead, ev) => { lead.events = lead.events || []; lead.events.unshift(Object.assign({ t: Date.now() }, ev)); };
  ACQ.NOW = NOW; ACQ.H = H; ACQ.D = D;
  w.ACQ = ACQ;
})(window);
