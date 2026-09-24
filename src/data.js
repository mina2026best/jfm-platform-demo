
/* ---------- 数据层 v0.7：数据版本化 + 来源注册表 ----------
   真实数据以「数据包」形式注入：每个字段带 version/asOf/source。
   DATA_SOURCES 是唯一事实源：页面数字与来源一一对应，核验口径见企划书附录。 */
var DATA_VERSION = { id: "real-2026-09", label: "真实数据包 · 2026-09 版", asOf: "2026-09-16" };
var DATA_SOURCES = {
  k12:   { label: "重庆 K12 在校生约 376.3 万人", source: "《2024年重庆市国民经济和社会发展统计公报》", url: "https://tjj.cq.gov.cn/", asOf: "2025-03-26", verified: true },
  lianzhao: { label: "2026 年联招学校约 113 所（第一批次市级重点约 94 所）", source: "重庆市政府网转载重庆日报 2026-04-22；志愿填报阶段更新 113 所", url: "https://www.cq.gov.cn/", asOf: "2026-06", verified: true },
  zhibiao: { label: "市级重点高中招生计划 70% 指标到校", source: "渝教基函〔2025〕21号（现行有效，已核验文号）", url: "https://jw.cq.gov.cn/", asOf: "2025", verified: true },
  tezhao: { label: "2026 特招线：历史类 510 / 物理类 496", source: "新华网重庆 2026-06-25（已核验）", url: "https://www.xinhuanet.com/", asOf: "2026-06-25", verified: true },
  junjian: { label: "军检线：历史类男 517/女 631、物理类男 533/女 573", source: "阳光高考平台 2026-07-02（已核验）", url: "https://gaokao.chsi.com.cn/", asOf: "2026-07-02", verified: true },
  jiafen: { label: "高考加分：烈士子女 +20、少数民族聚居地 +10", source: "重庆市 2025 年招生工作实施办法", url: "https://jw.cq.gov.cn/", asOf: "2025-05", verified: true },
  huxuegang: { label: "全市 6,993 个护学岗", source: "重庆市政府网 2026-09-02", url: "https://www.cq.gov.cn/", asOf: "2026-09-02", verified: true },
  cifr: { label: "家庭教育支出年均 15,828 元 / 占总消费 17.2%", source: "北大 CIEFR《中国教育财政家庭调查报告（2023）》，2022–2023 学年，全国口径", url: "https://ciefr.pku.edu.cn/", asOf: "2025-11", verified: true },
  aimei: { label: "志愿填报市场 2025 年约 10.9 亿元 / 2026 年预计 11.6 亿元", source: "艾媒咨询年度报告", url: "https://www.iimedia.cn/", asOf: "2026", verified: true }
};
function dataBadge(key){
  var d = DATA_SOURCES[key];
  if(!d) return '';
  var link = d.url ? ' <a href="' + esc(d.url) + '" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:underline">原文 ↗</a>' : '';
  return '<span class="data-badge">' + (d.verified ? '✓ 已核验 · ' : '○ 待核验 · ') + d.source + '（截至 ' + d.asOf + '）' + link + '</span>';
}
