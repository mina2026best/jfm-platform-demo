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
/* ---------- v0.13：一键复制 / 更新日志 ---------- */
function copyText(txt){
  function done(){ toast('已复制到剪贴板'); }
  function fallback(){
    var ta = document.createElement('textarea');
    ta.value = txt; ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    try{ document.execCommand('copy'); done(); }catch(e){ toast('复制失败，请手动选择复制'); }
    document.body.removeChild(ta);
  }
  try{
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(done, fallback);
      return;
    }
  }catch(e){}
  fallback();
}
function copyNewsItem(k){
  var arr = newsCombined(), x = null;
  for(var i = 0; i < arr.length; i++){ if(arr[i]._k === k){ x = arr[i]; break; } }
  if(!x) return;
  var lines = ['【' + (x.cat || '资讯') + '】' + x.t];
  if(x.sum) lines.push(x.sum);
  lines.push('来源：' + (x.src || '未标注') + (x.date ? ' · ' + x.date : '') + '｜鸡父母平台（演示）');
  copyText(lines.join('\n'));
}
function copyCompare(){
  var box = document.getElementById('cmp-result');
  var table = box && box.querySelector('table');
  if(!table){ toast('先生成对比，再复制'); return; }
  var rows = [];
  table.querySelectorAll('tr').forEach(function(tr){
    var cells = [];
    tr.querySelectorAll('th,td').forEach(function(td){ cells.push(td.textContent.trim()); });
    if(cells.length) rows.push(cells.join(' ｜ '));
  });
  copyText('鸡父母平台 · 择校对比\n' + rows.join('\n') + '\n（口径详见站内「数据来源与核验」）');
}
function copySchoolSummary(){
  var d = (typeof SCHOOL_DB !== 'undefined' && currentOpenSchool) ? SCHOOL_DB[currentOpenSchool] : null;
  if(!d){ toast('未打开档案'); return; }
  var lines = ['【学校档案】' + currentOpenSchool];
  ['办学性质','所在区','招生范围','通勤参考','住宿','收费口径','指标到校','数据来源'].forEach(function(k){
    if(d[k]) lines.push(k + '：' + d[k]);
  });
  lines.push('（来源与核验日期以站内档案为准 · 鸡父母平台演示）');
  copyText(lines.join('\n'));
}
function openChangelog(){
  var d = document.getElementById('changelog-modal');
  if(d && d.showModal) d.showModal();
}
