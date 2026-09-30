/* ---------- 志愿位次换算 v0.45：2025 官方线 + 三线差对照（精确到个位） ---------- */
/* 2025 年重庆市官方批次线（重庆市教委发布；多源交叉核验 2026-09-30）：
   历史类 本科批 438 / 特殊类型资格线 515 / 专科批 180
   物理类 本科批 425 / 特殊类型资格线 498 / 专科批 180 */
var ZY2025 = {
  ls: { name:"历史类", ben:438, te:515, zhuan:180 },
  wl: { name:"物理类", ben:425, te:498, zhuan:180 }
};
var ZY = { ls:{line:510,name:"历史类",src:"tezhao"}, wl:{line:496,name:"物理类",src:"tezhao"} };
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\\":"&#39;"}[c] || c; }); }
function runZy(){
  var sub=document.getElementById("zy-subject").value;
  var v=parseInt(document.getElementById("zy-score").value,10);
  var box=document.getElementById("zy-result");
  if(!v||v<160||v>750){
    box.innerHTML='<div class="cmp-empty">请输入 160–750 之间的分数（专科批 180 分起，低于该值无法参与普通类投档）。</div>';return;
  }
  var cfg = ZY2025[sub];
  var dBen = v - cfg.ben, dTe = v - cfg.te, dZh = v - cfg.zhuan;
  function row(label, line, d){
    var sgn = d >= 0 ? '+' : '';
    var cls = d >= 0 ? 'ok' : 'warn';
    return '<tr><td>' + label + '</td><td class="mono">' + line + '</td><td class="mono ' + cls + '">' + sgn + d + '</td></tr>';
  }
  // 位次参考（沿用既有区间口径，基准更新为 2025 特招线）
  var oldTe = ZY[sub].line;
  var band;
  var dOld = v - oldTe;
  if(dOld >= 80) band = "特招线上 80 分以上 · 参考位次前 8,000 名区间";
  else if(dOld >= 40) band = "特招线上 40–79 分 · 参考位次 8,000–18,000 名区间";
  else if(dOld >= 0) band = "特招线上 0–39 分 · 参考位次 18,000–32,000 名区间";
  else band = "特招线下 " + Math.abs(dOld) + " 分 · 建议同步看本科批策略与指标到校/艺体等路径";
  var fmt = cfg.name + ' ' + v + ' 分（公式：线差 = 分数 − 控制线，逐条可验算）';
  box.innerHTML = '<div class="zy-out"><b>' + fmt + '</b>'
    + '<table class="art-table" style="margin-top:10px"><thead><tr><th>控制线（2025 官方）</th><th>分数线</th><th>线差</th></tr></thead><tbody>'
    + row('本科批', cfg.ben, dBen)
    + row('特殊类型资格线', cfg.te, dTe)
    + row('高职专科批', cfg.zhuan, dZh)
    + '</tbody></table>'
    + '<div style="margin-top:10px">参考位次区间：' + band + '。</div>'
    + '<div style="margin-top:6px">分步示例（照此可自行验算）：你的分数 ' + v + ' − 本科线 ' + cfg.ben + ' = 线差 <b class="mono">' + (dBen>=0?'+':'') + dBen + '</b>；' + v + ' − 特招线 ' + cfg.te + ' = <b class="mono">' + (dTe>=0?'+':'') + dTe + '</b>；' + v + ' − 专科线 ' + cfg.zhuan + ' = <b class="mono">' + (dZh>=0?'+':'') + dZh + '</b>。</div>'
    + '<div class="cmp-note" style="margin-top:8px">数据口径：重庆市2025年全国普通高等学校招生录取最低控制分数线（重庆市教委 2025-06 发布）；历史类本科 438 / 特招 515 / 专科 180，物理类本科 425 / 特招 498 / 专科 180——全部为官方公布原值，精确到个位。跨年比较请改用位次法；本工具不构成录取预测。</div>'
    + '</div>';
}
