/* ---------- v1.08 大字模式 + 移动端快捷条高亮 ---------- */
(function(){
  var KEY='jfm-fs';
  var order=['md','lg','xl'];
  function apply(fs){
    if(order.indexOf(fs)<0) fs='md';
    document.documentElement.setAttribute('data-fs', fs);
    var btns=document.querySelectorAll('.fs-ctl .fs-btn');
    for(var i=0;i<btns.length;i++){
      var on=btns[i].getAttribute('data-fs')===fs;
      btns[i].setAttribute('aria-pressed', on?'true':'false');
      if(on){btns[i].classList.add('on');}else{btns[i].classList.remove('on');}
    }
    try{localStorage.setItem(KEY, fs);}catch(e){}
  }
  var saved='md';
  try{saved=localStorage.getItem(KEY)||'md';}catch(e){}
  apply(saved);
  var ctl=document.querySelector('.fs-ctl');
  if(ctl) ctl.addEventListener('click', function(ev){
    var b=ev.target;
    while(b && b!==ctl && !b.classList.contains('fs-btn')) b=b.parentNode;
    if(b && b.classList && b.classList.contains('fs-btn')) apply(b.getAttribute('data-fs'));
  });
  var qb=document.querySelector('.m-quickbar');
  if(qb){
    var path=(location.pathname.split('/').pop()||'index.html');
    var links=qb.querySelectorAll('a');
    for(var j=0;j<links.length;j++){
      if(links[j].getAttribute('href')===path){
        links[j].setAttribute('aria-current','page');
        links[j].classList.add('cur');
      }
    }
  }
})();
