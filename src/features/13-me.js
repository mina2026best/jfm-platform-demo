/* ---------- v0.3：我的（提醒/档案/收藏） ---------- */
function getAlerts(){ try{ return JSON.parse(localStorage.getItem('jfm_alerts') || '[]'); }catch(e){ return []; } }
function setAlerts(a){ localStorage.setItem('jfm_alerts', JSON.stringify(a)); }
function toggleAlert(btn){
  var t = btn.dataset.title, a = getAlerts(), i = a.indexOf(t);
  if(i >= 0){ a.splice(i,1); setAlerts(a); btn.classList.remove('on'); btn.textContent = '设提醒'; toast('已取消提醒：' + t); }
  else { a.push(t); setAlerts(a); btn.classList.add('on'); btn.textContent = '已设提醒'; toast('已设提醒：' + t + '（演示：正式版推送微信服务通知）'); }
  renderAlerts();
}
function restoreAlerts(){
  document.querySelectorAll('.alert-btn').forEach(function(b){
    if(getAlerts().indexOf(b.dataset.title) >= 0){ b.classList.add('on'); b.textContent = '已设提醒'; }
  });
  renderAlerts();
}
function renderAlerts(){
  var box = document.getElementById('me-alerts'); if(!box) return;
  var a = getAlerts();
  var cnt = document.getElementById('me-alert-count'); if(cnt) cnt.textContent = a.length ? '（' + a.length + '）' : '';
  if(!a.length){ box.innerHTML = '<div class="empty-mini">还没有提醒。到「升学日历」给节点点「设提醒」，就会出现在这里。</div>'; return; }
  box.innerHTML = a.map(function(t){
    return '<div class="me-item"><span>' + esc(t) + '</span><button class="mini-btn danger" data-t="' + esc(t) + '" onclick="removeAlert(this)">删除</button></div>';
  }).join('');
}
function removeAlert(btn){
  var t = btn.dataset.t, a = getAlerts(), i = a.indexOf(t);
  if(i >= 0){ a.splice(i,1); setAlerts(a); }
  document.querySelectorAll('.alert-btn').forEach(function(b){ if(b.dataset.title === t){ b.classList.remove('on'); b.textContent = '设提醒'; } });
  renderAlerts(); toast('已删除提醒');
}
