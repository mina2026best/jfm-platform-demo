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
