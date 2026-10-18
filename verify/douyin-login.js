// 抖音扫码登录：弹出窗口 → 用户扫码 → 登录态存 storageState-douyin.json
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: false, args: ['--disable-gpu', '--lang=zh-CN', '--window-size=500,700'] });
  const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', locale: 'zh-CN', viewport: { width: 480, height: 660 } });
  const p = await ctx.newPage();
  await p.goto('https://www.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  // 触发登录面板
  await p.waitForTimeout(3000);
  try { await p.click('[data-e2e="login-button"]', { timeout: 5000 }); } catch (e) { console.log('登录按钮未找到，可能已显示二维码'); }
  await p.waitForTimeout(2500);
  console.log('等待扫码中……（手机抖音 App 扫描页面二维码；扫码成功后窗口自动进入已登录状态）');
  // 轮询登录态：最多 3 分钟
  for (let i = 0; i < 36; i++) {
    await p.waitForTimeout(5000);
    const st = await p.evaluate(() => ({ btn: !!document.querySelector('[data-e2e="login-button"]'), hasCookie: document.cookie.includes('sessionid') || document.cookie.includes('sid_tt') }));
    if (!st.btn && i > 2) { console.log('✓ 登录面板已关闭（第 ' + (i * 5) + ' 秒）'); break; }
    if (i % 6 === 5) console.log('  …等待中 ' + (i * 5) + 's');
  }
  await p.goto('https://www.douyin.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(4000);
  const final = await p.evaluate(() => ({ btn: !!document.querySelector('[data-e2e="login-button"]'), txt: document.body.innerText.replace(/\s+/g, ' ').slice(0, 80) }));
  console.log('最终验证——登录按钮:', final.btn, '|', final.txt);
  await ctx.storageState({ path: '/Users/agent/.openclaw-autoclaw/agents/auto-designer/workspace/.cluster/jfm-fix/verify/storageState-douyin.json' });
  console.log('✓ 登录态已存 storageState-douyin.json');
  await b.close();
})().catch(e => { console.error('FAIL:', String(e).slice(0, 150)); process.exit(1); });
