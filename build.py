#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""花期册平台 · 多页构建脚本（v0.29 架构改版）
src/ 的样式 / 数据 / 功能模块 / HTML 骨架 → 多页站点（每页单文件自包含、可双击打开）。
用法：python3 build.py   （在网站目录执行）
"""
import os, re, sys, hashlib, json, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
OUT_DIR = ROOT  # 页面直接输出到网站根目录

# ============ 页面定义：文件名 / 标题 / 描述 / 包含 section / 页面主 CSS 钩子 ============
PAGES = [
    dict(file="index.html",  title="花期册 · 重庆家长升学指南（小升初 / 初升高 / 高考志愿）",
         desc="小升初对口与摇号、初升高指标到校与中考志愿、大学与专业选报的位次法——官方原文＋人话解读、升学日历、学校档案、择校对比，逐条标注来源。",
         sections=["stages", "home-top", "daohang", "calendar", "how"], hero=True),
    dict(file="news.html",   title="升学资讯中心 · 花期册",
         desc="政策速递、升学动态、家庭教育、安全提醒与办事提醒——编辑部采集并审核后发布，30 条内置资讯带官方来源。",
         sections=["news"]),
    dict(file="calendar.html", title="升学日历 · 花期册",
         desc="幼升小到高考的关键节点、行动清单与提醒导出——按孩子学段自动过滤。",
         sections=["calendar"]),
    dict(file="policy.html", title="政策库与人话词典 · 花期册",
         desc="招生政策原文要点 + 人话版解读 + 32 条高频术语词典，逐条标注文号与生效日期。",
         sections=["policy"]),
    dict(file="quiz.html",   title="入学自查与材料清单 · 花期册",
         desc="3 问自查「我家能不能报」，一键生成入学材料清单（学段 × 户籍 × 住房）。",
         sections=["quiz"]),
    dict(file="schools.html", title="学校档案库 · 花期册",
         desc="20 所学校档案：公开概况（创办 / 校训 / 规模 / 师资 / 地址 / 官网）、招生范围与通勤参考，逐字段标注来源与核验日期。",
         sections=["schools"]),
    dict(file="compare.html", title="择校对比器 · 花期册",
         desc="选 2–3 所学校横向对比，差异标记「●」与「仅看差异」折叠视图；数据缺失如实标注。",
         sections=["compare"]),
    dict(file="zy.html",     title="志愿参考与路径地图 · 花期册",
         desc="2026 特招线位次换算 + 六大升学路径地图（普高统招 / 指标到校 / 民办 / 中职 / 艺体 / 国际班）。",
         sections=["zy"]),
    dict(file="forum.html",  title="家长论坛 · 花期册",
         desc="幼升小 / 小升初 / 初升高 / 高考志愿 / 陪读生活分区讨论：择校对比、材料办理、政策疑问，同区家长一起交流；禁广告、涉政策需注明官方来源。",
         sections=["forum"]),
    dict(file="community.html", title="家长社区 · 花期册",
         desc="同城家长的实操帖与讨论：长幼随学实测、陪读房选择、跨区联招、复习计划分享。",
         sections=["community", "learn"]),
    dict(file="life.html",   title="生活服务 · 花期册",
         desc="陪读租房行情样本 + 陪读成本速算器（房租 + 生活 + 通勤 → 月度区间）；平台不参与居间。",
         sections=["life"]),
    dict(file="beans.html",  title="升学豆中心 · 花期册",
         desc="站内权益凭证：不生息、不可提现、不可转让；签到与内容贡献即可获得，发放四道闸门防通胀。",
         sections=["beans"]),
    dict(file="me.html",     title="我的 · 孩子档案与数据 · 花期册",
         desc="多孩档案、提醒收藏、升学豆、外观与数据管理（导出 / 导入 / 清空）——本机存储，可跨页联动。",
         sections=["fund", "me"]),
    dict(file="plans.html",  title="会员体系 · 花期册",
         desc="信息基础永远免费；工具与提醒付费，服务按权益分配。免费层完整可用。",
         sections=["plans"]),
    dict(file="biz.html",    title="B 端合作 · 花期册",
         desc="三类合作形态 + 资质审核 + 平台不背书承诺；意向登记通道。",
         sections=["biz"]),
    dict(file="data-sources.html", title="数据来源与核验 · 花期册",
         desc="站上每个数字都有出处：9 项已核验数据点，官方原文入口可点击。",
         sections=["data-sources"]),
    dict(file="daohang.html", title="常用网址导航 · 花期册",
         desc="69 个家长常用入口，逐条实测可打开：报名查分、区县划片、政策办事、学习资源、同城社区、健康心理、生活出行，分类导航 + 实时筛选。",
         sections=["daohang"]),
    dict(file="about.html",  title="关于与联系 · 花期册",
         desc="编辑与审核规范、线索通道、站点地图、边界与承诺。",
         sections=["how", "about"]),
    dict(file="search.html", title="站内搜索 · 花期册",
         desc="搜全站：学校 / 资讯 / 政策 / 术语一框聚合，附热门搜索词。",
         sections=["searchpage"]),
    dict(file="contact.html", title="联系与留言 · 花期册",
         desc="留言必达：内容纠错、功能建议、合作意向——留言写入本站后台，按时间可查。",
         sections=["contact"]),
    dict(file="wiki.html",   title="升学百科 · 花期册",
         desc="幼升小 / 小升初 / 初升高 / 高考四阶段全流程指南：时间轴 + 必办事项 + 常见误区 + 工具入口。",
         sections=["wiki"]),
    dict(file="problems.html", title="问题速查 · 花期册",
         desc="「我遇到 X 问题」组合速查：场景 → 政策条目 + 高频术语 + 站内工具，答案可点进原文核验。",
         sections=["problems"]),
    dict(file="faq.html",    title="家长 FAQ · 花期册",
         desc="20 个最常被问到的问题：入学 / 择校 / 政策 / 生活 / 会员，快问快答带入口链接。",
         sections=["faq"]),
    dict(file="sitemap.html", title="站点地图 · 花期册",
         desc="全部页面一览。",
         sections=[]),
]

# section 原文提取：从 template.html 抓 <section id="xxx">…</section>（含嵌套 div 的配对）
def extract_sections(tpl):
    secs = {}
    for m in re.finditer(r'<section id="([a-z-]+)"(\s+class="[^"]*")?>', tpl):
        sid = m.group(1)
        start = m.start()
        # 配对 </section>
        depth = 1
        idx = m.end()
        while depth > 0:
            nxt_open = tpl.find("<section", idx)
            nxt_close = tpl.find("</section>", idx)
            if nxt_close == -1:
                raise SystemExit("[build] section 未闭合：" + sid)
            if nxt_open != -1 and nxt_open < nxt_close:
                depth += 1
                idx = nxt_open + 8
            else:
                depth -= 1
                idx = nxt_close + len("</section>")
        secs[sid] = tpl[start:idx]
    return secs

def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()

def guard(name, body):
    if not body.strip():
        sys.exit(f"[build] 空模块：{name}")
    if "/*__BUILD_" in body or "__BUILD_PLACEHOLDER__" in body:
        sys.exit(f"[build] 模块含未解析占位符：{name}")
    # v0.54 防回归：bundle 用 defer 加载，执行期 readyState='interactive'，
    # 任何"非 loading 就同步 boot"的写法都会在 bundle 中段提前触发 boot，
    # 导致其后续模块的顶层 var 尚未赋值 → boot 链在 renderNews() 抛错中断。
    if "; bootOnce();" in body and "readyState !== 'loading'" in body:
        sys.exit(f"[build] {name}：禁止在 defer bundle 中同步 boot（须交由 DOMContentLoaded）")

def build_css():
    parts = ["/* ============ base ============ */\n" + read(f"{SRC}/styles/base.css")]
    for m in sorted(os.listdir(f"{SRC}/styles/modules")):
        if m.endswith(".css"):
            parts.append(f"\n/* ============ {m[:-4]} ============ */\n" + read(f"{SRC}/styles/modules/{m}"))
    css = "\n".join(parts)
    guard("css", css)
    return css

def build_js():
    data = read(f"{SRC}/data.js")
    guard("data.js", data)
    dn = os.path.join(SRC, "data-news.js")
    if os.path.exists(dn):
        extra = read(dn)
        guard("data-news.js", extra)
        data = data + "\n\n" + extra
    am = os.path.join(SRC, "data", "artmap.json")
    # 构建时自动重生成 artmap（N|资讯 / S|学校 / L|学堂），与数据文件保持同步
    try:
        if SRC not in sys.path: sys.path.insert(0, SRC)
        from article_gen import slugify as _sg
        artmap = {}
        _seed = json.load(open(os.path.join(SRC, "news", "seed.json"), encoding="utf-8"))
        for x in (_seed if isinstance(_seed, list) else []):
            t = x.get("t")
            if t: artmap["N|" + t] = "article-news-" + _sg(t) + ".html"
        _sch = json.load(open(os.path.join(SRC, "data", "schools.json"), encoding="utf-8"))
        for name in _sch:
            artmap["S|" + name] = "article-school-" + _sg(name) + ".html"

        _learn = json.load(open(os.path.join(SRC, "data", "learn.json"), encoding="utf-8"))
        for q in _learn.get("qa", []):
            artmap["L|" + q["q"]] = "article-learn-" + _sg(q["q"]) + ".html"
        for x in _learn.get("tips", []):
            artmap["L|" + x["q"]] = "article-experience-" + _sg(x["q"]) + ".html"
        json.dump(artmap, open(am, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(f"  · artmap 自动重生成 · {len(artmap)} 键")
    except Exception as _e:
        print("[build] artmap 重生成失败，回退读取现有文件:", _e)
        artmap = json.load(open(am, encoding="utf-8")) if os.path.exists(am) else {}
    if artmap:
        data += "\n\nvar ARTMAP = " + json.dumps(artmap, ensure_ascii=False) + ";"
    ln = os.path.join(SRC, "data", "learn.json")
    if os.path.exists(ln):
        learn = json.load(open(ln, encoding="utf-8"))
        data += "\n\nvar LEARN_QA = " + json.dumps(learn["qa"], ensure_ascii=False) + ";\nvar LEARN_TIPS = " + json.dumps(learn["tips"], ensure_ascii=False) + ";"
    sp = os.path.join(SRC, "data", "school_photos.json")
    if os.path.exists(sp):
        sphotos = json.load(open(sp, encoding="utf-8"))
        data += "\n\nvar SCHOOL_PHOTOS = " + json.dumps(sphotos, ensure_ascii=False) + ";"
    # v0.40：学校档案单一数据源——前端 SCHOOL_DB 由构建时从 src/data/schools.json 注入
    sj = os.path.join(SRC, "data", "schools.json")
    if os.path.exists(sj):
        _schools = json.load(open(sj, encoding="utf-8"))
        data += "\n\nvar SCHOOL_DB = " + json.dumps(_schools, ensure_ascii=False) + ";"
    feats = []
    fdir = f"{SRC}/features"
    order = [l.strip() for l in read(f"{fdir}/_order.txt").splitlines() if l.strip() and not l.startswith("#")]
    seen = set()
    for f in order:
        p = os.path.join(fdir, f)
        if not os.path.exists(p):
            sys.exit(f"[build] _order.txt 引用了不存在的模块：{f}")
        seen.add(f)
        body = read(p)
        guard(f"features/{f}", body)
        feats.append(f"/* ---------- {f[:-3]} ---------- */\n" + body)
    for f in sorted(os.listdir(fdir)):
        if f.endswith(".js") and f not in seen and f != "_order.txt":
            sys.exit(f"[build] 模块 {f} 未登记进 _order.txt")
    return data + "\n\n" + "\n\n".join(feats)

def nav_html(cur_file, demo_tag, searchbox):
    """生成顶栏（含真跳转链接）。cur_file 用于 aria-current。"""
    items = [
        ("daohang.html", "导航"),
        ("news.html", "资讯"),
        ("calendar.html", "日历"),
        ("policy.html", "政策"),
        ("schools.html", "档案"),
        ("compare.html", "对比"),
        ("zy.html", "志愿"),
        ("forum.html", "论坛"),
        ("community.html", "社区"),
        ("life.html", "生活"),
        ("search.html", "搜索"),
        ("problems.html", "速查"), ("faq.html", "FAQ"),
        ("beans.html", "升学豆"),
        ("me.html", "我的"),
        ("plans.html", "会员", "cta"),
    ]
    def a(item):
        href, label = item[0], item[1]
        cls = f' class="{item[2]}"' if len(item) > 2 else ""
        cur = ' aria-current="page"' if href == cur_file else ""
        return f'<a href="{href}"{cls}{cur}>{label}</a>'
    nav = "<nav>" + "".join(a(i) for i in items) + "</nav>"
    mobile = [
        ("daohang.html", "网址导航"), ("news.html", "升学资讯"), ("quiz.html", "入学自查"), ("calendar.html", "升学日历"),
        ("policy.html", "政策库"), ("schools.html", "学校档案"), ("compare.html", "择校对比"),
        ("zy.html", "志愿参考"), ("forum.html", "家长论坛"), ("community.html", "家长社区"),
        ("community.html", "家长学堂"), ("life.html", "生活服务"),
        ("search.html", "站内搜索"), ("problems.html", "问题速查"), ("faq.html", "家长 FAQ"), ("beans.html", "升学豆"),
        ("me.html", "我的"), ("biz.html", "B端合作"), ("plans.html", "会员", "cta"),
    ]
    mm = "<a href=\"{}\"{}>{}</a>".format
    mobile_html = "".join(
        (f'<a href="{h}" class="{c}">{t}</a>' if c else f'<a href="{h}">{t}</a>')
        for h, t, *c in [(m[0], m[1], m[2] if len(m) > 2 else "") for m in mobile]
    )
    logo_href = "index.html"
    return f'''<div class="top">
  <div class="wrap">
    <a class="logo" href="{logo_href}" style="color:inherit;text-decoration:none"><span class="dot"></span>花期册<small>BLOOM ALMANAC · 重庆</small></a>
    {demo_tag}
    {searchbox}
    {nav}
    <button class="nav-burger" id="navBurger" aria-label="打开菜单" aria-expanded="false" onclick="toggleMobileMenu()"><span></span><span></span><span></span></button>
  </div>
  <div class="mobile-menu" id="mobileMenu" hidden>
    {mobile_html}
  </div>
</div>'''

def convert_links(html):
    """站内 #锚点 → 对应 .html 页面（模板正文用）。JS 里 goSearch/goNewsByKey 等已在源码跨页化。"""
    mapping = {
        "#news": "news.html", "#calendar": "calendar.html", "#policy": "policy.html",
        "#quiz": "quiz.html", "#schools": "schools.html", "#compare": "compare.html",
        "#zy": "zy.html", "#forum": "forum.html", "#community": "community.html",
        "#learn": "community.html", "#life": "life.html", "#beans": "beans.html",
        "#me": "me.html", "#plans": "plans.html", "#biz": "biz.html",
        "#data-sources": "data-sources.html", "#about": "about.html", "#how": "about.html",
        "#main": "index.html", "#searchpage": "search.html", "#faq": "faq.html", "#problems": "problems.html", "#wiki": "wiki.html", "#contact": "contact.html",
    }
    for anchor, page in mapping.items():
        html = html.replace(f'href="{anchor}"', f'href="{page}"')
    return html

