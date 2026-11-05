/* ---------- 11-search ---------- */
/* ---------- v0.3：全站搜索 ---------- */
var SEARCH_DB = [
 {t:'政策',s:'2026 年中考政策：联招学校约 113 所',a:'#policy'},
 {t:'政策',s:'优质高中指标到校招生工作通知（渝教基函〔2025〕21号）',a:'#policy'},
 {t:'政策',s:'随迁子女入学「两为主」/ 中考体育 / 学生资助 / 民办摇号（v0.20 新条目）',a:'#policy'},
 {t:'术语',s:'三对口 / 六年一户 / 指标到校 / 联招 / 长幼随学 / 位次 / 强基计划 / 军检线',a:'#policy'},
 {t:'术语',s:'征集志愿 / 生源地助学贷款 / 跨区就读 / 职教高考（共 18 条）',a:'#policy'},
 {t:'日历',s:'转学与户籍材料核对（2026-09）',a:'#calendar'},
 {t:'日历',s:'指标到校资格摸底（2026-10）',a:'#calendar'},
 {t:'日历',s:'中考报名与联招志愿准备（2027-04）',a:'#calendar'},
 {t:'日历',s:'高考特招线公布后行动清单（2027-06）',a:'#calendar'},
 {t:'志愿',s:'位次换算工具（线差法）',a:'#zy'},
 {t:'生活',s:'陪读租房行情样本 / 护学岗 6,993 个',a:'#life'},
 {t:'工具',s:'陪读成本速算器（房租+生活+通勤区间估算）',a:'#life'},
 {t:'资金',s:'教育资金规划参照（CIEFR 15,828 元）',a:'#fund'},
 {t:'会员',s:'四档会员（99/299/899）与升学豆',a:'#plans'},
 {t:'工具',s:'入学自查：我家能不能报（3 问）',a:'#quiz'},
 {t:'路径',s:'升学路径地图：6 条路径 × 学段时间轴（普高/指标到校/民办/中职/艺体/出国）',a:'#zy'},
 {t:'术语',s:'多校划片 / 摇号 / 特招线 / 一分一段 / 对口直升',a:'#policy'},
 {t:'社区',s:'本周热议：指标到校校内排队',a:'#community'},
 {t:'工具',s:'多孩档案：按孩子切换，日历自动过滤（v0.8）',a:'#me'},
 {t:'资讯',s:'升学资讯中心：分类筛选 + 编辑台采集与导出（v0.10）',a:'#news'},
 {t:'关于',s:'关于与联系：编辑与审核规范 / 线索通道 / 站点地图',a:'#about'}
];
function runSearch(){
  var q = document.getElementById('global-search').value.trim().toLowerCase();
  var panel = document.getElementById('search-panel');
  if(!q){ panel.hidden = true; return; }
  var hits = SEARCH_DB.filter(function(x){ return (x.s + ' ' + x.t).toLowerCase().indexOf(q) >= 0; }).slice(0, 8);
  var nhits = [];
  try{
    nhits = newsCombined().filter(function(x){ return (x.t + ' ' + (x.sum || '') + ' ' + (x.body || '') + ' ' + (x.src || '')).toLowerCase().indexOf(q) >= 0; }).slice(0, 4)
      .map(function(x){ return { t: '资讯', s: x.t, k: x._k }; });
  }catch(e){}
  var shits = [];
  try{
    shits = Object.keys(SCHOOL_DB).filter(function(k){ return _schoolHay(k).indexOf(q) >= 0; }).slice(0, 3)
      .map(function(k){ return { s: k, hint: _schoolHint(k, q), k: k }; });
  }catch(e){}
  var html = '';
  if(nhits.length){
    html += nhits.map(function(x){ return '<div class="s-item" onclick="goNewsByKey(\'' + x.k + '\', \'' + String(x.s).replace(/'/g, "\\'") + '\')"><span class="s-badge">' + x.t + '</span>' + esc(x.s) + '</div>'; }).join('');
  }
  if(shits.length){
    html += shits.map(function(x){ return '<div class="s-item" onclick="goSchoolByName(\'' + esc(x.k) + '\')"><span class="s-badge">学校</span>' + esc(x.s) + (x.hint ? '<span class="s-hint">' + esc(x.hint) + '</span>' : '') + '</div>'; }).join('');
  }
  if(hits.length){
    html += hits.map(function(x){ return '<div class="s-item" onclick="goSearch(\'' + x.a + '\')"><span class="s-badge">' + x.t + '</span>' + esc(x.s) + '</div>'; }).join('');
  }
  if(!html){
    panel.innerHTML = '<div class="s-item s-empty">未找到相关内容，换个关键词试试（如「指标」「陪读」「军检」）。</div>';
    panel.hidden = false; return;
  }
  panel.innerHTML = html;
  panel.hidden = false;
}
var ANCHOR2PAGE = {'#news':'news.html','#calendar':'calendar.html','#policy':'policy.html','#quiz':'quiz.html','#schools':'schools.html','#compare':'compare.html','#zy':'zy.html','#daxue':'daxue.html','#gaozhong':'gaozhong.html','#forum':'forum.html','#community':'community.html','#learn':'community.html','#life':'life.html','#beans':'beans.html','#me':'me.html','#plans':'plans.html','#biz':'biz.html','#data-sources':'data-sources.html','#about':'about.html','#how':'about.html'};
/* v0.40：学校档案检索增强（概况字段全量入库） */
function _schoolHay(name){
  var d = SCHOOL_DB[name] || {};
  return (name + ' ' + (d['全称']||'') + ' ' + (d['简介']||'') + ' ' + (d['概况']||'') + ' ' + (d['校训']||'') + ' ' + (d['校区地址']||'') + ' ' + (d['创办']||'') + ' ' + (d['办学特色']||'')).toLowerCase();
}
function _schoolHint(name, q){
  var d = SCHOOL_DB[name] || {};
  var fields = [['校训','校训'],['创办','创办'],['校区地址','地址'],['办学特色','特色'],['概况','概况']];
  for(var i = 0; i < fields.length; i++){
    var v = d[fields[i][0]];
    if(v && String(v).toLowerCase().indexOf(q) >= 0){
      var sv = String(v);
      return fields[i][1] + '：' + sv.slice(0, 36) + (sv.length > 36 ? '…' : '');
    }
  }
  return (d['简介'] || '').slice(0, 40);
}
function goSearch(anchor){
  var panel = document.getElementById('search-panel');
  if(panel) panel.hidden = true;
  var el = document.querySelector(anchor);
  if(!el){ var pg = ANCHOR2PAGE[anchor]; if(pg){ location.href = pg; } return; }
  el.scrollIntoView({behavior:'smooth', block:'start'});
  el.classList.add('flash');
  setTimeout(function(){ el.classList.remove('flash'); }, 1400);
}
function goSchoolByName(name){
  var panel = document.getElementById('search-panel');
  if(panel) panel.hidden = true;
  if(!document.getElementById('school-grid')){ location.href = 'schools.html?school=' + encodeURIComponent(name); return; }
  var s = document.getElementById('schools');
  if(s) s.scrollIntoView({behavior:'smooth', block:'start'});
  setTimeout(function(){ openSchool(name); }, 420);
}
/* ---------- v0.26：搜索面板键盘导航（↑↓ / Enter） ---------- */
function searchKeydown(e){
  if(e.key === 'Escape'){ document.getElementById('search-panel').hidden = true; e.target.value = ''; return; }
  var panel = document.getElementById('search-panel');
  if(!panel || panel.hidden){ if(e.key === 'Enter') e.preventDefault(); return; }
  var items = Array.prototype.slice.call(panel.querySelectorAll('.s-item:not(.s-empty)'));
  if(!items.length) return;
  var cur = -1;
  items.forEach(function(el, i){ if(el.classList.contains('active')) cur = i; });
  if(e.key === 'ArrowDown'){ e.preventDefault(); cur = cur < 0 ? 0 : (cur + 1) % items.length; }
  else if(e.key === 'ArrowUp'){ e.preventDefault(); cur = cur <= 0 ? items.length - 1 : cur - 1; }
  else if(e.key === 'Enter'){ e.preventDefault(); if(cur >= 0){ items[cur].click(); } else { items[0].click(); } return; }
  else return;
  items.forEach(function(el, i){ el.classList.toggle('active', i === cur); });
  items[cur].scrollIntoView({ block: 'nearest' });
}


/* ---------- 12-school ---------- */
/* ---------- v0.3：学校档案（v0.40：概况事实条 / 区域筛选 / 门户化详情入口） ---------- */
var currentOpenSchool = '';
var schoolFilter = 'all';   // 办学性质（全部 / 公办 / 民办）
var schoolRegion = 'all';   // 区县（v0.40）

function _schoolNature(name){ return (SCHOOL_DB[name]['办学性质'] || '').split('（')[0]; }

function _factChips(name){
  var d = SCHOOL_DB[name], chips = [];
  var m = String(d['创办'] || '').match(/\d{4}/);
  if(m) chips.push('创办 ' + m[0]);
  if(d['校训'] && String(d['校训']).length <= 14) chips.push('校训「' + d['校训'] + '」');
  if(!chips.length) return '';
  return '<div class="sc-facts">' + chips.map(function(c){ return '<span>' + esc(c) + '</span>'; }).join('') + '</div>';
}

function initSchoolFilters(){
  var keys = Object.keys(SCHOOL_DB);
  if(!keys.length) return;
  /* 办学性质按钮计数（动态，防陈旧） */
  var cnt = { 'all': 0, '公办': 0, '民办': 0 };
  keys.forEach(function(k){ cnt['all']++; var nz = _schoolNature(k); if(cnt[nz] !== undefined) cnt[nz]++; });
  var labels = { 'all': '全部', '公办': '公办', '民办': '民办' };
  document.querySelectorAll('#school-filter .ff').forEach(function(b){
    var sf = b.dataset.sf || 'all';
    b.textContent = labels[sf] + '（' + (cnt[sf] || 0) + '）';
  });
  /* 区域筛选按钮（动态渲染） */
  var box = document.getElementById('school-region-filter');
  if(box){
    var qc = {};
    keys.forEach(function(k){ var q = SCHOOL_DB[k]['所在区'] || '其他'; qc[q] = (qc[q] || 0) + 1; });
    var qus = Object.keys(qc).sort(function(a, b){ return qc[b] - qc[a] || a.localeCompare(b); });
    var html = '<button class="ff on" data-sr="all" onclick="filterSchoolsRegion(\'all\')">全部区域（' + keys.length + '）</button>';
    qus.forEach(function(q){
      html += '<button class="ff" data-sr="' + esc(q) + '" onclick="filterSchoolsRegion(\'' + esc(q) + '\')">' + esc(q) + '（' + qc[q] + '）</button>';
    });
    box.innerHTML = html;
  }
  /* 统计行 */
  var st = document.getElementById('sc-stats');
  if(st){
    var qn = {}; keys.forEach(function(k){ qn[SCHOOL_DB[k]['所在区'] || ''] = 1; });
    st.textContent = '共 ' + keys.length + ' 所 · 覆盖 ' + Object.keys(qn).length + ' 个区县 · 公办 ' + cnt['公办'] + ' / 民办 ' + cnt['民办'] + ' · 学校概况采集自公开渠道（2026-09），逐项标注来源';
  }
}

function filterSchoolsRegion(qu){
  schoolRegion = qu || 'all';
  document.querySelectorAll('#school-region-filter .ff').forEach(function(b){
    var on = b.dataset.sr === schoolRegion;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
  });
  applySchoolFilters();
}
function filterSchools(kind){
  schoolFilter = kind || 'all';
  document.querySelectorAll('#school-filter .ff').forEach(function(b){
    var on = b.dataset.sf === schoolFilter;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
  });
  applySchoolFilters();
}
function applySchoolFilters(){
  var g = document.getElementById('school-grid'); if(!g) return;
  var n = 0;
  g.querySelectorAll('.school-card').forEach(function(card){
    var okN = schoolFilter === 'all' || (card.getAttribute('data-nature') || '') === schoolFilter;
    var okQ = schoolRegion === 'all' || (card.getAttribute('data-qu') || '') === schoolRegion;
    var okS = schoolStage === 'all' || (card.getAttribute('data-stage') || '') === schoolStage;
    var show = okN && okQ && okS;
    card.style.display = show ? '' : 'none';
    if(show) n++;
  });
  var emptyEl = document.getElementById('sc-empty');
  if(n === 0){
    if(!emptyEl){
      emptyEl = document.createElement('div');
      emptyEl.id = 'sc-empty'; emptyEl.className = 'empty-mini';
      emptyEl.textContent = '该筛选组合下暂无学校——换个区县或性质试试，或点「全部」重置。';
      g.appendChild(emptyEl);
    }
  } else if(emptyEl){ emptyEl.remove(); }
}

function renderSchools(){
  var g = document.getElementById('school-grid'); if(!g) return;
  g.innerHTML = Object.keys(SCHOOL_DB).map(function(k){
    var d = SCHOOL_DB[k], key = encodeURIComponent(k), qu = d['所在区'] || '';
    return '<div class="school-card' + (QU_FILTER && qu === QU_FILTER ? ' qu-match' : '') + '" data-nature="' + esc(_schoolNature(k)) + '" data-stage="' + esc(_schoolStage(k)) + '" data-qu="' + esc(qu) + '"><div class="sc-art" aria-hidden="true">' + schoolPhotoImg(k) + '</div><div class="sc-top"><span class="sc-badge">' + esc(_schoolNature(k)) + '</span><span class="sc-qu">' + esc(qu) + '</span><span class="sc-badge sc-stage">' + esc(_schoolStage(k)) + '</span>' + (QU_FILTER && qu === QU_FILTER ? '<span class="qu-badge">就在 ' + esc(QU_FILTER) + '</span>' : '') + '</div>'
      + '<h4>' + esc(k) + '</h4>' + _factChips(k) + '<p>' + esc(d['简介'] || '') + '</p>'
      + '<div class="sc-actions"><button class="mini-btn" onclick="openSchool(decodeURIComponent(\'' + key + '\'))">查看档案</button>'
      + '<a class="sc-page" href="articles/' + (ARTMAP['S|' + k] || '') + '">详情页</a>'
      + '<button class="mini-btn" onclick="addToCompareName(decodeURIComponent(\'' + key + '\'))">加入对比</button></div></div>';
  }).join('');
  initSchoolFilters();
  initStageFilters();
  /* 恢复筛选状态（初始均为 all） */
  document.querySelectorAll('#school-filter .ff').forEach(function(b){ b.classList.toggle('on', (b.dataset.sf || 'all') === schoolFilter); });
  document.querySelectorAll('#school-region-filter .ff').forEach(function(b){ b.classList.toggle('on', (b.dataset.sr || 'all') === schoolRegion); });
  applySchoolFilters();
  document.querySelectorAll('#school-stage-filter .ff').forEach(function(b){ b.classList.toggle('on', (b.dataset.ss || 'all') === schoolStage); });
}

function openSchool(name){
  var d = SCHOOL_DB[name]; if(!d) return;
  currentOpenSchool = name;
  document.getElementById('sm-name').textContent = name;
  var kv = document.getElementById('sm-kv');
  var rows = ['办学性质','所在区','区划说明','创办','校训','校区地址','校园规模','师资概况','办学特色','招生范围','班型设置','中考录取参考','高考成绩','通勤参考','住宿','收费口径','指标到校','官网','资料来源','数据来源','暂缺字段'];
  kv.innerHTML = rows.map(function(r){
    var raw = d[r];
    var v;
    if(r === '暂缺字段'){
      v = '无官方发布的数据一律不展示（防误导）；可到 <a href="zy.html" style="color:var(--accent)">志愿参考 · 位次换算</a> 替代（' + esc(raw || '') + '）';
    } else if(r === '官网'){
      v = raw ? '<a href="' + hrefEnc(raw) + '" target="_blank" rel="noopener">' + esc(String(raw).replace(/^https?:\/\//, '').replace(/\/$/, '')) + ' ↗</a>' : '暂缺';
    } else if(r === '资料来源'){
      var srcs = Array.isArray(raw) ? raw : String(raw || '').split(/[\s,，]+/).filter(function(u){ return /^https?:/.test(u); });
      v = srcs.length
        ? srcs.map(function(u, i){ return '<a href="' + hrefEnc(u) + '" target="_blank" rel="noopener">来源' + (i + 1) + ' ↗</a>'; }).join(' · ')
        : '暂缺';
    } else if(r === '中考录取参考' || r === '高考成绩'){
      v = raw ? esc(raw) : '暂无官方发布（按教育部门规定，学校不炒作升学率；无来源数据不予展示，以免误导）';
    } else {
      v = esc(raw || '暂缺');
    }
    return '<dt>' + r + '</dt><dd>' + v + '</dd>';
  }).join('');
  var art = (typeof ARTMAP !== 'undefined') ? (ARTMAP['S|' + name] || '') : '';
  if(art){ kv.innerHTML += '<dt>完整档案</dt><dd><a href="articles/' + art + '">学校详情页（概况 / 师资 / 来源）→</a></dd>'; }
  // v0.43：区县交叉引用（该区入学政策与官方入口）
  var qu = d['所在区'] || '';
  if(qu && typeof QU_GUIDE !== 'undefined'){
    var qg = QU_GUIDE.find(function(g){ return g.qu === qu; });
    if(qg){ kv.innerHTML += '<dt>区县入学</dt><dd><a href="schools.html#qu-guide">' + esc(qu) + '入学政策与官方入口 →</a></dd>'; }
  }
  var ev = document.getElementById('sm-evals');
  ev.innerHTML = (d['评价'] || []).map(function(e){ return '<div class="dlg-ev"><span class="sc-badge" style="margin-right:6px">' + esc(e.badge) + '</span>' + esc(e.text) + '</div>'; }).join('') || '<div class="dlg-ev">暂无评价（评价须经审核后展示）</div>';
  document.getElementById('sm-note').textContent = '';
  document.getElementById('school-modal').showModal();
}
function addToCompareCurrent(){ addToCompareName(currentOpenSchool); }
function addToCompareName(name){
  var sels = ['sel-a','sel-b','sel-c'];
  for(var i=0;i<sels.length;i++){
    var sel = document.getElementById(sels[i]);
    if(sel && !sel.value){
      sel.value = name;
      toast('已加入对比位 ' + (i+1) + '：' + name);
      var note = document.getElementById('sm-note'); if(note) note.textContent = '已加入对比位 ' + (i+1) + '，可到「择校对比」生成。';
      return;
    }
  }
  toast('对比位已满（最多 3 所），请先清空后再加入');
}


/* ---------- v1.01 学段筛选（小学/中学） ---------- */
var schoolStage = 'all';

function _schoolStage(k){
  var d = SCHOOL_DB[k] || {};
  var hay = k + ' ' + (d['办学性质'] || '') + ' ' + (d['概况'] || '') + ' ' + (d['简介'] || '');
  return hay.indexOf('小学') >= 0 ? '小学' : '中学';
}

function initStageFilters(){
  var box = document.getElementById('school-stage-filter'); if(!box) return;
  var cnt = { 'all': Object.keys(SCHOOL_DB).length, '小学': 0, '中学': 0 };
  Object.keys(SCHOOL_DB).forEach(function(k){ cnt[_schoolStage(k)]++; });
  cnt['all'] = Object.keys(SCHOOL_DB).length;
  var labels = { 'all': '全部学段', '小学': '小学', '中学': '中学' };
  box.innerHTML = ['all', '小学', '中学'].map(function(k){
    return '<button class="ff' + (k === 'all' ? ' on' : '') + '" data-ss="' + k + '" onclick="filterSchoolsStage(\'' + k + '\')" aria-pressed="' + (k === 'all') + '">' + labels[k] + '（' + cnt[k] + '）</button>';
  }).join('');
}

function filterSchoolsStage(st){
  schoolStage = st || 'all';
  document.querySelectorAll('#school-stage-filter .ff').forEach(function(b){
    var on = b.dataset.ss === schoolStage;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
  });
  applySchoolFilters();
}


/* ---------- 13-me ---------- */
/* ---------- v0.3：我的（提醒/档案/收藏） ---------- */
function getAlerts(){ try{ return JSON.parse(localStorage.getItem('jfm_alerts') || '[]'); }catch(e){ return []; } }
function setAlerts(a){ localStorage.setItem('jfm_alerts', JSON.stringify(a)); }
function toggleAlert(btn){
  var t = btn.dataset.title, a = getAlerts(), i = a.indexOf(t);
  if(i >= 0){ a.splice(i,1); setAlerts(a); btn.classList.remove('on'); btn.textContent = '设提醒'; btn.setAttribute('aria-pressed','false'); toast('已取消提醒：' + t); }
  else { a.push(t); setAlerts(a); btn.classList.add('on'); btn.textContent = '已设提醒'; btn.setAttribute('aria-pressed','true'); toast('已设提醒：' + t + '（微信服务通知即将开放）'); }
  renderAlerts();
}
function restoreAlerts(){
  document.querySelectorAll('.alert-btn').forEach(function(b){
    if(getAlerts().indexOf(b.dataset.title) >= 0){ b.classList.add('on'); b.textContent = '已设提醒'; b.setAttribute('aria-pressed','true'); }
  });
  renderAlerts();
}
function renderAlerts(){
  var box = document.getElementById('me-alerts'); if(!box) return;
  renderMeStats();
  var a = getAlerts();
  var cnt = document.getElementById('me-alert-count'); if(cnt) cnt.textContent = a.length ? '（' + a.length + '）' : '';
  if(!a.length){ box.innerHTML = '<div class="empty-mini">还没有提醒。到「升学日历」给节点点「设提醒」，就会出现在这里。</div>'; return; }
  box.innerHTML = a.map(function(t){
    return '<div class="me-item"><span>' + esc(t) + '</span><button class="mini-btn danger" data-t="' + esc(t) + '" onclick="removeAlert(this)">删除</button></div>';
  }).join('');
}
function removeAlert(btn){
  var t = btn.dataset.t, a = getAlerts(), i = a.indexOf(t);
  if(i >= 0){ a.splice(i,1); setAlerts(a); }
  document.querySelectorAll('.alert-btn').forEach(function(b){ if(b.dataset.title === t){ b.classList.remove('on'); b.textContent = '设提醒'; } });
  renderAlerts(); toast('已删除提醒');
}


/* ---------- 14-kids ---------- */
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
  if(act < 0){ box.innerHTML = '添加后支持多孩切换：日历按当前孩子的学段自动过滤，区县用于本地化提示（账号同步即将开放）。'; return; }
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


/* ---------- 15-ics ---------- */
/* ---------- v0.8：提醒导出 .ics ---------- */
function icsDate(t){
  var m = String(t || '').match(/(\d{4})-(\d{2})/);
  return m ? (m[1] + m[2] + '01') : '20260601';
}
function icsEsc(s){ return String(s).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,'); }
function exportIcs(){
  var a = getAlerts();
  if(!a.length){ toast('还没有提醒——到「升学日历」给节点点「设提醒」再导出'); return; }
  var stamp = new Date().toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
  var L = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//jfm demo//升学节点//CN','CALSCALE:GREGORIAN','X-WR-CALNAME:花期册 · 升学节点提醒'];
  a.forEach(function(t, i){
    var ds = icsDate(t);
    var d = new Date(parseInt(ds.slice(0,4),10), parseInt(ds.slice(4,6),10) - 1, 1);
    d.setMonth(d.getMonth() + 1);
    var de = d.getFullYear() + String(d.getMonth() + 1).padStart(2,'0') + '01';
    L.push('BEGIN:VEVENT');
    L.push('UID:jfm-' + Date.now() + '-' + i + '@demo');
    L.push('DTSTAMP:' + stamp);
    L.push('DTSTART;VALUE=DATE:' + ds);
    L.push('DTEND;VALUE=DATE:' + de);
    L.push('SUMMARY:' + icsEsc(t));
    L.push('DESCRIPTION:花期册平台 · 升学节点导出；节点以当年官方发布为准');
    L.push('END:VEVENT');
  });
  L.push('END:VCALENDAR');
  var blob = new Blob([L.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  var u = URL.createObjectURL(blob), el = document.createElement('a');
  el.href = u; el.download = 'jfm-reminders.ics';
  document.body.appendChild(el); el.click();
  setTimeout(function(){ URL.revokeObjectURL(u); el.remove(); }, 1500);
  toast('已导出 .ics（' + a.length + ' 条）——可导入手机 / 电脑日历');
}


/* ---------- 16-print ---------- */
/* ---------- v0.8：行动清单打印 ---------- */
function printTodoList(){
  var cards = Array.prototype.slice.call(document.querySelectorAll('#calendar .cal')).filter(function(c){ return c.style.display !== 'none'; });
  if(!cards.length){ toast('当前过滤条件下没有可打印的节点'); return; }
  var k = getKids(), act = getActiveIdx();
  var who = (act >= 0 && k[act]) ? (esc(k[act].nick + '（' + k[act].stage + ' · ' + k[act].qu + '）')) : '全部学段';
  var rows = cards.map(function(c){
    var todo = c.querySelector('.todo div');
    var items = todo ? todo.innerHTML.split(/<br\s*\/?>/i).filter(function(x){ return x.trim(); }) : [];
    return '<h3><span class="p-date">' + esc(c.querySelector('.date').textContent) + '</span>'
      + '<span class="p-stage">' + esc(c.querySelector('.stage').textContent) + '</span> '
      + esc(c.querySelector('h4').textContent) + '</h3>'
      + (items.length ? '<ul>' + items.map(function(x){ return '<li>' + x + '</li>'; }).join('') + '</ul>' : '');
  }).join('');
  var w = window.open('', '_blank');
  if(!w){ toast('浏览器拦截了打印窗口——请允许弹出窗口后重试'); return; }
  w.document.write('<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>升学行动清单 · 花期册</title><style>'
    + 'body{font-family:"PingFang SC","Microsoft YaHei",sans-serif;color:#17212E;max-width:720px;margin:32px auto;padding:0 20px;font-size:14px;line-height:1.7}'
    + 'h1{font-family:"Songti SC","Noto Serif SC",serif;font-size:22px;margin:0 0 4px}'
    + '.p-meta{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#6B7683;margin-bottom:18px}'
    + 'h3{font-size:15px;margin:16px 0 4px}'
    + '.p-date{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#0E7C66;font-weight:700}'
    + '.p-stage{display:inline-block;font-size:10.5px;padding:1px 8px;border-radius:99px;background:#E8F2EF;color:#0E7C66;margin-left:8px}'
    + 'ul{margin:6px 0 0 18px;font-size:12.5px;color:#3C4858}'
    + '.p-foot{margin-top:24px;padding-top:10px;border-top:1px dashed #C9D1D9;font-size:10.5px;color:#6B7683}'
    + '</style></head><body>'
    + '<h1>升学行动清单</h1>'
    + '<div class="p-meta">花期册 · 重庆· 生成于 ' + new Date().toLocaleDateString('zh-CN') + ' · 适用：' + who + ' · 节点 ' + cards.length + ' 条</div>'
    + rows
    + '<div class="p-foot">清单由花期册平台生成；节点与要求以重庆市教委及各区当年官方发布为准，不承诺升学结果。</div>'
    + '<script>window.onload=function(){setTimeout(function(){window.print()},200)}<\/script></body></html>');
  w.document.close();
}
function favCompare(){
  if(!document.getElementById('sel-a')) return;
  var u = ['sel-a','sel-b','sel-c'].map(function(id){ return document.getElementById(id).value; }).filter(Boolean)
            .filter(function(x,i,arr){ return arr.indexOf(x) === i; });
  if(!u.length){ toast('先选择学校再收藏'); return; }
  localStorage.setItem('jfm_cmp_fav', JSON.stringify(u));
  renderMeFav(); toast('已收藏本次对比（' + u.length + ' 所）');
}
function renderMeFav(){
  var box = document.getElementById('me-fav'); if(!box) return;
  var u = []; try{ u = JSON.parse(localStorage.getItem('jfm_cmp_fav') || '[]'); }catch(e){}
  if(!u.length){ box.innerHTML = '<div class="empty-mini">还没有收藏对比。到「择校对比」选好学校后点「收藏本次对比」。</div>'; return; }
  box.innerHTML = '<div class="me-item"><span>' + esc(u.join(' · ')) + '</span><button class="mini-btn" onclick="restoreFav()">恢复到对比器</button></div>';
}
function restoreFav(){
  if(!document.getElementById('sel-a')) return;
  var u = []; try{ u = JSON.parse(localStorage.getItem('jfm_cmp_fav') || '[]'); }catch(e){}
  ['sel-a','sel-b','sel-c'].forEach(function(id, i){ document.getElementById(id).value = u[i] || ''; });
  runCompare();
  document.getElementById('compare').scrollIntoView({behavior:'smooth'});
  toast('已恢复对比并生成');
}


/* ---------- 17-order ---------- */
/* ---------- v0.3 会员开通 · v0.81 诚实化改版 ----------
   演示阶段未接入支付通道：不收款、不生成假订单号、不承诺"已交付"。
   用户提交的是「开通意向」，保存在本机浏览器；正式版接入支付后凭此优先开通。 */
function openOrder(name, price, beans){
  var t = document.getElementById('om-title'); if(t) t.textContent = '开通意向 · ' + name + (price ? '（¥' + price + '/年）' : '（免费）');
  var f = document.getElementById('om-form'); if(f) f.hidden = false;
  var d = document.getElementById('om-done'); if(d) d.hidden = true;
  var a = document.getElementById('om-agree'); if(a) a.checked = false;
  var au = document.getElementById('om-auto'); if(au) au.checked = false;
  var e = document.getElementById('om-err'); if(e) e.style.display = 'none';
  window._omBeans = beans || 0; window._omName = name;
  var m = document.getElementById('order-modal'); if(m) m.showModal();
}
function submitOrder(){
  if(!document.getElementById('om-agree').checked){
    document.getElementById('om-err').style.display = 'block'; return;
  }
  var id = 'YY-' + new Date().toISOString().slice(0,10) + '-' + String(Date.now()).slice(-6);
  try{
    var arr = JSON.parse(localStorage.getItem('jfm_order_intents') || '[]');
    arr.unshift({ id: id, plan: window._omName, beans: window._omBeans || 0, auto: document.getElementById('om-auto').checked, date: new Date().toISOString() });
    localStorage.setItem('jfm_order_intents', JSON.stringify(arr));
  }catch(e){}
  document.getElementById('om-form').hidden = true;
  var ok = document.getElementById('om-done'); ok.hidden = false;
  ok.innerHTML = '<b>开通意向已记录：</b>' + id
    + '<br/><span class="hint2">演示阶段未接入支付，本次<b>不会产生任何扣款</b>；意向保存在本机浏览器，正式版上线后凭记录优先开通'
    + (window._omBeans ? '，并预挂升学豆 ' + window._omBeans + ' 权益' : '')
    + '。自动续费默认关闭；退款按未使用天数比例（协议明示）。</span>';
  toast('开通意向已记录（未扣款）：' + id);
  if(typeof jfmTrack === 'function') jfmTrack('order_intent', { plan: window._omName });
}


/* ---------- 18-biz ---------- */
/* ---------- v0.3 B 端意向 · v0.81 诚实化 ----------
   修复评估报告指出的"假成功"：此前仅前端提示、数据被静默丢弃。
   现在先尝试真实提交（/api/contact，类型=合作意向）；不可用时如实告知"保存在本机"。 */
function submitBiz(){
  var n = document.getElementById('bz-name').value.trim();
  var it = document.getElementById('bz-intro').value.trim();
  var err = document.getElementById('bz-err'), ok = document.getElementById('bz-ok');
  if(n.length < 2 || it.length < 10){ err.style.display = 'block'; ok.style.display = 'none'; return; }
  err.style.display = 'none';
  var item = { id: 'BZ-' + new Date().toISOString().slice(0,10) + '-' + String(Date.now()).slice(-6),
               name: n, message: it, type: '合作意向', date: new Date().toISOString() };
  var done = function(remote){
    document.getElementById('bz-id').textContent = item.id;
    ok.style.display = 'block';
    var note = document.getElementById('bz-note');
    if(note && !remote) note.textContent = '当前为演示环境（静态托管）：意向已保存在本机浏览器，正式版接入后端后将自动同步并进入资质预审。';
    document.getElementById('bz-name').value = ''; document.getElementById('bz-intro').value = '';
    toast(remote ? '合作意向已提交' : '合作意向已保存到本机（演示环境）');
    if(typeof jfmTrack === 'function') jfmTrack('biz_submit', { local: !remote });
  };
  fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: n, type: '合作意向', contact: '', message: it }) })
    .then(function(r){ if(!r.ok) throw new Error(); return r.json(); })
    .then(function(){ done(true); })
    .catch(function(){
      try{
        var out = JSON.parse(localStorage.getItem('jfm_biz_outbox') || '[]');
        out.unshift(item); localStorage.setItem('jfm_biz_outbox', JSON.stringify(out));
      }catch(e){}
      done(false);
    });
}


/* ---------- 19-mobile-menu ---------- */
/* ---------- v0.4：移动菜单 ---------- */
function toggleMobileMenu(){
  var m = document.getElementById('mobileMenu'), b = document.getElementById('navBurger');
  if(!m || !b) return;
  var willOpen = m.hasAttribute('hidden');
  if(willOpen){ m.removeAttribute('hidden'); b.classList.add('open'); b.setAttribute('aria-expanded','true'); }
  else { m.setAttribute('hidden',''); b.classList.remove('open'); b.setAttribute('aria-expanded','false'); }
}
document.addEventListener('click', function(e){
  var a = e.target.closest ? e.target.closest('#mobileMenu a') : null;
  if(a){
    var m = document.getElementById('mobileMenu'), b = document.getElementById('navBurger');
    if(m){ m.setAttribute('hidden',''); }
    if(b){ b.classList.remove('open'); b.setAttribute('aria-expanded','false'); }
  }
});


/* ---------- 21-cal-filter ---------- */
/* ---------- v0.5：日历学段筛选 ---------- */
function filterCal(mode){
  document.querySelectorAll('#calendar .cal').forEach(function(c){
    c.style.display = (mode === 'all' || c.dataset.stage === mode) ? '' : 'none';
  });
  document.querySelectorAll('#calendar .cal-filter .ff').forEach(function(b){
    b.classList.toggle('on', b.dataset.cf === mode);
  });
}


/* ---------- 22-quiz ---------- */
/* ---------- v0.4：入学自查 ---------- */
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
  if(st === '高中') L.push('· 高考路径多元：普通高考之外还有艺体、高职分类考试等；分数参考可先用上方「位次换算」工具。');
  L.push(dataBadge('zhibiao'));
  L.push('<span style="font-size:12px;color:var(--muted)">本自查为规则参考，不构成入学承诺；最终以区教委当年度政策与学校招生细则为准。</span>');
  box.innerHTML = '<div class="zy-out">' + L.join('<br/>') + '</div>';
  if(typeof jfmTrack === 'function') jfmTrack('quiz_complete', { stage: stageName, housing: hs });
}


/* ---------- 23-data-sources ---------- */
/* ---------- v0.7：数据来源面板 ---------- */
function renderDataSources(){
  var dv = document.getElementById('dataVersion');
  if(dv){ dv.innerHTML = '数据版本：<b>' + DATA_VERSION.label + '</b>（版本 ' + DATA_VERSION.id + ' · 截至 ' + DATA_VERSION.asOf + '）'; }
  var box = document.getElementById('ds-table'); if(!box) return;
  var rows = Object.keys(DATA_SOURCES).map(function(k, i){
    var d = DATA_SOURCES[k];
    var anchor = '<tr id="src-' + k + '">';
    var link = d.url ? ' <a class="ds-link" href="' + hrefEnc(d.url) + '" target="_blank" rel="noopener">原文入口 ↗</a>' : '';
    return anchor + '<td>' + (i+1) + '</td><td>' + esc(d.label) + '</td><td>' + esc(d.source) + link + '</td><td>' + esc(d.asOf) + '</td>'
      + '<td><span class="ds-ver ' + (d.verified ? 'ok">✓ 已核验' : 'pending">○ 待核验') + '</span></td></tr>';
  }).join('');
  var verified = Object.keys(DATA_SOURCES).filter(function(k){ return DATA_SOURCES[k].verified; }).length;
  box.innerHTML = '<table class="ds-table"><tr><th>#</th><th>数据点</th><th>来源（机构 + 口径）</th><th>截至</th><th>核验状态</th></tr>'
    + rows + '</table>'
    + '<p class="cmp-note" style="margin-top:8px">当前数据包：' + verified + '/' + Object.keys(DATA_SOURCES).length + ' 项已核验 · 版本 ' + DATA_VERSION.id + '。来源变更时本表与页面数字同步更新并全站红点提示。</p>';
}


/* ---------- 24-path-map ---------- */
/* ---------- v0.6：升学路径地图 ---------- */
var PATH_MAP = {
  "普高统招（联招）": {
    start: "小学打底 · 初三冲刺",
    warn: "风险提示：警惕「内部保送名额」类骗局（见求真台）",
    stages: [
      {s:"小学", h:"打底与观望", a:"习惯与基础优先；家长同步了解本区初中格局与指标到校规则。"},
      {s:"初中", h:"关键准备", a:"保持学籍连续；初三上学期研究联招志愿批次（2026 年约 113 所）。"},
      {s:"升学节点", h:"志愿冲刺", a:"出分后志愿窗口仅 3–5 天：冲稳保梯度 + 位次参考交叉验证。"},
      {s:"下一程", h:"进入高中", a:"聚焦高考主线；高二确定选科方向。"}
    ]
  },
  "指标到校": {
    start: "小升初时就该规划——学籍连续是硬前提",
    warn: "风险提示：名额与排序规则各区每年微调，以当年区教委细则为准",
    stages: [
      {s:"小学", h:"提前布局", a:"小升初择校时，把「对口初中是否分得指标」纳入考量。"},
      {s:"初中", h:"稳住学籍", a:"学籍不转、不中断；关注校内排位而非全区排名——70% 名额是校内竞争。"},
      {s:"升学节点", h:"批次较早", a:"指标到校录取通常在联招批次之前/中完成，以区细则为准。"},
      {s:"下一程", h:"适应节奏", a:"进入重点高中后注意学习节奏差异，提前补衔接。"}
    ]
  },
  "民办高中": {
    start: "初三上学期启动调研",
    warn: "风险提示：资质与年检必须核验；「签约保录」话术一律不信",
    stages: [
      {s:"小学", h:"关注规则", a:"此阶段无需布局；留意公民同招政策变化即可。"},
      {s:"初中", h:"实地调研", a:"核查办学资质、年检记录、升学出口与收费标准。"},
      {s:"升学节点", h:"公民同招", a:"与公办同步报名；未摇中回公办统筹——不要单独押注民办。"},
      {s:"下一程", h:"费用持续", a:"学费为数万元/年量级（因校而异），评估三年持续性。"}
    ]
  },
  "中职·职教高考": {
    start: "初二下开始了解也不晚",
    warn: "风险提示：「包分配」承诺不可信；选校前查办学许可",
    stages: [
      {s:"小学", h:"保护兴趣", a:"保护孩子的动手能力与兴趣方向，不贴「差生」标签。"},
      {s:"初中", h:"实地考察", a:"看专业方向、实训条件；了解 3+2/五年制与职教高考通道。"},
      {s:"升学节点", h:"选专业优先", a:"选专业重于选学校：就业面、升学率、产业趋势。"},
      {s:"下一程", h:"双线准备", a:"文化素质 + 职业技能双线，可升大专乃至本科。"}
    ]
  },
  "艺体特长": {
    start: "小学中段起步最常见；初三再起步通常来不及",
    warn: "风险提示：「保过」「包过」承诺一律不信；投入量力而行",
    stages: [
      {s:"小学", h:"兴趣探索", a:"多方向试错，尊重孩子意愿；控制投入节奏。"},
      {s:"初中", h:"确认要求", a:"查目标高中特长生招生简章：级证、比赛、专业测试口径。"},
      {s:"升学节点", h:"双线作战", a:"特长测试与中考成绩双线，任一短板都可能落空。"},
      {s:"下一程", h:"跟进改革", a:"艺术类统考改革持续推进，关注当年考试大纲。"}
    ]
  },
  "出国/国际班": {
    start: "最早小学高段就要规划语言与课程体系",
    warn: "风险提示：年花费高且路线差异大；先做家庭财务压力测试",
    stages: [
      {s:"小学", h:"语言积累", a:"以语言与学习习惯积累为主，不必急于定路线。"},
      {s:"初中", h:"定课程体系", a:"确定 A-Level / IB / AP 等体系与家庭预算承受力。"},
      {s:"升学节点", h:"双重要求", a:"国际班也看中考成绩；核查办学资质与外教资质。"},
      {s:"下一程", h:"申请准备", a:"标化考试、申请材料；留学中介选择先核验资质。"}
    ]
  }
};
function renderPath(key){
  var p = PATH_MAP[key]; if(!p) return;
  if(!document.getElementById('pm-panel')) return;
  document.querySelectorAll('#zy .pm-tabs .ff').forEach(function(b){ b.classList.toggle('on', b.dataset.p === key); });
  document.getElementById('pm-panel').innerHTML =
    '<div class="pm-sum"><span class="pm-tag">起步时间：' + p.start + '</span><span class="pm-tag risk">' + p.warn + '</span></div>'
    + '<div class="pm-stages">' + p.stages.map(function(s){
        return '<div class="pm-stage"><div class="ps">' + s.s + '</div><h5>' + s.h + '</h5><p>' + s.a + '</p></div>';
      }).join('') + '</div>';
}


/* ---------- 25-init ---------- */
/* ---------- v0.3：初始化 ---------- */
function initSelects(){
  var keys = Object.keys(SCHOOL_DB);
  [['sel-a','选择学校一'],['sel-b','选择学校二'],['sel-c','选择学校三（可选）']].forEach(function(pair){
    var sel = document.getElementById(pair[0]); if(!sel) return;
    var cur = sel.value;
    var html = '<option value="">' + pair[1] + '</option>';
    keys.forEach(function(k){ html += '<option>' + esc(k) + '</option>'; });
    sel.innerHTML = html;
    if(cur) sel.value = cur;
  });
}


/* ---------- 26-zy ---------- */
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


/* ---------- 28-checkin ---------- */
/* ---------- 升学豆签到 ---------- */
var checked=false;
function checkin(){
  if(checked) return;
  checked=true;
  var v=document.getElementById("beans-val");
  v.textContent=parseInt(v.textContent,10)+5;
  var b=document.getElementById("btn-checkin");
  b.disabled=true; b.textContent="今日已签到";
  document.getElementById("beans-done").style.display="block";
  var mb=document.getElementById("me-beans");
  if(mb) mb.textContent=v.textContent;
}


/* ---------- 29-fund ---------- */
/* ---------- 资金规划参照 ---------- */
function fundCalc(){
  var st=document.getElementById("fund-stage").value;
  var b=parseInt(document.getElementById("fund-budget").value,10);
  var box=document.getElementById("fund-result");
  if(!st){ box.innerHTML='<div class="cmp-empty">请选择学段。</div>'; return; }
  var REF = DATA_SOURCES.cifr;
  var ref={
    "幼儿园":"学前阶段差异大：公办普惠与民办价差可达数倍；建议先列「保教费 + 兴趣探索」两栏，避免为「别输在起跑线」超支。",
    "小学":"小学阶段校外支出约占生均教育支出 26.2%（CIEFR 调查）；此阶段最大风险是「跟风报班」，建议每年做一次预算复盘，砍掉续费前犹豫的项目。",
    "初中":"初中为焦虑峰值段：学科类培训受「双减」约束，转向素质与研学时警惕打包定价；建议把「信息与规划」类投入（如工具会员）与「课时」类投入分开记账。",
    "高中":"高中阶段单笔大额决策多（复读/志愿咨询/教辅）：全国一对一咨询报价约 4,000 元至近 2 万元（半月谈/21 财经，已核验）；大额支出前先看求真台避坑结论。"
  }[st];
  var cmp="";
  if(b>0){
    var share=(b/15828*100).toFixed(0);
    cmp="<br/>你输入的年预算 <b>"+b.toLocaleString()+" 元</b> 约为全国调查均值（"+REF.label.match(/\d[\d,]+/)[0]+" 元）的 <b>"+share+"%</b>"+(b>21000?"——高于均值较多，建议逐项核对「课时/资料/活动/设备」四类占比。":"——在均值附近或以下，结构比总量更值得关注。");
  }
  box.innerHTML='<div class="fund-out"><b>'+st+'阶段参照：</b>'+ref+cmp+'<br/><br/>'+dataBadge('cifr')+'<br/><span style="font-size:12px;color:var(--muted)">风险提示：本工具仅提供公开调查数据的参照对照，不推荐任何金融/保险产品；教育金规划请以家庭整体现金流为前提。</span></div>';
}
function bootV3(){
  initSelects(); renderSchools(); initStageFilters(); renderQuGuide(); renderProblems(); migrateProfile(); renderKids(); kidNote(); applyKidFilter(); renderKidBar(); restoreAlerts(); renderMeFav(); renderMeStats(); renderCountdown(); mountArt(); renderHotRank(); renderNews(); renderLearn(); initAnnBar(); initSearchShortcut(); initScrollSpy(); initFsToggle(); initTheme(); initPageUI(); initKbdHelp(); initDialogFocusTrap(); renderPath('普高统招（联招）'); renderDataSources(); initDao(); bootPageRoute(); initStageDeepLink(); dxInit(); gzInit(); yhRender(); pqRender(); ljRender(); mapRender(); dgRender(); kbRender();
  var mb = document.getElementById('me-beans'), bv = document.getElementById('beans-val');
  if(mb && bv) mb.textContent = bv.textContent;
}
function bootOnce(){ if(window.__booted) return; window.__booted = true; bootV3(); }
/* v0.54 修复（P0）：bundle 以 defer 加载，脚本执行期间 document.readyState 已是 'interactive'，
   若在此处同步 boot，紧接其后的文件 30–51 顶层 var（PHOTO_POOL / NEWS_PAGE_SIZE / DAO_CATS…）尚未赋值，
   boot 链会在 renderNews() 处抛 TypeError 中断，导致主题切换、数据来源表、页面路由等全部失效。
   统一交给 DOMContentLoaded（defer 执行完立即触发，此时全 bundle 顶层语句已执行完毕）。 */
document.addEventListener('DOMContentLoaded', bootOnce);
if(document.readyState === 'complete') setTimeout(bootOnce, 0);   // 兜底：DOMContentLoaded 已错过的场景
function clearCompare(){
  ["sel-a","sel-b","sel-c"].forEach(function(id){document.getElementById(id).value="";});
  cmpLast = null; cmpDiffOnly = false;
  var dbtn = document.getElementById("btn-diff");
  if(dbtn){ dbtn.classList.remove('on'); dbtn.setAttribute('aria-pressed','false'); dbtn.textContent = '仅看差异'; }
  document.getElementById("cmp-result").innerHTML='<div class="cmp-empty">选择 2–3 所学校后点击「生成对比」。</div>';
}


/* ---------- 30-news ---------- */
/* ---------- v0.10：资讯中心（信息流 + 站内编辑台） ---------- */
var NEWS_PHOTO_ALT = {'政策速递':'政策文件主题配图','升学动态':'校园新闻主题配图','家庭教育':'家庭教育主题配图','安全提醒':'校园安全主题配图','办事提醒':'日历办事主题配图'};
var NEWS_CATS = ['政策速递','升学动态','家庭教育','安全提醒','办事提醒'];
var newsFilter = 'all';
var newsQuery = '';
var neEditingId = null;
var NEWS_PAGE_SIZE = 24;      // v0.53：与照片池（28 张）匹配——一屏之内封面不重复；加载更多每次 +24
var newsShown = NEWS_PAGE_SIZE;
function moreNews(){ newsShown += NEWS_PAGE_SIZE; renderNews(); }

function todayStr(){
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function getUserNews(){ try{ return JSON.parse(localStorage.getItem('jfm_news_user') || '[]'); }catch(e){ return []; } }
function setUserNews(l){ localStorage.setItem('jfm_news_user', JSON.stringify(l)); }
function allNews(){
  return (window.NEWS_FEED || []).map(function(x, i){
    var o = {}; for(var k in x) o[k] = x[k]; o._k = 'b' + i; o._local = false; return o;
  });
}
function pubUserNews(){
  return getUserNews().filter(function(x){ return x.st === 'pub'; }).map(function(x){
    var o = {}; for(var k in x) o[k] = x[k]; o._k = x.id; o._local = true; return o;
  });
}
function newsCombined(){
  var arr = allNews().concat(pubUserNews());
  arr.sort(function(a, b){ return String(b.date || '').localeCompare(String(a.date || '')); });
  return arr;
}
function setNewsFilter(cat){ newsFilter = cat; renderNews(); }
function setNewsQuery(v){ newsQuery = v || ''; renderNews(); }
function clearNewsQuery(){
  var el = document.getElementById('news-q');
  if(el){ el.value = ''; el.focus(); }
  newsQuery = ''; renderNews();
}

/* ---------- v0.80：重庆 K12 相关性优先（要闻榜与资讯流排序） ---------- */
var JFM_LOCAL_SOURCES = ['重庆市教育委员会','重庆市教育考试院','重庆招考网','华龙网','重庆市政府网','新华网重庆','人民网重庆','上游新闻','重庆日报','第1眼','上游','华龙'];
var JFM_LOCAL_KEYWORDS = ['重庆','渝','巴南','江北','渝北','沙坪坝','九龙坡','南岸','渝中','北碚','大渡口','涪陵','万州'];
var JFM_K12_KEYWORDS = ['小升初','幼升小','中考','高考','划片','摇号','指标到校','志愿填报','中考志愿','高考志愿','招生','学位','学区','转学','中小学','义务教育','双减','课后服务','教材','校园','家长','教委','普高','联招','考试','报名','录取','入学','K12','中小学校','区县','学业水平','合格考'];   /* K12 家长核心痛点词：命中才算强相关 */
var JFM_NEG_KEYWORDS = ['职业','职教','高校','大学','学院','研究生','考研','雅思','托福','留学','党建','思政','国际交流','世校赛','技能大赛','双一流','就业','科研','论文','竞赛','本科','旅游','游客','文旅','出入境','马拉松','研考','研招','调剂'];   /* 高教/职教/考试培优类：K12 家长不关注，重罚 */
var newsLocalFirst = true;
function jfmRelevance(x){
  var hay = ((x.t||'') + ' ' + (x.sum||'') + ' ' + (x.src||''));
  var score = 0;
  for(var i=0;i<JFM_LOCAL_SOURCES.length;i++){ if((x.src||'').indexOf(JFM_LOCAL_SOURCES[i]) !== -1){ score += 5; break; } }
  var hits = 0;
  for(var j=0;j<JFM_LOCAL_KEYWORDS.length;j++){ if(hay.indexOf(JFM_LOCAL_KEYWORDS[j]) !== -1){ hits++; if(hits>=3) break; } }
  score += Math.min(hits, 3) * 2;
  /* K12 核心词：每命中 +2（封顶 6），命中不到 1 个则无法进入强相关组 */
  var k12 = 0;
  for(var k=0;k<JFM_K12_KEYWORDS.length;k++){ if(hay.indexOf(JFM_K12_KEYWORDS[k]) !== -1){ k12++; if(k12>=3) break; } }
  score += Math.min(k12, 3) * 2;
  /* 负关键词：一票重罚（职业/高校/考研/留学等与 K12 家长无关） */
  for(var n=0;n<JFM_NEG_KEYWORDS.length;n++){ if(hay.indexOf(JFM_NEG_KEYWORDS[n]) !== -1){ score -= 6; break; } }
  return score;
}
function setNewsLocalFirst(on){
  newsLocalFirst = !!on;
  var box = document.getElementById('news-local-toggle');
  if(box){ box.classList.toggle('on', newsLocalFirst); box.textContent = '重庆K12优先：' + (newsLocalFirst ? '开' : '关'); box.setAttribute('aria-pressed', newsLocalFirst ? 'true' : 'false'); }
  renderNews(); renderHotRank();
}

function renderNews(){
  var box = document.getElementById('news-list'); if(!box) return;
  if(typeof resetPhotoUsage === 'function') resetPhotoUsage();   // v0.53：本页照片去重计数从零开始
  var arr = newsCombined();
  if(typeof newsLocalFirst !== 'undefined' && newsLocalFirst){
    arr = arr.map(function(x){ x._rel = jfmRelevance(x); return x; })
             .sort(function(a,b){
               var ga = a._rel >= 4 ? 0 : 1, gb = b._rel >= 4 ? 0 : 1;   /* 强相关（重庆/升学）优先组 */
               return (ga - gb) || String(b.date||'').localeCompare(String(a.date||''));
             });
  }
  var q = newsQuery.trim().toLowerCase();
  var shown = arr.filter(function(x){
    if(newsFilter !== 'all' && x.cat !== newsFilter) return false;
    if(q){
      var hay = ((x.t || '') + ' ' + (x.sum || '') + ' ' + (x.src || '') + ' ' + (x.cat || '')).toLowerCase();
      if(hay.indexOf(q) === -1) return false;
    }
    return true;
  });
  box.setAttribute('data-covers', '1');
  // v0.43：筛选/搜索时全量，默认浏览时分页渲染
  var pageShown = (q || newsFilter !== 'all') ? shown.length : Math.min(newsShown, shown.length);
  var pageItems = shown.slice(0, pageShown);
  box.innerHTML = pageItems.length ? pageItems.map(function(x, i){ return newsItemHTML(x, i === 0); }).join('')
    : (q ? '<div class="empty-mini">没有匹配「' + esc(newsQuery.trim()) + '」的条目——换个关键词试试，或清空搜索框。</div>'
         : '<div class="empty-mini">该分类暂无条目——可点「编辑台」添加。</div>');
  // 「加载更多」按钮（仅默认浏览态且还有剩余时显示）
  var moreBox = document.getElementById('news-more');
  if(moreBox){
    if(!q && newsFilter === 'all' && pageShown < shown.length){
      moreBox.hidden = false;
      moreBox.innerHTML = '<button class="mini-btn" style="padding:10px 22px" onclick="moreNews()">加载更多（已显示 ' + pageShown + ' / ' + shown.length + ' 条）</button>';
    } else { moreBox.hidden = true; moreBox.innerHTML = ''; }
  }
  var counts = { all: arr.length };
  NEWS_CATS.forEach(function(c){ counts[c] = arr.filter(function(x){ return x.cat === c; }).length; });
  var labels = { all: '全部', '政策速递': '政策速递', '升学动态': '升学动态', '家庭教育': '家庭教育', '安全提醒': '安全提醒', '办事提醒': '办事提醒' };
  document.querySelectorAll('#news-filter .ff').forEach(function(b){
    var c = b.dataset.nf;
    b.classList.toggle('on', c === newsFilter);
    b.setAttribute('aria-pressed', String(c === newsFilter));
    b.textContent = labels[c] + (counts[c] ? ' ' + counts[c] : '');
  });
  var meta = document.getElementById('news-meta-line');
  if(meta){
    var us = getUserNews().length;
    meta.textContent = '内容条目 ' + allNews().length + ' 条' + (us ? ' · 本机编辑 ' + us + ' 条（含草稿）' : '')
      + (q ? ' · 搜索「' + newsQuery.trim() + '」命中 ' + shown.length + ' 条' : '')
      + ' · 「编辑台」内容保存在本机浏览器，可导出 JSON 交接；正式版接入后台审核发布流程。';
  }
}
function newsItemHTML(x, lead){
  var bodyHTML = (x.body || x.url)
    ? '<div class="ni-body" hidden>' + esc(x.body || '') + (x.url ? '<div style="margin-top:6px"><a href="' + hrefEnc(x.url) + '" target="_blank" rel="noopener">原文链接 ↗</a></div>' : '') + '</div>'
    : '';
  var cover = '<div class="ni-cover" aria-hidden="true">' + photoItemImg(x._k + '|' + (x.t || ''), false, NEWS_PHOTO_ALT[x.cat] || '教育资讯主题配图') + '</div>';
  var artKey = (typeof ARTMAP !== 'undefined') ? (ARTMAP['N|' + x.t] || '') : '';
  var titleLink;
  if(artKey){ titleLink = '<a class="ni-link" href="articles/' + artKey + '" title="阅读全文">' + esc(x.t) + '</a>'; }
  else if(x.url){ titleLink = '<a class="ni-link" href="' + hrefEnc(x.url) + '" target="_blank" rel="noopener" title="阅读原文">' + esc(x.t) + ' ↗</a>'; }
  else { titleLink = '<span class="ni-link" role="text">' + esc(x.t) + '</span>'; }
  return '<div class="news-item' + (lead ? ' lead' : '') + '" data-key="' + esc(x._k) + '" data-cat="' + esc(x.cat) + '">' + cover + '<div class="ni-main">'
    + '<div class="ni-head"><span class="ni-cat">' + esc(x.cat) + '</span>'
    + (x.stages && x.stages.length ? x.stages.map(function(sg){ return '<span class="stage-tag">' + esc(sg) + '</span>'; }).join('') : '')
    + '<span>' + esc(x.src || '') + '</span><span>' + esc(x.date || '') + '</span>'
    + (x._local ? '<span class="ni-tag local">本机编辑</span>' : '') + '</div>'
    + '<h4 class="ni-title">' + titleLink
    + ' <button class="ni-more" onclick="toggleNewsBody(this)" data-target="self">摘要 ▾</button></h4>'
    + (x.sum ? '<p class="ni-sum">' + esc(x.sum) + '</p>' : '')
    + bodyHTML
    + '<div class="ni-actions"><button class="mini-btn" onclick="copyNewsItem(\'' + esc(x._k) + '\')">复制转发</button>'
    + (x._local ? '<button class="mini-btn" onclick="editNewsItem(\'' + esc(x._k) + '\')">编辑</button><button class="mini-btn danger" onclick="delNewsItem(\'' + esc(x._k) + '\')">删除</button>' : '')
    + '</div>'
    + '</div></div>';
}

function toggleNewsBody(el){
  var item = el.closest('.news-item'); if(!item) return;
  var body = item.querySelector('.ni-body'); if(!body) return;
  body.hidden = !body.hidden;
  el.setAttribute('aria-expanded', String(!body.hidden));
}
function goNewsByKey(key, titleHint){
  var panel = document.getElementById('search-panel');
  if(panel) panel.hidden = true;
  if(!document.getElementById('news-list')){
    var kw = titleHint || key;
    location.href = 'news.html?s=' + encodeURIComponent(kw); return;
  }
  newsFilter = 'all'; renderNews();
  var el = document.querySelector('#news-list .news-item[data-key="' + key + '"]');
  if(!el) return;
  var body = el.querySelector('.ni-body'); if(body){ body.hidden = false; var tt = el.querySelector('.ni-title'); if(tt) tt.setAttribute('aria-expanded','true'); }
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('flash');
  setTimeout(function(){ el.classList.remove('flash'); }, 1400);
}
/* —— 编辑台（本机采集与编辑） —— */
function openNewsEditor(){
  var d = document.getElementById('news-editor'); if(!d) return;
  var dt = document.getElementById('ne-date'); if(dt && !dt.value) dt.value = todayStr();
  renderEditorList();
  if(d.showModal) d.showModal();
}
function saveNewsItem(){
  var t = (document.getElementById('ne-title').value || '').trim();
  var src = (document.getElementById('ne-src').value || '').trim();
  var err = document.getElementById('ne-err');
  if(!t || !src){ err.textContent = '标题与来源为必填项。'; err.style.display = 'inline'; return; }
  err.style.display = 'none';
  var item = {
    cat: document.getElementById('ne-cat').value,
    t: t, src: src,
    date: document.getElementById('ne-date').value || todayStr(),
    url: (document.getElementById('ne-url').value || '').trim(),
    sum: (document.getElementById('ne-sum').value || '').trim(),
    body: (document.getElementById('ne-body').value || '').trim(),
    st: (document.querySelector('input[name="ne-st"]:checked') || {}).value || 'pub'
  };
  var list = getUserNews();
  if(neEditingId){
    list = list.map(function(x){ if(x.id === neEditingId){ for(var k in item) x[k] = item[k]; } return x; });
    toast('已更新条目（本机）');
  } else {
    item.id = 'u' + Date.now();
    list.push(item);
    toast(item.st === 'pub' ? '已发布到资讯流（本机）' : '已存草稿（仅编辑台可见）');
  }
  setUserNews(list);
  neEditingId = null;
  ['ne-title','ne-src','ne-url','ne-sum','ne-body'].forEach(function(id){ document.getElementById(id).value = ''; });
  var save = document.getElementById('ne-save'); if(save) save.textContent = '保存到资讯流';
  renderEditorList(); renderNews();
}
function editNewsItem(id){
  var mine = getUserNews(), x = null;
  mine.forEach(function(o){ if(o.id === id) x = o; });
  if(!x) return;
  neEditingId = id;
  document.getElementById('ne-title').value = x.t || '';
  document.getElementById('ne-cat').value = x.cat || NEWS_CATS[0];
  document.getElementById('ne-src').value = x.src || '';
  document.getElementById('ne-date').value = x.date || todayStr();
  document.getElementById('ne-url').value = x.url || '';
  document.getElementById('ne-sum').value = x.sum || '';
  document.getElementById('ne-body').value = x.body || '';
  var r = document.querySelector('input[name="ne-st"][value="' + (x.st || 'pub') + '"]'); if(r) r.checked = true;
  var save = document.getElementById('ne-save'); if(save) save.textContent = '保存修改';
  document.getElementById('ne-err').style.display = 'none';
  var dlg = document.getElementById('news-editor'); if(dlg && dlg.scrollTo) dlg.scrollTo(0, 0);
}
function delNewsItem(id){
  setUserNews(getUserNews().filter(function(x){ return x.id !== id; }));
  if(neEditingId === id) neEditingId = null;
  renderEditorList(); renderNews(); toast('已删除本机条目');
}
function toggleNewsStatus(id){
  var list = getUserNews();
  list = list.map(function(x){ if(x.id === id){ x.st = x.st === 'pub' ? 'draft' : 'pub'; } return x; });
  setUserNews(list); renderEditorList(); renderNews();
  toast('已切换条目状态');
}
function renderEditorList(){
  var box = document.getElementById('ne-list'); if(!box) return;
  var mine = getUserNews();
  if(!mine.length){ box.innerHTML = '<div class="empty-mini">还没有本机条目——用上方表单采集第一条，或从下方批量导入。</div>'; return; }
  box.innerHTML = mine.map(function(x){
    return '<div class="ne-item"><span class="ne-st ' + (x.st === 'pub' ? 'pub' : 'draft') + '">' + (x.st === 'pub' ? '已发布' : '草稿') + '</span>'
      + '<span class="ne-t" title="' + esc(x.t) + '">' + esc(x.t) + '</span>'
      + '<button class="mini-btn" onclick="editNewsItem(\'' + x.id + '\')">编辑</button>'
      + '<button class="mini-btn" onclick="toggleNewsStatus(\'' + x.id + '\')">' + (x.st === 'pub' ? '转草稿' : '发布') + '</button>'
      + '<button class="mini-btn danger" onclick="delNewsItem(\'' + x.id + '\')">删除</button></div>';
  }).join('');
  var note = document.getElementById('ne-note');
  if(note && window.NEWS_META){ note.textContent = '数据文件 ' + NEWS_META.generated + ' · 编辑部 ' + NEWS_META.seed + ' 条 + 本机 ' + mine.length + ' 条'; }
}
function importNews(){
  var raw = (document.getElementById('ne-import').value || '').trim();
  if(!raw){ toast('先粘贴要导入的内容'); return; }
  var list = getUserNews(), added = 0;
  if(raw[0] === '['){
    try{
      var arr = JSON.parse(raw);
      arr.forEach(function(o){
        if(!o || !o.t) return;
        list.push({
          id: 'u' + Date.now() + added,
          t: String(o.t),
          cat: NEWS_CATS.indexOf(o.cat) >= 0 ? o.cat : '升学动态',
          src: String(o.src || '外部导入'),
          date: o.date || todayStr(),
          url: o.url || '', sum: o.sum || '', body: o.body || '',
          st: o.st === 'draft' ? 'draft' : 'pub'
        });
        added++;
      });
    }catch(e){ toast('JSON 解析失败：' + e.message.slice(0, 40)); return; }
  } else {
    raw.split('\n').forEach(function(line){
      line = line.trim(); if(!line) return;
      var parts = line.split('|').map(function(s){ return s.trim(); });
      if(!parts[0]) return;
      list.push({
        id: 'u' + Date.now() + added,
        t: parts[0],
        src: parts[1] || '外部导入',
        cat: NEWS_CATS.indexOf(parts[2]) >= 0 ? parts[2] : '升学动态',
        date: parts[3] || todayStr(),
        url: '', sum: '', body: '', st: 'pub'
      });
      added++;
    });
  }
  setUserNews(list); renderEditorList(); renderNews();
  document.getElementById('ne-import').value = '';
  toast(added ? '已导入 ' + added + ' 条（本机）' : '没有解析到有效条目');
}
function exportNews(){
  var payload = { exportedAt: new Date().toISOString(), note: '花期册平台资讯导出', items: newsCombined() };
  var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  var u = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = u; a.download = 'jfm-news-export.json';
  document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(u); a.remove(); }, 1200);
  toast('已导出资讯 JSON（' + payload.items.length + ' 条）');
}


/* ---------- 31-polish ---------- */
/* ---------- v0.11：站点公告 / 搜索快捷键 / 导航高亮 ---------- */
function initAnnBar(){
  var bar = document.getElementById('annBar'); if(!bar) return;
  var closed = false;
  try{ closed = localStorage.getItem('jfm_ann_closed') === '1'; }catch(e){}
  bar.hidden = closed;
}
function closeAnn(){
  var bar = document.getElementById('annBar'); if(bar) bar.hidden = true;
  try{ localStorage.setItem('jfm_ann_closed', '1'); }catch(e){}
}
function initSearchShortcut(){
  document.addEventListener('keydown', function(e){
    if(e.key !== '/') return;
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    if(tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    var box = document.getElementById('global-search'); if(!box) return;
    e.preventDefault(); box.focus();
  });
}
function initScrollSpy(){
  if(!('IntersectionObserver' in window)) return;
  var links = Array.prototype.slice.call(document.querySelectorAll('.top nav a[href^="#"]:not(.cta)'));
  var map = {};
  links.forEach(function(a){ var id = a.getAttribute('href').slice(1); if(id) map[id] = a; });
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting) return;
      links.forEach(function(a){ a.classList.remove('on'); });
      var a = map[en.target.id]; if(a) a.classList.add('on');
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  Object.keys(map).forEach(function(id){ var s = document.getElementById(id); if(s) obs.observe(s); });
}
/* ---------- v0.13：一键复制 / 更新日志 ---------- */
function copyText(txt){
  function done(){ toast('已复制到剪贴板'); }
  function fallback(){
    var ta = document.createElement('textarea');
    ta.value = txt; ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    try{ document.execCommand('copy'); done(); }catch(e){ toast('复制失败，请手动选择复制'); }
    document.body.removeChild(ta);
  }
  try{
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(done, fallback);
      return;
    }
  }catch(e){}
  fallback();
}
function copyNewsItem(k){
  var arr = newsCombined(), x = null;
  for(var i = 0; i < arr.length; i++){ if(arr[i]._k === k){ x = arr[i]; break; } }
  if(!x) return;
  var lines = ['【' + (x.cat || '资讯') + '】' + x.t];
  if(x.sum) lines.push(x.sum);
  lines.push('来源：' + (x.src || '未标注') + (x.date ? ' · ' + x.date : '') + '｜花期册平台');
  copyText(lines.join('\n'));
}
function copyCompare(){
  var box = document.getElementById('cmp-result');
  var table = box && box.querySelector('table');
  if(!table){ toast('先生成对比，再复制'); return; }
  var rows = [];
  table.querySelectorAll('tr').forEach(function(tr){
    var cells = [];
    tr.querySelectorAll('th,td').forEach(function(td){ cells.push(td.textContent.trim()); });
    if(cells.length) rows.push(cells.join(' ｜ '));
  });
  copyText('花期册平台 · 择校对比\n' + rows.join('\n') + '\n（口径详见站内「数据来源与核验」）');
}
function copySchoolSummary(){
  var d = (typeof SCHOOL_DB !== 'undefined' && currentOpenSchool) ? SCHOOL_DB[currentOpenSchool] : null;
  if(!d){ toast('未打开档案'); return; }
  var lines = ['【学校档案】' + currentOpenSchool];
  ['办学性质','所在区','创办','校训','校区地址','校园规模','师资概况','办学特色','招生范围','通勤参考','住宿','收费口径','指标到校','官网','数据来源'].forEach(function(k){
    if(d[k]) lines.push(k + '：' + d[k]);
  });
  lines.push('（来源与核验日期以站内档案为准）');
  copyText(lines.join('\n'));
}
function openChangelog(){
  var d = document.getElementById('changelog-modal');
  if(d && d.showModal) d.showModal();
}


/* ---------- 32-learn ---------- */
/* ---------- v0.12：家长学堂（专家问答 + 过来人经验） ---------- */
var learnFilter = 'all';
function filterLearn(s){ learnFilter = s; renderLearn(); }
function renderLearn(){
  var qa = document.getElementById('learn-qa'), tips = document.getElementById('learn-tips');
  if(!qa || !tips) return;
  var f = function(x){ return learnFilter === 'all' || x.s === learnFilter; };
  var q = LEARN_QA.filter(f), t = LEARN_TIPS.filter(f);
  qa.innerHTML = q.length
    ? q.map(function(x){ var h = 'articles/' + (ARTMAP['L|' + x.q] || ''); return '<details class="lq"><summary><span class="lq-tag">' + esc(x.s) + '</span><a class="lq-link" href="' + h + '">' + esc(x.q) + '</a></summary><div class="lq-a">' + x.a + '<span class="lq-by">' + esc(x.by) + '</span></div></details>'; }).join('')
    : '<div class="empty-mini">该分类暂无问答——试试其他分类。</div>';
  tips.innerHTML = t.length
    ? t.map(function(x){ return '<details class="lq"><summary><span class="lq-tag gold">' + esc(x.s) + '</span><a class="lq-link" href="articles/' + (ARTMAP['L|' + x.q] || '') + '">' + esc(x.q) + '</a></summary><div class="lq-a">' + x.a + '<span class="lq-by">' + esc(x.by) + '</span></div></details>'; }).join('')
    : '<div class="empty-mini">该分类暂无经验分享——试试其他分类。</div>';
  document.querySelectorAll('#learn-filter .ff').forEach(function(b){ b.classList.toggle('on', b.dataset.ls === learnFilter); b.setAttribute('aria-pressed', String(b.dataset.ls === learnFilter)); });
}


/* ---------- 33-utils ---------- */
/* ---------- v0.14：大字版无障碍 / 本机数据管理 ---------- */
function initFsToggle(){
  var on = false;
  try{ on = localStorage.getItem('jfm_fs') === '1'; }catch(e){}
  if(on) document.documentElement.classList.add('fs-large');
  var btn = document.getElementById('fsToggle');
  if(btn){ btn.textContent = on ? '大字版：已开' : '大字版：关'; btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', String(on)); }
}
function toggleFs(){
  var on = document.documentElement.classList.toggle('fs-large');
  try{ localStorage.setItem('jfm_fs', on ? '1' : '0'); }catch(e){}
  var btn = document.getElementById('fsToggle');
  if(btn){ btn.textContent = on ? '大字版：已开' : '大字版：关'; btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', String(on)); }
  toast(on ? '已开启大字版（可在「我的」随时切换）' : '已恢复标准字号');
}
function exportMyData(){
  var out = {};
  ['jfm_children','jfm_active','jfm_alerts','jfm_cmp_fav','jfm_news_user','jfm_profile','jfm_fs','jfm_theme','jfm_ann_closed'].forEach(function(k){
    try{ var v = localStorage.getItem(k); if(v !== null && v !== undefined) out[k] = v; }catch(e){}
  });
  out._exportedAt = new Date().toISOString();
  out._note = '花期册平台 · 本机数据导出（JSON）';
  var blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
  var u = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = u; a.download = 'jfm-my-data.json';
  document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(u); a.remove(); }, 1200);
  toast('已导出本机数据（' + Object.keys(out).length + ' 项）');
}
function clearMyData(){
  if(!confirm('确定清空本机全部数据吗？（档案/提醒/收藏/资讯编辑/显示设置，不影响线上站点）')) return;
  var n = 0;
  ['jfm_children','jfm_active','jfm_alerts','jfm_cmp_fav','jfm_news_user','jfm_profile','jfm_fs','jfm_theme','jfm_ann_closed'].forEach(function(k){
    try{ if(localStorage.getItem(k) !== null){ localStorage.removeItem(k); n++; } }catch(e){}
  });
  toast('已清空本机数据（' + n + ' 项），即将刷新…');
  setTimeout(function(){ location.reload(); }, 1000);
}
/* ---------- v0.23：本机数据导入恢复 / 我的页统计条 ---------- */
function importMyData(){
  var f = document.getElementById('import-file');
  if(f) f.click();
}
function onImportFile(input){
  var file = input.files && input.files[0]; if(!file) return;
  var reader = new FileReader();
  reader.onload = function(){
    var data = null;
    try{ data = JSON.parse(String(reader.result || '')); }catch(e){ toast('导入失败：JSON 格式不正确'); input.value=''; return; }
    var keys = ['jfm_children','jfm_active','jfm_alerts','jfm_cmp_fav','jfm_news_user','jfm_profile','jfm_fs','jfm_theme','jfm_ann_closed'];
    var hit = [];
    if(data && typeof data === 'object'){ keys.forEach(function(k){ if(k in data) hit.push(k); }); }
    if(!hit.length){ toast('导入失败：未识别到可导入的数据键'); input.value=''; return; }
    if(!window.confirm('将导入 ' + hit.length + ' 项数据并覆盖当前本机数据，确定继续？')){ input.value=''; return; }
    try{
      hit.forEach(function(k){
        var v = data[k];
        localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
      });
      toast('导入成功（' + hit.length + ' 项），正在刷新…');
      setTimeout(function(){ location.reload(); }, 600);
    }catch(e){ toast('导入失败：本机存储不可用'); }
    input.value = '';
  };
  reader.onerror = function(){ toast('导入失败：文件读取错误'); input.value=''; };
  reader.readAsText(file);
}
function renderMeStats(){
  var el = document.getElementById('me-stats'); if(!el) return;
  function cnt(k){ var n = 0; try{ var v = JSON.parse(localStorage.getItem(k) || '[]'); if(v && v.length) n = v.length; }catch(e){} return n; }
  el.innerHTML = '<span class="ms-chip">孩子 <b>' + cnt('jfm_children') + '</b></span><span class="ms-chip">提醒 <b>' + cnt('jfm_alerts') + '</b></span><span class="ms-chip">对比收藏 <b>' + cnt('jfm_cmp_fav') + '</b></span><span class="ms-chip">本机资讯 <b>' + cnt('jfm_news_user') + '</b></span>';
}


/* ---------- 34-theme ---------- */
/* ---------- v0.15：深色模式（跟随系统 / 手动；本机记忆） ---------- */
function getThemePref(){ try{ return localStorage.getItem('jfm_theme') || 'auto'; }catch(e){ return 'auto'; } }
function systemDark(){
  try{ return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches); }
  catch(e){ return false; }
}
function effTheme(pref){ return pref === 'dark' || pref === 'light' ? pref : (systemDark() ? 'dark' : 'light'); }
function applyTheme(pref){
  var eff = effTheme(pref);
  document.documentElement.classList.toggle('theme-dark', eff === 'dark');
  document.documentElement.setAttribute('data-theme', eff);
  var meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute('content', eff === 'dark' ? '#0D131B' : '#24344D');
  document.querySelectorAll('.theme-seg .mini-btn').forEach(function(b){
    var on = b.getAttribute('data-th') === pref;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
  var note = document.getElementById('theme-note');
  if(note){
    note.textContent = pref === 'auto'
      ? ('当前跟随系统：' + (eff === 'dark' ? '深色' : '浅色') + '。也可固定为浅色或深色（仅本机记忆）。')
      : (pref === 'dark' ? '已固定深色模式（仅本机浏览器记忆，可随时改回）。' : '已固定浅色模式（仅本机浏览器记忆，可随时改回）。');
  }
}
function setTheme(pref){
  try{ localStorage.setItem('jfm_theme', pref); }catch(e){}
  applyTheme(pref);
  toast(pref === 'auto' ? '外观已跟随系统' : (pref === 'dark' ? '已切换深色模式' : '已切换浅色模式'));
}
function initTheme(){
  applyTheme(getThemePref());
  if(window.matchMedia){
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onSys = function(){ if(getThemePref() === 'auto') applyTheme('auto'); };
    if(mq.addEventListener) mq.addEventListener('change', onSys);
    else if(mq.addListener) mq.addListener(onSys);
  }
}


/* ---------- 35-pageui ---------- */
/* ---------- v0.16：返回顶部 / 阅读进度条 ---------- */
function initPageUI(){
  var btn = document.getElementById('toTop');
  var bar = document.getElementById('readBar');
  function onScroll(){
    var doc = document.documentElement;
    var y = window.scrollY || doc.scrollTop || 0;
    if(btn) btn.classList.toggle('show', y > 600);
    if(bar){
      var max = doc.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(100, Math.max(0, (y / max) * 100)) : 0;
      bar.style.width = pct.toFixed(1) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
}

/* ---------- v0.62：学段深链 ----------
   首页「按学段直达」把家长送到 wiki.html#初升高 / calendar.html#初升高 这类地址，
   但 details 不会因 hash 自动展开、日历也不会自动按学段过滤——这里做落地处理。 */
var STAGE_HASH_KEYS = ['幼升小', '小升初', '初升高', '高考'];
function initStageDeepLink(){
  var h = location.hash || '';
  if(h.length < 2) return;
  var key;
  try { key = decodeURIComponent(h.slice(1)); } catch(e) { key = h.slice(1); }
  if(STAGE_HASH_KEYS.indexOf(key) < 0) return;      // 白名单：hash 不参与选择器拼接
  var btn = document.querySelector('#calendar .cal-filter .ff[data-cf="' + key + '"]');
  if(btn) filterCal(key);                            // 日历页：按学段过滤
  var d = document.querySelector('#wiki details[data-cat="' + key + '"]');
  if(d){
    document.querySelectorAll('#wiki details[open]').forEach(function(x){ if(x !== d) x.open = false; });
    d.open = true;                                   // 百科页：只展开命中的那一阶段
  }
  var target = btn ? document.querySelector('#calendar .cal-filter') : d;
  if(target && target.scrollIntoView) target.scrollIntoView({ block: 'center' });
}

/* v0.99：档案库分区导航当前项高亮（不依赖 boot 时序，DOMContentLoaded 即执行） */
document.addEventListener('DOMContentLoaded', function(){
  var nav = document.querySelector('.sch-subnav'); if(!nav) return;
  var here = (location.pathname.split('/').pop() || 'index.html');
  Array.prototype.forEach.call(nav.querySelectorAll('a'), function(a){
    if(a.getAttribute('href') === here){ a.classList.add('on'); a.setAttribute('aria-current','page'); }
  });
});


/* ---------- 36-a11y ---------- */
/* ---------- v0.17：键盘快捷键帮助（?） / 弹窗焦点圈定 ---------- */
function openKbdHelp(){
  var d = document.getElementById('kbd-modal');
  if(d && d.showModal) d.showModal();
}
function toggleKbdHelp(){
  var d = document.getElementById('kbd-modal'); if(!d) return;
  if(d.open) d.close(); else d.showModal();
}
function initKbdHelp(){
  document.addEventListener('keydown', function(e){
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    if(tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if(e.key === '?'){ e.preventDefault(); toggleKbdHelp(); }
  });
}
/* 原生 dialog 的 Tab 圈定不完整：补一层「首尾循环 + 圈外拉回」 */
function initDialogFocusTrap(){
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Tab') return;
    var d = document.querySelector('dialog[open]');
    if(!d) return;
    var els = d.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])');
    els = Array.prototype.filter.call(els, function(el){ return el.getClientRects().length > 0; });
    if(!els.length) return;
    var first = els[0], last = els[els.length - 1], active = document.activeElement;
    if(!d.contains(active)){ e.preventDefault(); (e.shiftKey ? last : first).focus(); return; }
    if(!e.shiftKey && active === last){ e.preventDefault(); first.focus(); }
    else if(e.shiftKey && active === first){ e.preventDefault(); last.focus(); }
  }, true);
}


/* ---------- 37-lifecalc ---------- */
/* ---------- v0.22：陪读成本速算器 ---------- */
var LT_RENT = {
  '沙坪坝 · 南开周边': { '一室': [1800, 2700], '两室': [2800, 4200] },
  '渝北 · 一中周边': { '一室': [1600, 2500], '两室': [2500, 3800] },
  '渝中 · 巴蜀周边': { '一室': [2000, 3000], '两室': [3000, 4500] },
  '南岸 · 十一中周边': { '一室': [1500, 2300], '两室': [2200, 3400] },
  '江北 · 十八中周边': { '一室': [1600, 2400], '两室': [2400, 3600] }
};
var LT_LIFE = { '简省': [1200, 1800], '常规': [1800, 2600], '宽裕': [2600, 3800] };
var LT_COMMUTE = { '步行/骑行': [0, 100], '轨道/公交': [150, 300], '自驾': [500, 900] };
function ltNum(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function calcLifeCost(){
  var area = document.getElementById('lt-area').value;
  var room = document.getElementById('lt-room').value;
  var life = document.getElementById('lt-life').value;
  var com  = document.getElementById('lt-commute').value;
  var out = document.getElementById('lt-out'); if(!out) return;
  var r = LT_RENT[area] && LT_RENT[area][room];
  if(!r){ toast('请选择片区'); return; }
  var l = LT_LIFE[life], c = LT_COMMUTE[com];
  var lo = r[0] + l[0] + c[0], hi = r[1] + l[1] + c[1];
  window._ltResult = '花期册平台 · 陪读成本估算\n片区：' + area + ' · ' + room + '\n房租：' + ltNum(r[0]) + '–' + ltNum(r[1]) + ' 元/月\n生活（' + life + '档）：' + ltNum(l[0]) + '–' + ltNum(l[1]) + ' 元/月\n通勤（' + com + '）：' + ltNum(c[0]) + '–' + ltNum(c[1]) + ' 元/月\n合计约 ' + ltNum(lo) + '–' + ltNum(hi) + ' 元/月\n（不含学费与培训费用；口径为行情样本）';
  out.innerHTML = '<div class="lt-total">每月合计约 <b>' + ltNum(lo) + '–' + ltNum(hi) + ' 元</b>（不含学费与培训）</div>'
    + '<div class="lt-detail"><span>房租：' + ltNum(r[0]) + '–' + ltNum(r[1]) + ' 元</span><span>生活（' + life + '）：' + ltNum(l[0]) + '–' + ltNum(l[1]) + ' 元</span><span>通勤（' + com + '）：' + ltNum(c[0]) + '–' + ltNum(c[1]) + ' 元</span></div>'
    + '<div class="lt-actions"><button class="mini-btn" onclick="copyLifeCost()">复制结果</button></div>';
}
function copyLifeCost(){
  if(!window._ltResult){ toast('先做一次估算'); return; }
  copyText(window._ltResult);
}


/* ---------- 38-countdown ---------- */
/* ---------- v0.24：关键节点倒计时条（首屏今日提示） ---------- */
function renderCountdown(){
  var el = document.getElementById('cd-bar'); if(!el) return;
  var nodes = [];
  if(!document.querySelector('.cal-grid .cal')){
    nodes = [
      { t: new Date(2027, 5, 1), label: '幼升小报名与材料准备' },
      { t: new Date(2026, 8, 1), label: '转学与户籍材料核对' },
      { t: new Date(2026, 9, 1), label: '指标到校资格摸底' },
      { t: new Date(2027, 2, 1), label: '中考报名与体检（示例）' },
      { t: new Date(2027, 5, 1), label: '高考（示例）' }
    ];
  } else document.querySelectorAll('.cal-grid .cal').forEach(function(c){
    var dEl = c.querySelector('.date'), h = c.querySelector('h4');
    if(!dEl || !h) return;
    var m = (dEl.textContent || '').match(/(\d{4})-(\d{2})/);
    if(!m) return;
    nodes.push({ t: new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, 1), label: h.textContent.trim() });
  });
  if(!nodes.length){ el.textContent = '升学节点加载中…'; return; }
  var now = new Date(); now.setHours(0, 0, 0, 0);
  var firstThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  var best = null;
  nodes.forEach(function(n){
    if(n.t < firstThisMonth) return;
    if(!best || n.t < best.t) best = n;
  });
  if(!best){ el.textContent = '关键节点季进行中——以官方公告与「升学日历」为准。'; return; }
  var days = Math.round((best.t - now) / 86400000);
  var when = best.t.getFullYear() + ' 年 ' + (best.t.getMonth() + 1) + ' 月';
  var timing = days > 0 ? ('约 <b>' + days + '</b> 天') : '就在本月';
  el.innerHTML = '距「' + esc(best.label) + '」（' + when + '）' + timing + ' · <a href="calendar.html">看升学日历 →</a> <span class="cd-note">（以当年官方发布为准）</span>';
}


/* ---------- 39-materials ---------- */
/* ---------- v0.25：入学材料清单生成器 ---------- */
var MAT_COMMON = [
  '户口簿（原件 + 复印件：首页、户主页、孩子页）',
  '孩子出生医学证明',
  '父母双方身份证（原件 + 复印件）'
];
var MAT_STAGE = {
  '小学一年级': ['预防接种证 + 查验单（开学前完成接种查验）', '《义务教育入学通知书》/ 报名回执（按区流程）'],
  '初中一年级': ['小学毕业学籍证明 / 素质报告册', '《义务教育入学通知书》/ 报名回执（按区流程）'],
  '高中一年级': ['中考准考证 / 成绩单', '录取通知书（报到注册用）']
};
var MAT_HUKOU = {
  '本区户籍': ['户籍地居住证明（房产证或居住材料）'],
  '跨区户籍': ['居住证明（地址须与实际居住一致）', '跨区就读要求材料（按拟入学区当年公告核对）'],
  '随迁（非户籍）': ['居住证（地址与居住一致、在有效期内）', '社保连续缴纳记录或营业执照（按区要求）', '劳动合同 / 就业证明（按区要求）']
};
var MAT_HOUSE = {
  '自有产权房': ['不动产权证（或购房合同 + 契税凭证）'],
  '租赁（备案）': ['房屋租赁合同', '租赁备案证明（部分区要求）'],
  '其他（借住等）': ['实际居住证明（水电气缴费单等，按区要求）']
};
var MAT_EXTRA = [
  '多孩家庭：长幼随学申请材料（如有二孩随学需求）',
  '优抚对象：相关证件（按当年政策办理）',
  '统一建议：所有材料原件 + 复印件各一套、电子扫描件备份'
];
function fmtList(arr){ return arr.map(function(x){ return '<li><span class="ck2"></span>' + esc(x) + '</li>'; }).join(''); }
function genMaterials(){
  var box = document.getElementById('mat-out'); if(!box) return;
  var stage = document.getElementById('mat-stage').value;
  var hk = document.getElementById('mat-hukou').value;
  var house = document.getElementById('mat-house').value;
  window._matResult = '花期册平台 · 入学材料清单\n学段：' + stage + ' · 户籍：' + hk + ' · 住房：' + house + '\n\n【通用】\n- ' + MAT_COMMON.join('\n- ')
    + '\n\n【学段材料（' + stage + '）】\n- ' + MAT_STAGE[stage].join('\n- ')
    + '\n\n【户籍相关（' + hk + '）】\n- ' + MAT_HUKOU[hk].join('\n- ')
    + '\n\n【住房相关（' + house + '）】\n- ' + MAT_HOUSE[house].join('\n- ')
    + '\n\n【如有特殊情况】\n- ' + MAT_EXTRA.join('\n- ')
    + '\n\n（口径：以拟入学区当年公告为准；不替代官方清单）';
  box.innerHTML =
    '<h4 class="mat-h">通用材料</h4><ul class="mat-list">' + fmtList(MAT_COMMON) + '</ul>'
    + '<h4 class="mat-h">学段材料（' + esc(stage) + '）</h4><ul class="mat-list">' + fmtList(MAT_STAGE[stage]) + '</ul>'
    + '<h4 class="mat-h">户籍相关（' + esc(hk) + '）</h4><ul class="mat-list">' + fmtList(MAT_HUKOU[hk]) + '</ul>'
    + '<h4 class="mat-h">住房相关（' + esc(house) + '）</h4><ul class="mat-list">' + fmtList(MAT_HOUSE[house]) + '</ul>'
    + '<h4 class="mat-h">如有特殊情况</h4><ul class="mat-list">' + fmtList(MAT_EXTRA) + '</ul>'
    + '<div class="mat-actions"><button class="mini-btn" onclick="copyMaterials()">复制清单</button><button class="mini-btn" onclick="window.print()">打印清单</button><span class="mat-note">以拟入学区当年公告为准；不替代官方清单</span></div>';
}
function copyMaterials(){
  if(!window._matResult){ toast('先生成清单'); return; }
  copyText(window._matResult);
}


/* ---------- 40-router ---------- */
/* ---------- v0.29：多页架构 · 跨页路由 ---------- */
/* 每页加载后按 URL 参数执行跨页联动；数据页缺失的渲染函数有元素守卫，可安全全量调用。 */
function qparam(name){
  var m = new RegExp('[?&]' + name + '=([^&]*)').exec(location.search);
  return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
}
function bootPageRoute(){
  // 论坛页（v0.80）
  if(document.getElementById('forum-list')) initForum();
  // 首页热点榜
  if(document.getElementById('hot-rank')) renderHotRank();
  // 搜索页：填热门词 + 执行查询
  if(document.getElementById('sp-out')){
    var hot = document.getElementById('sp-hot'); if(hot) hot.innerHTML = hotWordsHTML();
    runPageSearch();
  }
  // 1) news.html?s=关键词 → 筛选并展开定位
  var s = qparam('s');
  if(s && document.getElementById('news-list')){
    newsFilter = 'all'; newsQuery = s; renderNews();
    try{ var qEl = document.getElementById('news-q'); if(qEl) qEl.value = s; }catch(e){}
    setTimeout(function(){
      var el = document.querySelector('#news-list .news-item');
      if(el){ var b = el.querySelector('.ni-body'); if(b) b.hidden = false;
        var tt = el.querySelector('.ni-title'); if(tt) tt.setAttribute('aria-expanded','true');
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('flash'); setTimeout(function(){ el.classList.remove('flash'); }, 1400); }
    }, 250);
  }
  // 2) schools.html?school=校名 → 打开档案弹窗
  var sc = qparam('school');
  if(sc && document.getElementById('school-grid')){
    setTimeout(function(){ if(SCHOOL_DB[sc]) openSchool(sc); }, 300);
  }
  // 3) compare.html?fav=1 → 恢复收藏对比
  if(qparam('fav') === '1' && document.getElementById('sel-a')){
    restoreFav();
  }
  // 4) schools.html?fav=1 → 加入对比后跳转
  var add = qparam('add');
  if(add && document.getElementById('sel-a')){
    ['sel-a','sel-b','sel-c'].forEach(function(id){
      var sel = document.getElementById(id); if(sel && !sel.value){ sel.value = add; }
    });
    runCompare();
    var el = document.getElementById('compare');
    if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
  }
}


/* ---------- 41-portal ---------- */
/* ---------- v0.31：插画挂载：扫 data-art 占位与 hero 插槽 ---------- */
/* v0.53：固定图位先登记（artPhotoURL 会记入已用集合），列表再从中避让，全页不撞图 */
function mountArt(){
  try{
    var hero = document.getElementById('hero-art-slot');
    if(hero && !hero.hasChildNodes()){
      var hu = artPhotoURL('hero');
      if(hu) hero.innerHTML = '<img decoding="async" src="' + hu + '" alt="重庆校园实景照片">';
      else hero.innerHTML = artSVG('hero');
    }
  }catch(e){}
  document.querySelectorAll('[data-art]').forEach(function(el){
    if(el.hasChildNodes()) return;
    var kind = el.getAttribute('data-art');
    try{
      var u = (typeof artPhotoURL === 'function') ? artPhotoURL(kind) : '';
      if(u){ el.innerHTML = '<img loading="lazy" decoding="async" src="' + u + '" alt="重庆校园实景照片">'; }
      else{ el.innerHTML = artSVG(kind); }
    }catch(e){}
  });
}

/* ---------- v0.30：搜索页 / FAQ / 热点榜 ---------- */
var HOT_WORDS = ['指标到校', '三对口', '特招线', '摇号', '联招线', '选科', '公费师范生', '两江新区', '西南大学', '南开中学'];
function hotWordsHTML(){
  return HOT_WORDS.map(function(w){
    return '<a href="search.html?q=' + encodeURIComponent(w) + '">' + esc(w) + '</a>';
  }).join('');
}
/* 搜索页主逻辑：聚合 SEARCH_DB / 资讯 / 学校 */
function runPageSearch(qOverride){
  var q = (qOverride != null ? qOverride : (qparam('q') || ''));
  q = String(q).trim();
  var box = document.getElementById('sp-input'); if(box && qOverride == null) box.value = q;
  var out = document.getElementById('sp-out'); if(!out) return;
  var head = document.getElementById('sp-head');
  if(!q){
    if(head) head.textContent = '输入关键词，搜全站';
    out.innerHTML = '<div class="sp-empty">试试上方热门词，或直接输入：学校名 / 大学名 / 政策词 / 术语 / 资讯标题。</div>';
    return;
  }
  if(head) head.textContent = '「' + q + '」的搜索结果';
  var ql = q.toLowerCase();
  var rows = [];
  try{
    Object.keys(SCHOOL_DB).forEach(function(k){
      var d = SCHOOL_DB[k] || {};
      var hay = (k + ' ' + (d['全称']||'') + ' ' + (d['简介']||'') + ' ' + (d['概况']||'') + ' ' + (d['校训']||'') + ' ' + (d['校区地址']||'') + ' ' + (d['创办']||'') + ' ' + (d['办学特色']||'')).toLowerCase();
      if(hay.indexOf(ql) >= 0){
        rows.push({ tag: '学校', t: k, s: (typeof _schoolHint === 'function' ? _schoolHint(k, ql) : (d['简介'] || '').slice(0, 60)), href: 'schools.html?school=' + encodeURIComponent(k) });
      }
    });
  }catch(e){}
  try{
    newsCombined().forEach(function(x){
      var hay = ((x.t || '') + ' ' + (x.sum || '') + ' ' + (x.src || '') + ' ' + (x.body || '')).toLowerCase();
      if(hay.indexOf(ql) >= 0){
        rows.push({ tag: '资讯', t: x.t, s: '来源：' + (x.src || '编辑部') + ' · ' + (x.date || ''), href: 'news.html?s=' + encodeURIComponent((x.t || '').slice(0, 12)) });
      }
    });
  }catch(e){}
  try{
    if(typeof DAXUE !== 'undefined'){
      DAXUE.schools.forEach(function(s){
        var hay = (s.name + ' ' + s.city + ' ' + (s.disc || []).join(' ') + ' ' + (s.majors || []).join(' ') + ' ' + (s.tier || '') + ' ' + (s.branch || '')).toLowerCase();
        if(hay.indexOf(ql) >= 0){
          var lw = s.L && s.L.wl ? (s.L.wl['2026'] || s.L.wl['2025']) : null;
          rows.push({ tag: '大学', t: s.name + (s.branch ? '（' + s.branch + '）' : ''), s: (s.tier === '985' ? '985' : '211') + ' · ' + s.city + ' · ' + (lw ? '2026物理投档 ' + lw[0] + ' 分' : '五年投档线趋势见专栏'), href: 'daxue.html?u=' + encodeURIComponent(s.name) });
        }
      });
    }
  }catch(e){}
  SEARCH_DB.forEach(function(x){
    if((x.s + ' ' + x.t).toLowerCase().indexOf(ql) >= 0){
      var pg = ANCHOR2PAGE[x.a] || 'index.html';
      rows.push({ tag: x.t, t: x.s, s: '站内专栏', href: pg });
    }
  });
  if(!rows.length){
    out.innerHTML = '<div class="sp-empty">没有找到与「' + esc(q) + '」相关的内容——换个说法试试，或到<a href="forum.html" style="color:var(--accent)">家长论坛</a>发帖讨论。</div>';
    return;
  }
  out.innerHTML = '<p class="cmp-note" style="margin-bottom:10px">共命中 ' + rows.length + ' 条（学校 / 大学 / 资讯 / 政策 / 术语）</p>'
    + '<div class="sp-list">' + rows.map(function(r){
      return '<a class="sp-row" href="' + r.href + '"><span class="s-badge">' + esc(r.tag) + '</span>'
        + '<span class="t">' + esc(r.t) + '<small>' + esc(r.s || '') + '</small></span></a>';
    }).join('') + '</div>';
}
/* FAQ 页筛选 */
function faqFilter(cat){
  document.querySelectorAll('.faq-grid .faq-item').forEach(function(d){
    d.style.display = (cat === 'all' || d.dataset.cat === cat) ? '' : 'none';
  });
  document.querySelectorAll('.faq-cats .ff').forEach(function(b){
    var on = b.dataset.fc === cat;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
  });
}
/* 首页热点榜（由资讯 seed 生成，取前 8） */
function jfmCleanTitle(t){
  var x = String(t || '');
  x = x.replace(/^\s*要闻\s*[:：]?\s*/,'');
  x = x.replace(/\s*20\d{2}-\d{2}-\d{2}\s*/g,' ');
  x = x.replace(/\s*\.\.\.\s*$/,'').replace(/…$/,'');
  return x.replace(/\s+/g,' ').trim();
}
function jfmTitleKey(t){
  return jfmCleanTitle(t).replace(/[，。：:、\s]/g,'').slice(0, 14);
}
function renderHotRank(){
  var box = document.getElementById('hot-rank'); if(!box) return;
  var items = [];
  try{
    var all = newsCombined();
    if(typeof jfmRelevance === 'function'){
      /* 质量优先：宁缺毋滥——强相关不足时缩小榜单，不用弱相关凑数 */
      var pool = all.filter(function(x){ return jfmRelevance(x) >= 8; });
      if(pool.length < 3) pool = all.filter(function(x){ return jfmRelevance(x) >= 6; });
      if(pool.length < 2) pool = all.filter(function(x){ return jfmRelevance(x) >= 4; });
      all = pool;
    }
    items = all.slice(0, 7);
  }catch(e){ return; }
  if(!items.length){ box.innerHTML = '<div class="empty-mini">资讯加载中…</div>'; return; }
  /* 澎湃头版式：第 1 条做头条大卡（大图 + 衬线大标题 + 摘要），2-7 做序号榜单 */
  var lead = items[0];
  var leadKey = jfmTitleKey(lead.t);
  var rest = items.slice(1).filter(function(x){ return jfmTitleKey(x.t) !== leadKey; });
  var leadHref = 'news.html?s=' + encodeURIComponent((lead.t || '').slice(0, 12));
  var artKey = (typeof ARTMAP !== 'undefined') ? (ARTMAP['N|' + lead.t] || '') : '';
  if(artKey) leadHref = 'articles/' + artKey;
  var html = '<div class="hr-editorial">'
    + '<a class="hr-lead" href="' + leadHref + '">'
    + '<span class="hr-lead-tag">今日头条</span>'
    + '<span class="hr-lead-img"><img loading="lazy" decoding="async" src="' + (typeof photoURLForItem === "function" ? photoURLForItem((lead._k||"") + "|" + (lead.t||"")) : "") + '" alt="' + (typeof NEWS_PHOTO_ALT !== "undefined" ? (NEWS_PHOTO_ALT[lead.cat] || "教育资讯主题配图") : "教育资讯配图") + '"></span>'
    + '<span class="hr-lead-main"><span class="hr-lead-title">' + esc(jfmCleanTitle(lead.t)) + '</span>'
    + (lead.sum ? '<span class="hr-lead-sum">' + esc(lead.sum).slice(0, 80) + '…</span>' : '')
    + '<span class="hr-lead-meta">' + esc(lead.cat || '') + ' · ' + esc(lead.src || '') + ' · ' + esc(lead.date || '') + '</span></span></a>';
  if(rest.length){
    html += '<div class="hot-rank hr-list">' + rest.map(function(x, i){
      var href = 'news.html?s=' + encodeURIComponent((x.t || '').slice(0, 12));
      return '<a href="' + href + '"><span class="no' + (i < 2 ? ' hot-no3' : ' hot-no') + '">' + (i + 2) + '</span>'
        + '<span class="t">' + esc(jfmCleanTitle(x.t)) + '</span><span class="meta">' + esc(x.cat || '') + '</span></a>';
    }).join('') + '</div>';
  }
  html += '</div>';
  box.innerHTML = html;
}


/* ---------- v0.34 联系页留言 · v0.81 诚实化 ----------
   后端可用（本地/自部署）时真实写库；静态托管环境如实告知"保存在本机"，绝不假装成功。 */
function submitContact(){
  var name = (document.getElementById('ct-name')||{}).value || '';
  var type = (document.getElementById('ct-type')||{}).value || '咨询';
  var ct = (document.getElementById('ct-contact')||{}).value || '';
  var msg = (document.getElementById('ct-msg')||{}).value || '';
  if(!name.trim()){ toast('请填写称呼'); return; }
  if(msg.trim().length < 5){ toast('留言内容至少 5 个字'); return; }
  var payload = JSON.stringify({ name: name.trim(), type: type, contact: ct.trim(), message: msg.trim() });
  var item = { id: 'LY-' + new Date().toISOString().slice(0,10) + '-' + String(Date.now()).slice(-6),
               name: name.trim(), type: type, contact: ct.trim(), message: msg.trim(), date: new Date().toISOString() };
  fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload })
    .then(function(r){ return r.json().then(function(d){ return { ok: r.ok, d: d }; }); })
    .then(function(res){
      if(res.ok){
        toast('留言已登记（' + res.d.item.id + '），感谢！');
        var m = document.getElementById('ct-msg'); if(m) m.value = '';
        var note = document.getElementById('ct-note');
        if(note) note.textContent = '已提交：编号 ' + res.d.item.id + ' · ' + res.d.item.created;
      } else { throw new Error(res.d.error || '未知错误'); }
    }).catch(function(){
      try{
        var out = JSON.parse(localStorage.getItem('jfm_contact_outbox') || '[]');
        out.unshift(item); localStorage.setItem('jfm_contact_outbox', JSON.stringify(out));
      }catch(e){}
      var m = document.getElementById('ct-msg'); if(m) m.value = '';
      var note = document.getElementById('ct-note');
      if(note) note.textContent = '当前为演示环境（静态托管）：留言编号 ' + item.id + '，已保存在本机浏览器；正式版接入后端后将自动同步，不会丢失。';
      toast('留言已保存到本机（演示环境）');
      if(typeof jfmTrack === 'function') jfmTrack('contact_submit', { type: type, local: true });
    });
}



