/* ---------- v0.4：入学自查（规则演示） ---------- */
function runQuiz(){
  var qu = document.getElementById('qz-qu').value,
      st = document.getElementById('qz-stage').value,
      hs = document.getElementById('qz-house').value;
  var box = document.getElementById('qz-out');
  if(!qu || !st || !hs){ box.innerHTML = '<div class="cmp-empty">三个问题都选一下，才能给出针对性提示。</div>'; return; }
  var stageName = { '幼儿园':'幼升小', '小学':'小升初', '初中':'初升高', '高中':'高考后' }[st] || st;
  var L = [];
  L.push('<b>基本路径：</b>' + stageName + ' · ' + qu);
  if(hs === '有房产且已落户'){
    L.push('· 「三对口」核心条件大概率满足：户籍、居住地、学籍对口。重点核对<b>学位占用</b>（小学六年一户、初中三年一户）与<b>落户年限</b>要求（如沙区二手房须满三年，以区细则为准）。');
  } else if(hs === '有房产未落户'){
    L.push('· <b>关键缺口：户口未迁入。</b>多数区要求「房户一致」，建议尽早办理落户并同步咨询区教委过渡政策。');
  } else if(hs === '租房居住'){
    L.push('· 走<b>随迁子女入学</b>通道：通常需家长居住证 + 合法稳定职业/社保 + 居住证明，各区材料清单不同；学位排序一般靠后，建议同步准备民办与对口公办兜底。');
  } else {
    L.push('· 隔代/其他情形：以「实际居住 + 监护关系」材料为准，建议直接咨询区教委基教科，并把答复记录存档。');
  }
  if(st === '初中') L.push('· 初升高通道多元：<b>指标到校</b>（70% 名额分到初中）是重要路径，保持学籍连续是前提；同时关注联招志愿梯度。');
  if(st === '高中') L.push('· 高考路径多元：普通高考之外还有艺体、高职分类考试等；分数参考可先用上方「位次换算」工具（演示口径）。');
  L.push(dataBadge('zhibiao'));
  L.push('<span style="font-size:12px;color:var(--muted)">本自查为规则演示，不构成入学承诺；最终以区教委当年度政策与学校招生细则为准。</span>');
  box.innerHTML = '<div class="zy-out">' + L.join('<br/>') + '</div>';
}
