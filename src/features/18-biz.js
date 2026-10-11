/* ---------- v0.3 B 端意向 · v0.81 诚实化 ----------
   修复评估报告指出的"假成功"：此前仅前端提示、数据被静默丢弃。
   现在先尝试真实提交（/api/contact，类型=合作意向）；不可用时如实告知"保存在本机"。 */
function submitBiz(){
  var n = document.getElementById('bz-name').value.trim();
  var it = document.getElementById('bz-intro').value.trim();
  var err = document.getElementById('bz-err'), ok = document.getElementById('bz-ok');
  if(n.length < 2 || it.length < 10){ err.style.display = 'block'; ok.style.display = 'none'; return; }
  err.style.display = 'none';
  var item = { id: 'BZ-' + new Date().toISOString().slice(0,10) + '-' + String(Date.now()).slice(-6),
               name: n, message: it, type: '合作意向', date: new Date().toISOString() };
  var done = function(remote){
    document.getElementById('bz-id').textContent = item.id;
    ok.style.display = 'block';
    var note = document.getElementById('bz-note');
    if(note && !remote) note.textContent = '当前为演示环境（静态托管）：意向已保存在本机浏览器，正式版接入后端后将自动同步并进入资质预审。';
    document.getElementById('bz-name').value = ''; document.getElementById('bz-intro').value = '';
    toast(remote ? '合作意向已提交' : '合作意向已保存到本机（演示环境）');
    if(typeof jfmTrack === 'function') jfmTrack('biz_submit', { local: !remote });
  };
  fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: n, type: '合作意向', contact: '', message: it }) })
    .then(function(r){ if(!r.ok) throw new Error(); return r.json(); })
    .then(function(){ done(true); })
    .catch(function(){
      try{
        var out = JSON.parse(localStorage.getItem('jfm_biz_outbox') || '[]');
        out.unshift(item); localStorage.setItem('jfm_biz_outbox', JSON.stringify(out));
      }catch(e){}
      done(false);
    });
}
