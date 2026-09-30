/* ---------- v0.42：区县入学指南（官方入口 · 逐区核验 200） ---------- */
var QU_GUIDE = [
 {
  "qu": "两江新区",
  "url": "https://www.ljxq.gov.cn",
  "org": "两江新区管委会（区教委入口：网站「部门」→ 区教委）",
  "note": "直管 8 所直属学校样本为主；义务教育招生方案每年 5 月前后发布，民转公摇号与幼随长政策明确"
 },
 {
  "qu": "高新区",
  "url": "http://gxq.cq.gov.cn",
  "org": "西部科学城重庆高新区管委会",
  "note": "大学城片区学校密集；入学咨询经管委会教育部门统一受理"
 },
 {
  "qu": "渝中区",
  "url": "http://www.cqyz.gov.cn/",
  "org": "渝中区政府（部门 → 区教委）",
  "note": "老城区学位紧张，房屋「六年一户/学位锁定」核查尤其重要；区教委页含科室电话"
 },
 {
  "qu": "大渡口区",
  "url": "http://www.ddk.gov.cn/",
  "org": "大渡口区政府（部门 → 区教委）",
  "note": "指标到校按渝教基函执行；区政府站「优待政策」页载中考加分与指标到校文件引用"
 },
 {
  "qu": "江北区",
  "url": "https://zwykb.cq.gov.cn/",
  "org": "江北区政府信息公开（暂无独立可达官网，经渝快办统一入口）",
  "note": "义务教育入学经「渝快办 → 义务教育入学一件事」网上报名"
 },
 {
  "qu": "沙坪坝区",
  "url": "https://www.cqspb.gov.cn/bm/qjw/",
  "org": "沙坪坝区教委（区政府站「部门 → 区教委」）",
  "note": "每年发布招生工作实施方案与入学学位申请通告；区内高校附中资源集中"
 },
 {
  "qu": "九龙坡区",
  "url": "http://www.cqjlp.gov.cn",
  "org": "九龙坡区政府（部门 → 区教委）",
  "note": "谢家湾/杨家坪两大片区；学区与学位预警信息经区政府站发布"
 },
 {
  "qu": "南岸区",
  "url": "https://www.cqna.gov.cn/bm/qjw/",
  "org": "南岸区教委（区政府站「部门 → 区教委）",
  "note": "弹子石/茶园双片区；跨集团办学与指标到校名额分配逐年公布"
 },
 {
  "qu": "北碚区",
  "url": "https://www.beibei.gov.cn/bm/qjw/",
  "org": "北碚区教委（区政府站「部门 → 区教委」）",
  "note": "曾发布「幼升小、小升初入学网上报名操作指南」（渝快办两端口）；西大附中本部所在地"
 },
 {
  "qu": "渝北区",
  "url": "https://zwykb.cq.gov.cn/",
  "org": "渝北区政府信息公开（经渝快办统一入口）",
  "note": "中央公园/空港双片区快速扩张；随迁子女材料由各教管中心核验"
 },
 {
  "qu": "巴南区",
  "url": "http://www.cqbn.gov.cn/",
  "org": "巴南区政府（部门 → 区教委）",
  "note": "此前的巴南中学（现属巴南）与鱼洞片区为主要学区；招生方案经区政府站公开"
 }
];

function renderQuGuide(){
  var box = document.getElementById('qu-guide'); if(!box) return;
  box.innerHTML = QU_GUIDE.map(function(g){
    return '<a class="qug-item" href="' + g.url + '" target="_blank" rel="noopener">'
      + '<span class="qug-qu">' + esc(g.qu) + '</span>'
      + '<span class="qug-org">' + esc(g.org) + '</span>'
      + '<span class="qug-note">' + esc(g.note) + '</span>'
      + '<span class="qug-go">官方入口 ↗</span></a>';
  }).join('') + '<p class="cmp-note">以上 ' + QU_GUIDE.length + ' 条官方入口于 2026-09-30 逐一 HTTP 实测可达（2xx）；招生细则以各区当年公告为准。江北/渝北两区经「渝快办」统一入口办理义务教育入学。</p>';
}
