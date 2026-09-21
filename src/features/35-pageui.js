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
