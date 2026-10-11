/* ---------- v0.37：实景照片系统（校园实景素材） ---------- */
/* v0.53：照片去重 —— 用满照片池，按条目确定性分配，同页不重复
   ponytail: 池 28 张，同页超过 28 个图位才会回绕；扩容只需往 PHOTO_POOL 加文件名 */
var PHOTO_BASE = 'assets/photos/';
var PHOTO_FILES = {
  gate1:'school-gate-1.jpg', gate2:'school-gate-2.jpg', building:'school-building.jpg',
  panorama:'school-panorama.jpg', playground:'school-playground.jpg', library:'school-library.jpg',
  courtyard:'school-courtyard.jpg', students:'school-students.jpg',
  study:'study-desk.jpg', classroom:'classroom.jpg', office:'office-docs.jpg',
  calendar:'calendar-desk.jpg', city:'city-scape.jpg'
};
/* 全部可用照片（含此前未被引用的 15 张，避免同一张反复出现） */
var PHOTO_POOL = [
  'school-gate-1.jpg','school-gate-2.jpg','school-gate-3.jpg','school-gate-4.jpg',
  'school-gate-5.jpg','school-gate-6.jpg','school-gate-7.jpg',
  'school-building.jpg','school-building-2.jpg','school-building-3.jpg','school-building-4.jpg',
  'school-panorama.jpg','school-playground.jpg','school-library.jpg','school-courtyard.jpg',
  'school-students.jpg','school-hill.jpg','school-river.jpg','school-plaza.jpg',
  'school-gym.jpg','school-arts.jpg','school-science.jpg','school-culture.jpg',
  'study-desk.jpg','classroom.jpg','office-docs.jpg','calendar-desk.jpg','city-scape.jpg'
];
function photoURL(key){ return PHOTO_BASE + (PHOTO_FILES[key] || PHOTO_FILES.city); }
function photoImg(key, eager, alt){
  return '<img ' + (eager ? '' : 'loading="lazy" ') + 'decoding="async" src="' + photoURL(key) + '" alt="' + (alt || '') + '">';
}
/* 同页已用照片（渲染前 reset，保证一页之内不出现重复照片） */
var _usedPhoto = {};
function resetPhotoUsage(){ _usedPhoto = {}; }
function _seedNum(s){
  var h = 5381, i = s.length;
  while(i){ h = ((h * 33) ^ s.charCodeAt(--i)) >>> 0; }
  return h;
}
/* 按条目种子取照片：确定性（同一条目恒为同一张）+ 同页唯一（冲突向后线性探测） */
function photoURLForItem(seed){
  var n = PHOTO_POOL.length, start = _seedNum(String(seed || '')) % n, i;
  for(i = 0; i < n; i++){
    var f = PHOTO_POOL[(start + i) % n];
    if(!_usedPhoto[f]){ _usedPhoto[f] = 1; return PHOTO_BASE + f; }
  }
  return PHOTO_BASE + PHOTO_POOL[start];   // 池耗尽（>28 个图位）才回绕
}
function photoItemImg(seed, eager, alt){
  return '<img ' + (eager ? '' : 'loading="lazy" ') + 'decoding="async" src="' + photoURLForItem(seed) + '" alt="' + (alt || '') + '">';
}
/* 学校→照片：一校一图固定映射（SCHOOL_PHOTOS 由构建注入，与 article_gen.py 同源）
   ⚠️ 已复核：20 校实拍一一对应，勿改 */
var SCHOOL_PHOTO_KEYS = ['gate1','gate2','building','playground','library','courtyard','students','panorama'];
function schoolPhotoKey(name){
  var h = 0;
  for (var i = 0; i < name.length; i++){ h += name.charCodeAt(i); }
  return SCHOOL_PHOTO_KEYS[((h * 7) + name.length) % SCHOOL_PHOTO_KEYS.length];
}
function schoolPhotoFile(name){
  if (typeof SCHOOL_PHOTOS !== 'undefined' && SCHOOL_PHOTOS[name]) return SCHOOL_PHOTOS[name];
  return PHOTO_FILES[schoolPhotoKey(name)];
}
function schoolPhotoImg(name){
  return '<img loading="lazy" decoding="async" src="' + PHOTO_BASE + schoolPhotoFile(name) + '" alt="' + esc(name) + '校园外观示意图（非实拍）">';
}
/* hero / 入口卡 / 页眉横幅：各类固定不同照片；仅 hero 记入已用集合（它是同页最大图，列表须避让） */
var ART_PHOTO = {
  'hero':'school-students.jpg', 'policy':'office-docs.jpg', 'schools':'school-panorama.jpg',
  'fact':'school-culture.jpg',
  'banner-policy':'school-plaza.jpg', 'banner-faq':'school-library.jpg'
};
function artPhotoURL(kind){
  var f = ART_PHOTO[kind];
  if(!f) return '';
  if(kind === 'hero') _usedPhoto[f] = 1;   // 只预留 hero：剩 27 张足够首屏 24 条封面全不重复
  return PHOTO_BASE + f;
}