/* ---------- 45-quguide ---------- */
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
  var html = '<div class="qug-grid">';
  html += QU_GUIDE.map(function(g){
    return '<a class="qug-item" href="' + g.url + '" target="_blank" rel="noopener">'
      + '<span class="qug-qu">' + esc(g.qu) + '</span>'
      + '<span class="qug-org">' + esc(g.org) + '</span>'
      + '<span class="qug-note">' + esc(g.note) + '</span>'
      + '<span class="qug-go">官方入口 ↗</span></a>';
  }).join('');
  html += '</div>';
  html += '<p class="cmp-note">以上 ' + QU_GUIDE.length + ' 条官方入口于 2026-09-30 逐一 HTTP 实测可达（2xx）；招生细则以各区当年公告为准。江北/渝北两区经「渝快办」统一入口办理义务教育入学。</p>';
  box.innerHTML = html;
}


/* ---------- 42-art ---------- */
/* ---------- v0.31：品牌插画素材库（内联 SVG，零外部依赖） ---------- */
/* 统一风格：2.5D 扁平插画风，品牌海军蓝 #24344D / 青绿 #0E7C66 / 暖橙点缀 #D9534F */
function artSVG(kind){
  var NAVY = '#24344D', TEAL = '#0E7C66', TEAL2 = '#4CC2A3', ORANGE = '#E8A33D', CREAM = '#F4EFE6', INK2 = '#46536B', LINE = '#D8DCE3';
  function svg(inner, vb){
    return '<svg viewBox="' + (vb || '0 0 200 140') + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" focusable="false" style="width:100%;height:100%;display:block">' + inner + '</svg>';
  }
  function grad(id, c1, c2){
    return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs>';
  }
  switch(kind){
    /* 首页主视觉：妈妈牵着孩子走向学校（剪影+路径） */
    case 'hero': return svg(
      grad('hg1', '#2E4368', NAVY) + grad('hg2', TEAL2, TEAL) +
      '<rect x="0" y="112" width="200" height="28" rx="4" fill="url(#hg1)"/>' +
      '<circle cx="168" cy="26" r="14" fill="' + ORANGE + '" opacity=".9"/>' +
      '<path d="M0 96 Q60 78 110 88 T200 84" stroke="' + TEAL2 + '" stroke-width="3" fill="none" opacity=".5"/>' +
      /* 学校 */
      '<rect x="138" y="52" width="52" height="46" rx="3" fill="url(#hg2)"/>' +
      '<path d="M132 54 L164 32 L196 54 Z" fill="' + NAVY + '"/>' +
      '<rect x="158" y="74" width="12" height="24" rx="2" fill="' + CREAM + '"/>' +
      '<rect x="144" y="62" width="9" height="9" rx="1.5" fill="' + CREAM + '"/>' +
      '<rect x="175" y="62" width="9" height="9" rx="1.5" fill="' + CREAM + '"/>' +
      '<circle cx="164" cy="22" r="2.5" fill="' + ORANGE + '"/>' +
      /* 树 */
      '<rect x="112" y="84" width="5" height="16" fill="' + INK2 + '"/>' +
      '<circle cx="114" cy="76" r="11" fill="' + TEAL + '" opacity=".85"/>' +
      /* 妈妈 */
      '<circle cx="52" cy="52" r="7" fill="' + NAVY + '"/>' +
      '<path d="M52 60 Q46 74 50 88 L58 88 Q60 72 56 60 Z" fill="' + NAVY + '"/>' +
      '<path d="M50 88 L46 112 M56 88 L60 112" stroke="' + NAVY + '" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M54 66 L70 78" stroke="' + NAVY + '" stroke-width="3.5" stroke-linecap="round"/>' +
      /* 孩子 + 书包 */
      '<circle cx="76" cy="64" r="5.5" fill="' + TEAL + '"/>' +
      '<path d="M76 70 Q72 80 75 89 L81 89 Q82 78 79 70 Z" fill="' + TEAL + '"/>' +
      '<path d="M74 89 L71 108 M79 89 L82 108" stroke="' + TEAL + '" stroke-width="3.6" stroke-linecap="round"/>' +
      '<rect x="80" y="72" width="8" height="10" rx="2.5" fill="' + ORANGE + '"/>' +
      /* 飞鸟 */
      '<path d="M20 40 q5 -6 10 0 M32 34 q5 -6 10 0" stroke="' + INK2 + '" stroke-width="2" fill="none" stroke-linecap="round"/>'
    );
    /* 入口卡：找政策（文件+印章） */
    case 'policy': return svg(
      grad('pg1', '#EEF2F8', '#DDE5F0') +
      '<rect x="0" y="0" width="200" height="140" fill="url(#pg1)"/>' +
      '<rect x="58" y="24" width="84" height="96" rx="6" fill="#fff" stroke="' + LINE + '"/>' +
      '<rect x="70" y="42" width="52" height="6" rx="3" fill="' + NAVY + '" opacity=".85"/>' +
      '<rect x="70" y="56" width="60" height="5" rx="2.5" fill="' + LINE + '"/>' +
      '<rect x="70" y="68" width="48" height="5" rx="2.5" fill="' + LINE + '"/>' +
      '<rect x="70" y="80" width="56" height="5" rx="2.5" fill="' + LINE + '"/>' +
      '<circle cx="118" cy="98" r="13" fill="' + TEAL + '" opacity=".92"/>' +
      '<path d="M112 98 l4 4 l8 -9" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<circle cx="70" cy="30" r="9" fill="' + ORANGE + '"/>' +
      '<path d="M66 30 l3 3 l6 -7" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
    );
    /* 入口卡：找学校（校舍+放大镜） */
    case 'schools': return svg(
      grad('sg1', '#EAF4F1', '#D8EAE5') +
      '<rect x="0" y="0" width="200" height="140" fill="url(#sg1)"/>' +
      '<rect x="52" y="52" width="64" height="52" rx="4" fill="' + TEAL + '"/>' +
      '<path d="M46 54 L84 30 L122 54 Z" fill="' + NAVY + '"/>' +
      '<rect x="78" y="76" width="12" height="28" rx="2" fill="' + CREAM + '"/>' +
      '<rect x="60" y="64" width="10" height="10" rx="1.5" fill="' + CREAM + '"/>' +
      '<rect x="98" y="64" width="10" height="10" rx="1.5" fill="' + CREAM + '"/>' +
      '<circle cx="84" cy="24" r="2.5" fill="' + ORANGE + '"/>' +
      '<circle cx="134" cy="88" r="20" fill="none" stroke="' + NAVY + '" stroke-width="6"/>' +
      '<path d="M148 102 L164 118" stroke="' + NAVY + '" stroke-width="8" stroke-linecap="round"/>'
    );
    /* 入口卡：问问题（对话气泡+问号） */
    case 'fact': return svg(
      grad('fg1', '#FDF3E4', '#F8E7C8') +
      '<rect x="0" y="0" width="200" height="140" fill="url(#fg1)"/>' +
      '<path d="M42 36 h116 a12 12 0 0 1 12 12 v40 a12 12 0 0 1 -12 12 h-70 l-20 20 v-20 h-26 a12 12 0 0 1 -12 -12 v-40 a12 12 0 0 1 12 -12 Z" fill="#fff" stroke="' + LINE + '"/>' +
      '<text x="100" y="82" text-anchor="middle" font-family="Georgia,serif" font-size="42" font-weight="bold" fill="' + ORANGE + '">?</text>' +
      '<circle cx="70" cy="56" r="5" fill="' + TEAL2 + '"/>' +
      '<circle cx="130" cy="56" r="5" fill="' + TEAL2 + '"/>' +
      '<rect x="74" y="86" width="52" height="5" rx="2.5" fill="' + LINE + '"/>'
    );
    /* 资讯封面：新闻报纸 */
    case 'news': return svg(
      grad('ng1', '#EEF2F8', '#DDE5F0') +
      '<rect x="0" y="0" width="200" height="140" fill="url(#ng1)"/>' +
      '<rect x="46" y="28" width="108" height="84" rx="5" fill="#fff" stroke="' + LINE + '"/>' +
      '<rect x="56" y="38" width="88" height="8" rx="2" fill="' + NAVY + '"/>' +
      '<rect x="56" y="54" width="40" height="30" rx="3" fill="' + TEAL2 + '" opacity=".8"/>' +
      '<rect x="102" y="54" width="42" height="5" rx="2.5" fill="' + LINE + '"/>' +
      '<rect x="102" y="64" width="36" height="5" rx="2.5" fill="' + LINE + '"/>' +
      '<rect x="102" y="74" width="40" height="5" rx="2.5" fill="' + LINE + '"/>' +
      '<rect x="56" y="92" width="88" height="5" rx="2.5" fill="' + LINE + '"/>' +
      '<rect x="56" y="102" width="70" height="5" rx="2.5" fill="' + LINE + '"/>' +
      '<circle cx="150" cy="24" r="8" fill="' + ORANGE + '"/>'
    );
    /* 政策页眉：典籍与天平 */
    case 'banner-policy': return svg(
      grad('bp1', '#2E4368', NAVY) +
      '<rect x="0" y="0" width="200" height="140" fill="url(#bp1)"/>' +
      '<rect x="36" y="46" width="44" height="58" rx="4" fill="#fff" opacity=".92"/>' +
      '<rect x="44" y="58" width="28" height="4" rx="2" fill="' + TEAL2 + '"/>' +
      '<rect x="44" y="68" width="28" height="4" rx="2" fill="' + CREAM + '" opacity=".7"/>' +
      '<rect x="44" y="78" width="20" height="4" rx="2" fill="' + CREAM + '" opacity=".7"/>' +
      '<path d="M118 52 h44 M140 52 v44 M126 96 h28" stroke="' + TEAL2 + '" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M112 60 a10 10 0 0 0 12 8 M168 60 a10 10 0 0 1 -12 8" stroke="' + TEAL2 + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      '<circle cx="112" cy="58" r="4" fill="' + ORANGE + '"/>' +
      '<circle cx="168" cy="58" r="4" fill="' + ORANGE + '"/>' +
      '<circle cx="58" cy="30" r="3" fill="' + ORANGE + '" opacity=".8"/>' +
      '<circle cx="150" cy="26" r="4.5" fill="' + TEAL2 + '" opacity=".6"/>'
    );
    /* FAQ 页眉：问答气泡群 */
    case 'banner-faq': return svg(
      grad('bf1', '#2E4368', NAVY) +
      '<rect x="0" y="0" width="200" height="140" fill="url(#bf1)"/>' +
      '<rect x="28" y="38" width="58" height="36" rx="10" fill="#fff" opacity=".95"/>' +
      '<text x="57" y="64" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="bold" fill="' + TEAL + '">Q</text>' +
      '<rect x="112" y="64" width="60" height="36" rx="10" fill="' + TEAL + '"/>' +
      '<text x="142" y="90" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="bold" fill="#fff">A</text>' +
      '<circle cx="42" cy="96" r="6" fill="' + ORANGE + '"/>' +
      '<circle cx="176" cy="46" r="5" fill="' + TEAL2 + '"/>' +
      '<path d="M86 56 h20" stroke="' + CREAM + '" stroke-width="3" stroke-dasharray="4 5" stroke-linecap="round"/>'
    );
    default: return svg('<circle cx="100" cy="70" r="40" fill="' + TEAL2 + '"/>');
  }
}