DIALOGS = None  # 缓存弹窗块

def extract_dialogs(tpl):
    """从模板尾部抓 4 个 <dialog>…</dialog> 与 toast/toTop。"""
    global DIALOGS
    if DIALOGS is not None:
        return DIALOGS
    blocks = []
    for did in ["school-modal", "news-editor", "kbd-modal", "changelog-modal"]:
        m = re.search(r'<dialog id="' + did + r'">[\s\S]*?</dialog>', tpl)
        if not m:
            raise SystemExit("[build] 未找到 dialog：" + did)
        blocks.append(m.group(0))
    toast = re.search(r'<div id="toast"[^>]*></div>', tpl)
    totop = re.search(r'<button class="to-top"[\s\S]*?</button>', tpl)
    toscript = re.search(r'<script>\s*\(function\(\)\{\s*var btn = document\.getElementById\(\'toTop\'\);[\s\S]*?</script>', tpl)
    DIALOGS = {
        "dialogs": "\n".join(blocks),
        "toast": toast.group(0) if toast else '<div id="toast" role="status" aria-live="polite"></div>',
        "totop": totop.group(0) if totop else "",
        "toscript": toscript.group(0) if toscript else "",
    }
    return DIALOGS

def page_title_tag(title):
    return f"<title>{title}</title>"

