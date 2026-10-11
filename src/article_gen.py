#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""文章详情页生成器（build.py 调用）
为 143+ 条内容各生成独立详情网页：articles/<type>-<slug>.html
来源：seed.json（资讯46）/ schools.json（学校20）/ learn.json（学堂19）/
     template 抽取（政策12 / 求真12 / 社区10 / FAQ24）
"""
import json, os, re, hashlib

def slugify(text):
    h = hashlib.md5(text.encode("utf-8")).hexdigest()[:8]
    return h

ROOT_PAGES = {"index","news","calendar","policy","quiz","schools","compare","zy","forum","community","life","beans","me","plans","biz","data-sources","about","search","faq","wiki","contact","problems","404"}
def fix_rel(html):
    """文章页位于 articles/ 子目录：把指向站点根页面的相对链接改为 ../ 前缀。"""
    def rep(m):
        pg, rest = m.group(1), m.group(2)
        if pg.startswith("article-"):
            return m.group(0)
        if pg[:-5] not in ROOT_PAGES:
            return m.group(0)
        return 'href="../' + pg + rest + '"'
    return re.sub(r'href="([a-z0-9\-]+\.html)([^"]*)"', rep, html)

def esc(t):
    return (t or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

ART_STYLE = None  # 注入用

def article_html(cfg, css, header, footer_html, dialogs, extra_js):
    """cfg: dict(title, desc, kicker, body_html, meta_line, back, back_label)"""
    return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(cfg["title"])}</title>
<meta name="description" content="{esc(cfg["desc"])}">
<meta name="theme-color" content="#24344D">
<meta property="og:title" content="{esc(cfg["title"])}">
<meta property="og:description" content="{esc(cfg["desc"])}">
<meta property="og:type" content="article">
<link rel="canonical" href="https://mina2026best.github.io/jfm-platform-demo/articles/{cfg["fname"]}">
<script type="application/ld+json">{{"@context":"https://schema.org","@type":{cfg.get("schema_type", chr(34)+"Article"+chr(34))},"headline":"{esc(cfg["title"])}","description":"{esc(cfg["desc"])}","inLanguage":"zh-CN","datePublished":"{cfg.get("date", "2026-09-16")}","dateModified":"{cfg.get("date", "2026-09-16")}","author":{{"@type":"Organization","name":"{cfg.get("author", "花期册编辑部")}"}},"publisher":{{"@type":"Organization","name":"花期册 · BLOOM ALMANAC","logo":{{"@type":"ImageObject","url":"https://mina2026best.github.io/jfm-platform-demo/assets/og-cover.jpg"}}}},"mainEntityOfPage":"https://mina2026best.github.io/jfm-platform-demo/articles/{cfg["fname"]}"}}</script>{cfg.get("extra_ld","")}
<link rel="stylesheet" href="../assets/{cfg["css_file"]}">
<script>try{{var _tp=(localStorage.getItem('jfm_theme')||'auto');if(_tp==='dark'||(_tp==='auto'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)){{document.documentElement.classList.add('theme-dark')}}}}catch(e){{}}</script>
</head>
<body>
{header}
<main class="wrap">
  <nav class="crumb"><a href="index.html">首页</a> <span>›</span> <a href="{cfg["back"]}">{cfg["back_label"]}</a> <span>›</span> {esc(cfg["title"])[:22]}{'…' if len(cfg["title"])>22 else ''}</nav>
  <article class="art">
    <div class="art-kicker">{esc(cfg["kicker"])}</div>
    <h1>{esc(cfg["title"])}</h1>
    <div class="art-meta">{cfg["meta_line"]}</div>
    <div class="art-body">{cfg["body_html"]}</div>
    <div class="art-foot">
      <a class="art-back" href="{cfg["back"]}">← 返回{cfg["back_label"]}</a>
      <span class="art-note">{esc(cfg.get("note", "以官方当年发布为准"))}</span>
    </div>
  </article>
</main>
{footer_html}
{dialogs}
<div id="toast" role="status" aria-live="polite"></div>
<script src="../assets/{cfg["js_file"]}" defer></script>
<script>{extra_js}</script>
<script>
(function(){{
  var btn = document.createElement('button');
  btn.className = 'to-top show'; btn.textContent = '↑';
  btn.setAttribute('aria-label','返回顶部');
  btn.onclick = function(){{ window.scrollTo({{top:0,behavior:'smooth'}}); }};
  document.body.appendChild(btn);
  var bar = document.getElementById('readBar');
  function onS(){{
    if(btn) btn.classList.toggle('show', (window.scrollY||0) > 400);
    if(bar){{
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = max > 0 ? Math.min(100, Math.max(0,(window.scrollY/max)*100)).toFixed(1)+'%' : '0%';
    }}
  }}
  window.addEventListener('scroll', onS, {{passive:true}}); onS();
}})();
try{{ if(typeof initTheme==='function') initTheme(); }}catch(e){{}}
try{{ if(typeof initDialogFocusTrap==='function') initDialogFocusTrap(); }}catch(e){{}}
</script>
</body>
</html>'''

# ---------- 各类型抽取器 ----------
def extract_template_blocks(tpl, marker, count_expected=None):
    """按 class 标记抓取 <div class="marker">…（配对 div）"""
    blocks = []
    for m in re.finditer(r'<div class="' + marker + r'"[^>]*>', tpl):
        start = m.start()
        idx = m.end(); depth = 1
        while depth > 0:
            no = tpl.find('<div', idx); nc = tpl.find('</div>', idx)
            if nc == -1: break
            if no != -1 and no < nc:
                depth += 1; idx = no + 4
            else:
                depth -= 1; idx = nc + 6
        blocks.append(tpl[start:idx])
    return blocks

def gen_articles(tpl, css, header_tpl, footer_html, dialogs, extra_js, out_dir, css_file=None, js_file=None):
    CSS_FILE = css_file or ""
    JS_FILE = js_file or ""
    REG = []  # 全站文章注册表：[title, href, kicker]
    from html.parser import HTMLParser
    made = []
    os.makedirs(out_dir, exist_ok=True)
    header = header_tpl.replace('<span class="demo-tag">', '<span class="demo-tag">')  # 原样

    def write(cfg, fname):
        REG.append([cfg["kicker"], fname, cfg["title"]])
        cfg = dict(cfg, fname=fname, css_file=CSS_FILE, js_file=JS_FILE)  # canonical/外链资源用
        # 相关推荐：同类 4 篇 + 全站随机 2 篇（确定性：按 title hash 排序，构建可复现）
        rel = cfg.get("related") or []
        extra = ""
        if rel:
            extra = '<h3 class="rel-h">相关阅读</h3><div class="rel-grid">' + "".join(
                '<a class="rel-item" href="%s"><span class="rel-tag">%s</span>%s</a>' % (esc(r[1]), esc(r[0].split(" · ")[0]), esc(r[2] if len(r) > 2 else r[0]))
                for r in rel[:5]) + '</div>'
        html = article_html(cfg, css, header, footer_html, dialogs, extra_js)
        html = fix_rel(html)
        html = html.replace('<div class="art-foot">', extra + '<div class="art-foot">')
        with open(os.path.join(out_dir, fname), "w", encoding="utf-8") as f:
            f.write(html)
        made.append(fname)
        return fname

    # ===== 1) 资讯 46 =====
    seed_path = os.path.join(os.path.dirname(out_dir), "src", "news", "seed.json")
    items = json.load(open(seed_path, encoding="utf-8"))
    items = items if isinstance(items, list) else items.get("items", [])
    for x in items:
        t = x.get("t",""); 
        if not t: continue
        sl = slugify(t)
        body = '<p>' + esc(x.get("sum","")) + '</p>'
        if x.get("body"):
            body += '<p>' + esc(x["body"]).replace("\n", "</p><p>") + '</p>'
        if x.get("url"):
            body += '<p><a class="art-link" href="' + esc(x["url"]) + '" target="_blank" rel="noopener">查看原文 ↗</a></p>'
        write({
            "title": t, "desc": (x.get("sum") or t)[:120],
            "kicker": "资讯 · " + x.get("cat",""),
            "body_html": body,
            "meta_line": '<span>' + esc(x.get("src","编辑部")) + '</span><span>' + esc(x.get("date","")) + '</span><span class="art-status">已审核发布</span>',
            "date": x.get("date", ""),
            "author": x.get("src", "花期册编辑部"),
            "back": "news.html", "back_label": "资讯中心",
        }, f"article-news-{sl}.html")

    # ===== 2) 学校 20（v0.40 门户化：信息速览 / 概况 / 师资 / 特色 / 来源 / 相关资讯 / 同区学校） =====
    sch_path = os.path.join(os.path.dirname(out_dir), "src", "data", "schools.json")
    sch = json.load(open(sch_path, encoding="utf-8"))
    _sph_path = os.path.join(os.path.dirname(out_dir), "src", "data", "school_photos.json")
    _sph = json.load(open(_sph_path, encoding="utf-8")) if os.path.exists(_sph_path) else {}
    from urllib.parse import quote as _quote
    # 资讯池（种子 + 已审核采集），供学校页「相关资讯」匹配
    _news_pool = []
    try:
        _seed_items = json.load(open(os.path.join(os.path.dirname(out_dir), "src", "news", "seed.json"), encoding="utf-8"))
        for x in (_seed_items if isinstance(_seed_items, list) else []):
            _t = x.get("t", "")
            if _t: _news_pool.append({"t": _t, "sum": x.get("sum", ""), "date": x.get("date", ""), "url": x.get("url", ""), "art": "article-news-" + slugify(_t) + ".html"})
    except Exception:
        pass
    try:
        _col_items = json.load(open(os.path.join(os.path.dirname(out_dir), "src", "news", "collected.json"), encoding="utf-8"))
        for x in (_col_items if isinstance(_col_items, list) else []):
            if not x.get("reviewed"): continue
            _t = x.get("t", "")
            if _t: _news_pool.append({"t": _t, "sum": x.get("sum", ""), "date": x.get("date", ""), "url": x.get("url", ""), "art": ""})
    except Exception:
        pass

    def _rel_news_for(name, limit=4):
        base = re.sub(r'（[^）]*）', '', name)
        variants = [base]
        for p in ["重庆市", "重庆", "渝中区"]:
            if base.startswith(p) and len(base) - len(p) >= 4:
                variants.append(base[len(p):])
        seen = set(); out = []
        for x in _news_pool:
            hay = x["t"] + " " + x["sum"]
            if any((v and v in hay) for v in variants):
                if x["t"] in seen: continue
                seen.add(x["t"]); out.append(x)
                if len(out) >= limit: break
        return out

    for name, d in sch.items():
        sl = slugify(name)
        # —— 信息速览（门户式速览卡）——
        facts = []
        if d.get("创办"): facts.append(("创办", esc(d["创办"]), False))
        if d.get("校训"): facts.append(("校训", esc(d["校训"]), False))
        if d.get("校区地址"): facts.append(("校区地址", esc(d["校区地址"]), True))
        if d.get("校园规模"): facts.append(("校园规模", esc(d["校园规模"]), True))
        if d.get("官网"):
            _u = d["官网"]
            facts.append(("官网", '<a href="' + esc(_u) + '" target="_blank" rel="noopener">' + esc(re.sub(r'^https?://', '', _u).rstrip('/')) + ' ↗</a>', False))
        _file = _sph.get(name, "school-gate-1.jpg")
        body = '<div class="art-photo"><img loading="lazy" decoding="async" src="../assets/photos/' + _file + '" alt="' + esc(name) + '校园实景照片"></div>'
        if facts:
            body += '<div class="art-facts">' + "".join(
                '<div class="af-item' + (' af-wide' if w else '') + '"><span class="af-l">' + l + '</span><span class="af-v">' + v + '</span></div>'
                for l, v, w in facts) + '</div>'
        # —— 学校概况 ——
        intro = d.get("概况") or d.get("简介") or ""
        if intro:
            body += '<h3 class="art-h3">学校概况</h3><p>' + esc(intro) + '</p>'
        # —— 师资力量 ——
        if d.get("师资概况"):
            body += '<h3 class="art-h3">师资力量</h3><p>' + esc(d["师资概况"]) + '</p>'
        # —— 办学特色与荣誉 ——
        if d.get("办学特色"):
            body += '<h3 class="art-h3">办学特色与荣誉</h3><p>' + esc(d["办学特色"]) + '</p>'
        # —— 招生与通勤 ——
        rows = ""
        for k in ["办学性质", "所在区", "区划说明", "招生范围", "通勤参考", "住宿", "收费口径", "指标到校"]:
            if d.get(k): rows += f'<tr><td>{esc(k)}</td><td>{esc(d[k])}</td></tr>'
        if d.get("暂缺字段"):
            rows += f'<tr><td>暂缺字段</td><td>{esc(d["暂缺字段"])}（按合规红线不提供录取线与排名）</td></tr>'
        body += '<h3 class="art-h3">招生与通勤</h3><table class="art-table"><tbody>' + rows + '</tbody></table>'
        # —— 家长评价 ——
        evs = d.get("评价") or []
        if evs:
            body += '<h3 class="art-h3">家长评价（审核制）</h3>'
            for e in evs:
                body += f'<div class="art-quote"><span class="badge-ok">{esc(e["badge"])}</span> {esc(e["text"])}</div>'
        # —— 相关资讯（按校名匹配站内资讯）——
        rel_news = _rel_news_for(name)
        if rel_news:
            body += '<h3 class="art-h3">相关资讯</h3><div class="art-rel-grid">'
            for x in rel_news:
                if x["art"]:
                    href, ext = x["art"], ""
                elif x["url"]:
                    href, ext = x["url"], ' target="_blank" rel="noopener"'
                else:
                    href, ext = "news.html?s=" + _quote(x["t"][:12]), ""
                body += '<a class="art-rel-item" href="' + esc(href) + '"' + ext + '><span class="rtag">' + esc(x["date"] or "资讯") + '</span><span class="t">' + esc(x["t"]) + '</span></a>'
            body += '</div>'
        # —— 同区学校 ——
        same_qu = [k2 for k2, v2 in sch.items() if v2.get("所在区") and v2.get("所在区") == d.get("所在区") and k2 != name][:4]
        if same_qu:
            body += '<h3 class="art-h3">同区学校</h3><div class="art-rel-grid">'
            for k2 in same_qu:
                body += '<a class="art-rel-item" href="article-school-' + slugify(k2) + '.html"><span class="rtag">' + esc(d.get("所在区", "")) + '</span><span class="t">' + esc(k2) + '</span></a>'
            body += '</div>'
        # —— 数据来源与核验 ——
        body += '<h3 class="art-h3">数据来源与核验</h3>'
        if d.get("数据来源"):
            body += '<p>' + esc(d["数据来源"]) + '</p>'
        if d.get("资料采集"):
            body += '<p class="art-tip">' + esc(d["资料采集"]) + '</p>'
        if d.get("资料来源"):
            def _src_label(u):
                _m = re.match(r'https?://([^/]+)', str(u))
                host = (_m.group(1) if _m else '').lower().lstrip('www.')
                if 'baike.baidu.com' in host: return '百科词条 ↗'
                if host.endswith('.gov.cn'): return '政府公开信息 ↗'
                if 'swu.edu.cn' in host: return '校方官网（西南大学）↗'
                return host + ' ↗'
            body += '<ul class="art-src-list">' + "".join(
                '<li><a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(_src_label(u)) + '</a></li>'
                for u in d["资料来源"]) + '</ul>'
        # —— JSON-LD 结构化数据（SEO 门户标配）——
        _ld = {"@context": "https://schema.org", "@type": "School", "name": d.get("全称") or name}
        if d.get("官网"): _ld["url"] = d["官网"]
        if d.get("校区地址"): _ld["address"] = d["校区地址"]
        _ym = re.search(r'\d{4}', str(d.get("创办", "")))
        if _ym: _ld["foundingDate"] = _ym.group(0)
        body += '<script type="application/ld+json">' + json.dumps(_ld, ensure_ascii=False).replace("</", "<\\/") + '</script>'
        body += '<p class="art-tip">想在对比中查看该校？回到 <a class="art-link" href="schools.html?school=' + esc(name) + '">学校档案库</a>，或加入<a class="art-link" href="compare.html">择校对比器</a>。</p>'
        _meta_spans = ''
        if d.get("全称"): _meta_spans += '<span>' + esc(d["全称"]) + '</span>'
        _meta_spans += '<span>' + esc(d.get("办学性质", "")) + '</span><span>' + esc(d.get("所在区", "")) + '</span><span>' + esc(d.get("数据来源", "")) + '</span>'
        write({
            "title": name + " · 学校档案", "desc": (d.get("概况") or d.get("简介") or name)[:120],
            "kicker": "学校档案 · " + d.get("所在区", ""),
            "body_html": body,
            "meta_line": _meta_spans,
            "back": "schools.html", "back_label": "学校档案库",
        }, f"article-school-{sl}.html")

    # ===== 3) 学堂 19 =====
    learn_path = os.path.join(os.path.dirname(out_dir), "src", "data", "learn.json")
    learn = json.load(open(learn_path, encoding="utf-8"))
    for x in learn.get("qa", []):
        sl = slugify(x["q"])
        write({
            "title": x["q"], "desc": x["a"][:120],
            "kicker": "家长学堂 · 专家问答 · " + x.get("s",""),
            "body_html": '<p>' + esc(x["a"]) + '</p><p class="art-tip">回答人：' + esc(x.get("by","")) + '。更多同类问答见<a class="art-link" href="community.html">家长学堂</a>。</p>',
            "meta_line": '<span>' + esc(x.get("by","")) + '</span><span>分类：' + esc(x.get("s","")) + '</span>',
            "back": "community.html", "back_label": "家长社区 · 学堂",
        }, f"article-learn-{sl}.html")
    for x in learn.get("tips", []):
        sl = slugify(x["q"])
        write({
            "title": x["q"], "desc": x["a"][:120],
            "kicker": "家长学堂 · 过来人经验 · " + x.get("s",""),
            "body_html": '<p>' + esc(x["a"]) + '</p><p class="art-tip">分享人：' + esc(x.get("by","")) + '。更多经验帖见<a class="art-link" href="community.html">家长社区</a>。</p>',
            "meta_line": '<span>' + esc(x.get("by","")) + '</span><span>分类：' + esc(x.get("s","")) + '</span>',
            "back": "community.html", "back_label": "家长社区 · 学堂",
        }, f"article-experience-{sl}.html")

    # ===== 4) 政策 12 =====
    for blk in extract_template_blocks(tpl, "pol-item"):
        tm = re.search(r"<h4>(?:<a class=\"art-t\"[^>]*>)?([^<]+?)(?:</a>)?</h4>", blk)
        if not tm: continue
        title = tm.group(1)
        sl = slugify(title)
        inner = blk[re.search(r'<div class="pol-item"[^>]*>', blk).end():-len("</div>")]
        meta = re.search(r'<div class="meta">([\s\S]*?)</div>', inner)
        body = '<div class="art-meta-inline">' + (meta.group(1) if meta else "") + '</div>'
        rest = inner[inner.find("</div>", inner.find('<div class="meta">'))+6:] if meta else inner
        rest = re.sub(r'^\s*</div>\s*', '', rest)
        body += rest
        write({
            "title": title, "desc": re.sub(r"<[^>]+>", "", meta.group(1))[:120] if meta else title,
            "kicker": "政策库 · 人话版",
            "body_html": body,
            "meta_line": meta.group(1) if meta else "",
            "back": "policy.html", "back_label": "政策库",
        }, f"article-policy-{sl}.html")

    # ===== 5) 求真 12 =====
    for blk in extract_template_blocks(tpl, "rq-card"):
        tm = re.search(r"<h4>(?:<a class=\"art-t\"[^>]*>)?([^<]+?)(?:</a>)?</h4>", blk)
        if not tm: continue
        title = tm.group(1)
        sl = slugify(title)
        verdict = re.search(r'<span class="verdict ([a-z]+)">([^<]*)</span>', blk)
        vtxt = verdict.group(2) if verdict else ""
        src = re.search(r'<div class="src">([\s\S]*?)</div>', blk)
        p = re.search(r"<p>([\s\S]*?)</p>", blk)
        body = ('<div class="verdict-big ' + (verdict.group(1) if verdict else '') + '">' + esc(vtxt) + '</div>'
                + '<p>' + (p.group(1) if p else '') + '</p>'
                + '<div class="art-src">' + (src.group(1) if src else '') + '</div>')
        write({
            "title": "求真核验：" + title.strip("「」"), "desc": (p.group(1) if p else title)[:120],
            "kicker": "求真台 · 核验结论",
            "body_html": body,
            "meta_line": '<span>结论：' + esc(vtxt) + '</span><span>双人复核后发布</span>',
            "back": "fact.html", "back_label": "求真辟谣台",
        }, f"article-fact-{sl}.html")

    # ===== 6) 社区 10 =====
    for blk in extract_template_blocks(tpl, "thread"):
        tm = re.search(r"<h4>(?:<a class=\"art-t\"[^>]*>)?([^<]+?)(?:</a>)?</h4>", blk)
        if not tm: continue
        title = tm.group(1)
        sl = slugify(title)
        badge = re.search(r'<span class="badge[^"]*">([^<]*)</span>', blk)
        pm = re.search(r"<p>([^<]*)</p>", blk)
        n = re.search(r'<span class="n">([^<]*)</span>', blk)
        body = ('<div class="verdict-big tag">' + esc(badge.group(1) if badge else "讨论") + '</div>'
                + '<p>' + esc(pm.group(1) if pm else '') + '</p>'
                + '<p class="art-tip">本帖为社区内容，回帖与同城匹配持续开放中。更多讨论见<a class="art-link" href="community.html">家长社区</a>。</p>')
        write({
            "title": title, "desc": (pm.group(1) if pm else title)[:120],
            "kicker": "家长社区 · " + (badge.group(1) if badge else "讨论"),
            "body_html": body,
            "meta_line": '<span>' + esc(n.group(1) if n else "") + '</span>',
            "back": "community.html", "back_label": "家长社区",
        }, f"article-thread-{sl}.html")

    # ===== 7) FAQ 24（details 结构，单独抽取；限定在 faq section 区段内，排除 wiki 条目） =====
    faq_start = tpl.find('<section id="faq"')
    faq_end = tpl.find('</section>', faq_start)
    tpl_faq = tpl[faq_start:faq_end]
    for m in re.finditer(r'<details class="faq-item"([^>]*)>', tpl_faq):
        start = m.start()
        idx = m.end(); depth = 1
        while depth > 0:
            no = tpl_faq.find('<details', idx); nc = tpl_faq.find('</details>', idx)
            if nc == -1: break
            if no != -1 and no < nc:
                depth += 1; idx = no + 8
            else:
                depth -= 1; idx = nc + 10
        blk = tpl_faq[start:idx]
        qm = re.search(r"<summary>[\s\S]*?<span class=\"cat\">([^<]*)</span>(?:<a class=\"art-t faq-q\"[^>]*>)?([^<]+?)(?:</a>)?</summary>", blk)
        if not qm: continue
        cat, q = qm.group(1), qm.group(2).strip()
        sl = slugify(q)
        am = re.search(r'<div class="a">([\s\S]*?)</div>\s*</details>', blk)
        body = '<p>' + (am.group(1) if am else "") + '</p>'
        body += '<p class="art-tip">更多同类问题见<a class="art-link" href="faq.html">家长 FAQ</a>；相关工具与政策已在上文链接中。</p>'
        import re as _re2
        _ans_txt = _re2.sub(r"<[^>]+>", "", am.group(1) if am else "")
        import json as _json
        _faq_ld = ('<script type="application/ld+json">' + _json.dumps({
            "@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": _ans_txt.strip()[:500]}}]
        }, ensure_ascii=False) + '</script>')
        write({
            "title": q, "desc": _ans_txt[:120] or q,
            "kicker": "家长 FAQ · " + cat,
            "schema_type": '"FAQPage"',
            "extra_ld": _faq_ld,
            "body_html": body,
            "meta_line": '<span>分类：' + esc(cat) + '</span>',
            "back": "faq.html", "back_label": "家长 FAQ",
        }, f"article-faq-{sl}.html")

    # ---- 第二轮：为每篇补相关推荐并重写 ----
    by_kicker = {}
    for k, f, t in REG:
        by_kicker.setdefault(k.split(" · ")[0], []).append((k, f, t))
    allreg = sorted(REG, key=lambda r: r[2])
    for k, f, t in REG:
        grp = by_kicker.get(k.split(" · ")[0], [])
        same = [r for r in grp if r[1] != f][:4]
        pool = [r for r in allreg if r[1] != f and r not in same]
        i = int(hashlib.md5(f.encode()).hexdigest(), 16)
        extra = []
        for j in range(min(2, len(pool))):
            extra.append(pool[(i + j * 7919) % len(pool)])
        rel = same + extra
        fp = os.path.join(out_dir, f)
        html = open(fp, encoding="utf-8").read()
        rel_html = '<h3 class="rel-h">相关阅读</h3><div class="rel-grid">' + "".join(
            '<a class="rel-item" href="%s"><span class="rel-tag">%s</span>%s</a>' % (esc(r[1]), esc(r[0].split(" · ")[0]), esc(r[2]))
            for r in rel[:5]) + '</div>'
        html = html.replace('<div class="art-foot">', rel_html + '<div class="art-foot">')
        with open(fp, "w", encoding="utf-8") as fh:
            fh.write(html)
    return made