/* ---------- v0.36：路由到 2.0 插画库（43-art2.js） ---------- */
(function(){
  var _old = artSVG;
  artSVG = function(kind){
    try{ var v = artSVG2(kind); if(v) return v; }catch(e){}
    return _old(kind);
  };
})();


/* ---------- 43-art2 ---------- */
/* ---------- v0.36：插画库 2.0（更丰富的场景层次/渐变/细节/人物） ---------- */
/* 统一规范：宽幅 200x140 场景插画；多层渐变天空 + 地景剪影 + 主体 + 点缀光斑；品牌海军蓝/青绿/暖橙 */
function artSVG2(kind){
  var NAVY='#24344D', NAVY2='#2E4368', TEAL='#0E7C66', TEAL2='#4CC2A3', TEAL3='#7ED9C3',
      ORANGE='#E8A33D', ORANGE2='#F2C879', RED='#D9534F', CREAM='#F7F3EA', INK='#46536B', INK2='#6E7B93';
  var sky = function(id,c1,c2,c3){
    return '<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1">'
      +'<stop offset="0" stop-color="'+c1+'"/><stop offset=".55" stop-color="'+c2+'"/><stop offset="1" stop-color="'+c3+'"/></linearGradient></defs>';
  };
  function wrap(inner){ return '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" focusable="false" style="width:100%;height:100%;display:block">'+inner+'</svg>'; }
  function clouds(y,op){ return '<g opacity="'+op+'"><ellipse cx="34" cy="'+y+'" rx="16" ry="5" fill="#fff"/><ellipse cx="48" cy="'+(y-3)+'" rx="10" ry="4" fill="#fff"/><ellipse cx="150" cy="'+(y+8)+'" rx="13" ry="4.5" fill="#fff"/></g>'; }
  function birds(x,y){ return '<path d="M'+x+' '+y+' q4 -5 8 0 M'+(x+11)+' '+(y-5)+' q4 -5 8 0" stroke="'+INK2+'" stroke-width="1.8" fill="none" stroke-linecap="round"/>'; }
  function person(x,y,scale,color,walk){
    var s = scale||1;
    var leg1 = walk ? 'M'+x+' '+(y+22*s)+' L'+(x-4*s)+' '+(y+40*s) : 'M'+x+' '+(y+22*s)+' L'+(x-2*s)+' '+(y+40*s);
    var leg2 = walk ? 'M'+(x+3*s)+' '+(y+22*s)+' L'+(x+6*s)+' '+(y+40*s) : 'M'+(x+3*s)+' '+(y+22*s)+' L'+(x+4*s)+' '+(y+40*s);
    return '<circle cx="'+x+'" cy="'+(y-6*s)+'" r="'+(5.5*s)+'" fill="'+color+'"/>'
      +'<path d="M'+x+' '+(y)+' q'+(-4*s)+' '+(12*s)+' '+(-1*s)+' '+(22*s)+' l'+(5*s)+' 0 q'+(2*s)+' '+(12*s)+' 0 '+(-22*s)+' Z" fill="'+color+'"/>'
      +'<path d="'+leg1+' M'+(x+3*s)+' '+(y+22*s)+' l'+(2*s)+' '+(18*s)+'" stroke="'+color+'" stroke-width="'+(3.6*s)+'" stroke-linecap="round" fill="none"/>';
  }
  function tree(x,y,r,c){ return '<rect x="'+(x-2)+'" y="'+y+'" width="4" height="'+(r*0.8)+'" fill="'+INK+'"/><circle cx="'+x+'" cy="'+(y-r*0.4)+'" r="'+r+'" fill="'+c+'"/><circle cx="'+(x-r*0.55)+'" cy="'+(y+r*0.1)+'" r="'+(r*0.6)+'" fill="'+c+'" opacity=".85"/><circle cx="'+(x+r*0.55)+'" cy="'+(y)+'" r="'+(r*0.55)+'" fill="'+c+'" opacity=".75"/>'; }
  function school(x,y,w,h,body,roof,door){
    var out = '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="2" fill="'+body+'"/>'
      +'<path d="M'+(x-6)+' '+(y+2)+' L'+(x+w/2)+' '+(y-h*0.42)+' L'+(x+w+6)+' '+(y+2)+' Z" fill="'+roof+'"/>'
      +'<rect x="'+(x+w/2-6)+'" y="'+(y+h-16)+'" width="12" height="16" rx="1.5" fill="'+door+'"/>';
    var winY = y+8, n = Math.floor(w/22);
    for(var i=0;i<n;i++){ out += '<rect x="'+(x+8+i*22)+'" y="'+winY+'" width="9" height="9" rx="1" fill="'+CREAM+'"/>'; }
    out += '<circle cx="'+(x+w/2)+'" cy="'+(y-h*0.42-6)+'" r="2.5" fill="'+ORANGE+'"/>';
    return out;
  }
  var M = {};
  /* ===== 首页主视觉：送学场景 2.0 ===== */
  M['hero'] = wrap(
    sky('h2s','#DCEBF7','#EAF2E9','#F6F1E4')
    + clouds(30,.85) + clouds(58,.6) + birds(24,44) + birds(70,36)
    + '<rect x="0" y="104" width="200" height="36" fill="#DCE8D8"/>'
    + '<path d="M0 104 Q50 98 100 102 T200 100 L200 112 L0 112 Z" fill="#CFE0CB"/>'
    + '<path d="M0 118 L200 114" stroke="#fff" stroke-width="3" stroke-dasharray="8 7" opacity=".9"/>'
    + tree(16,102,13,TEAL) + tree(186,104,11,'#5BAF8F')
    + school(136,58,54,46,TEAL,NAVY,CREAM)
    + '<rect x="160" y="46" width="3" height="10" fill="'+INK+'"/><circle cx="161.5" cy="44" r="3" fill="'+ORANGE+'"/>'
    /* 妈妈 */
    + person(46,62,1.15,NAVY,true)
    + '<path d="M50 72 L62 80" stroke="'+NAVY+'" stroke-width="3.4" stroke-linecap="round"/>'
    /* 孩子+书包 */
    + person(70,72,0.82,TEAL,true)
    + '<rect x="74" y="76" width="8" height="10" rx="2.5" fill="'+ORANGE+'"/>'
    + '<path d="M12 124 h176" stroke="#fff" stroke-width="0"/>'
  );
  /* ===== 政策：文件 + 天平 + 印章 ===== */
  M['policy'] = wrap(
    sky('p2s','#EDF1F8','#E4EAF3','#D9E2EE')
    + '<circle cx="176" cy="22" r="26" fill="#fff" opacity=".45"/>'
    + '<rect x="40" y="26" width="80" height="100" rx="5" fill="#fff" stroke="'+LINE_D()+'"/>'
    + '<rect x="52" y="42" width="46" height="6" rx="3" fill="'+NAVY+'" opacity=".9"/>'
    + '<rect x="52" y="56" width="58" height="4.5" rx="2" fill="#C9D2DE"/>'+
    '<rect x="52" y="67" width="52" height="4.5" rx="2" fill="#C9D2DE"/>'+
    '<rect x="52" y="78" width="56" height="4.5" rx="2" fill="#C9D2DE"/>'+
    '<rect x="52" y="89" width="40" height="4.5" rx="2" fill="#C9D2DE"/>'
    + '<circle cx="112" cy="100" r="12" fill="'+TEAL+'" opacity=".95"/><path d="M106 100 l4.5 4.5 l9 -10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>'
    /* 天平 */
    + '<path d="M156 44 v52 M138 56 h36 M126 96 h44" stroke="'+NAVY+'" stroke-width="4" stroke-linecap="round"/>'
    + '<path d="M132 60 a9 9 0 0 0 12 7 M180 60 a9 9 0 0 1 -12 7" stroke="'+NAVY+'" stroke-width="3" fill="none" stroke-linecap="round"/>'
    + '<circle cx="132" cy="57" r="3.5" fill="'+ORANGE+'"/><circle cx="168" cy="57" r="3.5" fill="'+ORANGE+'"/>'
    + '<rect x="150" y="96" width="12" height="8" rx="2" fill="'+NAVY+'"/>'
  );
  /* ===== 学校：校门场景 ===== */
  M['schools'] = wrap(
    sky('s2s','#E3F0EC','#DCEAE4','#EAF2E6')
    + clouds(26,.8)
    + '<rect x="0" y="106" width="200" height="34" fill="#D5E4D0"/>'
    /* 校门 */
    + '<rect x="36" y="66" width="6" height="44" fill="'+NAVY+'"/><rect x="86" y="66" width="6" height="44" fill="'+NAVY+'"/>'
    + '<path d="M30 68 L64 50 L98 68" stroke="'+NAVY+'" stroke-width="5" fill="none"/>'
    + '<rect x="58" y="52" width="3" height="8" fill="'+INK+'"/><circle cx="59.5" cy="50" r="3" fill="'+RED+'"/>'
    + '<text x="60" y="80" text-anchor="middle" font-size="7" fill="'+NAVY+'" font-weight="bold">校</text>'
    /* 教学楼远景 */
    + school(110,64,62,48,'#5BAF8F',NAVY,CREAM)
    + tree(14,108,12,'#4FA381') + tree(178,110,10,'#5BAF8F')
    /* 两个学生走入 */
    + person(64,80,0.7,TEAL,true) + person(56,82,0.6,ORANGE,true)
  );
  /* ===== 求真：放大镜 + 证物板 ===== */
  M['fact'] = wrap(
    sky('f2s','#FDF4E3','#FAECD2','#F6E2BC')
    + '<circle cx="30" cy="30" r="20" fill="#fff" opacity=".5"/>'
    + '<rect x="34" y="30" width="92" height="72" rx="5" fill="#fff" stroke="'+LINE_D()+'"/>'
    + '<rect x="44" y="42" width="30" height="22" rx="2" fill="'+TEAL2+'" opacity=".75"/>'
    + '<rect x="82" y="42" width="34" height="4.5" rx="2" fill="#C9D2DE"/><rect x="82" y="52" width="30" height="4.5" rx="2" fill="#C9D2DE"/><rect x="44" y="72" width="72" height="4.5" rx="2" fill="#C9D2DE"/><rect x="44" y="82" width="58" height="4.5" rx="2" fill="#C9D2DE"/>'
    + '<circle cx="66" cy="53" r="6" fill="#fff" opacity=".7"/>'
    /* 大放大镜 */
    + '<circle cx="128" cy="72" r="26" fill="#fff" opacity=".55" stroke="'+NAVY+'" stroke-width="6"/>'
    + '<circle cx="128" cy="72" r="26" fill="none" stroke="'+TEAL+'" stroke-width="2" opacity=".6"/>'
    + '<path d="M147 91 L166 110" stroke="'+NAVY+'" stroke-width="9" stroke-linecap="round"/>'
    /* 问号 */
    + '<text x="128" y="82" text-anchor="middle" font-family="Georgia,serif" font-size="30" font-weight="bold" fill="'+ORANGE+'">?</text>'
    + '<circle cx="172" cy="34" r="6" fill="'+RED+'" opacity=".85"/><path d="M169 34 l2.5 2.5 l5 -5.5" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
  );
  /* ===== 新闻：报纸 + 飞讯 ===== */
  M['news'] = wrap(
    sky('n2s','#EDF1F8','#E4EAF3','#DDE4F0')
    + '<circle cx="170" cy="24" r="18" fill="#fff" opacity=".5"/>'
    + '<rect x="38" y="26" width="124" height="92" rx="5" fill="#fff" stroke="'+LINE_D()+'"/>'
    + '<rect x="48" y="36" width="70" height="9" rx="2" fill="'+NAVY+'"/>'
    + '<rect x="124" y="38" width="28" height="5" rx="2" fill="'+ORANGE+'"/>'
    + '<rect x="48" y="54" width="50" height="34" rx="3" fill="url(#n2g)"/>'
    + '<rect x="104" y="54" width="48" height="5" rx="2" fill="#C9D2DE"/><rect x="104" y="64" width="42" height="5" rx="2" fill="#C9D2DE"/><rect x="104" y="74" width="46" height="5" rx="2" fill="#C9D2DE"/><rect x="104" y="84" width="38" height="5" rx="2" fill="#C9D2DE"/>'
    + '<rect x="48" y="96" width="104" height="5" rx="2" fill="#C9D2DE"/><rect x="48" y="106" width="86" height="5" rx="2" fill="#C9D2DE"/>'
    + '<path d="M20 44 q6 -7 12 0 M38 36 q6 -7 12 0 M158 118 q6 -7 12 0" stroke="'+INK2+'" stroke-width="2" fill="none" stroke-linecap="round"/>'
    + birds(150,30)
  ).replace('<svg ', '<svg ');
  function LINE_D(){ return '#C9D2DE'; }
  /* 给 news 的渐变注入 */
  M['news'] = M['news'].replace('<svg viewBox="0 0 200 140"', '<svg viewBox="0 0 200 140" xmlns:xlink="http://www.w3.org/1999/xlink"').replace('<rect x="48" y="54" width="50" height="34" rx="3" fill="url(#n2g)"/>', '<rect x="48" y="54" width="50" height="34" rx="3" fill="'+TEAL2+'" opacity=".8"/>');
  /* ===== 生命/生活：家庭与房屋 ===== */
  M['life'] = wrap(
    sky('l2s','#FDF4E3','#F9EBD0','#F4E0BC')
    + '<circle cx="164" cy="30" r="16" fill="'+ORANGE2+'" opacity=".9"/>'
    + '<rect x="0" y="104" width="200" height="36" fill="#EAD9B8"/>'
    /* 房子 */
    + '<rect x="60" y="58" width="80" height="50" rx="3" fill="#fff" stroke="'+LINE_D()+'"/>'
    + '<path d="M52 60 L100 32 L148 60 Z" fill="'+ORANGE+'"/>'
    + '<rect x="92" y="80" width="16" height="28" fill="'+TEAL+'"/>'
    + '<rect x="70" y="70" width="14" height="12" rx="1" fill="'+CREAM+'"/><rect x="116" y="70" width="14" height="12" rx="1" fill="'+CREAM+'"/>'
    + '<path d="M96 20 v-10" stroke="'+INK2+'" stroke-width="2.5"/><circle cx="96" cy="26" r="6" fill="none" stroke="'+INK2+'" stroke-width="2.5"/>'
    /* 三口人剪影 */
    + person(56,74,0.95,NAVY,true) + person(150,74,0.95,TEAL,true) + person(166,78,0.7,ORANGE,true)
    + tree(20,106,11,'#D9B96E')
  );
  /* ===== 日历/时间：日历翻页 ===== */
  M['calendar'] = wrap(
    sky('c2s','#EEF1F8','#E6EAF4','#DEE3F0')
    + '<circle cx="172" cy="28" r="20" fill="#fff" opacity=".5"/>'
    + '<rect x="46" y="34" width="108" height="84" rx="6" fill="#fff" stroke="'+LINE_D()+'"/>'
    + '<rect x="46" y="34" width="108" height="24" rx="6" fill="'+RED+'" opacity=".92"/>'
    + '<text x="100" y="51" text-anchor="middle" font-size="12" fill="#fff" font-weight="bold" font-family="var(--mono),monospace">SEP 25</text>'
    + '<text x="100" y="88" text-anchor="middle" font-size="30" font-weight="bold" fill="'+NAVY+'" font-family="Georgia,serif">25</text>'
    + '<rect x="72" y="98" width="56" height="4" rx="2" fill="#C9D2DE"/>'
    + '<circle cx="158" cy="104" r="12" fill="'+TEAL+'"/><path d="M152 104 l4 4 l8 -9" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>'
    + '<rect x="56" y="30" width="3" height="10" rx="1.5" fill="'+NAVY+'"/><rect x="140" y="30" width="3" height="10" rx="1.5" fill="'+NAVY+'"/>'
  );
  /* ===== 学堂：师生问答 ===== */
  M['learn'] = wrap(
    sky('le2s','#EAF2F0','#E1EEE9','#D8E7E0')
    + '<rect x="0" y="108" width="200" height="32" fill="#D5E4D0"/>'
    /* 黑板 */
    + '<rect x="40" y="36" width="76" height="50" rx="4" fill="'+NAVY+'"/>'
    + '<rect x="46" y="42" width="64" height="38" rx="2" fill="'+NAVY2+'"/>'
    + '<path d="M54 70 l10 -14 l8 8 l12 -16" stroke="'+TEAL2+'" stroke-width="3" fill="none" stroke-linecap="round"/>'
    + '<text x="98" y="58" text-anchor="middle" font-size="12" fill="'+CREAM+'" font-family="Georgia,serif">A+</text>'
    /* 老师指黑板 */
    + person(136,66,1.05,TEAL,false)
    + '<path d="M132 74 L118 62" stroke="'+TEAL+'" stroke-width="3.2" stroke-linecap="round"/>'
    /* 学生举手 */
    + person(70,84,0.75,ORANGE,false)
    + '<path d="M72 92 L82 82" stroke="'+ORANGE+'" stroke-width="3" stroke-linecap="round"/>'
    + person(58,86,0.7,NAVY,false)
    + tree(182,110,10,'#4FA381')
  );
  /* ===== 百科：书塔路径 ===== */
  M['wiki'] = wrap(
    sky('w2s','#EEF1F8','#E4EAF3','#E8E2F0')
    + '<rect x="30" y="88" width="36" height="12" rx="2" fill="'+NAVY+'"/>'
    + '<rect x="58" y="72" width="36" height="12" rx="2" fill="'+TEAL+'"/>'
    + '<rect x="86" y="56" width="36" height="12" rx="2" fill="'+ORANGE+'"/>'
    + '<rect x="114" y="40" width="36" height="12" rx="2" fill="'+RED+'" opacity=".9"/>'
    + '<path d="M48 84 L76 68 L104 52 L132 36" stroke="'+INK2+'" stroke-width="2" stroke-dasharray="4 4" fill="none"/>'
    + '<circle cx="132" cy="34" r="5" fill="'+TEAL2+'"/>'
    + '<circle cx="30" cy="30" r="14" fill="#fff" opacity=".5"/>'
    + '<text x="52" y="97" text-anchor="middle" font-size="8" fill="#fff" font-weight="bold">小</text>'
    + '<text x="80" y="81" text-anchor="middle" font-size="8" fill="#fff" font-weight="bold">初</text>'
    + '<text x="108" y="65" text-anchor="middle" font-size="8" fill="#fff" font-weight="bold">高</text>'
    + '<text x="136" y="49" text-anchor="middle" font-size="8" fill="#fff" font-weight="bold">大</text>'
    + birds(28,52)
  );
  /* ===== 联系：信封/对话 ===== */
  M['contact'] = wrap(
    sky('ct2s','#EAF2F0','#E1EEE9','#DCE9E2')
    + '<path d="M46 44 h84 a10 10 0 0 1 10 10 v42 a10 10 0 0 1 -10 10 h-56 l-20 18 v-18 h-8 a10 10 0 0 1 -10 -10 v-42 a10 10 0 0 1 10 -10 Z" fill="#fff" stroke="'+LINE_D()+'"/>'
    + '<path d="M40 50 L88 84 L136 50" stroke="'+TEAL+'" stroke-width="3" fill="none"/>'
    + '<circle cx="158" cy="42" r="12" fill="'+ORANGE+'"/><text x="158" y="47" text-anchor="middle" font-size="13" fill="#fff" font-weight="bold">✉</text>'
    + '<circle cx="36" cy="118" r="5" fill="'+TEAL2+'"/><circle cx="172" cy="112" r="4" fill="'+TEAL2+'" opacity=".7"/>'
  );
  return M[kind] || M['news'];
}
function LINE_D(){ return '#C9D2DE'; }


