/* ---------- v0.15：深色模式（跟随系统 / 手动；本机记忆） ---------- */
function getThemePref(){ try{ return localStorage.getItem('jfm_theme') || 'auto'; }catch(e){ return 'auto'; } }
function systemDark(){
  try{ return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches); }
  catch(e){ return false; }
}
function effTheme(pref){ return pref === 'dark' || pref === 'light' ? pref : (systemDark() ? 'dark' : 'light'); }
function applyTheme(pref){
  var eff = effTheme(pref);
  document.documentElement.classList.toggle('theme-dark', eff === 'dark');
  document.documentElement.setAttribute('data-theme', eff);
  var meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute('content', eff === 'dark' ? '#0D131B' : '#24344D');
  document.querySelectorAll('.theme-seg .mini-btn').forEach(function(b){
    var on = b.getAttribute('data-th') === pref;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  var note = document.getElementById('theme-note');
  if(note){
    note.textContent = pref === 'auto'
      ? ('当前跟随系统：' + (eff === 'dark' ? '深色' : '浅色') + '。也可固定为浅色或深色（仅本机记忆）。')
      : (pref === 'dark' ? '已固定深色模式（仅本机浏览器记忆，可随时改回）。' : '已固定浅色模式（仅本机浏览器记忆，可随时改回）。');
  }
}
function setTheme(pref){
  try{ localStorage.setItem('jfm_theme', pref); }catch(e){}
  applyTheme(pref);
  toast(pref === 'auto' ? '外观已跟随系统' : (pref === 'dark' ? '已切换深色模式' : '已切换浅色模式'));
}
function initTheme(){
  applyTheme(getThemePref());
  if(window.matchMedia){
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onSys = function(){ if(getThemePref() === 'auto') applyTheme('auto'); };
    if(mq.addEventListener) mq.addEventListener('change', onSys);
    else if(mq.addListener) mq.addListener(onSys);
  }
}
