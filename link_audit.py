#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""花期册资讯外链健康度实测：HEAD→GET 两段式，浏览器 UA，跟随重定向。
输出 JSON：每条 URL 的状态、耗时、最终 URL、失败归类。"""
import json, re, os, sys, time, datetime
import urllib.request, ssl

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)
t = open(os.path.join(ROOT, 'src', 'data-news.js'), encoding='utf-8').read()
feed = json.loads(re.search(r'var NEWS_FEED = (\[.*?\n\]);', t, re.S).group(1))

UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9"}
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

def check(url, timeout=12):
    r = {"url": url, "ok": False, "status": None, "final": None, "ms": None, "err": None}
    t0 = time.time()
    for method in ("HEAD", "GET"):
        try:
            req = urllib.request.Request(url, headers=UA, method=method)
            with urllib.request.urlopen(req, timeout=timeout, context=CTX) as resp:
                r["status"] = resp.status
                r["final"] = resp.geturl()
                r["ok"] = 200 <= resp.status < 400
                r["ms"] = int((time.time() - t0) * 1000)
                return r
        except urllib.error.HTTPError as e:
            r["status"] = e.code
            if method == "HEAD" and e.code in (403, 405, 501):
                continue  # HEAD 被拒，换 GET
            r["err"] = f"HTTP {e.code}"
            r["ms"] = int((time.time() - t0) * 1000)
            return r
        except Exception as e:
            if method == "GET":
                r["err"] = type(e).__name__ + ": " + str(e)[:80]
                r["ms"] = int((time.time() - t0) * 1000)
            continue
    return r

results = []
for i, x in enumerate(feed):
    url = (x.get("url") or "").strip()
    if not url:
        continue
    r = check(url)
    r["t"] = (x.get("t") or "")[:40]
    r["cat"] = x.get("cat", "")
    r["src"] = x.get("src", "")
    results.append(r)
    flag = "OK " if r["ok"] else "FAIL"
    print(f'[{i+1:02d}] {flag} {str(r["status"]):>4} {r["ms"]:>5}ms [{r["cat"]}] {r["t"][:26]} :: {r["err"] or ""}')

out = {
    "checked_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
    "total": len(results),
    "ok": len([r for r in results if r["ok"]]),
    "fail": len([r for r in results if not r["ok"]]),
    "results": results,
}
with open(os.path.join(ROOT, "link-audit.json"), "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)
print(f"\n=== 汇总: {out['ok']}/{out['total']} 可达, {out['fail']} 失败 ===")