/* ---------- 44-photos ---------- */
/* ---------- v0.37：实景照片系统（校园实景素材） ---------- */
/* v0.53：照片去重 —— 用满照片池，按条目确定性分配，同页不重复
   ponytail: 池 28 张，同页超过 28 个图位才会回绕；扩容只需往 PHOTO_POOL 加文件名 */
var PHOTO_BASE = 'assets/photos/';
/* v0.99：统一出 webp（构建前置转换，102 张 19.9→5.1MB）；jpg 原件保留给 CSS 背景与归档 */
function phW(f){ return String(f).replace(/\.jpe?g$/i, '.webp'); }
var PHOTO_FILES = {
  gate1:'school-gate-1.jpg', gate2:'school-gate-2.jpg', building:'school-building.jpg',
  panorama:'school-panorama.jpg', playground:'school-playground.jpg', library:'school-library.jpg',
  courtyard:'school-courtyard.jpg', students:'school-students.jpg',
  study:'study-desk.jpg', classroom:'classroom.jpg', office:'office-docs.jpg',
  calendar:'calendar-desk.jpg', city:'city-scape.jpg'
};
/* 全部可用照片（含此前未被引用的 15 张，避免同一张反复出现） */
var PHOTO_POOL = [
  'school-gate-1.jpg','school-gate-2.jpg','school-gate-3.jpg','school-gate-4.jpg',
  'school-gate-5.jpg','school-gate-6.jpg','school-gate-7.jpg',
  'school-building.jpg','school-building-2.jpg','school-building-3.jpg','school-building-4.jpg',
  'school-panorama.jpg','school-playground.jpg','school-library.jpg','school-courtyard.jpg',
  'school-students.jpg','school-hill.jpg','school-river.jpg','school-plaza.jpg',
  'school-gym.jpg','school-arts.jpg','school-science.jpg','school-culture.jpg',
  'study-desk.jpg','classroom.jpg','office-docs.jpg','calendar-desk.jpg','city-scape.jpg'
];
function photoURL(key){ return PHOTO_BASE + phW(PHOTO_FILES[key] || PHOTO_FILES.city); }
function photoImg(key, eager, alt){
  return '<img ' + (eager ? '' : 'loading="lazy" ') + 'decoding="async" src="' + photoURL(key) + '" alt="' + (alt || '') + '">';
}
/* 同页已用照片（渲染前 reset，保证一页之内不出现重复照片） */
var _usedPhoto = {};
function resetPhotoUsage(){ _usedPhoto = {}; }
function _seedNum(s){
  var h = 5381, i = s.length;
  while(i){ h = ((h * 33) ^ s.charCodeAt(--i)) >>> 0; }
  return h;
}
/* 按条目种子取照片：确定性（同一条目恒为同一张）+ 同页唯一（冲突向后线性探测） */
function photoURLForItem(seed){
  var n = PHOTO_POOL.length, start = _seedNum(String(seed || '')) % n, i;
  for(i = 0; i < n; i++){
    var f = PHOTO_POOL[(start + i) % n];
    if(!_usedPhoto[f]){ _usedPhoto[f] = 1; return PHOTO_BASE + phW(f); }
  }
  return PHOTO_BASE + phW(PHOTO_POOL[start]);   // 池耗尽（>28 个图位）才回绕
}
function photoItemImg(seed, eager, alt){
  return '<img ' + (eager ? '' : 'loading="lazy" ') + 'decoding="async" src="' + photoURLForItem(seed) + '" alt="' + (alt || '') + '">';
}
/* 学校→照片：一校一图固定映射（SCHOOL_PHOTOS 由构建注入，与 article_gen.py 同源）
   ⚠️ 已复核：20 校实拍一一对应，勿改 */
var SCHOOL_PHOTO_KEYS = ['gate1','gate2','building','playground','library','courtyard','students','panorama'];
function schoolPhotoKey(name){
  var h = 0;
  for (var i = 0; i < name.length; i++){ h += name.charCodeAt(i); }
  return SCHOOL_PHOTO_KEYS[((h * 7) + name.length) % SCHOOL_PHOTO_KEYS.length];
}
function schoolPhotoFile(name){
  if (typeof SCHOOL_PHOTOS !== 'undefined' && SCHOOL_PHOTOS[name]) return SCHOOL_PHOTOS[name];
  return PHOTO_FILES[schoolPhotoKey(name)];
}
function schoolPhotoImg(name){
  var real = typeof SCHOOL_PHOTOS !== 'undefined' && SCHOOL_PHOTOS[name];
  return '<img loading="lazy" decoding="async" src="' + PHOTO_BASE + phW(schoolPhotoFile(name)) + '" alt="' + esc(name) + (real ? '校园实景（图片来源见档案来源）' : '校园外观示意图（非实拍）') + '">';
}
/* hero / 入口卡 / 页眉横幅：各类固定不同照片；仅 hero 记入已用集合（它是同页最大图，列表须避让） */
var ART_PHOTO = {
  'hero':'school-students.jpg', 'policy':'office-docs.jpg', 'schools':'school-panorama.jpg',
  'fact':'school-culture.jpg',
  'banner-policy':'school-plaza.jpg', 'banner-faq':'school-library.jpg'
};
function artPhotoURL(kind){
  var f = ART_PHOTO[kind];
  if(!f) return '';
  if(kind === 'hero') _usedPhoto[f] = 1;   // 只预留 hero：剩 27 张足够首屏 24 条封面全不重复
  return PHOTO_BASE + phW(f);
}


