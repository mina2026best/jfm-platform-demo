/* ---------- v0.93 划片公告速查（schools 页，9 区 2026/2025 官方直链） ----------
   数据核验：research/jfm/pq_index.md（2026-10-30，全部「已验证」链接当日抓取 HTTP 200）。 */
var PQ_ROWS = [
  { q: '渝中区', st: '直链', y26: { t: '2026 小学招生通知（区教委）', u: 'https://www.cqyz.gov.cn/bm_229/qjw/zwgk_97157/jczwgk/ywjy/ywjy_262703/ywjy/202606/t20260623_15771865.html' }, y25: { t: '2025 初中招生通知', u: 'https://www.cqyz.gov.cn/bm_229/qjw/zwgk_97157/fdzdgknr_97159/zcwj/202505/t20250522_14646345.html' } },
  { q: '江北区 → 两江新区', st: '区划调整', y26: { t: '两江新区 2026 招生方案', u: 'http://www.ljxq.gov.cn/bm/qjw/zwgk/zfxxgkml/zcwj/qtwj/202605/t20260526_15703553.html' }, y25: { t: '2025 报名咨询信息表', u: 'http://www.cq.gov.cn/zwgk/zfxxgkml/zdlyxxgk/jy1/jyzt/zsrx/zxdh/202505/t20250513_14606452.html' } },
  { q: '沙坪坝区', st: '直链', y26: { t: '2026 招生实施方案', u: 'http://www.cqspb.gov.cn/bm/qjw/jczwgk/ywjy/zsgl/zszc/202605/t20260520_15691257.html' }, y25: { t: '2025 招生实施方案', u: 'http://www.cqspb.gov.cn/bm/qjw/jczwgk/ywjy/zsgl/zszc/202505/t20250520_14642177.html' } },
  { q: '九龙坡区', st: '栏目入口', y26: { t: '2026 招生计划（区教委）', u: 'https://cqjlp.gov.cn/bmjz/qzfbm_97119/qjw_97713/zwgk_97124/gkml/jczwgk/ywjy/zsgl/zsjh/202605/t20260521_15694885.html' }, y25: { t: '划片公告目录页', u: 'https://cqjlp.gov.cn/bmjz/qzfbm_97119/qjw_97713/zwgk_97124/gkml/?id=236158' } },
  { q: '南岸区', st: '直链', y26: { t: '2026 方案摘要 + 小学划片范围', u: 'https://www.cq.gov.cn/ywdt/zwhd/qxdt/202605/t20260527_15707169.html' }, y25: { t: '招生入学栏目（原文未定位）', u: 'https://www.cqna.gov.cn/bm/qjw/zwgk_59968/zfxxgkml1/jczwgk4/ywjy_141404/zsgl/zszc' } },
  { q: '北碚区', st: '直链', y26: { t: '2026 报名操作指南（区教委）', u: 'https://www.beibei.gov.cn/bm/qjw/zwgk_58246/zfxxgkml/jczfxxgk/ywjyly_134078/zsgl/zsfw/202605/t20260513_15674567.html' }, y25: { t: '2025 报名操作指南', u: 'https://www.beibei.gov.cn/bm/qjw/zwgk_58246/zfxxgkml/jczfxxgk/ywjyly_134078/zsgl/zszc/202505/t20250529_14667666.html' } },
  { q: '渝北区 → 两江新区', st: '区划调整', y26: { t: '两江新区 2026 招生方案', u: 'https://www.ljxq.gov.cn/bm/qjw/zwgk/zfxxgkml/jczwgk/ywjylyxxgk/zsgl/zszc/202605/t20260521_15694853.html' }, y25: { t: '市级 2025 招生专题', u: 'https://www.cq.gov.cn/zwgk/zfxxgkml/zdlyxxgk/jy1/jyzt/zsrx/' } },
  { q: '巴南区', st: '直链', y26: { t: '2026 招生方案（区教委）', u: 'https://www.cqbn.gov.cn/bmjz/bm/jw/zwgk_88657/zfxxgkml/jczwgk/ywjy/zsgl/zszc/202605/t20260519_15685509.html' }, y25: { t: '2025 招生方案', u: 'https://www.cqbn.gov.cn/bmjz/bm/jw/zwgk_88657/zfxxgkml/jczwgk/ywjy/zsgl/zszc/202505/t20250520_14640804.html' } },
  { q: '大渡口区', st: '栏目入口', y26: { t: '招生政策栏目（2026 问答可见）', u: 'https://www.ddk.gov.cn/bm/qjw/zwgk_56674/jwjczwgk/yiwujiaoyulingyu0408/jwzsgl' }, y25: { t: '2025 非户籍类政策问答', u: 'https://www.ddk.gov.cn/bm/qjw/zwgk_56674/jwjczwgk/yiwujiaoyulingyu0408/jwzsgl/jwzszc/202506/t20250605_14687382.html' } }
];
var PQ_ST = { '直链': 'ok', '区划调整': 'br', '栏目入口': 'pend' };
function pqRender(){
  var box = document.getElementById('pq-guide');
  if(!box) return;
  box.innerHTML = '<div class="cmp-note" style="margin-bottom:12px"><b>怎么用</b>　点开你所在区的当年「招生入学通知/划片公告」原文，查「招生服务区域」章节核对自己小区是否在片内；<b>划片逐年可能调整</b>，建议同时点开 2025 年备份对照。原江北区、渝北区已并入两江新区（2026-01 挂牌），2026 年招生以两江新区文件为准。链接于 2026-10-30 逐条实测打开。</div>'
    + '<div class="pq-grid">' + PQ_ROWS.map(function(r){
      var badge = PQ_ST[r.st] || 'pend';
      return '<div class="pq-card"><div class="pq-head"><b>' + esc(r.q) + '</b><span class="pq-st st-' + badge + '">' + esc(r.st) + '</span></div>'
        + '<a href="' + esc(r.y26.u) + '" target="_blank" rel="noopener">2026 · ' + esc(r.y26.t) + ' ↗</a>'
        + (r.y25 ? '<a href="' + esc(r.y25.u) + '" target="_blank" rel="noopener">2025 · ' + esc(r.y25.t) + ' ↗</a>' : '')
        + '</div>';
    }).join('') + '</div>'
    + '<p class="dx-tnote">市级依据：市教委《2026 年义务教育招生入学工作的通知》<a class="art-link" href="https://jw.cq.gov.cn/zwgk_209/fdzdgknr/ywjy/zsgl/zszc/202606/t20260612_15750472.html" target="_blank" rel="noopener">原文 ↗</a>；区划调整背景：渝府发〔2025〕15号（本站首页亦有提醒）。全部链接 2026-10-30 实测；两江新区划片另有官方查询指引（ljxq.gov.cn）。</p>';
}
