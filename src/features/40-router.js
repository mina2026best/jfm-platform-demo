/* ---------- v0.29：多页架构 · 跨页路由 ---------- */
/* 每页加载后按 URL 参数执行跨页联动；数据页缺失的渲染函数有元素守卫，可安全全量调用。 */
function qparam(name){
  var m = new RegExp('[?&]' + name + '=([^&]*)').exec(location.search);
  return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
}
function bootPageRoute(){
  // 1) news.html?s=关键词 → 筛选并展开定位
  var s = qparam('s');
  if(s && document.getElementById('news-list')){
    newsFilter = 'all'; newsQuery = s; renderNews();
    try{ var qEl = document.getElementById('news-q'); if(qEl) qEl.value = s; }catch(e){}
    setTimeout(function(){
      var el = document.querySelector('#news-list .news-item');
      if(el){ var b = el.querySelector('.ni-body'); if(b) b.hidden = false;
        var tt = el.querySelector('.ni-title'); if(tt) tt.setAttribute('aria-expanded','true');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('flash'); setTimeout(function(){ el.classList.remove('flash'); }, 1400); }
    }, 250);
  }
  // 2) schools.html?school=校名 → 打开档案弹窗
  var sc = qparam('school');
  if(sc && document.getElementById('school-grid')){
    setTimeout(function(){ if(SCHOOL_DB[sc]) openSchool(sc); }, 300);
  }
  // 3) compare.html?fav=1 → 恢复收藏对比
  if(qparam('fav') === '1' && document.getElementById('sel-a')){
    restoreFav();
  }
  // 4) schools.html?fav=1 → 加入对比后跳转
  var add = qparam('add');
  if(add && document.getElementById('sel-a')){
    ['sel-a','sel-b','sel-c'].forEach(function(id){
      var sel = document.getElementById(id); if(sel && !sel.value){ sel.value = add; }
    });
    runCompare();
    var el = document.getElementById('compare');
    if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
  }
}