/* ---------- 46-filter ---------- */
/* ---------- v0.43：政策分类筛选 + 术语分组与快搜 ---------- */
function filterPolicy(cat){
  cat = cat || 'all';
  document.querySelectorAll('#pol-filter .ff').forEach(function(b){
    var on = b.dataset.pf === cat;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
  });
  var shown = 0;
  document.querySelectorAll('#policy .pol-item').forEach(function(card){
    var ok = cat === 'all' || (card.getAttribute('data-pc') || '') === cat;
    card.style.display = ok ? '' : 'none';
    if(ok) shown++;
  });
  var emptyEl = document.getElementById('pol-empty');
  if(shown === 0){
    if(!emptyEl){
      emptyEl = document.createElement('div');
      emptyEl.id = 'pol-empty'; emptyEl.className = 'empty-mini';
      emptyEl.textContent = '该分类暂无条目。';
      var pol = document.querySelector('#policy .pol > div');
      if(pol) pol.appendChild(emptyEl);
    }
  } else if(emptyEl){ emptyEl.remove(); }
}
function filterTerms(cat){
  cat = cat || 'all';
  document.querySelectorAll('#term-filter .ff').forEach(function(b){
    var on = b.dataset.tf === cat;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
  });
  applyTermFilter();
}
function applyTermFilter(){
  var qEl = document.getElementById('term-q');
  var q = qEl ? qEl.value.trim().toLowerCase() : '';
  var cat = 'all';
  var onBtn = document.querySelector('#term-filter .ff.on');
  if(onBtn) cat = onBtn.dataset.tf || 'all';
  var shown = 0;
  document.querySelectorAll('#policy .term dt').forEach(function(dt){
    var dd = dt.nextElementSibling;
    var okCat = cat === 'all' || (dt.getAttribute('data-tg') || '') === cat;
    var okQ = !q || (dt.textContent + ' ' + (dd ? dd.textContent : '')).toLowerCase().indexOf(q) >= 0;
    var ok = okCat && okQ;
    dt.style.display = ok ? '' : 'none';
    if(dd) dd.style.display = ok ? '' : 'none';
    if(ok) shown++;
  });
  var term = document.querySelector('#policy .term');
  var emptyEl = document.getElementById('term-empty');
  if(shown === 0){
    if(!emptyEl && term){
      emptyEl = document.createElement('p');
      emptyEl.id = 'term-empty'; emptyEl.className = 'empty-mini';
      emptyEl.textContent = '没有匹配的术语——换个关键词试试。';
      term.appendChild(emptyEl);
    }
  } else if(emptyEl){ emptyEl.remove(); }
}
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    var q = document.getElementById('term-q');
    if(q) q.addEventListener('input', applyTermFilter);
  });
})();


/* ---------- 47-problems ---------- */
/* ---------- v0.44：问题反查表（我遇到 X 问题 → 政策/术语/工具组合卡） ---------- */
var PROBLEMS = [
 {
  "q": "孩子明年幼升小，房子刚买，能上对口小学吗？",
  "cat": "入学",
  "policies": [
   "义务教育免试入学：划片就近 + 单校/多校对口"
  ],
  "terms": [
   "三对口",
   "六年一户",
   "学位锁定",
   "划片范围"
  ],
  "tools": [
   [
    "入学材料清单生成器",
    "quiz.html"
   ],
   [
    "升学日历 · 设报名提醒",
    "calendar.html"
   ]
  ],
  "tip": "买房≠立刻有学位：先查该房产是否处于学位锁定/落户年限限制，再对照当年划片范围。"
 },
 {
  "q": "外地户籍，能在重庆读公办小学吗？",
  "cat": "入学",
  "policies": [
   "随迁子女入学：「两为主、两纳入」保障"
  ],
  "terms": [
   "随迁子女",
   "积分入学",
   "统筹安排"
  ],
  "tools": [
   [
    "入学材料清单生成器",
    "quiz.html"
   ]
  ],
  "tip": "居住证 + 就业/社保材料提前半年备齐；热门片区可能统筹安排到附近公办。"
 },
 {
  "q": "想给孩子转学，什么时候能办、影响指标到校吗？",
  "cat": "学籍",
  "policies": [
   "学籍管理：「人籍一致」与转学窗口"
  ],
  "terms": [
   "中途转入",
   "人籍一致",
   "指标资格"
  ],
  "tools": [
   [
    "升学日历 · 学期窗口提醒",
    "calendar.html"
   ]
  ],
  "tip": "转学窗口在学期初；初中段转学可能影响指标到校资格连续性——先向两所学校与区教委确认。"
 },
 {
  "q": "民办初中摇号没摇中，会不会没学上？",
  "cat": "入学",
  "policies": [
   "民办义务教育招生：超计划全部摇号"
  ],
  "terms": [
   "公民同招",
   "摇号",
   "统筹安排"
  ],
  "tools": [
   [
    "政策库 · 摇号条款",
    "policy.html"
   ],
   [
    "家长论坛 · 摇号讨论",
    "forum.html"
   ]
  ],
  "tip": "公民同招：摇号未中回公办统筹，双轨准备材料才稳；「花钱买名额」都是诈骗。"
 },
 {
  "q": "初三了，指标到校资格怎么核对？",
  "cat": "中考",
  "policies": [
   "优质高中指标到校招生工作通知"
  ],
  "terms": [
   "指标到校",
   "指标资格",
   "人籍一致"
  ],
  "tools": [
   [
    "入学自查 · 能不能报",
    "quiz.html"
   ],
   [
    "志愿参考 · 位次换算",
    "zy.html"
   ]
  ],
  "tip": "学籍连续 + 人籍一致是前提；向班主任确认校内排序口径，名额分配到校后是校内竞争。"
 },
 {
  "q": "中考志愿怎么填才不浪费分数？",
  "cat": "中考",
  "policies": [
   "2026 年中考政策：联招学校约 113 所",
   "普通高中招生录取：批次设置与征集志愿"
  ],
  "terms": [
   "平行志愿",
   "批次线",
   "征集志愿",
   "位次"
  ],
  "tools": [
   [
    "志愿参考 · 位次换算",
    "zy.html"
   ],
   [
    "择校对比器",
    "compare.html"
   ]
  ],
  "tip": "用位次不用绝对分；批次是顺序不是档次；出分后每天盯征集志愿公告。"
 },
 {
  "q": "家里经济困难，高中有什么资助？",
  "cat": "费用",
  "policies": [
   "高中阶段学生资助：免学费 + 国家助学金"
  ],
  "terms": [
   "生源地助学贷款"
  ],
  "tools": [
   [
    "政策库 · 资助条目原文",
    "policy.html"
   ]
  ],
  "tip": "资助是申请制：向学校提交材料走统一流程；普高与中职各有通道，别不好意思问班主任。"
 },
 {
  "q": "怎么判断校外培训机构靠不靠谱？",
  "cat": "培训",
  "policies": [
   "「双减」与课后服务：作业时长与校外培训边界"
  ],
  "terms": [
   "监管账户",
   "课后服务"
  ],
  "tools": [
   [
    "家长论坛 · 培训选择讨论",
    "forum.html"
   ]
  ],
  "tip": "查办学许可证与收费公示；一次性缴费不超 3 个月或 60 课时，且必须走监管账户。"
 },
 {
  "q": "孩子在学校吃得好不好，家长能监督吗？",
  "cat": "安全",
  "policies": [
   "校园食品安全与营养：家长监督权"
  ],
  "terms": [],
  "tools": [
   [
    "联系与留言 · 提交线索",
    "contact.html"
   ]
  ],
  "tip": "校长负责制 + 陪餐制度；家长有权查后厨直播与食材台账，发现问题逐级反映。"
 },
 {
  "q": "孩子成绩中等，选科怎么选不吃亏？",
  "cat": "高考",
  "policies": [],
  "terms": [
   "强基计划",
   "一分一段",
   "位次"
  ],
  "tools": [
   [
    "志愿参考 · 位次换算",
    "zy.html"
   ],
   [
    "升学百科 · 高考全流程",
    "wiki.html"
   ]
  ],
  "tip": "先定专业大方向再定选科组合；物理+化学覆盖面最广，但要看孩子学科能力分布。"
 }
];

var PROBLEM_CATS = ['all','入学','学籍','中考','费用','培训','安全','高考'];
function renderProblems(){
  var box = document.getElementById('pb-guide'); if(!box) return;
  box.innerHTML = '<div class="pb-cats">' + PROBLEM_CATS.map(function(c){
      return '<button class="ff on" data-bf="' + c + '" onclick="filterProblems(\'' + c + '\')">' + (c==='all' ? '全部（'+PROBLEMS.length+'）' : c+'（'+PROBLEMS.filter(function(p){return p.cat===c;}).length+'）') + '</button>';
    }).join('') + '</div><div class="pb-grid">' + PROBLEMS.map(function(p, i){
    return '<div class="pb-card" data-bcat="' + p.cat + '">'
      + '<div class="pb-q">' + esc(p.q) + '</div>'
      + (p.policies.length ? '<div class="pb-row"><span class="pb-tag">政策</span>' + p.policies.map(function(x){
          var pk = (typeof ARTMAP !== 'undefined') ? ARTMAP['P|' + x] : '';
          return '<a href="' + (pk ? 'articles/' + pk : 'policy.html') + '">' + esc(x) + '</a>';
        }).join('、') + '</div>' : '')
      + (p.terms.length ? '<div class="pb-row"><span class="pb-tag">术语</span>' + p.terms.map(function(x){ return '<a href="policy.html#policy" title="见政策库词典">' + esc(x) + '</a>'; }).join('、') + '</div>' : '')
      + (p.tools.length ? '<div class="pb-row"><span class="pb-tag">工具</span>' + p.tools.map(function(t){ return '<a href="' + t[1] + '">' + esc(t[0]) + ' →</a>'; }).join('、') + '</div>' : '')
      + '<div class="pb-tip">' + esc(p.tip) + '</div></div>';
  }).join('') + '</div>';
}
function filterProblems(cat){
  document.querySelectorAll('.pb-cats .ff').forEach(function(b){
    var on = b.dataset.bf === cat;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
  });
  document.querySelectorAll('.pb-card').forEach(function(card){
    card.style.display = (cat === 'all' || card.getAttribute('data-bcat') === cat) ? '' : 'none';
  });
}


/* ---------- 48-xiancha ---------- */
/* ---------- v0.45：2025 官方批次线 + 线差换算（精确到个位，逐条可验算） ---------- */
var CQ2025 = {"year": "2025", "province": "重庆市", "source": "重庆市教委发布（重庆市2025年全国普通高等学校招生录取最低控制分数线）", "verified": "2026-09-30", "rows": [["普通类 · 历史类", "本科批", 438], ["普通类 · 历史类", "特殊类型资格线", 515], ["普通类 · 历史类", "高职专科批", 180], ["普通类 · 物理类", "本科批", 425], ["普通类 · 物理类", "特殊类型资格线", 498], ["普通类 · 物理类", "高职专科批", 180]]};
var XIANCHA = {"历史类": [[650, 438, 212, 515, 135, 180, 470], [600, 438, 162, 515, 85, 180, 420], [550, 438, 112, 515, 35, 180, 370], [538, 438, 100, 515, 23, 180, 358], [515, 438, 77, 515, 0, 180, 335], [488, 438, 50, 515, -27, 180, 308], [438, 438, 0, 515, -77, 180, 258], [418, 438, -20, 515, -97, 180, 238], [180, 438, -258, 515, -335, 180, 0], [160, 438, -278, 515, -355, 180, -20]], "物理类": [[650, 425, 225, 498, 152, 180, 470], [600, 425, 175, 498, 102, 180, 420], [550, 425, 125, 498, 52, 180, 370], [525, 425, 100, 498, 27, 180, 345], [498, 425, 73, 498, 0, 180, 318], [475, 425, 50, 498, -23, 180, 295], [425, 425, 0, 498, -73, 180, 245], [405, 425, -20, 498, -93, 180, 225], [180, 425, -245, 498, -318, 180, 0], [160, 425, -265, 498, -338, 180, -20]]};

/* ---------- v0.45：六大路径深度解读渲染 ---------- */
var PATH_DEEP = [
 {key:"putong", name:"普高统招（联招）", tag:"最主流 · 联招体系"},
 {key:"zhibiao", name:"指标到校", tag:"校内竞争 · 70% 名额"},
 {key:"minban", name:"民办高中", tag:"自费择校 · 摇号与自主"},
 {key:"zhiye", name:"中职 · 职教高考", tag:"另一条上升通道"},
 {key:"yiti", name:"艺体特长", tag:"专业测试 + 文化双线"},
 {key:"guoji", name:"出国 / 国际班", tag:"双轨规划 · 费用最高"}
];

var PATHS = [{"key": "putong", "name": "普高统招", "tag": "最主流 · 联招体系", "def": "参加重庆市初中毕业暨高中招生考试（中考，联招），按志愿批次由高到低统一录取进入公办普通高中。全市联招学校 2026 年约 113 所，是重庆家庭最主流的高中入学路径。", "cond": ["具有重庆初中学籍并参加中考（联招区域户籍或符合随迁政策）", "志愿分批次填报：指标到校批次先行（资格生）→ 统招批次", "体艺特长生经专业测试可在统招中按政策录取"], "timeline": "初三上期中定位 → 3 月中考报名+体检 → 4 月体育统一测试 → 5 月志愿宣讲与模拟填报 → 6 月中考 → 6 月底出分填志愿 → 7 月分批录取（含征集志愿）。", "fee": "公办高中学费按市定标准执行（一般每学期数百元至千元级），另有课本资料与住宿费；民办高中学费自定（见民办路径）。", "who": "中考成绩达到联招批次线的绝大多数考生；追求公办普惠、住家走读的家庭。", "pros": ["公办收费低、办学稳定", "志愿批次规则透明，出分后填志愿", "覆盖全市 113 所联招学校，选择面广"], "cons": ["热门校竞争激烈，需校内位次过硬", "跨区择校受招生范围限制", "一考定批次，志愿策略影响大"], "faq": [["联招和区县中考是一回事吗？", "主城区及部分区县实行统一联招；未入联招的区县由本区县自行组织录取。志愿规则以本区当年公告为准。"], ["出分后还能改志愿吗？", "志愿在出分后规定时间内填报确认，截止后不可修改；征集志愿是最后的补救机会。"]], "links": [["重庆市教委：2026 年中考招生通知（渝教基函〔2026〕21号）", "https://jw.cq.gov.cn/zwgk/zfxxgkml/zcwj/qtwj/202604/t20260421_15627210.html"], ["重庆市教育考试院（中考栏目）", "https://www.cqksy.cn/site/techield/zhongkao/"], ["站内：志愿参考与位次换算", "zy.html"], ["站内：升学日历（中考节点）", "calendar.html"]]}, {"key": "zhibiao", "name": "指标到校", "tag": "校内竞争 · 70% 名额", "def": "市级重点高中把招生计划的 70% 直接分配到辖区内各初中（渝教基函口径），符合资格的学生在本校内部竞争这些名额，录取线通常低于全校统招线。", "cond": ["学籍与户籍一致（人籍一致），且在所在初中连续就读", "中途转学可能清零资格", "达到校内排序要求（名额分配到校后按成绩排队）"], "timeline": "初一入学即建立资格基础 → 初二末关注资格摸底 → 初三上资格名单公示 → 4–5 月名额分配与志愿填报 → 与中考同批录取。", "fee": "录取后为公办普高，费用与普高统招一致。", "who": "中上等成绩、所在初中里有指标名额的学生——「校内排名」比「全区排名」更有利；成绩在本校前列的家庭重点研究这条路。", "pros": ["录取线通常低于统招线，中上等生的黄金通道", "名额直接分到本校，避开全区高分段竞争", "政策连续多年稳定（70% 比例）"], "cons": ["资格条件严格（学籍连续性硬约束）", "名额到校后竞争依然存在", "中途转学代价极高"], "faq": [["指标到校是不是「稳上重点」？", "不是。名额分到校后仍按成绩排序，达到名额线才被录取；它降低的是「全区竞争」烈度，不是取消竞争。"], ["转学后指标资格还在吗？", "通常清零或重算。动迁家庭务必先向区教委核实资格连续性规则。"]], "links": [["站内：指标到校政策条目（官方原文链接）", "policy.html"], ["重庆市教委：2026 年中考招生通知（指标到校章节）", "https://jw.cq.gov.cn/zwgk/zfxxgkml/zcwj/qtwj/202604/t20260421_15627210.html"], ["站内：择校对比器（比较校内名额竞争）", "compare.html"]]}, {"key": "minban", "name": "民办高中", "tag": "自费择校 · 摇号与自主", "def": "由社会力量举办的普通高中，招生计划与收费自主报备，录取方式分「超计划电脑摇号」与自主招生两类；巴蜀常春藤等民办校已收录本站学校档案库。", "cond": ["参加重庆中考（民办高中录取也以中考成绩为基础）", "民办报名超计划时电脑随机录取（全程公证）", "家庭需评估三年学费承受力（民办高中学费普遍每学年数万元）"], "timeline": "5–6 月关注民办校招生简章 → 中考后按简章报名（超计划摇号）→ 录取签约缴费 → 与公办同步注册学籍。", "fee": "学费每学年约 3–15 万元不等（各校差异大），另有住宿、杂费；以各校在物价部门备案的公示为准。", "who": "中考成绩略低于公办目标线、家庭可承担民办学费；或认可某民办校办学特色（小班/国际化课程）的家庭。", "pros": ["为临界分数提供普高学位兜底", "办学机制灵活，部分学校小班化/特色课程", "摇号规则公开透明（超计划即摇号）"], "cons": ["学费显著高于公办", "教学质量两极分化，需实地考察", "「交钱锁定名额」说法不可信——超计划必须摇号"], "faq": [["民办高中可以「交钱买名额」吗？", "不可以。超计划全部电脑摇号、全程公证，与缴费无关；任何「内部名额费」都是诈骗。"], ["民办高中学籍和公办一样吗？", "一样。民办高中同样注册普通高中学籍，参加统一高考；关键是确认学校具备招生资质。"]], "links": [["站内：巴蜀常春藤学校档案（民办样本）", "schools.html?school="], ["站内：民办摇号政策条目", "policy.html"], ["站内：家长论坛 · 摇号讨论", "forum.html"], ["重庆市教委：2026 年义务教育招生通知（摇号机制口径）", "https://jw.cq.gov.cn/zwgk/zfxxgkml/zcwj/qtwj/202604/t20260423_15632186.html"]]}, {"key": "zhiye", "name": "中职 · 职教高考", "tag": "另一条上升通道", "def": "进入中等职业学校（中专/职高/技校），通过「文化素质 + 职业技能」的职教高考（分类考试招生）升入高职或应用型本科——中职不是终点，而是一条并行上升通道。", "cond": ["应届初中毕业生，按志愿报考中职学校（含「五年制高职」贯通班）", "职教高考升学方向：中职在读期间备考文化课+专业技能", "部分专业有身体条件要求（如学前教育）"], "timeline": "中考后填报中职志愿（含五年制高职批次）→ 9 月入学 → 三年内「文化+技能」并修 → 三年级参加高职分类考试 → 升入高职（3 年）或应用型本科（4 年）。", "fee": "中职阶段：国家免学费政策覆盖绝大多数专业（民办超出部分自付）；高职/本科阶段按公办标准收费；家庭困难学生另有国家助学金。", "who": "动手能力强、文化课中等的孩子；目标明确想早就业或走技能升学线的家庭。重庆 2025 年「职教高考」本科扩容持续进行中。", "pros": ["免学费+资助政策覆盖广", "升学通道打通：中职→高职→应用型本科", "技能就业两不误，部分专业就业率高"], "cons": ["社会认可度仍在提升中", "优质中职与热门专业竞争同样激烈", "职教高考本科名额仍少于普通高考"], "faq": [["中职还能考本科吗？", "能。通过高职分类考试升入高职后可「专升本」，部分应用型本科直接面向中职招生；「职教高考」本科通道逐年扩容。"], ["五年制高职是什么？", "初中毕业后进入高职院校连续培养五年，毕业获大专学历——中职家庭的「直升」选项之一。"]], "links": [["《中华人民共和国职业教育法》（教育部政策库全文）", "http://www.moe.gov.cn/jyb_sjzl/sjzl_zcfg/zcfg_jyfl/202204/t20220421_620064.html"], ["站内：五年制高职/职教高考术语", "policy.html"], ["站内：升学百科 · 全流程", "wiki.html"]]}, {"key": "yiti", "name": "艺体特长", "tag": "专业测试 + 文化双线", "def": "有体育、艺术特长的学生经专业测试后，以特长生身份被高中（中考段）或高校（高考段）降分/专项录取——需要「专业」与「文化课」两条线同时过。", "cond": ["中考段：经批准的高中招收体育/艺术特长生，需参加学校或区级专业测试", "高考段：艺体类考生需省级专业统考（+部分校考），文化课也有底线要求", "体育类需运动员等级或赛事成绩者更有优势"], "timeline": "初中段：初一初二确定特长方向并持续训练 → 中考前参加目标高中专业测试 → 中考达线按特长录取。高考段：高一高二定方向 → 高三上专业统考 → 12 月高考报名（艺体类）→ 次年 4 月校考 → 6 月高考（文化课）→ 综合分录取。", "fee": "训练与器材投入较高（体育私教/艺术培训每学期数千至数万元）；艺考集训高三整年通常数万元起；公办校学费与普高一致。", "who": "有真实特长且能长期投入训练的孩子；家庭需评估时间与费用双投入。「低分上名校」是误解——文化课底线逐年提高。", "pros": ["为特长生打开专项通道，与文化课考生分轨竞争", "部分学校/项目降分幅度可观", "高考综合分改革后规则更透明"], "cons": ["专业+文化双线压力大", "集训费用高、时间不可逆", "填报受限（艺体批与普通批规则不同）"], "faq": [["艺体特长生文化课要求低很多吗？", "不是。文化课有逐年提高的底线要求，综合分改革后文化课权重上升——「低分通道」是误区。"], ["区级比赛奖项有用吗？", "中考特长生资格通常看学校/区级专业测试；高考艺体以省级统考成绩为主，赛事成绩是加分项不是入场券。"]], "links": [["重庆市教委：2026 年中考通知（体育/艺体特长章节）", "https://jw.cq.gov.cn/zwgk/zfxxgkml/zcwj/qtwj/202604/t20260421_15627210.html"], ["重庆市教育考试院 · 高考栏目（艺体统考安排）", "https://www.cqksy.cn/site/techield/gkzs/"], ["站内：艺体特长生术语", "policy.html"], ["阳光高考平台（特殊类型招生；反爬站点请用浏览器打开）", "https://gaokao.chsi.com.cn/"]]}, {"key": "guoji", "name": "出国 / 国际班", "tag": "双轨规划 · 费用最高", "def": "就读高中「国际课程班」（如 AP/A-Level/IB/DSE 课程）或直接申请海外高中，以海外大学为升学目标；部分国际班学生也可参加国内高考（双轨）。", "cond": ["多数国际班参考中考成绩+校内测试/面试", "需确认学校国际课程资质与外方课程认证", "出国方向需规划语言考试（托福/雅思）与标化"], "timeline": "初三确定方向 → 中考后入读国际班 → 高一定课程体系与目标国家 → 高二语言与标化首考 → 高三上递交申请 → 次年春获录取。双轨学生同时保留高考线。", "fee": "国际班学费每学年约 8–20 万元；海外本科每年总费用（学费+生活费）约 25–60 万元（国家差异大）。是六条路里费用最高的路径。", "who": "家庭财务充裕、孩子英语能力强、目标海外大学的家庭；双轨家庭需极强的时间管理。「逃避高考」不是好理由——国际课程同样繁重。", "pros": ["升学路径全球化，不挤国内高考独木桥", "课程评价多元（不唯一次考试）", "部分双轨项目保留国内高考选项"], "cons": ["总费用最高（三年 30–60 万+）", "海外学历认证与就业认可度需提前研究", "疫情与国际关系的长期规划风险"], "faq": [["国际班学生能参加国内高考吗？", "部分双轨项目可以（保留国内学籍与课程）；纯国际课程班可能无法参加国内高考——入读前必须确认学籍政策。"], ["怎么核对国际课程班的资质？", "查学校是否具备中外合作办学或国际课程备案（教育部教育涉外监管信息网 jsj.moe.gov.cn 可查合作办学名单）。"]], "links": [["教育部教育涉外监管信息网（中外合作办学名单查询）", "https://jsj.moe.gov.cn/"], ["《中华人民共和国民办教育促进法》（教育部政策库）", "http://www.moe.gov.cn/jyb_sjzl/sjzl_zcfg/zcfg_jyfl/202204/t20220421_620261.html"], ["站内：巴蜀常春藤学校（国际课程样本）", "schools.html?school="]]}];

function renderPathDeep(){
  var box = document.getElementById('path-deep'); if(!box) return;
  box.innerHTML = PATHS.map(function(p, i){
    var faq = (p.faq||[]).map(function(f){
      return '<div class="pb-row"><span class="pb-tag">问</span><b>' + esc(f[0]) + '</b><br/>' + esc(f[1]) + '</div>';
    }).join('');
    var links = (p.links||[]).map(function(l){
      var ext = l[1].indexOf('http') === 0;
      return '<a href="' + l[1] + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + esc(l[0]) + (ext ? ' ↗' : '') + '</a>';
    }).join('<br/>');
    var pros = (p.pros||[]).map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('');
    var cons = (p.cons||[]).map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('');
    var cond = (p.cond||[]).map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('');
    return '<article class="path-deep" id="path-' + p.key + '">'
      + '<div class="pd-head"><h4>' + esc(p.name) + '</h4><span class="pd-tag">' + esc(p.tag) + '</span></div>'
      + '<p class="pd-def">' + esc(p["def"]) + '</p>'
      + '<div class="pd-grid">'
      + '<div class="pd-item"><span class="pd-l">报考条件</span><ul>' + cond + '</ul></div>'
      + '<div class="pd-item"><span class="pd-l">流程与时间线</span><p>' + esc(p.timeline) + '</p></div>'
      + '<div class="pd-item"><span class="pd-l">费用与学制</span><p>' + esc(p.fee) + '</p></div>'
      + '<div class="pd-item"><span class="pd-l">适合人群</span><p>' + esc(p.who) + '</p></div>'
      + '</div>'
      + '<div class="pd-pc"><div><span class="pd-l ok">优势</span><ul>' + pros + '</ul></div><div><span class="pd-l warn">注意</span><ul>' + cons + '</ul></div></div>'
      + (faq ? '<h5 class="pd-h">常见问题</h5>' + faq : '')
      + '<div class="pd-links"><span class="pd-l">参考链接（官方来源优先 · 2026-09-30 逐一打开核验）</span><br/>' + links + '</div>'
      + '</article>';
  }).join('');
}
document.addEventListener('DOMContentLoaded', function(){ if(document.getElementById('path-deep')) renderPathDeep(); });
/* ---------- v0.90：近三年分数区间段（2024–2026 官方批次线，多源核验） ---------- */
var YEARS3 = {"2024": {"历史类": {"本科": 428, "特招": 506, "专科": 180}, "物理类": {"本科": 427, "特招": 499, "专科": 180}}, "2025": {"历史类": {"本科": 438, "特招": 515, "专科": 180}, "物理类": {"本科": 425, "特招": 498, "专科": 180}}, "2026": {"历史类": {"本科": 415, "特招": 510, "专科": 180}, "物理类": {"本科": 406, "特招": 496, "专科": 180}}};
var YEARS3_SRC = {"2024": "重庆市教委 2024-06-24 公布；搜狐/新浪财经/中国教育在线等多源转载一致", "2025": "重庆市教委 2025-06-24 公布；腾讯新闻(重庆教育官微转载)/凤凰网等多源一致", "2026": "重庆市教委 2026-06-25 公布；新华网重庆/央视新闻/中国教育在线多源一致（已核验）"};
var YEARS3_VERIFIED = "2026-09-30";

function renderYears3(score, clsName){
  var box = document.getElementById('zy-years3');
  if(!box) return;
  if(!score || !clsName){ box.innerHTML = ''; return; }
  var rows = [];
  ["2024","2025","2026"].forEach(function(y){
    var L = YEARS3[y][clsName];
    rows.push({y:y, ben:L["本科"], te:L["特招"], zhuan:L["专科"],
      dBen: score - L["本科"], dTe: score - L["特招"], dZhuan: score - L["专科"]});
  });
  function sgn(d){ return d >= 0 ? '+' + d : String(d); }
  var html = '<h5 class="pd-h" style="margin-top:18px">同分在近三年是什么位置（' + clsName + ' ' + score + ' 分）</h5>'
    + '<div class="cmp-note" style="margin-bottom:8px">读法：同一张试卷难度不同，直接跨年比分数会失真；正确用法是看「分数 − 控制线」的差值在三年里是否稳定。下表线差为逐年独立计算，精确到个位。</div>'
    + '<table class="art-table"><thead><tr><th>年份</th><th>本科线</th><th>线差</th><th>特招线</th><th>线差</th><th>专科线</th><th>线差</th></tr></thead><tbody>'
    + rows.map(function(r){
        return '<tr><td>' + r.y + '</td>'
          + '<td class="mono">' + r.ben + '</td><td class="mono ' + (r.dBen>=0?'ok':'warn') + '">' + sgn(r.dBen) + '</td>'
          + '<td class="mono">' + r.te + '</td><td class="mono ' + (r.dTe>=0?'ok':'warn') + '">' + sgn(r.dTe) + '</td>'
          + '<td class="mono">' + r.zhuan + '</td><td class="mono ' + (r.dZhuan>=0?'ok':'warn') + '">' + sgn(r.dZhuan) + '</td></tr>';
      }).join('')
    + '</tbody></table>'
    + '<div class="cmp-note" style="margin-top:8px">三年趋势小结：历史类本科线 428→438→415（2026 年明显回落）；物理类本科线 427→425→406（2026 年下降 19 分）。两年间批次线下调意味着「同样的分」位次更高——跨年对比更要看位次与招生计划变化，别直接搬分数。各年批次线来源：'
    + ['2024','2025','2026'].map(function(y){ return y + '（' + YEARS3_SRC[y].split('；')[0].split('，')[0] + '）'; }).join('、')
    + '，均经多源交叉核验（2026 年口径 2026-10-30 复核）。</div>';
  box.innerHTML = html;
}


/* ---------- 49-section ---------- */

