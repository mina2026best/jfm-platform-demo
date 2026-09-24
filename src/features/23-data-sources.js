/* ---------- v0.7：数据来源面板 ---------- */
function renderDataSources(){
  var dv = document.getElementById('dataVersion');
  if(dv){ dv.innerHTML = '数据版本：<b>' + DATA_VERSION.label + '</b>（版本 ' + DATA_VERSION.id + ' · 截至 ' + DATA_VERSION.asOf + '）'; }
  var box = document.getElementById('ds-table'); if(!box) return;
  var rows = Object.keys(DATA_SOURCES).map(function(k, i){
    var d = DATA_SOURCES[k];
    var link = d.url ? ' <a class="ds-link" href="' + esc(d.url) + '" target="_blank" rel="noopener">原文入口 ↗</a>' : '';
    return '<tr><td>' + (i+1) + '</td><td>' + esc(d.label) + '</td><td>' + esc(d.source) + link + '</td><td>' + esc(d.asOf) + '</td>'
      + '<td><span class="ds-ver ' + (d.verified ? 'ok">✓ 已核验' : 'pending">○ 待核验') + '</span></td></tr>';
  }).join('');
  var verified = Object.keys(DATA_SOURCES).filter(function(k){ return DATA_SOURCES[k].verified; }).length;
  box.innerHTML = '<table class="ds-table"><tr><th>#</th><th>数据点</th><th>来源（机构 + 口径）</th><th>截至</th><th>核验状态</th></tr>'
    + rows + '</table>'
    + '<p class="cmp-note" style="margin-top:8px">当前数据包：' + verified + '/' + Object.keys(DATA_SOURCES).length + ' 项已核验 · 版本 ' + DATA_VERSION.id + '。来源变更时本表与页面数字同步更新并全站红点提示。</p>';
}
