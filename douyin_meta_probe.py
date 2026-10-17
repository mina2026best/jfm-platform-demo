#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""抖音视频页元数据直采：og:description 无需登录，教育类视频简介即观点文案。
输出 JSON 供 bagua 蒸馏管线使用。仅采集公开元数据（标题+简介），不存截图/视频。"""
import json, subprocess, sys, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "douyin-probe.json")

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
      await p.waitForTimeout(3000);
      const info = await p.evaluate(() => {
        const ogd = document.querySelector('meta[property="og:description"]') || document.querySelector('meta[name="description"]');
        const ogt = document.querySelector('meta[property="og:title"]') || document.querySelector('meta[name="description"]');
        return { title: ogt ? ogt.content : '', desc: ogd ? ogd.content : '', url: location.href };
      });
      out.push({ url: url, title: info.title, desc: info.desc, ok: !!info.desc });
      console.log('[ok]', url.slice(-28), '→', (info.desc || '').slice(0, 60));
    } catch (e) {
      out.push({ url: url, ok: false, err: String(e).slice(0, 80) });
      console.log('[fail]', url.slice(-28));
    }
  }
  await b.close();
  console.log('===JSON===' + JSON.stringify(out));
})();
'''

def main(urls):
    r = subprocess.run([sys.executable if False else 'node', '-e', PROBE_JS] + urls,
                       capture_output=True, text=True, timeout=300)
    m = None
    for line in r.stdout.split('\n'):
        if line.startswith('===JSON==='):
            m = line[len('===JSON==='):]
    if not m:
        print(r.stdout[-500:]); print(r.stderr[-300:])
        return 1
    data = json.loads(m)
    json.dump(data, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    ok = [x for x in data if x.get('ok')]
    print('直采完成: %d/%d → %s' % (len(ok), len(data), OUT))
    return 0

if __name__ == '__main__':
    urls = [
      'https://www.douyin.com/video/7523957918183394620',   # 教育通 巴蜀清北
      'https://www.douyin.com/shipin/7367049783636248576',  # 周校懂 腾芳vs数据谷
      'https://www.douyin.com/video/7441518094729678114',   # 刘闻 重邮
      'https://www.douyin.com/video/7675651982354338752',   # 西部 26届节奏
      'https://www.douyin.com/video/7691536627596617954',   # 曾校 推优四渠道
      'https://www.douyin.com/video/7649672539999948066',   # 肖肖 摇号退路
      'https://www.douyin.com/zhuanti/7188857016562239549', # 米妈 民办汇总（话题页）
      'https://www.douyin.com/video/7422970398364552474',   # 蓝图 一诊时间
      'https://www.douyin.com/shipin/7509927192986634249',  # 刘闻 重大招生计划
      'https://www.douyin.com/shipin/7509922829627721737',  # 刘闻 历史类547分
      'https://www.douyin.com/shipin/7521200368466823187',  # 罗洋 中考等级abc
      'https://www.douyin.com/shipin/7509903950947223563',  # 全老师 云阳高考喜报
      'https://www.douyin.com/video/7310178984405436428',   # 全老师 康德卷一诊
      'https://www.douyin.com/zhuanti/7223894218488645687', # 米妈 2022清北榜（话题页）
      'https://www.douyin.com/zhuanti/7247280162151221283', # 教育通 谢家湾（话题页）
    ]
    sys.exit(main(urls))
