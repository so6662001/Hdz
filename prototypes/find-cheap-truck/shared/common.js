/* 找顺路车 · 通用交互（纯前端原型，无后端） */
(function () {
  var H = window.HDZ = window.HDZ || {};
  var qs = function (s, r) { return (r || document).querySelector(s); };
  var qsa = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  H.qs = qs; H.qsa = qsa;
  H.param = function (k, d) { var m = new RegExp('[?&]' + k + '=([^&]*)').exec(location.search); return m ? decodeURIComponent(m[1]) : d; };

  /* ---------- 原型导航条 ---------- */
  H.embed = /[?&]embed=1/.test(location.search);
  H.protoBar = function (current, links) {
    if (H.embed) { document.body.classList.add('embed'); return; }
    var bar = document.createElement('div');
    bar.className = 'proto-bar';
    var html = '<b>货袋子 · 找顺路车 原型</b>';
    html += '<a href="' + H.rel('index.html') + '">总览</a>';
    links.forEach(function (l) { html += '<a href="' + l.href + '" class="' + (l.key === current ? 'on' : '') + '">' + l.label + '</a>'; });
    html += '<span class="sp"></span><span class="hint">纯前端演示 · 数据为模拟</span>';
    bar.innerHTML = html;
    document.body.appendChild(bar);
    document.body.classList.add('has-proto-bar');
  };
  H.rel = function (p) { return (/\/(driver|shipper|admin)\//.test(location.pathname) ? '../' : '') + p; };

  H.DRIVER_LINKS = [
    { key: 'home', label: '悟运·运力', href: 'home.html' },
    { key: 'publish', label: '发布运力', href: 'publish.html' },
    { key: 'idle', label: '闲置车', href: 'publish-idle.html' },
    { key: 'form', label: '手动表单', href: 'publish-form.html' },
    { key: 'vehicle', label: '添加车辆', href: 'vehicle-add.html' },
    { key: 'needs', label: '沿线需求', href: 'needs.html' },
    { key: 'notify', label: '服务通知', href: 'notify.html' },
    { key: 'appeal', label: '申诉', href: 'appeal.html' },
    { key: 'pc', label: 'PC找车', href: '../shipper/pc-find.html' },
    { key: 'm', label: '小程序找车', href: '../shipper/m-find.html?shell=mp' },
    { key: 'need', label: '用车需求', href: '../shipper/pc-need.html' },
    { key: 'admin', label: '运营后台', href: '../admin/console.html' },
  ];
  H.SHIPPER_LINKS = [
    { key: 'pc', label: 'PC找车', href: 'pc-find.html' },
    { key: 'pcd', label: 'PC详情', href: 'pc-detail.html?id=p1001' },
    { key: 'need', label: 'PC用车需求', href: 'pc-need.html' },
    { key: 'm', label: '小程序找车', href: 'm-find.html?shell=mp' },
    { key: 'mneed', label: '小程序需求', href: 'm-need.html?shell=mp' },
    { key: 'h5', label: 'H5找车', href: 'm-find.html?shell=h5' },
    { key: 'l2', label: '合作承运', href: 'pc-l2.html?id=p1001' },
    { key: 'home', label: '悟运·运力', href: '../driver/home.html' },
    { key: 'needs', label: '悟运·沿线需求', href: '../driver/needs.html' },
    { key: 'admin', label: '运营后台', href: '../admin/console.html' },
  ];

  /* ---------- 说明面板 ---------- */
  H.notes = function (title, items) {
    if (H.embed) return;
    var p = document.createElement('div');
    p.className = 'note-panel';
    p.innerHTML = '<h4>' + title + '<span data-x>收起 ×</span></h4><ul>' + items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>';
    var t = document.createElement('div');
    t.className = 'note-toggle'; t.textContent = '设计说明'; t.style.display = 'none';
    document.body.appendChild(p); document.body.appendChild(t);
    qs('[data-x]', p).onclick = function () { p.classList.add('hidden'); t.style.display = 'block'; };
    t.onclick = function () { p.classList.remove('hidden'); t.style.display = 'none'; };
  };

  /* ---------- Toast / Sheet（手机壳内） ---------- */
  H.toast = function (msg, root) {
    root = root || qs('.phone') || document.body;
    var t = document.createElement('div');
    t.className = root === document.body ? 'pc-toast' : 'toast';
    t.textContent = msg; root.appendChild(t);
    setTimeout(function () { t.remove(); }, 1800);
  };
  H.sheet = function (opts) {
    var root = opts.root || qs('.phone');
    var mask = document.createElement('div');
    mask.className = 'mask show' + (opts.center ? ' center' : '');
    mask.innerHTML = '<div class="sheet">' +
      (opts.title !== false ? '<div class="sh-hd"><span>' + (opts.title || '') + '</span><span class="x">×</span></div>' : '') +
      '<div class="sh-bd">' + opts.body + '</div>' +
      (opts.footer ? '<div class="sh-ft">' + opts.footer + '</div>' : '') + '</div>';
    root.appendChild(mask);
    var close = function () { mask.remove(); };
    var x = qs('.x', mask); if (x) x.onclick = close;
    mask.addEventListener('click', function (e) { if (e.target === mask) close(); });
    if (opts.onReady) opts.onReady(mask, close);
    return { el: mask, close: close };
  };
  H.pcModal = function (opts) {
    var mask = document.createElement('div');
    mask.className = 'pc-mask show';
    mask.innerHTML = '<div class="pc-modal" style="width:' + (opts.width || 460) + 'px"><div class="mh"><span>' + opts.title + '</span><span class="x">×</span></div><div class="mb">' + opts.body + '</div>' + (opts.footer ? '<div class="mf">' + opts.footer + '</div>' : '') + '</div>';
    document.body.appendChild(mask);
    var close = function () { mask.remove(); };
    qs('.x', mask).onclick = close;
    mask.addEventListener('click', function (e) { if (e.target === mask) close(); });
    if (opts.onReady) opts.onReady(mask, close);
    return { el: mask, close: close };
  };

  /* ---------- 工具 ---------- */
  H.fmtAgo = function (iso) {
    var d = (H.now - new Date(iso)) / 60000;
    if (d < 1) return '刚刚';
    if (d < 60) return Math.floor(d) + ' 分钟前';
    if (d < 60 * 24) return Math.floor(d / 60) + ' 小时前';
    return Math.floor(d / 1440) + ' 天前';
  };
  H.fmtLeft = function (iso) {
    var d = (new Date(iso) - H.now) / 60000;
    if (d <= 0) return '已到期';
    if (d < 60) return Math.floor(d) + ' 分钟';
    if (d < 60 * 24) return Math.floor(d / 60) + ' 小时 ' + Math.floor(d % 60) + ' 分';
    return Math.floor(d / 1440) + ' 天 ' + Math.floor((d % 1440) / 60) + ' 小时';
  };
  H.leftRatio = function (post) {
    var total = new Date(post.validUntil) - new Date(post.posted);
    var left = new Date(post.validUntil) - H.now;
    return Math.max(0, Math.min(1, left / total));
  };
  H.discount = function (post) {
    if (post.price == null || post.priceUnit !== '吨') return null;
    var ref = H.refPrice(post.from, post.to[0]);
    var mid = (ref[0] + ref[1]) / 2;
    return { ref: ref, pct: Math.round((mid - post.price) / mid * 100) };
  };
  H.priceHtml = function (post, big) {
    var d = H.discount(post);
    if (post.price == null) return '<div class="n" style="font-size:' + (big ? 22 : 18) + 'px">面议</div><div class="ref">市场参考 ¥' + H.refPrice(post.from, post.to[0]).join('-') + '/吨</div>';
    var ref = d ? '<div class="ref">市场参考 <s>¥' + d.ref[0] + '-' + d.ref[1] + '</s>/吨</div>' : '<div class="ref">按车计价</div>';
    return '<div class="n">¥' + post.price + '<small>/' + post.priceUnit + '</small></div>' + ref;
  };
  H.discountTag = function (post) {
    var d = H.discount(post);
    if (!d || d.pct <= 0) return post.kind === 'idle' ? '<span class="tag hot">价格面议 · 通常低于市场</span>' : '';
    return '<span class="tag hot solid">特价 -' + d.pct + '%</span>';
  };
  H.truckSvg = function () {
    return '<svg viewBox="0 0 120 50" fill="none" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"><rect x="4" y="22" width="86" height="12" rx="1.5" fill="rgba(255,255,255,.18)"/><path d="M90 34V16h14l8 10v8h-22z" fill="rgba(255,255,255,.28)"/><path d="M92 18h10l6 8H92z" fill="rgba(255,255,255,.5)"/><circle cx="18" cy="40" r="5" fill="#222"/><circle cx="32" cy="40" r="5" fill="#222"/><circle cx="72" cy="40" r="5" fill="#222"/><circle cx="102" cy="40" r="5" fill="#222"/><path d="M14 22c0-8 6-10 14-10h30c8 0 14 2 14 10" stroke-dasharray="3 3" opacity=".7"/><rect x="26" y="12" width="18" height="10" rx="5" fill="rgba(255,255,255,.35)"/><rect x="50" y="12" width="18" height="10" rx="5" fill="rgba(255,255,255,.35)"/></svg>';
  };
  H.vehicleLine = function (v) { return v.len + ' ' + v.type + ' · 核载 ' + v.load + 't'; };
  H.equipLine = function (v, n) { return v.equip.slice(0, n || 3).join(' · ') + (v.equip.length > (n || 3) ? ' 等' : ''); };
  H.certBadges = function (drv, veh) {
    // 轻平台：只保留两枚"真人真车"标识 + 一枚悟运履约数据标，不做证件分级
    var h = '<span class="badge">实名</span>';
    h += veh.verified ? '<span class="badge">车辆认证</span>' : '<span class="badge pending">车辆待核验</span>';
    if (drv.wyOrders >= 50) h += '<span class="badge brand">悟运履约 ' + drv.wyOrders + ' 单</span>';
    return h;
  };

  /* ---------- 手机端运力卡片 ---------- */
  H.mobileCard = function (post, opts) {
    opts = opts || {};
    var v = H.VEHICLES[post.vehicle], d = H.DRIVERS[post.driver], k = H.KIND[post.kind];
    var to = post.to.join(' / ');
    return '<div class="post-card" data-id="' + post.id + '">' +
      '<div class="top"><span class="tag ' + (post.kind === 'return' ? 'hot' : post.kind === 'idle' ? 'brand' : 'ok') + '">' + k.name + '</span>' + H.discountTag(post) +
      (post.locOK ? '<span class="tag gray">定位与出发地一致</span>' : '') + '<span class="sp"></span><span class="xs muted">' + H.fmtAgo(post.posted) + '</span></div>' +
      '<div class="row between" style="align-items:flex-start">' +
        '<div class="route"><div class="city">' + post.from + '<small>' + (post.fromDetail || '').split(' · ')[0] + '</small></div><div class="arrow"><div class="ln"></div></div><div class="city to">' + to + '<small>' + (post.toDetail || '') + '</small></div></div>' +
        '<div class="price">' + H.priceHtml(post) + '</div>' +
      '</div>' +
      '<div class="time">出发 <b>' + post.depart + '</b>' + (post.kind === 'share' ? ' · 剩余可捎 <b>' + post.spareTons + 't</b>' : '') + '</div>' +
      '<div class="veh"><b>' + H.vehicleLine(v) + '</b> <span class="eq">· ' + H.equipLine(v) + '</span></div>' +
      '<div class="drv"><div class="avatar" style="width:30px;height:30px;font-size:12px">' + d.surname + '</div><div class="col"><span class="nm">' + d.name + ' <span class="st">装钢材 ' + d.steelYears + ' 年 · 好评 ' + d.good + '%</span></span><div class="badges" style="margin-top:3px">' + H.certBadges(d, v) + '</div></div><span class="sp"></span>' +
      (opts.noBtn ? '' : '<button class="btn sm" data-call="' + post.id + '">查看电话</button>') + '</div>' +
      '</div>';
  };

  /* ---------- 查看电话（三端统一的风险提示 → 号码 → 联系结果反馈） ---------- */
  H.unlockPhone = function (post, mode) {
    var d = H.DRIVERS[post.driver], v = H.VEHICLES[post.vehicle];
    var step1 = '<div class="notice red"><span class="ic"></span><div><b>货袋子只做信息展示，运费、合同、承运责任都在你和司机之间。</b>平台不收运费、不派单、不做担保。</div></div>' +
      '<ul class="list-check mt12">' +
      '<li>司机已 <b>实名 + 人脸</b>；车辆 ' + v.plate + ' ' + (v.verified ? '<b>行驶证已核验</b>' : '<span class="hot-c">车辆待核验</span>') + '（完整车牌联系后核对）</li>' +
      '<li>装车时核对 <b>人、车、证</b> 一致，提货凭证只交给核对无误的车辆</li>' +
      '<li>可用 <b>运输协议模板</b>；货值高建议投保货运险（保险公司承保，平台不收保费）</li>' +
      '<li>有问题请 <b>举报</b>，平台提供联系记录并处理该账号</li></ul>' +
      '<label class="checkline mt12"><input type="checkbox" id="agreeRisk"> 我已知悉：平台不参与交易，运输风险由我与司机自行约定与承担</label>';
    var step2 = '<div class="phone-reveal"><div class="sub">' + d.name + ' · ' + v.plate + ' · ' + H.vehicleLine(v) + '</div><div class="num">' + d.phoneFull + '</div><div class="sub">本次查看已记录，便于纠纷时追溯 · 该运力已有 <b>' + (post.calls + 1) + '</b> 位货主查看</div></div>' +
      '<div class="divider"></div><div class="small t2" style="text-align:center">联系结果反馈 <span class="xs muted">· 只在您与司机之间，不公开评分</span></div>' +
      H.fbChips('shipper');
    var footer1 = '<button class="btn ghost" data-cancel>取消</button><button class="btn' + (mode === 'pc' ? '' : '') + '" data-next disabled>查看号码</button>';
    var footer2 = mode === 'pc' ? '<button class="btn ghost" data-copy>复制号码</button><button class="btn" data-cancel>关闭</button>' : '<button class="btn ghost" data-copy>复制</button><button class="btn" data-dial>拨打电话</button>';

    var bind = function (root, close, setBody, setFooter) {
      var ck = qs('#agreeRisk', root), nx = qs('[data-next]', root);
      ck.onchange = function () { nx.disabled = !ck.checked; };
      qsa('[data-cancel]', root).forEach(function (b) { b.onclick = close; });
      nx.onclick = function () {
        setBody(step2); setFooter(footer2);
        qsa('[data-cancel]', root).forEach(function (b) { b.onclick = close; });
        var cp = qs('[data-copy]', root); if (cp) cp.onclick = function () { H.toast('号码已复制', mode === 'pc' ? document.body : null); };
        var dl = qs('[data-dial]', root); if (dl) dl.onclick = function () { H.toast('正在呼叫 ' + d.phoneFull); };
        H.bindFb(root, 'shipper', mode);
      };
    };

    if (mode === 'pc') {
      H.pcModal({ title: '联系司机前请确认', body: step1, footer: footer1, onReady: function (root, close) {
        bind(root, close, function (b) { qs('.mb', root).innerHTML = b; qs('.mh span', root).textContent = '司机联系方式'; }, function (f) { qs('.mf', root).innerHTML = f; });
      } });
    } else {
      H.sheet({ title: '联系司机前请确认', body: step1, footer: footer1, onReady: function (root, close) {
        bind(root, close, function (b) { qs('.sh-bd', root).innerHTML = b; qs('.sh-hd span', root).textContent = '司机联系方式'; }, function (f) { qs('.sh-ft', root).innerHTML = f; });
      } });
    }
  };

  /* ---------- 用车需求：匹配（只推荐，不派单） ----------
     规则透明、可解释：出发地同城/周边 → 目的地一致/方向不限/沿线可捎 → 时间 → 装备 → 车型板长 → 吨位 → 司机履约。
     命中项与缺项都返回，页面上原样展示给双方，由他们自己判断、自己打电话。 */
  H.matchPosts = function (need, posts) {
    posts = posts || H.POSTS;
    var out = [];
    posts.forEach(function (p) {
      if (p.status && p.status !== 'active') return;
      var v = H.VEHICLES[p.vehicle], d = H.DRIVERS[p.driver] || { good: 90, wyOrders: 0 };
      var s = 0, hit = [], miss = [];
      if (p.from === need.from) { s += 40; hit.push('同城出发'); }
      else if ((H.NEAR[need.from] || []).indexOf(p.from) > -1) { s += 15; hit.push('周边出发 · ' + p.from); }
      else return;
      var dest = need.to[0];
      if (p.to.some(function (t) { return t === dest || t.indexOf(dest) === 0 || dest.indexOf(t) === 0; })) { s += 30; hit.push('目的地一致'); }
      else if (p.to.indexOf('方向不限') > -1) { s += 20; hit.push('方向不限'); }
      else if ((p.toDetail || '').indexOf(dest) > -1) { s += 20; hit.push('沿线可捎 ' + dest); }
      else { s -= 40; miss.push('目的地是 ' + p.to.join('/')); }
      if (!need.day || p.depart.indexOf(need.day) > -1 || /随时|起/.test(p.depart)) { s += 15; hit.push('时间吻合'); }
      else { s -= 10; miss.push('车 ' + p.depart + ' 走'); }
      ((need.req && need.req.equip) || []).forEach(function (e) {
        if (v.equip.indexOf(e) > -1) { s += 10; hit.push('有' + e); } else { s -= 25; miss.push('无' + e); }
      });
      if (need.req && need.req.type) { if (v.type === need.req.type) s += 5; else miss.push('车型是' + v.type); }
      if (need.req && need.req.len && v.len === need.req.len) s += 5;
      if (p.spareTons >= need.cargo.tons) { s += 10; hit.push('可装 ' + p.spareTons + 't'); } else { s -= 30; miss.push('只剩 ' + p.spareTons + 't 位'); }
      s += d.good / 10 + (v.verified ? 5 : 0) + Math.min(10, d.wyOrders / 20);
      if (s < 50) return;
      out.push({ post: p, score: Math.round(s), hit: hit, miss: miss, level: miss.length ? 'part' : 'good' });
    });
    return out.sort(function (a, b) { return b.score - a.score; });
  };
  H.matchNeeds = function (post, needs) {
    needs = needs || H.NEEDS;
    var out = [];
    needs.forEach(function (n) {
      if (n.status !== 'active') return;
      var r = H.matchPosts(n, [post])[0];
      if (r) out.push({ need: n, score: r.score, hit: r.hit, miss: r.miss, level: r.level });
    });
    return out.sort(function (a, b) { return b.score - a.score; });
  };
  H.matchTags = function (m, max) {
    var h = m.hit.slice(0, max || 3).map(function (t) { return '<span class="tag ok">✓ ' + t + '</span>'; }).join('');
    h += m.miss.map(function (t) { return '<span class="tag warn">! ' + t + '</span>'; }).join('');
    return '<span class="tag ' + (m.level === 'good' ? 'brand' : 'gray') + '">' + (m.level === 'good' ? '完全匹配' : '部分匹配') + ' ' + m.score + '</span>' + h;
  };

  H.needBudgetHtml = function (need, big) {
    var ref = H.refPrice(need.from, need.to[0]);
    if (need.budget == null) return '<div class="n" style="font-size:' + (big ? 22 : 18) + 'px">电话谈</div><div class="ref" style="text-decoration:none">市场参考 ¥' + ref.join('-') + '/吨</div>';
    if (need.budgetUnit === '车') return '<div class="n">¥' + need.budget + '<small>/车</small></div><div class="ref" style="text-decoration:none">货主预算 · 可议</div>';
    return '<div class="n">¥' + need.budget + '<small>/吨</small></div><div class="ref" style="text-decoration:none">货主预算 · 市场 ¥' + ref.join('-') + '</div>';
  };
  H.cargoLine = function (need) {
    var c = need.cargo;
    return c.steel + ' <b>' + c.tons + 't</b>' + (c.pieces ? ' · ' + c.pieces : '') + (need.req.whole === false ? ' · <span class="ok-c">可拼车</span>' : ' · 整车');
  };
  H.reqLine = function (need) {
    var r = need.req, a = [];
    if (r.len) a.push(r.len); if (r.type) a.push(r.type);
    a = a.concat(r.equip || []);
    return a.length ? a.join(' · ') : '车型不限';
  };
  H.shipperBadges = function (sh) {
    var h = sh.certified ? '<span class="badge">认证企业</span>' : '<span class="badge pending">未企业认证</span>';
    h += '<span class="badge">实名</span>';
    if (sh.needs >= 5) h += '<span class="badge brand">发过 ' + sh.needs + ' 次需求 · 找到车 ' + sh.found + ' 次</span>';
    return h;
  };

  /* ---------- 联系结果反馈（结构化选项，替代互评；只在联系过的双方之间，不公开评分） ---------- */
  H.fbChips = function (side) {
    return '<div class="feedback-chips">' + H.FEEDBACK[side].map(function (f) { return '<span class="chip sm' + (f.cls === 'warn' ? ' warn' : '') + '" data-fb="' + f.k + '">' + f.t + '</span>'; }).join('') + '</div>';
  };
  H.bindFb = function (root, side, mode, onPick) {
    qsa('[data-fb]', root).forEach(function (c) {
      c.onclick = function () {
        qsa('[data-fb]', root).forEach(function (x) { x.classList.remove('on'); }); c.classList.add('on');
        var f = H.FEEDBACK[side].filter(function (x) { return x.k === c.dataset.fb; })[0];
        H.toast(f.msg, mode === 'pc' ? document.body : null);
        if (onPick) onPick(f);
      };
    });
  };

  /* ---------- 意向：司机一键"有意向"，不是报价、不是接单、不锁定 ---------- */
  H.intentsOf = function (needId) { return H.INTENTS.filter(function (i) { return i.need === needId; }); };
  H.myIntent = function (needId) { return H.INTENTS.filter(function (i) { return i.need === needId && i.driver === H.ME_DRIVER && !i.chosen; })[0]; };
  H.intentCount = function (need) { var c = H.INTENT_COUNT[need.id]; return c == null ? H.intentsOf(need.id).length : c; };
  H.intentRefHtml = function (it) {
    return it.ref == null ? '<b>价格电话谈</b>' : '<b>参考 ¥' + it.ref + '/' + it.refUnit + '</b> <span class="xs muted">以电话为准</span>';
  };
  /* 司机端弹层 */
  H.intentSheet = function (need, mode, onDone) {
    var ref = H.refPrice(need.from, need.to[0]), sh = H.SHIPPERS[need.shipper];
    var cnt = H.intentCount(need);
    var body = '<div class="notice gray"><span class="ic"></span><div><b>告诉货主"我能接这单"。</b>货主会看到您的姓氏、车牌、悟运履约和下面的参考价，决定先打给谁。这<b>不是报价、不是接单</b>，也不会锁定这条需求，您随时可以直接打电话。</div></div>' +
      '<div class="small b mt12">参考价 <span class="xs muted" style="font-weight:400">选填 · 以电话为准 · 货主看不到别人的价</span></div>' +
      '<div class="chips mt8" id="itRef"><span class="chip on" data-r="">价格电话谈</span><span class="chip" data-r="' + ref[0] + '">按市场 ¥' + ref[0] + '</span>' + (need.budget != null && need.budgetUnit === '吨' ? '<span class="chip" data-r="' + need.budget + '">按货主预算 ¥' + need.budget + '</span>' : '') + '<span class="chip" data-r="x">自己填</span></div>' +
      '<div class="input-row mt8" id="itRefRow" style="display:none"><input class="input" id="itRefN" placeholder="元" value="' + (need.budget || ref[0]) + '"><span class="unit">/' + (need.budgetUnit || '吨') + '</span></div>' +
      '<div class="small b mt12">给货主带一句 <span class="xs muted" style="font-weight:400">选填</span></div>' +
      '<div class="chips mt8" id="itNote"><span class="chip">卸完就能过去</span><span class="chip">明早能到</span><span class="chip">可以等装</span><span class="chip">有鞍座 / 篷布</span><span class="chip">可多点卸</span></div>' +
      '<div class="xs muted mt12">意向 24 小时内货主没联系自动过期 · 该需求已有 ' + cnt + ' 位司机有意向' + (cnt >= H.INTENT_CAP - 1 ? '，<span class="hot-c">名额快满</span>' : '') + ' · 货主找到车会通知您，不用干等</div>';
    var footer = '<button class="btn ghost" data-cancel>直接打电话</button><button class="btn' + (mode === 'pc' ? '' : ' wy') + '" data-ok>发送意向</button>';
    var onReady = function (root, close) {
      var refV = '';
      qsa('#itRef .chip', root).forEach(function (c) { c.onclick = function () { qsa('#itRef .chip', root).forEach(function (x) { x.classList.remove('on'); }); c.classList.add('on'); refV = c.dataset.r; qs('#itRefRow', root).style.display = refV === 'x' ? '' : 'none'; }; });
      qsa('#itNote .chip', root).forEach(function (c) { c.onclick = function () { c.classList.toggle('on'); }; });
      qs('[data-cancel]', root).onclick = function () { close(); H.unlockShipperPhone(need, mode); };
      qs('[data-ok]', root).onclick = function () {
        var r = refV === 'x' ? Number(qs('#itRefN', root).value) || null : (refV ? Number(refV) : null);
        var note = qsa('#itNote .chip.on', root).map(function (c) { return c.textContent; }).join('，');
        var it = { id: 'i' + Date.now(), need: need.id, driver: H.ME_DRIVER, vehicle: 'v1', ref: r, refUnit: need.budgetUnit || '吨', note: note, at: new Date().toISOString().slice(0, 19), called: false, mine: true };
        H.INTENTS.push(it); H.INTENT_COUNT[need.id] = cnt + 1;
        close(); H.toast('已告知货主 · 他会看到您的车牌与履约，24 小时内没联系自动过期', mode === 'pc' ? document.body : null);
        if (onDone) onDone(it);
      };
    };
    mode === 'pc' ? H.pcModal({ title: '对这条需求有意向', body: body, footer: footer, onReady: onReady }) : H.sheet({ title: '对这条需求有意向', body: body, footer: footer, onReady: onReady });
  };
  /* 货主端：有意向司机一行 */
  H.intentRow = function (it, opts) {
    opts = opts || {};
    var d = H.DRIVERS[it.driver], v = H.VEHICLES[it.vehicle];
    return '<div class="intent-row' + (it.called ? ' called' : '') + '" data-it="' + it.id + '">' +
      '<div class="avatar" style="width:32px;height:32px;font-size:12px">' + d.surname + '</div>' +
      '<div class="col" style="min-width:0;flex:1">' +
        '<div><b class="small" style="white-space:nowrap">' + d.name + ' · ' + v.plate + '</b></div>' +
        '<div class="xs muted">' + v.len + ' ' + v.type + ' · 悟运履约 ' + d.wyOrders + ' 单 · 好评 ' + d.good + '% · 投诉 ' + d.complaints + '</div>' +
        '<div class="small mt4">' + H.intentRefHtml(it) + (it.note ? ' <span class="t2">· "' + it.note + '"</span>' : '') + '</div>' +
      '</div>' +
      '<div class="col" style="align-items:flex-end;gap:4px;flex:none">' +
        '<span class="xs muted">' + H.fmtAgo(it.at) + '</span>' +
        (opts.noBtn ? '' : (it.called ? '<span class="tag ok">已打过 ' + (it.calledAt || '') + '</span>' : '<button class="btn sm' + (opts.pc ? '' : '') + '" data-call-it="' + it.id + '">先打给他</button>')) +
      '</div></div>';
  };
  /* 货主端：有意向司机列表（含名额提示） */
  H.intentList = function (need, opts) {
    var its = H.intentsOf(need.id);
    if (!its.length) return '<div class="xs muted" style="padding:6px 0">还没有司机表达意向 · 推送后司机可一键告诉您"能接"</div>';
    var cap = its.length >= H.INTENT_CAP ? '<div class="notice red mt8" style="padding:8px 10px"><span class="ic"></span><div class="xs">已有 ' + its.length + ' 位司机有意向，已暂停推送；建议尽快联系，谈定后点「已找到车」让其他司机不再等。</div></div>' : '';
    return its.map(function (it) { return H.intentRow(it, opts); }).join('') + cap;
  };
  /* 货主端：「已找到车」弹层 —— 可选勾是哪位有意向 / 联系过的司机，其余司机收到"已找到车"通知 */
  H.foundDialog = function (need, mode, onOk) {
    var its = H.intentsOf(need.id).filter(function (i) { return !i.chosen; });
    var body = '<div class="small t2">确认后需求立即隐藏，司机不会再打给您。<b>是哪位司机？</b>选填——只是让其余有意向的司机收到"已找到车"通知，不再空等；平台不据此确认成交。</div>' +
      '<div class="col mt12" style="gap:6px" id="fdWho">' + its.map(function (it) { var d = H.DRIVERS[it.driver], v = H.VEHICLES[it.vehicle]; return '<label class="checkline" style="margin:0"><input type="radio" name="fdw" value="' + it.id + '"> ' + d.name + ' · ' + v.plate + ' <span class="xs muted">· ' + (it.ref == null ? '电话谈' : '参考 ¥' + it.ref) + (it.called ? ' · 您打过' : '') + '</span></label>'; }).join('') +
      '<label class="checkline" style="margin:0"><input type="radio" name="fdw" value="other"> 不是他们（自有车 / 熟车队 / 其他渠道）</label><label class="checkline" style="margin:0"><input type="radio" name="fdw" value="" checked> 不说</label></div>' +
      (its.length ? '<div class="xs muted mt12">其余 ' + (its.length - 1) + ' 位有意向的司机将收到服务通知 D8「该需求已找到车」。</div>' : '');
    var footer = '<button class="btn ghost" data-cancel>再想想</button><button class="btn" data-ok>确认已找到车</button>';
    var onReady = function (root, close) {
      qs('[data-cancel]', root).onclick = close;
      qs('[data-ok]', root).onclick = function () {
        var pick = (qs('input[name=fdw]:checked', root) || {}).value, it = its.filter(function (x) { return x.id === pick; })[0];
        var reason = '已找到车';
        if (it) { it.chosen = true; var d = H.DRIVERS[it.driver], v = H.VEHICLES[it.vehicle]; reason += '（有意向司机 · ' + d.name + ' ' + v.plate + '）'; its.forEach(function (x) { if (x !== it) x.notified = true; }); if (its.length > 1) reason += ' · 已通知其余 ' + (its.length - 1) + ' 位司机'; }
        else if (pick === 'other') { reason += '（自有车 / 其他渠道）'; its.forEach(function (x) { x.notified = true; }); if (its.length) reason += ' · 已通知 ' + its.length + ' 位有意向司机'; }
        else if (its.length) { its.forEach(function (x) { x.notified = true; }); reason += ' · 已通知 ' + its.length + ' 位有意向司机'; }
        close(); onOk(reason, it);
      };
    };
    mode === 'pc' ? H.pcModal({ title: '找到车了？', body: body, footer: footer, onReady: onReady }) : H.sheet({ title: '找到车了？', body: body, footer: footer, onReady: onReady });
  };

  /* 手机端需求卡片（司机在悟运看到的 / 货主在小程序看到的） */
  H.needCard = function (need, opts) {
    opts = opts || {};
    var sh = H.SHIPPERS[need.shipper], mine = H.myIntent(need.id), icnt = H.intentCount(need);
    return '<div class="post-card need-card' + (mine ? ' has-intent' : '') + '" data-id="' + need.id + '">' +
      '<div class="top"><span class="tag brand">用车需求</span><span class="tag ' + (need.req.whole === false ? 'ok' : 'gray') + '">' + (need.req.whole === false ? '可拼车' : '整车') + '</span>' +
        (need.source === 'order' ? '<span class="tag gray">来自货袋子订单</span>' : '') + '<span class="sp"></span><span class="xs muted">' + H.fmtAgo(need.posted) + '</span></div>' +
      '<div class="row between" style="align-items:flex-start">' +
        '<div class="route"><div class="city">' + need.from + '<small>' + (need.fromDetail || '').split(' · ')[0] + '</small></div><div class="arrow"><div class="ln"></div></div><div class="city to">' + need.to.join(' / ') + '<small>' + (need.toDetail || '').split(' · ')[0] + '</small></div></div>' +
        '<div class="price">' + H.needBudgetHtml(need) + '</div>' +
      '</div>' +
      '<div class="time">装车 <b>' + need.when + '</b></div>' +
      '<div class="veh"><b>' + H.cargoLine(need) + '</b> <span class="eq">· 需 ' + H.reqLine(need) + '</span></div>' +
      (opts.match ? '<div class="chips mt8" style="gap:4px">' + H.matchTags(opts.match, 3) + '</div>' : '') +
      '<div class="drv"><div class="avatar" style="width:30px;height:30px;font-size:12px;background:linear-gradient(135deg,#9fb4ff,#1f5eff)">' + sh.short + '</div><div class="col" style="min-width:0"><span class="nm">' + sh.company + '</span><div class="badges" style="margin-top:3px">' + H.shipperBadges(sh) + '</div></div></div>' +
      (mine ? '<div class="intent-bar"><span>✓ 您 ' + H.fmtAgo(mine.at) + ' 表达了意向' + (mine.ref != null ? ' · 参考 ¥' + mine.ref + '/' + mine.refUnit : ' · 价格电话谈') + '</span><span class="sp"></span><span class="muted">等货主回电 · 24h 后自动过期</span></div>' : '') +
      (opts.noBtn ? '' : '<div class="nact">' + (mine ? '' : (icnt >= H.INTENT_CAP ? '<span class="tag gray full">意向已满 · 可直接打</span>' : '<button class="btn sm ghost" data-intent="' + need.id + '">有意向</button>')) + '<button class="btn sm" data-call-need="' + need.id + '">查看货主电话</button></div>') +
      '<div class="meta"><span>' + need.views + ' 位司机看过</span><span>' + icnt + ' 位有意向</span><span>' + need.calls + ' 位已联系</span>' + (icnt >= H.INTENT_CAP ? '<span class="hot-c">名额已满，可直接打</span>' : (need.calls >= 3 ? '<span class="hot-c">联系的人多，尽快打</span>' : '')) + '</div>' +
      '</div>';
  };

  /* ---------- 司机查看货主电话（与货主查看司机电话对称：风险提示 → 号码留痕 → 反馈） ---------- */
  H.unlockShipperPhone = function (need, mode) {
    var sh = H.SHIPPERS[need.shipper];
    var step1 = '<div class="notice red"><span class="ic"></span><div><b>这是货主自己发布的用车需求，运费、装卸、结算都由您和货主电话谈。</b>货袋子不派单、不确认成交、不收信息费。</div></div>' +
      '<ul class="list-check mt12">' +
      '<li>货主 ' + (sh.certified ? '<b>企业认证 + 联系人实名</b>' : '<b>手机号实名</b>，<span class="hot-c">未做企业认证</span>，建议先核实公司') + '；在货袋子发过 ' + sh.needs + ' 次需求、找到车 ' + sh.found + ' 次</li>' +
      '<li>预算是货主自填，<b>以电话沟通为准</b>；平台不定价、不抽成</li>' +
      '<li>任何要求向"平台账户"缴纳 <b>保证金 / 信息费</b> 的都是骗子，请举报</li>' +
      '<li>联系后请反馈结果；货主找到车后需求会自动隐藏</li></ul>' +
      '<label class="checkline mt12"><input type="checkbox" id="agreeRiskN"> 我已知悉：平台只展示信息，运输事宜由我与货主自行约定</label>';
    var step2 = '<div class="phone-reveal"><div class="sub">' + sh.company + ' · ' + sh.contact + ' · ' + need.from + ' → ' + need.to.join('/') + '</div><div class="num">' + sh.phoneFull + '</div><div class="sub">本次查看已记录（货主端可见"' + (mode === 'pc' ? '有司机' : '王师傅 沪D·8K3**') + ' 查看了您的电话"）· 已有 <b>' + (need.calls + 1) + '</b> 位司机联系</div></div>' +
      '<div class="divider"></div><div class="small t2" style="text-align:center">联系结果反馈 <span class="xs muted">· 只在您与货主之间，不公开评分</span></div>' +
      H.fbChips('driver');
    var footer1 = '<button class="btn ghost" data-cancel>取消</button><button class="btn' + (mode === 'pc' ? '' : ' wy') + '" data-next disabled>查看号码</button>';
    var footer2 = mode === 'pc' ? '<button class="btn ghost" data-copy>复制号码</button><button class="btn" data-cancel>关闭</button>' : '<button class="btn ghost" data-copy>复制</button><button class="btn wy" data-dial>拨打电话</button>';
    var bind = function (root, close, setBody, setFooter) {
      var ck = qs('#agreeRiskN', root), nx = qs('[data-next]', root);
      ck.onchange = function () { nx.disabled = !ck.checked; };
      qsa('[data-cancel]', root).forEach(function (b) { b.onclick = close; });
      nx.onclick = function () {
        setBody(step2); setFooter(footer2);
        qsa('[data-cancel]', root).forEach(function (b) { b.onclick = close; });
        var cp = qs('[data-copy]', root); if (cp) cp.onclick = function () { H.toast('号码已复制', mode === 'pc' ? document.body : null); };
        var dl = qs('[data-dial]', root); if (dl) dl.onclick = function () { H.toast('正在呼叫 ' + sh.phoneFull); };
        H.bindFb(root, 'driver', mode);
      };
    };
    if (mode === 'pc') {
      H.pcModal({ title: '联系货主前请确认', body: step1, footer: footer1, onReady: function (root, close) {
        bind(root, close, function (b) { qs('.mb', root).innerHTML = b; qs('.mh span', root).textContent = '货主联系方式'; }, function (f) { qs('.mf', root).innerHTML = f; });
      } });
    } else {
      H.sheet({ title: '联系货主前请确认', body: step1, footer: footer1, onReady: function (root, close) {
        bind(root, close, function (b) { qs('.sh-bd', root).innerHTML = b; qs('.sh-hd span', root).textContent = '货主联系方式'; }, function (f) { qs('.sh-ft', root).innerHTML = f; });
      } });
    }
  };

  /* ---------- 选址：我司位置 / 常用 / 最近 / 搜索 / 地图选点 ----------
     opts: { kind: 'from'|'to', city, detail, mode: 'pc'|null, onPick(addr) }
     addr: { city, detail, name, x, y, src }  src: company|book|recent|here|search|map|city */
  H.addrLabel = function (kind) { return kind === 'from' ? '提货地（车来哪装）' : '送货地'; };
  H.addrPicker = function (opts) {
    var mode = opts.mode, kind = opts.kind, cities = H.CITIES.filter(function (c) { return c !== '方向不限'; });
    var city = opts.city && cities.indexOf(opts.city) > -1 ? opts.city : '上海';
    var sel = null;  // 当前在地图上选中的点
    var me = H.MY_COMPANY;
    var body =
      '<input class="input ap-search" id="apQ" placeholder="搜仓库 / 市场 / 工地 / 路名，如「宝钢大仓」">' +
      '<div class="ap-sug" id="apSug" style="display:none"></div>' +
      '<div class="ap-picked" id="apPicked"><span class="muted">还没有选点 · 下面点一下就行</span></div>' +
      '<div class="ap-quick">' +
        '<div class="ap-me" data-pick="company"><span class="ic">司</span><div class="col" style="min-width:0"><b>' + (kind === 'to' ? '送到我司' : '在我司装货') + ' · ' + me.name + '</b><span class="xs muted">' + me.addr + ' · ' + me.hours + '</span></div><span class="tag ok">已认证</span></div>' +
        (mode === 'pc' ? '' : '<div class="ap-here" data-pick="here"><span class="ic">◎</span><div class="col"><b>当前位置</b><span class="xs muted">' + H.HERE.city + ' · ' + H.HERE.detail + '</span></div><span class="xs brand-c">使用 ›</span></div>') +
      '</div>' +
      '<div class="ap-sec"><span class="small b">常用地址</span><span class="xs muted">按使用次数</span><span class="sp"></span><span class="xs brand-c" data-manage>管理</span></div>' +
      '<div class="chips ap-book">' + H.ADDR_BOOK.filter(function (a) { return a.tag !== '最近'; }).map(function (a) { return '<span class="chip" data-book="' + a.id + '"><i class="ap-tag ' + (a.tag === '我司' ? 'my' : '') + '">' + a.tag + '</i>' + a.name + ' <small>' + a.city + '</small></span>'; }).join('') + '</div>' +
      '<div class="ap-sec mt8"><span class="small b">最近用过</span></div>' +
      '<div class="chips ap-book">' + H.ADDR_BOOK.filter(function (a) { return a.tag === '最近'; }).map(function (a) { return '<span class="chip" data-book="' + a.id + '">' + a.name + ' <small>' + a.city + ' · ' + a.when + '</small></span>'; }).join('') + '</div>' +
      '<div class="ap-sec mt12"><span class="small b">地图选点</span><span class="xs muted">点一下地图，就近吸附到仓库 / 市场，否则记为"××区附近"</span></div>' +
      '<div class="chips ap-cities" id="apCities">' + cities.map(function (c) { return '<span class="chip sm' + (c === city ? ' on' : '') + '" data-city="' + c + '">' + c + '</span>'; }).join('') + '</div>' +
      '<div class="mapbox" id="apMap"></div>';
    var footer = '<button class="btn ghost" data-cancel>取消</button><button class="btn" data-ok disabled>使用这个地址</button>';

    function renderMap(root) {
      var m = H.MAP[city] || H.MAP._, box = qs('#apMap', root);
      box.innerHTML = '<svg viewBox="0 0 100 100" preserveAspectRatio="none">' +
        '<path d="' + m.river + '" class="river"/>' + m.roads.map(function (d) { return '<path d="' + d + '" class="road"/>'; }).join('') + '</svg>' +
        m.districts.map(function (d) { return '<span class="dist" style="left:' + d.x + '%;top:' + d.y + '%">' + d.n + '</span>'; }).join('') +
        m.pois.map(function (p) { return '<span class="poi' + (p.my ? ' my' : '') + '" style="left:' + p.x + '%;top:' + p.y + '%" title="' + p.n + '"><i></i><em>' + (p.my ? '我司 · ' : '') + p.n + '</em></span>'; }).join('') +
        '<span class="pin" id="apPin" style="display:none"></span><span class="cityname">' + city + '</span>';
    }
    function setSel(root, a) {
      sel = a; var ok = qs('[data-ok]', root); ok.disabled = !a;
      var pin = qs('#apPin', root);
      if (a && a.x != null && a.city === city) { pin.style.display = ''; pin.style.left = a.x + '%'; pin.style.top = a.y + '%'; } else pin.style.display = 'none';
      qs('#apPicked', root).innerHTML = a ? '<span class="tag brand">' + ({ company: '我司位置', book: '常用地址', recent: '最近用过', here: '当前位置', search: '搜索结果', map: '地图选点', city: '仅城市' }[a.src] || '') + '</span><b>' + a.city + ' · ' + a.detail + '</b>' + (a.name && a.detail.indexOf(a.name) < 0 ? '<span class="xs muted">' + a.name + '</span>' : '') : '<span class="muted">还没有选点</span>';
    }
    function fromBook(a, src) { return { city: a.city, detail: a.detail, name: a.name, x: a.x, y: a.y, src: src || (a.tag === '最近' ? 'recent' : a.tag === '我司' ? 'company' : 'book') }; }

    var onReady = function (root, close) {
      renderMap(root);
      qs('[data-cancel]', root).onclick = close;
      qs('[data-ok]', root).onclick = function () { if (!sel) return; close(); opts.onPick(sel); };
      qs('[data-pick=company]', root).onclick = function () { city = me.city; renderMap(root); markCity(root); setSel(root, { city: me.city, detail: me.detail, name: me.name, x: me.x, y: me.y, src: 'company' }); };
      var here = qs('[data-pick=here]', root); if (here) here.onclick = function () { city = H.HERE.city; renderMap(root); markCity(root); setSel(root, { city: H.HERE.city, detail: H.HERE.detail, name: '当前位置', x: H.HERE.x, y: H.HERE.y, src: 'here' }); };
      qsa('[data-book]', root).forEach(function (c) { c.onclick = function () { var a = H.ADDR_BOOK.filter(function (x) { return x.id === c.dataset.book; })[0]; city = a.city; renderMap(root); markCity(root); setSel(root, fromBook(a)); }; });
      var mg = qs('[data-manage]', root); if (mg) mg.onclick = function () { H.toast('原型：地址簿管理（新增 / 编辑 / 设为默认收货地）', mode === 'pc' ? document.body : null); };
      function markCity(root) { qsa('#apCities .chip', root).forEach(function (x) { x.classList.toggle('on', x.dataset.city === city); }); }
      qsa('#apCities .chip', root).forEach(function (c) { c.onclick = function () { city = c.dataset.city; markCity(root); renderMap(root); setSel(root, { city: city, detail: '', name: '', src: 'city' }); }; });
      /* 地图点击：吸附 POI，否则最近区县 */
      qs('#apMap', root).onclick = function (e) {
        var r = this.getBoundingClientRect(), x = Math.round((e.clientX - r.left) / r.width * 100), y = Math.round((e.clientY - r.top) / r.height * 100);
        var m = H.MAP[city] || H.MAP._, best = null, bd = 1e9;
        m.pois.forEach(function (p) { var d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = p; } });
        if (best && bd <= 7) return setSel(root, { city: city, detail: best.d + ' · ' + best.n, name: best.n, x: best.x, y: best.y, src: best.my ? 'company' : 'map' });
        var dist = null, dd = 1e9; m.districts.forEach(function (d) { var v = Math.hypot(d.x - x, d.y - y); if (v < dd) { dd = v; dist = d; } });
        setSel(root, { city: city, detail: dist.n + ' · 地图选点（' + (x < 50 ? '西' : '东') + (y < 50 ? '北' : '南') + '部，联系时报具体路名）', name: '', x: x, y: y, src: 'map' });
      };
      /* 搜索：地址簿 + 全部城市 POI */
      var q = qs('#apQ', root), sug = qs('#apSug', root);
      q.oninput = function () {
        var t = q.value.trim(); if (!t) { sug.style.display = 'none'; return; }
        var out = [];
        H.ADDR_BOOK.forEach(function (a) { if ((a.name + a.detail + a.city).indexOf(t) > -1) out.push(fromBook(a)); });
        Object.keys(H.MAP).forEach(function (c) { if (c === '_') return; H.MAP[c].pois.forEach(function (p) { if ((p.n + p.d + c).indexOf(t) > -1 && !out.some(function (o) { return o.name === p.n; })) out.push({ city: c, detail: p.d + ' · ' + p.n, name: p.n, x: p.x, y: p.y, src: 'search' }); }); });
        cities.forEach(function (c) { if (c.indexOf(t) > -1 && !out.some(function (o) { return o.city === c && !o.name; })) out.push({ city: c, detail: '', name: '', src: 'city' }); });
        sug.style.display = ''; sug.innerHTML = out.length ? out.slice(0, 6).map(function (o, i) { return '<div class="ap-s" data-i="' + i + '"><b>' + (o.name || o.city) + '</b><span class="xs muted">' + o.city + (o.detail ? ' · ' + o.detail : ' · 仅城市，具体地址电话说') + '</span></div>'; }).join('') : '<div class="ap-s muted">没找到，可以直接在下方地图上点，或只选城市</div>';
        qsa('.ap-s[data-i]', sug).forEach(function (s) { s.onclick = function () { var o = out[+s.dataset.i]; city = o.city; markCity(root); renderMap(root); setSel(root, o); sug.style.display = 'none'; q.value = o.name || o.city; }; });
      };
      if (opts.detail) setSel(root, { city: city, detail: opts.detail, name: '', src: 'city' });
    };
    var title = H.addrLabel(kind);
    mode === 'pc' ? H.pcModal({ title: title, width: 640, body: body, footer: footer, onReady: onReady }) : H.sheet({ title: title, body: body, footer: footer, onReady: onReady });
  };
  /* 字段旁的快捷 chips：我司位置 / 前两个常用 / 地图选点 */
  H.addrQuick = function (kind, mode) {
    var me = H.MY_COMPANY, book = H.ADDR_BOOK.filter(function (a) { return a.tag === '常用'; }).slice(0, 2);
    return '<div class="chips addr-quick" data-kind="' + kind + '">' +
      '<span class="chip sm my" data-aq="company">司 ' + (kind === 'to' ? '送到我司' : '在我司装') + '</span>' +
      (mode === 'pc' ? '' : '<span class="chip sm" data-aq="here">◎ 当前位置</span>') +
      book.map(function (a) { return '<span class="chip sm" data-aq="book" data-id="' + a.id + '">' + a.name + '</span>'; }).join('') +
      '<span class="chip sm" data-aq="map">▣ 地图选点 / 更多</span></div>';
  };
  H.bindAddrQuick = function (root, apply, mode) {
    root.addEventListener('click', function (e) {
      var c = e.target.closest('[data-aq]'); if (!c) return;
      var kind = c.closest('.addr-quick').dataset.kind, me = H.MY_COMPANY;
      if (c.dataset.aq === 'company') apply(kind, { city: me.city, detail: me.detail, name: me.name, x: me.x, y: me.y, src: 'company' });
      else if (c.dataset.aq === 'here') apply(kind, { city: H.HERE.city, detail: H.HERE.detail, name: '当前位置', x: H.HERE.x, y: H.HERE.y, src: 'here' });
      else if (c.dataset.aq === 'book') { var a = H.ADDR_BOOK.filter(function (x) { return x.id === c.dataset.id; })[0]; apply(kind, { city: a.city, detail: a.detail, name: a.name, x: a.x, y: a.y, src: 'book' }); }
      else H.addrPicker({ kind: kind, mode: mode, onPick: function (a) { apply(kind, a); } });
    });
  };
  H.addrSrcTag = function (src) {
    var t = { company: '我司位置', book: '常用地址', recent: '最近用过', here: '当前位置', search: '已定位', map: '地图选点', order: '订单地址' }[src];
    return t ? '<span class="tag ' + (src === 'company' ? 'ok' : 'gray') + '" style="height:18px;font-size:10px">📍 ' + t + '</span>' : '';
  };

  /* ---------- 举报 ---------- */
  H.report = function (post, mode) {
    var body = '<div class="small t2 mb8">请选择举报原因，平台将在 2 小时内核实处理：</div><div class="chips">' +
      ['信息不实/车不存在', '车已接单仍在展示', '电话打不通', '联系后坐地起价', '冒充司机的信息部/黄牛', '证件与人车不一致', '其他'].map(function (r) { return '<span class="chip sm" data-r>' + r + '</span>'; }).join('') +
      '</div><textarea class="input mt12" placeholder="补充说明（选填，可附截图）"></textarea>';
    var footer = '<button class="btn ghost" data-cancel>取消</button><button class="btn hot" data-ok>提交举报</button>';
    var onReady = function (root, close) {
      qsa('[data-r]', root).forEach(function (c) { c.onclick = function () { qsa('[data-r]', root).forEach(function (x) { x.classList.remove('on'); }); c.classList.add('on'); }; });
      qs('[data-cancel]', root).onclick = close;
      qs('[data-ok]', root).onclick = function () { close(); H.toast('举报已提交，核实期间该信息将标记「核实中」', mode === 'pc' ? document.body : null); };
    };
    mode === 'pc' ? H.pcModal({ title: '举报该运力信息', body: body, footer: footer, onReady: onReady }) : H.sheet({ title: '举报该运力信息', body: body, footer: footer, onReady: onReady });
  };

  /* ---------- 壳切换（小程序 / H5） ---------- */
  H.initShell = function () {
    var shell = H.param('shell', 'mp');
    qsa('.phone').forEach(function (p) { p.dataset.shell = shell; });
    qsa('[data-shell-switch]').forEach(function (b) {
      b.classList.toggle('on', b.dataset.shellSwitch === shell);
      b.onclick = function () { var u = new URL(location.href); u.searchParams.set('shell', b.dataset.shellSwitch); location.href = u.toString(); };
    });
    return shell;
  };
})();
