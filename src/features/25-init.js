/* ---------- v0.3：初始化 ---------- */
function initSelects(){
  var keys = Object.keys(SCHOOL_DB);
  var pri = keys.filter(function(k){ return (typeof _schoolStage === 'function') && _schoolStage(k) === '小学'; });
  var mid = keys.filter(function(k){ return (typeof _schoolStage === 'function') && _schoolStage(k) !== '小学'; });
  [['sel-a','选择学校一'],['sel-b','选择学校二'],['sel-c','选择学校三（可选）']].forEach(function(pair){
    var sel = document.getElementById(pair[0]); if(!sel) return;
    var cur = sel.value;
    var html = '<option value="">' + pair[1] + '</option>';
    if(pri.length) html += '<optgroup label="小学">' + pri.map(function(k){ return '<option>' + esc(k) + '</option>'; }).join('') + '</optgroup>';
    if(mid.length) html += '<optgroup label="中学（初中/高中/完中）">' + mid.map(function(k){ return '<option>' + esc(k) + '</option>'; }).join('') + '</optgroup>';
    sel.innerHTML = html;
    if(cur) sel.value = cur;
    /* v1.09：sch_cmp 停靠对比迁移桥——进对比页时预填 */
    if(pair[0] === 'sel-a'){
      var saved = [];
      try{ saved = JSON.parse(localStorage.getItem('sch_cmp') || '[]'); }catch(e){}
      if(saved.length && !cur){
        ['sel-a','sel-b','sel-c'].forEach(function(id, i){
          var el = document.getElementById(id);
          if(el && saved[i] && SCHOOL_DB[saved[i]]) el.value = saved[i];
        });
        if(typeof runCompare === 'function') runCompare();
      }
    }
  });
}
