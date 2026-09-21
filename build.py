#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""鸡父母平台 MVP · 构建脚本
将 src/ 下的样式 / 数据 / 功能模块 / HTML 骨架拼装为单文件零依赖 index.html。
用法：python3 build.py   （在网站目录执行）
"""
import os, re, sys, hashlib, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")

def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()

def guard(name, body):
    """防拼装遗漏：每个模块必须非空且无构建占位符残留"""
    if not body.strip():
        sys.exit(f"[build] 空模块：{name}")
    if "/*__BUILD_" in body or "__BUILD_PLACEHOLDER__" in body:
        sys.exit(f"[build] 模块含未解析占位符：{name}")

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

def build_html():
    tpl = read(f"{SRC}/template.html")
    css, js = build_css(), build_js()
    out = tpl.replace("/*__BUILD_CSS__*/", lambda_mangle(css)).replace("//__BUILD_JS__", js)
    if "/*__BUILD_CSS__*/" in out or "//__BUILD_JS__" in out:
        sys.exit("[build] 模板占位符未替换干净")
    return out

def lambda_mangle(css):
    # CSS 里可能出现 $& 等替换元字符，用函数式替换避免 re.sub 转义问题
    return css

def str_replace(tpl, marker, content):
    return tpl.replace(marker, content)

def main():
    tpl = read(f"{SRC}/template.html")
    css, js = build_css(), build_js()
    out = str_replace(tpl, "/*__BUILD_CSS__*/", css).replace("//__BUILD_JS__", js)
    if "/*__BUILD_CSS__*/" in out or "//__BUILD_JS__" in out:
        sys.exit("[build] 模板占位符未替换干净")
    out_path = os.path.join(ROOT, "index.html")
    # 幂等性校验：与现有产物一致则跳过写盘
    if os.path.exists(out_path) and read(out_path) == out:
        print("[build] 无变化，跳过")
    else:
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(out)
        h = hashlib.sha256(out.encode()).hexdigest()[:12]
        print(f"[build] OK · {len(out)} bytes · sha256:{h}")
    kb = len(out) / 1024
    print(f"[build] 单文件体积 {kb:.1f} KB")

if __name__ == "__main__":
    main()