/* ---------- v0.47：2025 一分一段（位次法） ---------- */
var SECTION2025 = {"wl": {"750": 159, "680": 176, "679": 195, "678": 217, "677": 244, "676": 276, "675": 305, "674": 330, "673": 374, "672": 403, "671": 433, "670": 470, "669": 516, "668": 561, "667": 602, "666": 643, "665": 693, "664": 740, "663": 792, "662": 844, "661": 889, "660": 951, "659": 1027, "658": 1099, "657": 1164, "656": 1240, "655": 1315, "654": 1381, "653": 1454, "652": 1540, "651": 1619, "650": 1701, "649": 1803, "648": 1889, "647": 1994, "646": 2108, "645": 2224, "644": 2337, "643": 2472, "642": 2592, "641": 2715, "640": 2871, "639": 3012, "638": 3140, "637": 3304, "636": 3447, "635": 3585, "634": 3733, "633": 3902, "632": 4055, "631": 4220, "630": 4393, "629": 4544, "628": 4748, "627": 4946, "626": 5142, "625": 5354, "624": 5565, "623": 5765, "622": 5983, "621": 6202, "620": 6407, "619": 6632, "618": 6864, "617": 7131, "616": 7362, "615": 7630, "614": 7866, "613": 8129, "612": 8369, "611": 8639, "610": 8898, "609": 9189, "608": 9455, "607": 9740, "606": 10026, "605": 10294, "604": 10556, "603": 10859, "602": 11125, "601": 11420, "600": 11716, "599": 12008, "598": 12327, "597": 12651, "596": 12962, "595": 13287, "594": 13602, "593": 13949, "592": 14293, "591": 14652, "590": 14988, "589": 15346, "588": 15673, "587": 16058, "586": 16401, "585": 16764, "584": 17147, "583": 17490, "582": 17853, "581": 18260, "580": 18678, "579": 19056, "578": 19441, "577": 19815, "576": 20247, "575": 20633, "574": 21006, "573": 21426, "572": 21842, "571": 22294, "570": 22723, "569": 23142, "568": 23571, "567": 24004, "566": 24396, "565": 24885, "564": 25339, "563": 25811, "562": 26280, "561": 26800, "560": 27291, "559": 27774, "558": 28271, "557": 28751, "556": 29255, "555": 29783, "554": 30286, "553": 30770, "552": 31257, "551": 31746, "550": 32260, "549": 32804, "548": 33312, "547": 33846, "546": 34376, "545": 34938, "544": 35519, "543": 36058, "542": 36620, "541": 37188, "540": 37736, "539": 38272, "538": 38835, "537": 39422, "536": 39989, "535": 40611, "534": 41158, "533": 41740, "532": 42282, "531": 42889, "530": 43501, "529": 44108, "528": 44745, "527": 45354, "526": 45961, "525": 46560, "524": 47131, "523": 47737, "522": 48378, "521": 48947, "520": 49565, "519": 50211, "518": 50814, "517": 51374, "516": 51989, "515": 52572, "514": 53184, "513": 53788, "512": 54412, "511": 55069, "510": 55724, "509": 56392, "508": 56995, "507": 57604, "506": 58277, "505": 58929, "504": 59528, "503": 60202, "502": 60834, "501": 61431, "500": 62078, "499": 62675, "498": 63323, "497": 63946, "496": 64536, "495": 65119, "494": 65772, "493": 66408, "492": 67042, "491": 67694, "490": 68311, "489": 68964, "488": 69571, "487": 70203, "486": 70780, "485": 71425, "484": 72040, "483": 72625, "482": 73224, "481": 73860, "480": 74439, "479": 75006, "478": 75574, "477": 76161, "476": 76786, "475": 77404, "474": 78003, "473": 78587, "472": 79189, "471": 79745, "470": 80338, "469": 80906, "468": 81501, "467": 82102, "466": 82660, "465": 83220, "464": 83738, "463": 84250, "462": 84831, "461": 85348, "460": 85897, "459": 86477, "458": 87032, "457": 87578, "456": 88104, "455": 88620, "454": 89161, "453": 89678, "452": 90201, "451": 90739, "450": 91261, "449": 91780, "448": 92301, "447": 92792, "446": 93312, "445": 93815, "444": 94296, "443": 94799, "442": 95317, "441": 95801, "440": 96289, "439": 96773, "438": 97269, "437": 97772, "436": 98260, "435": 98699, "434": 99150, "433": 99645, "432": 100092, "431": 100543, "430": 100988, "429": 101438, "428": 101917, "427": 102364, "426": 102787, "425": 103219, "424": 103653, "423": 104066, "422": 104526, "421": 104987, "420": 105425, "419": 105820, "418": 106225, "417": 106632, "416": 107061, "415": 107473, "414": 107852, "413": 108277, "412": 108668, "411": 109026, "410": 109455, "409": 109842, "408": 110249, "407": 110623, "406": 110972, "405": 111360, "404": 111757, "403": 112125, "402": 112465, "401": 112843, "400": 113203, "399": 113525, "398": 113892, "397": 114243, "396": 114578, "395": 114918, "394": 115282, "393": 115614, "392": 115930, "391": 116254, "390": 116566, "389": 116882, "388": 117216, "387": 117512, "386": 117838, "385": 118146, "384": 118467, "383": 118751, "382": 119063, "381": 119416, "380": 119690, "379": 119987, "378": 120244, "377": 120512, "376": 120813, "375": 121108, "374": 121418, "373": 121688, "372": 121958, "371": 122227, "370": 122465, "369": 122703, "368": 122932, "367": 123183, "366": 123410, "365": 123654, "364": 123916, "363": 124163, "362": 124405, "361": 124643, "360": 124855, "359": 125087, "358": 125293, "357": 125534, "356": 125754, "355": 126004, "354": 126240, "353": 126466, "352": 126666, "351": 126882, "350": 127087, "349": 127299, "348": 127491, "347": 127702, "346": 127895, "345": 128103, "344": 128287, "343": 128468, "342": 128657, "341": 128832, "340": 129017, "339": 129189, "338": 129396, "337": 129572, "336": 129759, "335": 129955, "334": 130120, "333": 130290, "332": 130470, "331": 130634, "330": 130802, "329": 130964, "328": 131132, "327": 131286, "326": 131452, "325": 131604, "324": 131775, "323": 131909, "322": 132054, "321": 132195, "320": 132348, "319": 132498, "318": 132645, "317": 132784, "316": 132916, "315": 133055, "314": 133205, "313": 133351, "312": 133487, "311": 133607, "310": 133725, "309": 133867, "308": 134002, "307": 134123, "306": 134245, "305": 134362, "304": 134473, "303": 134576, "302": 134704, "301": 134818, "300": 134938, "299": 135044, "298": 135149, "297": 135249, "296": 135326, "295": 135427, "294": 135541, "293": 135632, "292": 135723, "291": 135841, "290": 135943, "289": 136036, "288": 136120, "287": 136215, "286": 136322, "285": 136404, "284": 136485, "283": 136574, "282": 136649, "281": 136723, "280": 136798, "279": 136883, "278": 136951, "277": 137020, "276": 137083, "275": 137153, "274": 137214, "273": 137286, "272": 137345, "271": 137403, "270": 137473, "269": 137544, "268": 137592, "267": 137659, "266": 137711, "265": 137771, "264": 137823, "263": 137873, "262": 137924, "261": 137974, "260": 138022, "259": 138063, "258": 138122, "257": 138168, "256": 138214, "255": 138254, "254": 138297, "253": 138340, "252": 138376, "251": 138414, "250": 138444, "249": 138488, "248": 138521, "247": 138561, "246": 138591, "245": 138632, "244": 138667, "243": 138702, "242": 138732, "241": 138757, "240": 138788, "239": 138821, "238": 138846, "237": 138881, "236": 138899, "235": 138932, "234": 138948, "233": 138977, "232": 139012, "231": 139029, "230": 139041, "229": 139061, "228": 139089, "227": 139098, "226": 139113, "225": 139134, "224": 139150, "223": 139170, "222": 139190, "221": 139205, "220": 139220, "219": 139239, "218": 139250, "217": 139262, "216": 139275, "215": 139292, "214": 139308, "213": 139315, "212": 139331, "211": 139335, "210": 139343, "209": 139351, "208": 139356, "207": 139364, "206": 139375, "205": 139388, "204": 139392, "203": 139397, "202": 139400, "201": 139404, "200": 139408, "199": 139412, "198": 139415, "197": 139421, "196": 139427, "195": 139431, "194": 139435, "193": 139440, "192": 139445, "191": 139449, "190": 139451, "189": 139455, "188": 139456, "187": 139457, "186": 139465, "185": 139467, "184": 139470, "183": 139474, "182": 139476, "181": 139477}, "ls": {"750": 66, "651": 75, "650": 80, "649": 86, "648": 94, "647": 99, "646": 108, "645": 117, "644": 126, "643": 137, "642": 156, "641": 167, "640": 177, "639": 191, "638": 207, "637": 226, "636": 238, "635": 255, "634": 270, "633": 288, "632": 311, "631": 330, "630": 347, "629": 372, "628": 393, "627": 416, "626": 447, "625": 477, "624": 499, "623": 531, "622": 559, "621": 593, "620": 634, "619": 669, "618": 707, "617": 749, "616": 788, "615": 830, "614": 863, "613": 901, "612": 939, "611": 985, "610": 1038, "609": 1091, "608": 1141, "607": 1179, "606": 1233, "605": 1300, "604": 1346, "603": 1407, "602": 1458, "601": 1511, "600": 1576, "599": 1649, "598": 1703, "597": 1772, "596": 1820, "595": 1881, "594": 1953, "593": 2031, "592": 2114, "591": 2192, "590": 2261, "589": 2345, "588": 2422, "587": 2504, "586": 2589, "585": 2681, "584": 2756, "583": 2840, "582": 2943, "581": 3042, "580": 3140, "579": 3241, "578": 3349, "577": 3464, "576": 3581, "575": 3697, "574": 3804, "573": 3907, "572": 4019, "571": 4142, "570": 4253, "569": 4375, "568": 4503, "567": 4620, "566": 4750, "565": 4904, "564": 5044, "563": 5175, "562": 5334, "561": 5482, "560": 5621, "559": 5743, "558": 5889, "557": 6017, "556": 6163, "555": 6310, "554": 6469, "553": 6633, "552": 6774, "551": 6928, "550": 7083, "549": 7239, "548": 7425, "547": 7586, "546": 7760, "545": 7936, "544": 8116, "543": 8298, "542": 8463, "541": 8640, "540": 8824, "539": 9023, "538": 9202, "537": 9363, "536": 9555, "535": 9726, "534": 9922, "533": 10123, "532": 10338, "531": 10541, "530": 10766, "529": 10984, "528": 11193, "527": 11419, "526": 11622, "525": 11865, "524": 12075, "523": 12316, "522": 12519, "521": 12751, "520": 12962, "519": 13219, "518": 13442, "517": 13677, "516": 13908, "515": 14156, "514": 14376, "513": 14604, "512": 14858, "511": 15080, "510": 15318, "509": 15556, "508": 15814, "507": 16063, "506": 16288, "505": 16516, "504": 16786, "503": 17015, "502": 17245, "501": 17460, "500": 17717, "499": 17973, "498": 18234, "497": 18486, "496": 18730, "495": 19001, "494": 19282, "493": 19556, "492": 19798, "491": 20074, "490": 20354, "489": 20603, "488": 20863, "487": 21111, "486": 21390, "485": 21660, "484": 21940, "483": 22215, "482": 22503, "481": 22779, "480": 23065, "479": 23343, "478": 23598, "477": 23897, "476": 24159, "475": 24430, "474": 24696, "473": 25005, "472": 25304, "471": 25591, "470": 25876, "469": 26141, "468": 26437, "467": 26729, "466": 26996, "465": 27281, "464": 27581, "463": 27885, "462": 28184, "461": 28475, "460": 28747, "459": 29044, "458": 29374, "457": 29657, "456": 29956, "455": 30235, "454": 30511, "453": 30824, "452": 31130, "451": 31412, "450": 31706, "449": 31993, "448": 32265, "447": 32576, "446": 32868, "445": 33174, "444": 33442, "443": 33759, "442": 34085, "441": 34367, "440": 34669, "439": 34957, "438": 35253, "437": 35576, "436": 35919, "435": 36211, "434": 36516, "433": 36860, "432": 37168, "431": 37498, "430": 37799, "429": 38086, "428": 38399, "427": 38697, "426": 38984, "425": 39281, "424": 39557, "423": 39838, "422": 40141, "421": 40440, "420": 40752, "419": 41037, "418": 41336, "417": 41680, "416": 41973, "415": 42272, "414": 42554, "413": 42853, "412": 43150, "411": 43442, "410": 43752, "409": 44040, "408": 44340, "407": 44661, "406": 44934, "405": 45237, "404": 45530, "403": 45825, "402": 46088, "401": 46382, "400": 46661, "399": 46956, "398": 47272, "397": 47538, "396": 47855, "395": 48160, "394": 48421, "393": 48709, "392": 48981, "391": 49253, "390": 49528, "389": 49804, "388": 50066, "387": 50372, "386": 50698, "385": 51006, "384": 51262, "383": 51518, "382": 51784, "381": 52038, "380": 52329, "379": 52587, "378": 52846, "377": 53097, "376": 53392, "375": 53669, "374": 53906, "373": 54168, "372": 54426, "371": 54687, "370": 54973, "369": 55229, "368": 55516, "367": 55782, "366": 56025, "365": 56302, "364": 56564, "363": 56812, "362": 57053, "361": 57321, "360": 57575, "359": 57841, "358": 58122, "357": 58373, "356": 58625, "355": 58862, "354": 59110, "353": 59335, "352": 59576, "351": 59816, "350": 60018, "349": 60253, "348": 60477, "347": 60698, "346": 60903, "345": 61138, "344": 61352, "343": 61580, "342": 61793, "341": 62004, "340": 62215, "339": 62427, "338": 62662, "337": 62855, "336": 63052, "335": 63242, "334": 63427, "333": 63617, "332": 63802, "331": 64006, "330": 64180, "329": 64368, "328": 64530, "327": 64693, "326": 64889, "325": 65052, "324": 65225, "323": 65381, "322": 65543, "321": 65685, "320": 65861, "319": 66026, "318": 66189, "317": 66347, "316": 66524, "315": 66658, "314": 66826, "313": 66997, "312": 67146, "311": 67289, "310": 67441, "309": 67575, "308": 67696, "307": 67844, "306": 67968, "305": 68108, "304": 68235, "303": 68346, "302": 68472, "301": 68592, "300": 68711, "299": 68813, "298": 68918, "297": 69031, "296": 69138, "295": 69247, "294": 69351, "293": 69460, "292": 69556, "291": 69656, "290": 69776, "289": 69867, "288": 69942, "287": 70040, "286": 70133, "285": 70213, "284": 70306, "283": 70404, "282": 70490, "281": 70571, "280": 70645, "279": 70722, "278": 70817, "277": 70879, "276": 70957, "275": 71040, "274": 71105, "273": 71190, "272": 71261, "271": 71329, "270": 71376, "269": 71439, "268": 71500, "267": 71562, "266": 71621, "265": 71688, "264": 71748, "263": 71800, "262": 71840, "261": 71890, "260": 71939, "259": 71974, "258": 72019, "257": 72064, "256": 72108, "255": 72153, "254": 72191, "253": 72229, "252": 72287, "251": 72323, "250": 72365, "249": 72403, "248": 72453, "247": 72486, "246": 72508, "245": 72536, "244": 72562, "243": 72596, "242": 72628, "241": 72665, "240": 72684, "239": 72713, "238": 72744, "237": 72762, "236": 72783, "235": 72809, "234": 72835, "233": 72857, "232": 72875, "231": 72889, "230": 72909, "229": 72925, "228": 72937, "227": 72949, "226": 72967, "225": 72988, "224": 73003, "223": 73018, "222": 73031, "221": 73050, "220": 73067, "219": 73079, "218": 73091, "217": 73112, "216": 73124, "215": 73134, "214": 73143, "213": 73155, "212": 73161, "211": 73167, "210": 73175, "209": 73188, "208": 73194, "207": 73198, "206": 73208, "205": 73219, "204": 73229, "203": 73239, "202": 73247, "201": 73259, "200": 73269, "199": 73276, "198": 73280, "197": 73285, "196": 73290, "195": 73297, "194": 73306, "193": 73312, "192": 73319, "191": 73325, "190": 73333, "189": 73338, "188": 73344, "187": 73348, "186": 73350, "185": 73352, "184": 73358, "183": 73362, "182": 73366, "181": 73369, "180": 73373}, "meta": {"source": "重庆市教育考试院公布的一分一段表（中国教育在线 gaokao.eol.cn 官方转载）", "article": {"wl": "https://gaokao.eol.cn/chong_qing/dongtai/202506/t20250624_2676788.shtml", "ls": "https://gaokao.eol.cn/chong_qing/dongtai/202506/t20250624_2676749.shtml"}, "verified": "2026-09-30"}};


/* ---------- 50-exp ---------- */
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


/* ---------- 51-daohang ---------- */
/* ---------- v0.54：常用网址导航（hao123 式目录，但只收录实测可达 + 家长真会用的） ----------
   全部链接于 2026-10-02 逐条 GET 实测可达（69/69），收录标准：
   ① 官方一手信息源优先；② 家长一学期内至少会用一次；③ 域名与站点身份一致（标题已核验）。
   ponytail: 数据即目录，改链接只改 DAO_CATS；无需新增页面结构 */
var DAO_NOTE = '本站于 2026-10-02 逐条实测每个入口（73 个全部可打开，2026-10-30 复测），域名与站名一一核对。';
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
                      ['家长论坛','forum.html'],['升学日历','calendar.html'],['数据来源','data-sources.html']];
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
    + '<a href="' + hrefEnc(DAO_ZHENG.u) + '" target="_blank" rel="noopener">市政府公告原文 ↗</a>'
    + ' · <a href="schools.html#lj-guide">两江升学专题 →</a>';
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


/* ---------- 52-forum ---------- */
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
  if(typeof jfmTrack === 'function') jfmTrack('forum_post', { board: board.value });
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


