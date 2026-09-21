#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""鸡父母平台 · 信息采集脚本（资讯中心数据源）
用法：
  python3 collect.py                 # 从种子 + 已审核采集条目生成 src/data-news.js
  python3 collect.py --fetch         # 先尝试抓取 src/news/sources.json 中的公开页面（best-effort），再生成
  python3 collect.py --list-fetched  # 查看待审核的抓取条目

设计：抓取的条目进入 src/news/collected.json（reviewed=false 暂不发布）；
在 collected.json 中把 "reviewed": true 后重新运行本脚本即发布（编辑审核流程）。
"""
import json, os, sys, re, datetime, urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
NEWS = os.path.join(ROOT, "src", "news")
SEED = os.path.join(NEWS, "seed.json")
COLLECTED = os.path.join(NEWS, "collected.json")
SOURCES = os.path.join(NEWS, "sources.json")
OUT = os.path.join(ROOT, "src", "data-news.js")


def load(p, default):
    try:
        with open(p, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def save(p, obj):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)


def _clean(s):
    return re.sub(r"\s+", " ", s).strip()


def fetch_all():
    sources = load(SOURCES, [])
    if not sources:
        print("[fetch] 未配置 sources.json，跳过")
        return
    collected = load(COLLECTED, [])
    seen = {(c.get("url") or "") + "|" + (c.get("t") or "") for c in collected}
    added = 0
    for s in sources:
        url, name, cat = s.get("url"), s.get("name", "来源"), s.get("cat", "升学动态")
        if not url:
            continue
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (jfm-collector/0.1)"})
            html = urllib.request.urlopen(req, timeout=8).read().decode("utf-8", "ignore")
            m = re.search(r"<title[^>]*>(.*?)</title>", html, re.S | re.I)
            title = _clean(m.group(1))[:80] if m else ""
            key = url + "|" + title
            if key in seen:
                print(f"[fetch] 已存在：{name}")
                continue
            dm = re.search(r"(20\d{2})[-/年.](\d{1,2})[-/月.](\d{1,2})", html)
            date = ""
            if dm:
                date = f"{dm.group(1)}-{int(dm.group(2)):02d}-{int(dm.group(3)):02d}"
            md = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']{10,160})', html, re.I)
            desc = _clean(md.group(1)) if md else ""
            collected.append({
                "t": title or ("页面更新：" + name), "cat": cat, "src": name, "date": date,
                "sum": desc or "由采集脚本抓取，待编辑审核补充摘要。", "body": "", "url": url,
                "reviewed": False,
            })
            added += 1
            print(f"[fetch] OK：{name} · {title[:40]}")
        except Exception as e:
            print(f"[fetch] 跳过（{name}）：{type(e).__name__}")
    save(COLLECTED, collected)
    print(f"[fetch] 本次新增 {added} 条待审核；累计 {len(collected)} 条（reviewed=true 才会发布）")


def generate():
    seed = load(SEED, [])
    collected = load(COLLECTED, [])
    pub = [c for c in collected if c.get("reviewed")]
    items = seed + pub
    items.sort(key=lambda x: (x.get("date") or ""), reverse=True)
    pending = len([c for c in collected if not c.get("reviewed")])
    js = ("/* ---------- 资讯数据（由 collect.py 生成 · 请勿手改；改内容请编辑 src/news/seed.json 后重新运行） ---------- */\n"
          "var NEWS_FEED = " + json.dumps(items, ensure_ascii=False, indent=2) + ";\n"
          "var NEWS_META = " + json.dumps({
              "generated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
              "seed": len(seed), "collected": len(pub), "fetchedPending": pending,
          }, ensure_ascii=False) + ";\n")
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(js)
    print(f"[build] src/data-news.js：{len(items)} 条（种子 {len(seed)} + 采集已审 {len(pub)}）")


if __name__ == "__main__":
    args = sys.argv[1:]
    if "--fetch" in args:
        fetch_all()
    if "--list-fetched" in args:
        for c in load(COLLECTED, []):
            print(("[已发布] " if c.get("reviewed") else "[待审核] ") + (c.get("t") or "")[:60])
    generate()
