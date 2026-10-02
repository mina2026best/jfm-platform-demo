#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""家长屿 · 全站外链存活巡检（v0.53）

扫描构建产物（页面 HTML + 资讯数据 JS）中的所有外链，逐条实测可达性，
输出异常清单。可用于每日 cron 或发布前门禁。

用法：
  python3 check_links.py            # 巡检并打印异常（有异常时退出码 1）
  python3 check_links.py --quiet    # 仅在有异常时输出
"""
import os, re, sys, json, ssl, time, urllib.parse
import urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.abspath(__file__))
UA = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
                  '(KHTML, like Gecko) Chrome/126.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9',
}
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE
# 可达判定：2xx/3xx 正常；401/403/405/406/412/429 为反爬/WAF 挑战或方法限制——真实浏览器可打开
# 412 单列：教育部阳光高考平台、学位网等官方站对非浏览器客户端返回 412（Precondition Failed），
# 属 WAF 行为而非死链；已人工在浏览器核实可正常访问，故不计异常。
OK = {200, 201, 202, 203, 204, 206, 301, 302, 303, 307, 308, 401, 403, 405, 406, 412, 429}
SKIP_HOST = ('schema.org', 'w3.org', 'localhost', '127.0.0.1', 'example.com')


def collect_urls():
    urls = {}
    targets = []
    for dirpath, _dirs, files in os.walk(ROOT):
        if any(seg in dirpath for seg in ('.git', 'assets/app.', 'quarantine')):
            continue
        for fn in files:
            if not (fn.endswith('.html') or fn.endswith('.js') or fn.endswith('.json')):
                continue
            if fn.startswith(('三专家', '四专家', '性能与SEO')):   # 历史报告不参与
                continue
            path = os.path.join(dirpath, fn)
            try:
                text = open(path, encoding='utf-8', errors='ignore').read()
            except Exception:
                continue
            for u in re.findall(r'https?://[A-Za-z0-9\./_\-?&=%#~:;+,@!()\[\]\u4e00-\u9fff\uff08\uff09]+', text):
                u = u.rstrip('.,;)\'"')
                if any(s in u for s in SKIP_HOST):
                    continue
                if '&lt;' in u or '<' in u or '>' in u:   # HTML 转义的占位域名（非真实链接）
                    continue
                # 中文未编码的链接补编码（浏览器会自动编码，实测前先统一）
                if any(ord(ch) > 127 for ch in u):
                    try:
                        u = urllib.parse.quote(u, safe=":/?#[]@!$&'()*+,;=%~")
                    except Exception:
                        pass
                urls.setdefault(u, set()).add(os.path.relpath(path, ROOT))
    return urls


def check(u, tries=2):
    for t in range(tries):
        try:
            req = urllib.request.Request(u, headers=UA, method='GET')
            with urllib.request.urlopen(req, timeout=12, context=CTX) as r:
                r.read(256)
                return r.status
        except urllib.error.HTTPError as e:
            if e.code in (429, 403, 503) and t == 0:
                time.sleep(2); continue
            return e.code
        except Exception:
            if t == 0:
                time.sleep(1); continue
            return 'ERR'
    return 'ERR'


def main():
    quiet = '--quiet' in sys.argv
    urls = collect_urls()
    targets = sorted(urls.keys())
    if not quiet:
        print(f'[check_links] 待测外链 {len(targets)} 条')
    with ThreadPoolExecutor(max_workers=10) as ex:
        results = dict(zip(targets, ex.map(check, targets)))
    bad = {u: s for u, s in results.items() if s not in OK}
    if not quiet:
        print(f'[check_links] 可达 {len(results) - len(bad)} / {len(results)}')
    if bad:
        print(f'[check_links] ⚠️ 异常 {len(bad)} 条：')
        for u, s in sorted(bad.items(), key=lambda kv: str(kv[1])):
            print(f'  {s}  {u[:110]}')
            print(f'      出现于: {", ".join(sorted(urls[u])[:4])}')
        return 1
    if not quiet:
        print('[check_links] ✓ 全部外链可达')
    return 0


if __name__ == '__main__':
    sys.exit(main())
