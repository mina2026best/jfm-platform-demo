/* ---------- 升学豆签到 ---------- */
var checked=false;
function checkin(){
  if(checked) return;
  checked=true;
  var v=document.getElementById("beans-val");
  v.textContent=parseInt(v.textContent,10)+5;
  var b=document.getElementById("btn-checkin");
  b.disabled=true; b.textContent="今日已签到";
  document.getElementById("beans-done").style.display="block";
  var mb=document.getElementById("me-beans");
  if(mb) mb.textContent=v.textContent;
}
