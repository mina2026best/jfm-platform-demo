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
  var fmt = cfg.name + ' ' + v + ' 分（公式：线差 = 分数 − 控制线，逐条可验算）';
  // v0.46：位次区间口径已移除（原区间无官方一分一段数据支撑，易误导）；
  // 跨年参考改为「近三年同分位置对照表」（线差法，见下方 years3 容器）
  box.innerHTML = '<div class="zy-out"><b>' + fmt + '</b>'
    + '<table class="art-table" style="margin-top:10px"><thead><tr><th>控制线（2025 官方）</th><th>分数线</th><th>线差</th></tr></thead><tbody>'
    + row('本科批', cfg.ben, dBen)
    + row('特殊类型资格线', cfg.te, dTe)
    + row('高职专科批', cfg.zhuan, dZh)
    + '</tbody></table>'
    + '<div style="margin-top:10px"><b>怎么用这个差值</b>：线差是你与「批次门槛」的相对位置。志愿填报时，把它与目标院校近三年的「投档线差」对比——院校投档线差三年稳定，你的线差够得上，就是有效志愿。</div>'
    + '<div style="margin-top:6px">分步示例（照此可自行验算）：你的分数 ' + v + ' − 本科线 ' + cfg.ben + ' = 线差 <b class="mono">' + (dBen>=0?'+':'') + dBen + '</b>；' + v + ' − 特招线 ' + cfg.te + ' = <b class="mono">' + (dTe>=0?'+':'') + dTe + '</b>；' + v + ' − 专科线 ' + cfg.zhuan + ' = <b class="mono">' + (dZh>=0?'+':'') + dZh + '</b>。</div>'
    + '<div class="cmp-note" style="margin-top:8px">数据口径：重庆市2025年全国普通高等学校招生录取最低控制分数线（重庆市教委 2025-06 发布）；历史类本科 438 / 特招 515 / 专科 180，物理类本科 425 / 特招 498 / 专科 180——全部为官方公布原值，精确到个位。更精细的定位请用「位次法」：查当年一分一段表（重庆市教育考试院公布）得到确切位次，再对照院校投档位次。本工具不构成录取预测。</div>'
    + '</div>';
  // 近三年同分位置对照（2023–2025）
  if(typeof renderYears3 === 'function') renderYears3(v, cfg.name);
}
