/* ---------- 演示数据（正式版来自后台数据库并标注核验日期） ---------- */
var SCHOOL_DB = {
  "南开中学（沙坪坝）": {
    "办学性质": "公办（市级重点）",
    "所在区": "沙坪坝区",
    "招生范围": "指标到校 + 联招（全区）",
    "通勤参考": "轨道 1 号线沿线；沙坪坝商圈步行可达",
    "住宿": "提供寄宿（限额）",
    "收费口径": "公办收费标准；寄宿另计（以公示为准）",
    "指标到校": "有（70% 计划分配到辖区初中，名额按年公布）",
    "简介": "老牌公办重点，校友资源强；周边陪读租房需求旺盛，两室挂牌约 2,800–4,200 元/月（2026-09 样本）。",
    "数据来源": "校方公示 + 区教委公开信息 · 核验 2026-09-15",
    "暂缺字段": "近三年录取线（官方禁排名炒作，正式版以位次参考替代）",
    "评价": [
      {"badge": "已审核", "text": "作业量反馈适中，晚自习安排规律（2026-08 家长投稿，经双人审核）"},
      {"badge": "争议仲裁", "text": "食堂口味评价两极，已附后厨直播入口供家长自查（争议评价走证据仲裁流程）"}
    ]
  },
  "重庆一中（渝北）": {
    "办学性质": "公办（市级重点）",
    "所在区": "渝北区",
    "招生范围": "指标到校 + 联招（全市）",
    "通勤参考": "轨道 3/10 号线；距江北机场约 30 分钟",
    "住宿": "提供寄宿",
    "收费口径": "公办收费标准；寄宿另计（以公示为准）",
    "指标到校": "有（同上口径）",
    "简介": "两江新区方向家庭常选；通勤便利，寄宿名额相对充足。",
    "数据来源": "校方公示 + 区教委公开信息 · 核验 2026-09-15",
    "暂缺字段": "近三年录取线（同上）",
    "评价": [
      {"badge": "已审核", "text": "社团活动丰富，家长开放日流程清晰（2026-07 家长投稿，经双人审核）"}
    ]
  },
  "巴蜀中学（渝中）": {
    "办学性质": "公办（市级重点）",
    "所在区": "渝中区",
    "招生范围": "指标到校 + 联招（全市）",
    "通勤参考": "轨道 2 号线；黄花园大桥侧",
    "住宿": "寄宿限额",
    "收费口径": "公办收费标准（以公示为准）",
    "指标到校": "有（同上口径）",
    "简介": "核心城区老牌名校；周边房源紧张，换租季需提前 1–2 个月准备（陪读房行情见表）。",
    "数据来源": "校方公示 + 区教委公开信息 · 核验 2026-09-15",
    "暂缺字段": "近三年录取线（同上）",
    "评价": [
      {"badge": "已审核", "text": "信息发布渠道规范，通知及时（2026-08 家长投稿，经双人审核）"}
    ]
  },
  "重庆八中（渝北）": {
    "办学性质": "公办（市级重点）",
    "所在区": "渝北区",
    "招生范围": "指标到校 + 联招（全市）",
    "通勤参考": "轨道 3 号线沿线；距中央公园片区约 15 分钟",
    "住宿": "提供寄宿",
    "收费口径": "公办收费标准；寄宿另计（以公示为准）",
    "指标到校": "有（同上口径）",
    "简介": "近年口碑上升明显；渝北片区陪读房供给相对充足。",
    "数据来源": "校方公示 + 区教委公开信息 · 核验 2026-09-15",
    "暂缺字段": "近三年录取线（同上）",
    "评价": [
      {"badge": "已审核", "text": "入学材料审核流程透明，公众号更新稳定（2026-08 家长投稿，经双人审核）"}
    ]
  },
  "育才中学（九龙坡）": {
    "办学性质": "公办（市级重点）",
    "所在区": "九龙坡区",
    "招生范围": "指标到校 + 联招（全区）",
    "通勤参考": "轨道 2 号线大坪方向；谢家湾片区",
    "住宿": "部分寄宿",
    "收费口径": "公办收费标准（以公示为准）",
    "指标到校": "有（同上口径）",
    "简介": "九龙坡方向家庭关注度高；周边生活配套成熟，租房性价比相对较高。",
    "数据来源": "校方公示 + 区教委公开信息 · 核验 2026-09-15",
    "暂缺字段": "近三年录取线（同上）",
    "评价": [
      {"badge": "已审核", "text": "寄宿管理制度清晰，家长探访安排人性化（2026-07 家长投稿，经双人审核）"}
    ]
  },
  "西大附中（北碚）": {
    "办学性质": "公办（市级重点）",
    "所在区": "北碚区",
    "招生范围": "指标到校 + 联招（全市）",
    "通勤参考": "轨道 6 号线；北碚城区",
    "住宿": "提供寄宿",
    "收费口径": "公办收费标准；寄宿另计（以公示为准）",
    "指标到校": "有（同上口径）",
    "简介": "大学城方向常选；校园环境评价高，寄宿比例大。",
    "数据来源": "校方公示 + 区教委公开信息 · 核验 2026-09-15",
    "暂缺字段": "近三年录取线（同上）",
    "评价": [
      {"badge": "已审核", "text": "社团与研学活动组织有序（2026-08 家长投稿，经双人审核）"}
    ]
  }
};
var ROWS = ["办学性质","所在区","招生范围","通勤参考","住宿","收费口径","指标到校","数据来源","暂缺字段"];