/* ---------- 53-subscribe ---------- */
/* ---------- v0.80：节点提醒订阅（页脚订阅条 · 生成 .ics，本机不收集联系方式） ---------- */
function subscribeNode(){
  var stageEl = document.getElementById('sub-stage');
  var stage = stageEl ? stageEl.value : '';
  var items = document.querySelectorAll('.cal[data-stage="' + stage + '"]');
  if(!items.length){ toast('该学段暂无节点数据'); return false; }
  var stamp = new Date().toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
  var L = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//jfm demo//升学节点订阅//CN','CALSCALE:GREGORIAN','X-WR-CALNAME:花期册 · ' + stage + '升学节点'];
  items.forEach(function(c, i){
    var dEl = c.querySelector('.date'), hEl = c.querySelector('h4');
    var m = ((dEl ? dEl.textContent : '') || '').match(/(\d{4})-(\d{2})/);
    if(!m) return;
    var ds = m[1] + m[2] + '01';
    var d = new Date(parseInt(m[1],10), parseInt(m[2],10) - 1, 1);
    d.setMonth(d.getMonth() + 1);
    var de = d.getFullYear() + String(d.getMonth() + 1).padStart(2,'0') + '01';
    L.push('BEGIN:VEVENT');
    L.push('UID:jfm-sub-' + Date.now() + '-' + i + '@demo');
    L.push('DTSTAMP:' + stamp);
    L.push('DTSTART;VALUE=DATE:' + ds);
    L.push('DTEND;VALUE=DATE:' + de);
    L.push('SUMMARY:' + icsEsc(hEl ? hEl.textContent : stage + '节点'));
    L.push('DESCRIPTION:花期册 · ' + stage + '节点提醒；以当年官方发布为准');
    L.push('END:VEVENT');
  });
  L.push('END:VCALENDAR');
  var blob = new Blob([L.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  var u = URL.createObjectURL(blob), el = document.createElement('a');
  el.href = u; el.download = 'jfm-' + stage + '-nodes.ics';
  document.body.appendChild(el); el.click(); document.body.removeChild(el);
  setTimeout(function(){ URL.revokeObjectURL(u); }, 800);
  try{
    var log = JSON.parse(localStorage.getItem('jfm_subscribe_log') || '[]');
    log.push({ stage: stage, date: new Date().toISOString() });
    localStorage.setItem('jfm_subscribe_log', JSON.stringify(log));
  }catch(e){}
  if(typeof jfmTrack === 'function') jfmTrack('subscribe_ics', { stage: stage });
  var ok = document.getElementById('sub-ok'); if(ok) ok.hidden = false;
  if(typeof toast === 'function') toast('已生成 ' + stage + ' 节点提醒日历（.ics）');
  return false;
}
function copySubscribeLink(){
  var url = location.origin + location.pathname;
  var done = function(){ if(typeof toast==='function') toast('链接已复制——发给同年级的家长吧'); };
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(done, function(){ fallbackCopy(url); done(); });
  } else { fallbackCopy(url); done(); }
  if(typeof jfmTrack === 'function') jfmTrack('subscribe_share', {});
}
function fallbackCopy(text){
  var ta = document.createElement('textarea'); ta.value = text;
  document.body.appendChild(ta); ta.select();
  try{ document.execCommand('copy'); }catch(e){}
  document.body.removeChild(ta);
}


/* ---------- 54-bagua ---------- */
/* ---------- 八卦社：自媒体升学观点索引（v1.0） ----------
   定位：基于抖音/小红书公开内容的观点索引摘要，非官方政策。
   规则：一票否决词命中不入库；免责段落每条强制；每日去重（id + author+title指纹）。 */
var BAGUA_STAGES = ['小升初', '初升高', '新高考'];
var baguaFilter = 'all';
var baguaShown = 8;

function baguaDB(){
  var db = (typeof window.BAGUA_DATA !== 'undefined') ? window.BAGUA_DATA : null;
  if (db && db.items && db.items.length) return db;
  return { items: [], weekly: null, disclaimer_short: '自媒体观点索引，非官方政策，不构成填报建议' };
}

function setBaguaFilter(st){
  baguaFilter = st || 'all';
  baguaShown = 8;
  renderBagua();
}

function moreBagua(){
  baguaShown += 8;
  renderBagua();
}

/* 风险徽章 */
function baguaRiskBadge(rl){
  if (rl === '正常') return '<span class="bg-risk ok">正常</span>';
  if (rl === '待人工复核') return '<span class="bg-risk warn">待人工复核</span>';
  return '';
}

/* 平台徽章 */
function baguaPlatformBadge(p){
  var cls = p === '抖音' ? 'dy' : (p === '小红书' ? 'xhs' : 'web');
  return '<span class="bg-plat ' + cls + '">' + esc(p || '公开渠道') + '</span>';
}

/* 时效分级（2026-10-20 用户纪律固化：置顶消息≠最新消息，必须把发布时效亮给家长看）
   ≤3 天=最新；≤30 天=近期；其余=历史存档（灰显）。日期一律取视频 og 真实发布时间。 */
function baguaFreshBadge(pub){
  if (!pub) return '<span class="bg-fresh stale">时效未核实</span>';
  var days = Math.floor((Date.now() - new Date(pub + 'T00:00:00+08:00').getTime()) / 86400000);
  if (days <= 3) return '<span class="bg-fresh hot">最新</span>';
  if (days <= 30) return '<span class="bg-fresh warm">近30天</span>';
  return '<span class="bg-fresh stale">历史存档</span>';
}

/* 单条卡片：封面图 + 徽章行 + 摘要 + 标签 + 免责 + 原帖链接 */
function baguaCardHTML(x, i){
  var stages = (x.stage && BAGUA_STAGES.indexOf(x.stage) >= 0)
    ? '<span class="stage-tag">' + esc(x.stage) + '</span>' : '';
  var tags = (x.tags || []).map(function(t){ return '<span class="bg-tag">#' + esc(t) + '</span>'; }).join('');
  var link = x.original_url
    ? '<a class="bg-src" href="' + esc(x.original_url) + '" target="_blank" rel="noopener nofollow">原帖 ↗</a>'
    : '<span class="bg-src muted">无公开链接</span>';
  var reviewTip = x.reviewed === false
    ? '<span class="bg-review-tip">该条为机器初筛结果，正在等待人工终审；展示内容不构成任何建议</span>' : '';
  var bodyHTML;
  if (x.deep) {
    var d = x.deep;
    var det = (d.details || []).map(function(it){ return '<div class="bg-det-item">' + esc(it) + '</div>'; }).join('');
    /* v2.2：主体=核心论点+关键信息（≥500 字客观详录主播/媒体原意）；评价类内容压缩为一句备注 */
    bodyHTML = ''
      + '<p class="bg-sec"><b>核心论点</b></p><p class="bg-p">' + esc(d.core || '') + '</p>'
      + (det ? '<p class="bg-sec"><b>关键信息</b></p><div class="bg-details">' + det + '</div>' : '')
      + (d.note ? '<p class="bg-persp bg-note-line">' + esc(d.note) + '</p>' : '');
  } else {
    bodyHTML = '<p class="bg-sum">' + esc(x.ai_summary || '') + '</p>';
  }
  return '<div class="bg-card' + (x.deep ? ' deep' : '') + '" data-bgkey="' + esc(x.id || ('g' + i)) + '">'
    + '<div class="bg-card-head">'
    +   baguaPlatformBadge(x.source_platform)
    +   stages
    +   baguaRiskBadge(x.risk_level)
    +   '<span class="bg-author">' + esc(x.author_name || '佚名博主') + '</span>'
    +   '<span class="bg-date">' + esc((x.publish_time || '').slice(0, 10)) + '</span>'
    +   baguaFreshBadge((x.publish_time || '').slice(0, 10))
    + '</div>'
    + bodyHTML
    + (x.risk_note ? '<p class="bg-riskenote">风控备注：' + esc(x.risk_note) + '</p>' : '')
    + '<div class="bg-tags">' + tags + '</div>'
    + reviewTip
    + '<div class="bg-card-foot">'
    +   '<span class="bg-disc">自媒体个人观点，非官方政策，不作为填报依据</span>'
    +   link
    + '</div></div>';
}

/* 主渲染：横幅 + 筛选 + 空状态 + 卡片流 */
function renderBagua(){
  var box = document.getElementById('bagua-list');
  if (!box) return;
  var db = baguaDB();
  var items = db.items || [];
  /* 只展示 正常(rev ok) + 待人工复核；高风险一律不入库（采集端保证，这里双保险） */
  items = items.filter(function(x){ return x.risk_level === '正常' || x.risk_level === '待人工复核'; });
  if (baguaFilter !== 'all') items = items.filter(function(x){ return x.stage === baguaFilter; });
  items.sort(function(a, b){ return String(b.publish_time || '').localeCompare(String(a.publish_time || '')); });

  /* 计数徽章 */
  var all = (db.items || []).filter(function(x){ return x.risk_level === '正常' || x.risk_level === '待人工复核'; });
  document.querySelectorAll('#bagua-filter .ff').forEach(function(b){
    var st = b.getAttribute('data-bg');
    var n = st === 'all' ? all.length : all.filter(function(x){ return x.stage === st; }).length;
    b.textContent = b.getAttribute('data-label') + (n ? ' ' + n : '');
  });

  var shown = items.slice(0, baguaShown);
  box.innerHTML = shown.length
    ? shown.map(baguaCardHTML).join('')
    : '<div class="bg-empty">近期暂无通过风控的博主观点摘要。八卦社每日自动整理，高风险与营销内容一律不收录；正式升学信息请看上方编辑部精选与政策库。</div>';

  var more = document.getElementById('bagua-more');
  if (more) {
    if (items.length > baguaShown) {
      more.hidden = false;
      more.innerHTML = '<button class="mini-btn" onclick="moreBagua()">加载更多（还有 ' + (items.length - baguaShown) + ' 条）</button>';
    } else { more.hidden = true; }
  }

  var meta = document.getElementById('bagua-meta');
  if (meta) {
    var pend = all.filter(function(x){ return x.reviewed === false; }).length;
    meta.textContent = '已收录 ' + all.length + ' 条（待人工终审 ' + pend + ' 条）· 每日自动整理去重 · 高风险内容一票否决不入库';
  }

  renderBaguaTrend(db);
  renderBaguaHosts(db);
}

/* 话题热度条：纯 CSS 条形图（每周随管线更新） */
function renderBaguaTrend(db){
  var box = document.getElementById('bagua-trend');
  if (!box) return;
  var wk = db.weekly;
  if (!wk || !wk.topics || !wk.topics.length) { box.innerHTML = ''; return; }
  var max = Math.max.apply(null, wk.topics.map(function(t){ return t.count || 0; }).concat([1]));
  var bars = wk.topics.slice(0, 6).map(function(t){
    var pct = Math.round((t.count || 0) / max * 100);
    return '<div class="bg-trend-row"><span class="bg-trend-tag">#' + esc(t.tag) + '</span>'
      + '<div class="bg-trend-bar"><i style="width:' + pct + '%"></i></div>'
      + '<span class="bg-trend-n">' + t.count + ' 条 · ' + esc(t.trend || '平') + '</span></div>';
  }).join('');
  box.innerHTML = '<div class="bg-trend-head">近 30 天话题热度 <span class="bg-trend-gen">' + esc(wk.generated || '') + ' 更新</span></div>' + bars
    + '<p class="bg-trend-note">' + esc(wk.note || '') + '</p>';
}

/* 初始渲染：页面加载后若八卦社板块在当前页则立即渲染（含「全部」计数徽章） */
(function(){
  function boot(){ if (document.getElementById('bagua-list')) renderBagua(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();


/* 主播声量对比：按在库条目数统计各主播（内容产量代理），并挂载白名单核验档案（粉丝/获赞/活跃） */
function renderBaguaHosts(db){
  var box = document.getElementById('bagua-hosts');
  if (!box) return;
  var items = (db.items || []).filter(function(x){ return x.risk_level === '正常' || x.risk_level === '待人工复核'; });
  var cnt = {};
  items.forEach(function(x){ var a = x.author_name || '佚名'; cnt[a] = (cnt[a] || 0) + 1; });
  var wl = {};
  var wlList = (db.whitelist && db.whitelist.hosts) || [];
  wlList.forEach(function(h){ wl[h.name] = h; });
  var rows = Object.keys(cnt).map(function(a){ return { a: a, c: cnt[a] }; }).sort(function(p, q){ return q.c - p.c; }).slice(0, 8);
  if (!rows.length) { box.innerHTML = ''; return; }
  var max = rows[0].c || 1;
  var bars = rows.map(function(r){
    var pct = Math.round(r.c / max * 100);
    var h = wl[r.a];
    var meta = '';
    if (h && h.verified && (h.verified.fans || h.verified.likes)) {
      var parts = [];
      if (h.verified.fans) parts.push(esc(h.verified.fans));
      if (h.verified.likes) parts.push(esc(h.verified.likes));
      meta = '<span class="bg-host-meta">' + parts.join(' · ') + '</span>';
    }
    return '<div class="bg-trend-row bg-host-row"><span class="bg-trend-tag">' + esc(r.a) + (meta ? '<br>' + meta : '') + '</span>'
      + '<div class="bg-trend-bar"><i style="width:' + pct + '%"></i></div>'
      + '<span class="bg-trend-n">' + r.c + ' 条</span></div>';
  }).join('');
  var wlOk = wlList.filter(function(h){ return h.user_verified; }).length;
  box.innerHTML = '<div class="bg-trend-head">在库主播声量 <span class="bg-trend-gen">' + esc(db.weekly && db.weekly.generated || '') + ' 统计</span></div>' + bars
    + '<p class="bg-trend-note">按在库条目数统计（内容产量的近似代理）；粉丝/获赞为账号级核验数据（' + wlOk + '/' + wlList.length + ' 位已人工/直采核验）。声量高低不代表观点正确性，每条均独立过风控。</p>';
}


/* ---------- 49-section2026 ---------- */
/* ---------- v0.90：2026 一分一段表（重庆市教育考试院公布 · 中国教育在线官方转载 2026-06-25） ---------- */
var SECTION2026 = {"wl": {"684": 157, "683": 179, "682": 194, "681": 210, "680": 228, "679": 250, "678": 268, "677": 295, "676": 318, "675": 344, "674": 372, "673": 411, "672": 449, "671": 472, "670": 518, "669": 555, "668": 595, "667": 644, "666": 696, "665": 746, "664": 801, "663": 859, "662": 909, "661": 951, "660": 1011, "659": 1090, "658": 1156, "657": 1234, "656": 1320, "655": 1410, "654": 1494, "653": 1595, "652": 1692, "651": 1801, "650": 1912, "649": 2020, "648": 2127, "647": 2251, "646": 2374, "645": 2507, "644": 2646, "643": 2786, "642": 2907, "641": 3061, "640": 3203, "639": 3340, "638": 3492, "637": 3643, "636": 3795, "635": 3955, "634": 4122, "633": 4284, "632": 4455, "631": 4662, "630": 4839, "629": 5046, "628": 5255, "627": 5458, "626": 5671, "625": 5879, "624": 6109, "623": 6308, "622": 6536, "621": 6763, "620": 7023, "619": 7266, "618": 7535, "617": 7797, "616": 8064, "615": 8331, "614": 8626, "613": 8895, "612": 9166, "611": 9477, "610": 9744, "609": 10041, "608": 10337, "607": 10611, "606": 10944, "605": 11271, "604": 11591, "603": 11931, "602": 12260, "601": 12573, "600": 12895, "599": 13237, "598": 13609, "597": 13954, "596": 14306, "595": 14661, "594": 15005, "593": 15400, "592": 15777, "591": 16200, "590": 16595, "589": 16943, "588": 17339, "587": 17758, "586": 18162, "585": 18595, "584": 18981, "583": 19372, "582": 19770, "581": 20161, "580": 20545, "579": 20985, "578": 21419, "577": 21847, "576": 22307, "575": 22737, "574": 23180, "573": 23670, "572": 24100, "571": 24603, "570": 25044, "569": 25503, "568": 25998, "567": 26475, "566": 26954, "565": 27445, "564": 27928, "563": 28442, "562": 28913, "561": 29415, "560": 29894, "559": 30395, "558": 30908, "557": 31402, "556": 31929, "555": 32418, "554": 32890, "553": 33414, "552": 33934, "551": 34485, "550": 35015, "549": 35565, "548": 36109, "547": 36618, "546": 37144, "545": 37665, "544": 38229, "543": 38758, "542": 39343, "541": 39851, "540": 40375, "539": 40952, "538": 41498, "537": 42098, "536": 42650, "535": 43198, "534": 43785, "533": 44357, "532": 44900, "531": 45491, "530": 46055, "529": 46628, "528": 47196, "527": 47757, "526": 48267, "525": 48807, "524": 49391, "523": 49999, "522": 50596, "521": 51159, "520": 51732, "519": 52311, "518": 52890, "517": 53508, "516": 54108, "515": 54714, "514": 55286, "513": 55893, "512": 56491, "511": 57029, "510": 57602, "509": 58158, "508": 58711, "507": 59266, "506": 59841, "505": 60417, "504": 61001, "503": 61549, "502": 62090, "501": 62654, "500": 63249, "499": 63841, "498": 64421, "497": 64996, "496": 65519, "495": 66072, "494": 66672, "493": 67246, "492": 67817, "491": 68354, "490": 68916, "489": 69462, "488": 70035, "487": 70546, "486": 71058, "485": 71584, "484": 72154, "483": 72707, "482": 73201, "481": 73728, "480": 74294, "479": 74840, "478": 75386, "477": 75919, "476": 76457, "475": 76965, "474": 77435, "473": 77989, "472": 78496, "471": 79021, "470": 79472, "469": 79992, "468": 80480, "467": 80978, "466": 81484, "465": 81957, "464": 82410, "463": 82897, "462": 83397, "461": 83880, "460": 84342, "459": 84770, "458": 85224, "457": 85682, "456": 86129, "455": 86583, "454": 87065, "453": 87526, "452": 87972, "451": 88448, "450": 88930, "449": 89373, "448": 89887, "447": 90348, "446": 90838, "445": 91297, "444": 91743, "443": 92193, "442": 92649, "441": 93109, "440": 93583, "439": 94005, "438": 94438, "437": 94820, "436": 95292, "435": 95725, "434": 96178, "433": 96610, "432": 97011, "431": 97457, "430": 97870, "429": 98275, "428": 98645, "427": 99076, "426": 99500, "425": 99906, "424": 100308, "423": 100693, "422": 101064, "421": 101418, "420": 101811, "419": 102187, "418": 102553, "417": 102953, "416": 103362, "415": 103737, "414": 104130, "413": 104527, "412": 104904, "411": 105273, "410": 105630, "409": 105975, "408": 106315, "407": 106653, "406": 107000, "405": 107344, "404": 107679, "403": 108042, "402": 108368, "401": 108704, "400": 109068, "399": 109408, "398": 109743, "397": 110077, "396": 110355, "395": 110677, "394": 110992, "393": 111308, "392": 111605, "391": 111946, "390": 112264, "389": 112562, "388": 112857, "387": 113150, "386": 113432, "385": 113740, "384": 114045, "383": 114345, "382": 114638, "381": 114920, "380": 115242, "379": 115536, "378": 115810, "377": 116083, "376": 116351, "375": 116633, "374": 116915, "373": 117172, "372": 117458, "371": 117721, "370": 117964, "369": 118201, "368": 118446, "367": 118666, "366": 118922, "365": 119178, "364": 119434, "363": 119692, "362": 119953, "361": 120201, "360": 120434, "359": 120671, "358": 120889, "357": 121135, "356": 121370, "355": 121584, "354": 121826, "353": 122026, "352": 122245, "351": 122482, "350": 122691, "349": 122881, "348": 123096, "347": 123311, "346": 123539, "345": 123738, "344": 123927, "343": 124124, "342": 124317, "341": 124511, "340": 124687, "339": 124901, "338": 125104, "337": 125280, "336": 125443, "335": 125620, "334": 125807, "333": 125988, "332": 126170, "331": 126348, "330": 126517, "329": 126678, "328": 126866, "327": 127026, "326": 127162, "325": 127302, "324": 127450, "323": 127597, "322": 127727, "321": 127890, "320": 128030, "319": 128168, "318": 128289, "317": 128433, "316": 128567, "315": 128699, "314": 128832, "313": 128958, "312": 129113, "311": 129230, "310": 129359, "309": 129479, "308": 129598, "307": 129708, "306": 129840, "305": 129947, "304": 130069, "303": 130182, "302": 130296, "301": 130419, "300": 130516, "299": 130621, "298": 130718, "297": 130815, "296": 130914, "295": 131024, "294": 131122, "293": 131237, "292": 131337, "291": 131433, "290": 131557, "289": 131656, "288": 131724, "287": 131801, "286": 131896, "285": 131979, "284": 132068, "283": 132147, "282": 132232, "281": 132319, "280": 132400, "279": 132492, "278": 132570, "277": 132641, "276": 132706, "275": 132775, "274": 132857, "273": 132927, "272": 133005, "271": 133069, "270": 133143, "269": 133218, "268": 133277, "267": 133323, "266": 133399, "265": 133459, "264": 133512, "263": 133575, "262": 133632, "261": 133681, "260": 133735, "259": 133786, "258": 133834, "257": 133903, "256": 133967, "255": 134016, "254": 134073, "253": 134128, "252": 134188, "251": 134244, "250": 134285, "249": 134325, "248": 134376, "247": 134427, "246": 134471, "245": 134507, "244": 134540, "243": 134578, "242": 134626, "241": 134672, "240": 134707, "239": 134741, "238": 134780, "237": 134816, "236": 134855, "235": 134891, "234": 134922, "233": 134955, "232": 134981, "231": 135004, "230": 135030, "229": 135052, "228": 135073, "227": 135113, "226": 135141, "225": 135163, "224": 135188, "223": 135209, "222": 135226, "221": 135241, "220": 135268, "219": 135290, "218": 135304, "217": 135322, "216": 135340, "215": 135353, "214": 135364, "213": 135374, "212": 135385, "211": 135396, "210": 135412, "209": 135427, "208": 135437, "207": 135448, "206": 135456, "205": 135471, "204": 135483, "203": 135491, "202": 135497, "201": 135508, "200": 135516, "199": 135531, "198": 135542, "197": 135547, "196": 135549, "195": 135551, "194": 135563, "193": 135569, "192": 135573, "191": 135584, "190": 135591, "189": 135592, "187": 135594, "186": 135598, "185": 135602, "184": 135608, "183": 135610, "182": 135615, "181": 135619, "180": 135621}, "ls": {"663": 60, "662": 68, "661": 78, "660": 89, "659": 97, "658": 108, "657": 122, "656": 132, "655": 140, "654": 147, "653": 158, "652": 168, "651": 177, "650": 189, "649": 206, "648": 220, "647": 235, "646": 254, "645": 273, "644": 293, "643": 310, "642": 331, "641": 355, "640": 379, "639": 399, "638": 426, "637": 445, "636": 462, "635": 485, "634": 515, "633": 539, "632": 560, "631": 585, "630": 621, "629": 659, "628": 700, "627": 725, "626": 763, "625": 795, "624": 831, "623": 865, "622": 913, "621": 948, "620": 990, "619": 1047, "618": 1091, "617": 1141, "616": 1186, "615": 1227, "614": 1271, "613": 1326, "612": 1375, "611": 1433, "610": 1502, "609": 1563, "608": 1615, "607": 1675, "606": 1733, "605": 1789, "604": 1854, "603": 1922, "602": 1990, "601": 2054, "600": 2120, "599": 2213, "598": 2284, "597": 2378, "596": 2468, "595": 2560, "594": 2633, "593": 2738, "592": 2831, "591": 2918, "590": 2997, "589": 3074, "588": 3159, "587": 3236, "586": 3322, "585": 3418, "584": 3508, "583": 3609, "582": 3699, "581": 3793, "580": 3876, "579": 3956, "578": 4056, "577": 4155, "576": 4279, "575": 4412, "574": 4513, "573": 4631, "572": 4725, "571": 4822, "570": 4939, "569": 5055, "568": 5176, "567": 5289, "566": 5419, "565": 5541, "564": 5661, "563": 5807, "562": 5938, "561": 6073, "560": 6201, "559": 6350, "558": 6488, "557": 6640, "556": 6780, "555": 6939, "554": 7100, "553": 7240, "552": 7385, "551": 7531, "550": 7686, "549": 7846, "548": 7990, "547": 8139, "546": 8309, "545": 8478, "544": 8651, "543": 8806, "542": 8974, "541": 9150, "540": 9311, "539": 9480, "538": 9659, "537": 9830, "536": 10011, "535": 10190, "534": 10382, "533": 10582, "532": 10805, "531": 10984, "530": 11184, "529": 11356, "528": 11528, "527": 11719, "526": 11910, "525": 12111, "524": 12333, "523": 12545, "522": 12745, "521": 12957, "520": 13155, "519": 13356, "518": 13564, "517": 13785, "516": 13996, "515": 14201, "514": 14412, "513": 14603, "512": 14802, "511": 14999, "510": 15208, "509": 15417, "508": 15638, "507": 15871, "506": 16084, "505": 16314, "504": 16528, "503": 16751, "502": 16988, "501": 17218, "500": 17442, "499": 17671, "498": 17893, "497": 18137, "496": 18383, "495": 18605, "494": 18837, "493": 19066, "492": 19273, "491": 19507, "490": 19733, "489": 19970, "488": 20195, "487": 20438, "486": 20674, "485": 20897, "484": 21127, "483": 21381, "482": 21618, "481": 21850, "480": 22109, "479": 22345, "478": 22572, "477": 22825, "476": 23068, "475": 23317, "474": 23569, "473": 23818, "472": 24078, "471": 24309, "470": 24534, "469": 24796, "468": 25025, "467": 25266, "466": 25512, "465": 25796, "464": 26047, "463": 26293, "462": 26534, "461": 26764, "460": 27022, "459": 27257, "458": 27521, "457": 27816, "456": 28072, "455": 28336, "454": 28588, "453": 28875, "452": 29119, "451": 29366, "450": 29612, "449": 29876, "448": 30155, "447": 30413, "446": 30671, "445": 30915, "444": 31183, "443": 31462, "442": 31754, "441": 32009, "440": 32272, "439": 32561, "438": 32856, "437": 33107, "436": 33373, "435": 33641, "434": 33917, "433": 34176, "432": 34445, "431": 34714, "430": 34940, "429": 35215, "428": 35473, "427": 35765, "426": 36023, "425": 36278, "424": 36536, "423": 36841, "422": 37102, "421": 37362, "420": 37622, "419": 37913, "418": 38141, "417": 38412, "416": 38689, "415": 38962, "414": 39227, "413": 39487, "412": 39758, "411": 40034, "410": 40292, "409": 40561, "408": 40795, "407": 41057, "406": 41299, "405": 41575, "404": 41835, "403": 42117, "402": 42386, "401": 42668, "400": 42927, "399": 43197, "398": 43474, "397": 43750, "396": 44040, "395": 44315, "394": 44568, "393": 44857, "392": 45127, "391": 45383, "390": 45644, "389": 45897, "388": 46163, "387": 46397, "386": 46654, "385": 46904, "384": 47152, "383": 47396, "382": 47653, "381": 47887, "380": 48129, "379": 48385, "378": 48643, "377": 48916, "376": 49170, "375": 49437, "374": 49660, "373": 49901, "372": 50177, "371": 50394, "370": 50655, "369": 50885, "368": 51101, "367": 51343, "366": 51604, "365": 51833, "364": 52060, "363": 52306, "362": 52551, "361": 52805, "360": 53040, "359": 53276, "358": 53471, "357": 53697, "356": 53905, "355": 54120, "354": 54331, "353": 54571, "352": 54787, "351": 54986, "350": 55220, "349": 55440, "348": 55651, "347": 55905, "346": 56138, "345": 56354, "344": 56532, "343": 56758, "342": 56953, "341": 57153, "340": 57321, "339": 57518, "338": 57716, "337": 57914, "336": 58109, "335": 58317, "334": 58496, "333": 58722, "332": 58914, "331": 59105, "330": 59280, "329": 59469, "328": 59662, "327": 59837, "326": 60004, "325": 60187, "324": 60378, "323": 60546, "322": 60722, "321": 60904, "320": 61088, "319": 61269, "318": 61427, "317": 61611, "316": 61774, "315": 61963, "314": 62128, "313": 62271, "312": 62426, "311": 62592, "310": 62752, "309": 62899, "308": 63062, "307": 63189, "306": 63329, "305": 63473, "304": 63609, "303": 63744, "302": 63869, "301": 64000, "300": 64125, "299": 64260, "298": 64384, "297": 64503, "296": 64615, "295": 64739, "294": 64854, "293": 64959, "292": 65092, "291": 65204, "290": 65305, "289": 65435, "288": 65553, "287": 65675, "286": 65794, "285": 65903, "284": 66016, "283": 66115, "282": 66208, "281": 66302, "280": 66389, "279": 66468, "278": 66549, "277": 66635, "276": 66710, "275": 66799, "274": 66883, "273": 66963, "272": 67048, "271": 67140, "270": 67211, "269": 67277, "268": 67363, "267": 67446, "266": 67504, "265": 67587, "264": 67641, "263": 67709, "262": 67776, "261": 67847, "260": 67903, "259": 67957, "258": 68008, "257": 68062, "256": 68130, "255": 68189, "254": 68241, "253": 68307, "252": 68346, "251": 68398, "250": 68449, "249": 68503, "248": 68553, "247": 68614, "246": 68658, "245": 68697, "244": 68732, "243": 68764, "242": 68792, "241": 68843, "240": 68878, "239": 68909, "238": 68938, "237": 68972, "236": 68999, "235": 69026, "234": 69059, "233": 69089, "232": 69124, "231": 69150, "230": 69179, "229": 69199, "228": 69226, "227": 69262, "226": 69291, "225": 69312, "224": 69326, "223": 69353, "222": 69370, "221": 69390, "220": 69416, "219": 69434, "218": 69449, "217": 69470, "216": 69485, "215": 69501, "214": 69519, "213": 69533, "212": 69551, "211": 69562, "210": 69574, "209": 69586, "208": 69593, "207": 69612, "206": 69622, "205": 69628, "204": 69637, "203": 69649, "202": 69661, "201": 69670, "200": 69674, "199": 69683, "198": 69697, "197": 69703, "196": 69713, "195": 69717, "194": 69724, "193": 69732, "192": 69740, "191": 69748, "190": 69756, "189": 69760, "188": 69768, "187": 69777, "186": 69779, "185": 69786, "184": 69790, "183": 69795, "182": 69803, "181": 69807, "180": 69810},
  "meta": {"source": "重庆市教育考试院公布的一分一段表（中国教育在线 gaokao.eol.cn 官方转载，含加分口径）", "article": {"wl": "https://gaokao.eol.cn/chong_qing/dongtai/202606/t20260625_2748895.shtml", "ls": "https://gaokao.eol.cn/chong_qing/dongtai/202606/t20260625_2748900.shtml"}, "verified": "2026-10-30"}};


/* ---------- 56-daxue ---------- */
/* ---------- 大学与专业库 v0.90：C9/985/211 在渝投档线五年趋势 + 一流学科 + 就业数据 ----------
   数据源：55-daxue-data.js（构建管线生成，勿手改）。
   口径：重庆市普通类本科批平行志愿投档最低分（普通类专业组最低值）；分校/医学部独立招生单独列示。
   红线：不承诺升学结果、不排名，所有数字标注来源与核验日期。 */
var DX = { tier:'all', cat:'both', city:'', type:'', q:'', sort:'tier' };
var DX_YEARS = ['2022','2023','2024','2025','2026'];

function dxCatLabel(k){ return k === 'wl' ? '物理类' : '历史类'; }

function dxSchoolTier(s){
  if(s.branch) return 'branch';
  if(s.c9) return 'c9';
  return s.tier; /* '985' | '211' */
}

function dxLatest(s, cat){
  /* 最近一年该科类有数据的记录 */
  for(var i = DX_YEARS.length - 1; i >= 0; i--){
    var y = DX_YEARS[i], rec = s.L[cat] && s.L[cat][y];
    if(rec) return { y:y, rec:rec };
  }
  return null;
}

function dxSpan(s, cat){
  /* 五年首尾变化（分数） */
  var first = null, last = null;
  DX_YEARS.forEach(function(y){
    var rec = s.L[cat] && s.L[cat][y];
    if(!rec) return;
    if(!first) first = rec;
    last = rec;
  });
  if(!first || !last || first === last) return null;
  return { d: last[0] - first[0], y0:first[0], y1:last[0] };
}

function dxPlanChip(s){
  /* 在渝招生计划（2026 与 2025 同科类合计对比；无采集件则不显示） */
  var p = s.plan;
  if(!p) return '';
  function total(y){
    var o = p[y]; if(!o) return null;
    var n = (o.wl || 0) + (o.ls || 0);
    return n > 0 ? n : null;
  }
  var cur = total('2026'), prev = total('2025');
  if(!cur) return '';
  var d = (cur && prev) ? (cur - prev) : null;
  var cls = d === null ? '' : (d >= 0 ? 'up' : 'down');
  return '<span>在渝计划 <b class="mono">' + cur + '</b><em>2026' + (d !== null ? ' · 较25年 ' + (d >= 0 ? '+' : '') + d : '') + '</em></span>';
}

function dxChart(s){
  var W = 320, H = 118, PL = 30, PR = 8, PT = 12, PB = 20;
  var vals = [];
  DX_YEARS.forEach(function(y){
    ['wl','ls'].forEach(function(c){
      var rec = s.L[c] && s.L[c][y];
      if(rec) vals.push(rec[0]);
    });
  });
  if(!vals.length) return '';
  var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
  var pad = Math.max(8, Math.round((mx - mn) * 0.15));
  mn -= pad; mx += pad;
  function X(i){ return PL + i * (W - PL - PR) / (DX_YEARS.length - 1); }
  function Y(v){ return PT + (H - PT - PB) * (mx - v) / (mx - mn); }
  var svg = '<svg class="dx-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(s.name) + ' 近五年在渝投档线趋势图" preserveAspectRatio="xMidYMid meet">';
  /* 网格（3 横线 + 刻度值） */
  for(var g = 0; g < 3; g++){
    var gv = Math.round(mn + (mx - mn) * g / 2);
    var gy = Y(gv);
    svg += '<line x1="' + PL + '" y1="' + gy + '" x2="' + (W - PR) + '" y2="' + gy + '" class="dx-gridline"/>';
    svg += '<text x="' + (PL - 4) + '" y="' + (gy + 3) + '" class="dx-axv" text-anchor="end">' + gv + '</text>';
  }
  /* 年份轴 */
  DX_YEARS.forEach(function(y, i){
    svg += '<text x="' + X(i) + '" y="' + (H - 6) + '" class="dx-axy" text-anchor="middle">' + y + '</text>';
  });
  /* 两条折线 */
  [['wl','dx-l-wl'],['ls','dx-l-ls']].forEach(function(pair){
    var c = pair[0], cls = pair[1];
    var seg = [], segs = [];
    DX_YEARS.forEach(function(y, i){
      var rec = s.L[c] && s.L[c][y];
      if(rec){ seg.push([X(i), Y(rec[0]), rec]); }
      else if(seg.length){ segs.push(seg); seg = []; }
    });
    if(seg.length) segs.push(seg);
    segs.forEach(function(p){
      if(p.length === 1){
        svg += '<circle cx="' + p[0][0] + '" cy="' + p[0][1] + '" r="3" class="' + cls + '"/><title>' + dxCatLabel(c) + ' ' + p[0][2][0] + '分</title>';
      } else {
        var pts = p.map(function(q){ return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' ');
        svg += '<polyline points="' + pts + '" class="' + cls + '"/>';
      }
      p.forEach(function(q){
        var t = '<title>' + dxCatLabel(c) + ' ' + q[2][0] + ' 分' + (q[2][1] ? ' · 位次 ' + q[2][1].toLocaleString() : '') + (q[2][2] ? ' · ' + q[2][2] : '') + '</title>';
        svg += '<circle cx="' + q[0].toFixed(1) + '" cy="' + q[1].toFixed(1) + '" r="2.6" class="' + cls + '-dot">' + t + '</circle>';
      });
      /* 首末值标签 */
      var a = p[0], b = p[p.length - 1];
      svg += '<text x="' + a[0].toFixed(1) + '" y="' + (a[1] - 5).toFixed(1) + '" class="dx-val" text-anchor="middle">' + a[2][0] + '</text>';
      if(b !== a) svg += '<text x="' + b[0].toFixed(1) + '" y="' + (b[1] - 5).toFixed(1) + '" class="dx-val" text-anchor="middle">' + b[2][0] + '</text>';
    });
  });
  return svg + '</svg>';
}

function dxDetail(s){
  var batch = (typeof DAXUE !== 'undefined' && DAXUE.meta.batch) || {};
  var rows = '', rankMissing = false;
  DX_YEARS.forEach(function(y){
    ['wl','ls'].forEach(function(c){
      var rec = s.L[c] && s.L[c][y];
      if(!rec) return;
      if(rec[1] == null) rankMissing = true;
      var b = batch[y] ? batch[y][c] : null;
      var d = (b != null && rec[0] != null) ? ((rec[0] - b >= 0 ? '+' : '') + (rec[0] - b)) : '—';
      rows += '<tr><td>' + y + '</td><td>' + dxCatLabel(c) + '</td><td class="mono">' + rec[0] + '</td>'
        + '<td class="mono">' + (rec[1] != null ? rec[1].toLocaleString() : '—') + '</td>'
        + '<td class="mono">' + d + '</td><td>' + (rec[2] ? esc(rec[2]) : '本科批·普通类') + '</td></tr>';
    });
  });
  if(!rows) return '<p class="dx-nodate">该校在渝无普通类本科批（含平行志愿提前批 B 段）投档数据——多为军校等特殊招生口径，详见上方说明。</p>';
  var notes = [];
  DX_YEARS.forEach(function(y){
    ['wl','ls'].forEach(function(c){
      var rec = s.L[c] && s.L[c][y];
      if(rec && rec[2]) notes.push(y + ' ' + dxCatLabel(c) + '：' + rec[2]);
    });
  });
  var noteLine = notes.length ? '<p class="dx-tnote">口径说明：' + notes.map(esc).join('；') + '</p>' : '';
  if(rankMissing) noteLine += '<p class="dx-tnote">位次「—」＝该年公开数据未提供最低位次（多见于 2022 年高分段），分数本身已核验。</p>';
  return '<div class="dx-twrap"><table class="art-table dx-table"><thead><tr><th>年份</th><th>科类</th><th>投档最低分</th><th>最低位次</th><th>批线差（对本科线）</th><th>口径</th></tr></thead><tbody>' + rows + '</tbody></table></div>' + noteLine;
}

function dxHasCoop(s){
  return DX_YEARS.some(function(y){
    return ['wl','ls'].some(function(c){
      var r = s.L[c] && s.L[c][y];
      return r && r[2] && r[2].indexOf('中外合作') >= 0;
    });
  });
}
function dxBadge(s){
  var out = '';
  if(s.tier === '985') out += '<span class="dx-badge b-985">985</span>';
  if(s.c9) out += '<span class="dx-badge b-c9">C9</span>';
  if(s.tier === '211' && !s.branch) out += '<span class="dx-badge b-211">211</span>';
  if(dxHasCoop(s)) out += '<span class="dx-badge b-211">含中外合作组</span>';
  if(s.branch) out += '<span class="dx-badge b-br">' + esc(s.branch) + '</span>';
  return out;
}

function dxCard(s){
  var lw = dxLatest(s, 'wl'), ll = dxLatest(s, 'ls');
  var sw = dxSpan(s, 'wl'), sl = dxSpan(s, 'ls');
  function chg(x){ return x ? ('<b class="' + (x.d >= 0 ? 'up' : 'down') + '">' + (x.d >= 0 ? '+' : '') + x.d + '</b>') : '—'; }
  var disc = (s.disc && s.disc.length) ? '<div class="dx-disc"><i>一流学科</i>' + s.disc.map(function(d){ return '<span>' + esc(d) + '</span>'; }).join('') + '</div>' : '';
  var majors = (s.majors && s.majors.length) ? '<div class="dx-majors"><i>热门方向</i>' + s.majors.map(function(d){ return '<span>' + esc(d) + '</span>'; }).join('') + '</div>' : '';
  var emp = '';
  if(s.emp){
    if(s.emp.rate){
      var src = s.emp.src ? ' <a class="dx-empsrc" href="' + esc(s.emp.src.u) + '" target="_blank" rel="noopener" title="' + esc((s.emp.src.o || '') + '《' + (s.emp.src.t || '') + '》' + (s.emp.src.d || '')) + '">来源 ↗</a>' : '';
      emp = '<div class="dx-emp"><i>就业</i>' + esc(s.emp.y || '') + esc(s.emp.label || '毕业去向落实率') + ' <b class="mono">' + esc(s.emp.rate) + '</b>' + (s.emp.note ? '<em>（' + esc(s.emp.note) + '）</em>' : '') + src + '</div>';
    } else {
      emp = '<div class="dx-emp"><i>就业</i>' + esc(s.emp.note || '以校方当年就业质量报告为准') + '</div>';
    }
  }
  var head = '<div class="dx-head">' + dxBadge(s) + '<h4>' + esc(s.name) + '</h4>'
    + '<button class="dx-mini' + (dxCmpLoad().indexOf(String(s.id)) >= 0 ? ' on' : '') + '" onclick="dxCmpToggle(\'' + s.id + '\')" aria-label="加入对比">对比</button>'
    + '<button class="dx-mini' + (dxFavLoad().indexOf(String(s.id)) >= 0 ? ' on' : '') + '" onclick="dxFavToggle(\'' + s.id + '\', this)" aria-label="关注">' + (dxFavLoad().indexOf(String(s.id)) >= 0 ? '★' : '☆') + '</button>'
    + '<button class="dx-mini" onclick="dxPrintCard(\'' + s.id + '\')" aria-label="打印该校卡片">打印</button>'
    + (s.web ? '<a class="dx-web" href="' + esc(s.web) + '" target="_blank" rel="noopener">官网 ↗</a>' : '') + '</div>';
  var meta = '<p class="dx-meta">' + esc(s.city) + ' · ' + esc(s.type || '—') + (s.parent ? ' · 母体：' + esc(s.parent) : '') + '</p>';
  var stats = '<div class="dx-stats">'
    + '<span>最新物理 ' + (lw ? '<b class="mono">' + lw.rec[0] + '</b><em>' + lw.y + (lw.rec[1] ? ' · 位次 ' + lw.rec[1].toLocaleString() : '') + '</em>' : '—') + '</span>'
    + '<span>最新历史 ' + (ll ? '<b class="mono">' + ll.rec[0] + '</b><em>' + ll.y + (ll.rec[1] ? ' · 位次 ' + ll.rec[1].toLocaleString() : '') + '</em>' : '—') + '</span>'
    + dxPlanChip(s)
    + dxFeeChip(s)
    + '<span>五年变化 物理' + chg(sw) + ' · 历史' + chg(sl) + '</span></div>';
  var chart = s.gnote ? '<div class="dx-gnote">' + esc(s.gnote) + '</div>' : dxChart(s);
  return '<article class="dx-card" id="dx-' + esc(s.id) + '">' + head + meta + chart + stats
    + disc + majors + emp
    + '<details class="dx-more"><summary>五年明细 · 口径</summary>' + dxDetail(s) + '</details></article>';
}

function dxFiltered(){
  var list = DAXUE.schools.filter(function(s){
    if(DX.tier === 'c9' && !s.c9) return false;
    if(DX.tier === '985' && (s.tier !== '985' || s.branch)) return false;
    if(DX.tier === '211' && (s.tier !== '211' || s.branch)) return false;
    if(DX.tier === 'branch' && !s.branch) return false;
    if(DX.city && s.city !== DX.city) return false;
    if(DX.type && s.type !== DX.type) return false;
    if(DX.q){
      var hay = (s.name + ' ' + s.city + ' ' + (s.disc || []).join(' ') + ' ' + (s.majors || []).join(' ') + ' ' + (s.parent || '')).toLowerCase();
      if(hay.indexOf(DX.q.toLowerCase()) === -1) return false;
    }
    return true;
  });
  if(DX.sort === 'wl' || DX.sort === 'ls' || DX.sort === 'plan'){
    var c = DX.sort;
    list.sort(function(a, b){
      if(c === 'plan'){
        var pa = a.plan && a.plan['2026'] ? (a.plan['2026'].wl || 0) + (a.plan['2026'].ls || 0) : -1;
        var pb = b.plan && b.plan['2026'] ? (b.plan['2026'].wl || 0) + (b.plan['2026'].ls || 0) : -1;
        return pb - pa;
      }
      var ra = dxLatest(a, c), rb = dxLatest(b, c);
      var va = ra ? ra.rec[0] : -1, vb = rb ? rb.rec[0] : -1;
      if(vb !== va) return vb - va;
      return (a.name < b.name) ? -1 : 1;
    });
  } else {
    var rank = function(s){ return s.branch ? 3 : (s.c9 ? 1 : (s.tier === '985' ? 2 : 4)); };
    list.sort(function(a, b){
      var d = rank(a) - rank(b);
      if(d) return d;
      return (a.name < b.name) ? -1 : 1;
    });
  }
  return list;
}

function dxRender(){
  var grid = document.getElementById('dx-grid');
  if(!grid) return;
  var list = dxFiltered();
  var cnt = document.getElementById('dx-count');
  if(cnt) cnt.innerHTML = '符合条件 <b>' + list.length + '</b> / ' + DAXUE.schools.length + ' 个在渝招生实体' + (DX.q ? ' · 关键词「' + esc(DX.q) + '」' : '');
  var empty = document.getElementById('dx-empty');
  if(empty){
    if(list.length){ empty.hidden = true; }
    else {
      var near = DAXUE.schools.filter(function(s){ return DX.city ? s.city === DX.city : s.tier === '985'; }).slice(0, 3);
      empty.hidden = false;
      empty.innerHTML = '没有符合筛选条件的院校——试试放宽层次或清空搜索词。'
        + (near.length ? '相近院校：' + near.map(function(s){ return '<a href="daxue.html?u=' + encodeURIComponent(s.name) + '">' + esc(s.name) + '</a>'; }).join('、') : '');
    }
  }
  dxFavRenderBar(); dxCmpRenderPanel();
  grid.innerHTML = list.map(dxCard).join('');
}

function dxBind(){
  var tier = document.getElementById('dx-tier');
  if(tier) tier.addEventListener('click', function(e){
    var b = e.target.closest('button[data-dxt]');
    if(!b) return;
    tier.querySelectorAll('.ff').forEach(function(x){ x.classList.remove('on'); });
    b.classList.add('on');
    DX.tier = b.dataset.dxt;
    dxRender();
  });
  var cat = document.getElementById('dx-cat');
  if(cat) cat.addEventListener('click', function(e){
    var b = e.target.closest('button[data-dxc]');
    if(!b) return;
    cat.querySelectorAll('.ff').forEach(function(x){ x.classList.remove('on'); });
    b.classList.add('on');
    DX.cat = b.dataset.dxc;
    dxRender();
  });
  var q = document.getElementById('dx-q');
  if(q){
    var t = null;
    q.addEventListener('input', function(){
      clearTimeout(t);
      t = setTimeout(function(){ DX.q = q.value.trim(); dxRender(); }, 160);
    });
  }
  ['city', 'type', 'sort'].forEach(function(k){
    var el = document.getElementById('dx-' + k);
    if(el) el.addEventListener('change', function(){ DX[k] = el.value; dxRender(); });
  });
}

function dxInit(){
  var grid = document.getElementById('dx-grid');
  if(!grid || typeof DAXUE === 'undefined') return;
  /* 层次按钮动态计数（防陈旧） */
  var cnt = { all: DAXUE.schools.length, c9: 0, '985': 0, '211': 0, branch: 0 };
  var cities = {}, types = {};
  DAXUE.schools.forEach(function(s){
    var k = dxSchoolTier(s);
    if(k === 'c9'){ cnt.c9++; cnt['985']++; }
    else cnt[k]++;
    cities[s.city] = 1; types[s.type] = 1;
  });
  var tier = document.getElementById('dx-tier');
  if(tier) tier.querySelectorAll('button[data-dxt]').forEach(function(b){
    var k = b.dataset.dxt, lab = b.textContent.replace(/（.*）$/, '');
    b.textContent = lab + '（' + (cnt[k] || 0) + '）';
  });
  function fill(id, obj, allLab){
    var el = document.getElementById(id);
    if(!el) return;
    var keys = Object.keys(obj).sort();
    el.innerHTML = '<option value="">' + allLab + '</option>' + keys.map(function(k){ return '<option>' + esc(k) + '</option>'; }).join('');
  }
  fill('dx-city', cities, '全部城市');
  fill('dx-type', types, '全部类型');
  dxBind();
  /* URL 直达：daxue.html?u=清华 → 搜索定位 */
  try{
    var u = new URLSearchParams(location.search).get('u');
    if(u){
      var qi = document.getElementById('dx-q');
      DX.q = u; if(qi) qi.value = u;
    }
  }catch(e){}
  dxRender();
}

/* ---------- v0.93 志愿草表 · 冲稳保模拟（辅助草稿、非预测） ---------- */
var CB_COLS = ['冲', '稳', '保'];
function cbRankOf(sub, score){
  if(typeof SECTION2026 === 'undefined') return null;
  var sec = SECTION2026[sub]; if(!sec) return null;
  if(sec[String(score)]) return sec[String(score)];
  var s = score;
  while(s >= 180 && !sec[String(s)]) s--;
  return sec[String(s)] || null;
}
function cbLatestRank(s, cat){
  var years = ['2026','2025','2024'];
  for(var i = 0; i < years.length; i++){
    var rec = s.L[cat] && s.L[cat][years[i]];
    if(rec && rec[1]) return { rank: rec[1], year: years[i], score: rec[0] };
  }
  return null;
}
function cbRun(){
  var sub = document.getElementById('cb-subject').value;
  var v = parseInt(document.getElementById('cb-score').value, 10);
  var box = document.getElementById('cb-suggest');
  if(!v || v < 200 || v > 750){ box.innerHTML = '<div class="cmp-empty">请输入 200–750 之间的分数。</div>'; return; }
  var R = cbRankOf(sub, v);
  if(!R){ box.innerHTML = '<div class="cmp-empty">该分数暂无一分一段精确位次，请调整分数（或直接用上方位次工具核对）。</div>'; return; }
  var groups = { '冲': [], '稳': [], '保': [] };
  DAXUE.schools.forEach(function(s){
    if(s.gnote) return;
    var lr = cbLatestRank(s, sub);
    if(!lr) return;
    var ratio = lr.rank / R;
    var col = ratio <= 0.88 ? '冲' : (ratio <= 1.06 ? '稳' : (ratio <= 1.6 ? '保' : null));
    if(col) groups[col].push({ s: s, lr: lr, ratio: ratio });
  });
  CB_COLS.forEach(function(c){ groups[c].sort(function(a, b){ return b.ratio - a.ratio; }); groups[c] = groups[c].slice(0, 10); });
  var colDesc = { '冲': '校线位次明显优于你，需要奇迹或招生计划波动', '稳': '校线位次与你基本同档，主力区间', '保': '校线位次明显低于你，安全垫' };
  box.innerHTML = '<p class="dx-count">你的 ' + (sub === 'wl' ? '物理' : '历史') + '类 ' + v + ' 分 → 2026 位次 <b>' + R.toLocaleString() + '</b> 名。分档口径：以各校最近年份最低位次与你的位次之比划档（冲 ≤0.88 / 稳 0.88–1.06 / 保 1.06–1.6）。<b>辅助草稿，非录取预测。</b></p>'
    + '<div class="cb-cols">' + CB_COLS.map(function(c){
      return '<div class="cb-col"><b class="cb-t' + (c === '冲' ? ' hot' : (c === '保' ? ' safe' : '')) + '">' + c + '</b><i>' + colDesc[c] + '</i>'
        + (groups[c].length ? groups[c].map(function(g){
          return '<div class="cb-chip"><a href="daxue.html?u=' + encodeURIComponent(g.s.name) + '">' + esc(g.s.name) + '</a><small>' + g.lr.year + ' 位次 ' + g.lr.rank.toLocaleString() + '</small>'
            + '<button onclick="cbAdd(\'' + c + '\',\'' + esc(g.s.name) + '\')" aria-label="加入' + c + '区">＋' + c + '</button></div>';
        }).join('') : '<em>该区间暂无候选（可放宽分数或科类）</em>') + '</div>';
    }).join('') + '</div>';
  cbRenderSheet();
}
function cbLoad(){ try{ return JSON.parse(localStorage.getItem('dx_caobiao') || '{"冲":[],"稳":[],"保":[]}'); }catch(e){ return { '冲': [], '稳': [], '保': [] }; } }
function cbSave(d){ try{ localStorage.setItem('dx_caobiao', JSON.stringify(d)); }catch(e){} }
function cbAdd(col, name){
  var d = cbLoad();
  if(d[col].indexOf(name) < 0 && d[col].length < 32){ d[col].push(name); cbSave(d); }
  cbRenderSheet();
}
function cbRemove(col, idx){
  var d = cbLoad(); d[col].splice(idx, 1); cbSave(d); cbRenderSheet();
}
function cbClear(){
  if(!confirm('清空草表所有已选院校？')) return;
  cbSave({ '冲': [], '稳': [], '保': [] }); cbRenderSheet();
}
function cbCopy(){
  var d = cbLoad();
  if(!CB_COLS.some(function(c){ return d[c].length; })){ toast('草表为空，先加入院校'); return; }
  var txt = '重庆高考志愿草表（花期册 · 辅助草稿）\n';
  CB_COLS.forEach(function(c){
    txt += '\n【' + c + '】\n';
    d[c].forEach(function(n, i){ txt += (i + 1) + '. ' + n + '\n'; });
  });
  txt += '\n—— 生成时间 ' + new Date().toLocaleDateString('zh-CN') + ' · 花期册 https://mina2026best.github.io/jfm-platform-demo/zy.html';
  copyText(txt);
}
function cbRenderSheet(){
  var box = document.getElementById('cb-sheet'); if(!box) return;
  var d = cbLoad();
  var any = CB_COLS.some(function(c){ return d[c].length; });
  box.innerHTML = !any ? '<div class="cmp-empty">草表为空——上方生成候选后点「＋冲/＋稳/＋保」加入；草表存本机，可打印带去填报。</div>'
    : '<div class="cb-cols cb-print-area">' + CB_COLS.map(function(c){
      return '<div class="cb-col"><b class="cb-t' + (c === '冲' ? ' hot' : (c === '保' ? ' safe' : '')) + '">' + c + '（' + d[c].length + '）</b>'
        + (d[c].length ? '<ol class="cb-list">' + d[c].map(function(n, i){
          return '<li><span>' + esc(n) + '</span><button onclick="cbRemove(\'' + c + '\',' + i + ')" aria-label="移除">×</button></li>';
        }).join('') + '</ol>' : '<em>空</em>') + '</div>';
    }).join('') + '</div>';
}
function cbPrint(){ window.print(); }

/* ---------- v0.93 大学收藏 / 对比 / 打印单校 / 空态引导 ---------- */
function dxFavLoad(){ try{ return JSON.parse(localStorage.getItem('dx_fav') || '[]'); }catch(e){ return []; } }
function dxFavSave(a){ try{ localStorage.setItem('dx_fav', JSON.stringify(a)); }catch(e){} }
function dxFavToggle(id, btn){
  var f = dxFavLoad(), i = f.indexOf(id);
  if(i < 0){ f.push(id); btn.textContent = '★ 已关注'; btn.classList.add('on'); }
  else { f.splice(i, 1); btn.textContent = '☆ 关注'; btn.classList.remove('on'); }
  dxFavSave(f); dxFavRenderBar();
}
function dxFavRenderBar(){
  var bar = document.getElementById('dx-favbar'); if(!bar) return;
  var f = dxFavLoad();
  if(!f.length){ bar.innerHTML = ''; return; }
  var names = f.map(function(id){
    var s = DAXUE.schools.find(function(x){ return String(x.id) === String(id); });
    return s ? '<a class="cb-chip-inline" href="#dx-' + s.id + '">' + esc(s.name) + '</a>' : '';
  }).join('');
  bar.innerHTML = '<span class="dx-flab">我的关注</span>' + names + ' <button class="cb-ghost" onclick="dxFavSave([]);dxFavRenderBar();dxRender();">清空</button>';
}
function dxCmpLoad(){ try{ return JSON.parse(localStorage.getItem('dx_cmp') || '[]'); }catch(e){ return []; } }
function dxCmpSave(a){ try{ localStorage.setItem('dx_cmp', JSON.stringify(a)); }catch(e){} }
function dxCmpToggle(id){
  var a = dxCmpLoad(), i = a.indexOf(id);
  if(i < 0){ if(a.length >= 3){ toast('最多同时对比 3 所'); return; } a.push(id); } else a.splice(i, 1);
  dxCmpSave(a); dxRender(); dxCmpRenderPanel();
}
function dxCmpRenderPanel(){
  var panel = document.getElementById('dx-cmp-panel'); if(!panel) return;
  var ids = dxCmpLoad();
  if(!ids.length){ panel.innerHTML = ''; return; }
  var list = ids.map(function(id){ return DAXUE.schools.find(function(x){ return String(x.id) === String(id); }); }).filter(Boolean);
  function row(label, fn){
    return '<tr><th>' + label + '</th>' + list.map(function(s){ return '<td>' + fn(s) + '</td>'; }).join('') + '</tr>';
  }
  function span(s, c){
    var years = ['2026','2025','2024','2023','2022'];
    for(var i = 0; i < years.length; i++){ var r = s.L[c] && s.L[c][years[i]]; if(r) return r[0] + '（' + years[i] + '）'; }
    return '—';
  }
  panel.innerHTML = '<div class="cb-cmp-head"><b>大学对比（' + list.length + '/3）</b><button class="cb-ghost" onclick="dxCmpSave([]);dxRender();dxCmpRenderPanel();">清空对比</button></div>'
    + '<div class="dx-twrap"><table class="art-table dx-table"><thead><tr><th>维度</th>' + list.map(function(s){ return '<th>' + esc(s.name) + '</th>'; }).join('') + '</tr></thead><tbody>'
    + row('层次', function(s){ return (s.tier === '985' ? '985' : '211') + (s.c9 ? ' · C9' : '') + (s.branch ? ' · ' + s.branch : ''); })
    + row('城市 / 类型', function(s){ return s.city + ' · ' + s.type; })
    + row('最新物理投档', function(s){ return span(s, 'wl'); })
    + row('最新历史投档', function(s){ return span(s, 'ls'); })
    + row('一流学科（数）', function(s){ return (s.disc || []).length ? (s.disc.length + ' 个：' + s.disc.slice(0, 3).join('、') + (s.disc.length > 3 ? '…' : '')) : '—'; })
    + row('就业数据', function(s){ return s.emp && s.emp.rate ? s.emp.y + ' ' + s.emp.rate : '以校方报告为准'; })
    + row('官网', function(s){ return s.web ? '<a href="' + esc(s.web) + '" target="_blank" rel="noopener">直达 ↗</a>' : '—'; })
    + '</tbody></table></div>';
}
function dxPrintCard(id){
  document.body.setAttribute('data-printcard', id);
  window.print();
}
window.addEventListener('afterprint', function(){ document.body.removeAttribute('data-printcard'); });

/* v0.97 学费区间芯片（最新年全部专业组学费区间，含中外合作） */
function dxFeeChip(s){
  var f = s.fee;
  if(!f || !f.max) return '';
  var fmt = function(v){ return (Math.round(v * 10) / 10) + '万'; };
  return '<span>学费 <b class="mono">' + fmt(f.min) + '–' + fmt(f.max) + '</b><em>' + f.year + ' · 各专业组区间</em></span>';
}


/* ---------- 57-gaozhong-data ---------- */
/* ---------- 高中与联招库数据 v2026.10（构建管线生成，勿手改） ----------
   生成器：research/jfm_merge_gz.py；逐校数据：research/jfm/gz_lines.md（仅收双源一致的核验行）。
   联招送档线为市教委历年公布原值；校级线口径=统招（联招），未核验年份如实留空。 */
var GAOZHONG = {"meta":{"verified":"2026-10-30","years":["2021","2022","2023","2024","2025","2026"],"src":{"o":"重庆市教委发布（华龙网/新浪新闻/上游新闻等转载）","u":"https://www.cqnews.net/web/content_1519382559408590848.html","n":"2026 年口径 518 分；历年依 bendibao 汇总与当年报道交叉核对"}},"songdang":{"2021":558,"2022":589,"2023":587,"2024":543,"2025":532,"2026":518},"schools":[{"name":"南开中学","qu":"沙坪坝","lines":{"2025":{"score":682.5,"note":"统招（联招）"},"2024":{"score":681,"note":"统招（联招）"},"2023":{"score":695.5,"note":"统招（联招）"}},"srcs":[{"u":"https://www.sohu.com/a/909113130_121124286","t":"搜狐号·新太阳幼儿班《2025重庆中考联招非联招区各高中录取分数汇总，渝八691.5，一中684.5，南开682.5，巴蜀681.5……》"},{"u":"https://www.sohu.com/a/789704934_100144070","t":"搜狐号·惊讶的成绩单《2024重庆中考联招区上百所高中录取分数线汇总（附近5年）》"},{"u":"https://www.sohu.com/a/692905360_121718006","t":"搜狐号·英语时文阅读《2023重庆中考各重点高中录取分数线出炉，七龙珠重庆八中最高697分！》"}]},{"name":"巴蜀中学","qu":"渝中","lines":{"2025":{"score":681.5,"note":"统招（联招）"},"2024":{"score":679,"note":"统招（联招）"},"2023":{"score":693,"note":"统招（联招）"}},"srcs":[{"u":"https://www.sohu.com/a/909113130_121124286","t":"搜狐号·新太阳幼儿班《2025重庆中考联招非联招区各高中录取分数汇总……》"},{"u":"https://www.sohu.com/a/789704934_100144070","t":"搜狐号·惊讶的成绩单《2024重庆中考联招区上百所高中录取分数线汇总（附近5年）》"},{"u":"https://www.sohu.com/a/692905360_121718006","t":"搜狐号·英语时文阅读《2023重庆中考各重点高中录取分数线出炉，七龙珠重庆八中最高697分！》"}]},{"name":"求精中学","qu":"渝中","lines":{"2024":{"score":652.5,"note":"统招（联招）"}},"srcs":[{"u":"https://www.da01.cn/zszx/zstj/9687.html","t":"重庆中考网《重庆市2025年高中录取分数线全解析：联招线532分，主城名校竞争激烈》"}]},{"name":"育才中学","qu":"九龙坡","lines":{"2025":{"score":671.5,"note":"统招（联招）"},"2024":{"score":668.5,"note":"统招（联招）"},"2023":{"score":681.5,"note":"统招（联招）"}},"srcs":[{"u":"https://www.sohu.com/a/909113130_121124286","t":"搜狐号·新太阳幼儿班《2025重庆中考联招非联招区各高中录取分数汇总……》"},{"u":"https://www.sohu.com/a/789704934_100144070","t":"搜狐号·惊讶的成绩单《2024重庆中考联招区上百所高中录取分数线汇总（附近5年）》"},{"u":"https://www.sohu.com/a/692905360_121718006","t":"搜狐号·英语时文阅读《2023重庆中考各重点高中录取分数线出炉，七龙珠重庆八中最高697分！》"}]},{"name":"西南大学附中","qu":"北碚","lines":{"2025":{"score":668.5,"note":"统招（联招）"},"2024":{"score":673,"note":"统招（联招）"},"2023":{"score":690,"note":"统招（联招）"}},"srcs":[{"u":"https://www.sohu.com/a/909113130_121124286","t":"搜狐号·新太阳幼儿班《2025重庆中考联招非联招区各高中录取分数汇总……》"},{"u":"https://www.sohu.com/a/789704934_100144070","t":"搜狐号·惊讶的成绩单《2024重庆中考联招区上百所高中录取分数线汇总（附近5年）》"},{"u":"https://www.sohu.com/a/692905360_121718006","t":"搜狐号·英语时文阅读《2023重庆中考各重点高中录取分数线出炉，七龙珠重庆八中最高697分！》"}]},{"name":"重庆一中","qu":"沙坪坝","lines":{"2025":{"score":684.5,"note":"统招（联招）"},"2024":{"score":679.5,"note":"统招（联招）"},"2023":{"score":690,"note":"统招（联招）"}},"srcs":[{"u":"https://www.sohu.com/a/909113130_121124286","t":"搜狐号·新太阳幼儿班《2025重庆中考联招非联招区各高中录取分数汇总……》"},{"u":"https://www.sohu.com/a/789704934_100144070","t":"搜狐号·惊讶的成绩单《2024重庆中考联招区上百所高中录取分数线汇总（附近5年）》"},{"u":"https://www.sohu.com/a/692905360_121718006","t":"搜狐号·英语时文阅读《2023重庆中考各重点高中录取分数线出炉，七龙珠重庆八中最高697分！》"}]},{"name":"重庆八中（沙坪坝校区）","qu":"沙坪坝","lines":{"2025":{"score":690.5,"note":"统招（联招）"},"2024":{"score":686,"note":"统招（联招）"},"2023":{"score":697,"note":"统招（联招）"}},"srcs":[{"u":"https://www.sohu.com/a/909113130_121124286","t":"搜狐号·新太阳幼儿班《2025重庆中考联招非联招区各高中录取分数汇总……》"},{"u":"https://www.sohu.com/a/789704934_100144070","t":"搜狐号·惊讶的成绩单《2024重庆中考联招区上百所高中录取分数线汇总（附近5年）》"},{"u":"https://www.sohu.com/a/692905360_121718006","t":"搜狐号·英语时文阅读《2023重庆中考各重点高中录取分数线出炉，七龙珠重庆八中最高697分！》"}]},{"name":"重庆八中（渝北校区）","qu":"渝北","lines":{"2025":{"score":691.5,"note":"统招（联招）"},"2024":{"score":683,"note":"统招（联招）"},"2023":{"score":696.5,"note":"统招（联招）"}},"srcs":[{"u":"https://www.sohu.com/a/909113130_121124286","t":"搜狐号·新太阳幼儿班《2025重庆中考联招非联招区各高中录取分数汇总……》"},{"u":"https://www.sohu.com/a/789704934_100144070","t":"搜狐号·惊讶的成绩单《2024重庆中考联招区上百所高中录取分数线汇总（附近5年）》"},{"u":"https://www.sohu.com/a/692905360_121718006","t":"搜狐号·英语时文阅读《2023重庆中考各重点高中录取分数线出炉，七龙珠重庆八中最高697分！》"}]}]};


/* ---------- 57-gaozhong ---------- */
/* ---------- 高中与联招库 v0.93：六年联招送档线 + 逐校核验行 ----------
   数据：57-gaozhong-data.js（构建管线生成，勿手改）。红线：不排名、不预测，未核验留空。 */
function gzChart(){
  var d = GAOZHONG, years = d.meta.years;
  var vals = years.map(function(y){ return d.songdang[y]; }).filter(function(v){ return v; });
  if(!vals.length) return '';
  var mn = Math.min.apply(null, vals) - 25, mx = Math.max.apply(null, vals) + 15;
  var W = 640, H = 200, PL = 44, PR = 16, PT = 18, PB = 26;
  function X(i){ return PL + i * (W - PL - PR) / (years.length - 1); }
  function Y(v){ return PT + (H - PT - PB) * (mx - v) / (mx - mn); }
  var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="重庆中考联招统一送档线 2021-2026 趋势图" style="width:100%;height:auto;display:block">';
  for(var g = 0; g < 4; g++){
    var gv = Math.round(mn + (mx - mn) * g / 3), gy = Y(gv);
    svg += '<line x1="' + PL + '" y1="' + gy + '" x2="' + (W - PR) + '" y2="' + gy + '" class="dx-gridline"/>'
      + '<text x="' + (PL - 6) + '" y="' + (gy + 3) + '" class="dx-axv" text-anchor="end">' + gv + '</text>';
  }
  years.forEach(function(y, i){
    svg += '<text x="' + X(i) + '" y="' + (H - 8) + '" class="dx-axy" text-anchor="middle">' + y + '</text>';
  });
  var pts = years.map(function(y, i){ return { x: X(i), py: Y(d.songdang[y]), v: d.songdang[y], yr: y }; });
  svg += '<polyline points="' + pts.map(function(p){ return p.x.toFixed(1) + ',' + p.py.toFixed(1); }).join(' ') + '" class="gz-line"/>';
  pts.forEach(function(p, i){
    var prev = i ? pts[i - 1].v : null;
    var dlt = prev ? (p.v - prev) : null;
    var t = '<title>' + p.yr + ' 年联招送档线 ' + p.v + ' 分' + (dlt !== null ? '（较上年 ' + (dlt >= 0 ? '+' : '') + dlt + '）' : '') + '</title>';
    svg += '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.py.toFixed(1) + '" r="4" class="gz-dot">' + t + '</circle>'
      + '<text x="' + p.x.toFixed(1) + '" y="' + (p.py - 9).toFixed(1) + '" class="gz-val" text-anchor="middle">' + p.v + '</text>';
  });
  return svg + '</svg>';
}

function gzInit(){ gzRender(); }
function gzRender(){
  var box = document.getElementById('gz-trend');
  if(!box || typeof GAOZHONG === 'undefined') return;
  box.innerHTML = gzChart();
  /* 送档线明细表 */
  var tb = document.getElementById('gz-songdang-table');
  var rows = '', prev = null;
  GAOZHONG.meta.years.forEach(function(y){
    var v = GAOZHONG.songdang[y];
    if(!v) return;
    var d = prev !== null ? v - prev : null;
    rows += '<tr><td>' + y + '</td><td class="mono">' + v + '</td>'
      + '<td class="mono ' + (d === null ? '' : (d >= 0 ? 'ok' : 'warn')) + '">' + (d === null ? '—' : (d >= 0 ? '+' : '') + d) + '</td>'
      + '<td>' + (d === null ? '基期' : (d >= 0 ? '较上年上升（试卷难度或竞争变化）' : '较上年下降（扩招或难度变化），看位次别只看分')) + '</td></tr>';
    prev = v;
  });
  tb.innerHTML = '<table class="art-table" style="margin-top:12px"><thead><tr><th>年份</th><th>联招送档线（分）</th><th>同比</th><th>读法</th></tr></thead><tbody>' + rows + '</tbody></table>'
    + '<p class="dx-tnote">来源：' + esc(GAOZHONG.meta.src.o) + '（2026-10-30 核验）；<a class="art-link" href="' + esc(GAOZHONG.meta.src.u) + '" target="_blank" rel="noopener">2026 年公告原文 ↗</a></p>';
  /* 逐校核验行 */
  var st = document.getElementById('gz-school-table');
  var sn = document.getElementById('gz-src-note');
  var schools = GAOZHONG.schools || [];
  if(!schools.length){
    if(st) st.outerHTML = '<p class="dx-nodate">逐校核验行采集中——上线前会逐条标注来源；当前请以送档线趋势与指标到校政策条目为准。</p>';
    return;
  }
  var head = '<thead><tr><th>学校</th><th>区县</th>';
  GAOZHONG.meta.years.slice(1).forEach(function(y){ head += '<th>' + y + '</th>'; });
  head += '</tr></thead>';
  var body = '<tbody>';
  schools.forEach(function(s){
    body += '<tr><td>' + esc(s.name) + '</td><td>' + esc(s.qu || '—') + '</td>';
    GAOZHONG.meta.years.slice(1).forEach(function(y){
      var r = s.lines && s.lines[y];
      body += r ? '<td class="mono">' + r.score + '<small>' + esc(r.note || '') + '</small></td>' : '<td>—</td>';
    });
    body += '</tr>';
  });
  body += '</tbody>';
  st.innerHTML = head + body;
  if(sn){
    var srcs = [];
    schools.forEach(function(s){ (s.srcs || []).forEach(function(u){ if(srcs.indexOf(u) < 0) srcs.push(u); }); });
    sn.innerHTML = srcs.length ? '逐校线来源：' + srcs.map(function(u){ return '<a class="art-link" href="' + esc(u.u) + '" target="_blank" rel="noopener">' + esc(u.t) + ' ↗</a>'; }).join(' · ') : '';
  }
}


/* ---------- 58-yh ---------- */
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


/* ---------- 59-pq ---------- */
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


/* ---------- 60-liangjiang ---------- */
/* ---------- v0.96 两江新区升学专题（schools 页） ----------
   背景：2025-11 区划调整（撤江北/渝北设两江新区，2026-01-25 挂牌），原区教委网站注销。
   全部链接此前已逐条实测（research/jfm/pq_index.md · yh_data.md，2026-10-30/31）。 */
var LJ_CARDS = [
  { t: '2026 年招生以谁为准？', u: 'http://www.ljxq.gov.cn/bm/qjw/zwgk/zfxxgkml/zcwj/qtwj/202605/t20260526_15703553.html', ut: '两江新区 2026 招生方案（印发通知）', d: '原江北区全域、原渝北区（除大湾/统景/大盛/兴隆/茨竹 5 镇）均由<b>两江新区</b>管辖，2026 年招生以《两江新区2026年义务教育招生工作方案》为准；<b>北碚区蔡家、水土等街道</b>也执行两江新区政策。' },
  { t: '划片怎么查？', u: 'https://www.ljxq.gov.cn/bm/qjw/zwgk/zfxxgkml/jczwgk/ywjylyxxgk/zsgl/zsfw/202607/t20260730_15874802.html', ut: '两江新区划片查询官方指引', d: '新区教委已发布官方<b>划片查询指引</b>，按街道与小区核对服务学校；本站「划片速查」也提供直达。' },
  { t: '民转公学校怎么招生？', u: 'http://news.cjn.cn/zjjjdpd/yw_20048/202605/t5296398.htm', ut: '2026 中心城区政策（上游新闻）', d: '第一双语学校等<b>民转公学校</b>执行「合法入读协议＋电脑随机派位（摇号）」；报名范围保持 2025 年不变（鸳鸯、大竹林、人和、天宫殿、翠云、礼嘉、金山、康美 8 个街道）。2025 年该校摇号计划 400 名（转引官方政策，建议复核）。<b>原渝北区公办摇号校 7 所</b>（2025 年口径，华龙网刊发区方案）：一中寄宿、皇冠实验、南开两江、八中、两江人民小学、鲁能巴蜀小学、首地人和街小学——报名超计划摇号确定。' },
  { t: '报名走什么渠道？', u: 'https://www.cqnews.net/1/detail/1374750892381188096/app/content_1374750892381188096.html', ut: '渝北区 2025 招生方案全文（华龙网）', d: '义务教育入学统一走<b>渝快办「教育入学一件事」</b>线上报名；民办/民转公超额部分 6 月中下旬统一电脑摇号；公办按划片对口。' }
];
var LJ_FAQ = [
  ['原渝北户籍的孩子，2027 年升学按哪边政策？', '按两江新区当年方案执行（原区教委已合并撤销）。建议关注「重庆两江新区」官方公众号与 ljxq.gov.cn 招生栏目，每年 4–5 月发布当年方案。'],
  ['蔡家、水土街道的孩子算哪个区？', '行政上属北碚区，但自 2026 年起<b>招生执行两江新区政策</b>——划片与报名以两江新区发布为准。'],
  ['旧文件（原江北区/渝北区公告）还作数吗？', '涉及<b>划片范围与招生方式</b>的，以两江新区新方案为准；旧文件仅作历史参考。凡仍以「原区教委口径」招生的宣传，请向两江新区教委核实。']
];
function ljRender(){
  var box = document.getElementById('lj-guide');
  if(!box) return;
  box.innerHTML = '<div class="cmp-note" style="margin-bottom:12px"><b>背景</b>　2025-11-07 市政府公告（渝府发〔2025〕15号）：撤销江北区、渝北区，设立两江新区（2026-01-25 挂牌）；原两区政府网站域名已注销。<b>涉及划片与入学的，请以两江新区当年发布为准</b>。以下要点与链接于 2026-10-30/31 实测。</div>'
    + '<div class="dx-notes">' + LJ_CARDS.map(function(c){
      return '<div><b>' + c.t + '</b>　' + c.d + '<br/><a class="art-link" href="' + c.u + '" target="_blank" rel="noopener">' + esc(c.ut) + ' ↗</a></div>';
    }).join('') + '</div>'
    + '<h4 style="font-family:var(--serif);font-size:15px;color:var(--navy);margin:14px 0 6px">高频三问</h4>'
    + '<div class="dx-notes">' + LJ_FAQ.map(function(f){
      return '<div><b>问：' + f[0] + '</b><br/>答：' + f[1] + '</div>';
    }).join('') + '</div>';
}


/* ---------- 62-dragon ---------- */
/* ---------- v0.96 七龙珠系办学图谱（schools 页） ----------
   数据：61-dragon-data.js（research/jfm_merge_dragon.py 生成）。
   口径：关系类型以区教委文件/校方官网/主流媒体为准；存疑实体标注 ⚠；不排名、不评价。 */
var DRAGON_RT = { '直属本部': 'ok', '分校区': 'ok', '高完中': 'ok', '共办·托管': 'br', '共办·托管校': 'br', '教共体成员': 'pend', '民转公': 'br', '民转公校': 'br' };
function dgShortType(rt){
  var keys = ['直属本部', '分校区', '教共体成员', '共办·托管', '共办', '托管', '民转公', '高完中'];
  for(var i = 0; i < keys.length; i++){ if(rt.indexOf(keys[i]) >= 0) return keys[i]; }
  return '存疑';
}
function dgRender(){
  var box = document.getElementById('dragon-graph');
  if(!box || typeof DRAGON === 'undefined') return;
  var tabs = DRAGON.systems.map(function(s, i){
    return '<button class="ff' + (i === 0 ? ' on' : '') + '" data-dgs="' + i + '">' + esc(s.name) + '（' + s.entities.length + '）</button>';
  }).join('');
  box.innerHTML = '<div class="cmp-note" style="margin-bottom:12px"><b>怎么读图谱</b>　七龙珠各校系旗下实体类型多样：<b>直属本部/分校区</b>通常同一法人、师资统一调配；<b>共办·托管校</b>品牌合作、管理相对独立；<b>教共体成员</b>为教学共同体协作；<b>民转公校</b>原民办转公办。⚠ 标注＝关系存疑，以区教委当年公布为准。只整理事实关系，不做校际评价；凡称「交钱进本部名额」均为诈骗。</div>'
    + '<div class="fact-filter" style="margin-bottom:10px" id="dg-tabs">' + tabs + '</div>'
    + '<div id="dg-panel"></div>'
    + '<p class="dx-tnote" style="margin-top:8px">数据核验 2026-10-31：关系类型逐实体标注来源（区教委文件/校方官网/主流媒体）；单源线索已标存疑。每年招生季复核一次。</p>';
  function show(i){
    var sys = DRAGON.systems[i];
    var html = sys.entities.map(function(e){
      var f = e.fields;
      var rt = (f['关系类型'] || '—');
      var short = dgShortType(rt);
      var badge = 'pend';
      for(var k in DRAGON_RT){ if(short.indexOf(k) >= 0){ badge = DRAGON_RT[k]; break; } }
      function row(l, k){ var v = f[k]; return v ? '<div class="dg-row"><i>' + l + '</i>' + esc(String(v)).slice(0, 120) + '</div>' : ''; }
      var src = (e.srcs || []).slice(0, 2).map(function(x){ return '<a class="art-link" href="' + x.u + '" target="_blank" rel="noopener">' + esc(x.t) + ' ↗</a>'; }).join(' · ');
      return '<article class="dg-card"><div class="dg-head"><b>' + esc(e.name) + '</b>'
        + '<span class="pq-st st-' + badge + '">' + esc(short) + (e.doubt ? ' ⚠' : '') + '</span></div>'
        + '<div class="dg-meta">' + esc(f['区县'] || '—') + ' · ' + esc(f['学段'] || '—') + '</div>'
        + '<div class="dg-row"><i>关系</i>' + esc(rt) + '</div>'
        + row('师资', '师资关系') + row('管理', '管理关系') + row('招生', '招生方式') + row('学费', '学费口径')
        + (src ? '<div class="dg-src">' + src + '</div>' : '')
        + '</article>';
    }).join('');
    document.getElementById('dg-panel').innerHTML = '<div class="dg-grid">' + html + '</div>';
  }
  var tabsBox = document.getElementById('dg-tabs');
  tabsBox.addEventListener('click', function(ev){
    var b = ev.target.closest('button[data-dgs]');
    if(!b) return;
    tabsBox.querySelectorAll('.ff').forEach(function(x){ x.classList.remove('on'); });
    b.classList.add('on');
    show(parseInt(b.dataset.dgs, 10));
  });
  show(0);
}


/* ---------- 63-map ---------- */
/* ---------- v0.96 学校地图（schools 页）：主城九区示意底图 + 区县联动 + 高德外链 ----------
   说明：示意图为方位示意（非行政区划精确边界）；精确位置用「高德」按校名+地址查询，不造坐标。 */
var MAP_BLOBS = [
  { q: '北碚区', x: 70, y: 40, w: 120, h: 62 },
  { q: '渝北区', x: 230, y: 36, w: 150, h: 66 },
  { q: '沙坪坝区', x: 90, y: 130, w: 130, h: 62 },
  { q: '江北区', x: 250, y: 128, w: 110, h: 56 },
  { q: '渝中区', x: 285, y: 200, w: 84, h: 44 },
  { q: '九龙坡区', x: 120, y: 216, w: 130, h: 60 },
  { q: '大渡口区', x: 150, y: 292, w: 104, h: 52 },
  { q: '南岸区', x: 300, y: 262, w: 118, h: 58 },
  { q: '巴南区', x: 230, y: 348, w: 150, h: 62 }
];
function mapCount(q){
  var n = 0;
  Object.keys(SCHOOL_DB).forEach(function(k){ if((SCHOOL_DB[k]['所在区'] || '') === q) n++; });
  return n;
}
function mapRender(){
  var box = document.getElementById('school-map');
  if(!box) return;
  var W = 520, H = 440;
  var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="主城九区学校分布示意图（方位示意，点击区县筛选）" style="width:100%;height:auto;display:block">';
  svg += '<text x="14" y="20" class="dx-tnote" style="font-size:11px">方位示意（非行政边界）· 点击区县筛选下方名单</text>';
  MAP_BLOBS.forEach(function(bl){
    var n = mapCount(bl.q);
    svg += '<g class="mq-blob" data-qu="' + bl.q + '" onclick="pickDistrict(\'' + bl.q + '\')" role="button" tabindex="0">'
      + '<rect x="' + bl.x + '" y="' + bl.y + '" width="' + bl.w + '" height="' + bl.h + '" rx="14"/>'
      + '<text x="' + (bl.x + bl.w / 2) + '" y="' + (bl.y + bl.h / 2 - 4) + '" text-anchor="middle" class="mq-name">' + bl.q.replace('区', '') + '</text>'
      + '<text x="' + (bl.x + bl.w / 2) + '" y="' + (bl.y + bl.h / 2 + 14) + '" text-anchor="middle" class="mq-n">' + n + ' 所</text>'
      + '<title>' + bl.q + '：' + n + ' 所档案（点击筛选）</title></g>';
  });
  svg += '</svg>';
  var cur = (schoolRegion && schoolRegion !== 'all') ? schoolRegion : '渝中区';
  var list = Object.keys(SCHOOL_DB).filter(function(k){ return (SCHOOL_DB[k]['所在区'] || '') === cur; }).sort();
  var lis = list.map(function(k){
    var addr = SCHOOL_DB[k]['校区地址'] || SCHOOL_DB[k]['所在区'];
    var q = encodeURIComponent(k + ' ' + addr);
    return '<li><span class="mq-s">' + esc(k) + '</span><a class="mq-amap" href="https://ditu.amap.com/search?query=' + q + '" target="_blank" rel="noopener">高德 ↗</a></li>';
  }).join('');
  box.innerHTML = '<div class="mq-flex"><div class="mq-svgwrap">' + svg + '</div>'
    + '<div class="mq-listwrap"><p class="dx-count"><b>' + esc(cur) + '</b> 档案 ' + list.length + ' 所 · 点图切换区县</p><ul class="mq-list">' + (lis || '<em>该区暂无档案</em>') + '</ul>'
    + '<p class="dx-tnote">精确位置请点「高德」按校名＋地址查询；通勤建议早晚高峰实测（对比器清单有完整项）。</p></div></div>';
}

/* v0.99：03.3 地图页与 03.1 列表页已拆开——本页没有 #school-grid：
   有 grid 就本页筛选并滚过去，没有就带着区县跳回 03.1（列表页会读 ?qu= 复原筛选）。 */
function pickDistrict(q){
  var g = document.getElementById('school-grid');
  if(g){ filterSchoolsRegion(q); g.scrollIntoView({behavior:'smooth'}); return; }
  location.href = 'schools.html?qu=' + encodeURIComponent(q);
}


/* ---------- 64-koubei ---------- */
/* ---------- v0.99 各区口碑小学参考名单 + 市级示范小学历批名单（schools 页） ----------
   数据：64-koubei-data.js（三源融合：研究员采集 + 来源升级 + 示范批次官方名单）。
   红线：示范名单为官方历史评定（仅名单不排名）；口碑为民间口径分层标注、不排位次。 */
function kbCn(n){ return ['一','二','三','四','五'][n - 1] || n; }
var kbFilter = '';
function kbSetFilter(q){ kbFilter = q || ''; kbRender(); }
function kbRender(){
  var box = document.getElementById('koubei-list');
  if(!box || typeof KOUBEI === 'undefined') return;
  /* A. 官方示范批次 */
  var secA = '<h4 class="kb-sub">A · 市级示范小学 · 历批评定名单（官方历史口径）</h4>'
    + (KOUBEI.demo || []).map(function(d){
      return '<div class="kb-qu"><b class="kb-qt">' + esc(d.label) + '</b><div class="kb-list">'
        + d.items.map(function(it){
          return '<div class="kb-row"><span class="kb-n">' + esc(it.name) + '</span><span class="kb-f">' + esc(it.qu) + '</span></div>';
        }).join('') + '</div></div>';
    }).join('')
    + '<p class="dx-tnote">名单出处：' + esc(KOUBEI.demoSrc.o) + '（<a class="art-link" href="' + esc(KOUBEI.demoSrc.u) + '" target="_blank" rel="noopener">原文 ↗</a>）。示范评定为历史口径，部分校名沿用历史称呼（如渝中区第一/第二实验小学、铜梁县实验小学）；名单仅陈述评定事实，不构成择校建议。</p>';
  /* B. 各区口碑参考（含示范徽标） */
  var allQ = [];
  KOUBEI.items.forEach(function(it){ if(allQ.indexOf(it.qu) < 0) allQ.push(it.qu); });
  allQ.sort();
  var byq = {};
  KOUBEI.items.forEach(function(it){
    var q = it.qu || '其他';
    (byq[q] = byq[q] || []).push(it);
  });
  var qs = Object.keys(byq).sort();
  if(kbFilter && byq[kbFilter]) { var filtered = {}; filtered[kbFilter] = byq[kbFilter]; byq = filtered; }
  var LV = { '官方': 'ok', '媒体': 'ok', '社区': 'pend' };
  var secB = qs.map(function(q){
    var its = byq[q].sort(function(a, b){ return a.name < b.name ? -1 : 1; });
    return '<div class="kb-qu"><b class="kb-qt">' + esc(q) + '（' + its.length + '）</b><div class="kb-list">'
      + its.map(function(it){
        var lv = (it.level || '社区');
        var lc = LV[lv] === 'ok' ? 'ok' : 'pend';
        var m = String(it.src).match(/(https?:\/\/\S+?)(?:\s|$)/);
        return '<div class="kb-row"><span class="kb-n">' + esc(it.name) + '</span>'
          + (it.demo ? '<span class="pq-st st-ok">示范·第' + kbCn(it.demo) + '批</span>' : '')
          + '<span class="pq-st st-' + lc + '">【' + esc(lv) + '】</span>'
          + (it.feat ? '<span class="kb-f">' + esc(it.feat) + '</span>' : '')
          + (m ? '<a class="mq-amap" href="' + esc(m[1]) + '" target="_blank" rel="noopener">依据 ↗</a>' : '')
          + '</div>';
      }).join('') + '</div></div>';
  }).join('');
  box.innerHTML = '<div class="cmp-note" style="margin-bottom:12px"><b>使用须知</b>　示范名单为官方历史评定（仅名单、不排名）；口碑参考为<b>民间口径</b>：非官方评价、不排位次、不构成择校承诺。来源三级——【官方】【媒体】可溯源、【社区】仅参考。</div>'
    + secA + '<div class="kb-filterbar" style="margin-bottom:12px"><span class="sn-t">筛选区县</span>'
    + allQ.map(function(q){
        var n = KOUBEI.items.filter(function(it){ return it.qu === q; }).length;
        return '<button class="ff' + (kbFilter === q ? ' on' : '') + '" onclick="kbSetFilter(\'' + q + '\')">' + esc(q) + '（' + n + '）</button>';
      }).join('') + '</div>'
    + '<h4 class="kb-sub" style="margin-top:18px">B · 各区口碑参考名单（来源分层 · 不排位次）</h4>' + secB
    + '<p class="dx-tnote">名单为编辑部采集整理（2026-10-31/11-01），逐校标注来源；『仅参考』的社区口径请自行甄别。遗漏或异议走<a href="contact.html" style="color:var(--accent)">纠错通道</a>。</p>';
}
