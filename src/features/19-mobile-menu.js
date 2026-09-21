/* ---------- v0.4：移动菜单 ---------- */
function toggleMobileMenu(){
  var m = document.getElementById('mobileMenu'), b = document.getElementById('navBurger');
  if(!m || !b) return;
  var willOpen = m.hasAttribute('hidden');
  if(willOpen){ m.removeAttribute('hidden'); b.classList.add('open'); b.setAttribute('aria-expanded','true'); }
  else { m.setAttribute('hidden',''); b.classList.remove('open'); b.setAttribute('aria-expanded','false'); }
}
document.addEventListener('click', function(e){
  var a = e.target.closest ? e.target.closest('#mobileMenu a') : null;
  if(a){
    var m = document.getElementById('mobileMenu'), b = document.getElementById('navBurger');
    if(m){ m.setAttribute('hidden',''); }
    if(b){ b.classList.remove('open'); b.setAttribute('aria-expanded','false'); }
  }
});
