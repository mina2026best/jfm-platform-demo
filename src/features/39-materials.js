/* ---------- v0.25：入学材料清单生成器 ---------- */
var MAT_COMMON = [
  '户口簿（原件 + 复印件：首页、户主页、孩子页）',
  '孩子出生医学证明',
  '父母双方身份证（原件 + 复印件）'
];
var MAT_STAGE = {
  '小学一年级': ['预防接种证 + 查验单（开学前完成接种查验）', '《义务教育入学通知书》/ 报名回执（按区流程）'],
  '初中一年级': ['小学毕业学籍证明 / 素质报告册', '《义务教育入学通知书》/ 报名回执（按区流程）'],
  '高中一年级': ['中考准考证 / 成绩单', '录取通知书（报到注册用）']
};
var MAT_HUKOU = {
  '本区户籍': ['户籍地居住证明（房产证或居住材料）'],
  '跨区户籍': ['居住证明（地址须与实际居住一致）', '跨区就读要求材料（按拟入学区当年公告核对）'],
  '随迁（非户籍）': ['居住证（地址与居住一致、在有效期内）', '社保连续缴纳记录或营业执照（按区要求）', '劳动合同 / 就业证明（按区要求）']
};
var MAT_HOUSE = {
  '自有产权房': ['不动产权证（或购房合同 + 契税凭证）'],
  '租赁（备案）': ['房屋租赁合同', '租赁备案证明（部分区要求）'],
  '其他（借住等）': ['实际居住证明（水电气缴费单等，按区要求）']
};
var MAT_EXTRA = [
  '多孩家庭：长幼随学申请材料（如有二孩随学需求）',
  '优抚对象：相关证件（按当年政策办理）',
  '统一建议：所有材料原件 + 复印件各一套、电子扫描件备份'
];
function fmtList(arr){ return arr.map(function(x){ return '<li><span class="ck2"></span>' + esc(x) + '</li>'; }).join(''); }
function genMaterials(){
  var box = document.getElementById('mat-out'); if(!box) return;
  var stage = document.getElementById('mat-stage').value;
  var hk = document.getElementById('mat-hukou').value;
  var house = document.getElementById('mat-house').value;
  window._matResult = '鸡父母平台 · 入学材料清单（演示）\n学段：' + stage + ' · 户籍：' + hk + ' · 住房：' + house + '\n\n【通用】\n- ' + MAT_COMMON.join('\n- ')
    + '\n\n【学段材料（' + stage + '）】\n- ' + MAT_STAGE[stage].join('\n- ')
    + '\n\n【户籍相关（' + hk + '）】\n- ' + MAT_HUKOU[hk].join('\n- ')
    + '\n\n【住房相关（' + house + '）】\n- ' + MAT_HOUSE[house].join('\n- ')
    + '\n\n【如有特殊情况】\n- ' + MAT_EXTRA.join('\n- ')
    + '\n\n（口径：演示条目，以拟入学区当年公告为准；不替代官方清单）';
  box.innerHTML =
    '<h4 class="mat-h">通用材料</h4><ul class="mat-list">' + fmtList(MAT_COMMON) + '</ul>'
    + '<h4 class="mat-h">学段材料（' + esc(stage) + '）</h4><ul class="mat-list">' + fmtList(MAT_STAGE[stage]) + '</ul>'
    + '<h4 class="mat-h">户籍相关（' + esc(hk) + '）</h4><ul class="mat-list">' + fmtList(MAT_HUKOU[hk]) + '</ul>'
    + '<h4 class="mat-h">住房相关（' + esc(house) + '）</h4><ul class="mat-list">' + fmtList(MAT_HOUSE[house]) + '</ul>'
    + '<h4 class="mat-h">如有特殊情况</h4><ul class="mat-list">' + fmtList(MAT_EXTRA) + '</ul>'
    + '<div class="mat-actions"><button class="mini-btn" onclick="copyMaterials()">复制清单</button><button class="mini-btn" onclick="window.print()">打印清单</button><span class="mat-note">演示口径，以拟入学区当年公告为准；不替代官方清单</span></div>';
}
function copyMaterials(){
  if(!window._matResult){ toast('先生成清单'); return; }
  copyText(window._matResult);
}
