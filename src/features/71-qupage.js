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
    if(tools){
      var qus = [];
      keys.forEach(function(k){ var q = SCHOOL_DB[k]['所在区'] || ''; if(qus.indexOf(q) < 0) qus.push(q); });
      tools.innerHTML = '<span class="dx-flab">收录</span><span class="cmp-note">' + keys.length + ' 所（学段见卡上徽标；区划调整前的原口径校保留原「所在区」并附区划说明）</span>';
    }
    grid.innerHTML = keys.map(stageCardHTML).join('');
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
