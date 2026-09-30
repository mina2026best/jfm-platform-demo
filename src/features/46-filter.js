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
