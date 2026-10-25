// 移动端横向溢出诊断：输出 scrollWidth 与违规元素清单
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--disable-gpu'] });
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await p.goto(process.argv[2] || 'https://mina2026best.github.io/jfm-platform-demo/', { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const doc = document.documentElement;
    const off = [];
    document.querySelectorAll('*').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && (el.scrollWidth - el.clientWidth > 4 || rect.right > window.innerWidth + 4)) {
        const cs = getComputedStyle(el);
        off.push({ tag: el.tagName, cls: String(el.className).slice(0, 50), sw: el.scrollWidth, cw: el.clientWidth, right: Math.round(rect.right), ws: cs.whiteSpace, disp: cs.display, minw: cs.minWidth });
      }
    });
    off.sort((a, b) => b.right - a.right);
    return { scrollW: doc.scrollWidth, innerW: window.innerWidth, top: off.slice(0, 12) };
  });
  console.log(JSON.stringify(r, null, 1));
  await b.close();
})();