function esc(s){ return String(s).replace(/[&<>"]/g, function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }
var _toastTimer = null;
function toast(msg){
  var t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  if(_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function(){ t.classList.remove('show'); }, 2200);
}

var cmpLast = null, cmpDiffOnly = false;
function runCompare(){
  var a=document.getElementById("sel-a").value,
      b=document.getElementById("sel-b").value,
      c=document.getElementById("sel-c").value;
  var picks=[a,b,c].filter(function(x){return x;});
  var uniq=picks.filter(function(x,i){return picks.indexOf(x)===i;});
  var box=document.getElementById("cmp-result");
  if(uniq.length<2){
    cmpLast = null; cmpDiffOnly = false;
    var dbtn = document.getElementById("btn-diff");
    if(dbtn){ dbtn.classList.remove('on'); dbtn.setAttribute('aria-pressed','false'); dbtn.textContent = '仅看差异'; }
    box.innerHTML='<div class="cmp-empty">请至少选择 2 所不同的学校（重复选择已自动去重）。</div>';
    return;
  }
  cmpLast = {
    schools: uniq,
    rows: ROWS.map(function(row){
      var vals = uniq.map(function(name){ var d = SCHOOL_DB[name]; return (d && d[row]) || "暂缺"; });
      var diff = false;
      for(var i=1;i<vals.length;i++){ if(vals[i] !== vals[0]){ diff = true; break; } }
      return { row: row, vals: vals, diff: diff };
    })
  };
  cmpDiffOnly = false;
  renderCompareTable();
}
function renderCompareTable(){
  var box = document.getElementById("cmp-result"); if(!box || !cmpLast) return;
  var rows = cmpLast.rows, shown = cmpDiffOnly ? rows.filter(function(r){ return r.diff; }) : rows;
  var diffCount = rows.filter(function(r){ return r.diff; }).length;
  var html='<table class="cmp-table"><tr><th>对比维度</th>';
  cmpLast.schools.forEach(function(name){ html+='<th>'+esc(name)+'</th>'; });
  html+='</tr>';
  shown.forEach(function(r){
    html+='<tr class="'+(r.diff?'cmp-diff':'')+'"><td>'+esc(r.row)+(r.diff?'<span class="cmp-dot" title="该维度各校存在差异">●</span>':'')+'</td>';
    r.vals.forEach(function(v){ html+='<td>'+esc(v)+'</td>'; });
    html+='</tr>';
  });
  html+='</table>';
  html+='<p class="cmp-note" style="margin-top:12px">'
    + (cmpDiffOnly
        ? '仅看差异：共显示 ' + shown.length + ' 个维度（另有 ' + (rows.length - shown.length) + ' 个各校一致的维度已折叠）。'
        : '差异标记：<span class="cmp-dot">●</span> 表示该维度各校存在差异（共 ' + diffCount + ' 项）。')
    + '口径说明：「录取线/排名」类字段按合规红线不提供（教育部门明令禁止排名炒作）；数据缺失如实标注。正式版每字段附核验日期与来源链接，可一键生成对比图分享到家庭群。</p>';
  box.innerHTML=html;
  var btn = document.getElementById("btn-diff");
  if(btn){ btn.classList.toggle('on', cmpDiffOnly); btn.setAttribute('aria-pressed', String(cmpDiffOnly)); btn.textContent = cmpDiffOnly ? '显示全部维度' : '仅看差异'; }
}
function toggleDiffOnly(){
  if(!cmpLast){ toast('先生成对比，再筛选差异'); return; }
  cmpDiffOnly = !cmpDiffOnly;
  renderCompareTable();
  toast(cmpDiffOnly ? '已折叠各校一致的维度' : '已显示全部维度');
}
