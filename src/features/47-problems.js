/* ---------- v0.44：问题反查表（我遇到 X 问题 → 政策/术语/工具组合卡） ---------- */
var PROBLEMS = [
 {
  "q": "孩子明年幼升小，房子刚买，能上对口小学吗？",
  "cat": "入学",
  "policies": [
   "义务教育免试入学：划片就近 + 单校/多校对口"
  ],
  "terms": [
   "三对口",
   "六年一户",
   "学位锁定",
   "划片范围"
  ],
  "tools": [
   [
    "入学材料清单生成器",
    "quiz.html"
   ],
   [
    "升学日历 · 设报名提醒",
    "calendar.html"
   ]
  ],
  "tip": "买房≠立刻有学位：先查该房产是否处于学位锁定/落户年限限制，再对照当年划片范围。"
 },
 {
  "q": "外地户籍，能在重庆读公办小学吗？",
  "cat": "入学",
  "policies": [
   "随迁子女入学：「两为主、两纳入」保障"
  ],
  "terms": [
   "随迁子女",
   "积分入学",
   "统筹安排"
  ],
  "tools": [
   [
    "入学材料清单生成器",
    "quiz.html"
   ]
  ],
  "tip": "居住证 + 就业/社保材料提前半年备齐；热门片区可能统筹安排到附近公办。"
 },
 {
  "q": "想给孩子转学，什么时候能办、影响指标到校吗？",
  "cat": "学籍",
  "policies": [
   "学籍管理：「人籍一致」与转学窗口"
  ],
  "terms": [
   "中途转入",
   "人籍一致",
   "指标资格"
  ],
  "tools": [
   [
    "升学日历 · 学期窗口提醒",
    "calendar.html"
   ]
  ],
  "tip": "转学窗口在学期初；初中段转学可能影响指标到校资格连续性——先向两所学校与区教委确认。"
 },
 {
  "q": "民办初中摇号没摇中，会不会没学上？",
  "cat": "入学",
  "policies": [
   "民办义务教育招生：超计划全部摇号"
  ],
  "terms": [
   "公民同招",
   "摇号",
   "统筹安排"
  ],
  "tools": [
   [
    "政策库 · 摇号条款",
    "policy.html"
   ],
   [
    "求真台 · 摇号传言核验",
    "fact.html"
   ]
  ],
  "tip": "公民同招：摇号未中回公办统筹，双轨准备材料才稳；「花钱买名额」都是诈骗。"
 },
 {
  "q": "初三了，指标到校资格怎么核对？",
  "cat": "中考",
  "policies": [
   "优质高中指标到校招生工作通知"
  ],
  "terms": [
   "指标到校",
   "指标资格",
   "人籍一致"
  ],
  "tools": [
   [
    "入学自查 · 能不能报",
    "quiz.html"
   ],
   [
    "志愿参考 · 位次换算",
    "zy.html"
   ]
  ],
  "tip": "学籍连续 + 人籍一致是前提；向班主任确认校内排序口径，名额分配到校后是校内竞争。"
 },
 {
  "q": "中考志愿怎么填才不浪费分数？",
  "cat": "中考",
  "policies": [
   "2026 年中考政策：联招学校约 113 所",
   "普通高中招生录取：批次设置与征集志愿"
  ],
  "terms": [
   "平行志愿",
   "批次线",
   "征集志愿",
   "位次"
  ],
  "tools": [
   [
    "志愿参考 · 位次换算",
    "zy.html"
   ],
   [
    "择校对比器",
    "compare.html"
   ]
  ],
  "tip": "用位次不用绝对分；批次是顺序不是档次；出分后每天盯征集志愿公告。"
 },
 {
  "q": "家里经济困难，高中有什么资助？",
  "cat": "费用",
  "policies": [
   "高中阶段学生资助：免学费 + 国家助学金"
  ],
  "terms": [
   "生源地助学贷款"
  ],
  "tools": [
   [
    "政策库 · 资助条目原文",
    "policy.html"
   ]
  ],
  "tip": "资助是申请制：向学校提交材料走统一流程；普高与中职各有通道，别不好意思问班主任。"
 },
 {
  "q": "怎么判断校外培训机构靠不靠谱？",
  "cat": "培训",
  "policies": [
   "「双减」与课后服务：作业时长与校外培训边界"
  ],
  "terms": [
   "监管账户",
   "课后服务"
  ],
  "tools": [
   [
    "求真台 · 培训传言核验",
    "fact.html"
   ]
  ],
  "tip": "查办学许可证与收费公示；一次性缴费不超 3 个月或 60 课时，且必须走监管账户。"
 },
 {
  "q": "孩子在学校吃得好不好，家长能监督吗？",
  "cat": "安全",
  "policies": [
   "校园食品安全与营养：家长监督权"
  ],
  "terms": [],
  "tools": [
   [
    "联系与留言 · 提交线索",
    "contact.html"
   ]
  ],
  "tip": "校长负责制 + 陪餐制度；家长有权查后厨直播与食材台账，发现问题逐级反映。"
 },
 {
  "q": "孩子成绩中等，选科怎么选不吃亏？",
  "cat": "高考",
  "policies": [],
  "terms": [
   "强基计划",
   "一分一段",
   "位次"
  ],
  "tools": [
   [
    "志愿参考 · 位次换算",
    "zy.html"
   ],
   [
    "升学百科 · 高考全流程",
    "wiki.html"
   ]
  ],
  "tip": "先定专业大方向再定选科组合；物理+化学覆盖面最广，但要看孩子学科能力分布。"
 }
];

