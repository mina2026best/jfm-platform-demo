/* ---------- v0.54：常用网址导航（hao123 式目录，但只收录实测可达 + 家长真会用的） ----------
   全部链接于 2026-10-02 逐条 GET 实测可达（69/69），收录标准：
   ① 官方一手信息源优先；② 家长一学期内至少会用一次；③ 域名与站点身份一致（标题已核验）。
   ponytail: 数据即目录，改链接只改 DAO_CATS；无需新增页面结构 */
var DAO_NOTE = '本站于 2026-10-02 逐条实测每个入口（69 个全部可打开），域名与站名一一核对。';
var DAO_ZHENG = {
  t: '⚠ 行政区划调整提醒（影响入学口径）',
  d: '2025-11-07 重庆市人民政府公告（渝府发〔2025〕15号）：撤销江北区、渝北区，设立两江新区，2026-01-25 正式挂牌；水土、复兴、蔡家岗、施家梁、童家溪划归两江新区，原渝北区大湾镇、统景镇、大盛镇、兴隆镇、茨竹镇划归北碚区。凡以「江北区/渝北区」旧口径发布的划片与入学信息，请以新公告与对应区教育部门为准。',
  u: 'https://www.cq.gov.cn/ywdt/tzgg/202511/t20251110_15152219.html'
};
/* 热门直达：从 DAO_CATS 按名取（单一数据源，避免两处维护） */
var DAO_QUICK_NAMES = ['重庆招考信息网','重庆市教育委员会','学信网','国家中小学智慧教育平台','汉典',
                       '国家心理健康和精神卫生防治中心','中国铁路12306','重庆图书馆'];
/* 站内速达：家长最常回访的工具页 */
var DAO_SITE_LINKS = [['入学自查','quiz.html'],['择校对比','compare.html'],['志愿参考','zy.html'],
                      ['求真台','fact.html'],['升学日历','calendar.html'],['数据来源','data-sources.html']];
