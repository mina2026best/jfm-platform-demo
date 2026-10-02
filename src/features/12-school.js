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
    var show = okN && okQ;
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
    return '<div class="school-card' + (QU_FILTER && qu === QU_FILTER ? ' qu-match' : '') + '" data-nature="' + esc(_schoolNature(k)) + '" data-qu="' + esc(qu) + '"><div class="sc-art" aria-hidden="true">' + schoolPhotoImg(k) + '</div><div class="sc-top"><span class="sc-badge">' + esc(_schoolNature(k)) + '</span><span class="sc-qu">' + esc(qu) + '</span>' + (QU_FILTER && qu === QU_FILTER ? '<span class="qu-badge">就在 ' + esc(QU_FILTER) + '</span>' : '') + '</div>'
      + '<h4>' + esc(k) + '</h4>' + _factChips(k) + '<p>' + esc(d['简介'] || '') + '</p>'
      + '<div class="sc-actions"><button class="mini-btn" onclick="openSchool(decodeURIComponent(\'' + key + '\'))">查看档案</button>'
      + '<a class="sc-page" href="articles/' + (ARTMAP['S|' + k] || '') + '">详情页</a>'
      + '<button class="mini-btn" onclick="addToCompareName(decodeURIComponent(\'' + key + '\'))">加入对比</button></div></div>';
  }).join('');
  initSchoolFilters();
  /* 恢复筛选状态（初始均为 all） */
  document.querySelectorAll('#school-filter .ff').forEach(function(b){ b.classList.toggle('on', (b.dataset.sf || 'all') === schoolFilter); });
  document.querySelectorAll('#school-region-filter .ff').forEach(function(b){ b.classList.toggle('on', (b.dataset.sr || 'all') === schoolRegion); });
  applySchoolFilters();
}

function openSchool(name){
  var d = SCHOOL_DB[name]; if(!d) return;
  currentOpenSchool = name;
  document.getElementById('sm-name').textContent = name;
  var kv = document.getElementById('sm-kv');
  var rows = ['办学性质','所在区','创办','校训','校区地址','校园规模','师资概况','办学特色','招生范围','通勤参考','住宿','收费口径','指标到校','官网','数据来源','暂缺字段'];
  kv.innerHTML = rows.map(function(r){
    var raw = d[r];
    var v;
    if(r === '暂缺字段'){
      v = '录取线类数据按合规不提供；可到 <a href="zy.html" style="color:var(--accent)">志愿参考 · 位次换算</a> 替代（' + esc(raw || '') + '）';
    } else if(r === '官网'){
      v = raw ? '<a href="' + hrefEnc(raw) + '" target="_blank" rel="noopener">' + esc(String(raw).replace(/^https?:\/\//, '').replace(/\/$/, '')) + ' ↗</a>' : '暂缺';
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
