/* ---------- v0.22：陪读成本速算器 ---------- */
var LT_RENT = {
  '沙坪坝 · 南开周边': { '一室': [1800, 2700], '两室': [2800, 4200] },
  '渝北 · 一中周边': { '一室': [1600, 2500], '两室': [2500, 3800] },
  '渝中 · 巴蜀周边': { '一室': [2000, 3000], '两室': [3000, 4500] },
  '南岸 · 十一中周边': { '一室': [1500, 2300], '两室': [2200, 3400] },
  '江北 · 十八中周边': { '一室': [1600, 2400], '两室': [2400, 3600] }
};
var LT_LIFE = { '简省': [1200, 1800], '常规': [1800, 2600], '宽裕': [2600, 3800] };
var LT_COMMUTE = { '步行/骑行': [0, 100], '轨道/公交': [150, 300], '自驾': [500, 900] };
function ltNum(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function calcLifeCost(){
  var area = document.getElementById('lt-area').value;
  var room = document.getElementById('lt-room').value;
  var life = document.getElementById('lt-life').value;
  var com  = document.getElementById('lt-commute').value;
  var out = document.getElementById('lt-out'); if(!out) return;
  var r = LT_RENT[area] && LT_RENT[area][room];
  if(!r){ toast('请选择片区'); return; }
  var l = LT_LIFE[life], c = LT_COMMUTE[com];
  var lo = r[0] + l[0] + c[0], hi = r[1] + l[1] + c[1];
  window._ltResult = '鸡父母平台 · 陪读成本估算（演示）\n片区：' + area + ' · ' + room + '\n房租：' + ltNum(r[0]) + '–' + ltNum(r[1]) + ' 元/月\n生活（' + life + '档）：' + ltNum(l[0]) + '–' + ltNum(l[1]) + ' 元/月\n通勤（' + com + '）：' + ltNum(c[0]) + '–' + ltNum(c[1]) + ' 元/月\n合计约 ' + ltNum(lo) + '–' + ltNum(hi) + ' 元/月\n（不含学费与培训费用；口径为样本演示）';
  out.innerHTML = '<div class="lt-total">每月合计约 <b>' + ltNum(lo) + '–' + ltNum(hi) + ' 元</b>（不含学费与培训）</div>'
    + '<div class="lt-detail"><span>房租：' + ltNum(r[0]) + '–' + ltNum(r[1]) + ' 元</span><span>生活（' + life + '）：' + ltNum(l[0]) + '–' + ltNum(l[1]) + ' 元</span><span>通勤（' + com + '）：' + ltNum(c[0]) + '–' + ltNum(c[1]) + ' 元</span></div>'
    + '<div class="lt-actions"><button class="mini-btn" onclick="copyLifeCost()">复制结果</button></div>';
}
function copyLifeCost(){
  if(!window._ltResult){ toast('先做一次估算'); return; }
  copyText(window._ltResult);
}