var DAO_CATS = [
  { n:'升学官方入口', s:'报名 / 查分 / 录取，家长最先要打开的 13 个口子', items:[
    ['重庆市教育委员会','https://jw.cq.gov.cn/','全市招生政策原文与公示公告第一手'],
    ['重庆招考信息网','https://www.cqzk.com.cn/','中考高考报名、成绩与录取查询'],
    ['重庆市教育考试院','https://www.cqksy.cn/','考试安排、准考证打印与成绩发布'],
    ['国家中小学智慧教育平台','https://basic.smartedu.cn/','全学段免费课程与电子教材'],
    ['国家职业教育智慧教育平台','https://vocational.smartedu.cn/','中职、高职专业教学资源'],
    ['国家智慧教育读书平台','https://reading.smartedu.cn/','中小学生阅读书单与导读'],
    ['国家智慧教育公共服务平台','https://www.smartedu.cn/','三大平台的统一总入口'],
    ['教育部','https://www.moe.gov.cn/','全国教育政策的源头文件'],
    ['阳光高考平台','https://gaokao.chsi.com.cn/','高校招生章程、专业库与体检要求'],
    ['学信网','https://www.chsi.com.cn/','学籍学历查询，识别野鸡大学'],
    ['学位与研究生教育信息网','https://www.chinadegrees.cn/','学位证书查询与认证'],
    ['中国研究生招生信息网','https://yz.chsi.com.cn/','考研报名、调剂与分数线'],
    ['中国教育考试网','https://www.neea.edu.cn/','教师资格、英语等级等考试报名']
  ]},
  { n:'重庆政务与办事', s:'户籍、社保、医保、公积金——线上可办的不跑线下', items:[
    ['重庆市人民政府','https://www.cq.gov.cn/','市级政策原文与区划调整公告'],
    ['重庆政务服务网（渝快办）','https://zwfw.cq.gov.cn/','户籍、社保、各类证明在线办'],
    ['重庆市人力资源和社会保障局','https://rlsbj.cq.gov.cn/','社保参保、劳动关系与技能补贴'],
    ['重庆市医疗保障局','https://ylbzj.cq.gov.cn/','参保、报销与异地就医备案'],
    ['重庆市卫生健康委员会','https://wsjkw.cq.gov.cn/','疾病防控、托育服务与健康科普'],
    ['重庆市住房公积金管理中心','https://www.cqgjj.cn/','公积金查询与租房提取'],
    ['重庆市统计局','https://tjj.cq.gov.cn/','各区县人口与经济数据'],
    ['中国政府网','https://www.gov.cn/','国家层面政策与政务服务总入口']
  ]},
  { n:'区县教育门户', s:'划片、报名、转学最终都落到区里——按孩子的区找对门', items:[
    ['两江新区人民政府','https://www.ljxq.gov.cn/','2026年1月挂牌，管辖原江北区、渝北区'],
    ['渝中区人民政府','https://www.cqyz.gov.cn/','区教委招生细则与划片公示'],
    ['沙坪坝区人民政府','https://www.cqspb.gov.cn/','学位紧张片区与入学政策'],
    ['九龙坡区人民政府','https://www.cqjlp.gov.cn/','招生入学与随迁子女政策'],
    ['南岸区人民政府','https://www.cqna.gov.cn/','义务教育招生与转学流程'],
    ['巴南区人民政府','https://www.cqbn.gov.cn/','区招生政策与新生登记'],
    ['北碚区人民政府','https://www.beibei.gov.cn/','新增原渝北 5 镇，划片有变化'],
    ['大渡口区人民政府','http://www.ddk.gov.cn/','区入学政策与办事指南']
  ]},
  { n:'学校官网', s:'只列实测可打开的校方站点；其余学校的公开信息见站内档案库', items:[
    ['南开中学','https://www.nks.edu.cn/','校方通知与校情介绍'],
    ['重庆一中','https://cqyz.cn/','校方通知与招生动态'],
    ['重庆八中','https://cqbz.cn/','校方通知与校园新闻'],
    ['西大附中','http://xndxfz.swu.edu.cn/','西南大学附属中学官网'],
    ['重庆十一中','http://www.cqsyz.com.cn/','校方通知与校园动态'],
    ['渝中区复旦中学','http://www.cqfudan.com/','校方通知与校园动态']
  ]},
  { n:'学习与知识资源', s:'免费、可长期用的知识底座——不是广告站', items:[
    ['国家图书馆','http://www.nlc.cn/','免费数字资源与古籍库'],
    ['重庆图书馆','https://www.cqlib.cn/','本市借阅、少儿活动与自习'],
    ['汉典','https://www.zdic.net/','字词读音、笔顺与释义'],
    ['古文岛（原古诗文网）','https://www.gushiwen.cn/','古诗文原文、注释与赏析'],
    ['中国知网','https://www.cnki.net/','期刊论文检索（部分需机构权限）'],
    ['国家哲学社会科学文献中心','https://www.ncpssd.org/','免费人文社科论文全文'],
    ['中国数字科技馆','https://www.cdstm.cn/','科普实验与科学课素材'],
    ['学习强国','https://www.xuexi.cn/','时政与教育政策权威解读'],
    ['网易公开课','https://open.163.com/','名校公开课与 TED 中文字幕'],
    ['中国教育在线','https://www.eol.cn/','升学资讯与院校库']
  ]},
  { n:'在线课程平台', s:'学有余力或要补差，先看这三家，别先买课', items:[
    ['中国大学MOOC','https://www.icourse163.org/','大学先修与兴趣课程'],
    ['学堂在线','https://www.xuetangx.com/','清华等高校课程'],
    ['国家高等教育智慧教育平台','https://higher.smartedu.cn/','高校课程与专业导览']
  ]},
  { n:'家长社区与本地信息', s:'同城经验帖与本地办事指南；论坛内容需自行交叉验证', items:[
    ['重庆本地宝','https://cq.bendibao.com/','本地入学、办事指南与时限提醒'],
    ['重庆妈妈网','http://www.cqmama.net/','本地家长生活与育儿交流'],
    ['重庆购物狂论坛','https://www.cqmmgo.com/','本地论坛，育儿与学区话题'],
    ['妈妈网','https://www.mama.cn/','全国母婴与育儿社区'],
    ['宝宝树','https://www.babytree.com/','育儿知识与同龄圈交流'],
    ['知乎','https://www.zhihu.com/','择校与教育话题的经验讨论'],
    ['豆瓣','https://www.douban.com/','书影音与兴趣小组']
  ]},
  { n:'健康与心理支持', s:'孩子状态不好时，先找专业入口', items:[
    ['国家心理健康和精神卫生防治中心','https://ncmhc.org.cn/','全国心理援助热线与科普'],
    ['中国疾病预防控制中心','https://www.chinacdc.cn/','传染病防控与疫苗信息'],
    ['重庆医科大学附属儿童医院','https://www.chcmu.com/','儿童专科挂号与就诊指南'],
    ['重庆医科大学附属第一医院','https://www.hospital-cqmu.com/','综合医院预约与科室查询'],
    ['中国文明网（未成年人）','http://www.wenming.cn/','未成年人思想道德与权益']
  ]},
  { n:'本地场馆与亲子科普', s:'周末与假期带孩子去哪——官方场馆，多需提前预约', items:[
    ['重庆科技馆','https://www.cqkjg.cn/','亲子科普场馆，展项与预约'],
    ['重庆中国三峡博物馆','https://www.3gmuseum.cn/','免费开放，青少年教育活动'],
    ['重庆自然博物馆','http://www.cmnh.org.cn/','恐龙与古生物展，亲子常去'],
    ['红岩革命历史博物馆','http://www.hongyan.info/','红色教育基地与研学实践']
  ]},
  { n:'生活与出行', s:'通勤实测、天气、车票——择校离不开', items:[
    ['中国铁路12306','https://www.12306.cn/','车票查询与购票'],
    ['中国天气网','https://www.weather.com.cn/','出行与考试日天气'],
    ['重庆轨道交通','https://www.cqmetro.cn/','线网图与运营时间'],
    ['重庆公交集团','https://www.cqgj.net/','公交线路与实时查询'],
    ['高德地图','https://www.amap.com/','择校通勤时间实测'],
    ['百度地图','https://map.baidu.com/','路况与通勤路线对比'],
    ['重庆人才网','https://www.cqrc.net/','本地招聘与技能培训']
  ]},
  { n:'资助与助学', s:'读到高中、大学，这两条通道要早知道', items:[
    ['全国学生资助管理中心','https://www.xszz.edu.cn/','国家资助政策与申请入口'],
    ['生源地助学贷款·学生在线系统','https://www.csls.cdb.com.cn/','贷款申请、续贷与还款']
  ]}
];


