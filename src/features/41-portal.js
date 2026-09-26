/* ---------- v0.31：插画挂载：扫 data-art 占位与 hero 插槽 ---------- */
function mountArt(){
  try{
    var hero = document.getElementById('hero-art-slot');
    if(hero && !hero.hasChildNodes()) hero.innerHTML = photoImg(ART_PHOTO['hero'] || 'gate1', true);
  }catch(e){}
  document.querySelectorAll('[data-art]').forEach(function(el){
    if(el.hasChildNodes()) return;
    var kind = el.getAttribute('data-art');
    try{
      if(typeof ART_PHOTO !== 'undefined' && ART_PHOTO[kind]){ el.innerHTML = photoImg(ART_PHOTO[kind]); }
      else{ el.innerHTML = artSVG(kind); }
    }catch(e){}
  });
}

/* ---------- v0.30：搜索页 / FAQ / 热点榜 ---------- */
var HOT_WORDS = ['指标到校', '三对口', '军检线', '摇号', '随迁子女', '长幼随学', '南开中学', '特招线', '陪读租房', '材料清单'];
function hotWordsHTML(){
  return HOT_WORDS.map(function(w){
    return '<a href="search.html?q=' + encodeURIComponent(w) + '">' + esc(w) + '</a>';
  }).join('');
}
/* 搜索页主逻辑：聚合 SEARCH_DB / 资讯 / 学校 */
function runPageSearch(){
  var q = (qparam('q') || '').trim();
  var box = document.getElementById('sp-input'); if(box) box.value = q;
  var out = document.getElementById('sp-out'); if(!out) return;
  var head = document.getElementById('sp-head');
  if(!q){
    if(head) head.textContent = '输入关键词，搜全站';
    out.innerHTML = '<div class="sp-empty">试试上方热门词，或直接输入：学校名 / 政策词 / 术语 / 资讯标题。</div>';
    return;
  }
  if(head) head.textContent = '「' + q + '」的搜索结果';
  var ql = q.toLowerCase();
  var rows = [];
  try{
    Object.keys(SCHOOL_DB).forEach(function(k){
      if(k.toLowerCase().indexOf(ql) >= 0){
        rows.push({ tag: '学校', t: k, s: (SCHOOL_DB[k]['简介'] || '').slice(0, 60), href: 'schools.html?school=' + encodeURIComponent(k) });
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
  SEARCH_DB.forEach(function(x){
    if((x.s + ' ' + x.t).toLowerCase().indexOf(ql) >= 0){
      var pg = ANCHOR2PAGE[x.a] || 'index.html';
      rows.push({ tag: x.t, t: x.s, s: '站内专栏', href: pg });
    }
  });
  if(!rows.length){
    out.innerHTML = '<div class="sp-empty">没有找到与「' + esc(q) + '」相关的内容——换个说法试试，或到<a href="fact.html" style="color:var(--accent)">求真台</a>提交你的问题。</div>';
    return;
  }
  out.innerHTML = '<p class="cmp-note" style="margin-bottom:10px">共命中 ' + rows.length + ' 条（学校 / 资讯 / 政策 / 术语）</p>'
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
function renderHotRank(){
  var box = document.getElementById('hot-rank'); if(!box) return;
  var items = [];
  try{ items = newsCombined().slice(0, 8); }catch(e){ return; }
  if(!items.length){ box.innerHTML = '<div class="empty-mini">资讯加载中…</div>'; return; }
  box.innerHTML = '<div class="hot-rank">' + items.map(function(x, i){
    var href = 'news.html?s=' + encodeURIComponent((x.t || '').slice(0, 12));
    return '<a href="' + href + '"><span class="no' + (i < 3 ? ' hot-no3' : ' hot-no') + '">' + (i + 1) + '</span>'
      + '<span class="t">' + esc(x.t) + '</span><span class="meta">' + esc(x.cat || '') + '</span></a>';
  }).join('') + '</div>';
}

/* ---------- v0.34：联系页留言提交（写后端 /api/contact） ---------- */
function submitContact(){
  var name = (document.getElementById('ct-name')||{}).value || '';
  var type = (document.getElementById('ct-type')||{}).value || '咨询';
  var ct = (document.getElementById('ct-contact')||{}).value || '';
  var msg = (document.getElementById('ct-msg')||{}).value || '';
  if(!name.trim()){ toast('请填写称呼'); return; }
  if(msg.trim().length < 5){ toast('留言内容至少 5 个字'); return; }
  fetch('http://127.0.0.1:8780/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name.trim(), type: type, contact: ct.trim(), message: msg.trim() })
  }).then(function(r){ return r.json().then(function(d){ return { ok: r.ok, d: d }; }); })
    .then(function(res){
      if(res.ok){
        toast('留言已登记（' + res.d.item.id + '），感谢！');
        var m = document.getElementById('ct-msg'); if(m) m.value = '';
        var note = document.getElementById('ct-note');
        if(note) note.textContent = '已提交：编号 ' + res.d.item.id + ' · ' + res.d.item.created;
      } else {
        toast('提交失败：' + (res.d.error || '未知错误'));
      }
    }).catch(function(){
      toast('本地后端未启动（python3 server.py）——留言暂存失败');
    });
}
