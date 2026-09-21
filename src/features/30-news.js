/* ---------- v0.10：资讯中心（信息流 + 站内编辑台） ---------- */
var NEWS_CATS = ['政策速递','升学动态','家庭教育','安全提醒','办事提醒'];
var newsFilter = 'all';
var newsQuery = '';
var neEditingId = null;

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
function renderNews(){
  var box = document.getElementById('news-list'); if(!box) return;
  var arr = newsCombined();
  var q = newsQuery.trim().toLowerCase();
  var shown = arr.filter(function(x){
    if(newsFilter !== 'all' && x.cat !== newsFilter) return false;
    if(q){
      var hay = ((x.t || '') + ' ' + (x.sum || '') + ' ' + (x.src || '') + ' ' + (x.cat || '')).toLowerCase();
      if(hay.indexOf(q) === -1) return false;
    }
    return true;
  });
  box.innerHTML = shown.length ? shown.map(newsItemHTML).join('')
    : (q ? '<div class="empty-mini">没有匹配「' + esc(newsQuery.trim()) + '」的条目——换个关键词试试，或清空搜索框。</div>'
         : '<div class="empty-mini">该分类暂无条目——可点「编辑台」添加（演示）。</div>');
  var counts = { all: arr.length };
  NEWS_CATS.forEach(function(c){ counts[c] = arr.filter(function(x){ return x.cat === c; }).length; });
  var labels = { all: '全部', '政策速递': '政策速递', '升学动态': '升学动态', '家庭教育': '家庭教育', '安全提醒': '安全提醒', '办事提醒': '办事提醒' };
  document.querySelectorAll('#news-filter .ff').forEach(function(b){
    var c = b.dataset.nf;
    b.classList.toggle('on', c === newsFilter);
    b.textContent = labels[c] + (counts[c] ? ' ' + counts[c] : '');
  });
  var meta = document.getElementById('news-meta-line');
  if(meta){
    var us = getUserNews().length;
    meta.textContent = '演示数据：编辑部条目 ' + allNews().length + ' 条' + (us ? ' · 本机编辑 ' + us + ' 条（含草稿）' : '')
      + (q ? ' · 搜索「' + newsQuery.trim() + '」命中 ' + shown.length + ' 条' : '')
      + ' · 「编辑台」内容保存在本机浏览器，可导出 JSON 交接；正式版接入后台审核发布流程。';
  }
}
function newsItemHTML(x){
  var bodyHTML = (x.body || x.url)
    ? '<div class="ni-body" hidden>' + esc(x.body || '') + (x.url ? '<div style="margin-top:6px"><a href="' + esc(x.url) + '" target="_blank" rel="noopener">原文链接 ↗</a></div>' : '') + '</div>'
    : '';
  return '<div class="news-item" data-key="' + esc(x._k) + '" data-cat="' + esc(x.cat) + '">'
    + '<div class="ni-head"><span class="ni-cat">' + esc(x.cat) + '</span>'
    + '<span>' + esc(x.src || '') + '</span><span>' + esc(x.date || '') + '</span>'
    + (x._local ? '<span class="ni-tag local">本机编辑</span>' : '') + '</div>'
    + '<h4 class="ni-title" onclick="toggleNewsBody(this)" title="点击展开/收起">' + esc(x.t) + '</h4>'
    + (x.sum ? '<p class="ni-sum">' + esc(x.sum) + '</p>' : '')
    + bodyHTML
    + '<div class="ni-actions"><button class="mini-btn" onclick="copyNewsItem(\'' + esc(x._k) + '\')">复制转发</button>'
    + (x._local ? '<button class="mini-btn" onclick="editNewsItem(\'' + esc(x._k) + '\')">编辑</button><button class="mini-btn danger" onclick="delNewsItem(\'' + esc(x._k) + '\')">删除</button>' : '')
    + '</div>'
    + '</div>';
}
function toggleNewsBody(el){
  var item = el.closest('.news-item'); if(!item) return;
  var body = item.querySelector('.ni-body'); if(!body) return;
  body.hidden = !body.hidden;
}
function goNewsByKey(key){
  document.getElementById('search-panel').hidden = true;
  newsFilter = 'all'; renderNews();
  var el = document.querySelector('#news-list .news-item[data-key="' + key + '"]');
  if(!el) return;
  var body = el.querySelector('.ni-body'); if(body) body.hidden = false;
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
  if(!t || !src){ err.textContent = '标题与来源为必填项（演示校验）。'; err.style.display = 'inline'; return; }
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
  var payload = { exportedAt: new Date().toISOString(), note: '鸡父母平台资讯导出（演示）', items: newsCombined() };
  var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  var u = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = u; a.download = 'jfm-news-export.json';
  document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(u); a.remove(); }, 1200);
  toast('已导出资讯 JSON（' + payload.items.length + ' 条）');
}