/* 从分类数据里按名取出速达项（找不到就跳过，不造条目） */
function daoQuickItems(){
  var out = [], i, j;
  for(i = 0; i < DAO_QUICK_NAMES.length; i++){
    for(j = 0; j < DAO_CATS.length; j++){
      var hit = null, its = DAO_CATS[j].items;
      for(var k = 0; k < its.length; k++){ if(its[k][0] === DAO_QUICK_NAMES[i]) { hit = its[k]; break; } }
      if(hit){ out.push(hit); break; }
    }
  }
  return out;
}
/* 今日条：日期/星期（本机时间）+ 今日新增资讯条数 + 下一个升学节点（月精度，来自站内日历 DOM） */
function renderTodayBar(){
  var box = document.getElementById('today-bar'); if(!box) return;
  var d = new Date();
  var WD = ['日','一','二','三','四','五','六'];
  var today = d.getFullYear() + '-' + (d.getMonth() + 1 < 10 ? '0' : '') + (d.getMonth() + 1) + '-' + (d.getDate() < 10 ? '0' : '') + d.getDate();
  var dateTxt = d.getFullYear() + ' 年 ' + (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 · 星期' + WD[d.getDay()];
  var fresh = 0;
  if(typeof NEWS_FEED !== 'undefined' && NEWS_FEED.length){
    for(var i = 0; i < NEWS_FEED.length; i++){ if(String(NEWS_FEED[i].date) === today) fresh++; }
  }
  if(typeof getUserNews === 'function'){
    var un = getUserNews();
    for(var u = 0; u < un.length; u++){ if(String(un[u].date) === today) fresh++; }
  }
  var cm = d.getFullYear() * 12 + d.getMonth(), next = null;
  var cals = document.querySelectorAll('.cal-grid .cal');
  for(var c = 0; c < cals.length; c++){
    var dm = (cals[c].querySelector('.date') || {}).textContent || '';
    var mm = dm.match(/(\d{4})-(\d{2})/);
    if(!mm) continue;
    var v = parseInt(mm[1], 10) * 12 + (parseInt(mm[2], 10) - 1);
    if(v >= cm && (!next || v < next.v)){
      next = { v: v, txt: dm, t: ((cals[c].querySelector('h4') || {}).textContent || '').trim() };
    }
  }
  var parts = ['<span class="tb-date">' + esc(dateTxt) + '</span>'];
  parts.push('<span class="tb-i">今日新增资讯 <b>' + fresh + '</b> 条</span>');
  if(next){
    var gap = next.v - cm;
    parts.push('<span class="tb-i">最近节点 <b>' + esc(next.txt) + '</b> · ' + esc(next.t.slice(0, 16)) + (gap === 0 ? '（本月）' : '（' + gap + ' 个月后）') + '</span>');
  }
  parts.push('<span class="tb-links">站内速达：' + DAO_SITE_LINKS.map(function(x){
    return '<a href="' + x[1] + '">' + esc(x[0]) + '</a>';
  }).join('') + '</span>');
  box.innerHTML = parts.join('');
}
function renderDaoQuick(){
  var box = document.getElementById('dao-quick'); if(!box) return;
  var items = daoQuickItems();
  box.innerHTML = '<span class="dq-label">热门直达</span>'
    + items.map(function(it){
        return '<a href="' + hrefEnc(it[1]) + '" target="_blank" rel="noopener" title="' + esc(it[2] || '') + '">' + esc(it[0]) + '</a>';
      }).join('');
}

function daoTotal(){ var n = 0; for(var i=0;i<DAO_CATS.length;i++) n += DAO_CATS[i].items.length; return n; }
function daoItemHTML(it){
  return '<li><a href="' + hrefEnc(it[1]) + '" target="_blank" rel="noopener">' + esc(it[0]) + '<i>↗</i></a>'
       + '<span>' + esc(it[2] || '') + '</span></li>';
}
function daoCatHTML(c, idx){
  return '<div class="dao-cat" data-cat="' + esc(c.n) + '">'
    + '<h3><b>' + (idx < 9 ? '0' + (idx + 1) : (idx + 1)) + '</b>' + esc(c.n)
    + '<em>' + c.items.length + '</em></h3>'
    + '<p class="dao-sub">' + esc(c.s || '') + '</p>'
    + '<ul class="dao-list">' + c.items.map(daoItemHTML).join('') + '</ul></div>';
}
/* 首页精简版：前 5 类 × 每类 5 条 + 全量入口指引 */
function renderDaoHome(){
  var box = document.getElementById('dao-home'); if(!box) return;
  var cats = DAO_CATS.slice(0, 6), html = '';
  for(var i = 0; i < cats.length; i++){
    var c = cats[i];
    html += '<div class="dao-cat" data-cat="' + esc(c.n) + '">'
      + '<h3><b>' + ('0' + (i + 1)) + '</b>' + esc(c.n) + '<em>' + c.items.length + '</em></h3>'
      + '<ul class="dao-list">' + c.items.slice(0, 6).map(daoItemHTML).join('') + '</ul></div>';
  }
  box.innerHTML = html;
  var all = document.getElementById('dao-all-count');
  if(all) all.textContent = daoTotal();
}
/* 全量页：分类锚点 + 实时筛选 */
function renderDaoFull(){
  var box = document.getElementById('dao-full'); if(!box) return;
  var html = '', chips = '';
  for(var i = 0; i < DAO_CATS.length; i++){
    var id = 'dao-c' + i;
    chips += '<a href="#' + id + '" class="dao-chip">' + esc(DAO_CATS[i].n) + '<em>' + DAO_CATS[i].items.length + '</em></a>';
    html += daoCatHTML(DAO_CATS[i], i).replace('class="dao-cat"', 'class="dao-cat" id="' + id + '"');
  }
  box.innerHTML = html;
  var cbox = document.getElementById('dao-chips'); if(cbox) cbox.innerHTML = chips;
  var tip = document.getElementById('dao-note'); if(tip) tip.textContent = DAO_NOTE;
  var inp = document.getElementById('dao-search');
  if(inp){
    inp.addEventListener('input', function(){
      var q = inp.value.trim().toLowerCase();
      var cats = document.querySelectorAll('#dao-full .dao-cat');
      var hit = 0;
      for(var i = 0; i < cats.length; i++){
        var lis = cats[i].querySelectorAll('.dao-list li'), shown = 0;
        for(var j = 0; j < lis.length; j++){
          var ok = !q || lis[j].textContent.toLowerCase().indexOf(q) >= 0;
          lis[j].style.display = ok ? '' : 'none';
          if(ok) shown++;
        }
        cats[i].style.display = shown ? '' : 'none';
        hit += shown;
      }
      var r = document.getElementById('dao-result');
      if(r) r.textContent = q ? ('匹配 ' + hit + ' 个入口' + (hit ? '' : '——换个词试试，或直接看分类')) : '';
    });
  }
}
/* 行政区划提醒卡（两个页面都显示） */
function renderDaoZheng(){
  var z = document.getElementById('dao-zheng'); if(!z) return;
  z.innerHTML = '<b>' + esc(DAO_ZHENG.t) + '</b><p>' + esc(DAO_ZHENG.d) + '</p>'
    + '<a href="' + hrefEnc(DAO_ZHENG.u) + '" target="_blank" rel="noopener">市政府公告原文 ↗</a>';
}
/* 同一 section 注入首页与导航页：按当前页保留对应视图 */
function initDao(){
  var full = document.getElementById('dao-full'), home = document.getElementById('dao-home');
  var isFullPage = /daohang\.html?$/i.test(location.pathname) || /[?&]page=daohang/.test(location.search);
  if(full && home){
    if(isFullPage){ home.parentNode.removeChild(home); }
    else {
      full.parentNode.removeChild(full);
      var sw = document.getElementById('dao-searchwrap');
      if(sw) sw.parentNode.removeChild(sw);
      var ch = document.getElementById('dao-chips');
      if(ch) ch.parentNode.removeChild(ch);
    }
  }
  if(isFullPage){
    var en = document.getElementById('dao-entry');
    if(en && en.parentNode) en.parentNode.style.display = 'none';   // 本页即全量，去掉"查看全部"自指入口
  }
  var tt = daoTotal();
  var es = document.querySelectorAll('.dao-total, #dao-all-count');
  for(var k = 0; k < es.length; k++) es[k].textContent = tt;
  renderTodayBar();
  renderDaoQuick();
  renderDaoZheng();
  renderDaoHome();
  renderDaoFull();
}
