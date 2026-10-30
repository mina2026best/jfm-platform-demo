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
var HOT_WORDS = ['指标到校', '三对口', '特招线', '摇号', '联招线', '选科', '清华大学', '西南大学', '长幼随学', '陪读租房'];
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

