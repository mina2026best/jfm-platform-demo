/* ---------- v0.80：家长论坛（版块 × 区县 · 本机存储演示） ---------- */
/* 数据说明：种子帖为编辑整理的示例帖（标注「示例」），用户发帖保存在 localStorage（jfm_forum_threads）。
   正式版接入账号后端后，仅替换 load/save 两层，UI 与数据结构不变。 */
var FORUM_BOARDS = [
  { key: 'xsx',   name: '幼升小',   desc: '划片、落户年限、学位占用、入学材料' },
  { key: 'xsc',   name: '小升初',   desc: '对口与摇号、民办选择、跨区就读' },
  { key: 'csg',   name: '初升高',   desc: '指标到校、联招志愿、择校对比' },
  { key: 'gk',    name: '高考志愿', desc: '位次换算、专业方向、批次策略' },
  { key: 'life',  name: '陪读生活', desc: '陪读房、通勤、课后安排与家长心理' },
  { key: 'meta',  name: '站务反馈', desc: '功能建议、内容纠错、问题求助' }
];
var FORUM_SEED = [
  { id: 'seed-1', board: 'csg', title: '指标到校的「校内排队」到底怎么排？', district: '沙坪坝', nick: '初三家长', date: '2026-10-08', likes: 21, seed: true,
    body: '名额分到本校后按什么顺序定？校内排名看几次考试？有了解当年细则的家长吗——我们已核对渝教基函指标到校口径，主要差区县细则的执行细节。',
    replies: [{ nick: '值班编辑', date: '2026-10-08', body: '分配规则以各区当年实施细则为准，本站政策库已收录市级口径原文；区县细则建议同步向所在区教委核实。' }] },
  { id: 'seed-2', board: 'xsc', title: '两次派位之间还能改志愿吗？', district: '渝北', nick: '小六家长', date: '2026-10-07', likes: 14, seed: true,
    body: '民办摇号未中回公办统筹，中间的时间窗怎么安排材料双轨准备？',
    replies: [] },
  { id: 'seed-3', board: 'life', title: '南岸弹子石片区陪读房怎么选？求同区家长交流', district: '南岸', nick: '高一家长', date: '2026-10-06', likes: 9, seed: true,
    body: '已看了 3 个小区，通勤与价格各有取舍，想听听已入住家庭的实测。',
    replies: [{ nick: '高二家长', date: '2026-10-06', body: '优先核算通勤时间而不是直线距离，早高峰差异很大；租房合同注意与房东约定学位无关事项。' }] },
  { id: 'seed-4', board: 'xsx', title: '「长幼随学」申请实测：3 个工作日受理', district: '江北', nick: '二年级家长', date: '2026-10-05', likes: 17, seed: true,
    body: '把申请通道、材料清单和受理时间线完整记录了一遍，供参考。',
    replies: [] },
  { id: 'seed-5', board: 'gk', title: '用官方一分一段换算位次后，志愿梯度怎么留？', district: '沙坪坝', nick: '高三家长', date: '2026-10-04', likes: 12, seed: true,
    body: '用本站位次换算核对了全市位次，接下来冲稳保的比例想听听过来人意见。',
    replies: [] }
];
var forumBoard = 'all';
var forumSort = 'new';
function getForumThreads(){
  try{ return JSON.parse(localStorage.getItem('jfm_forum_threads') || '[]'); }catch(e){ return []; }
}
function saveForumThreads(l){ try{ localStorage.setItem('jfm_forum_threads', JSON.stringify(l)); }catch(e){} }
function forumAllThreads(){
  return FORUM_SEED.map(function(x){ var o={}; for(var k in x) o[k]=x[k]; return o; }).concat(getForumThreads());
}
function boardName(key){
  for(var i=0;i<FORUM_BOARDS.length;i++){ if(FORUM_BOARDS[i].key===key) return FORUM_BOARDS[i].name; }
  return '其他';
}
function setForumBoard(k){ forumBoard = k; renderForumBoards(); renderForumList(); }
function setForumSort(k){
  forumSort = k;
  var box = document.getElementById('forum-sort'); if(!box) return;
  var btns = box.querySelectorAll('.ff');
  for(var i=0;i<btns.length;i++){ btns[i].classList.toggle('on', btns[i].getAttribute('data-sort')===k); }
  renderForumList();
}
function forumReplyCount(t){ return (t.replies || []).length; }
function renderForumBoards(){
  var box = document.getElementById('forum-boards'); if(!box) return;
  var all = forumAllThreads();
  var html = '<button class="fb' + (forumBoard==='all'?' on':'') + '" onclick="setForumBoard(\'all\')">全部讨论<span>' + all.length + '</span></button>';
  FORUM_BOARDS.forEach(function(b){
    var n = all.filter(function(t){ return t.board===b.key; }).length;
    html += '<button class="fb' + (forumBoard===b.key?' on':'') + '" onclick="setForumBoard(\'' + b.key + '\')" title="' + b.desc + '">' + b.name + '<span>' + n + '</span></button>';
  });
  box.innerHTML = html;
  var sel = document.getElementById('fp-board');
  if(sel && !sel.options.length){
    var opts = '<option value="">选择版块（必选）</option>';
    FORUM_BOARDS.forEach(function(b){ opts += '<option value="' + b.key + '">' + b.name + ' — ' + b.desc + '</option>'; });
    sel.innerHTML = opts;
  }
}
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function renderForumList(){
  var box = document.getElementById('forum-list'); if(!box) return;
  var arr = forumAllThreads();
  if(forumBoard !== 'all') arr = arr.filter(function(t){ return t.board===forumBoard; });
  if(forumSort === 'hot') arr.sort(function(a,b){ return (b.likes||0)-(a.likes||0) || String(b.date).localeCompare(String(a.date)); });
  else if(forumSort === 'unanswered') arr = arr.filter(function(t){ return forumReplyCount(t)===0; });
  else arr.sort(function(a,b){ return String(b.date).localeCompare(String(a.date)); });
  if(!arr.length){
    box.innerHTML = '<div class="empty-mini">这个版块还没有待回复的讨论——你可以发第一帖。</div>';
    return;
  }
  box.innerHTML = arr.map(function(t){
    var badges = (t.seed ? '<span class="badge">示例帖</span>' : '<span class="badge q">本机发布</span>')
      + (forumReplyCount(t) ? '' : '<span class="badge">待回复</span>');
    var replies = (t.replies || []).map(function(r){
      return '<div class="forum-reply"><b>' + esc(r.nick) + '</b><span class="fr-date">' + esc(r.date) + '</span><p>' + esc(r.body) + '</p></div>';
    }).join('');
    return '<div class="thread forum-thread" data-id="' + esc(t.id) + '">'
      + '<span class="forum-vote"><button class="fv-btn" onclick="forumLike(\'' + esc(t.id) + '\')" aria-label="点赞">▲</button><span class="fv-n">' + (t.likes||0) + '</span></span>'
      + '<div>' + badges + '<h4>' + esc(t.title) + '</h4>'
      + '<p class="forum-meta">' + boardName(t.board) + (t.district ? ' · ' + esc(t.district) : '') + (t.nick ? ' · ' + esc(t.nick) : '') + ' · ' + esc(t.date) + '</p>'
      + '<p class="forum-body">' + esc(t.body) + '</p>'
      + (replies ? '<div class="forum-replies">' + replies + '</div>' : '')
      + '<button class="mini-btn forum-reply-btn" onclick="forumToggleReply(\'' + esc(t.id) + '\')">回复 (' + forumReplyCount(t) + ')</button>'
      + '<div class="forum-reply-box" id="frb-' + esc(t.id) + '" hidden>'
      + '<input id="frn-' + esc(t.id) + '" maxlength="12" placeholder="称呼（可选）" aria-label="回复称呼" />'
      + '<textarea id="frt-' + esc(t.id) + '" rows="2" placeholder="友善讨论；涉政策请附官方来源" aria-label="回复内容"></textarea>'
      + '<button class="mini-btn" onclick="forumSubmitReply(\'' + esc(t.id) + '\')">提交回复</button>'
      + '</div></div></div>';
  }).join('');
}
function forumToggleReply(id){
  var el = document.getElementById('frb-' + id); if(el) el.hidden = !el.hidden;
}
function _forumMutate(id, fn){
  var arr = getForumThreads();
  var idx = -1;
  for(var i=0;i<arr.length;i++){ if(arr[i].id===id){ idx=i; break; } }
  if(idx === -1){ return false; }
  fn(arr[idx]); saveForumThreads(arr); renderForumList(); return true;
}
function forumLike(id){
  if(!_forumMutate(id, function(t){ t.likes=(t.likes||0)+1; })){
    var arr = forumAllThreads(); var t=null;
    for(var i=0;i<arr.length;i++){ if(arr[i].id===id){ t=arr[i]; break; } }
    if(t && t.seed){ t.likes=(t.likes||0)+1; var local=getForumThreads(); t.seed=false; local.push(t); saveForumThreads(local); renderForumList(); }
  }
}
function forumSubmitReply(id){
  var tEl = document.getElementById('frt-' + id); if(!tEl || !tEl.value.trim()) return;
  var nEl = document.getElementById('frn-' + id);
  var reply = { nick: (nEl && nEl.value.trim()) || '本机家长', date: new Date().toISOString().slice(0,10), body: tEl.value.trim().slice(0, 500) };
  if(!_forumMutate(id, function(t){ (t.replies = t.replies || []).push(reply); })){
    var arr = forumAllThreads(); var t=null;
    for(var i=0;i<arr.length;i++){ if(arr[i].id===id){ t=arr[i]; break; } }
    if(t && t.seed){ t.seed=false; (t.replies = t.replies || []).push(reply); var local=getForumThreads(); local.push(t); saveForumThreads(local); renderForumList(); }
  }
}
function submitForumPost(e){
  if(e && e.preventDefault) e.preventDefault();
  var board = document.getElementById('fp-board');
  var title = document.getElementById('fp-title');
  var district = document.getElementById('fp-district');
  var nick = document.getElementById('fp-nick');
  var body = document.getElementById('fp-body');
  var err = document.getElementById('fp-err');
  var ok = document.getElementById('fp-ok');
  var valid = board && board.value && title && title.value.trim().length >= 4 && body && body.value.trim().length >= 10;
  if(err) err.style.display = valid ? 'none' : 'block';
  if(!valid) return false;
  if(ok) ok.style.display = 'block';
  var arr = getForumThreads();
  arr.unshift({
    id: 'u' + Date.now(), board: board.value, title: title.value.trim(),
    district: district ? district.value : '', nick: (nick && nick.value.trim()) || '本机家长',
    date: new Date().toISOString().slice(0,10), likes: 0, body: body.value.trim(), replies: []
  });
  saveForumThreads(arr);
  if(title) title.value=''; if(body) body.value='';
  forumBoard = board.value;
  renderForumBoards(); renderForumList();
  var box = document.getElementById('forum-list');
  if(box){ var first = box.querySelector('.forum-thread'); if(first) first.scrollIntoView({behavior:'smooth', block:'center'}); }
  return false;
}
function initForum(){
  var form = document.getElementById('forum-post-form');
  if(form){ form.addEventListener('submit', submitForumPost); }
  renderForumBoards(); renderForumList();
}
