/* ---------- v0.24：关键节点倒计时条（首屏今日提示） ---------- */
function renderCountdown(){
  var el = document.getElementById('cd-bar'); if(!el) return;
  var nodes = [];
  document.querySelectorAll('.cal-grid .cal').forEach(function(c){
    var dEl = c.querySelector('.date'), h = c.querySelector('h4');
    if(!dEl || !h) return;
    var m = (dEl.textContent || '').match(/(\d{4})-(\d{2})/);
    if(!m) return;
    nodes.push({ t: new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, 1), label: h.textContent.trim() });
  });
  if(!nodes.length){ el.textContent = '升学节点加载中…'; return; }
  var now = new Date(); now.setHours(0, 0, 0, 0);
  var firstThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  var best = null;
  nodes.forEach(function(n){
    if(n.t < firstThisMonth) return;
    if(!best || n.t < best.t) best = n;
  });
  if(!best){ el.textContent = '关键节点季进行中——以官方公告与「升学日历」为准。'; return; }
  var days = Math.round((best.t - now) / 86400000);
  var when = best.t.getFullYear() + ' 年 ' + (best.t.getMonth() + 1) + ' 月';
  var timing = days > 0 ? ('约 <b>' + days + '</b> 天') : '就在本月';
  el.innerHTML = '距「' + esc(best.label) + '」（' + when + '）' + timing + ' · <a href="#calendar">看升学日历 →</a> <span class="cd-note">（示例口径，以官方发布为准）</span>';
}
