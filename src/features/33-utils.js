/* ---------- v0.14 大字版 → v1.09 统一到三档字号体系（jfm_fs: md/lg/xl） ---------- */
function initFsToggle(){
  try{
    var v = localStorage.getItem('jfm_fs');
    if(v === '1'){ /* 旧版二值迁移 */
      localStorage.setItem('jfm_fs', 'lg'); v = 'lg';
    }
    if(v === '0'){ localStorage.setItem('jfm_fs', 'md'); v = 'md'; }
  }catch(e){}
  var btn = document.getElementById('fsToggle');
  if(btn){ btn.textContent = '字号：标准 / 大 / 特大（顶部 A 组可调）'; btn.setAttribute('aria-pressed', 'false'); }
}
function toggleFs(){
  /* 兼容旧入口：循环三档 */
  var cur = 'md';
  try{ cur = localStorage.getItem('jfm_fs') || 'md'; }catch(e){}
  var next = cur === 'md' ? 'lg' : (cur === 'lg' ? 'xl' : 'md');
  try{ localStorage.setItem('jfm_fs', next); }catch(e){}
  if(document.documentElement.setAttribute){
    document.documentElement.setAttribute('data-fs', next);
  }
  var btn = document.getElementById('fsToggle');
  if(btn){ btn.textContent = '字号：' + (next === 'md' ? '标准' : next === 'lg' ? '大' : '特大'); }
  toast('字号已切换为「' + (next === 'md' ? '标准' : next === 'lg' ? '大' : '特大') + '」（顶部 A 组可随时调）');
}
function exportMyData(){
  var out = {};
  ['jfm_children','jfm_active','jfm_alerts','jfm_cmp_fav','jfm_news_user','jfm_profile','jfm_fs','jfm_theme','jfm_ann_closed','sch_fav','dx_fav','dx_cmp','dx_caobiao'].forEach(function(k){
    try{ var v = localStorage.getItem(k); if(v !== null && v !== undefined) out[k] = v; }catch(e){}
  });
  out._exportedAt = new Date().toISOString();
  out._note = '花期册平台 · 本机数据导出（JSON）';
  var blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
  var u = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = u; a.download = 'jfm-my-data.json';
  document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(u); a.remove(); }, 1200);
  toast('已导出本机数据（' + Object.keys(out).length + ' 项）');
}
function clearMyData(){
  if(!confirm('确定清空本机全部数据吗？（档案/提醒/收藏/资讯编辑/显示设置，不影响线上站点）')) return;
  var n = 0;
  ['jfm_children','jfm_active','jfm_alerts','jfm_cmp_fav','jfm_news_user','jfm_profile','jfm_fs','jfm_theme','jfm_ann_closed'].forEach(function(k){
    try{ if(localStorage.getItem(k) !== null){ localStorage.removeItem(k); n++; } }catch(e){}
  });
  toast('已清空本机数据（' + n + ' 项），即将刷新…');
  setTimeout(function(){ location.reload(); }, 1000);
}
/* ---------- v0.23：本机数据导入恢复 / 我的页统计条 ---------- */
function importMyData(){
  var f = document.getElementById('import-file');
  if(f) f.click();
}
function onImportFile(input){
  var file = input.files && input.files[0]; if(!file) return;
  var reader = new FileReader();
  reader.onload = function(){
    var data = null;
    try{ data = JSON.parse(String(reader.result || '')); }catch(e){ toast('导入失败：JSON 格式不正确'); input.value=''; return; }
    var keys = ['jfm_children','jfm_active','jfm_alerts','jfm_cmp_fav','jfm_news_user','jfm_profile','jfm_fs','jfm_theme','jfm_ann_closed'];
    var hit = [];
    if(data && typeof data === 'object'){ keys.forEach(function(k){ if(k in data) hit.push(k); }); }
    if(!hit.length){ toast('导入失败：未识别到可导入的数据键'); input.value=''; return; }
    if(!window.confirm('将导入 ' + hit.length + ' 项数据并覆盖当前本机数据，确定继续？')){ input.value=''; return; }
    try{
      hit.forEach(function(k){
        var v = data[k];
        localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
      });
      toast('导入成功（' + hit.length + ' 项），正在刷新…');
      setTimeout(function(){ location.reload(); }, 600);
    }catch(e){ toast('导入失败：本机存储不可用'); }
    input.value = '';
  };
  reader.onerror = function(){ toast('导入失败：文件读取错误'); input.value=''; };
  reader.readAsText(file);
}
function renderMeStats(){
  var el = document.getElementById('me-stats'); if(!el) return;
  function cnt(k){ var n = 0; try{ var v = JSON.parse(localStorage.getItem(k) || '[]'); if(v && v.length) n = v.length; }catch(e){} return n; }
  el.innerHTML = '<span class="ms-chip">孩子 <b>' + cnt('jfm_children') + '</b></span><span class="ms-chip">提醒 <b>' + cnt('jfm_alerts') + '</b></span><span class="ms-chip">对比收藏 <b>' + cnt('jfm_cmp_fav') + '</b></span><span class="ms-chip">本机资讯 <b>' + cnt('jfm_news_user') + '</b></span>';
}