var PROBLEM_CATS = ['all','入学','学籍','中考','费用','培训','安全','高考'];
function renderProblems(){
  var box = document.getElementById('pb-guide'); if(!box) return;
  box.innerHTML = '<div class="pb-cats">' + PROBLEM_CATS.map(function(c){
      return '<button class="ff on" data-bf="' + c + '" onclick="filterProblems(\'' + c + '\')">' + (c==='all' ? '全部（'+PROBLEMS.length+'）' : c+'（'+PROBLEMS.filter(function(p){return p.cat===c;}).length+'）') + '</button>';
    }).join('') + '</div><div class="pb-grid">' + PROBLEMS.map(function(p, i){
    return '<div class="pb-card" data-bcat="' + p.cat + '">'
      + '<div class="pb-q">' + esc(p.q) + '</div>'
      + (p.policies.length ? '<div class="pb-row"><span class="pb-tag">政策</span>' + p.policies.map(function(x){
          var pk = (typeof ARTMAP !== 'undefined') ? ARTMAP['P|' + x] : '';
          return '<a href="' + (pk ? 'articles/' + pk : 'policy.html') + '">' + esc(x) + '</a>';
        }).join('、') + '</div>' : '')
      + (p.terms.length ? '<div class="pb-row"><span class="pb-tag">术语</span>' + p.terms.map(function(x){ return '<a href="policy.html#policy" title="见政策库词典">' + esc(x) + '</a>'; }).join('、') + '</div>' : '')
      + (p.tools.length ? '<div class="pb-row"><span class="pb-tag">工具</span>' + p.tools.map(function(t){ return '<a href="' + t[1] + '">' + esc(t[0]) + ' →</a>'; }).join('、') + '</div>' : '')
      + '<div class="pb-tip">' + esc(p.tip) + '</div></div>';
  }).join('') + '</div>';
}
function filterProblems(cat){
  document.querySelectorAll('.pb-cats .ff').forEach(function(b){
    var on = b.dataset.bf === cat;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', String(on));
  });
  document.querySelectorAll('.pb-card').forEach(function(card){
    card.style.display = (cat === 'all' || card.getAttribute('data-bcat') === cat) ? '' : 'none';
  });
}
