/* ---------- v0.37：实景照片系统（校园实景素材） ---------- */
var PHOTO_BASE = 'assets/photos/';
var PHOTO_FILES = {
  gate1:'school-gate-1.jpg', gate2:'school-gate-2.jpg', building:'school-building.jpg',
  panorama:'school-panorama.jpg', playground:'school-playground.jpg', library:'school-library.jpg',
  courtyard:'school-courtyard.jpg', students:'school-students.jpg',
  study:'study-desk.jpg', classroom:'classroom.jpg', office:'office-docs.jpg',
  calendar:'calendar-desk.jpg', city:'city-scape.jpg'
};
function photoURL(key){ return PHOTO_BASE + (PHOTO_FILES[key] || PHOTO_FILES.city); }
function photoImg(key, eager){
  return '<img ' + (eager ? '' : 'loading="lazy" ') + 'decoding="async" src="' + photoURL(key) + '" alt="">';
}
/* 学校→照片：确定性分配（与 article_gen.py 同公式，保证卡片与详情页一致） */
var SCHOOL_PHOTO_KEYS = ['gate1','gate2','building','playground','library','courtyard','students','panorama'];
function schoolPhotoKey(name){
  var h = 0;
  for (var i = 0; i < name.length; i++){ h += name.charCodeAt(i); }
  return SCHOOL_PHOTO_KEYS[((h * 7) + name.length) % SCHOOL_PHOTO_KEYS.length];
}
/* 插画 kind → 实景照片（hero / 入口卡 / 页眉横幅） */
var ART_PHOTO = {
  'hero':'gate1', 'policy':'office', 'schools':'building', 'fact':'study',
  'banner-policy':'office', 'banner-faq':'classroom'
};
