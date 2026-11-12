/* ---------- v0.80：节点提醒订阅（页脚订阅条 · 生成 .ics，本机不收集联系方式） ---------- */
function subscribeNode(){
  var stageEl = document.getElementById('sub-stage');
  var stage = stageEl ? stageEl.value : '';
  var items = document.querySelectorAll('.cal[data-stage="' + stage + '"]');
  /* v1.09：非日历页降级用构建期 CAL_NODES 数据（P1-2 修复 30 页死 CTA） */
  if(!items.length && typeof CAL_NODES !== 'undefined'){
    var nodes = CAL_NODES.filter(function(n){ return n.stage === stage && /^\d{4}-\d{2}/.test(n.date); });
    if(nodes.length){
      var stamp2 = new Date().toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
      var L2 = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//jfm demo//升学节点订阅//CN','CALSCALE:GREGORIAN','X-WR-CALNAME:花期册 · ' + stage + '升学节点'];
      nodes.forEach(function(n, i){
        var m2 = n.date.match(/(\d{4})-(\d{2})/);
        var d2 = new Date(parseInt(m2[1],10), parseInt(m2[2],10) - 1, 1);
        d2.setMonth(d2.getMonth() + 1);
        L2.push('BEGIN:VEVENT','UID:jfm-sub-' + Date.now() + '-' + i + '@demo','DTSTAMP:' + stamp2,
                'DTSTART;VALUE=DATE:' + m2[1] + m2[2] + '01','DTEND;VALUE=DATE:' + d2.getFullYear() + String(d2.getMonth() + 1).padStart(2,'0') + '01',
                'SUMMARY:' + icsEsc(n.title),'DESCRIPTION:花期册 · ' + stage + '节点提醒；以当年官方发布为准','END:VEVENT');
      });
      L2.push('END:VCALENDAR');
      var blob2 = new Blob([L2.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
      var u2 = URL.createObjectURL(blob2), el2 = document.createElement('a');
      el2.href = u2; el2.download = 'jfm-' + stage + '-nodes.ics';
      document.body.appendChild(el2); el2.click(); document.body.removeChild(el2);
      setTimeout(function(){ URL.revokeObjectURL(u2); }, 800);
      try{
        var log2 = JSON.parse(localStorage.getItem('jfm_subscribe_log') || '[]');
        log2.push({ stage: stage, date: new Date().toISOString() });
        localStorage.setItem('jfm_subscribe_log', JSON.stringify(log2));
      }catch(e){}
      if(typeof jfmTrack === 'function') jfmTrack('subscribe_ics', { stage: stage });
      var ok2 = document.getElementById('sub-ok'); if(ok2) ok2.hidden = false;
      if(typeof toast === 'function') toast('已生成 ' + stage + ' 节点提醒日历（.ics，' + nodes.length + ' 条）');
      return false;
    }
  }
  if(!items.length){ toast('该学段暂无节点数据'); return false; }
  var stamp = new Date().toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
  var L = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//jfm demo//升学节点订阅//CN','CALSCALE:GREGORIAN','X-WR-CALNAME:花期册 · ' + stage + '升学节点'];
  items.forEach(function(c, i){
    var dEl = c.querySelector('.date'), hEl = c.querySelector('h4');
    var m = ((dEl ? dEl.textContent : '') || '').match(/(\d{4})-(\d{2})/);
    if(!m) return;
    var ds = m[1] + m[2] + '01';
    var d = new Date(parseInt(m[1],10), parseInt(m[2],10) - 1, 1);
    d.setMonth(d.getMonth() + 1);
    var de = d.getFullYear() + String(d.getMonth() + 1).padStart(2,'0') + '01';
    L.push('BEGIN:VEVENT');
    L.push('UID:jfm-sub-' + Date.now() + '-' + i + '@demo');
    L.push('DTSTAMP:' + stamp);
    L.push('DTSTART;VALUE=DATE:' + ds);
    L.push('DTEND;VALUE=DATE:' + de);
    L.push('SUMMARY:' + icsEsc(hEl ? hEl.textContent : stage + '节点'));
    L.push('DESCRIPTION:花期册 · ' + stage + '节点提醒；以当年官方发布为准');
    L.push('END:VEVENT');
  });
  L.push('END:VCALENDAR');
  var blob = new Blob([L.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  var u = URL.createObjectURL(blob), el = document.createElement('a');
  el.href = u; el.download = 'jfm-' + stage + '-nodes.ics';
  document.body.appendChild(el); el.click(); document.body.removeChild(el);
  setTimeout(function(){ URL.revokeObjectURL(u); }, 800);
  try{
    var log = JSON.parse(localStorage.getItem('jfm_subscribe_log') || '[]');
    log.push({ stage: stage, date: new Date().toISOString() });
    localStorage.setItem('jfm_subscribe_log', JSON.stringify(log));
  }catch(e){}
  if(typeof jfmTrack === 'function') jfmTrack('subscribe_ics', { stage: stage });
  var ok = document.getElementById('sub-ok'); if(ok) ok.hidden = false;
  if(typeof toast === 'function') toast('已生成 ' + stage + ' 节点提醒日历（.ics）');
  return false;
}
function copySubscribeLink(){
  var url = location.origin + location.pathname;
  var done = function(){ if(typeof toast==='function') toast('链接已复制——发给同年级的家长吧'); };
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(done, function(){ fallbackCopy(url); done(); });
  } else { fallbackCopy(url); done(); }
  if(typeof jfmTrack === 'function') jfmTrack('subscribe_share', {});
}
function fallbackCopy(text){
  var ta = document.createElement('textarea'); ta.value = text;
  document.body.appendChild(ta); ta.select();
  try{ document.execCommand('copy'); }catch(e){}
  document.body.removeChild(ta);
}
