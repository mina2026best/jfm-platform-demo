/* ---------- v0.3：会员开通演示 ---------- */
var ORDER_N = 0;
function openOrder(name, price, beans){
  document.getElementById('om-title').textContent = '开通演示 · ' + name + (price ? '（¥' + price + '/年）' : '（免费）');
  document.getElementById('om-form').hidden = false;
  document.getElementById('om-done').hidden = true;
  document.getElementById('om-agree').checked = false;
  document.getElementById('om-auto').checked = false;
  document.getElementById('om-err').style.display = 'none';
  window._omBeans = beans || 0; window._omName = name;
  document.getElementById('order-modal').showModal();
}
function submitOrder(){
  if(!document.getElementById('om-agree').checked){
    document.getElementById('om-err').style.display = 'block'; return;
  }
  ORDER_N++;
  var id = 'DD-20260916-' + String(100 + ORDER_N);
  document.getElementById('om-form').hidden = true;
  var ok = document.getElementById('om-done'); ok.hidden = false;
  ok.innerHTML = '<b>演示订单已创建：</b>' + id + '<br/>权益开通 SLA ≤2h（演示：已即时开通）→ 状态：<b>已交付</b>'
    + (window._omBeans ? '；赠送升学豆 ' + window._omBeans + '（演示）' : '')
    + '。<br/><span class="hint2">合规演示：自动续费默认关闭；退款按未使用天数比例（协议明示）；未交付不确认收入。</span>';
  toast('订单演示成功：' + id);
}
