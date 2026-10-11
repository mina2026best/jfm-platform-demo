/* ---------- v0.3 会员开通 · v0.81 诚实化改版 ----------
   演示阶段未接入支付通道：不收款、不生成假订单号、不承诺"已交付"。
   用户提交的是「开通意向」，保存在本机浏览器；正式版接入支付后凭此优先开通。 */
function openOrder(name, price, beans){
  var t = document.getElementById('om-title'); if(t) t.textContent = '开通意向 · ' + name + (price ? '（¥' + price + '/年）' : '（免费）');
  var f = document.getElementById('om-form'); if(f) f.hidden = false;
  var d = document.getElementById('om-done'); if(d) d.hidden = true;
  var a = document.getElementById('om-agree'); if(a) a.checked = false;
  var au = document.getElementById('om-auto'); if(au) au.checked = false;
  var e = document.getElementById('om-err'); if(e) e.style.display = 'none';
  window._omBeans = beans || 0; window._omName = name;
  var m = document.getElementById('order-modal'); if(m) m.showModal();
}
function submitOrder(){
  if(!document.getElementById('om-agree').checked){
    document.getElementById('om-err').style.display = 'block'; return;
  }
  var id = 'YY-' + new Date().toISOString().slice(0,10) + '-' + String(Date.now()).slice(-6);
  try{
    var arr = JSON.parse(localStorage.getItem('jfm_order_intents') || '[]');
    arr.unshift({ id: id, plan: window._omName, beans: window._omBeans || 0, auto: document.getElementById('om-auto').checked, date: new Date().toISOString() });
    localStorage.setItem('jfm_order_intents', JSON.stringify(arr));
  }catch(e){}
  document.getElementById('om-form').hidden = true;
  var ok = document.getElementById('om-done'); ok.hidden = false;
  ok.innerHTML = '<b>开通意向已记录：</b>' + id
    + '<br/><span class="hint2">演示阶段未接入支付，本次<b>不会产生任何扣款</b>；意向保存在本机浏览器，正式版上线后凭记录优先开通'
    + (window._omBeans ? '，并预挂升学豆 ' + window._omBeans + ' 权益' : '')
    + '。自动续费默认关闭；退款按未使用天数比例（协议明示）。</span>';
  toast('开通意向已记录（未扣款）：' + id);
  if(typeof jfmTrack === 'function') jfmTrack('order_intent', { plan: window._omName });
}
