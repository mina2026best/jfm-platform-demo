/* ---------- v0.8：行动清单打印 ---------- */
function printTodoList(){
  var cards = Array.prototype.slice.call(document.querySelectorAll('#calendar .cal')).filter(function(c){ return c.style.display !== 'none'; });
  if(!cards.length){ toast('当前过滤条件下没有可打印的节点'); return; }
  var k = getKids(), act = getActiveIdx();
  var who = (act >= 0 && k[act]) ? (esc(k[act].nick + '（' + k[act].stage + ' · ' + k[act].qu + '）')) : '全部学段';
  var rows = cards.map(function(c){
    var todo = c.querySelector('.todo div');
    var items = todo ? todo.innerHTML.split(/<br\s*\/?>/i).filter(function(x){ return x.trim(); }) : [];
    return '<h3><span class="p-date">' + esc(c.querySelector('.date').textContent) + '</span>'
      + '<span class="p-stage">' + esc(c.querySelector('.stage').textContent) + '</span> '
      + esc(c.querySelector('h4').textContent) + '</h3>'
      + (items.length ? '<ul>' + items.map(function(x){ return '<li>' + x + '</li>'; }).join('') + '</ul>' : '');
  }).join('');
  var w = window.open('', '_blank');
  if(!w){ toast('浏览器拦截了打印窗口——请允许弹出窗口后重试'); return; }
  w.document.write('<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>升学行动清单 · 鸡父母</title><style>'
    + 'body{font-family:"PingFang SC","Microsoft YaHei",sans-serif;color:#17212E;max-width:720px;margin:32px auto;padding:0 20px;font-size:14px;line-height:1.7}'
    + 'h1{font-family:"Songti SC","Noto Serif SC",serif;font-size:22px;margin:0 0 4px}'
    + '.p-meta{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#6B7683;margin-bottom:18px}'
    + 'h3{font-size:15px;margin:16px 0 4px}'
    + '.p-date{font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#0E7C66;font-weight:700}'
    + '.p-stage{display:inline-block;font-size:10.5px;padding:1px 8px;border-radius:99px;background:#E8F2EF;color:#0E7C66;margin-left:8px}'
    + 'ul{margin:6px 0 0 18px;font-size:12.5px;color:#3C4858}'
    + '.p-foot{margin-top:24px;padding-top:10px;border-top:1px dashed #C9D1D9;font-size:10.5px;color:#6B7683}'
    + '</style></head><body>'
    + '<h1>升学行动清单</h1>'
    + '<div class="p-meta">鸡父母 · 重庆（MVP 演示 v0.8）· 生成于 ' + new Date().toLocaleDateString('zh-CN') + ' · 适用：' + who + ' · 节点 ' + cards.length + ' 条</div>'
    + rows
    + '<div class="p-foot">清单由演示站生成；节点与要求以重庆市教委及各区当年官方发布为准，不承诺升学结果。</div>'
    + '<script>window.onload=function(){setTimeout(function(){window.print()},200)}<\/script></body></html>');
  w.document.close();
}
function favCompare(){
  var u = ['sel-a','sel-b','sel-c'].map(function(id){ return document.getElementById(id).value; }).filter(Boolean)
            .filter(function(x,i,arr){ return arr.indexOf(x) === i; });
  if(!u.length){ toast('先选择学校再收藏'); return; }
  localStorage.setItem('jfm_cmp_fav', JSON.stringify(u));
  renderMeFav(); toast('已收藏本次对比（' + u.length + ' 所）');
}
function renderMeFav(){
  var box = document.getElementById('me-fav'); if(!box) return;
  var u = []; try{ u = JSON.parse(localStorage.getItem('jfm_cmp_fav') || '[]'); }catch(e){}
  if(!u.length){ box.innerHTML = '<div class="empty-mini">还没有收藏对比。到「择校对比」选好学校后点「收藏本次对比」。</div>'; return; }
  box.innerHTML = '<div class="me-item"><span>' + esc(u.join(' · ')) + '</span><button class="mini-btn" onclick="restoreFav()">恢复到对比器</button></div>';
}
function restoreFav(){
  var u = []; try{ u = JSON.parse(localStorage.getItem('jfm_cmp_fav') || '[]'); }catch(e){}
  ['sel-a','sel-b','sel-c'].forEach(function(id, i){ document.getElementById(id).value = u[i] || ''; });
  runCompare();
  document.getElementById('compare').scrollIntoView({behavior:'smooth'});
  toast('已恢复对比并生成');
}
