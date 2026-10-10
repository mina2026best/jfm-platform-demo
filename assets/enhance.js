/* ============================================================
   花期册 · 轻交互增强 v0.64
   - 滚动渐入（IntersectionObserver，尊重 reduced-motion）
   - 首页数字带轻计数动效（可关闭）
   不依赖任何库；无 JS 时页面完全正常。
   ============================================================ */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. 滚动渐入 ---------- */
  var revealEls = document.querySelectorAll(".rv");
  if (revealEls.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("rv-in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("rv-in");
            io.unobserve(en.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- 2. 数字带：进入视口时做一次轻滚动（支持小数与「万/所/%」等单位） ---------- */
  function animateNum(el) {
    var raw = el.getAttribute("data-count");
    if (!raw) return;
    var target = parseFloat(raw);
    if (isNaN(target)) return;
    var decimals = (raw.split(".")[1] || "").length;
    var dur = 900, start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = raw;
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && !reduce && "IntersectionObserver" in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          animateNum(en.target);
          io2.unobserve(en.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { io2.observe(el); });
  }
})();
