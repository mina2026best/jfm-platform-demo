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
  var rows = '';
  DX_YEARS.forEach(function(y){
    ['wl','ls'].forEach(function(c){
      var rec = s.L[c] && s.L[c][y];
      if(!rec) return;
      var b = batch[y] ? batch[y][c] : null;
      var d = (b != null && rec[0] != null) ? ('批线差 ' + (rec[0] - b >= 0 ? '+' : '') + (rec[0] - b)) : '—';
      rows += '<tr><td>' + y + '</td><td>' + dxCatLabel(c) + '</td><td class="mono">' + rec[0] + '</td>'
        + '<td class="mono">' + (rec[1] ? rec[1].toLocaleString() : '—') + '</td>'
        + '<td class="mono">' + d + '</td><td>' + (rec[2] ? esc(rec[2]) : '本科批') + '</td></tr>';
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
  return '<div class="dx-twrap"><table class="art-table dx-table"><thead><tr><th>年份</th><th>科类</th><th>投档最低分</th><th>最低位次</th><th>批线差</th><th>口径</th></tr></thead><tbody>' + rows + '</tbody></table></div>' + noteLine;
}

function dxBadge(s){
  var out = '';
  if(s.tier === '985') out += '<span class="dx-badge b-985">985</span>';
  if(s.c9) out += '<span class="dx-badge b-c9">C9</span>';
  if(s.tier === '211' && !s.branch) out += '<span class="dx-badge b-211">211</span>';
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
  if(DX.sort === 'wl' || DX.sort === 'ls'){
    var c = DX.sort;
    list.sort(function(a, b){
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
