/* ---------- 八卦社：自媒体升学观点索引（v1.0） ----------
   定位：基于抖音/小红书公开内容的观点索引摘要，非官方政策。
   规则：一票否决词命中不入库；免责段落每条强制；每日去重（id + author+title指纹）。 */
var BAGUA_STAGES = ['小升初', '初升高', '新高考'];
var baguaFilter = 'all';
var baguaShown = 8;

function baguaDB(){
  var db = (typeof window.BAGUA_DATA !== 'undefined') ? window.BAGUA_DATA : null;
  if (db && db.items && db.items.length) return db;
  return { items: [], weekly: null, disclaimer_short: '自媒体观点索引，非官方政策，不构成填报建议' };
}

function setBaguaFilter(st){
  baguaFilter = st || 'all';
  baguaShown = 8;
  renderBagua();
}

function moreBagua(){
  baguaShown += 8;
  renderBagua();
}

/* 风险徽章 */
function baguaRiskBadge(rl){
  if (rl === '正常') return '<span class="bg-risk ok">正常</span>';
  if (rl === '待人工复核') return '<span class="bg-risk warn">待人工复核</span>';
  return '';
}

/* 平台徽章 */
function baguaPlatformBadge(p){
  var cls = p === '抖音' ? 'dy' : (p === '小红书' ? 'xhs' : 'web');
  return '<span class="bg-plat ' + cls + '">' + esc(p || '公开渠道') + '</span>';
}

/* 单条卡片：封面图 + 徽章行 + 摘要 + 标签 + 免责 + 原帖链接 */
function baguaCardHTML(x, i){
  var stages = (x.stage && BAGUA_STAGES.indexOf(x.stage) >= 0)
    ? '<span class="stage-tag">' + esc(x.stage) + '</span>' : '';
  var tags = (x.tags || []).map(function(t){ return '<span class="bg-tag">#' + esc(t) + '</span>'; }).join('');
  var link = x.original_url
    ? '<a class="bg-src" href="' + esc(x.original_url) + '" target="_blank" rel="noopener nofollow">原帖 ↗</a>'
    : '<span class="bg-src muted">无公开链接</span>';
  var reviewTip = x.reviewed === false
    ? '<span class="bg-review-tip">该条为机器初筛结果，正在等待人工终审；展示内容不构成任何建议</span>' : '';
  return '<div class="bg-card" data-bgkey="' + esc(x.id || ('g' + i)) + '">'
    + '<div class="bg-card-head">'
    +   baguaPlatformBadge(x.source_platform)
    +   stages
    +   baguaRiskBadge(x.risk_level)
    +   '<span class="bg-author">' + esc(x.author_name || '佚名博主') + '</span>'
    +   '<span class="bg-date">' + esc((x.publish_time || '').slice(0, 10)) + '</span>'
    + '</div>'
    + '<p class="bg-sum">' + esc(x.ai_summary || '') + '</p>'
    + (x.risk_note ? '<p class="bg-riskenote">风控备注：' + esc(x.risk_note) + '</p>' : '')
    + '<div class="bg-tags">' + tags + '</div>'
    + reviewTip
    + '<div class="bg-card-foot">'
    +   '<span class="bg-disc">自媒体个人观点，非官方政策，不作为填报依据</span>'
    +   link
    + '</div></div>';
}

/* 主渲染：横幅 + 筛选 + 空状态 + 卡片流 */
function renderBagua(){
  var box = document.getElementById('bagua-list');
  if (!box) return;
  var db = baguaDB();
  var items = db.items || [];
  /* 只展示 正常(rev ok) + 待人工复核；高风险一律不入库（采集端保证，这里双保险） */
  items = items.filter(function(x){ return x.risk_level === '正常' || x.risk_level === '待人工复核'; });
  if (baguaFilter !== 'all') items = items.filter(function(x){ return x.stage === baguaFilter; });
  items.sort(function(a, b){ return String(b.publish_time || '').localeCompare(String(a.publish_time || '')); });

  /* 计数徽章 */
  var all = (db.items || []).filter(function(x){ return x.risk_level === '正常' || x.risk_level === '待人工复核'; });
  document.querySelectorAll('#bagua-filter .ff').forEach(function(b){
    var st = b.getAttribute('data-bg');
    var n = st === 'all' ? all.length : all.filter(function(x){ return x.stage === st; }).length;
    b.textContent = b.getAttribute('data-label') + (n ? ' ' + n : '');
  });

  var shown = items.slice(0, baguaShown);
  box.innerHTML = shown.length
    ? shown.map(baguaCardHTML).join('')
    : '<div class="bg-empty">近期暂无通过风控的博主观点摘要。八卦社每日自动整理，高风险与营销内容一律不收录；正式升学信息请看上方编辑部精选与政策库。</div>';

  var more = document.getElementById('bagua-more');
  if (more) {
    if (items.length > baguaShown) {
      more.hidden = false;
      more.innerHTML = '<button class="mini-btn" onclick="moreBagua()">加载更多（还有 ' + (items.length - baguaShown) + ' 条）</button>';
    } else { more.hidden = true; }
  }

  var meta = document.getElementById('bagua-meta');
  if (meta) {
    var pend = all.filter(function(x){ return x.reviewed === false; }).length;
    meta.textContent = '已收录 ' + all.length + ' 条（待人工终审 ' + pend + ' 条）· 每日自动整理去重 · 高风险内容一票否决不入库';
  }

  renderBaguaTrend(db);
}

/* 话题热度条：纯 CSS 条形图（每周随管线更新） */
function renderBaguaTrend(db){
  var box = document.getElementById('bagua-trend');
  if (!box) return;
  var wk = db.weekly;
  if (!wk || !wk.topics || !wk.topics.length) { box.innerHTML = ''; return; }
  var max = Math.max.apply(null, wk.topics.map(function(t){ return t.count || 0; }).concat([1]));
  var bars = wk.topics.slice(0, 6).map(function(t){
    var pct = Math.round((t.count || 0) / max * 100);
    return '<div class="bg-trend-row"><span class="bg-trend-tag">#' + esc(t.tag) + '</span>'
      + '<div class="bg-trend-bar"><i style="width:' + pct + '%"></i></div>'
      + '<span class="bg-trend-n">' + t.count + ' 条 · ' + esc(t.trend || '平') + '</span></div>';
  }).join('');
  box.innerHTML = '<div class="bg-trend-head">近 30 天话题热度 <span class="bg-trend-gen">' + esc(wk.generated || '') + ' 更新</span></div>' + bars
    + '<p class="bg-trend-note">' + esc(wk.note || '') + '</p>';
}

/* 初始渲染：页面加载后若八卦社板块在当前页则立即渲染（含「全部」计数徽章） */
(function(){
  function boot(){ if (document.getElementById('bagua-list')) renderBagua(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
