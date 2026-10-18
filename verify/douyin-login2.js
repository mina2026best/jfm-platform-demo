// 登录验证 v2：显式打开登录面板→等待 cookie 写入 sessionid→storageState
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: false, args: ['--disable-gpu', '--lang=zh-CN'] });
  const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', locale: 'zh-CN', viewport: { width: 520, height: 760 } });
  const p = await ctx.newPage();
  await p.goto('https://www.douyin.com/?recommend=1', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(3000);
  // 点击「登录」文字按钮（右上角）
  const clicked = await p.evaluate(() => {
    const cands = Array.from(document.querySelectorAll('button, [role="button"], a, div')).filter(el => el.textContent.trim() === '登录' && el.offsetParent);
    if (cands.length) { cands[cands.length - 1].click(); return true; }
    return false;
  });
  console.log('点击登录按钮:', clicked);
  await p.waitForTimeout(3000);
  // 等二维码面板
  const hasQR = await p.evaluate(() => !!document.querySelector('[class*=qrcode] img, iframe[src*=qrcode], [id*=qrcode]'));
  console.log('二维码面板:', hasQR);
  console.log('>>> 请用手机抖音 App 扫描窗口中的二维码 <<<');
  // 轮询 sessionid cookie（真实登录完成的标志）
  let ok = false;
  for (let i = 0; i < 60; i++) {
    await p.waitForTimeout(5000);
    const cs = await ctx.cookies('https://www.douyin.com');
    const hasSid = cs.some(c => c.name === 'sessionid' || c.name === 'sessionid_ss');
    if (hasSid) { console.log('✓ sessionid 已写入（' + (i * 5) + ' 秒）'); ok = true; break; }
    if (i % 6 === 5) console.log('  …等待扫码 ' + (i * 5) + 's');
  }
  if (ok) {
    await ctx.storageState({ path: '/Users/agent/.openclaw-autoclaw/agents/auto-designer/workspace/.cluster/jfm-fix/verify/storageState-douyin.json' });
    console.log('✓ storageState 已保存');
  } else {
    console.log('✗ 3 分钟未检测到登录，退出');
  }
  await b.close();
})().catch(e => { console.error('FAIL:', String(e).slice(0, 150)); process.exit(1); });
