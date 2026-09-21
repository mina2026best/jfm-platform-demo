/* ---------- 志愿位次换算（演示口径） ---------- */
var ZY = { ls:{line:510,name:"历史类",src:"tezhao"}, wl:{line:496,name:"物理类",src:"tezhao"} };
function runZy(){
  var sub=document.getElementById("zy-subject").value;
  var v=parseInt(document.getElementById("zy-score").value,10);
  var box=document.getElementById("zy-result");
  if(!v||v<200||v>750){
    box.innerHTML='<div class="cmp-empty">请输入 200–750 之间的分数。</div>';return;
  }
  var cfg=ZY[sub], diff=v-cfg.line;
  var band;
  if(diff>=80) band="特招线上 80 分以上 · 参考位次前 8,000 名区间（演示）";
  else if(diff>=40) band="特招线上 40–79 分 · 参考位次 8,000–18,000 名区间（演示）";
  else if(diff>=0) band="特招线上 0–39 分 · 参考位次 18,000–32,000 名区间（演示）";
  else band="特招线下 "+Math.abs(diff)+" 分 · 建议同步看本科批策略与指标到校/艺体等路径（演示）";
  box.innerHTML='<div class="zy-out"><b>'+cfg.name+' '+v+' 分</b>：线差 '+ (diff>=0?"+":"") +diff+' 分（相对 2026 年特招线 '+cfg.line+'，'+DATA_SOURCES[cfg.src].source.split('（')[0]+'）。<br/>参考位次区间：'+band+'。<br/>'+dataBadge(cfg.src)+'<br/><span style="font-size:12px;color:var(--muted)">口径：2026 年真实特招线 + 演示位次区间；正式版接入当年一分一段表（位次法）。本工具不构成录取预测。</span></div>';
}
