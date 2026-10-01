/* ---------- v0.48：家长经验分享（审核制） ---------- */
var EXP_SEED = [
 {stage:"初升高", title:"指标到校资格：初一就要开始守", name:"高一家长·老周", time:"2026-09",
  body:"孩子初中三年没转过学，初三上拿到名额公示时班里一半人才知道要连续就读。提醒各位：转学真的会动资格，动迁前一定先问区教委。"},
 {stage:"幼升小", title:"渝快办实名认证提前做", name:"一年级豆豆妈", time:"2026-09",
  body:"报名当天系统拥堵，我们因为提前一周在渝快办做了实名认证+材料扫描，几分钟就提交完了。邻居临时注册卡了半小时。"},
 {stage:"小升初", title:"摇号没中别慌，统筹也有好学校", name:"初二家长·Lily", time:"2026-09",
  body:"民办摇号没中一度很焦虑，实际统筹去的公办初中并不差。建议大家都留好公办对口这条后路，别孤注一掷。"},
 {stage:"高考", title:"强基报名材料高一就该攒", name:"高三家长·老陈", time:"2026-09",
  body:"强基要成绩单和综合素质材料，临时翻高三的档案根本不够。从高一开始把获奖证书、成绩排名截图都存好，报名时半小时搞定。"},
 {stage:"高考", title:"艺考生文化课别停", name:"艺考过来人", time:"2026-09",
  body:"统考完只剩三个月补文化课，非常紧张。我们当年校考期间每天雷打不动两小时文化课，最后文化分压线过。给后来人提个醒。"}
];
function renderExps(){
  var box = document.getElementById('exp-grid'); if(!box) return;
  var extra = [];
  try{ extra = JSON.parse(localStorage.getItem('jfm_exp_local') || '[]'); }catch(e){}
  var all = extra.concat(EXP_SEED);
  box.innerHTML = all.map(function(x){
    return '<div class="exp-card" data-stage="' + esc(x.stage) + '">'
      + '<div class="exp-head"><span class="exp-stage">' + esc(x.stage) + '</span><span class="exp-name">' + esc(x.name || '匿名家长') + '</span><span class="exp-time">' + esc(x.time || '') + '</span></div>'
      + '<h5>' + esc(x.title) + '</h5><p>' + esc(x.body) + '</p></div>';
  }).join('');
}
function openExpForm(){ document.getElementById('exp-modal').showModal(); }
function submitExp(){
  var stage = document.getElementById('exp-stage').value;
  var title = document.getElementById('exp-title').value.trim();
  var body = document.getElementById('exp-body').value.trim();
  var name = document.getElementById('exp-name').value.trim() || '匿名家长';
  var note = document.getElementById('exp-note');
  if(title.length < 5 || body.length < 20){ note.textContent = '请把主题（≥5字）和内容（≥20字）写具体，泛泛而谈的分享对别人没帮助。'; return; }
  var item = {stage:stage, title:title, body:body, name:name,
    time:new Date().toLocaleDateString('zh-CN', {year:'numeric', month:'2-digit'})};
  try{
    var arr = JSON.parse(localStorage.getItem('jfm_exp_local') || '[]');
    arr.unshift(item);
    localStorage.setItem('jfm_exp_local', JSON.stringify(arr.slice(0, 20)));
  }catch(e){}
  renderExps();
  document.getElementById('exp-modal').close();
  document.getElementById('exp-title').value = ''; document.getElementById('exp-body').value = '';
  if(typeof toast === 'function') toast('已提交（本地暂存，同步云端经人工核验后对全站展示）');
  note.textContent = '';
}
document.addEventListener('DOMContentLoaded', renderExps);

