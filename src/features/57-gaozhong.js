/* ---------- 高中与联招库 v0.93：六年联招送档线 + 逐校核验行 ----------
   数据：57-gaozhong-data.js（构建管线生成，勿手改）。红线：不排名、不预测，未核验留空。 */
function gzChart(){
  var d = GAOZHONG, years = d.meta.years;
  var vals = years.map(function(y){ return d.songdang[y]; }).filter(function(v){ return v; });
  if(!vals.length) return '';
  var mn = Math.min.apply(null, vals) - 25, mx = Math.max.apply(null, vals) + 15;
  var W = 640, H = 200, PL = 44, PR = 16, PT = 18, PB = 26;
  function X(i){ return PL + i * (W - PL - PR) / (years.length - 1); }
  function Y(v){ return PT + (H - PT - PB) * (mx - v) / (mx - mn); }
  var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="重庆中考联招统一送档线 2021-2026 趋势图" style="width:100%;height:auto;display:block">';
  for(var g = 0; g < 4; g++){
    var gv = Math.round(mn + (mx - mn) * g / 3), gy = Y(gv);
    svg += '<line x1="' + PL + '" y1="' + gy + '" x2="' + (W - PR) + '" y2="' + gy + '" class="dx-gridline"/>'
      + '<text x="' + (PL - 6) + '" y="' + (gy + 3) + '" class="dx-axv" text-anchor="end">' + gv + '</text>';
  }
  years.forEach(function(y, i){
    svg += '<text x="' + X(i) + '" y="' + (H - 8) + '" class="dx-axy" text-anchor="middle">' + y + '</text>';
  });
  var pts = years.map(function(y, i){ return { x: X(i), py: Y(d.songdang[y]), v: d.songdang[y], yr: y }; });
  svg += '<polyline points="' + pts.map(function(p){ return p.x.toFixed(1) + ',' + p.py.toFixed(1); }).join(' ') + '" class="gz-line"/>';
  pts.forEach(function(p, i){
    var prev = i ? pts[i - 1].v : null;
    var dlt = prev ? (p.v - prev) : null;
    var t = '<title>' + p.yr + ' 年联招送档线 ' + p.v + ' 分' + (dlt !== null ? '（较上年 ' + (dlt >= 0 ? '+' : '') + dlt + '）' : '') + '</title>';
    svg += '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.py.toFixed(1) + '" r="4" class="gz-dot">' + t + '</circle>'
      + '<text x="' + p.x.toFixed(1) + '" y="' + (p.py - 9).toFixed(1) + '" class="gz-val" text-anchor="middle">' + p.v + '</text>';
  });
  return svg + '</svg>';
}

function gzInit(){ gzRender(); }
function gzRender(){
  var box = document.getElementById('gz-trend');
  if(!box || typeof GAOZHONG === 'undefined') return;
  box.innerHTML = gzChart();
  /* 送档线明细表 */
  var tb = document.getElementById('gz-songdang-table');
  var rows = '', prev = null;
  GAOZHONG.meta.years.forEach(function(y){
    var v = GAOZHONG.songdang[y];
    if(!v) return;
    var d = prev !== null ? v - prev : null;
    rows += '<tr><td>' + y + '</td><td class="mono">' + v + '</td>'
      + '<td class="mono ' + (d === null ? '' : (d >= 0 ? 'ok' : 'warn')) + '">' + (d === null ? '—' : (d >= 0 ? '+' : '') + d) + '</td>'
      + '<td>' + (d === null ? '基期' : (d >= 0 ? '较上年上升（试卷难度或竞争变化）' : '较上年下降（扩招或难度变化），看位次别只看分')) + '</td></tr>';
    prev = v;
  });
  tb.innerHTML = '<table class="art-table" style="margin-top:12px"><thead><tr><th>年份</th><th>联招送档线（分）</th><th>同比</th><th>读法</th></tr></thead><tbody>' + rows + '</tbody></table>'
    + '<p class="dx-tnote">来源：' + esc(GAOZHONG.meta.src.o) + '（2026-10-30 核验）；<a class="art-link" href="' + esc(GAOZHONG.meta.src.u) + '" target="_blank" rel="noopener">2026 年公告原文 ↗</a></p>';
  /* 逐校核验行 */
  var st = document.getElementById('gz-school-table');
  var sn = document.getElementById('gz-src-note');
  var schools = GAOZHONG.schools || [];
  if(!schools.length){
    if(st) st.outerHTML = '<p class="dx-nodate">逐校核验行采集中——上线前会逐条标注来源；当前请以送档线趋势与指标到校政策条目为准。</p>';
    return;
  }
  var head = '<thead><tr><th>学校</th><th>区县</th>';
  GAOZHONG.meta.years.slice(1).forEach(function(y){ head += '<th>' + y + '</th>'; });
  head += '</tr></thead>';
  var body = '<tbody>';
  schools.forEach(function(s){
    body += '<tr><td>' + esc(s.name) + '</td><td>' + esc(s.qu || '—') + '</td>';
    GAOZHONG.meta.years.slice(1).forEach(function(y){
      var r = s.lines && s.lines[y];
      body += r ? '<td class="mono">' + r.score + '<small>' + esc(r.note || '') + '</small></td>' : '<td>—</td>';
    });
    body += '</tr>';
  });
  body += '</tbody>';
  st.innerHTML = head + body;
  if(sn){
    var srcs = [];
    schools.forEach(function(s){ (s.srcs || []).forEach(function(u){ if(srcs.indexOf(u) < 0) srcs.push(u); }); });
    sn.innerHTML = srcs.length ? '逐校线来源：' + srcs.map(function(u){ return '<a class="art-link" href="' + esc(u.u) + '" target="_blank" rel="noopener">' + esc(u.t) + ' ↗</a>'; }).join(' · ') : '';
  }
}
