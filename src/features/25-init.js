/* ---------- v0.3：初始化 ---------- */
function initSelects(){
  var keys = Object.keys(SCHOOL_DB);
  [['sel-a','选择学校一'],['sel-b','选择学校二'],['sel-c','选择学校三（可选）']].forEach(function(pair){
    var sel = document.getElementById(pair[0]); if(!sel) return;
    var cur = sel.value;
    var html = '<option value="">' + pair[1] + '</option>';
    keys.forEach(function(k){ html += '<option>' + esc(k) + '</option>'; });
    sel.innerHTML = html;
    if(cur) sel.value = cur;
  });
}
