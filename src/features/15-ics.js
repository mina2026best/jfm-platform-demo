/* ---------- v0.8：提醒导出 .ics ---------- */
function icsDate(t){
  var m = String(t || '').match(/(\d{4})-(\d{2})/);
  return m ? (m[1] + m[2] + '01') : '20260601';
}
function icsEsc(s){ return String(s).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,'); }
function exportIcs(){
  var a = getAlerts();
  if(!a.length){ toast('还没有提醒——到「升学日历」给节点点「设提醒」再导出'); return; }
  var stamp = new Date().toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
  var L = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//jfm demo//升学节点//CN','CALSCALE:GREGORIAN','X-WR-CALNAME:鸡父母 · 升学节点提醒（演示）'];
  a.forEach(function(t, i){
    var ds = icsDate(t);
    var d = new Date(parseInt(ds.slice(0,4),10), parseInt(ds.slice(4,6),10) - 1, 1);
    d.setMonth(d.getMonth() + 1);
    var de = d.getFullYear() + String(d.getMonth() + 1).padStart(2,'0') + '01';
    L.push('BEGIN:VEVENT');
    L.push('UID:jfm-' + Date.now() + '-' + i + '@demo');
    L.push('DTSTAMP:' + stamp);
    L.push('DTSTART;VALUE=DATE:' + ds);
    L.push('DTEND;VALUE=DATE:' + de);
    L.push('SUMMARY:' + icsEsc(t));
    L.push('DESCRIPTION:鸡父母平台 MVP 演示导出；节点以当年官方发布为准');
    L.push('END:VEVENT');
  });
  L.push('END:VCALENDAR');
  var blob = new Blob([L.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  var u = URL.createObjectURL(blob), el = document.createElement('a');
  el.href = u; el.download = 'jfm-reminders.ics';
  document.body.appendChild(el); el.click();
  setTimeout(function(){ URL.revokeObjectURL(u); el.remove(); }, 1500);
  toast('已导出 .ics（' + a.length + ' 条）——可导入手机 / 电脑日历');
}
