/* ---------- v0.3：全站搜索 ---------- */
var SEARCH_DB = [
 {t:'政策',s:'2026 年中考政策：联招学校约 113 所',a:'#policy'},
 {t:'政策',s:'优质高中指标到校招生工作通知（渝教基函〔2025〕21号）',a:'#policy'},
 {t:'术语',s:'三对口 / 六年一户 / 指标到校 / 联招 / 长幼随学',a:'#policy'},
 {t:'日历',s:'转学与户籍材料核对（2026-09）',a:'#calendar'},
 {t:'日历',s:'指标到校资格摸底（2026-10）',a:'#calendar'},
 {t:'日历',s:'中考报名与联招志愿准备（2027-04）',a:'#calendar'},
 {t:'日历',s:'高考特招线公布后行动清单（2027-06）',a:'#calendar'},
 {t:'求真',s:'「有内部渠道，花钱就能进重点」——不实',a:'#fact'},
 {t:'求真',s:'「指标到校 70% 都能上重点」——存疑',a:'#fact'},
 {t:'求真',s:'「普职分流 5:5」——不实（约 65% 升普高）',a:'#fact'},
 {t:'求真',s:'「学位房 ≠ 学区房」——属实提醒',a:'#fact'},
 {t:'志愿',s:'位次换算工具（线差法演示）',a:'#zy'},
 {t:'生活',s:'陪读租房行情样本 / 护学岗 6,993 个',a:'#life'},
 {t:'资金',s:'教育资金规划参照（CIEFR 15,828 元）',a:'#fund'},
 {t:'会员',s:'四档会员（99/299/899）与升学豆',a:'#plans'},
 {t:'工具',s:'入学自查：我家能不能报（3 问）',a:'#quiz'},
 {t:'路径',s:'升学路径地图：6 条路径 × 学段时间轴（普高/指标到校/民办/中职/艺体/出国）',a:'#zy'},
 {t:'术语',s:'多校划片 / 摇号 / 特招线 / 一分一段 / 对口直升',a:'#policy'},
 {t:'社区',s:'本周热议：指标到校校内排队',a:'#community'},
 {t:'工具',s:'多孩档案：按孩子切换，日历自动过滤（v0.8）',a:'#me'},
 {t:'工具',s:'提醒导出 .ics / 打印升学行动清单（v0.8）',a:'#me'}
];
function runSearch(){
  var q = document.getElementById('global-search').value.trim().toLowerCase();
  var panel = document.getElementById('search-panel');
  if(!q){ panel.hidden = true; return; }
  var hits = SEARCH_DB.filter(function(x){ return (x.s + ' ' + x.t).toLowerCase().indexOf(q) >= 0; }).slice(0, 8);
  if(!hits.length){
    panel.innerHTML = '<div class="s-item s-empty">未找到相关内容，换个关键词试试（如「指标」「陪读」「军检」）。</div>';
    panel.hidden = false; return;
  }
  panel.innerHTML = hits.map(function(x){ return '<div class="s-item" onclick="goSearch(\'' + x.a + '\')"><span class="s-badge">' + x.t + '</span>' + esc(x.s) + '</div>'; }).join('');
  panel.hidden = false;
}
function goSearch(anchor){
  document.getElementById('search-panel').hidden = true;
  var el = document.querySelector(anchor);
  if(el){ el.scrollIntoView({behavior:'smooth', block:'start'}); el.classList.add('flash'); setTimeout(function(){ el.classList.remove('flash'); }, 1400); }
}
