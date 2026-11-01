/* ---------- v0.97 各区口碑小学参考名单（schools 页） ----------
   数据：64-koubei-data.js。红线：按区分组、不排位次、来源分层、非官方评价不构成择校承诺。 */
function kbRender(){
  var box = document.getElementById('koubei-list');
  if(!box || typeof KOUBEI === 'undefined') return;
  var byq = {};
  KOUBEI.items.forEach(function(it){
    var q = it.qu || '其他';
    (byq[q] = byq[q] || []).push(it);
  });
  var qs = Object.keys(byq).sort();
  var LV = { '官方': 'ok', '媒体': 'ok', '社区': 'pend' };
  box.innerHTML = '<div class="cmp-note" style="margin-bottom:12px"><b>使用须知</b>　以下为<b>民间口碑参考名单</b>：非官方评价、不排位次、不构成择校承诺；按区分组、区内按校名字序排列。来源分三级——【官方】区教委称号/文件、【媒体】主流媒体报道、【社区】家长社区口径（仅参考）。</div>'
    + qs.map(function(q){
      var items = byq[q].sort(function(a, b){ return a.name < b.name ? -1 : 1; });
      return '<div class="kb-qu"><b class="kb-qt">' + esc(q) + '（' + items.length + '）</b><div class="kb-list">'
        + items.map(function(it){
          var lv = (it.level || '社区');
          var lc = LV[lv] === 'ok' ? 'ok' : 'pend';
          var mu = re_url(it.src);
          return '<div class="kb-row"><span class="kb-n">' + esc(it.name) + '</span>'
            + '<span class="pq-st st-' + lc + '">【' + esc(lv) + '】</span>'
            + (it.feat ? '<span class="kb-f">' + esc(it.feat) + '</span>' : '')
            + (mu ? '<a class="mq-amap" href="' + esc(mu) + '" target="_blank" rel="noopener">依据 ↗</a>' : '')
            + '</div>';
        }).join('') + '</div></div>';
    }).join('')
    + '<p class="dx-tnote">名单为编辑部采集整理（2026-10-31），逐校标注来源；『仅参考』的社区口径请自行甄别。遗漏或异议走<a href="contact.html" style="color:var(--accent)">纠错通道</a>。</p>';
  function re_url(s){
    var m = String(s).match(/(https?:\/\/\S+?)(?:\s|$)/);
    return m ? m[1] : '';
  }
}
