/* ---------- 资金规划参照（演示） ---------- */
function fundCalc(){
  var st=document.getElementById("fund-stage").value;
  var b=parseInt(document.getElementById("fund-budget").value,10);
  var box=document.getElementById("fund-result");
  if(!st){ box.innerHTML='<div class="cmp-empty">请选择学段。</div>'; return; }
  var REF = DATA_SOURCES.cifr;
  var ref={
    "幼儿园":"学前阶段差异大：公办普惠与民办价差可达数倍；建议先列「保教费 + 兴趣探索」两栏，避免为「别输在起跑线」超支。",
    "小学":"小学阶段校外支出约占生均教育支出 26.2%（CIEFR 调查）；此阶段最大风险是「跟风报班」，建议每年做一次预算复盘，砍掉续费前犹豫的项目。",
    "初中":"初中为焦虑峰值段：学科类培训受「双减」约束，转向素质与研学时警惕打包定价；建议把「信息与规划」类投入（如工具会员）与「课时」类投入分开记账。",
    "高中":"高中阶段单笔大额决策多（复读/志愿咨询/教辅）：全国一对一咨询报价约 4,000 元至近 2 万元（半月谈/21 财经，已核验）；大额支出前先看求真台避坑结论。"
  }[st];
  var cmp="";
  if(b>0){
    var share=(b/15828*100).toFixed(0);
    cmp="<br/>你输入的年预算 <b>"+b.toLocaleString()+" 元</b> 约为全国调查均值（"+REF.label.match(/\d[\d,]+/)[0]+" 元）的 <b>"+share+"%</b>"+(b>21000?"——高于均值较多，建议逐项核对「课时/资料/活动/设备」四类占比。":"——在均值附近或以下，结构比总量更值得关注。");
  }
  box.innerHTML='<div class="fund-out"><b>'+st+'阶段参照：</b>'+ref+cmp+'<br/><br/>'+dataBadge('cifr')+'<br/><span style="font-size:12px;color:var(--muted)">风险提示：本工具仅提供公开调查数据的参照对照，不推荐任何金融/保险产品；教育金规划请以家庭整体现金流为前提。</span></div>';
}
function bootV3(){
  initSelects(); renderSchools(); migrateProfile(); renderKids(); kidNote(); applyKidFilter(); renderKidBar(); restoreAlerts(); renderMeFav(); renderMeStats(); renderNews(); renderLearn(); initAnnBar(); initSearchShortcut(); initScrollSpy(); initFsToggle(); initTheme(); initPageUI(); initKbdHelp(); initDialogFocusTrap(); renderPath('普高统招（联招）'); renderDataSources();
  var mb = document.getElementById('me-beans'), bv = document.getElementById('beans-val');
  if(mb && bv) mb.textContent = bv.textContent;
}
function bootOnce(){ if(window.__booted) return; window.__booted = true; bootV3(); }
document.addEventListener('DOMContentLoaded', bootOnce);
if(document.readyState !== 'loading') bootOnce();
function clearCompare(){
  ["sel-a","sel-b","sel-c"].forEach(function(id){document.getElementById(id).value="";});
  cmpLast = null; cmpDiffOnly = false;
  var dbtn = document.getElementById("btn-diff");
  if(dbtn){ dbtn.classList.remove('on'); dbtn.setAttribute('aria-pressed','false'); dbtn.textContent = '仅看差异'; }
  document.getElementById("cmp-result").innerHTML='<div class="cmp-empty">选择 2–3 所学校后点击「生成对比」。</div>';
}
