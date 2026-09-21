/* ---------- v0.4：求真筛选 ---------- */
function filterFact(mode){
  document.querySelectorAll('#fact .rq-card').forEach(function(c){
    var v = c.querySelector('.verdict');
    var k = 'other';
    if(v){ k = v.classList.contains('false') ? 'false' : v.classList.contains('warn') ? 'warn' : v.classList.contains('ok') ? 'ok' : 'other'; }
    c.style.display = (mode === 'all' || k === mode) ? '' : 'none';
  });
  document.querySelectorAll('#fact .fact-filter .ff').forEach(function(b){
    b.classList.toggle('on', b.dataset.f === mode);
  });
}
