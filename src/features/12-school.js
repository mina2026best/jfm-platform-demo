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

/* ---------- v1.09 学校关注（收藏中心聚合到「我的」页） ---------- */
function schFavLoad(){ try{ return JSON.parse(localStorage.getItem('sch_fav') || '[]'); }catch(e){ return []; } }
function schFavSave(a){ try{ localStorage.setItem('sch_fav', JSON.stringify(a)); }catch(e){} }
function schFavToggle(key, btn){
  var name = decodeURIComponent(key);
  var f = schFavLoad(), i = f.indexOf(name);
  if(i < 0){ f.push(name); toast('已关注：' + name + '（到「我的」页查看）'); }
  else { f.splice(i, 1); toast('已取消关注：' + name); }
  schFavSave(f); schFavRestore();
  if(typeof renderWatch === 'function') renderWatch();
}
function schFavRestore(){
  var f = schFavLoad();
  document.querySelectorAll('.sch-fav-btn').forEach(function(b){
    var on = f.indexOf(b.getAttribute('data-school')) >= 0;
    b.textContent = on ? '★ 已关注' : '☆ 关注';
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}
function renderSchools(){
  var g = document.getElementById('school-grid'); if(!g) return;
  g.innerHTML = Object.keys(SCHOOL_DB).map(function(k){
    var d = SCHOOL_DB[k], key = encodeURIComponent(k), qu = d['所在区'] || '';
    return '<div class="school-card' + (QU_FILTER && qu === QU_FILTER ? ' qu-match' : '') + '" data-nature="' + esc(_schoolNature(k)) + '" data-stage="' + esc(_schoolStage(k)) + '" data-qu="' + esc(qu) + '"><div class="sc-art" aria-hidden="true">' + schoolPhotoImg(k) + '</div><div class="sc-top"><span class="sc-badge">' + esc(_schoolNature(k)) + '</span><span class="sc-qu">' + esc(qu) + '</span><span class="sc-badge sc-stage">' + esc(_schoolStage(k)) + '</span>' + (QU_FILTER && qu === QU_FILTER ? '<span class="qu-badge">就在 ' + esc(QU_FILTER) + '</span>' : '') + '</div>'
      + '<h4>' + esc(k) + '</h4>' + _factChips(k) + '<p>' + esc(d['简介'] || '') + '</p>'
      + '<div class="sc-actions"><button class="mini-btn" onclick="openSchool(decodeURIComponent(\'' + key + '\'))">查看档案</button>'
      + '<a class="sc-page" href="articles/' + (ARTMAP['S|' + k] || '') + '">详情页</a>'
      + '<button class="mini-btn sch-cmp-btn" data-school="' + esc(k) + '" onclick="addToCompareName(decodeURIComponent(\'' + key + '\'))" aria-pressed="false">加入对比</button>'
      + '<button class="mini-btn sch-fav-btn" data-school="' + esc(k) + '" onclick="schFavToggle(decodeURIComponent(\'' + key + '\'), this)" aria-pressed="false">☆ 关注</button></div></div>';
  }).join('');
  initSchoolFilters();
  initStageFilters();
  schFavRestore();
  schCmpRestore();
  schCmpRenderPanel();
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
      v = '无官方发布的数据一律不展示（防误导）；分数定位可到 <a href="zy.html" style="color:var(--accent)">志愿参考 · 线差位次工具</a>。' + (raw ? '字段备注：' + esc(raw || '') : '');
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
  var hasSels = sels.some(function(id){ return document.getElementById(id); });
  if(!hasSels){
    /* v1.09：档案/学校页无下拉——走页内停靠对比（sch_cmp），修复"永远提示已满"断链 */
    schCmpToggle(name);
    return;
  }
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

/* ---------- v1.09 学校停靠对比器（对齐大学对比器交互；不排名、每格带来源） ---------- */
function schCmpLoad(){ try{ return JSON.parse(localStorage.getItem('sch_cmp') || '[]'); }catch(e){ return []; } }
function schCmpSave(a){ try{ localStorage.setItem('sch_cmp', JSON.stringify(a)); }catch(e){} }
function schCmpToggle(name){
  if(!SCHOOL_DB[name]){ toast('未找到该校档案：' + name); return; }
  var a = schCmpLoad();
  var i = a.indexOf(name);
  if(i >= 0){ a.splice(i, 1); toast('已移出对比：' + name); }
  else{
    if(a.length >= 3){ toast('最多同时对比 3 所'); return; }
    /* 学段闸门：同档（小学/中学）内对比 */
    for(var j=0;j<a.length;j++){
      if(_schoolStage(a[j]) !== _schoolStage(name)){
        toast('学段不同不能对比（' + _schoolStage(a[j]) + ' vs ' + _schoolStage(name) + '）；先清空当前对比再选');
        return;
      }
    }
    a.push(name);
    toast('已加入对比（' + a.length + '/3）：' + name);
  }
  schCmpSave(a);
  schCmpRenderPanel();
  schCmpRestore();
}
function schCmpRestore(){
  var a = schCmpLoad();
  document.querySelectorAll('.sch-cmp-btn').forEach(function(b){
    var on = a.indexOf(b.getAttribute('data-school')) >= 0;
    b.textContent = on ? '✓ 已在对比' : '加入对比';
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}
function schCmpClear(){ schCmpSave([]); schCmpRenderPanel(); schCmpRestore(); toast('已清空对比'); }
function schCmpRenderPanel(){
  var panel = document.getElementById('sch-cmp-panel') || document.querySelector('[id^="sch-cmp-panel-"]'); if(!panel) return;
  var names = schCmpLoad().filter(function(n){ return SCHOOL_DB[n]; });
  if(names.length < 2){ panel.innerHTML = ''; return; }
  function row(label, fn){ return '<tr><th>' + label + '</th>' + names.map(function(n){ return '<td>' + fn(SCHOOL_DB[n], n) + '</td>'; }).join('') + '</tr>'; }
  function koubeiCell(n){
    if(typeof KOUBEI === 'undefined') return '—';
    var it = KOUBEI.items.find(function(x){ return x.name === n; });
    if(!it) return '<span class="cmp-empty">未采集（不补数）</span>';
    var url = (it.src.match(/https?:\/\/[^\s）)]+/) || [''])[0];
    var link = url ? '<a href="' + hrefEnc(url) + '" target="_blank" rel="noopener">依据 ↗</a>' : '';
    return '<span class="sc-badge">' + it.level + '级来源</span>' + link;
  }
  function dragonCell(n){
    if(typeof DRAGON === 'undefined') return '—';
    var ent = null;
    for(var s=0;s<DRAGON.systems.length && !ent;s++){
      ent = DRAGON.systems[s].entities.find(function(x){ return x.name === n; });
    }
    if(!ent) return '<span class="cmp-empty">非七系或未采集</span>';
    return esc(ent.fields['关系类型'] || '—') + (ent.doubt ? ' <span class="sc-badge" title="存疑，详见梯队与图谱页">⚠ 存疑</span>' : '');
  }
  var html = '<div class="cb-cmp-head"><b>学校对比（' + names.length + '/3 · ' + esc(_schoolStage(names[0]) || '同学段') + '）</b>'
    + '<button class="cb-ghost" onclick="schCmpClear()">清空对比</button></div>'
    + '<div class="dx-twrap"><table class="art-table cmp-table"><thead><tr><th>维度</th>'
    + names.map(function(n){ return '<th>' + esc(n) + '</th>'; }).join('') + '</tr></thead><tbody>'
    + row('所在区', function(d){ return esc(d['所在区'] || '暂缺'); })
    + row('办学性质', function(d){ return esc(d['办学性质'] || '暂缺'); })
    + row('创办', function(d){ return esc(d['创办'] || '暂缺'); })
    + row('招生范围', function(d){ return esc(d['招生范围'] || '暂缺'); })
    + row('收费口径', function(d){ return esc(d['收费口径'] || '暂缺'); })
    + row('住宿', function(d){ return esc(d['住宿'] || '暂缺'); })
    + row('指标到校', function(d){ return esc(d['指标到校'] || '暂缺'); })
    + row('地址与通勤', function(d){ return esc((d['校区地址'] || '暂缺') + (d['通勤参考'] ? '；' + d['通勤参考'] : '')); })
    + row('口碑与来源层', function(d, n){ return koubeiCell(n); })
    + row('系属（七系图谱）', function(d, n){ return dragonCell(n); })
    + '</tbody></table></div>'
    + '<p class="cmp-note">口径声明：本表只并列官方可核验信息，<b>不排名、不构成录取承诺</b>；缺失字段如实标注「暂缺/未采集」，不估算不补数。口碑来源层仅收录有来源的名单（官方/媒体/社区），社区级仅参考。招生与收费以当年度区教委官方发布为准。</p>';
  panel.innerHTML = html;
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


/* ---------- v1.13：学段档案分册（小学/初中/高中三页，数据=逐校核对稿） ---------- */
var STAGE_PAGE_CONF = {
  xx: { name: '小学档案', grid: 'school-grid-xx', filters: 'xx-filters', pick: function(k){ var m = (typeof SCHOOL_STAGE_MAP !== 'undefined') && SCHOOL_STAGE_MAP[k]; return !!m && m.stage === '小学'; },
        chips: [
          { label: '口碑来源·官方', match: function(k){ var it = (typeof KOUBEI !== 'undefined') && KOUBEI.items.find(function(i){ return i.name === k.split('（')[0]; }); return !!it && it.level === '官方'; } },
          { label: '口碑来源·媒体', match: function(k){ var it = (typeof KOUBEI !== 'undefined') && KOUBEI.items.find(function(i){ return i.name === k.split('（')[0]; }); return !!it && it.level === '媒体'; } },
          { label: '市级示范（历批）', match: function(k){ var it = (typeof KOUBEI !== 'undefined') && KOUBEI.items.find(function(i){ return i.name === k.split('（')[0]; }); return !!it && it.demo > 0; } },
          { label: '渝中区学位紧张（2026）', match: function(k){ return /渝中/.test(k) && /巴蜀小学|人民小学|人和街小学/.test(k); } },
          { label: '九年一贯制', match: function(k){ var m = (typeof SCHOOL_STAGE_MAP !== 'undefined') && SCHOOL_STAGE_MAP[k]; return !!m && m.tag === '九年一贯'; } }
        ] },
  cz: { name: '初中档案', grid: 'school-grid-cz', filters: 'cz-filters', pick: function(k){ var m = (typeof SCHOOL_STAGE_MAP !== 'undefined') && SCHOOL_STAGE_MAP[k]; return !!m && (m.stage === '初中' || m.tag === '完中'); },
        chips: [
          { label: '纯初中（划片/派位）', match: function(k){ var m = (typeof SCHOOL_STAGE_MAP !== 'undefined') && SCHOOL_STAGE_MAP[k]; return m && m.stage === '初中'; } },
          { label: '完中·含高中部', match: function(k){ var m = (typeof SCHOOL_STAGE_MAP !== 'undefined') && SCHOOL_STAGE_MAP[k]; return m && m.tag === '完中'; } },
          { label: '民办（摇号）', match: function(k){ var d = SCHOOL_DB[k] || {}; return /民办/.test(d['办学性质'] || '') && /摇号/.test(d['招生范围'] || ''); } },
          { label: '七系系属', match: function(k){ var base = k.split('（')[0]; return (typeof DRAGON !== 'undefined') && DRAGON.systems.some(function(sys){ return sys.entities.some(function(e){ return e.name.split('（')[0].trim() === base; }); }); } },
          { label: '沙区学位紧张（2026 初中）', match: function(k){ return /沙坪坝/.test(k) && /重庆七中|凤鸣山|青木关|树人中学/.test(k); } }
        ] },
  gz: { name: '高中档案', grid: 'school-grid-gz', filters: 'gz-filters', pick: function(k){ var m = (typeof SCHOOL_STAGE_MAP !== 'undefined') && SCHOOL_STAGE_MAP[k]; return !!m && m.stage === '高中'; },
        chips: [
          { label: '市级重点（联招）', match: function(k){ var d = SCHOOL_DB[k] || {}; return /市级重点/.test(d['办学性质'] || ''); } },
          { label: '完中·含初中部', match: function(k){ var m = (typeof SCHOOL_STAGE_MAP !== 'undefined') && SCHOOL_STAGE_MAP[k]; return m && m.tag === '完中'; } },
          { label: '民办', match: function(k){ var d = SCHOOL_DB[k] || {}; return /民办/.test(d['办学性质'] || ''); } },
          { label: '中心城区', match: function(k){ var d = SCHOOL_DB[k] || {}; return /渝中|江北|南岸|沙坪坝|九龙坡|大渡口/.test(d['所在区'] || ''); } },
          { label: '主城新区/远郊', match: function(k){ var d = SCHOOL_DB[k] || {}; return !/渝中|江北|南岸|沙坪坝|九龙坡|大渡口/.test(d['所在区'] || ''); } }
        ] }
};

function stageCardHTML(k){
  var d = SCHOOL_DB[k] || {};
  var key = encodeURIComponent(k);
  var m = (typeof SCHOOL_STAGE_MAP !== 'undefined') && SCHOOL_STAGE_MAP[k];
  var badge = '';
  if (m && m.tag === '完中') badge = '<span class="sc-badge" style="background:#22314A;color:#C9D8F0">含高中部</span>';
  if (m && m.tag === '完中' && typeof STAGE_PAGE_CUR !== 'undefined' && STAGE_PAGE_CUR === 'gz') badge = '<span class="sc-badge" style="background:#22314A;color:#C9D8F0">含初中部</span>';
  var stg = document.getElementById('school-grid-xx') ? 'xx' : (document.getElementById('school-grid-cz') ? 'cz' : 'gz');
  return '<div class="school-card" data-qu="' + esc(d['所在区'] || '') + '"><div class="sc-art" aria-hidden="true">' + schoolPhotoImg(k) + '</div><div class="sc-top"><span class="sc-badge">' + esc(_schoolNature(k)) + '</span><span class="sc-qu">' + esc(d['所在区'] || '') + '</span><span class="sc-badge sc-stage">' + esc(_schoolStage(k)) + '</span>' + badge + '</div>'
    + '<h4>' + esc(k) + '</h4>' + _factChips(k) + '<p>' + esc(d['简介'] || '') + '</p>'
    + '<div class="sc-actions"><button class="mini-btn" onclick="openSchool(decodeURIComponent(\'' + key + '\'))">查看档案</button>'
    + '<a class="sc-page" href="articles/' + (typeof ARTMAP !== 'undefined' && ARTMAP['S|' + k] ? ARTMAP['S|' + k] : '') + '">详情页</a>'
    + '<button class="mini-btn sch-cmp-btn" data-school="' + esc(k) + '" onclick="addToCompareName(decodeURIComponent(\'' + key + '\'))" aria-pressed="false">加入对比</button>'
    + '<button class="mini-btn sch-fav-btn" data-school="' + esc(k) + '" onclick="schFavToggle(decodeURIComponent(\'' + key + '\'), this)" aria-pressed="false">☆ 关注</button></div>'
    + '<div class="sc-qu" style="margin-top:6px">分类依据：' + esc((m && m.basis) || '—') + '</div></div>';
}

var STAGE_PAGE_CUR = '';
var STAGE_CHIP_CUR = {};
function renderStagePages(){
  Object.keys(STAGE_PAGE_CONF).forEach(function(pid){
    var conf = STAGE_PAGE_CONF[pid];
    var grid = document.getElementById(conf.grid);
    if(!grid || typeof SCHOOL_DB === 'undefined' || typeof SCHOOL_STAGE_MAP === 'undefined') return;
    STAGE_PAGE_CUR = pid;
    var keys = Object.keys(SCHOOL_DB).filter(conf.pick);
    window['_keys_' + pid] = keys;
    STAGE_CHIP_CUR[pid] = '';
    paintStageGrid(pid);
    buildStageFilters(pid, keys, conf);
    if(typeof schFavRestore === 'function') schFavRestore();
    if(typeof schCmpRestore === 'function') schCmpRestore();
  });
  STAGE_PAGE_CUR = '';
}
function paintStageGrid(pid){
  var conf = STAGE_PAGE_CONF[pid];
  var grid = document.getElementById(conf.grid); if(!grid) return;
  var keys = (window['_keys_' + pid] || []);
  var chip = STAGE_CHIP_CUR[pid];
  var shown = keys.filter(function(k){
    if(!chip) return true;
    var c = conf.chips.find(function(x){ return x.label === chip; });
    return c ? c.match(k) : true;
  });
  grid.innerHTML = '<div class="cmp-note" style="margin-bottom:10px">显示 ' + shown.length + ' / ' + keys.length + ' 所（分类无标签的学校在「全部」下可见）</div>' + shown.map(stageCardHTML).join('');
  if(typeof schFavRestore === 'function') schFavRestore();
  if(typeof schCmpRestore === 'function') schCmpRestore();
}
function stageChipFilter(pid, label){
  STAGE_CHIP_CUR[pid] = label;
  paintStageGrid(pid);
}
function buildStageFilters(pid, keys, conf){
  var box = document.getElementById(conf.filters); if(!box) return;
  var qus = [];
  keys.forEach(function(k){ var q = (SCHOOL_DB[k]['所在区'] || '').trim(); if(q && qus.indexOf(q) < 0) qus.push(q); });
  var html = '<button class="ff on" onclick="stageChipFilter(\'' + pid + '\',\'\')">全部（' + keys.length + '）</button>';
  qus.forEach(function(q){ html += '<button class="ff" onclick="stageQuFilter(\'' + pid + '\',\'' + esc(q) + '\')">' + esc(q) + '</button>'; });
  conf.chips.forEach(function(c){
    var n = keys.filter(c.match).length;
    html += '<button class="ff" style="border-style:dashed" onclick="stageQuFilter(\'' + pid + '\',\'@' + esc(c.label) + '\')">' + esc(c.label) + '（' + n + '）</button>';
  });
  box.innerHTML = html;
}
function stageQuFilter(pid, q){
  var conf = STAGE_PAGE_CONF[pid];
  var grid = document.getElementById(conf.grid); if(!grid) return;
  var keys = (window['_keys_' + pid] || []);
  var shown;
  if(!q){ shown = keys; }
  else if(q.charAt(0) === '@'){
    var label = q.slice(1);
    var c = conf.chips.find(function(x){ return x.label === label; });
    shown = keys.filter(c ? c.match : function(){ return true; });
  } else {
    shown = keys.filter(function(k){ return (SCHOOL_DB[k]['所在区'] || '') === q; });
  }
  STAGE_CHIP_CUR[pid] = q.charAt(0) === '@' ? q.slice(1) : '';
  grid.innerHTML = '<div class="cmp-note" style="margin-bottom:10px">显示 ' + shown.length + ' / ' + keys.length + ' 所（分类无标签的学校在「全部」下可见）</div>' + shown.map(stageCardHTML).join('');
  if(typeof schFavRestore === 'function') schFavRestore();
  if(typeof schCmpRestore === 'function') schCmpRestore();
}
