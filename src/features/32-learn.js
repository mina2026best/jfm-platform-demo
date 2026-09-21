/* ---------- v0.12：家长学堂（专家问答 + 过来人经验） ---------- */
var LEARN_QA = [
 {s:'幼升小', q:'要不要提前教拼音和算术？', a:'不建议系统性提前教学。多数小学实行「零起点教学」，抢跑优势通常在两个月内消失，反而容易让孩子开学后注意力下降。更值得投入的是「上学能力」：作息、握笔、表达需求、整理书包。', by:'教育顾问 · 示范'},
 {s:'小升初', q:'指标到校和择校怎么权衡？', a:'先并排看两条路径：指标到校看「学籍连续性 + 校内表现」，择校看目标校招生范围与通勤成本。建议用「升学路径地图」把时间轴并排拉直，再对照孩子实际学籍做选择——不要问「哪个更好」，要问「哪个更适合我家」。', by:'教育顾问 · 示范'},
 {s:'初升高', q:'孩子成绩中等，路径怎么规划？', a:'中等成绩段其实是路径最丰富的区间：普高统招、指标到校（若资格在）、民办、中职职教高考、艺体特长都可以纳入备选。建议逐条核对资格条件，再定主攻方向与保底方案。', by:'教育顾问 · 示范'},
 {s:'高考', q:'志愿「冲稳保」怎么分配？', a:'常见做法是冲 2–3 个、稳 3–4 个、保 1–2 个，具体数量看批次规则与家庭风险承受度。先用「位次换算」做线差参考（演示口径），正式填报以当年一分一段表为准。', by:'教育顾问 · 示范'},
 {s:'家长心理', q:'大考前，家长怎么说话不添乱？', a:'少问「考得怎么样」，多问「今天想吃什么」。把焦虑留在自己这里，把稳定交给孩子。一句示范话术：「不管结果如何，我们都在。」', by:'教育顾问 · 示范'}
];
var LEARN_TIPS = [
 {s:'初升高', q:'陪考三年，我做对了三件事', a:'一是初一就建「重要节点台账」，每条政策都记文号与日期；二是不拿孩子和别人比，只和上周的他比；三是每次大考后开 20 分钟家庭复盘会：只谈事实，不谈情绪。', by:'2026 届家长 · 示范'},
 {s:'初升高', q:'志愿填报：我们家做了三次模拟', a:'一模后粗排、政策公布后细排、正式填报前只微调。三次模拟让我们提前发现了两处明显失误（保底校梯度不够、通勤没算往返），正式填报时只花了半小时。', by:'2025 届家长 · 示范'},
 {s:'陪读生活', q:'租房陪读一年：成本清单与踩坑', a:'省下的通勤时间约 40 分钟/天，但搬家成本、换租溢价、大人通勤变长都是真实成本。建议先短租两个月试住，再决定要不要长租；合同里把「续租涨幅」写清楚。', by:'陪读家长 · 示范'},
 {s:'家长心理', q:'从焦虑到放手：我把家长群取消了置顶', a:'信息要看，但不必随时在线被带着跑。每天固定 20 分钟看整理好的平台信息就够了；剩下的时间还给自己和家人——家长情绪稳，孩子才稳。', by:'2024 届家长 · 示范'}
];
var learnFilter = 'all';
function filterLearn(s){ learnFilter = s; renderLearn(); }
function renderLearn(){
  var qa = document.getElementById('learn-qa'), tips = document.getElementById('learn-tips');
  if(!qa || !tips) return;
  var f = function(x){ return learnFilter === 'all' || x.s === learnFilter; };
  var q = LEARN_QA.filter(f), t = LEARN_TIPS.filter(f);
  qa.innerHTML = q.length
    ? q.map(function(x){ return '<details class="lq"><summary><span class="lq-tag">' + esc(x.s) + '</span>' + esc(x.q) + '</summary><div class="lq-a">' + x.a + '<span class="lq-by">' + esc(x.by) + '</span></div></details>'; }).join('')
    : '<div class="empty-mini">该分类暂无问答——试试其他分类。</div>';
  tips.innerHTML = t.length
    ? t.map(function(x){ return '<details class="lq"><summary><span class="lq-tag gold">' + esc(x.s) + '</span>' + esc(x.q) + '</summary><div class="lq-a">' + x.a + '<span class="lq-by">' + esc(x.by) + '</span></div></details>'; }).join('')
    : '<div class="empty-mini">该分类暂无经验分享——试试其他分类。</div>';
  document.querySelectorAll('#learn-filter .ff').forEach(function(b){ b.classList.toggle('on', b.dataset.ls === learnFilter); });
}
