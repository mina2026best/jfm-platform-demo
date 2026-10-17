#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""【已证实不可用于作品采集】未登录主页的作品链接全为 page-footer 推荐流（非账号作品）。保留本脚本仅供账号存在性核验。
输出 JSON：每个主页的可点击 /video/ /shipin/ /note/ 链接 + og:description。"""
import json, subprocess, sys, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "douyin-user-probe.json")

PROBE_JS = r'''
const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--disable-gpu', '--lang=zh-CN'] });
  const ctx = await b.newContext({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', locale: 'zh-CN' });
  const p = await ctx.newPage();
  const out = [];
  const urls = process.argv.slice(1);
  for (const url of urls) {
    try {
      await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await p.waitForTimeout(4500);
      const info = await p.evaluate(() => {
        const ogd = document.querySelector('meta[property="og:description"]') || document.querySelector('meta[name="description"]');
        const links = new Set();
        document.querySelectorAll('a[href]').forEach(a => {
          const h = a.href || '';
          if (/douyin\.com\/(video|shipin|note)\/\d+/.test(h)) {
            const t = (a.innerText || '').trim().slice(0, 120);
            links.add(JSON.stringify({ href: h.split('?')[0], text: t }));
          }
        });
        return { ogd: ogd ? ogd.content : '', url: location.href, links: Array.from(links).map(s => JSON.parse(s)) };
      });
      out.push({ url: url, ok: true, ogd: info.ogd, links: info.links });
      console.log('[ok]', url.slice(-34), '→ links:', info.links.length);
    } catch (e) {
      out.push({ url: url, ok: false, err: String(e).slice(0, 100) });
      console.log('[fail]', url.slice(-34));
    }
  }
  await b.close();
  console.log('===JSON===' + JSON.stringify(out));
})();
'''

def main(urls=None):
    if urls is None:
        urls = []
    r = subprocess.run(['node', '-e', PROBE_JS] + urls, capture_output=True, text=True, timeout=300)
    m = None
    for line in r.stdout.split('\n'):
        if line.startswith('===JSON==='):
            m = line[len('===JSON==='):]
    if not m:
        print(r.stdout[-800:]); print(r.stderr[-400:]); return 1
    data = json.loads(m)
    json.dump(data, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print('主页直采完成 →', OUT)
    for d in data:
        if d.get('ok'):
            print('\n==', d['url'])
            print('OGD:', (d.get('ogd') or '')[:150])
            for l in d.get('links', [])[:12]:
                print('  -', l['href'], '|', l['text'][:60])
    return 0

if __name__ == '__main__':
    cfg = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src', 'news', 'host_urls.json'), encoding='utf-8'))
    urls, skipped = [], []
    for h in cfg['hosts']:
        if h['url'].startswith('SEARCH:'):
            skipped.append(h['name'])
        else:
            urls.append(h['url'])
    print(f'主页直采：{len(urls)} 个（跳过待补 {len(skipped)}: {", ".join(skipped[:5])}...）')
    sys.exit(main(urls))
