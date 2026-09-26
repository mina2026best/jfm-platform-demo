/* ---------- v0.36：插画库 2.0（更丰富的场景层次/渐变/细节/人物） ---------- */
/* 统一规范：宽幅 200x140 场景插画；多层渐变天空 + 地景剪影 + 主体 + 点缀光斑；品牌海军蓝/青绿/暖橙 */
function artSVG2(kind){
  var NAVY='#24344D', NAVY2='#2E4368', TEAL='#0E7C66', TEAL2='#4CC2A3', TEAL3='#7ED9C3',
      ORANGE='#E8A33D', ORANGE2='#F2C879', RED='#D9534F', CREAM='#F7F3EA', INK='#46536B', INK2='#6E7B93';
  var sky = function(id,c1,c2,c3){
    return '<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1">'
      +'<stop offset="0" stop-color="'+c1+'"/><stop offset=".55" stop-color="'+c2+'"/><stop offset="1" stop-color="'+c3+'"/></linearGradient></defs>';
  };
  function wrap(inner){ return '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" focusable="false" style="width:100%;height:100%;display:block">'+inner+'</svg>'; }
  function clouds(y,op){ return '<g opacity="'+op+'"><ellipse cx="34" cy="'+y+'" rx="16" ry="5" fill="#fff"/><ellipse cx="48" cy="'+(y-3)+'" rx="10" ry="4" fill="#fff"/><ellipse cx="150" cy="'+(y+8)+'" rx="13" ry="4.5" fill="#fff"/></g>'; }
  function birds(x,y){ return '<path d="M'+x+' '+y+' q4 -5 8 0 M'+(x+11)+' '+(y-5)+' q4 -5 8 0" stroke="'+INK2+'" stroke-width="1.8" fill="none" stroke-linecap="round"/>'; }
  function person(x,y,scale,color,walk){
    var s = scale||1;
    var leg1 = walk ? 'M'+x+' '+(y+22*s)+' L'+(x-4*s)+' '+(y+40*s) : 'M'+x+' '+(y+22*s)+' L'+(x-2*s)+' '+(y+40*s);
    var leg2 = walk ? 'M'+(x+3*s)+' '+(y+22*s)+' L'+(x+6*s)+' '+(y+40*s) : 'M'+(x+3*s)+' '+(y+22*s)+' L'+(x+4*s)+' '+(y+40*s);
    return '<circle cx="'+x+'" cy="'+(y-6*s)+'" r="'+(5.5*s)+'" fill="'+color+'"/>'
      +'<path d="M'+x+' '+(y)+' q'+(-4*s)+' '+(12*s)+' '+(-1*s)+' '+(22*s)+' l'+(5*s)+' 0 q'+(2*s)+' '+(12*s)+' 0 '+(-22*s)+' Z" fill="'+color+'"/>'
      +'<path d="'+leg1+' M'+(x+3*s)+' '+(y+22*s)+' l'+(2*s)+' '+(18*s)+'" stroke="'+color+'" stroke-width="'+(3.6*s)+'" stroke-linecap="round" fill="none"/>';
  }
  function tree(x,y,r,c){ return '<rect x="'+(x-2)+'" y="'+y+'" width="4" height="'+(r*0.8)+'" fill="'+INK+'"/><circle cx="'+x+'" cy="'+(y-r*0.4)+'" r="'+r+'" fill="'+c+'"/><circle cx="'+(x-r*0.55)+'" cy="'+(y+r*0.1)+'" r="'+(r*0.6)+'" fill="'+c+'" opacity=".85"/><circle cx="'+(x+r*0.55)+'" cy="'+(y)+'" r="'+(r*0.55)+'" fill="'+c+'" opacity=".75"/>'; }
  function school(x,y,w,h,body,roof,door){
    var out = '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="2" fill="'+body+'"/>'
      +'<path d="M'+(x-6)+' '+(y+2)+' L'+(x+w/2)+' '+(y-h*0.42)+' L'+(x+w+6)+' '+(y+2)+' Z" fill="'+roof+'"/>'
      +'<rect x="'+(x+w/2-6)+'" y="'+(y+h-16)+'" width="12" height="16" rx="1.5" fill="'+door+'"/>';
    var winY = y+8, n = Math.floor(w/22);
    for(var i=0;i<n;i++){ out += '<rect x="'+(x+8+i*22)+'" y="'+winY+'" width="9" height="9" rx="1" fill="'+CREAM+'"/>'; }
    out += '<circle cx="'+(x+w/2)+'" cy="'+(y-h*0.42-6)+'" r="2.5" fill="'+ORANGE+'"/>';
    return out;
  }
  var M = {};
  /* ===== 首页主视觉：送学场景 2.0 ===== */
  M['hero'] = wrap(
    sky('h2s','#DCEBF7','#EAF2E9','#F6F1E4')
    + clouds(30,.85) + clouds(58,.6) + birds(24,44) + birds(70,36)
    + '<rect x="0" y="104" width="200" height="36" fill="#DCE8D8"/>'
    + '<path d="M0 104 Q50 98 100 102 T200 100 L200 112 L0 112 Z" fill="#CFE0CB"/>'
    + '<path d="M0 118 L200 114" stroke="#fff" stroke-width="3" stroke-dasharray="8 7" opacity=".9"/>'
    + tree(16,102,13,TEAL) + tree(186,104,11,'#5BAF8F')
    + school(136,58,54,46,TEAL,NAVY,CREAM)
    + '<rect x="160" y="46" width="3" height="10" fill="'+INK+'"/><circle cx="161.5" cy="44" r="3" fill="'+ORANGE+'"/>'
    /* 妈妈 */
    + person(46,62,1.15,NAVY,true)
    + '<path d="M50 72 L62 80" stroke="'+NAVY+'" stroke-width="3.4" stroke-linecap="round"/>'
    /* 孩子+书包 */
    + person(70,72,0.82,TEAL,true)
    + '<rect x="74" y="76" width="8" height="10" rx="2.5" fill="'+ORANGE+'"/>'
    + '<path d="M12 124 h176" stroke="#fff" stroke-width="0"/>'
  );
  /* ===== 政策：文件 + 天平 + 印章 ===== */
  M['policy'] = wrap(
    sky('p2s','#EDF1F8','#E4EAF3','#D9E2EE')
    + '<circle cx="176" cy="22" r="26" fill="#fff" opacity=".45"/>'
    + '<rect x="40" y="26" width="80" height="100" rx="5" fill="#fff" stroke="'+LINE_D()+'"/>'
    + '<rect x="52" y="42" width="46" height="6" rx="3" fill="'+NAVY+'" opacity=".9"/>'
    + '<rect x="52" y="56" width="58" height="4.5" rx="2" fill="#C9D2DE"/>'+
    '<rect x="52" y="67" width="52" height="4.5" rx="2" fill="#C9D2DE"/>'+
    '<rect x="52" y="78" width="56" height="4.5" rx="2" fill="#C9D2DE"/>'+
    '<rect x="52" y="89" width="40" height="4.5" rx="2" fill="#C9D2DE"/>'
    + '<circle cx="112" cy="100" r="12" fill="'+TEAL+'" opacity=".95"/><path d="M106 100 l4.5 4.5 l9 -10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>'
    /* 天平 */
    + '<path d="M156 44 v52 M138 56 h36 M126 96 h44" stroke="'+NAVY+'" stroke-width="4" stroke-linecap="round"/>'
    + '<path d="M132 60 a9 9 0 0 0 12 7 M180 60 a9 9 0 0 1 -12 7" stroke="'+NAVY+'" stroke-width="3" fill="none" stroke-linecap="round"/>'
    + '<circle cx="132" cy="57" r="3.5" fill="'+ORANGE+'"/><circle cx="168" cy="57" r="3.5" fill="'+ORANGE+'"/>'
    + '<rect x="150" y="96" width="12" height="8" rx="2" fill="'+NAVY+'"/>'
  );
  /* ===== 学校：校门场景 ===== */
  M['schools'] = wrap(
    sky('s2s','#E3F0EC','#DCEAE4','#EAF2E6')
    + clouds(26,.8)
    + '<rect x="0" y="106" width="200" height="34" fill="#D5E4D0"/>'
    /* 校门 */
    + '<rect x="36" y="66" width="6" height="44" fill="'+NAVY+'"/><rect x="86" y="66" width="6" height="44" fill="'+NAVY+'"/>'
    + '<path d="M30 68 L64 50 L98 68" stroke="'+NAVY+'" stroke-width="5" fill="none"/>'
    + '<rect x="58" y="52" width="3" height="8" fill="'+INK+'"/><circle cx="59.5" cy="50" r="3" fill="'+RED+'"/>'
    + '<text x="60" y="80" text-anchor="middle" font-size="7" fill="'+NAVY+'" font-weight="bold">校</text>'
    /* 教学楼远景 */
    + school(110,64,62,48,'#5BAF8F',NAVY,CREAM)
    + tree(14,108,12,'#4FA381') + tree(178,110,10,'#5BAF8F')
    /* 两个学生走入 */
    + person(64,80,0.7,TEAL,true) + person(56,82,0.6,ORANGE,true)
  );
  /* ===== 求真：放大镜 + 证物板 ===== */
  M['fact'] = wrap(
    sky('f2s','#FDF4E3','#FAECD2','#F6E2BC')
    + '<circle cx="30" cy="30" r="20" fill="#fff" opacity=".5"/>'
    + '<rect x="34" y="30" width="92" height="72" rx="5" fill="#fff" stroke="'+LINE_D()+'"/>'
    + '<rect x="44" y="42" width="30" height="22" rx="2" fill="'+TEAL2+'" opacity=".75"/>'
    + '<rect x="82" y="42" width="34" height="4.5" rx="2" fill="#C9D2DE"/><rect x="82" y="52" width="30" height="4.5" rx="2" fill="#C9D2DE"/><rect x="44" y="72" width="72" height="4.5" rx="2" fill="#C9D2DE"/><rect x="44" y="82" width="58" height="4.5" rx="2" fill="#C9D2DE"/>'
    + '<circle cx="66" cy="53" r="6" fill="#fff" opacity=".7"/>'
    /* 大放大镜 */
    + '<circle cx="128" cy="72" r="26" fill="#fff" opacity=".55" stroke="'+NAVY+'" stroke-width="6"/>'
    + '<circle cx="128" cy="72" r="26" fill="none" stroke="'+TEAL+'" stroke-width="2" opacity=".6"/>'
    + '<path d="M147 91 L166 110" stroke="'+NAVY+'" stroke-width="9" stroke-linecap="round"/>'
    /* 问号 */
    + '<text x="128" y="82" text-anchor="middle" font-family="Georgia,serif" font-size="30" font-weight="bold" fill="'+ORANGE+'">?</text>'
    + '<circle cx="172" cy="34" r="6" fill="'+RED+'" opacity=".85"/><path d="M169 34 l2.5 2.5 l5 -5.5" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
  );
  /* ===== 新闻：报纸 + 飞讯 ===== */
  M['news'] = wrap(
    sky('n2s','#EDF1F8','#E4EAF3','#DDE4F0')
    + '<circle cx="170" cy="24" r="18" fill="#fff" opacity=".5"/>'
    + '<rect x="38" y="26" width="124" height="92" rx="5" fill="#fff" stroke="'+LINE_D()+'"/>'
    + '<rect x="48" y="36" width="70" height="9" rx="2" fill="'+NAVY+'"/>'
    + '<rect x="124" y="38" width="28" height="5" rx="2" fill="'+ORANGE+'"/>'
    + '<rect x="48" y="54" width="50" height="34" rx="3" fill="url(#n2g)"/>'
    + '<rect x="104" y="54" width="48" height="5" rx="2" fill="#C9D2DE"/><rect x="104" y="64" width="42" height="5" rx="2" fill="#C9D2DE"/><rect x="104" y="74" width="46" height="5" rx="2" fill="#C9D2DE"/><rect x="104" y="84" width="38" height="5" rx="2" fill="#C9D2DE"/>'
    + '<rect x="48" y="96" width="104" height="5" rx="2" fill="#C9D2DE"/><rect x="48" y="106" width="86" height="5" rx="2" fill="#C9D2DE"/>'
    + '<path d="M20 44 q6 -7 12 0 M38 36 q6 -7 12 0 M158 118 q6 -7 12 0" stroke="'+INK2+'" stroke-width="2" fill="none" stroke-linecap="round"/>'
    + birds(150,30)
  ).replace('<svg ', '<svg ');
  function LINE_D(){ return '#C9D2DE'; }
  /* 给 news 的渐变注入 */
  M['news'] = M['news'].replace('<svg viewBox="0 0 200 140"', '<svg viewBox="0 0 200 140" xmlns:xlink="http://www.w3.org/1999/xlink"').replace('<rect x="48" y="54" width="50" height="34" rx="3" fill="url(#n2g)"/>', '<rect x="48" y="54" width="50" height="34" rx="3" fill="'+TEAL2+'" opacity=".8"/>');
  /* ===== 生命/生活：家庭与房屋 ===== */
  M['life'] = wrap(
    sky('l2s','#FDF4E3','#F9EBD0','#F4E0BC')
    + '<circle cx="164" cy="30" r="16" fill="'+ORANGE2+'" opacity=".9"/>'
    + '<rect x="0" y="104" width="200" height="36" fill="#EAD9B8"/>'
    /* 房子 */
    + '<rect x="60" y="58" width="80" height="50" rx="3" fill="#fff" stroke="'+LINE_D()+'"/>'
    + '<path d="M52 60 L100 32 L148 60 Z" fill="'+ORANGE+'"/>'
    + '<rect x="92" y="80" width="16" height="28" fill="'+TEAL+'"/>'
    + '<rect x="70" y="70" width="14" height="12" rx="1" fill="'+CREAM+'"/><rect x="116" y="70" width="14" height="12" rx="1" fill="'+CREAM+'"/>'
    + '<path d="M96 20 v-10" stroke="'+INK2+'" stroke-width="2.5"/><circle cx="96" cy="26" r="6" fill="none" stroke="'+INK2+'" stroke-width="2.5"/>'
    /* 三口人剪影 */
    + person(56,74,0.95,NAVY,true) + person(150,74,0.95,TEAL,true) + person(166,78,0.7,ORANGE,true)
    + tree(20,106,11,'#D9B96E')
  );
  /* ===== 日历/时间：日历翻页 ===== */
  M['calendar'] = wrap(
    sky('c2s','#EEF1F8','#E6EAF4','#DEE3F0')
    + '<circle cx="172" cy="28" r="20" fill="#fff" opacity=".5"/>'
    + '<rect x="46" y="34" width="108" height="84" rx="6" fill="#fff" stroke="'+LINE_D()+'"/>'
    + '<rect x="46" y="34" width="108" height="24" rx="6" fill="'+RED+'" opacity=".92"/>'
    + '<text x="100" y="51" text-anchor="middle" font-size="12" fill="#fff" font-weight="bold" font-family="var(--mono),monospace">SEP 25</text>'
    + '<text x="100" y="88" text-anchor="middle" font-size="30" font-weight="bold" fill="'+NAVY+'" font-family="Georgia,serif">25</text>'
    + '<rect x="72" y="98" width="56" height="4" rx="2" fill="#C9D2DE"/>'
    + '<circle cx="158" cy="104" r="12" fill="'+TEAL+'"/><path d="M152 104 l4 4 l8 -9" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>'
    + '<rect x="56" y="30" width="3" height="10" rx="1.5" fill="'+NAVY+'"/><rect x="140" y="30" width="3" height="10" rx="1.5" fill="'+NAVY+'"/>'
  );
  /* ===== 学堂：师生问答 ===== */
  M['learn'] = wrap(
    sky('le2s','#EAF2F0','#E1EEE9','#D8E7E0')
    + '<rect x="0" y="108" width="200" height="32" fill="#D5E4D0"/>'
    /* 黑板 */
    + '<rect x="40" y="36" width="76" height="50" rx="4" fill="'+NAVY+'"/>'
    + '<rect x="46" y="42" width="64" height="38" rx="2" fill="'+NAVY2+'"/>'
    + '<path d="M54 70 l10 -14 l8 8 l12 -16" stroke="'+TEAL2+'" stroke-width="3" fill="none" stroke-linecap="round"/>'
    + '<text x="98" y="58" text-anchor="middle" font-size="12" fill="'+CREAM+'" font-family="Georgia,serif">A+</text>'
    /* 老师指黑板 */
    + person(136,66,1.05,TEAL,false)
    + '<path d="M132 74 L118 62" stroke="'+TEAL+'" stroke-width="3.2" stroke-linecap="round"/>'
    /* 学生举手 */
    + person(70,84,0.75,ORANGE,false)
    + '<path d="M72 92 L82 82" stroke="'+ORANGE+'" stroke-width="3" stroke-linecap="round"/>'
    + person(58,86,0.7,NAVY,false)
    + tree(182,110,10,'#4FA381')
  );
  /* ===== 百科：书塔路径 ===== */
  M['wiki'] = wrap(
    sky('w2s','#EEF1F8','#E4EAF3','#E8E2F0')
    + '<rect x="30" y="88" width="36" height="12" rx="2" fill="'+NAVY+'"/>'
    + '<rect x="58" y="72" width="36" height="12" rx="2" fill="'+TEAL+'"/>'
    + '<rect x="86" y="56" width="36" height="12" rx="2" fill="'+ORANGE+'"/>'
    + '<rect x="114" y="40" width="36" height="12" rx="2" fill="'+RED+'" opacity=".9"/>'
    + '<path d="M48 84 L76 68 L104 52 L132 36" stroke="'+INK2+'" stroke-width="2" stroke-dasharray="4 4" fill="none"/>'
    + '<circle cx="132" cy="34" r="5" fill="'+TEAL2+'"/>'
    + '<circle cx="30" cy="30" r="14" fill="#fff" opacity=".5"/>'
    + '<text x="52" y="97" text-anchor="middle" font-size="8" fill="#fff" font-weight="bold">小</text>'
    + '<text x="80" y="81" text-anchor="middle" font-size="8" fill="#fff" font-weight="bold">初</text>'
    + '<text x="108" y="65" text-anchor="middle" font-size="8" fill="#fff" font-weight="bold">高</text>'
    + '<text x="136" y="49" text-anchor="middle" font-size="8" fill="#fff" font-weight="bold">大</text>'
    + birds(28,52)
  );
  /* ===== 联系：信封/对话 ===== */
  M['contact'] = wrap(
    sky('ct2s','#EAF2F0','#E1EEE9','#DCE9E2')
    + '<path d="M46 44 h84 a10 10 0 0 1 10 10 v42 a10 10 0 0 1 -10 10 h-56 l-20 18 v-18 h-8 a10 10 0 0 1 -10 -10 v-42 a10 10 0 0 1 10 -10 Z" fill="#fff" stroke="'+LINE_D()+'"/>'
    + '<path d="M40 50 L88 84 L136 50" stroke="'+TEAL+'" stroke-width="3" fill="none"/>'
    + '<circle cx="158" cy="42" r="12" fill="'+ORANGE+'"/><text x="158" y="47" text-anchor="middle" font-size="13" fill="#fff" font-weight="bold">✉</text>'
    + '<circle cx="36" cy="118" r="5" fill="'+TEAL2+'"/><circle cx="172" cy="112" r="4" fill="'+TEAL2+'" opacity=".7"/>'
  );
  return M[kind] || M['news'];
}
function LINE_D(){ return '#C9D2DE'; }
