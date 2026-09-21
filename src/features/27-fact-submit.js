/* ---------- 求真线索提交 ---------- */
var CLUE_N = 0;
function submitClue(){
  var t=document.getElementById("clue-text").value.trim();
  var err=document.getElementById("clue-err"), ok=document.getElementById("clue-ok");
  if(t.length<10){ err.style.display="block"; ok.style.display="none"; return; }
  err.style.display="none";
  CLUE_N++;
  var id="FQ-20260916-"+String(100+CLUE_N);
  document.getElementById("clue-id").textContent=" 编号 "+id+"，";
  ok.style.display="block";
  document.getElementById("clue-text").value="";
}