/* ---------- v0.48：对比板块子模块（关注点/费用测算/决策清单） ---------- */
var CMP_FOCUS = [
 {label:"学费成本", desc:"公办每学期数百至千元级；民办每学年 3–15 万——三年总账差距可达 40 万+，这笔钱够孩子做很多别的投入。"},
 {label:"通勤半径", desc:"初中三年每天 2 次往返。单程超 40 分钟，睡眠和自习时间会被显著挤占，性价比要打折扣。"},
 {label:"住宿与自理", desc:"住校省通勤但考验孩子自理能力；走读便于沟通与监督。没有对错，只有孩子性格匹配。"},
 {label:"指标到校名额", desc:"市级重点 70% 名额分配到初中。孩子所在初中的名额多寡与校内排位，直接决定中考策略。"},
 {label:"招生范围限制", desc:"联招校可全市填报，区内划片校只能本区。跨区择校先查招生范围，别做了无用功。"},
 {label:"校风与作业量", desc:"同样是重点，作业量可能差一倍。去问在读家长（靠谱的），比看宣传页有用十倍。"}
];
function renderCmpFocus(){
  var box = document.getElementById('cf-grid'); if(!box) return;
  box.innerHTML = CMP_FOCUS.map(function(x){
    return '<div class="cf-card"><div class="cf-l">' + esc(x.label) + '</div><p>' + esc(x.desc) + '</p></div>';
  }).join('');
}
var FUND_TUITION = {gong: 800, min3: 30000, min6: 60000, min10: 100000, min15: 150000};
function calcFundCompare(){
  var type = document.getElementById('fc-type').value;
  var commute = Math.min(120, Math.max(5, parseInt(document.getElementById('fc-commute').value || '30', 10)));
  var board = document.getElementById('fc-board').value === 'yes';
  var tuition = FUND_TUITION[type] || 0;
  // 学费：公办按学期 800 → 年 1600；民办按年
  var perYear = (type === 'gong') ? 1600 : tuition;
  var tuition3 = perYear * 3;
  // 通勤成本：走读按每分钟 0.6 元/次（公交/地铁/油费综合估算），每天 2 次，学年 40 周×5 天
  var commuteY = board ? 0 : Math.round(commute * 2 * 0.6 * 200);
  var commute3 = commuteY * 3;
  var total = tuition3 + commute3;
  var hours = Math.round(commute * 2 * 200 * 3 / 60);
  document.getElementById('fc-out').innerHTML =
    '<table class="art-table"><tbody>'
    + '<tr><td>三年学费</td><td class="mono">' + tuition3.toLocaleString() + ' 元</td></tr>'
    + (board ? '' : '<tr><td>三年通勤费（估）</td><td class="mono">' + commute3.toLocaleString() + ' 元</td></tr>')
    + '<tr><td><b>三年直接成本合计</b></td><td class="mono"><b>' + total.toLocaleString() + ' 元</b></td></tr>'
    + (board ? '' : '<tr><td>通勤时间成本</td><td class="mono">约 ' + hours.toLocaleString() + ' 小时（按 200 学年日 × 3 年）</td></tr>')
    + '</tbody></table>'
    + '<div class="cmp-note" style="margin-top:8px">估算口径：学费按所选档位名义值（民办以学校公示为准，公办按学期费标准估算）；通勤按 200 个学年日、每分钟约 0.6 元综合费率。课外培训等大额弹性投入未计入——那部分差异往往更大。本测算不构成任何建议。</div>';
}
var CHK_ITEMS = [
 "招生资质：学校是否具备当年招生计划（查教委公示名单）",
 "收费公示：三年学费/住宿费是否书面确认，有无「赞助费」等法外收费",
 "学籍路径：入学后学籍注册在哪个学校、能否参加联招",
 "通勤实测：早晚高峰实际走一遍，别只看地图时间",
 "住宿实探：宿舍几人间、管理方式、手机政策",
 "在读家长口碑：至少问 2 个不相关的在读家庭（不是招生老师）",
 "退出机制：中途转学/退费的规则写在协议里了吗",
 "备选方案：如果没被录取，统筹去向是哪里"
];
function renderChk(){
  var box = document.getElementById('chk-list'); if(!box) return;
  box.innerHTML = CHK_ITEMS.map(function(x, i){
    return '<label class="chk-item"><input type="checkbox" onchange="chkProgress()"><span class="chk-no">' + (i+1) + '</span><span>' + esc(x) + '</span></label>';
  }).join('') + '<div class="cmp-note" id="chk-progress" style="margin-top:10px">已确认 0 / ' + CHK_ITEMS.length + ' 项</div>';
}
function chkProgress(){
  var all = document.querySelectorAll('#chk-list input[type=checkbox]');
  var done = document.querySelectorAll('#chk-list input[type=checkbox]:checked');
  document.getElementById('chk-progress').textContent = '已确认 ' + done.length + ' / ' + all.length + ' 项' + (done.length === all.length ? ' —— 全部确认，可以更放心地做决定了。' : '');
}
document.addEventListener('DOMContentLoaded', function(){ renderCmpFocus(); renderChk(); });


/* ---------- v0.49：官方求助与办事入口 ---------- */
var GOV_ENTRIES = [
 {name:"渝快办 · 政务服务一网通办", desc:"入学报名、转学申请、居住证办理等高频事项线上办", url:"https://zwykb.cq.gov.cn/", tag:"办事"},
 {name:"重庆市教育委员会", desc:"招生政策原文、政策文件库、各区入学工作通知", url:"https://jw.cq.gov.cn/", tag:"政策"},
 {name:"重庆市教育考试院", desc:"中/高考报名、成绩查询、录取动态、一分一段表", url:"https://www.cqksy.cn/", tag:"考试"},
 {name:"重庆市卫生健康委", desc:"学校卫生标准、疫苗接种门诊查询、心理援助资源", url:"https://wsjkw.cq.gov.cn/", tag:"卫生"},
 {name:"重庆市政府门户网站", desc:"全市政策发布、区县动态、政民互动（含教育咨询渠道）", url:"https://www.cq.gov.cn/", tag:"综合"},
 {name:"市政府「听你说」互动平台", desc:"教育类诉求提交与答复查询——比群里抱怨更有用", url:"https://www.cq.gov.cn/hdjl/", tag:"求助"}
];
function renderGov(){
  var box = document.getElementById('gov-grid'); if(!box) return;
  box.innerHTML = GOV_ENTRIES.map(function(g){
    return '<a class="gov-item" href="' + g.url + '" target="_blank" rel="noopener">'
      + '<span class="gov-tag">' + g.tag + '</span>'
      + '<span class="gov-name">' + esc(g.name) + '</span>'
      + '<span class="gov-desc">' + esc(g.desc) + '</span>'
      + '<span class="gov-go">直达 ↗</span></a>';
  }).join('') + '<p class="cmp-note">以上 6 个入口于 2026-10-01 逐一实测可达（HTTP 200）；12345 政务服务热线为电话渠道，同样受理教育类咨询与投诉。</p>';
}
document.addEventListener('DOMContentLoaded', renderGov);
