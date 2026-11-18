/* ---------- v1.13：区县专题页渲染（QU_PAGE 由页面壳注入；数据=QU_GUIDE/PQ_ROWS/SCHOOL_DB/newsCombined 全站真实数据） ---------- */
function renderQuPage(){
  var qu = window.QU_PAGE; if(!qu) return;
  var base = qu.replace(/新区$/, '');

  /* ① 官方入口 */
  var qe = document.getElementById('qu-entry');
  if(qe && typeof QU_GUIDE !== 'undefined'){
    var g = QU_GUIDE.find(function(x){ return x.qu === qu; }) || QU_GUIDE.find(function(x){ return x.qu.indexOf(base) >= 0; });
    qe.innerHTML = g
      ? '<p><b>' + esc(g.org) + '</b></p><p><a class="art-link" href="' + esc(g.url) + '" target="_blank" rel="noopener">' + esc(g.url) + ' ↗</a></p>' + (g.note ? '<p class="dx-tnote">' + esc(g.note) + '</p>' : '')
      : '<div class="empty-mini">暂未收录该区官方入口（未核验不入库）。</div>';
  }

  /* ② 划片直链 */
  var pqb = document.getElementById('qu-pq');
  if(pqb && typeof PQ_ROWS !== 'undefined'){
    var rows = PQ_ROWS.filter(function(r){ return r.q.indexOf(qu) >= 0 || r.q.indexOf(base) >= 0; });
    if(!rows.length){
      pqb.innerHTML = '<div class="empty-mini">本区划片直链暂未收录——<a href="schools-guide.html#sec-pq">划片总表</a>或区教委官网检索。</div>';
    } else {
      pqb.innerHTML = rows.map(function(r){
        var links = [];
        if(r.y26) links.push('<a href="' + esc(r.y26.u) + '" target="_blank" rel="noopener">2026 · ' + esc(r.y26.t) + ' ↗</a>');
        if(r.y25) links.push('<a href="' + esc(r.y25.u) + '" target="_blank" rel="noopener">2025 · ' + esc(r.y25.t) + ' ↗</a>');
        return '<div class="kx-row"><b>' + esc(r.q) + '</b><span>' + links.join(' · ') + '</span></div>';
      }).join('') + '<p class="dx-tnote">链接逐条当日抓取验证（HTTP 200）。</p>';
    }
  }

  /* ③ 本区学校档案 */
  var grid = document.getElementById('qu-school-grid');
  var tools = document.getElementById('qu-school-tools');
  if(grid && typeof SCHOOL_DB !== 'undefined'){
    var keys = Object.keys(SCHOOL_DB).filter(function(k){
      var d = SCHOOL_DB[k];
      var q = d['所在区'] || '';
      return q.indexOf(qu) >= 0 || q.indexOf(base) >= 0;
    });
    window._qu_keys = keys;
    var stageOf = function(k){
      var m = (typeof SCHOOL_STAGE_MAP !== 'undefined') && SCHOOL_STAGE_MAP[k];
      if(!m) return '其他';
      if(m.tag === '完中') return '完中（含初高中）';
      return m.stage;
    };
    var stCount = {};
    keys.forEach(function(k){ var st = stageOf(k); stCount[st] = (stCount[st] || 0) + 1; });
    if(tools){
      var chipHtml = '<button class="ff on" data-qs="">全部（' + keys.length + '）</button>';
      ['小学','初中','高中','完中（含初高中）'].forEach(function(st){
        if(stCount[st]) chipHtml += '<button class="ff" data-qs="' + st + '">' + st + '（' + stCount[st] + '）</button>';
      });
      chipHtml += '<span class="dx-flab" style="margin-left:10px">学段核对稿逐校标注 · 未标注学校在「全部」可见</span>';
      tools.innerHTML = chipHtml;
      tools.onclick = function(ev){
        var b = ev.target.closest('button[data-qs]');
        if(!b) return;
        tools.querySelectorAll('.ff').forEach(function(x){ x.classList.toggle('on', x === b); });
        paintQuSchools(b.getAttribute('data-qs'));
      };
    }
    paintQuSchools('');
  }

  function paintQuSchools(stageFilter){
    var grid2 = document.getElementById('qu-school-grid'); if(!grid2) return;
    var keys2 = (window._qu_keys || []);
    var shown = stageFilter ? keys2.filter(function(k){ return stageOf(k) === stageFilter; }) : keys2;
    grid2.innerHTML = shown.map(stageCardHTML).join('');
    if(typeof schFavRestore === 'function') schFavRestore();
    if(typeof schCmpRestore === 'function') schCmpRestore();
  }

  /* ④ 本区招考快讯 */
  var nb = document.getElementById('qu-news');
  if(nb && typeof newsCombined === 'function'){
    var items = newsCombined().filter(function(x){
      var hay = (x.t || '') + ' ' + (x.sum || '') + ' ' + (x.src || '');
      return hay.indexOf(qu) >= 0 || hay.indexOf(base) >= 0;
    }).sort(function(a, b){ return (b.date || '').localeCompare(a.date || ''); }).slice(0, 4);
    nb.innerHTML = items.length
      ? items.map(function(x){
          return '<div class="kx-row"><a href="news.html?s=' + encodeURIComponent((x.t || '').slice(0, 12)) + '">' + esc(x.t) + '</a><span class="kx-meta">' + esc(x.src || '') + ' · ' + esc(x.date || '') + '</span></div>';
        }).join('')
      : '<div class="empty-mini">本区专属快讯暂无——全站资讯见资讯中心。</div>';
  }
}
