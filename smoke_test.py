#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""家长屿 · 渲染级冒烟测试（v0.54）

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
                       ("#dao-zheng b", 1, "区划提醒卡"), ("#hot-rank a", 3, "热门榜条目")],
    "daohang.html":   [("#dao-full .dao-cat", 11, "导航页分类块"), ("#dao-full .dao-list a", 73, "导航页链接总数"),
                       (".dao-chip", 11, "分类锚点"), ("#dao-zheng b", 1, "区划提醒卡"),
                       ("#today-bar .tb-date", 1, "今日信息条"), ("#dao-quick a", 6, "热门直达")],
    "news.html":      [("#news-list .news-item", 20, "资讯列表条目"), ("#news-list .ni-cover img", 20, "资讯封面图")],
    "data-sources.html": [("#ds-table tr", 3, "数据来源表行")],
    "schools.html":   [("#school-grid .school-card", 20, "学校卡片"), ("#school-grid .sc-art img", 20, "学校照片")],
    "articles/article-school-54671c45.html": [("a[href^='http']", 2, "文章页外链")],
}
MOBILE_PAGES = ["index.html", "daohang.html", "news.html", "schools.html", "policy.html"]
MOBILE_PROBE = r'''
<script>
window.addEventListener('load', function(){
  var de = document.documentElement;
  var over = [];
  document.querySelectorAll('section *').forEach(function(e){
    var r = e.getBoundingClientRect();
    if(r.width > 0 && r.right > de.clientWidth + 2) over.push((e.className || e.tagName) + ':' + Math.round(r.right));
  });
  var minFs = 99, small = 0;
  document.querySelectorAll('section p, section li a, section span').forEach(function(e){
    if(!e.textContent.trim()) return;
    var f = parseFloat(getComputedStyle(e).fontSize);
    if(f < minFs) minFs = f;
    if(f < 11.5) small++;
  });
  var n = document.createElement('div');
  n.textContent = 'MOB ' + JSON.stringify({scrollW: de.scrollWidth, clientW: de.clientWidth,
    over: over.slice(0, 4), overCount: over.length, minFs: minFs, tinyText: small});
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


def render(port, page, selectors, timeout=45, probe=None, width=None, marker='SMOKE'):
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
    outfile = tmp + '.out'
    with open(outfile, 'w') as fh:
        proc = subprocess.Popen(
            [CHROME, '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
             '--disable-extensions', '--user-data-dir=/tmp/chrome-smoke-' + os.path.basename(page).replace('.', '_'),
             '--virtual-time-budget=6000'] + (['--window-size=' + width] if width else []) +
            ['--dump-dom', f'http://127.0.0.1:{port}/{tmpname}'],
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
        for s, minimum, label in specs:
            n = int(r.get("counts", {}).get(s, 0))
            ok = n >= minimum
            detail.append(f"{label} {n}/{minimum}{'✓' if ok else '✗'}")
            if not ok:
                bad.append(f"{label} 渲染不足：{n} < {minimum}")
        status = "✓ PASS" if not bad else "✗ FAIL"
        print(f"[smoke] {status} {page}  " + " | ".join(detail))
        for b in bad:
            print(f"          ✗ {b}")
        if bad:
            fails.append(page)
    # —— 移动端（390px）：断言"无横向溢出"（真缺陷类别）——
    for page in [x for x in MOBILE_PAGES if (not pages_arg or x in pages_arg)]:
        r = render(port, page, [], probe=MOBILE_PROBE, width="390,1400", marker='MOB')
        if not r or 'scrollW' not in r:
            print(f"[smoke] ✗ FAIL {page} 移动端：未取到指标")
            fails.append(page + '(mobile)'); continue
        over = r.get('overCount', 0)
        ok = r['scrollW'] <= r['clientW'] + 2 and over == 0
        print(f"[smoke] {'✓ PASS' if ok else '✗ FAIL'} {page} 移动端：滚动宽 {r['scrollW']}/{r['clientW']} "
              f"| 溢出元素 {over} | 最小字号 {r['minFs']}px | <11.5px 文本 {r['tinyText']} 处"
              + ('' if ok else f" | 例：{r.get('over')}"))
        if not ok:
            fails.append(page + '(mobile)')
    print(f"[smoke] 结果：{len(pages) - len(fails)}/{len(pages)} 通过" + (f"，失败页：{'、'.join(fails)}" if fails else ""))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
