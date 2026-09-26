/* ---------- v0.31：品牌插画素材库（内联 SVG，零外部依赖） ---------- */
/* 统一风格：2.5D 扁平插画风，品牌海军蓝 #24344D / 青绿 #0E7C66 / 暖橙点缀 #D9534F */
function artSVG(kind){
  var NAVY = '#24344D', TEAL = '#0E7C66', TEAL2 = '#4CC2A3', ORANGE = '#E8A33D', CREAM = '#F4EFE6', INK2 = '#46536B', LINE = '#D8DCE3';
  function svg(inner, vb){
    return '<svg viewBox="' + (vb || '0 0 200 140') + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" focusable="false" style="width:100%;height:100%;display:block">' + inner + '</svg>';
  }
  function grad(id, c1, c2){
    return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs>';
  }
  switch(kind){
    /* 首页主视觉：妈妈牵着孩子走向学校（剪影+路径） */
    case 'hero': return svg(
      grad('hg1', '#2E4368', NAVY) + grad('hg2', TEAL2, TEAL) +
      '<rect x="0" y="112" width="200" height="28" rx="4" fill="url(#hg1)"/>' +
      '<circle cx="168" cy="26" r="14" fill="' + ORANGE + '" opacity=".9"/>' +
      '<path d="M0 96 Q60 78 110 88 T200 84" stroke="' + TEAL2 + '" stroke-width="3" fill="none" opacity=".5"/>' +
      /* 学校 */
      '<rect x="138" y="52" width="52" height="46" rx="3" fill="url(#hg2)"/>' +
      '<path d="M132 54 L164 32 L196 54 Z" fill="' + NAVY + '"/>' +
      '<rect x="158" y="74" width="12" height="24" rx="2" fill="' + CREAM + '"/>' +
      '<rect x="144" y="62" width="9" height="9" rx="1.5" fill="' + CREAM + '"/>' +
      '<rect x="175" y="62" width="9" height="9" rx="1.5" fill="' + CREAM + '"/>' +
      '<circle cx="164" cy="22" r="2.5" fill="' + ORANGE + '"/>' +
      /* 树 */
      '<rect x="112" y="84" width="5" height="16" fill="' + INK2 + '"/>' +
      '<circle cx="114" cy="76" r="11" fill="' + TEAL + '" opacity=".85"/>' +
      /* 妈妈 */
      '<circle cx="52" cy="52" r="7" fill="' + NAVY + '"/>' +
      '<path d="M52 60 Q46 74 50 88 L58 88 Q60 72 56 60 Z" fill="' + NAVY + '"/>' +
      '<path d="M50 88 L46 112 M56 88 L60 112" stroke="' + NAVY + '" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M54 66 L70 78" stroke="' + NAVY + '" stroke-width="3.5" stroke-linecap="round"/>' +
      /* 孩子 + 书包 */
      '<circle cx="76" cy="64" r="5.5" fill="' + TEAL + '"/>' +
      '<path d="M76 70 Q72 80 75 89 L81 89 Q82 78 79 70 Z" fill="' + TEAL + '"/>' +
      '<path d="M74 89 L71 108 M79 89 L82 108" stroke="' + TEAL + '" stroke-width="3.6" stroke-linecap="round"/>' +
      '<rect x="80" y="72" width="8" height="10" rx="2.5" fill="' + ORANGE + '"/>' +
      /* 飞鸟 */
      '<path d="M20 40 q5 -6 10 0 M32 34 q5 -6 10 0" stroke="' + INK2 + '" stroke-width="2" fill="none" stroke-linecap="round"/>'
    );
    /* 入口卡：找政策（文件+印章） */
    case 'policy': return svg(
      grad('pg1', '#EEF2F8', '#DDE5F0') +
      '<rect x="0" y="0" width="200" height="140" fill="url(#pg1)"/>' +
      '<rect x="58" y="24" width="84" height="96" rx="6" fill="#fff" stroke="' + LINE + '"/>' +
      '<rect x="70" y="42" width="52" height="6" rx="3" fill="' + NAVY + '" opacity=".85"/>' +
      '<rect x="70" y="56" width="60" height="5" rx="2.5" fill="' + LINE + '"/>' +
      '<rect x="70" y="68" width="48" height="5" rx="2.5" fill="' + LINE + '"/>' +
      '<rect x="70" y="80" width="56" height="5" rx="2.5" fill="' + LINE + '"/>' +
      '<circle cx="118" cy="98" r="13" fill="' + TEAL + '" opacity=".92"/>' +
      '<path d="M112 98 l4 4 l8 -9" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '<circle cx="70" cy="30" r="9" fill="' + ORANGE + '"/>' +
      '<path d="M66 30 l3 3 l6 -7" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>'
    );
    /* 入口卡：找学校（校舍+放大镜） */
    case 'schools': return svg(
      grad('sg1', '#EAF4F1', '#D8EAE5') +
      '<rect x="0" y="0" width="200" height="140" fill="url(#sg1)"/>' +
      '<rect x="52" y="52" width="64" height="52" rx="4" fill="' + TEAL + '"/>' +
      '<path d="M46 54 L84 30 L122 54 Z" fill="' + NAVY + '"/>' +
      '<rect x="78" y="76" width="12" height="28" rx="2" fill="' + CREAM + '"/>' +
      '<rect x="60" y="64" width="10" height="10" rx="1.5" fill="' + CREAM + '"/>' +
      '<rect x="98" y="64" width="10" height="10" rx="1.5" fill="' + CREAM + '"/>' +
      '<circle cx="84" cy="24" r="2.5" fill="' + ORANGE + '"/>' +
      '<circle cx="134" cy="88" r="20" fill="none" stroke="' + NAVY + '" stroke-width="6"/>' +
      '<path d="M148 102 L164 118" stroke="' + NAVY + '" stroke-width="8" stroke-linecap="round"/>'
    );
    /* 入口卡：问问题（对话气泡+问号） */
    case 'fact': return svg(
      grad('fg1', '#FDF3E4', '#F8E7C8') +
      '<rect x="0" y="0" width="200" height="140" fill="url(#fg1)"/>' +
      '<path d="M42 36 h116 a12 12 0 0 1 12 12 v40 a12 12 0 0 1 -12 12 h-70 l-20 20 v-20 h-26 a12 12 0 0 1 -12 -12 v-40 a12 12 0 0 1 12 -12 Z" fill="#fff" stroke="' + LINE + '"/>' +
      '<text x="100" y="82" text-anchor="middle" font-family="Georgia,serif" font-size="42" font-weight="bold" fill="' + ORANGE + '">?</text>' +
      '<circle cx="70" cy="56" r="5" fill="' + TEAL2 + '"/>' +
      '<circle cx="130" cy="56" r="5" fill="' + TEAL2 + '"/>' +
      '<rect x="74" y="86" width="52" height="5" rx="2.5" fill="' + LINE + '"/>'
    );
    /* 资讯封面：新闻报纸 */
    case 'news': return svg(
      grad('ng1', '#EEF2F8', '#DDE5F0') +
      '<rect x="0" y="0" width="200" height="140" fill="url(#ng1)"/>' +
      '<rect x="46" y="28" width="108" height="84" rx="5" fill="#fff" stroke="' + LINE + '"/>' +
      '<rect x="56" y="38" width="88" height="8" rx="2" fill="' + NAVY + '"/>' +
      '<rect x="56" y="54" width="40" height="30" rx="3" fill="' + TEAL2 + '" opacity=".8"/>' +
      '<rect x="102" y="54" width="42" height="5" rx="2.5" fill="' + LINE + '"/>' +
      '<rect x="102" y="64" width="36" height="5" rx="2.5" fill="' + LINE + '"/>' +
      '<rect x="102" y="74" width="40" height="5" rx="2.5" fill="' + LINE + '"/>' +
      '<rect x="56" y="92" width="88" height="5" rx="2.5" fill="' + LINE + '"/>' +
      '<rect x="56" y="102" width="70" height="5" rx="2.5" fill="' + LINE + '"/>' +
      '<circle cx="150" cy="24" r="8" fill="' + ORANGE + '"/>'
    );
    /* 政策页眉：典籍与天平 */
    case 'banner-policy': return svg(
      grad('bp1', '#2E4368', NAVY) +
      '<rect x="0" y="0" width="200" height="140" fill="url(#bp1)"/>' +
      '<rect x="36" y="46" width="44" height="58" rx="4" fill="#fff" opacity=".92"/>' +
      '<rect x="44" y="58" width="28" height="4" rx="2" fill="' + TEAL2 + '"/>' +
      '<rect x="44" y="68" width="28" height="4" rx="2" fill="' + CREAM + '" opacity=".7"/>' +
      '<rect x="44" y="78" width="20" height="4" rx="2" fill="' + CREAM + '" opacity=".7"/>' +
      '<path d="M118 52 h44 M140 52 v44 M126 96 h28" stroke="' + TEAL2 + '" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M112 60 a10 10 0 0 0 12 8 M168 60 a10 10 0 0 1 -12 8" stroke="' + TEAL2 + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      '<circle cx="112" cy="58" r="4" fill="' + ORANGE + '"/>' +
      '<circle cx="168" cy="58" r="4" fill="' + ORANGE + '"/>' +
      '<circle cx="58" cy="30" r="3" fill="' + ORANGE + '" opacity=".8"/>' +
      '<circle cx="150" cy="26" r="4.5" fill="' + TEAL2 + '" opacity=".6"/>'
    );
    /* FAQ 页眉：问答气泡群 */
    case 'banner-faq': return svg(
      grad('bf1', '#2E4368', NAVY) +
      '<rect x="0" y="0" width="200" height="140" fill="url(#bf1)"/>' +
      '<rect x="28" y="38" width="58" height="36" rx="10" fill="#fff" opacity=".95"/>' +
      '<text x="57" y="64" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="bold" fill="' + TEAL + '">Q</text>' +
      '<rect x="112" y="64" width="60" height="36" rx="10" fill="' + TEAL + '"/>' +
      '<text x="142" y="90" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="bold" fill="#fff">A</text>' +
      '<circle cx="42" cy="96" r="6" fill="' + ORANGE + '"/>' +
      '<circle cx="176" cy="46" r="5" fill="' + TEAL2 + '"/>' +
      '<path d="M86 56 h20" stroke="' + CREAM + '" stroke-width="3" stroke-dasharray="4 5" stroke-linecap="round"/>'
    );
    default: return svg('<circle cx="100" cy="70" r="40" fill="' + TEAL2 + '"/>');
  }
}

/* ---------- v0.36：路由到 2.0 插画库（43-art2.js） ---------- */
(function(){
  var _old = artSVG;
  artSVG = function(kind){
    try{ var v = artSVG2(kind); if(v) return v; }catch(e){}
    return _old(kind);
  };
})();
