/* ---------- v0.11：站点公告 / 搜索快捷键 / 导航高亮 ---------- */
function initAnnBar(){
  var bar = document.getElementById('annBar'); if(!bar) return;
  var closed = false;
  try{ closed = localStorage.getItem('jfm_ann_closed') === '1'; }catch(e){}
  bar.hidden = closed;
}
function closeAnn(){
  var bar = document.getElementById('annBar'); if(bar) bar.hidden = true;
  try{ localStorage.setItem('jfm_ann_closed', '1'); }catch(e){}
}
function initSearchShortcut(){
  document.addEventListener('keydown', function(e){
    if(e.key !== '/') return;
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    if(tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    var box = document.getElementById('global-search'); if(!box) return;
    e.preventDefault(); box.focus();
  });
}
function initScrollSpy(){
  if(!('IntersectionObserver' in window)) return;
  var links = Array.prototype.slice.call(document.querySelectorAll('.top nav a[href^="#"]:not(.cta)'));
  var map = {};
  links.forEach(function(a){ var id = a.getAttribute('href').slice(1); if(id) map[id] = a; });
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting) return;
      links.forEach(function(a){ a.classList.remove('on'); });
      var a = map[en.target.id]; if(a) a.classList.add('on');
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  Object.keys(map).forEach(function(id){ var s = document.getElementById(id); if(s) obs.observe(s); });
}
