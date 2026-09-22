/* ---------- v0.17：键盘快捷键帮助（?） / 弹窗焦点圈定 ---------- */
function openKbdHelp(){
  var d = document.getElementById('kbd-modal');
  if(d && d.showModal) d.showModal();
}
function toggleKbdHelp(){
  var d = document.getElementById('kbd-modal'); if(!d) return;
  if(d.open) d.close(); else d.showModal();
}
function initKbdHelp(){
  document.addEventListener('keydown', function(e){
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    if(tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if(e.key === '?'){ e.preventDefault(); toggleKbdHelp(); }
  });
}
/* 原生 dialog 的 Tab 圈定不完整：补一层「首尾循环 + 圈外拉回」 */
function initDialogFocusTrap(){
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Tab') return;
    var d = document.querySelector('dialog[open]');
    if(!d) return;
    var els = d.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])');
    els = Array.prototype.filter.call(els, function(el){ return el.getClientRects().length > 0; });
    if(!els.length) return;
    var first = els[0], last = els[els.length - 1], active = document.activeElement;
    if(!d.contains(active)){ e.preventDefault(); (e.shiftKey ? last : first).focus(); return; }
    if(!e.shiftKey && active === last){ e.preventDefault(); first.focus(); }
    else if(e.shiftKey && active === first){ e.preventDefault(); last.focus(); }
  }, true);
}
