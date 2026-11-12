/* ---------- v0.3：我的（提醒/档案/收藏） ---------- */
function getAlerts(){ try{ return JSON.parse(localStorage.getItem('jfm_alerts') || '[]'); }catch(e){ return []; } }
function setAlerts(a){ localStorage.setItem('jfm_alerts', JSON.stringify(a)); }
function toggleAlert(btn){
  var t = btn.dataset.title, a = getAlerts(), i = a.indexOf(t);
  if(i >= 0){ a.splice(i,1); setAlerts(a); btn.classList.remove('on'); btn.textContent = '设提醒'; btn.setAttribute('aria-pressed','false'); toast('已取消提醒：' + t); }
  else { a.push(t); setAlerts(a); btn.classList.add('on'); btn.textContent = '已设提醒'; btn.setAttribute('aria-pressed','true'); toast('已设提醒：' + t + '（微信服务通知即将开放）'); }
  renderAlerts();
}
function restoreAlerts(){
  document.querySelectorAll('.alert-btn').forEach(function(b){
    if(getAlerts().indexOf(b.dataset.title) >= 0){ b.classList.add('on'); b.textContent = '已设提醒'; b.setAttribute('aria-pressed','true'); }
  });
  renderAlerts();
}
function renderAlerts(){
  var box = document.getElementById('me-alerts'); if(!box) return;
  renderMeStats();
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


/* ---------- v1.09 收藏中心：大学关注 / 对比清单 / 学校关注 聚合 ---------- */
function renderWatch(){
  var box = document.getElementById('me-watch'); if(!box) return;
  var html = '';
  /* 大学关注 */
  var dx = []; try{ dx = JSON.parse(localStorage.getItem('dx_fav') || '[]'); }catch(e){}
  if(typeof DAXUE !== 'undefined' && dx.length){
    var chips = dx.map(function(id){
      var s2 = DAXUE.schools.find(function(x){ return String(x.id) === String(id); });
      return s2 ? '<a class="cb-chip-inline" href="daxue.html#dx-' + s2.id + '">★ ' + esc(s2.name) + '</a>' : '';
    }).filter(Boolean).join('');
    if(chips) html += '<div class="watch-row"><span class="watch-lab">大学关注</span>' + chips + ' <button class="mini-btn danger" onclick="watchClear(\'dx_fav\')">清空</button></div>';
  }
  /* 大学对比清单 */
  var cmp = []; try{ cmp = JSON.parse(localStorage.getItem('dx_cmp') || '[]'); }catch(e){}
  if(typeof DAXUE !== 'undefined' && cmp.length){
    var names = cmp.map(function(id){
      var s3 = DAXUE.schools.find(function(x){ return String(x.id) === String(id); });
      return s3 ? esc(s3.name) : '';
    }).filter(Boolean).join(' vs ');
    if(names) html += '<div class="watch-row"><span class="watch-lab">大学对比</span><span>' + names + '</span> <a class="mini-btn" href="daxue.html#compare">去恢复</a></div>';
  }
  /* 学校关注（K12） */
  var sch = []; try{ sch = JSON.parse(localStorage.getItem('sch_fav') || '[]'); }catch(e){}
  if(sch.length){
    var schips = sch.map(function(n){
      var art = (typeof ARTMAP !== 'undefined' && ARTMAP['S|' + n]) ? 'articles/' + ARTMAP['S|' + n] : 'schools.html';
      return '<a class="cb-chip-inline" href="' + art + '">★ ' + esc(n) + '</a>';
    }).join('');
    html += '<div class="watch-row"><span class="watch-lab">学校关注</span>' + schips + ' <button class="mini-btn danger" onclick="watchClear(\'sch_fav\')">清空</button></div>';
  }
  if(!html){
    box.innerHTML = '<div class="empty-mini">还没有关注任何学校或大学。在学校卡片、大学卡片上点「☆ 关注」就会出现在这里，方便随时回看。</div>';
    return;
  }
  box.innerHTML = html;
}
function watchClear(key){
  try{ localStorage.setItem(key, '[]'); }catch(e){}
  renderWatch();
  if(key === 'dx_fav' && typeof dxFavRenderBar === 'function'){ dxFavRenderBar(); }
  if(key === 'sch_fav' && typeof schFavRestore === 'function'){ schFavRestore(); }
  toast('已清空');
}
