/* ---------- v0.3：B 端意向 ---------- */
var BZ_N = 0;
function submitBiz(){
  var n = document.getElementById('bz-name').value.trim();
  var it = document.getElementById('bz-intro').value.trim();
  var err = document.getElementById('bz-err'), ok = document.getElementById('bz-ok');
  if(n.length < 2 || it.length < 10){ err.style.display = 'block'; ok.style.display = 'none'; return; }
  err.style.display = 'none';
  BZ_N++;
  document.getElementById('bz-id').textContent = 'BZ-20260916-' + String(100 + BZ_N);
  ok.style.display = 'block';
  document.getElementById('bz-name').value = ''; document.getElementById('bz-intro').value = '';
  toast('合作意向已提交（演示）');
}
