#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""花期册 · 渲染级冒烟测试（v0.54）

为什么需要它：本站是「数据 + JS 渲染」架构，构建成功 ≠ 页面可用。
本次两个真实故障（boot 提前执行致 boot 链中断、hrefEnc 被注入进 esc 函数体）都能通过
构建、静态检查、链接巡检，只有真实浏览器渲染才暴露。

做法：把目标页复制成临时探针页（注入 window.onerror 捕获 + load 后自检），
用 headless Chrome dump DOM，解析探针 JSON 断言。临时文件用完即删。

用法：
  python3 smoke_test.py            # 全部页面
  python3 smoke_test.py index.html # 指定页面
退出码 0 = 全部通过，1 = 有断言失败。
"""
import json, os, re, shutil, subprocess, sys, time, socket, threading, http.server, functools

ROOT = os.path.dirname(os.path.abspath(__file__))
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# 每个页面要断言的渲染结果：{页面: [(选择器或JS表达式, 期望下限, 说明)]}
CHECKS = {
    "index.html":     [("#dao-home .dao-cat", 6, "首页导航分类块"), ("#dao-home .dao-list a", 33, "首页导航链接（5类×6 + 在线课程3）"),
                       ("#today-bar .tb-date", 1, "今日信息条"), ("#dao-quick a", 6, "热门直达"),
                       ("#dao-zheng b", 1, "区划提醒卡"), ("#hot-rank a", 3, "热门榜条目"),
                       (".toc-grid a", 9, "册页目录条目"), (".toc-head h3", 1, "册页目录标题"),
                       (".stage-doors .sd", 3, "三场景关口卡（小升初/初升高/大学与专业选报）"),
                       ("#stage-chips a", 4, "首屏按学段直达胶囊"),
                       ("#home-top .entries .entry", 3, "首屏尾部下移后的三个任务入口"),
                       ("#home-top #hot-rank .hot-item, #home-top #hot-rank a", 3, "首屏尾部下移后的要闻榜")],
    "daohang.html":   [("#dao-full .dao-cat", 11, "导航页分类块"), ("#dao-full .dao-list a", 73, "导航页链接总数"),
                       (".dao-chip", 11, "分类锚点"), ("#dao-zheng b", 1, "区划提醒卡"),
                       ("#today-bar .tb-date", 1, "今日信息条"), ("#dao-quick a", 6, "热门直达")],
    "news.html":      [("#news-list .news-item", 20, "资讯列表条目"), ("#news-list .ni-cover img", 20, "资讯封面图"),
                       ("#news-list .news-item.lead", 1, "首条大图卡"), ("#news-list .news-item.lead .ni-cover img", 1, "首条大图"),
                       (".news-filter .ff", 6, "分类筛选按钮")],
    "about.html":     [(".toc-grid a", 9, "册页目录条目（关于页）")],
    "data-sources.html": [("#ds-table tr", 3, "数据来源表行")],
    "schools.html":   [("#school-grid .school-card", 20, "学校卡片"), ("#school-grid .sc-art img", 20, "学校照片")],
    "articles/article-school-54671c45.html": [("a[href^='http']", 2, "文章页外链")],
}
MOBILE_PAGES = ["index.html", "daohang.html", "news.html", "schools.html", "policy.html"]
# v0.62：学段深链（首页「按学段直达」→ 目标页按 hash 落地）需要带 hash 渲染才能验证
# (页面, hash, 选择器, 下限, 上限, 说明)
DEEPLINK = [
    ("calendar.html", "#初升高", "#calendar .cal:not([style*='display: none'])", 1, 6, "日历学段深链：只留初升高节点"),
    ("wiki.html", "#高考", "#wiki details[open][data-cat='高考']", 1, 1, "百科学段深链：高考阶段自动展开"),
    ("wiki.html", "#高考", "#wiki details[open]", 1, 1, "百科学段深链：只展开命中的那一个阶段（默认展开的幼升小已收起）"),
]
MOBILE_PROBE = r'''
<script>
window.addEventListener('load', function(){
  var de = document.documentElement;
  var over = [];
  function inScroller(e){                      // 横滑容器内的子元素本就超出视口，不算缺陷
    for(var a = e.parentElement; a && a !== document.body; a = a.parentElement){
      var ox = getComputedStyle(a).overflowX;
      if(ox === 'auto' || ox === 'scroll') return true;
    }
    return false;
  }
  document.querySelectorAll('section *').forEach(function(e){
    var r = e.getBoundingClientRect();
    if(r.width > 0 && r.right > de.clientWidth + 2 && !inScroller(e)) over.push((e.className || e.tagName) + ':' + Math.round(r.right));
  });
  var minFs = 99, small = 0;
  document.querySelectorAll('section p, section li a, section span').forEach(function(e){
    if(!e.textContent.trim()) return;
    var f = parseFloat(getComputedStyle(e).fontSize);
    if(f < minFs) minFs = f;
    if(f < 11.5) small++;
  });
  var visCovers = 0;
  document.querySelectorAll('.ni-cover').forEach(function(e){ if(e.offsetParent !== null && e.getBoundingClientRect().height > 20) visCovers++; });
  var n = document.createElement('div');
  n.textContent = 'MOB ' + JSON.stringify({scrollW: de.scrollWidth, clientW: de.clientWidth,
    over: over.slice(0, 4), overCount: over.length, minFs: minFs, tinyText: small, visCovers: visCovers});
  document.body.appendChild(n);
});
</script>
'''


PROBE = r'''
<script>
window.__errs = [];
window.onerror = function(m, s, l, c){ window.__errs.push(String(m) + ' @' + l + ':' + c); };
window.addEventListener('load', function(){
  var out = { errs: window.__errs.slice(0, 5), booted: !!window.__booted, counts: {} };
  var sel;
  try { sel = window.__SMOKE_SEL || []; } catch(e) { sel = []; }
  for (var i = 0; i < sel.length; i++) {
    out.counts[sel[i]] = document.querySelectorAll(sel[i]).length;
  }
  var n = document.createElement('div');
  n.id = '__smoke_out';
  n.textContent = 'SMOKE ' + JSON.stringify(out);
  document.body.appendChild(n);
});
</script>
'''


def free_port():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p


class _Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):        # 静默：只保留 [smoke] 结果行
        pass


def serve(port):
    handler = functools.partial(_Quiet, directory=ROOT)
    httpd = http.server.ThreadingHTTPServer(('127.0.0.1', port), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def render(port, page, selectors, timeout=45, probe=None, width=None, marker='SMOKE', frag=''):
    """复制页面 → 注入探针 → chrome dump-dom → 解析"""
    src = os.path.join(ROOT, page)
    if not os.path.exists(src):
        return {"errs": ["页面不存在"], "counts": {}}
    raw = open(src, encoding='utf-8').read()
    probe = (probe or PROBE).replace('window.__SMOKE_SEL || []', json.dumps(selectors))
    tmpname = '_smoke_tmp_' + os.path.basename(page).replace('/', '_')
    tmp = os.path.join(ROOT, tmpname)
    rel = os.path.relpath(ROOT, os.path.dirname(src))
    prefix = ('' if rel == '.' else rel + '/')
    probe2 = probe.replace('assets/', prefix + 'assets/')
    open(tmp, 'w', encoding='utf-8').write(raw.replace('<head>', '<head>' + probe2, 1))
    # Chrome 的 --dump-dom 常写完 DOM 后不退出：轮询产物，命中探针标记即收工，超时则杀进程
    # v0.62 修复（实测踩到）：headless Chrome 不退出 → 同一个 user-data-dir 起第二次时，
    # 新进程会把请求转交给仍在跑的老实例、自己立刻退出，dump 产物为空 → 断言假失败（深链第 3 条实测 0/1）。
    # 故每次渲染用独立 profile 目录，并保证本进程结束后立刻回收。
    outfile = tmp + '.out'
    udir = '/tmp/chrome-smoke-%s-%d' % (os.path.basename(page).replace('.', '_'), int(time.time() * 1000) % 1000000)
    with open(outfile, 'w') as fh:
        proc = subprocess.Popen(
            [CHROME, '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
             '--disable-extensions', '--user-data-dir=' + udir,
             '--virtual-time-budget=6000'] + (['--window-size=' + width] if width else []) +
            ['--dump-dom', f'http://127.0.0.1:{port}/{tmpname}{frag}'],
            stdout=fh, stderr=subprocess.DEVNULL)
        deadline = time.time() + timeout
        while time.time() < deadline:
            if proc.poll() is not None:
                break
            try:
                if marker + ' {' in open(outfile, encoding='utf-8', errors='ignore').read():
                    break
            except Exception:
                pass
            time.sleep(0.6)
        if proc.poll() is None:
            proc.kill()
        try:
            proc.wait(timeout=5)
        except Exception:
            pass
    shutil.rmtree(udir, ignore_errors=True)
    out = open(outfile, encoding='utf-8', errors='ignore').read()
    for f in (tmp, outfile):
        if os.path.exists(f):
            os.remove(f)
    m = re.search(marker.replace('SMOKE', 'SMOKE') + r' (\{.*?\})</div>', out, re.S) if marker == 'SMOKE' \
        else re.search(marker + r' (\{.*?\})</div>', out, re.S)
    if not m:
        return {"errs": ["探针未执行（页面可能未加载完）"], "counts": {}}
    try:
        return json.loads(m.group(1))
    except Exception as e:
        return {"errs": ["探针解析失败: " + str(e)], "counts": {}}


def cleanup_chrome():
    """headless Chrome 常不退出（子进程会累积），收尾统一清掉本工具起的实例。
    ponytail: 只杀带本工具 user-data-dir 前缀的进程，不碰用户自己的浏览器。"""
    subprocess.run(['pkill', '-f', 'user-data-dir=/tmp/chrome-smoke'], capture_output=True)
    subprocess.run(['pkill', '-f', 'user-data-dir=/tmp/chrome-inv'], capture_output=True)


def main():
    pages_arg = sys.argv[1:]
    pages = pages_arg or list(CHECKS.keys())
    if not os.path.exists(CHROME):
        print("[smoke] 未找到 Chrome，跳过渲染冒烟测试"); return 0
    port = free_port(); httpd = serve(port); time.sleep(0.5)
    fails = []
    for page in pages:
        specs = CHECKS.get(page, [])
        sel = [s for s, _, _ in specs]
        r = render(port, page, sel)
        bad = list(r.get("errs") or [])
        if not r.get("booted"):
            bad.append("boot 未完成（window.__booted=false）")
        detail = []
        for spec in specs:
            s, minimum, label = spec[0], spec[1], spec[2]
            maximum = spec[3] if len(spec) > 3 else None      # 可选上限：用于「筛选后不该还有 N 条」这类断言
            n = int(r.get("counts", {}).get(s, 0))
            ok = n >= minimum and (maximum is None or n <= maximum)
            detail.append(f"{label} {n}/{minimum}{'✓' if ok else '✗'}")
            if not ok:
                bad.append(f"{label} 渲染不符：{n}（期望 ≥{minimum}" + (f"、≤{maximum}" if maximum else "") + "）")
        status = "✓ PASS" if not bad else "✗ FAIL"
        print(f"[smoke] {status} {page}  " + " | ".join(detail))
        for b in bad:
            print(f"          ✗ {b}")
        if bad:
            fails.append(page)
    # —— 窄屏：断言"无横向溢出"（真缺陷类别）——
    # 实测口径修正（v0.62）：headless Chrome 在 macOS 有窗口宽度下限，--window-size=390 实际渲染宽度是
    # 485 CSS px（探针实测 innerW=500/clientW=485；--headless=old、--force-device-scale-factor 都改不动）。
    # 也就是说本段验证的是"≤485px 窄屏"，不是真 390px；要测 390 需 CDP Emulation.setDeviceMetricsOverride。
    print("[smoke] 移动端口径：实测视口 485 CSS px（macOS headless 下限），非真 390px")
    for page in [x for x in MOBILE_PAGES if (not pages_arg or x in pages_arg)]:
        r = render(port, page, [], probe=MOBILE_PROBE, width="390,1400", marker='MOB', timeout=60)
        if not r or 'scrollW' not in r:          # Chrome 偶发渲染超时：重试一次再判失败
            r = render(port, page, [], probe=MOBILE_PROBE, width="390,1400", marker='MOB', timeout=60)
        if not r or 'scrollW' not in r:
            print(f"[smoke] ✗ FAIL {page} 移动端：未取到指标")
            fails.append(page + '(mobile)'); continue
        over = r.get('overCount', 0)
        ok = r['scrollW'] <= r['clientW'] + 2 and over == 0
        if page == 'news.html' and r.get('visCovers', 0) < 10:
            ok = False; bad_cov = f" | 可见缩略图仅 {r.get('visCovers')}（应 ≥10）"
        else:
            bad_cov = f" | 缩略图 {r.get('visCovers')}"
        print(f"[smoke] {'✓ PASS' if ok else '✗ FAIL'} {page} 移动端：滚动宽 {r['scrollW']}/{r['clientW']} "
              f"| 溢出元素 {over} | 最小字号 {r['minFs']}px | <11.5px 文本 {r['tinyText']} 处{bad_cov}"
              + ('' if ok else f" | 例：{r.get('over')}"))
        if not ok:
            fails.append(page + '(mobile)')
    # —— 学段深链（带 hash 渲染）：首页「按学段直达」的落地点，坏了不会影响页面外观 ——
    dl_fails = []
    for page, frag, sel, lo, hi, label in DEEPLINK:
        if pages_arg and page not in pages_arg:
            continue
        r = render(port, page, [sel], frag=frag)
        n = int(r.get("counts", {}).get(sel, 0))
        ok = bool(r.get("booted")) and lo <= n <= hi
        print(f"[smoke] {'✓ PASS' if ok else '✗ FAIL'} {page}{frag}：{label} → {n}（期望 {lo}–{hi}）")
        if not ok:
            dl_fails.append(page + frag)
            fails.append(page + frag)
    if not pages_arg:
        print(f"[smoke] 深链结果：{len(DEEPLINK) - len(dl_fails)}/{len(DEEPLINK)} 通过")
    cleanup_chrome()
    print(f"[smoke] 结果：{len(pages) - len([f for f in fails if f in pages])}/{len(pages)} 页面通过"
          + (f"，失败项：{'、'.join(fails)}" if fails else ""))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
