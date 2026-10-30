/* ---------- v0.93 民办摇号 · 怎么查与防骗（schools 页） ----------
   数据核验：research/jfm/yh_data.md（2026-10-30，逐条带来源）。
   结论口径：各区官方只公示到「规则层」，分校报名数不公示 → 任何具体中签率数字均无官方依据。 */
var YH_ROWS = [
  { t: '官方公示到哪一层？', d: '各区招生方案只公示<b>规则层</b>：公民同招、民办超额电脑摇号、时间与报名范围；<b>分校报名人数不公示</b>。南岸区招生计划仅到全区汇总（2026 年小学 13,410 / 中学 13,400），附件同样只有汇总数。' },
  { t: '所以「中签率」从哪来？', d: '算不出来。官方未公示分校报名数，任何具体中签率数字都没有官方依据——自媒体流传的「热门民办中签率 15%–92%」为无来源自述，<b>不可信、请勿采信</b>。' },
  { t: '能核验到的少数数字', d: '两江新区<b>重庆第一双语学校（民转公）2025 年摇号招生计划 400 名</b>（转引自官方政策，建议向两江新区教育局复核）；历史参照：2020 年市政府网曾统一公示分校摇号计划（巴南巴蜀小学 150 人、树人立德小学 94 人等），此后未再公布同粒度数据。' },
  { t: '想盯自己关心的学校怎么办？', d: '盯<b>区教委官网「招生入学」栏目</b>当年方案与报名须知（本页下方有 11 区官方入口）；摇号在渝快办「教育入学一件事」系统进行；民办只能填报 1 所，报名数 ≤ 计划直接录取，超额才统一摇号（6 月 20 日前后）。' }
];
var YH_SRC = [
  { t: '市教委 2026 年招生入学政策解读 20 问', u: 'https://www.cqnews.net/web/content_1496546834433126400.html' },
  { t: '渝北区 2025 年招生方案（华龙网）', u: 'https://www.cqnews.net/1/detail/1374750892381188096/app/content_1374750892381188096.html' },
  { t: '巴南区 2025 年招生方案（区教委）', u: 'https://www.cqbn.gov.cn/bmjz/bm/jw/zwgk_88657/zfxxgkml/jczwgk/ywjy/zsgl/zszc/202505/t20250520_14640804.html' },
  { t: '南岸区 2026 年招生方案摘要（市政府网）', u: 'https://www.cq.gov.cn/ywdt/zwhd/qxdt/202605/t20260527_15707169.html' },
  { t: '2020 年主城分校摇号计划（历史参照）', u: 'https://www.cq.gov.cn/zwgk/zfxxgkml/zdlyxxgk/jy1/jy/202006/t20200617_8806484.html' }
];
function yhRender(){
  var box = document.getElementById('yh-guide');
  if(!box) return;
  box.innerHTML = '<div class="cmp-note" style="margin-bottom:12px"><b>一句话结论</b>　各区官方只公示摇号「规则」，不公示分校报名人数——<b>凡宣称知道具体「中签率」的来源都不可信</b>。以下是能核验的事实与正确的查询姿势（2026-10-30 核验）。</div>'
    + '<div class="dx-notes">' + YH_ROWS.map(function(r){
      return '<div><b>' + r.t + '</b>　' + r.d + '</div>';
    }).join('') + '</div>'
    + '<p class="dx-tnote" style="margin-top:10px">核验来源：' + YH_SRC.map(function(s){
      return '<a class="art-link" href="' + s.u + '" target="_blank" rel="noopener">' + esc(s.t) + ' ↗</a>';
    }).join(' · ') + '</p>';
}
