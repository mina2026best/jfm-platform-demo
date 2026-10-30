/* ---------- 志愿位次换算 v0.90：2026 官方线 + 三线差对照（精确到个位） ---------- */
/* 2026 年重庆市官方批次线（重庆市教委发布；新华网重庆/央视/中国教育在线多源交叉核验 2026-10-30）：
   历史类 本科批 415 / 特殊类型资格线 510 / 专科批 180
   物理类 本科批 406 / 特殊类型资格线 496 / 专科批 180 */
var ZY2025 = {
  ls: { name:"历史类", ben:438, te:515, zhuan:180 },
  wl: { name:"物理类", ben:425, te:498, zhuan:180 }
};
var ZY2026 = {
  ls: { name:"历史类", ben:415, te:510, zhuan:180 },
  wl: { name:"物理类", ben:406, te:496, zhuan:180 }
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
  var cfg = ZY2026[sub];
  var dBen = v - cfg.ben, dTe = v - cfg.te, dZh = v - cfg.zhuan;
  function row(label, line, d){
    var sgn = d >= 0 ? '+' : '';
    var cls = d >= 0 ? 'ok' : 'warn';
    return '<tr><td>' + label + '</td><td class="mono">' + line + '</td><td class="mono ' + cls + '">' + sgn + d + '</td></tr>';
  }
  var fmt = cfg.name + ' ' + v + ' 分（公式：线差 = 分数 − 控制线，逐条可验算）';
  // v0.90：位次法——2026 一分一段表精确位次（与线差法并举；高分段为「684及以上」合并桶口径）
  var rankHTML = '';
  var secSrc = (typeof SECTION2026 !== 'undefined') ? SECTION2026 : (typeof SECTION2025 !== 'undefined' ? SECTION2025 : null);
  var secYear = (typeof SECTION2026 !== 'undefined') ? '2026' : '2025';
  if(secSrc){
    var sec = secSrc[sub];
    if(sec && sec[String(v)]){
      var rank = sec[String(v)];
      rankHTML = '<div style="margin-top:10px"><b>位次法（' + secYear + ' 一分一段表，精确值）</b>：' + cfg.name + ' ' + v + ' 分 → 全市位次 <b class="mono">' + rank.toLocaleString() + '</b> 名。'
        + ' 用法：把这个位次与目标院校近五年「投档位次」对比——位次比分数更抗试卷难度波动，是最可靠的定位方式。'
        + ' <a class="art-link" href="' + secSrc.meta.article[sub] + '" target="_blank" rel="noopener">查看完整一分一段表 ↗</a></div>';
    }
  }
  // 跨年参考：近三年同分位置对照表（线差法）
  if(typeof renderYears3 === 'function') renderYears3(v, cfg.name);
  box.innerHTML = '<div class="zy-out"><b>' + fmt + '</b>'
    + '<table class="art-table" style="margin-top:10px"><thead><tr><th>控制线（2026 官方）</th><th>分数线</th><th>线差</th></tr></thead><tbody>'
    + row('本科批', cfg.ben, dBen)
    + row('特殊类型资格线', cfg.te, dTe)
    + row('高职专科批', cfg.zhuan, dZh)
    + '</tbody></table>'
    + rankHTML
    + '<div style="margin-top:10px"><b>线差法怎么用</b>：线差是你与「批次门槛」的相对位置。把它与目标院校近三年的「投档线差」对比——院校投档线差三年稳定，你的线差够得上，就是有效志愿。两种方法建议并用：线差看门槛，位次看竞争。</div>'
    + '<div style="margin-top:6px">分步示例（照此可自行验算）：你的分数 ' + v + ' − 本科线 ' + cfg.ben + ' = 线差 <b class="mono">' + (dBen>=0?'+':'') + dBen + '</b>；' + v + ' − 特招线 ' + cfg.te + ' = <b class="mono">' + (dTe>=0?'+':'') + dTe + '</b>；' + v + ' − 专科线 ' + cfg.zhuan + ' = <b class="mono">' + (dZh>=0?'+':'') + dZh + '</b>。</div>'
    + '<div class="cmp-note" style="margin-top:8px">数据口径：重庆市2026年全国普通高等学校招生录取最低控制分数线（重庆市教委 2026-06 发布；新华网重庆 2026-06-25 已核验）；历史类本科 415 / 特招 510 / 专科 180，物理类本科 406 / 特招 496 / 专科 180——全部为官方公布原值，精确到个位。位次与线差均基于官方公布数据；本工具不构成录取预测。目标院校近五年投档趋势见<a href="daxue.html">大学与专业库</a>。</div>'
    + '</div>';
  // 近三年同分位置对照（2023–2025）
  if(typeof renderYears3 === 'function') renderYears3(v, cfg.name);
}
