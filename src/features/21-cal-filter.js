/* ---------- v0.5：日历学段筛选 ---------- */
var calStageMode = 'all';
var calViewMode = 'card';
function setCalView(mode){
  calViewMode = mode;
  var grid = document.querySelector('#calendar .cal-grid');
  var month = document.getElementById('cal-month');
  if(!grid || !month) return;
  grid.style.display = (mode === 'card') ? '' : 'none';
  month.hidden = (mode !== 'month');
  document.querySelectorAll('#cal-view .ff').forEach(function(b){
    var on = b.dataset.cv === mode;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  if(mode === 'month') renderCalMonth();
}
function renderCalMonth(){
  var month = document.getElementById('cal-month'); if(!month) return;
  var groups = {};
  var order = [];
  document.querySelectorAll('#calendar .cal-grid .cal').forEach(function(c){
    var vis = (calStageMode === 'all' || c.dataset.stage === calStageMode);
    if(!vis) return;
    var d = (c.querySelector('.date') || {}).textContent || '';
    var m = d.match(/(\d{4}-\d{2})/);
    var key = m ? m[1] : '全年';
    if(!groups[key]){ groups[key] = []; if(m) order.push(key); }
    groups[key].push(c);
  });
  order.sort();
  var html = '';
  if(order.length){
    order.forEach(function(key){
      var cnt = groups[key].length;
      html += '<h3 class="calm-h" id="calm-' + key + '">' + key + ' <span class="calm-n">' + cnt + ' 个节点</span></h3><div class="cal-grid calm-grid">';
      groups[key].forEach(function(c){ html += '<div class="calm-cell">' + c.outerHTML + '</div>'; });
      html += '</div>';
    });
  }
  if(groups['全年']){
    html += '<h3 class="calm-h">全年 / 通用 <span class="calm-n">' + groups['全年'].length + ' 个节点</span></h3><div class="cal-grid calm-grid">';
    groups['全年'].forEach(function(c){ html += '<div class="calm-cell">' + c.outerHTML + '</div>'; });
    html += '</div>';
  }
  if(!html){ month.innerHTML = '<div class="cmp-empty">当前学段筛选下暂无节点。</div>'; return; }
  month.innerHTML = html;
}
function filterCal(mode){
  calStageMode = mode;
  document.querySelectorAll('#calendar .cal').forEach(function(c){
    c.style.display = (mode === 'all' || c.dataset.stage === mode) ? '' : 'none';
  });
  if(calViewMode === 'month') renderCalMonth();
  document.querySelectorAll('#calendar .cal-filter .ff').forEach(function(b){
    b.classList.toggle('on', b.dataset.cf === mode);
  });
}
