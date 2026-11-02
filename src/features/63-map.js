/* ---------- v0.96 学校地图（schools 页）：主城九区示意底图 + 区县联动 + 高德外链 ----------
   说明：示意图为方位示意（非行政区划精确边界）；精确位置用「高德」按校名+地址查询，不造坐标。 */
var MAP_BLOBS = [
  { q: '北碚区', x: 70, y: 40, w: 120, h: 62 },
  { q: '渝北区', x: 230, y: 36, w: 150, h: 66 },
  { q: '沙坪坝区', x: 90, y: 130, w: 130, h: 62 },
  { q: '江北区', x: 250, y: 128, w: 110, h: 56 },
  { q: '渝中区', x: 285, y: 200, w: 84, h: 44 },
  { q: '九龙坡区', x: 120, y: 216, w: 130, h: 60 },
  { q: '大渡口区', x: 150, y: 292, w: 104, h: 52 },
  { q: '南岸区', x: 300, y: 262, w: 118, h: 58 },
  { q: '巴南区', x: 230, y: 348, w: 150, h: 62 }
];
function mapCount(q){
  var n = 0;
  Object.keys(SCHOOL_DB).forEach(function(k){ if((SCHOOL_DB[k]['所在区'] || '') === q) n++; });
  return n;
}
function mapRender(){
  var box = document.getElementById('school-map');
  if(!box) return;
  var W = 520, H = 440;
  var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="主城九区学校分布示意图（方位示意，点击区县筛选）" style="width:100%;height:auto;display:block">';
  svg += '<text x="14" y="20" class="dx-tnote" style="font-size:11px">方位示意（非行政边界）· 点击区县筛选下方名单</text>';
  MAP_BLOBS.forEach(function(bl){
    var n = mapCount(bl.q);
    svg += '<g class="mq-blob" data-qu="' + bl.q + '" onclick="pickDistrict(\'' + bl.q + '\')" role="button" tabindex="0">'
      + '<rect x="' + bl.x + '" y="' + bl.y + '" width="' + bl.w + '" height="' + bl.h + '" rx="14"/>'
      + '<text x="' + (bl.x + bl.w / 2) + '" y="' + (bl.y + bl.h / 2 - 4) + '" text-anchor="middle" class="mq-name">' + bl.q.replace('区', '') + '</text>'
      + '<text x="' + (bl.x + bl.w / 2) + '" y="' + (bl.y + bl.h / 2 + 14) + '" text-anchor="middle" class="mq-n">' + n + ' 所</text>'
      + '<title>' + bl.q + '：' + n + ' 所档案（点击筛选）</title></g>';
  });
  svg += '</svg>';
  var cur = (schoolRegion && schoolRegion !== 'all') ? schoolRegion : '渝中区';
  var list = Object.keys(SCHOOL_DB).filter(function(k){ return (SCHOOL_DB[k]['所在区'] || '') === cur; }).sort();
  var lis = list.map(function(k){
    var addr = SCHOOL_DB[k]['校区地址'] || SCHOOL_DB[k]['所在区'];
    var q = encodeURIComponent(k + ' ' + addr);
    return '<li><span class="mq-s">' + esc(k) + '</span><a class="mq-amap" href="https://ditu.amap.com/search?query=' + q + '" target="_blank" rel="noopener">高德 ↗</a></li>';
  }).join('');
  box.innerHTML = '<div class="mq-flex"><div class="mq-svgwrap">' + svg + '</div>'
    + '<div class="mq-listwrap"><p class="dx-count"><b>' + esc(cur) + '</b> 档案 ' + list.length + ' 所 · 点图切换区县</p><ul class="mq-list">' + (lis || '<em>该区暂无档案</em>') + '</ul>'
    + '<p class="dx-tnote">精确位置请点「高德」按校名＋地址查询；通勤建议早晚高峰实测（对比器清单有完整项）。</p></div></div>';
}

/* v0.99：03.3 地图页与 03.1 列表页已拆开——本页没有 #school-grid：
   有 grid 就本页筛选并滚过去，没有就带着区县跳回 03.1（列表页会读 ?qu= 复原筛选）。 */
function pickDistrict(q){
  var g = document.getElementById('school-grid');
  if(g){ filterSchoolsRegion(q); g.scrollIntoView({behavior:'smooth'}); return; }
  location.href = 'schools.html?qu=' + encodeURIComponent(q);
}
