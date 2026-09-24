/* ---------- v0.8：多孩档案 / 日历个性化 ---------- */
var STAGE2CAL = { '幼儿园':'幼升小','小学':'小升初','初中':'初升高','高中':'高考' };
function getKids(){ try{ return JSON.parse(localStorage.getItem('jfm_children') || '[]'); }catch(e){ return []; } }
function setKids(a){ localStorage.setItem('jfm_children', JSON.stringify(a)); }
function getActiveIdx(){
  var n = parseInt(localStorage.getItem('jfm_active') || '0', 10), k = getKids();
  return (n >= 0 && n < k.length) ? n : (k.length ? 0 : -1);
}
function setActiveIdx(i){ localStorage.setItem('jfm_active', String(i)); }
function migrateProfile(){
  if(getKids().length) return;
  try{
    var prof = JSON.parse(localStorage.getItem('jfm_profile') || 'null');
    if(prof && prof.stage && prof.qu){ setKids([{ nick: '孩子', stage: prof.stage, qu: prof.qu }]); }
  }catch(e){}
}
function renderKids(){
  var box = document.getElementById('kid-chips'); if(!box) return;
  renderMeStats();
  var k = getKids(), act = getActiveIdx();
  if(!k.length){ box.innerHTML = '<span class="cmp-note">还没有孩子档案——在下方添加第一个。</span>'; return; }
  box.innerHTML = k.map(function(c, i){
    return '<span class="kid-chip' + (i === act ? ' on' : '') + '" onclick="switchKid(' + i + ')" title="点按切换为当前孩子">'
      + esc((c.nick || '孩子') + ' · ' + c.stage + ' · ' + c.qu)
      + ' <span class="x" role="button" aria-label="删除这个孩子" onclick="event.stopPropagation(); delKid(' + i + ')">×</span></span>';
  }).join('');
}
function kidNote(msg){
  var box = document.getElementById('me-profile-out'); if(!box) return;
  if(msg){ box.innerHTML = msg; return; }
  var k = getKids(), act = getActiveIdx();
  if(act < 0){ box.innerHTML = '添加后支持多孩切换：日历按当前孩子的学段自动过滤，区县用于本地化提示（演示：正式版随账号跨设备同步）。'; return; }
  var c = k[act];
  box.innerHTML = '<b>当前：</b>' + esc(c.nick || '孩子') + ' · ' + esc(c.stage) + ' · ' + esc(c.qu)
    + ' —— 日历已按「' + (STAGE2CAL[c.stage] || '全部学段') + '」过滤；点上方孩子条切换，× 删除。';
}
function applyKidFilter(){
  var k = getKids(), act = getActiveIdx(), chip = document.getElementById('cal-personal');
  if(act < 0 || !k[act]){ if(chip) chip.hidden = true; filterCal('all'); renderKidBar(); clearQuBadge(); return; }
  var c = k[act], cal = STAGE2CAL[c.stage] || 'all';
  filterCal(cal);
  if(chip){
    chip.hidden = false;
    chip.innerHTML = '日历已按 <b>' + esc(c.nick || '孩子') + '</b>（' + esc(c.stage) + ' · ' + esc(c.qu) + '）的学段过滤'
      + ' <button onclick="clearKidFilter()">查看全部学段</button>';
  }
  renderKidBar(); markSameDistrictSchools(c.qu);
}
/* ---------- v0.9：首屏孩子快切条 + 同区学校徽标 + 自查预填 ---------- */
var QU_FILTER = ''; // 当前孩子区县（重渲染学校卡时打标用）
function renderKidBar(){
  var bar = document.getElementById('kid-bar'); if(!bar) return;
  var k = getKids(), act = getActiveIdx();
  if(!k.length){
    bar.hidden = false;
    bar.innerHTML = '<span class="kb-label">个性化</span>还没有孩子档案——'
      + '<a class="kb-go" href="me.html">去「我的」添加孩子档案 →</a>';
    return;
  }
  var c = k[act];
  bar.hidden = false;
  bar.innerHTML = '<span class="kb-label">当前关注</span>'
    + k.map(function(x, i){
      return '<span class="kb-chip' + (i === act ? ' on' : '') + '" onclick="switchKid(' + i + ')" title="点按切换当前孩子">'
        + esc(x.nick || '孩子') + ' · ' + esc(x.stage) + '</span>';
    }).join('')
    + '<span>' + esc(c.qu) + ' · 日历已按「' + esc(STAGE2CAL[c.stage] || '全部') + '」过滤</span>'
    + '<a class="kb-go" href="me.html">管理档案 →</a>';
  prefillQuiz();
}
function markSameDistrictSchools(qu){
  QU_FILTER = qu || '';
  renderSchools();
}
function clearQuBadge(){
  QU_FILTER = '';
  var g = document.getElementById('school-grid');
  if(g) renderSchools();
}
function prefillQuiz(){
  var k = getKids(), act = getActiveIdx();
  if(act < 0 || !k[act]) return;
  var c = k[act];
  ['qz-qu','qz-stage'].forEach(function(id){
    var el = document.getElementById(id); if(!el || el.value) return;
    var want = id === 'qz-qu' ? c.qu : c.stage;
    for(var i = 0; i < el.options.length; i++){ if(el.options[i].text === want){ el.selectedIndex = i; break; } }
  });
}
function clearKidFilter(){
  filterCal('all');
  var chip = document.getElementById('cal-personal'); if(chip) chip.hidden = true;
}
function addChild(){
  var st = document.getElementById('me-stage').value, qu = document.getElementById('me-qu').value;
  var nick = document.getElementById('kid-nick').value.trim();
  if(!st || !qu){ kidNote('<span class="err-inline">请选择学段与区县（称呼可不填，自动记为「老大/老二…」）。</span>'); return; }
  if(!nick){
    var names = ['老大','老二','老三','老四','老五'];
    nick = names[getKids().length] || ('孩子' + (getKids().length + 1));
  }
  var k = getKids();
  k.push({ nick: nick, stage: st, qu: qu });
  setKids(k); setActiveIdx(k.length - 1);
  document.getElementById('kid-nick').value = '';
  renderKids(); applyKidFilter(); kidNote();
  toast('已添加 ' + nick + '，日历已按「' + STAGE2CAL[st] + '」过滤');
}
function switchKid(i){
  setActiveIdx(i); renderKids(); applyKidFilter(); kidNote();
  var c = getKids()[i];
  if(c) toast('已切换到 ' + (c.nick || '孩子') + '（' + (STAGE2CAL[c.stage] || '全部') + '）');
}
function delKid(i){
  var k = getKids(); if(i < 0 || i >= k.length) return;
  var name = k[i].nick || '孩子';
  k.splice(i, 1); setKids(k);
  if(getActiveIdx() >= k.length) setActiveIdx(k.length ? k.length - 1 : 0);
  renderKids(); applyKidFilter(); kidNote();
  toast('已删除 ' + name + ' 的档案');
}
