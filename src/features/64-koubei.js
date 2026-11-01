/* ---------- v0.99 各区口碑小学参考名单 + 市级示范小学历批名单（schools 页） ----------
   数据：64-koubei-data.js（三源融合：研究员采集 + 来源升级 + 示范批次官方名单）。
   红线：示范名单为官方历史评定（仅名单不排名）；口碑为民间口径分层标注、不排位次。 */
function kbCn(n){ return ['一','二','三','四','五'][n - 1] || n; }
function kbRender(){
  var box = document.getElementById('koubei-list');
  if(!box || typeof KOUBEI === 'undefined') return;
  /* A. 官方示范批次 */
  var secA = '<h4 class="kb-sub">A · 市级示范小学 · 历批评定名单（官方历史口径）</h4>'
    + (KOUBEI.demo || []).map(function(d){
      return '<div class="kb-qu"><b class="kb-qt">' + esc(d.label) + '</b><div class="kb-list">'
        + d.items.map(function(it){
          return '<div class="kb-row"><span class="kb-n">' + esc(it.name) + '</span><span class="kb-f">' + esc(it.qu) + '</span></div>';
        }).join('') + '</div></div>';
    }).join('')
    + '<p class="dx-tnote">名单出处：' + esc(KOUBEI.demoSrc.o) + '（<a class="art-link" href="' + esc(KOUBEI.demoSrc.u) + '" target="_blank" rel="noopener">原文 ↗</a>）。示范评定为历史口径，部分校名沿用历史称呼（如渝中区第一/第二实验小学、铜梁县实验小学）；名单仅陈述评定事实，不构成择校建议。</p>';
  /* B. 各区口碑参考（含示范徽标） */
  var byq = {};
  KOUBEI.items.forEach(function(it){
    var q = it.qu || '其他';
    (byq[q] = byq[q] || []).push(it);
  });
  var qs = Object.keys(byq).sort();
  var LV = { '官方': 'ok', '媒体': 'ok', '社区': 'pend' };
  var secB = qs.map(function(q){
    var its = byq[q].sort(function(a, b){ return a.name < b.name ? -1 : 1; });
    return '<div class="kb-qu"><b class="kb-qt">' + esc(q) + '（' + its.length + '）</b><div class="kb-list">'
      + its.map(function(it){
        var lv = (it.level || '社区');
        var lc = LV[lv] === 'ok' ? 'ok' : 'pend';
        var m = String(it.src).match(/(https?:\/\/\S+?)(?:\s|$)/);
        return '<div class="kb-row"><span class="kb-n">' + esc(it.name) + '</span>'
          + (it.demo ? '<span class="pq-st st-ok">示范·第' + kbCn(it.demo) + '批</span>' : '')
          + '<span class="pq-st st-' + lc + '">【' + esc(lv) + '】</span>'
          + (it.feat ? '<span class="kb-f">' + esc(it.feat) + '</span>' : '')
          + (m ? '<a class="mq-amap" href="' + esc(m[1]) + '" target="_blank" rel="noopener">依据 ↗</a>' : '')
          + '</div>';
      }).join('') + '</div></div>';
  }).join('');
  box.innerHTML = '<div class="cmp-note" style="margin-bottom:12px"><b>使用须知</b>　示范名单为官方历史评定（仅名单、不排名）；口碑参考为<b>民间口径</b>：非官方评价、不排位次、不构成择校承诺。来源三级——【官方】【媒体】可溯源、【社区】仅参考。</div>'
    + secA + '<h4 class="kb-sub" style="margin-top:18px">B · 各区口碑参考名单（民间口径 · 不排位次）</h4>' + secB
    + '<p class="dx-tnote">名单为编辑部采集整理（2026-10-31/11-01），逐校标注来源；『仅参考』的社区口径请自行甄别。遗漏或异议走<a href="contact.html" style="color:var(--accent)">纠错通道</a>。</p>';
}
