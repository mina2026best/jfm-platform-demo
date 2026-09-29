#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""鸡父母平台 · 每日资讯自动更新
抓取配置源的列表页 → 提取教育相关条目 → 自动发布到资讯中心（collect.py 机制）。
用法：
  python3 daily_update.py --dry     # 试跑：只统计不发布
  python3 daily_update.py           # 正式：抓取并发布（自动入 collected.json 并重生成数据）
"""
import json, os, re, ssl, sys, time, datetime, subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin, urlparse
import urllib.request
import certifi

ROOT = os.path.dirname(os.path.abspath(__file__))
NEWS = os.path.join(ROOT, "src", "news")
SOURCES = os.path.join(NEWS, "sources.json")
COLLECTED = os.path.join(NEWS, "collected.json")
SEED = os.path.join(NEWS, "seed.json")
CTX = ssl.create_default_context(cafile=certifi.where())
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"}

EDU_KEYS = ["教育","学校","中学","小学","幼儿园","学院","大学","招生","入学","中考","高考","升学","考试","录取","学生","校园","教师","老师","家长","培训","学期","开学","校历","志愿","报名","摇号","划片","转学","学位","教委","教育局","教研","课改","幼升小","小升初","双减","作业","课程","教材","课本","毕业","军训","研学","奖学金","助学","师资","师德","督学","家访","家校","考生","考点","考场","分数","投档","批次","联招","指标到校","特长生","艺体","班会","课堂教学","备课","幼儿园","托育","青少年","未成年","儿童"]
JUNK = ["登录","注册","下载","APP","客户端","版权","联系我们","网站地图","首页","上一页","下一页","更多","无障碍","长者版","简体","繁体","English","微信","微博","分享","打印","关闭","返回","招聘广告","广告服务","关于我们","使用帮助","隐私政策","用户协议","热点专题","图片新闻","视频新闻","友情链接","政务公开","领导","信箱","调查","征集","专题","专访","访谈","专栏","图集","视频","直播","订阅","rss","RSS","&","系统","入口","点此","查询（","www.","http","输入","验证码","扫码","二维码","客服","热线电话"]
JUNK_RE = [r"(入口|系统|登录|注册|查询)$", r"^[\s·•\-—_]+", r"【?(报名|打印|查询|下载|缴费)[】]?$"]
RED = ["自杀","坠楼","猝死","性侵","霸凌","车祸","死亡","犯罪","吸毒","赌博","跳楼","伤亡","涉黄","打人","暴力","身亡","命案","猥亵","拐卖"]
CAT_RULES = [
 ("政策速递", ["政策","通知","意见","办法","规定","条例","公告","印发","发布","文件","方案","规划","条例"]),
 ("升学动态", ["中考","高考","招生","录取","志愿","分数线","联招","指标到校","升学","考试","报名","摇号","划片","学位","转学","毕业","模拟考","特长生","艺体","招考","分数","投档"]),
 ("家庭教育", ["家庭","家长","心理","亲子","陪伴","沟通","家风","育儿","青春期","习惯","辅导","作业"]),
 ("安全提醒", ["安全","提醒","预警","防护","流感","交通","消防","防溺","应急","演练","食安","食品","健康","疫苗","近视","体测"]),
 ("办事提醒", ["办理","材料","手续","窗口","指南","流程","时间表","日程","截止","受理","申请"]),
 ("行业观察", ["行业","市场","趋势","报告","数据","规模","企业","机构","研讨会","论坛","峰会","发布报告"]),
]

def load(p, d):
    try:
        return json.load(open(p, encoding="utf-8"))
    except Exception:
        return d

def save(p, o):
    json.dump(o, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

def fetch_html(url, timeout=10):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, context=CTX, timeout=timeout) as r:
        raw = r.read()
    for enc in ("utf-8", "gb18030"):
        try:
            t = raw.decode(enc)
            if t.count("锟") < 5:
                return t
        except Exception:
            continue
    return raw.decode("utf-8", "ignore")

def strip_tags(h):
    h = re.sub(r"<[^>]+>", " ", h)
    h = h.replace("&nbsp;", " ").replace("&amp;", "&").replace("&quot;", '"').replace("&#39;", "'")
    return re.sub(r"\s+", " ", h).strip()

def cn_ratio(s):
    if not s: return 0
    cn = sum(1 for c in s if "\u4e00" <= c <= "\u9fff")
    return cn / len(s)

def extract_links(base, html):
    out = []
    for m in re.finditer(r'<a\s[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', html, re.S | re.I):
        href, txt = m.group(1).strip(), strip_tags(m.group(2))
        if not href or href.startswith(("javascript:", "#", "mailto:")): continue
        if len(txt) < 8 or len(txt) > 72: continue
        if cn_ratio(txt) < 0.5: continue
        if any(j.lower() in txt.lower() for j in JUNK): continue
        if any(re.search(r, txt) for r in JUNK_RE): continue
        if not any(k in txt for k in EDU_KEYS): continue
        full = urljoin(base, href)
        if not full.startswith("http"): continue
        if re.search(r"\.(jpg|png|gif|pdf|doc|docx|xls|xlsx|zip|mp4|mp3)$", full, re.I): continue
        out.append((txt, full))
    return out

def meta_desc(url, timeout=6):
    try:
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, context=CTX, timeout=timeout) as r:
            raw = r.read(200000)
        for enc in ("utf-8", "gb18030"):
            try:
                t = raw.decode(enc); break
            except Exception: t = raw.decode("utf-8", "ignore")
        m = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']{10,200})', t, re.I)
        if not m:
            m = re.search(r'<meta[^>]+property=["\']og:description["\'][^>]+content=["\']([^"\']{10,200})', t, re.I)
        return strip_tags(m.group(1)) if m else ""
    except Exception:
        return ""

def cat_of(title):
    for cat, kws in CAT_RULES:
        for k in kws:
            if k in title: return cat
    return "升学动态"

def norm_title(t):
    return re.sub(r"[^\u4e00-\u9fffA-Za-z0-9]", "", t)

def main():
    dry = "--dry" in sys.argv
    sources = load(SOURCES, [])
    collected = load(COLLECTED, [])
    seed = load(SEED, [])
    known = set()
    for it in collected + seed:
        if it.get("url"): known.add(it["url"].strip())
        known.add(norm_title(it.get("t", "")))
    today = datetime.date.today().isoformat()

    # 1) 抓取所有源，提取候选
    allc = {}
    src_stats = []
    def job(s):
        try:
            html = fetch_html(s["url"])
            links = extract_links(s["url"], html)
            return s, links, None
        except Exception as e:
            return s, [], str(e)[:80]
    with ThreadPoolExecutor(max_workers=8) as ex:
        futs = [ex.submit(job, s) for s in sources]
        for f in as_completed(futs):
            s, links, err = f.result()
            src_stats.append((s.get("name",""), len(links), err or ""))
            for txt, url in links:
                nt = norm_title(txt)
                if url in known or nt in known: continue
                if any(r in txt for r in RED): continue
                if nt in allc: continue
                allc[nt] = {"t": txt, "url": url, "src": s.get("name",""), "cat": s.get("cat") or cat_of(txt)}
    print("== 源抓取统计 ==")
    for n, c, e in src_stats:
        print(f"  {n}: {c} 条候选{' · ERR:'+e if e else ''}")
    # 每源上限 25 条，保持源间多样性
    by_src = {}
    for c in allc.values():
        by_src.setdefault(c["src"], []).append(c)
    cands = []
    for src, lst in by_src.items():
        cands.extend(lst[:25])
    print(f"== 去重后新候选: {len(cands)} 条（每源限 25） ==")
    for c in cands[:12]:
        print("   ·", c["t"][:52], "|", c["url"][:70])
    if dry:
        print("DRY RUN - 未写入")
        return

    # 2) 抓 meta 描述（并行，限 100 条）
    cands = cands[:100]
    def desc_job(c):
        c["sum"] = meta_desc(c["url"]) or ""
        return c
    with ThreadPoolExecutor(max_workers=12) as ex:
        cands = list(ex.map(desc_job, cands))

    # 3) 写入 collected.json（reviewed=true 自动发布）
    for c in cands:
        c["cat"] = c.get("cat") or cat_of(c["t"])
        c["date"] = today
        c["sum"] = c.get("sum") or ""
        c["body"] = ""
        c["reviewed"] = True
        c["auto"] = True
        collected.append(c)
    save(COLLECTED, collected)
    print(f"[ok] 新增发布 {len(cands)} 条；colloected 累计 {len(collected)} 条")

    # 4) 重新生成 data-news.js
    r = subprocess.run([sys.executable, os.path.join(ROOT, "collect.py")], capture_output=True, text=True)
    print(r.stdout.strip()[-300:])

if __name__ == "__main__":
    main()