OG_TAGS = ('<meta property="og:image" content="https://mina2026best.github.io/jfm-platform-demo/assets/og-cover.jpg" />\n'
           '<meta property="og:url" content="https://mina2026best.github.io/jfm-platform-demo/{fname}" />\n'
           '<link rel="canonical" href="https://mina2026best.github.io/jfm-platform-demo/{fname}" />\n'
           '<meta property="og:site_name" content="花期册 · 重庆家长升学信息与生活服务平台" />\n'
           '<meta name="twitter:card" content="summary_large_image" />')

def encode_hrefs(html):
    """v0.53：href 中的非 ASCII（如中文百科链接）统一百分号编码，保证任何浏览器/环境都能打开。"""
    import urllib.parse as _up

    def _rep(m):
        u = m.group(1)
        if all(ord(ch) < 128 for ch in u):
            return m.group(0)
        return 'href="' + _up.quote(u, safe=":/?#[]@!$&'()*+,;=%~") + '"'
    return re.sub(r'href="([^"]+)"', _rep, html)

def build_page(page, tpl, secs, css, js):
    fname = page["file"]
    # 1) head：标题与描述替换（首屏页保留原 title/desc；其余用页面专属）
    head = tpl[: tpl.find("</head>") + len("</head>")]
    if fname != "index.html":
        head = re.sub(r"<title>[\s\S]*?</title>", page_title_tag(page["title"]), head, count=1)
        head = re.sub(r'<meta name="description" content="[^"]*" />',
                      f'<meta name="description" content="{page["desc"]}" />', head, count=1)
    # v0.43：全页注入分享标签
    head = head.replace('</head>', OG_TAGS.replace('{fname}', fname) + '\n</head>')
    # 2) body：三段式（ann+top 头部 / 主内容 / 尾部）
    body_start = tpl.find("<body>") + len("<body>")
    footer_start = tpl.find("<footer>")
    first_dialog = tpl.find('<dialog id="school-modal">')
    body_tpl = tpl[body_start:footer_start]
    footer = convert_links(tpl[footer_start:first_dialog])
    # 头部：ann-bar + .top 块（到 mobile-menu 结束）
    ann_m = re.search(r'<div class="ann-bar"[^>]*>[\s\S]*?</button>\s*</div>\s*</div>', body_tpl)
    ann = ann_m.group(0) if ann_m else ""
    # .top 整块（含 mobile-menu）：从 <div class="top"> 到 mobile-menu 结束的 </div>\n</div>
    top_m = re.search(r'<div class="top">[\s\S]*?</div>\s*</div>\s*(?=<header|<section|<main)', body_tpl)
    # 兜底：直接重建头部
    demo_tag_m = re.search(r'<span class="demo-tag">[^<]*</span>', body_tpl)
    demo_tag = demo_tag_m.group(0) if demo_tag_m else '<span class="demo-tag">重庆升学信息平台</span>'
    search_m = re.search(r'<div class="searchbox">[\s\S]*?<div id="search-panel"[^>]*></div>\s*</div>', body_tpl)
    searchbox = search_m.group(0) if search_m else ""
    top_html = nav_html(fname, demo_tag, searchbox)
    # 3) 主内容
    if page.get("hero"):
        hero_m = re.search(r'<header class="hero"[\s\S]*?</header>', body_tpl)
        hero = convert_links(hero_m.group(0)) if hero_m else ""
    else:
        hero = ""
    content = ""
    for sid in page["sections"]:
        if sid in secs:
            content += "\n" + convert_links(secs[sid])
    # v0.43：内容页注入页面级 h1（无障碍文档大纲 + SEO；首屏页跳过）
    # 有 page-banner 的页面：h1 以视觉隐藏方式并入 banner（避免与 banner 标题重复）；无 banner：显示 page-h1
    if not page.get("hero") and content and '<h1' not in content:
        page_h1 = re.sub(r'\s*·\s*花期册$', '', page.get("title", "")) or page.get("title", "")
        if 'class="page-banner"' in content:
            content = content.replace('class="page-banner"',
                'class="page-banner"', 1)
            content = re.sub(r'(<div class="page-banner">)',
                r'\1<h1 class="sr-only-h1">' + page_h1 + '</h1>', content, count=1)
        else:
            content = '<div class="wrap"><h1 class="page-h1">' + page_h1 + '</h1></div>\n' + content
    dlg = extract_dialogs(tpl)
    # 4) 公告条链接改 news.html
    ann = ann.replace('href="#news"', 'href="news.html"')
    # 旧锚点书签重定向脚本（进页后若带旧 #hash 自动跳对应页）
    hash_redirect = '<script>(function(){var h=location.hash;var m={"#news":"news.html","#calendar":"calendar.html","#policy":"policy.html","#quiz":"quiz.html","#schools":"schools.html","#compare":"compare.html","#zy":"zy.html","#forum":"forum.html","#community":"community.html","#learn":"community.html","#life":"life.html","#beans":"beans.html","#me":"me.html","#plans":"plans.html","#biz":"biz.html","#data-sources":"data-sources.html","#about":"about.html","#faq":"faq.html","#problems":"problems.html","#searchpage":"search.html","#wiki":"wiki.html","#contact":"contact.html"};if(h&&m[h]){location.replace(m[h]);}})();</script>'

    out = head + "\n<body>\n\n" + f'<div id="readBar" aria-hidden="true"></div>\n\n<a class="skip-link" href="#main">跳到主要内容</a>\n\n' \
        + ann + "\n\n" + top_html + "\n\n" + hero + content \
        + "\n\n" + footer + "\n" + hash_redirect + "\n" + dlg["dialogs"] + "\n" + dlg["toast"] + "\n" + dlg["totop"] + "\n" + dlg["toscript"] + "\n</body>\n</html>"
    # skip-link 目标：无 #main 时指到 body 顶部主内容
    if 'id="main"' not in out:
        out = out.replace('<a class="skip-link" href="#main">跳到主要内容</a>',
                          '<a class="skip-link" href="index.html">回到首页</a>')
    return encode_hrefs(out)

