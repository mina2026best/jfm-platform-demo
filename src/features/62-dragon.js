/* ---------- v0.96 七龙珠系办学图谱（schools 页） ----------
   数据：61-dragon-data.js（research/jfm_merge_dragon.py 生成）。
   口径：关系类型以区教委文件/校方官网/主流媒体为准；存疑实体标注 ⚠；不排名、不评价。 */
var DRAGON_RT = { '直属本部': 'ok', '分校区': 'ok', '高完中': 'ok', '共办·托管': 'br', '共办·托管校': 'br', '教共体成员': 'pend', '民转公': 'br', '民转公校': 'br' };
function dgShortType(rt){
  var keys = ['直属本部', '分校区', '教共体成员', '共办·托管', '共办', '托管', '民转公', '高完中'];
  for(var i = 0; i < keys.length; i++){ if(rt.indexOf(keys[i]) >= 0) return keys[i]; }
  return '存疑';
}
function dgRender(){
  var box = document.getElementById('dragon-graph');
  if(!box || typeof DRAGON === 'undefined') return;
  var tabs = DRAGON.systems.map(function(s, i){
    return '<button class="ff' + (i === 0 ? ' on' : '') + '" data-dgs="' + i + '">' + esc(s.name) + '（' + s.entities.length + '）</button>';
  }).join('');
  box.innerHTML = '<div class="cmp-note" style="margin-bottom:12px"><b>怎么读图谱</b>　七龙珠各校系旗下实体类型多样：<b>直属本部/分校区</b>通常同一法人、师资统一调配；<b>共办·托管校</b>品牌合作、管理相对独立；<b>教共体成员</b>为教学共同体协作；<b>民转公校</b>原民办转公办。⚠ 标注＝关系存疑，以区教委当年公布为准。只整理事实关系，不做校际评价；凡称「交钱进本部名额」均为诈骗。</div>'
    + '<div class="fact-filter" style="margin-bottom:10px" id="dg-tabs">' + tabs + '</div>'
    + '<div id="dg-panel"></div>'
    + '<p class="dx-tnote" style="margin-top:8px">数据核验 2026-10-31：关系类型逐实体标注来源（区教委文件/校方官网/主流媒体）；单源线索已标存疑。每年招生季复核一次。</p>';
  function show(i){
    var sys = DRAGON.systems[i];
    var html = sys.entities.map(function(e){
      var f = e.fields;
      var rt = (f['关系类型'] || '—');
      var short = dgShortType(rt);
      var badge = 'pend';
      for(var k in DRAGON_RT){ if(short.indexOf(k) >= 0){ badge = DRAGON_RT[k]; break; } }
      function row(l, k){ var v = f[k]; return v ? '<div class="dg-row"><i>' + l + '</i>' + esc(String(v)).slice(0, 120) + '</div>' : ''; }
      var src = (e.srcs || []).slice(0, 2).map(function(x){
        if (typeof x === 'string') { var m2 = x.match(/https?:\/\/[^\s）)，;；]+/); return m2 ? '<a class="art-link" href="' + m2[0] + '" target="_blank" rel="noopener">原文 ↗</a>' : esc(x.slice(0, 40)); }
        if (!x || !x.u) return esc((x && x.t) || '');
        return '<a class="art-link" href="' + x.u + '" target="_blank" rel="noopener">' + esc(x.t || '原文') + ' ↗</a>';
      }).filter(Boolean).join(' · ');
      return '<article class="dg-card"><div class="dg-head"><b>' + esc(e.name) + '</b>'
        + '<span class="pq-st st-' + badge + '">' + esc(short) + (e.doubt ? ' ⚠' : '') + '</span></div>' + (function(){ var base = e.name.split('（')[0]; var hit = typeof SCHOOL_DB !== 'undefined' && Object.keys(SCHOOL_DB).find(function(k){ return k.split('（')[0] === base; }); return hit ? ' <a class="art-link" href="schools.html?school=' + encodeURIComponent(hit) + '">档案 ↗</a>' : ''; })()
        + '<div class="dg-meta">' + esc(f['区县'] || '—') + ' · ' + esc(f['学段'] || '—') + '</div>'
        + '<div class="dg-row"><i>关系</i>' + esc(rt) + '</div>'
        + row('师资', '师资关系') + row('管理', '管理关系') + row('招生', '招生方式') + row('学费', '学费口径')
        + (src ? '<div class="dg-src">' + src + '</div>' : '')
        + '</article>';
    }).join('');
    document.getElementById('dg-panel').innerHTML = '<div class="dg-grid">' + html + '</div>';
  }
  var tabsBox = document.getElementById('dg-tabs');
  tabsBox.addEventListener('click', function(ev){
    var b = ev.target.closest('button[data-dgs]');
    if(!b) return;
    tabsBox.querySelectorAll('.ff').forEach(function(x){ x.classList.remove('on'); });
    b.classList.add('on');
    show(parseInt(b.dataset.dgs, 10));
  });
  show(0);
}
