/* ---------- v0.14：大字版无障碍 / 本机数据管理 ---------- */
function initFsToggle(){
  var on = false;
  try{ on = localStorage.getItem('jfm_fs') === '1'; }catch(e){}
  if(on) document.documentElement.classList.add('fs-large');
  var btn = document.getElementById('fsToggle');
  if(btn){ btn.textContent = on ? '大字版：已开' : '大字版：关'; btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', String(on)); }
}
function toggleFs(){
  var on = document.documentElement.classList.toggle('fs-large');
  try{ localStorage.setItem('jfm_fs', on ? '1' : '0'); }catch(e){}
  var btn = document.getElementById('fsToggle');
  if(btn){ btn.textContent = on ? '大字版：已开' : '大字版：关'; btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', String(on)); }
  toast(on ? '已开启大字版（可在「我的」随时切换）' : '已恢复标准字号');
}
function exportMyData(){
  var out = {};
  ['jfm_children','jfm_active','jfm_alerts','jfm_cmp_fav','jfm_news_user','jfm_profile','jfm_fs','jfm_theme'].forEach(function(k){
    try{ var v = localStorage.getItem(k); if(v !== null && v !== undefined) out[k] = v; }catch(e){}
  });
  out._exportedAt = new Date().toISOString();
  out._note = '鸡父母平台 MVP 演示站 · 本机数据导出（JSON）';
  var blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
  var u = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = u; a.download = 'jfm-my-data.json';
  document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(u); a.remove(); }, 1200);
  toast('已导出本机数据（' + Object.keys(out).length + ' 项）');
}
function clearMyData(){
  if(!confirm('确定清空本机全部演示数据吗？（档案/提醒/收藏/资讯编辑/显示设置，不影响线上站点）')) return;
  var n = 0;
  ['jfm_children','jfm_active','jfm_alerts','jfm_cmp_fav','jfm_news_user','jfm_profile','jfm_fs','jfm_theme','jfm_ann_closed'].forEach(function(k){
    try{ if(localStorage.getItem(k) !== null){ localStorage.removeItem(k); n++; } }catch(e){}
  });
  toast('已清空本机数据（' + n + ' 项），即将刷新…');
  setTimeout(function(){ location.reload(); }, 1000);
}
