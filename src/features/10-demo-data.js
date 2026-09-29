/* ---------- 基础数据 v0.40：SCHOOL_DB 由构建时从 src/data/schools.json 注入（单一数据源，勿在此手写） ---------- */
var ROWS = ["办学性质","所在区","创办","校区地址","招生范围","通勤参考","住宿","收费口径","指标到校","数据来源","暂缺字段"];

function esc(s){ return String(s).replace(/[&<>"]/g, function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
var _toastTimer = null;
function toast(msg){
  var t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  if(_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function(){ t.classList.remove('show'); }, 2200);
}

var cmpLast = null, cmpDiffOnly = false;
function runCompare(){
  if(!document.getElementById("sel-a")) return;
  var a=document.getElementById("sel-a").value,
      b=document.getElementById("sel-b").value,
      c=document.getElementById("sel-c").value;
  var picks=[a,b,c].filter(function(x){return x;});
  var uniq=picks.filter(function(x,i){return picks.indexOf(x)===i;});
  var box=document.getElementById("cmp-result");
  if(uniq.length<2){
    cmpLast = null; cmpDiffOnly = false;
    var dbtn = document.getElementById("btn-diff");
    if(dbtn){ dbtn.classList.remove('on'); dbtn.setAttribute('aria-pressed','false'); dbtn.textContent = '仅看差异'; }
    box.innerHTML='<div class="cmp-empty">请至少选择 2 所不同的学校（重复选择已自动去重）。</div>';
    return;
  }
  cmpLast = {
    schools: uniq,
    rows: ROWS.map(function(row){
      var vals = uniq.map(function(name){ var d = SCHOOL_DB[name]; return (d && d[row]) || "暂缺"; });
      var diff = false;
      for(var i=1;i<vals.length;i++){ if(vals[i] !== vals[0]){ diff = true; break; } }
      return { row: row, vals: vals, diff: diff };
    })
  };
  cmpDiffOnly = false;
  renderCompareTable();
}
function renderCompareTable(){
  var box = document.getElementById("cmp-result"); if(!box || !cmpLast) return;
  var rows = cmpLast.rows, shown = cmpDiffOnly ? rows.filter(function(r){ return r.diff; }) : rows;
  var diffCount = rows.filter(function(r){ return r.diff; }).length;
  var html='<table class="cmp-table"><tr><th>对比维度</th>';
  cmpLast.schools.forEach(function(name){ html+='<th>'+esc(name)+'</th>'; });
  html+='</tr>';
  shown.forEach(function(r){
    html+='<tr class="'+(r.diff?'cmp-diff':'')+'"><td>'+esc(r.row)+(r.diff?'<span class="cmp-dot" title="该维度各校存在差异">●</span>':'')+'</td>';
    r.vals.forEach(function(v){ html+='<td>'+esc(v)+'</td>'; });
    html+='</tr>';
  });
  html+='</table>';
  html+='<p class="cmp-note" style="margin-top:12px">'
    + (cmpDiffOnly
        ? '仅看差异：共显示 ' + shown.length + ' 个维度（另有 ' + (rows.length - shown.length) + ' 个各校一致的维度已折叠）。'
        : '差异标记：<span class="cmp-dot">●</span> 表示该维度各校存在差异（共 ' + diffCount + ' 项）。')
    + '口径说明：「录取线/排名」类字段按合规红线不提供（教育部门明令禁止排名炒作）；数据缺失如实标注。正式版每字段附核验日期与来源链接，可一键生成对比图分享到家庭群。</p>';
  box.innerHTML=html;
  var btn = document.getElementById("btn-diff");
  if(btn){ btn.classList.toggle('on', cmpDiffOnly); btn.setAttribute('aria-pressed', String(cmpDiffOnly)); btn.textContent = cmpDiffOnly ? '显示全部维度' : '仅看差异'; }
}
function toggleDiffOnly(){
  if(!cmpLast){ toast('先生成对比，再筛选差异'); return; }
  cmpDiffOnly = !cmpDiffOnly;
  renderCompareTable();
  toast(cmpDiffOnly ? '已折叠各校一致的维度' : '已显示全部维度');
}
