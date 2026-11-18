/* ---------- v1.12：专业库页（对标掌上高考 /special；数据=516 条真实在渝招生专业条目反查） ---------- */
var ZYM = { all: [], view: [] };
function zymInit(){
  if(typeof DAXUE === 'undefined') return;
  var freq = {};
  DAXUE.schools.forEach(function(sc){ (sc.majors || []).forEach(function(m){ if(m) (freq[m] = freq[m] || []).push(sc); }); });
  ZYM.all = Object.keys(freq).map(function(m){
    var schools = freq[m];
    function latest(s, cat){
      var L = (s.L && s.L[cat]) || {};
      var ys = ['2026','2025','2024','2023','2022'];
      for(var i=0;i<ys.length;i++){ var r = L[ys[i]]; if(r) return r[0]; }
      return null;
    }
    var wl = schools.map(function(s){ return latest(s, 'wl'); }).filter(function(x){ return x; });
    var wlmin = wl.length ? Math.min.apply(null, wl) : null;
    var wlmax = wl.length ? Math.max.apply(null, wl) : null;
    var top3 = schools.slice().sort(function(a, b){ return (latest(b, 'wl') || 0) - (latest(a, 'wl') || 0); }).slice(0, 3);
    return { m: m, n: schools.length, top: top3, wmin: wlmin, wmax: wlmax };
  });
  ZYM.all.sort(function(a, b){ return b.n - a.n || a.m.localeCompare(b.m, 'zh'); });
  var letters = {};
  ZYM.all.forEach(function(x){
    var L = x.m.charAt(0).toUpperCase();
    if(/[A-Z]/.test(L)) letters[L] = 1;
  });
  var sel = document.getElementById('zym-letter');
  if(sel){
    sel.innerHTML = '<option value="">全部</option>' + Object.keys(letters).sort().map(function(L){
      return '<option value="' + L + '">' + L + '</option>';
    }).join('');
  }
  zymRender();
}
function zymRender(){
  var q = (document.getElementById('zym-q') || {}).value || '';
  var Lsel = (document.getElementById('zym-letter') || {}).value || '';
  q = q.trim().toLowerCase();
  ZYM.view = ZYM.all.filter(function(x){
    if(Lsel && x.m.charAt(0).toUpperCase() !== Lsel) return false;
    if(q && x.m.toLowerCase().indexOf(q) < 0) return false;
    return true;
  });
  var cnt = document.getElementById('zym-count');
  if(cnt) cnt.textContent = '命中 ' + ZYM.view.length + ' / ' + ZYM.all.length + ' 个专业（按开设校数排序）';
  var grid = document.getElementById('zym-grid'); if(!grid) return;
  grid.innerHTML = ZYM.view.slice(0, 60).map(function(x){
    var wl = (x.wmin !== null) ? ' 最新投档 ' + x.wmin + '–' + x.wmax : '';
    return '<article class="school-card"><div class="sc-top"><span class="sc-badge">' + x.n + ' 校开设</span><span class="sc-qu">' + esc(x.m.charAt(0)) + '</span></div>'
      + '<h4>' + esc(x.m) + '</h4>'
      + '<p>' + esc('代表校：' + x.top.map(function(s){ return s.name; }).join('、')) + '</p>'
      + '<p class="mono" style="font-size:12px;color:var(--muted)">' + wl + '</p>'
      + '<div class="sc-actions"><button class="mini-btn" onclick="zymOpen(\'' + esc(x.m) + '\')">查看开设院校 →</button></div></article>';
  }).join('') + (ZYM.view.length > 60 ? '<div class="cmp-empty">仅显示前 60 个——请用搜索或字母索引缩小范围。</div>' : '');
}
function zymOpen(m){
  var target = 'daxue.html#dxm';
  if(typeof DAXUE !== 'undefined'){
    try{
      sessionStorage.setItem('dxm_prefill', m);
    }catch(e){}
  }
  location.href = target;
}

(function(){
  function boot(){
    if(document.getElementById('zym-grid') && typeof DAXUE !== 'undefined'){ zymInit(); }
  }
  if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', boot); }
  else { boot(); }
})();
