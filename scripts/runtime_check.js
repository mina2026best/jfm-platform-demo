#!/usr/bin/env node
/* 全站运行时体检：34 页逐页加载，收集 console 错误、页面异常、失败请求 */
const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--disable-gpu'] });
  const pages = fs.readdirSync(process.cwd()).filter(f => f.endsWith('.html'));
  const report = [];
  for (const p of pages) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    const errs = [], fails = [];
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)); });
    page.on('pageerror', e => errs.push('PAGEERROR: ' + String(e.message).slice(0, 160)));
    page.on('requestfailed', r => { if (r.url().startsWith('http://localhost') || r.url().startsWith('file://')) fails.push(r.url().split('/').pop() + ' (' + (r.failure() || {}).errorText + ')'); });
    await page.goto('http://localhost:8790/' + p, { waitUntil: 'networkidle', timeout: 25000 }).catch(e => errs.push('NAV: ' + e.message.slice(0, 80)));
    await page.waitForTimeout(900);
    report.push({ page: p, errs, fails: fails.slice(0, 4) });
    await ctx.close();
  }
  await b.close();
  let bad = 0;
  for (const r of report) {
    if (r.errs.length || r.fails.length) {
      bad++;
      console.log('■ ' + r.page);
      r.errs.slice(0, 5).forEach(e => console.log('   ERR ' + e));
      r.fails.forEach(f => console.log('   FAIL ' + f));
    }
  }
  console.log(`\n${report.length} 页检查完毕，${bad} 页有异常`);
})();
