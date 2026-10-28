#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""花期册 · 八卦社自主采集器（v1.0，2026-10-18）

无人值守的自动发现-采集-入库闭环，全部基于免登录公开通道：
  1. 爬虫起点（seeds）：已知可渲染的 douyin /shipin/ 聚合页与 /video/ 页
  2. 每个页面用 Playwright 提取：og:title/og:description + DOM 中全部 /video/、/shipin/ 链接及其卡片文字
  3. 卡片文字命中白名单主播名 → 该链接成为候选
  4. 候选 /video/ 页 og 直采：拿精确发布日期（「于YYYYMMDD发布在抖音」）与完整文案
  5. 与 bagua.json 按 URL 去重后写入 bagua_inbox/*.json（ai_summary=文案截断，reviewed=false 待蒸馏）
  6. 外层脚本接着跑 bagua_daily.py 完成风控入库

用法：python3 bagua_auto.py [--max N]   # N=本轮最多直采的候选页数，默认 12
仅采集公开元数据（标题+简介+可见计数），不存视频/截图/个人信息。
"""
import json, os, re, sys, subprocess, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(ROOT, "src", "news", "bagua.json")
INBOX = os.path.join(ROOT, "src", "news", "bagua_inbox")
PROBE_JS_PATH = os.path.join(ROOT, "douyin_meta_probe.py")

CRAWL_JS = r'''
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
      await p.waitForTimeout(3500);
      const info = await p.evaluate(() => {
        const ogd = document.querySelector('meta[property="og:description"]') || document.querySelector('meta[name="description"]');
        const ogt = document.querySelector('meta[property="og:title"]') || document.querySelector('meta[name="description"]');
        const links = [];
        document.querySelectorAll('a[href*="/video/"], a[href*="/shipin/"]').forEach(a => {
          const href = a.href.split('?')[0];
          const card = (a.closest('li') || a.closest('div[class*="item"]') || a.parentElement);
          const text = card ? (card.innerText || '').replace(/\s+/g, ' ').slice(0, 220) : (a.innerText || '').slice(0, 160);
          if (href && text) links.push({ href: href, text: text });
        });
        return { title: ogt ? ogt.content : '', desc: ogd ? ogd.content : '', links: links };
      });
      out.push({ seed: url, title: info.title, desc: info.desc, links: info.links, ok: true });
      console.error('[crawl]', url.slice(-30), 'links:', info.links.length);
    } catch (e) {
      out.push({ seed: url, ok: false, err: String(e).slice(0, 80) });
      console.error('[fail]', url.slice(-30));
    }
  }
  await b.close();
  console.log('===JSON===' + JSON.stringify(out));
})();
'''

def run_node(js, urls, timeout=280):
    r = subprocess.run(['node', '-e', js] + urls, capture_output=True, text=True, timeout=timeout)
    for line in r.stdout.split('\n'):
        if line.startswith('===JSON==='):
            return json.loads(line[len('===JSON==='):])
    print(r.stdout[-600:], r.stderr[-300:])
    return []

def load(p, d):
    try: return json.load(open(p, encoding='utf-8'))
    except Exception: return d

def guess_stage(text):
    if re.search(r'小升初|摇号|派位|小学', text): return '小升初'
    if re.search(r'强基|新高考|高考志愿|高考|一本|分数线', text): return '新高考'
    return '初升高'

def guess_tags(text, pool):
    m = {'小升初': '重庆小升初', '指标到校': '重庆指标到校', '联招': '重庆联招', '中考志愿': '重庆中考志愿',
         '中考': '重庆初升高', '初升高': '重庆初升高', '新高考': '重庆新高考', '高考志愿': '高考志愿填报',
         '高考': '重庆新高考', '学校': '学校解读', '时间': '升学时间提醒'}
    tags = []
    for k, v in m.items():
        if k in text and v in pool and v not in tags: tags.append(v)
    return tags[:3]

def aweme_id_date(url):
    """v1.2：抖音 aweme ID 高 32 位 = 发布 Unix 秒（确定性解码，校准例：
    7631482243214593332→2026-04-21、7491623163520961828→2025-03 均吻合）。
    shipin 聚合页的「发布时间」字段会把旧 ID 标成新日期，一律以 ID 解码为准。"""
    m = re.search(r'/(?:video|shipin)/(\d{15,20})', url or '')
    if not m: return None
    ts = int(m.group(1)) >> 32
    try:
        return datetime.date.fromtimestamp(ts)
    except Exception:
        return None

def main():
    maxn = 12
    if '--max' in sys.argv: maxn = int(sys.argv[sys.argv.index('--max') + 1])
    db = load(DB, {})
    pool = db.get('tag_pool', [])
    wl_names = [h['name'] for h in (db.get('whitelist', {}) or {}).get('hosts', [])]
    # 昵称宽松匹配：白名单名的核心词（去「老师」「重庆」前后缀后 ≥3 字也算命中）
    cores = set()
    for n in wl_names:
        cores.add(n)
        c = n.replace('重庆', '').replace('老师', '').replace('升学规划', '').replace('升学', '').replace('聊', '')
        if len(c) >= 3: cores.add(c)

    existing = {x.get('original_url', '') for x in db.get('items', [])}
    # 种子：库内原帖 + 探针历史结果
    seeds = [u for u in existing if '/shipin/' in u or '/video/' in u]
    for x in load(os.path.join(ROOT, 'douyin-probe.json'), []):
        u = x.get('url', '')
        if ('/shipin/' in u or '/video/' in u) and u not in seeds: seeds.append(u)
    seeds = seeds[:20]  # v1.2 扩种子：16→20（2026-10-28 连续零新增按巡检规则再扩容）
    if not seeds:
        print('[auto] 无可用种子页'); return 1
    print('[auto] 种子 %d 页：%s' % (len(seeds), ', '.join(s.rsplit('/', 1)[-1] for s in seeds)))

    pages = run_node(CRAWL_JS, seeds)
    # 候选：链接卡片文字命中白名单核心词
    cand, seen = [], set()
    for pg in pages:
        for l in (pg.get('links') or []):
            u, t = l['href'], l['text']
            if u in existing or u in seen: continue
            if any(c in t for c in cores):
                cand.append({'url': u, 'card': t}); seen.add(u)
    print('[auto] 白名单候选 %d 条' % len(cand))
    cand = cand[:maxn]
    if not cand: return 0

    # 二跳直采：拿 og 精确日期与完整文案
    probed = run_node(CRAWL_JS, [c['url'] for c in cand])
    today = datetime.date.today().isoformat()
    items, cardmap = [], {c['url']: c['card'] for c in cand}
    for pg in probed:
        u = pg.get('seed', '')
        desc = (pg.get('desc') or '').strip()
        if not pg.get('ok') or not desc or '您在查找' in desc: continue
        m = re.search(r'于(\d{8})发布在抖音', desc)
        if not m: continue  # 无精确日期的不要（防旧内容顶替）
        pub = '%s-%s-%s' % (m.group(1)[:4], m.group(1)[4:6], m.group(1)[6:])
        # v1.2：ID 解码交叉验证——偏差 ≤3 天视为时区/取整误差保留 og 日期；大偏差以 ID 为准
        id_date = aweme_id_date(u)
        if id_date is not None and abs((datetime.date.fromisoformat(pub) - id_date).days) > 3:
            print('[auto][warn] og 日期 %s 与 ID 解码 %s 偏差过大 → 以 ID 为准：%s' % (pub, id_date.isoformat(), u[-24:]))
            pub = id_date.isoformat()
        age = (datetime.date.today() - datetime.date.fromisoformat(pub)).days
        if age > 300: continue
        author = ''
        m2 = re.search(r'-\s*(.+?)于\d{8}发布在抖音', desc)
        if m2: author = m2.group(1).strip()
        full = desc
        # 判断作者是否白名单（og 里的账号名或卡片文字）
        hit_wl = any(c in (author + cardmap.get(u, '')) for c in cores) if (author or cardmap.get(u)) else False
        summary = re.sub(r'#\S+', '', desc).strip()
        summary = re.sub(r'\s+', ' ', summary)[:230]
        if len(summary) < 60: summary = (summary + ' ' + re.sub(r'#\S+', ' ', desc).strip())[:230].strip()
        if len(summary) < 60: continue
        card = cardmap.get(u, '')
        like = ''
        m3 = re.search(r'([\d.]+[万亿]?)个喜欢', desc)
        if m3: like = m3.group(1) + '赞'
        items.append({
            'author_name': author or ('卡片线索：' + card[:24] if card else '待确认'),
            'source_platform': '抖音',
            'publish_time': pub,
            'original_url': u,
            'content_type': '短视频（自动采集 og）',
            'stage': guess_stage(summary),
            'not_pinned': True,
            'ai_summary': summary,
            'risk_note': '自动采集初筛（bagua_auto.py），待人工/Agent 四段蒸馏' + ('；互动：%s' % like if like else ''),
            'tags': guess_tags(summary, pool),
            'reviewed': False,
            'auto_collected': True,
            'wl_match': hit_wl,
            'card_text': card[:200],
        })
    # 非白名单命中也会被 bagua_daily 拒收，但保留 wl_match 供人工筛选档案
    os.makedirs(INBOX, exist_ok=True)
    out = os.path.join(INBOX, 'auto-%s.json' % datetime.datetime.now().strftime('%Y%m%d-%H%M'))
    json.dump(items, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print('[auto] 直采成功 %d 条 → %s（其中白名单命中 %d）' % (len(items), out, sum(1 for i in items if i['wl_match'])))
    return 0

if __name__ == '__main__':
    sys.exit(main())
