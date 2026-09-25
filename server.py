#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""鸡父母平台 · 轻后端（v0.32 本地可运行版）
零依赖（仅 Python 标准库）：python3 server.py  →  http://localhost:8780
静态站点放本目录（index.html 等），API 挂 /api/*。
数据目录：data/（新闻与线索为 JSON 文件存储，本机持久化）
"""
import json, os, re, time, threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs, unquote

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(ROOT, "data")
os.makedirs(DATA_DIR, exist_ok=True)

LOCK = threading.Lock()
SEQ_FILE = os.path.join(DATA_DIR, "_seq.json")

def _load(name, default):
    p = os.path.join(DATA_DIR, name)
    if not os.path.exists(p):
        return default
    try:
        with open(p, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default

def _save(name, obj):
    p = os.path.join(DATA_DIR, name)
    tmp = p + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
    os.replace(tmp, p)

def _next_id(prefix):
    with LOCK:
        seq = _load("_seq.json", {})
        n = int(seq.get(prefix, 0)) + 1
        seq[prefix] = n
        _save("_seq.json", seq)
    return f"{prefix}-{n:04d}"

def load_news():
    return _load("news.json", [])

def load_tips():
    return _load("tips.json", [])

# ---- 审核词库（红线词：出现即拒绝入库；演示口径） ----
BANNED = ["保过", "内部指标", "花钱进", " assure", "保录", "包上", "交钱锁定"]
def audit_text(t):
    """返回 (ok, reason)。演示审核器：红线词 + 长度。"""
    if not t or len(t.strip()) < 4:
        return False, "内容过短"
    for w in BANNED:
        if w.strip() and w.strip() in t:
            return False, "命中红线词：" + w.strip()
    return True, ""

def pick(d, *keys):
    out = {}
    for k in keys:
        if k in d:
            out[k] = d[k]
    return out

class Handler(BaseHTTPRequestHandler):
    server_version = "JFM-Backend/0.32"

    def log_message(self, fmt, *args):
        sys_stdout = self.__dict__.get("_quiet")
        # 静默访问日志（避免刷屏），错误仍会抛出
        return

    # ---------- 基础 ----------
    def _json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _body(self):
        n = int(self.headers.get("Content-Length") or 0)
        if n <= 0:
            return {}
        try:
            return json.loads(self.rfile.read(n).decode("utf-8"))
        except Exception:
            return {}

    # ---------- CORS 预检 ----------
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    # ---------- 路由 ----------
    def do_GET(self):
        u = urlparse(self.path)
        path = unquote(u.path)
        q = parse_qs(u.query)

        if path == "/api/health":
            return self._json(200, {"ok": True, "service": "jfm-backend", "version": "0.32", "time": int(time.time())})

        if path == "/api/schools":
            try:
                with open(os.path.join(ROOT, "src", "data", "schools.json"), encoding="utf-8") as f:
                    return self._json(200, {"ok": True, "items": json.load(f)})
            except Exception as e:
                return self._json(500, {"ok": False, "error": str(e)})

        if path == "/api/news":
            items = load_news()
            cat = (q.get("cat") or [None])[0]
            kw = (q.get("q") or [""])[0].lower()
            status = (q.get("status") or ["published"])[0]
            out = [x for x in items if x.get("status") == status]
            if cat:
                out = [x for x in out if x.get("cat") == cat]
            if kw:
                out = [x for x in out if kw in (x.get("t","") + x.get("sum","")).lower()]
            page = int((q.get("page") or ["1"])[0])
            size = min(int((q.get("size") or ["20"])[0]), 50)
            total = len(out)
            out = out[(page-1)*size : (page-1)*size + size]
            return self._json(200, {"ok": True, "total": total, "page": page, "items": out})

        if path == "/api/tips":
            status = (q.get("status") or ["pending"])[0]
            items = [x for x in load_tips() if x.get("status") == status]
            return self._json(200, {"ok": True, "items": items})

        if path == "/api/stats":
            news = load_news(); tips = load_tips()
            return self._json(200, {"ok": True, "news_total": len(news),
                "news_published": sum(1 for x in news if x.get("status")=="published"),
                "news_pending": sum(1 for x in news if x.get("status")=="pending"),
                "tips_total": len(tips),
                "tips_pending": sum(1 for x in tips if x.get("status")=="pending")})

        # 静态文件
        rel = path.lstrip("/") or "index.html"
        fp = os.path.normpath(os.path.join(ROOT, rel))
        if not fp.startswith(ROOT) or not os.path.isfile(fp):
            # SPA 兜底：无扩展名的路径回首页（多页站大多有实体文件，此为兜底）
            if "." not in os.path.basename(rel):
                fp = os.path.join(ROOT, "index.html")
            else:
                return self._json(404, {"ok": False, "error": "not found"})
        ctype = {"html":"text/html; charset=utf-8","css":"text/css; charset=utf-8","js":"application/javascript; charset=utf-8",
                 "json":"application/json; charset=utf-8","png":"image/png","jpg":"image/jpeg","svg":"image/svg+xml","ico":"image/x-icon"}.get(
                 fp.rsplit(".",1)[-1], "application/octet-stream")
        with open(fp, "rb") as f:
            body = f.read()
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        u = urlparse(self.path)
        path = unquote(u.path)
        d = self._body()
        now = time.strftime("%Y-%m-%d %H:%M:%S")

        if path == "/api/news":
            ok, why = audit_text(str(d.get("t","")) + str(d.get("sum","")))
            if not ok:
                return self._json(422, {"ok": False, "error": why})
            item = {"id": _next_id("N"), "t": d.get("t","").strip(), "sum": d.get("sum","").strip(),
                    "cat": d.get("cat","升学动态"), "src": d.get("src","读者投稿"), "date": d.get("date") or now[:10],
                    "body": d.get("body",""), "url": d.get("url",""),
                    "status": "pending",  # 自主审核：先入待审池
                    "audit": "auto", "created": now}
            # 自主审核第一层：普通教育资讯自动过审，命中红线词的已在上面拒绝
            if d.get("cat") in ("政策速递","办事提醒"):
                item["status"] = "pending"  # 政策类保持人工复核
            else:
                item["status"] = "published" if d.get("autoPublish", True) else "pending"
            with LOCK:
                items = load_news(); items.insert(0, item); _save("news.json", items)
            return self._json(201, {"ok": True, "item": item})

        if path == "/api/tips":
            ok, why = audit_text(str(d.get("t","")))
            if not ok:
                return self._json(422, {"ok": False, "error": why})
            item = {"id": _next_id("T"), "t": d.get("t","").strip(), "detail": d.get("detail","").strip(),
                    "contact": d.get("contact",""), "status": "pending", "created": now}
            with LOCK:
                items = load_tips(); items.insert(0, item); _save("tips.json", items)
            return self._json(201, {"ok": True, "item": item, "note": "已登记，审核后公开（演示）"})

        return self._json(404, {"ok": False, "error": "unknown endpoint"})

    def do_PATCH(self):
        u = urlparse(self.path)
        path = unquote(u.path)
        d = self._body()
        m = re.match(r"^/api/news/([A-Za-z0-9\-]+)$", path)
        if m:
            with LOCK:
                items = load_news()
                for x in items:
                    if x["id"] == m.group(1):
                        if "status" in d:
                            if d["status"] not in ("published","pending","rejected"):
                                return self._json(422, {"ok": False, "error": "bad status"})
                            x["status"] = d["status"]
                            x["audited"] = time.strftime("%Y-%m-%d %H:%M:%S")
                        for k in ("t","sum","cat","src","body","url"):
                            if k in d: x[k] = d[k]
                        _save("news.json", items)
                        return self._json(200, {"ok": True, "item": x})
            return self._json(404, {"ok": False, "error": "not found"})
        m = re.match(r"^/api/tips/([A-Za-z0-9\-]+)$", path)
        if m:
            with LOCK:
                items = load_tips()
                for x in items:
                    if x["id"] == m.group(1):
                        if "status" in d:
                            x["status"] = d["status"] if d["status"] in ("published","rejected","pending") else x["status"]
                            x["audited"] = time.strftime("%Y-%m-%d %H:%M:%S")
                        _save("tips.json", items)
                        return self._json(200, {"ok": True, "item": x})
            return self._json(404, {"ok": False, "error": "not found"})
        return self._json(404, {"ok": False, "error": "unknown endpoint"})

    def do_DELETE(self):
        u = urlparse(self.path)
        path = unquote(u.path)
        m = re.match(r"^/api/news/([A-Za-z0-9\-]+)$", path)
        if m:
            with LOCK:
                items = [x for x in load_news() if x["id"] != m.group(1)]
                _save("news.json", items)
            return self._json(200, {"ok": True})
        m = re.match(r"^/api/tips/([A-Za-z0-9\-]+)$", path)
        if m:
            with LOCK:
                items = [x for x in load_tips() if x["id"] != m.group(1)]
                _save("tips.json", items)
            return self._json(200, {"ok": True})
        return self._json(404, {"ok": False, "error": "unknown endpoint"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8780"))
    srv = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"[jfm-backend] v0.32 · http://127.0.0.1:{port} · API /api/health /api/schools /api/news /api/tips /api/stats")
    print("[jfm-backend] 静态站点同端口托管 · 数据目录 data/ · Ctrl+C 停止")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\n[jfm-backend] bye")
