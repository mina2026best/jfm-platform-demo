/* ---------- v0.3：学校档案 ---------- */
var currentOpenSchool = '';
var schoolFilter = 'all';
function filterSchools(kind){
  schoolFilter = kind || 'all';
  document.querySelectorAll('#school-filter .ff').forEach(function(b){
    var on = b.dataset.sf === schoolFilter;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
  });
  document.querySelectorAll('#school-grid .school-card').forEach(function(card){
    var show = schoolFilter === 'all' || (card.getAttribute('data-nature') || '') === schoolFilter;
    card.style.display = show ? '' : 'none';
  });
}
function renderSchools(){
  var g = document.getElementById('school-grid'); if(!g) return;
  g.innerHTML = Object.keys(SCHOOL_DB).map(function(k){
    var d = SCHOOL_DB[k], key = encodeURIComponent(k);
    return '<div class="school-card' + (QU_FILTER && d['所在区'] === QU_FILTER ? ' qu-match' : '') + '" data-nature="' + esc(d['办学性质'].split('（')[0]) + '"><div class="sc-art" aria-hidden="true">' + artSVG2('schools') + '</div><div class="sc-top"><span class="sc-badge">' + esc(d['办学性质'].split('（')[0]) + '</span><span class="sc-qu">' + esc(d['所在区']) + '</span>' + (QU_FILTER && d['所在区'] === QU_FILTER ? '<span class="qu-badge">就在 ' + esc(QU_FILTER) + '</span>' : '') + '</div>'
      + '<h4>' + esc(k) + '</h4><p>' + esc(d['简介'] || '') + '</p>'
      + '<div class="sc-actions"><button class="mini-btn" onclick="openSchool(decodeURIComponent(\'' + key + '\'))">查看档案</button>'
      + '<a class="sc-page" href="articles/' + (ARTMAP['S|' + k] || '') + '">详情页</a>'
      + '<button class="mini-btn" onclick="addToCompareName(decodeURIComponent(\'' + key + '\'))">加入对比</button></div></div>';
  }).join('');
  filterSchools(schoolFilter);
}
function openSchool(name){
  var d = SCHOOL_DB[name]; if(!d) return;
  currentOpenSchool = name;
  document.getElementById('sm-name').textContent = name;
  var kv = document.getElementById('sm-kv');
  var rows = ['办学性质','所在区','招生范围','通勤参考','住宿','收费口径','指标到校','数据来源','暂缺字段'];
  kv.innerHTML = rows.map(function(r){
    var v = d[r] || '暂缺';
    if(r === '暂缺字段'){
      v = '录取线类数据按合规不提供；可到 <a href="zy.html" style="color:var(--accent)">志愿参考 · 位次换算</a> 替代（' + esc(v) + '）';
    }
    return '<dt>' + r + '</dt><dd>' + v + '</dd>';
  }).join('');
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
