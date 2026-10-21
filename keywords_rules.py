# ============================================================
# 花期册 · 关键词库与过滤规则 v2.0（2026-10-17）
# 仓库内嵌版：DB 路径指向 src/news/keywords.json；由 collect.py / daily_update.py 引用
# ============================================================
# 用途：与前端 assets/keywords.js 同源的抓取词库 + 过滤规则。
# 集成方式：collect.py 所在仓库引入本文件，替换原有关键词配置段。
#   import keywords_rules as KR
#   seeds = KR.build_seeds(month=4)          # 按月自动扩季节词
#   if KR.is_blocked(title, summary): skip  # 营销/无关过滤
#   cat  = KR.classify(title, summary)       # 五模块归类(None=不入库)
#   tags = KR.stage_tags(title, summary)     # 学段标签(可多标)
# ============================================================

import json
import os

_DB_PATH = os.path.join(os.path.dirname(__file__), 'src', 'news', 'keywords.json')

def _load():
    with open(_DB_PATH, encoding='utf-8') as f:
        return json.load(f)

DB = _load()

# ---------- 抓取频次（按模块流量优先级） ----------
# 升学动态(333) > 政策速递(184) > 家庭教育(11) > 安全提醒(7) > 办事提醒(6)
FETCH_PRIORITY = {
    "升学动态": {"interval_hours": 2,  "pages_per_run": 5},
    "政策速递": {"interval_hours": 4,  "pages_per_run": 3},
    "家庭教育": {"interval_hours": 12, "pages_per_run": 1},
    "安全提醒": {"interval_hours": 12, "pages_per_run": 1},
    "办事提醒": {"interval_hours": 12, "pages_per_run": 1},
}

# ---------- 种子词组装（含季节词自动启停） ----------
def _season_of(month: int) -> str:
    if 3 <= month <= 6:
        return "spring"
    if 6 <= month <= 8:   # 6 月同时跨春夏,按提示词 6-8 月归 summer
        return "summer"
    return "winter"

def build_seeds(month=None, with_longtail=True):
    """返回抓取种子词列表:TOP10 + 各模块核心词 (+ 长尾词) (+ 当季动态词)"""
    import datetime
    m = month or datetime.date.today().month
    season = _season_of(m)
    # 6 月同时启用 spring 尾声词
    seeds = list(DB["top10"])
    for mod, cfg in DB["modules"].items():
        seeds += cfg["core"]
        if with_longtail:
            # 长尾词按优先级裁剪:高流量模块全量,低流量取前 8
            lt = cfg["longtail"]
            if cfg["priority"] > 2:
                lt = lt[:8]
            seeds += lt
    seeds += DB["seasonal"][season]["add"]
    if m == 6:
        seeds += DB["seasonal"]["spring"]["add"][-5:]
    # 去重保序
    seen, out = set(), []
    for w in seeds:
        if w not in seen:
            seen.add(w)
            out.append(w)
    return out

# ---------- 过滤 ----------
def is_blocked(title: str, summary: str = "") -> bool:
    text = (title or "") + " " + (summary or "")
    for a in DB["filters"]["allow"]:
        if a in text:
            return False
    for b in DB["filters"]["block"]:
        if b in text:
            return True
    # 非中小学信号(大学生/高校/考研/公务员)→ 丢弃
    for n in DB["region"]["nonK12"]:
        if n in text:
            return True
    return False

# ---------- 归类与打标（与前端 news-classify.js 同逻辑） ----------
def _hits(text: str, words) -> int:
    return sum(1 for w in words if w in text)

def _score(title: str, body: str, mod: str) -> float:
    cfg = DB["modules"][mod]
    return (_hits(title, cfg["core"]) * 3 + _hits(title, cfg["longtail"]) * 2
            + _hits(body, cfg["core"]) + _hits(body, cfg["longtail"]) * 0.5)

def _season_lists() -> tuple[list, list]:
    """当前季节的 boost / weaken 生效时段词表（含未过期突发热点）"""
    import datetime
    season = DB.get("season") or _season_of(datetime.date.today().month)
    sea = DB["seasonal"].get(season, {})
    boost = list(sea.get("boost", []))
    weaken = list(sea.get("weaken", []))
    now = datetime.date.today()
    for h in DB.get("hotspots", []):
        try:
            if datetime.date.fromisoformat(h["expires"]) >= now:
                boost.append(h["word"])
        except Exception:
            pass
    return boost, weaken

def _word_score(text: str, word: str, base: float, boost: list, weaken: list) -> float:
    if word not in text:
        return 0.0
    if word in boost:
        return base * 1.3
    if word in weaken:
        return base * 0.6
    return base

def _is_nonk12(text: str) -> bool:
    return any(n in text for n in DB["region"]["nonK12"])

def _gate_hit(title: str, summary: str = "") -> bool:
    """硬门槛：命中词库 gate 词表 ≥1 词才允许入库（剔除非关键词资讯）"""
    text = (title or "") + " " + (summary or "")
    if any(w in text for w in DB["gate"]):
        return True
    import datetime
    now = datetime.date.today()
    for h in DB.get("hotspots", []):
        try:
            if datetime.date.fromisoformat(h["expires"]) >= now and h["word"] in text:
                return True
        except Exception:
            pass
    return False

def classify(title: str, summary: str = "", src: str = "", body: str = "") -> "str | None":  # 兼容 Python3.9（launchd 环境）：用字符串注解避免运行时求值
    """v2.0（与前端 JS 引擎语义对齐）：
       营销拦截 → 非K12排除 → gate硬门槛(标题+摘要) → 本地判定(标题+摘要+来源)
       → 非本地pipelineGate加验 → 模块打分(标题 + 摘要+正文body) → 阈值(本地2.5/非本地4)
       返回五模块之一;无法判定返回 None(不入库)"""
    title, summary = title or "", summary or ""
    src, body = src or "", body or ""
    text = title + " " + summary + " "
    if is_blocked(title, summary):
        return None
    if any(n in text for n in DB["region"]["nonK12"]):
        return None
    if not _gate_hit(title, summary):
        return None
    local_text = title + " " + summary + " " + src
    is_local = any(l in local_text for l in DB["region"]["local"])
    if not is_local and not any(w in local_text for w in DB["pipelineGate"]):
        return None
    body_text = summary + " " + body
    boost, weaken = _season_lists()
    best, best_score = None, 0.0
    for mod in DB["classifyOrder"]:
        cfg = DB["modules"][mod]
        s = 0.0
        for w in cfg["core"]:
            s += _word_score(title, w, 3, boost, weaken) + _word_score(body_text, w, 1, boost, weaken)
        for w in cfg["longtail"]:
            s += _word_score(title, w, 2, boost, weaken) + _word_score(body_text, w, 0.5, boost, weaken)
        if s > best_score:
            best_score, best = s, mod
    threshold = 2.5 if is_local else 4
    return best if best_score >= threshold else None

def stage_tags(title: str, summary: str = "") -> list:
    text = (title or "") + " " + (summary or "")
    tags = []
    for st in DB["stages"]:
        if any(k in text for k in st["kw"]):
            tags.append(st["stage"])
    return tags
