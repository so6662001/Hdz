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
      '<div class="divider"></div><div class="small t2" style="text-align:center">联系后请反馈结果，帮助信息保持真实</div>' +
      '<div class="feedback-chips"><span class="chip sm" data-fb="deal">已谈成</span><span class="chip sm" data-fb="talk">在沟通</span><span class="chip sm" data-fb="noanswer">未接通</span><span class="chip sm" data-fb="gone">车已被订走</span><span class="chip sm" data-fb="fake">信息不实</span></div>';
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
        qsa('[data-fb]', root).forEach(function (c) {
          c.onclick = function () {
            qsa('[data-fb]', root).forEach(function (x) { x.classList.remove('on'); }); c.classList.add('on');
            var m = { deal: '感谢反馈！祝顺利。平台不参与交易，请签订协议并投保。', talk: '已记录', noanswer: '已记录，3 位以上货主反馈未接通将提醒司机确认', gone: '已记录，我们将提醒司机更新状态；多人反馈后自动隐藏', fake: '已提交核实，核实后将下架并处理该账号，感谢！' }[c.dataset.fb];
            H.toast(m, mode === 'pc' ? document.body : null);
          };
        });
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

  /* 手机端需求卡片（司机在悟运看到的 / 货主在小程序看到的） */
  H.needCard = function (need, opts) {
    opts = opts || {};
    var sh = H.SHIPPERS[need.shipper];
    return '<div class="post-card need-card" data-id="' + need.id + '">' +
      '<div class="top"><span class="tag brand">用车需求</span><span class="tag ' + (need.req.whole === false ? 'ok' : 'gray') + '">' + (need.req.whole === false ? '可拼车' : '整车') + '</span>' +
        (need.source === 'order' ? '<span class="tag gray">来自货袋子订单</span>' : '') + '<span class="sp"></span><span class="xs muted">' + H.fmtAgo(need.posted) + '</span></div>' +
      '<div class="row between" style="align-items:flex-start">' +
        '<div class="route"><div class="city">' + need.from + '<small>' + (need.fromDetail || '').split(' · ')[0] + '</small></div><div class="arrow"><div class="ln"></div></div><div class="city to">' + need.to.join(' / ') + '<small>' + (need.toDetail || '').split(' · ')[0] + '</small></div></div>' +
        '<div class="price">' + H.needBudgetHtml(need) + '</div>' +
      '</div>' +
      '<div class="time">装车 <b>' + need.when + '</b></div>' +
      '<div class="veh"><b>' + H.cargoLine(need) + '</b> <span class="eq">· 需 ' + H.reqLine(need) + '</span></div>' +
      (opts.match ? '<div class="chips mt8" style="gap:4px">' + H.matchTags(opts.match, 3) + '</div>' : '') +
      '<div class="drv"><div class="avatar" style="width:30px;height:30px;font-size:12px;background:linear-gradient(135deg,#9fb4ff,#1f5eff)">' + sh.short + '</div><div class="col"><span class="nm">' + sh.company + '</span><div class="badges" style="margin-top:3px">' + H.shipperBadges(sh) + '</div></div><span class="sp"></span>' +
        (opts.noBtn ? '' : '<button class="btn sm" data-call-need="' + need.id + '">查看货主电话</button>') + '</div>' +
      '<div class="meta"><span>' + need.views + ' 位司机看过</span><span>' + need.calls + ' 位司机已联系</span>' + (need.calls >= 3 ? '<span class="hot-c">联系的人多，尽快打</span>' : '') + '</div>' +
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
      '<div class="divider"></div><div class="small t2" style="text-align:center">联系后请反馈，帮需求保持真实</div>' +
      '<div class="feedback-chips"><span class="chip sm" data-fb="deal">已谈成</span><span class="chip sm" data-fb="talk">在沟通</span><span class="chip sm" data-fb="noanswer">未接通</span><span class="chip sm" data-fb="found">货主已找到车</span><span class="chip sm" data-fb="fake">信息不实</span></div>';
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
        qsa('[data-fb]', root).forEach(function (c) {
          c.onclick = function () {
            qsa('[data-fb]', root).forEach(function (x) { x.classList.remove('on'); }); c.classList.add('on');
            var m = { deal: '祝顺利！运费、装卸请与货主电话说清并留好凭证。平台不参与结算。', talk: '已记录', noanswer: '已记录，多位司机反馈未接通将提醒货主确认', found: '已记录，将提醒货主标记「已找到车」；2 位以上司机反馈后自动隐藏', fake: '已提交核实，属实将下架并处理该账号，感谢！' }[c.dataset.fb];
            H.toast(m, mode === 'pc' ? document.body : null);
          };
        });
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
