/* ---------- v0.16：返回顶部 / 阅读进度条 ---------- */
function initPageUI(){
  var btn = document.getElementById('toTop');
  var bar = document.getElementById('readBar');
  function onScroll(){
    var doc = document.documentElement;
    var y = window.scrollY || doc.scrollTop || 0;
    if(btn) btn.classList.toggle('show', y > 600);
    if(bar){
      var max = doc.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(100, Math.max(0, (y / max) * 100)) : 0;
      bar.style.width = pct.toFixed(1) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
}

/* ---------- v0.62：学段深链 ----------
   首页「按学段直达」把家长送到 wiki.html#初升高 / calendar.html#初升高 这类地址，
   但 details 不会因 hash 自动展开、日历也不会自动按学段过滤——这里做落地处理。 */
var STAGE_HASH_KEYS = ['幼升小', '小升初', '初升高', '高考'];
function initStageDeepLink(){
  var h = location.hash || '';
  if(h.length < 2) return;
  var key;
  try { key = decodeURIComponent(h.slice(1)); } catch(e) { key = h.slice(1); }
  if(STAGE_HASH_KEYS.indexOf(key) < 0) return;      // 白名单：hash 不参与选择器拼接
  var btn = document.querySelector('#calendar .cal-filter .ff[data-cf="' + key + '"]');
  if(btn) filterCal(key);                            // 日历页：按学段过滤
  var d = document.querySelector('#wiki details[data-cat="' + key + '"]');
  if(d) d.open = true;                               // 百科页：展开对应阶段
  var target = btn ? document.querySelector('#calendar .cal-filter') : d;
  if(target && target.scrollIntoView) target.scrollIntoView({ block: 'center' });
}
