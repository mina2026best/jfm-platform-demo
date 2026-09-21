/* ---------- v0.5：日历学段筛选 ---------- */
function filterCal(mode){
  document.querySelectorAll('#calendar .cal').forEach(function(c){
    c.style.display = (mode === 'all' || c.dataset.stage === mode) ? '' : 'none';
  });
  document.querySelectorAll('#calendar .cal-filter .ff').forEach(function(b){
    b.classList.toggle('on', b.dataset.cf === mode);
  });
}