def main():
    tpl = read(f"{SRC}/template.html")
    css, js = build_css(), build_js()
    # v0.44：P| 政策条目映射（ARTMAP 运行时合并），供问题速查真链
    _pmap = {}
    for _m in re.finditer(r'<div class="pol-item"[^>]*>\s*<h4><a class="art-t" href="articles/(article-policy-[a-z0-9]+\.html)">([^<]+)</a>', tpl):
        _pmap["P|" + _m.group(2).strip()] = _m.group(1)
    if _pmap:
        js += "\n;(function(){ if(typeof ARTMAP !== 'undefined'){ for(var k in " + json.dumps(_pmap, ensure_ascii=False) + "){ ARTMAP[k] = " + json.dumps(_pmap, ensure_ascii=False) + "[k]; } } })();"
    secs = extract_sections(tpl)
    missing = [p for pg in PAGES for p in pg["sections"] if p not in secs]
    if missing:
        sys.exit("[build] 模板缺少 section：" + ",".join(set(missing)))
    # ---------- v0.51：CSS/JS 拆为外链资源（内容哈希命名，跨页长缓存） ----------
    # 文章页样式 = 主 css + art 附加段，两个使用方共享同一份 app.css
    built = []
    total = 0
    ART_CSS_EXTRA = """
  /* 文章详情页样式 */
  .crumb{font-size:12.5px;color:var(--muted);margin:18px 0 4px}
  .crumb a{color:var(--accent);text-decoration:none}
  .art{background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:34px 36px;margin-top:10px}
  .art-kicker{font-family:var(--mono);font-size:11px;letter-spacing:.16em;color:var(--accent);text-transform:uppercase;margin-bottom:10px}
  .art h1{font-family:var(--serif);font-size:27px;color:var(--navy);line-height:1.35;margin:0 0 10px}
  .art-meta{display:flex;gap:14px;flex-wrap:wrap;font-family:var(--mono);font-size:11.5px;color:var(--muted);padding-bottom:16px;border-bottom:1px solid var(--line);margin-bottom:18px}
  .art-status{color:var(--acc);color:var(--accent)}
  .art-body{font-size:14.5px;color:var(--ink2);line-height:1.9}
  .art-body p{margin:0 0 14px}
  .art-body h3{font-family:var(--serif);font-size:17px;color:var(--navy);margin:18px 0 8px}
  .art-body a{color:var(--accent)}
  .art-table{width:100%;border-collapse:collapse;margin:12px 0}
  .art-table td{padding:9px 12px;border-bottom:1px solid var(--line);font-size:13.5px;vertical-align:top}
  .art-table td:first-child{width:110px;color:var(--ink);font-weight:500}
  .art-quote{background:var(--accent-soft);border-radius:8px;padding:10px 14px;font-size:13.5px;margin:8px 0;color:var(--ink2)}
  .badge-ok{font-family:var(--mono);font-size:10.5px;color:var(--accent);margin-right:6px}
  .verdict-big{display:inline-block;font-family:var(--mono);font-size:13px;font-weight:700;border-radius:6px;padding:4px 12px;margin-bottom:14px}
  .verdict-big.false{background:#F5E0DE;color:#B3261E}
  .verdict-big.warn{background:#F7EDD9;color:#8A6116}
  .verdict-big.ok{background:#E2F1EA;color:#0E7C66}
  .verdict-big.tag{background:var(--accent-soft);color:var(--accent)}
  .art-src{font-size:12.5px;color:var(--muted);border-left:3px solid var(--accent);padding:6px 12px;margin:12px 0}
  .art-tip{font-size:13px;color:var(--muted)}
  .art-link{color:var(--accent);text-decoration:none;border-bottom:1px dashed var(--accent)}
  .art-foot{margin-top:26px;padding-top:14px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
  .art-back{font-size:13px;color:var(--accent);text-decoration:none;font-weight:600}
  .art-back:hover{text-decoration:underline}
  .art-note{font-size:12px;color:var(--muted)}
  html.theme-dark .art{background:var(--paper)}
  html.theme-dark .art-body{color:var(--ink2)}
  .art-photo{margin:2px 0 16px;border-radius:12px;overflow:hidden}
  .art-photo img{width:100%;display:block;aspect-ratio:21/9;object-fit:cover;object-position:center 42%}
  @media print{ .art-photo{display:none} }
  @media (max-width:720px){ .art{padding:22px 18px} .art h1{font-size:22px} }
  """
    full_css = css + ART_CSS_EXTRA
    assets_dir = os.path.join(ROOT, "assets")
    os.makedirs(assets_dir, exist_ok=True)
    css_hash = hashlib.sha256(full_css.encode()).hexdigest()[:8]
    js_hash = hashlib.sha256(js.encode()).hexdigest()[:8]
    css_file = f"app.{css_hash}.css"
    js_file = f"app.{js_hash}.js"
    with open(os.path.join(assets_dir, css_file), "w", encoding="utf-8") as f:
        f.write(full_css)
    with open(os.path.join(assets_dir, js_file), "w", encoding="utf-8") as f:
        f.write(js)
    # 清理旧哈希产物，防 assets/ 膨胀
    for fn in os.listdir(assets_dir):
        if fn.startswith("app.") and fn not in (css_file, js_file):
            os.remove(os.path.join(assets_dir, fn))
    built.append(f"assets/{css_file} · {len(full_css)//1024} KB")
    built.append(f"assets/{js_file} · {len(js)//1024} KB")

    # 404 兜底页（门户标配）
    demo_tag_m = re.search(r'<span class="demo-tag">[^<]*</span>', tpl)
    demo_tag = demo_tag_m.group(0) if demo_tag_m else '<span class="demo-tag">重庆升学信息平台</span>'
    nf = (
        '<!doctype html>\n<html lang="zh-CN">\n<head>\n'
        '<meta charset="utf-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1" />\n'
        '<title>页面未找到 · 花期册</title>\n<meta name="theme-color" content="#24344D" />\n'
        '<link rel="stylesheet" href="assets/' + css_file + '" />\n</head>\n<body>\n'
        '<div class="top"><div class="wrap">'
        '<a class="logo" href="index.html" style="color:inherit;text-decoration:none"><span class="dot"></span>花期册<small>BLOOM ALMANAC - CHONGQING</small></a> '
        + demo_tag +
        '</div></div>\n'
        '<section><div class="wrap" style="text-align:center;padding:70px 20px">'
        '<div style="font-family:var(--mono);font-size:64px;color:var(--accent);font-weight:700">404</div>'
        '<h1 style="font-family:var(--serif);font-size:26px;color:var(--navy);margin:8px 0 10px">页面走丢了</h1>'
        '<p style="color:var(--ink2);font-size:14.5px;margin-bottom:22px">你要找的页面不存在或已迁移——多页改版后旧锚点会自动重定向，此处是兜底入口。</p>'
        '<p style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">'
        '<a class="btn-main" href="index.html" style="text-decoration:none">回首页</a>'
        '<a class="mini-btn" href="search.html" style="text-decoration:none;padding:10px 18px">去搜索</a>'
        '<a class="mini-btn" href="faq.html" style="text-decoration:none;padding:10px 18px">看 FAQ</a>'
        '</p></div></section>'
        '<footer><div class="wrap"><p style="font-size:12px;color:var(--muted)">花期册 · 重庆家长升学信息与生活服务平台</p></div></footer>'
        '</body>\n</html>'
    )
    with open(os.path.join(OUT_DIR, "404.html"), "w", encoding="utf-8") as f:
        f.write(nf)

    for pg in PAGES:
        if pg["file"] == "sitemap.html":
            continue  # 站点地图由 footer 覆盖，暂不单独生成
        out = build_page(pg, tpl, secs, css, js)
        out = out.replace("<style>/*__BUILD_CSS__*/</style>", f'<link rel="stylesheet" href="assets/{css_file}" />')
        out = out.replace("<script>//__BUILD_JS__</script>", f'<script src="assets/{js_file}" defer></script>')
        if "/*__BUILD_CSS__*/" in out or "//__BUILD_JS__" in out:
            sys.exit(f"[build] 占位符未替换干净：{pg['file']}")
        path = os.path.join(OUT_DIR, pg["file"])
        with open(path, "w", encoding="utf-8") as f:
            f.write(out)
        h = hashlib.sha256(out.encode()).hexdigest()[:12]
        built.append(f"{pg['file']} · {len(out)//1024} KB · sha256:{h}")
        total += len(out)
    # ---------- 文章详情页生成 ----------
    sys.path.insert(0, SRC)
    from article_gen import gen_articles
    art_css = css + """
  /* 文章详情页样式 */
  .crumb{font-size:12.5px;color:var(--muted);margin:18px 0 4px}
  .crumb a{color:var(--accent);text-decoration:none}
  .art{background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:34px 36px;margin-top:10px}
  .art-kicker{font-family:var(--mono);font-size:11px;letter-spacing:.16em;color:var(--accent);text-transform:uppercase;margin-bottom:10px}
  .art h1{font-family:var(--serif);font-size:27px;color:var(--navy);line-height:1.35;margin:0 0 10px}
  .art-meta{display:flex;gap:14px;flex-wrap:wrap;font-family:var(--mono);font-size:11.5px;color:var(--muted);padding-bottom:16px;border-bottom:1px solid var(--line);margin-bottom:18px}
  .art-status{color:var(--acc);color:var(--accent)}
  .art-body{font-size:14.5px;color:var(--ink2);line-height:1.9}
  .art-body p{margin:0 0 14px}
  .art-body h3{font-family:var(--serif);font-size:17px;color:var(--navy);margin:18px 0 8px}
  .art-body a{color:var(--accent)}
  .art-table{width:100%;border-collapse:collapse;margin:12px 0}
  .art-table td{padding:9px 12px;border-bottom:1px solid var(--line);font-size:13.5px;vertical-align:top}
  .art-table td:first-child{width:110px;color:var(--ink);font-weight:500}
  .art-quote{background:var(--accent-soft);border-radius:8px;padding:10px 14px;font-size:13.5px;margin:8px 0;color:var(--ink2)}
  .badge-ok{font-family:var(--mono);font-size:10.5px;color:var(--accent);margin-right:6px}
  .verdict-big{display:inline-block;font-family:var(--mono);font-size:13px;font-weight:700;border-radius:6px;padding:4px 12px;margin-bottom:14px}
  .verdict-big.false{background:#F5E0DE;color:#B3261E}
  .verdict-big.warn{background:#F7EDD9;color:#8A6116}
  .verdict-big.ok{background:#E2F1EA;color:#0E7C66}
  .verdict-big.tag{background:var(--accent-soft);color:var(--accent)}
  .art-src{font-size:12.5px;color:var(--muted);border-left:3px solid var(--accent);padding:6px 12px;margin:12px 0}
  .art-tip{font-size:13px;color:var(--muted)}
  .art-link{color:var(--accent);text-decoration:none;border-bottom:1px dashed var(--accent)}
  .art-foot{margin-top:26px;padding-top:14px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
  .art-back{font-size:13px;color:var(--accent);text-decoration:none;font-weight:600}
  .art-back:hover{text-decoration:underline}
  .art-note{font-size:12px;color:var(--muted)}
  html.theme-dark .art{background:var(--paper)}
  html.theme-dark .art-body{color:var(--ink2)}
  .art-photo{margin:2px 0 16px;border-radius:12px;overflow:hidden}
  .art-photo img{width:100%;display:block;aspect-ratio:21/9;object-fit:cover;object-position:center 42%}
  @media print{ .art-photo{display:none} }
  @media (max-width:720px){ .art{padding:22px 18px} .art h1{font-size:22px} }
  """
    # 文章页共享片段（与 build_page 同源重建）
    dlg = extract_dialogs(tpl)
    ann_m = re.search(r'<div class="ann-bar"[^>]*>[\s\S]*?</button>\s*</div>\s*</div>', tpl)
    ann_frag = (ann_m.group(0) if ann_m else "").replace('href="#news"', 'href="news.html"')
    search_m = re.search(r'<div class="searchbox">[\s\S]*?<div id="search-panel"[^>]*></div>\s*</div>', tpl)
    search_frag = search_m.group(0) if search_m else ""
    demo_m = re.search(r'<span class="demo-tag">[^<]*</span>', tpl)
    demo_frag = demo_m.group(0) if demo_m else '<span class="demo-tag">重庆升学信息平台</span>'
    # nav_html 在上方定义
    art_header = (
        '<div id="readBar" aria-hidden="true"></div>\n'
        '<a class="skip-link" href="index.html">回到首页</a>\n'
        + ann_frag + "\n" + nav_html("articles/x.html", demo_frag, search_frag) + "\n"
    )
    art_footer_raw = tpl[tpl.find("<footer>"): tpl.find('<dialog id="school-modal">')]
    art_footer_raw = art_footer_raw.replace('<script>//__BUILD_JS__</script>', '')  # 外链JS已单独注入
    art_footer = convert_links(art_footer_raw)
    art_dir = os.path.join(ROOT, "articles")
    articles = gen_articles(tpl, art_css, art_header, art_footer, dlg["dialogs"], "", art_dir, css_file=css_file, js_file=js_file)
    for _fn in os.listdir(art_dir):
        if _fn.endswith(".html"):
            _p = os.path.join(art_dir, _fn)
            _h = open(_p, encoding="utf-8").read()
            _h2 = encode_hrefs(_h)
            if _h2 != _h:
                open(_p, "w", encoding="utf-8").write(_h2)
    # sitemap 生成（GitHub Pages 域名，带 lastmod）
    sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    site = "https://mina2026best.github.io/jfm-platform-demo/"
    lastmod = datetime.date.today().isoformat()
    for pg_ in PAGES:
        if pg_["file"] == "sitemap.html":
            continue  # sitemap.html 无实体页（站点地图由 footer 覆盖）
        sm.append(f"<url><loc>{site}{pg_['file']}</loc><lastmod>{lastmod}</lastmod></url>")
    for fn in sorted(os.listdir(art_dir)):
        if fn.endswith(".html"):
            content_head = open(os.path.join(art_dir, fn), encoding="utf-8").read()[:300]
            if "内容已更新" in content_head:
                continue
            sm.append(f"<url><loc>{site}articles/{fn}</loc><lastmod>{lastmod}</lastmod></url>")
    sm.append("</urlset>")
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write("\n".join(sm))
    with open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf-8") as f:
        f.write("User-agent: *\nAllow: /\nSitemap: " + site + "sitemap.xml\n")
    keep = set(articles)
    stale = 0
    if os.path.isdir(art_dir):
        for fn in os.listdir(art_dir):
            if fn.endswith(".html") and fn not in keep:
                shell = (
                    '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">'
                    '<meta name="robots" content="noindex"><title>内容已更新 · 花期册</title>'
                    '</head><body><p>该内容已更新合并，正在跳转…</p>'
                    '<script>location.replace("faq.html");</script></body></html>'
                )
                with open(os.path.join(art_dir, fn), "w", encoding="utf-8") as f:
                    f.write(shell)
                stale += 1
    if stale:
        built.append(f"articles/ · {len(articles)} 篇详情页（{stale} 个旧文件已转为跳转）")
    else:
        built.append(f"articles/ · {len(articles)} 篇详情页")

    print(f"[build] 多页构建 OK · {len(built)} 项 · 合计 {total//1024} KB")
    for b in built:
        print("  · " + b)

if __name__ == "__main__":
    main()
