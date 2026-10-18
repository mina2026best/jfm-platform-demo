// 抖音站内直采实测：搜索页 + 主页作品列表（精准选择器，区分作品区与推荐流）
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--disable-gpu', '--lang=zh-CN'] });
  const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', locale: 'zh-CN', viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();

  // ===== 测试 1：站内搜索（通用结果页，非 user 类型）=====
  console.log('===== 测试1：站内搜索「校园逛逛君」 =====');
  try {
    await p.goto('https://www.douyin.com/search/' + encodeURIComponent('校园逛逛君'), { waitUntil: 'domcontentloaded', timeout: 30000 });
    await p.waitForTimeout(6000);
    const s = await p.evaluate(() => {
      // 登录墙检测
      const wall = !!document.querySelector('[class*=login-mask], #login-pannel:not([style*="display: none"])');
      // 搜索结果卡片：抖音搜索结果通常是 li 或 div[data-e2e="scroll-list"] 内
      const items = [];
      document.querySelectorAll('[data-e2e="scroll-list"] > li, [class*=search-result] li, li[class*=search]').forEach(li => {
        const a = li.querySelector('a[href*="/video/"], a[href*="/note/"], a[href*="/user/"]');
        const txt = (li.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 80);
        if (a) items.push({ href: a.href.split('?')[0].replace('https://www.douyin.com', ''), text: txt });
      });
      // RENDER_DATA SSR
      let ssr = '';
      for (const sc of document.querySelectorAll('script#RENDER_DATA, script[id*=RENDER]')) {
        if (sc.textContent && sc.textContent.length > 1000) { ssr = sc.textContent.slice(0, 200); break; }
      }
      return { wall, items: items.slice(0, 10), ssr: ssr || '(无)', bodyLen: document.body.innerText.length };
    });
    console.log('登录墙:', s.wall, '| 结果卡片:', s.items.length, '| bodyLen:', s.bodyLen, '| SSR:', s.ssr.slice(0, 60));
    s.items.forEach(it => console.log('  →', it.href.slice(0, 40), '|', it.text.slice(0, 60)));
  } catch (e) { console.log('搜索页 EXC:', String(e).slice(0, 80)); }

  // ===== 测试 2：主页作品列表（scoped 选择器）=====
  console.log('\n===== 测试2：逛逛君主页作品列表 =====');
  // 先搜索定位主页 URL（用刚才搜索结果里的 user 链接；没有就跳过用已知 ID 结构）
  try {
    await p.goto('https://www.douyin.com/search/' + encodeURIComponent('校园逛逛君') + '?type=user', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await p.waitForTimeout(5000);
    const userLink = await p.evaluate(() => {
      const a = document.querySelector('a[href*="/user/MS4w"], a[href*="/user/"]');
      return a ? a.href.split('?')[0] : '';
    });
    console.log('主页 URL:', userLink || '(搜索结果无 user 链接——登录墙)');
    if (userLink) {
      await p.goto(userLink, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await p.waitForTimeout(6000);
      const prof = await p.evaluate(() => {
        // 作品区容器：data-e2e="user-post-list" 或类似；排除 footer
        const sel = ['[data-e2e="user-post-list"] a[href]', '[data-e2e="user-post"] a[href]', 'ul[class*=video-list] a[href]'];
        let works = [];
        for (const s of sel) {
          document.querySelectorAll(s).forEach(a => {
            const h = a.href.split('?')[0];
            if (/\/(video|note|shipin)\/\d+/.test(h)) works.push({ href: h.replace('https://www.douyin.com', ''), text: (a.innerText || '').trim().slice(0, 50) });
          });
          if (works.length) break;
        }
        // 页面头部信息（粉丝/获赞在 SSR 或 meta）
        const meta = document.querySelector('meta[name="description"]');
        return { works: works.slice(0, 12), meta: meta ? meta.content.slice(0, 100) : '' };
      });
      console.log('作品区链接数:', prof.works.length, '| 页面meta:', prof.meta);
      prof.works.forEach(w => console.log('  ●', w.href.slice(0, 36), '|', w.text));
    }
  } catch (e) { console.log('主页 EXC:', String(e).slice(0, 80)); }

  await b.close();
  console.log('PROBE_DONE');
})().catch(e => { console.error('FAIL:', String(e).slice(0, 100)); process.exit(1); });
