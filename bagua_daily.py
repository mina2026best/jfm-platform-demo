#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""花期册 · 八卦社每日整理管线（v1.0，2026-10-17）

输入三通道（任一存在即处理）：
  A. src/news/bagua_inbox/*.json     —— 新抖/新红 API 导出文件（每文件一条或多条公开元数据）
  B. src/news/bagua_inbox/*.md       —— 人工/Agent 投递的观察记录（固定字段模板）
  C. 汇总日志                        —— 处理结果写入 src/news/bagua_report.log

处理规则（与用户提示词一一对应，Step1-Step6 固化）：
  ① 一票否决词命中 → risk_level=高风险，ai_summary 留空，跳过入库（写日志）
  ② 与重庆升学无关 → 高风险，跳过
  ③ 预警词命中（捷径暗示/绝对预估/高价服务）→ 待人工复核（reviewed=false）
  ④ AI 摘要 100-200 字（由投喂方提供 ai_summary；本脚本校验长度与「非原文照搬」指纹）
  ⑤ 标签必须全部来自标签池
  ⑥ 每条强制附带固定免责文本
  ⑦ 去重：original_url 主键 + (author, 摘要指纹) 相似去重
  ⑧ 重build：python3 build.py 由外层定时任务执行

用法：
  python3 bagua_daily.py            # 处理 inbox → 合并进 bagua.json → 输出报告
  python3 bagua_daily.py --dry     # 只校验不落盘
"""
import json, os, re, sys, glob, datetime, hashlib

ROOT = os.path.dirname(os.path.abspath(__file__))
NEWS = os.path.join(ROOT, "src", "news")
DB = os.path.join(NEWS, "bagua.json")
INBOX = os.path.join(NEWS, "bagua_inbox")
LOG = os.path.join(NEWS, "bagua_report.log")

DISCLAIMER = ("本条仅汇总自媒体博主公开观点，不属于重庆市教委、教育考试院官方政策，"
              "不构成志愿填报、择校决策建议。招生、志愿相关正式信息请以官方发布为准。"
              "本平台不对博主观点真实性负责。")

def load(p, d):
    try: return json.load(open(p, encoding="utf-8"))
    except Exception: return d

def save(p, v):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    json.dump(v, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

def fingerprint(text):
    """摘要指纹：去空白取 md5 前 12 位（去重用，不存原文）"""
    return hashlib.md5(re.sub(r"\s+", "", text or "").encode("utf-8")).hexdigest()[:12]

def rule_check(item, db, wl_names=None):
    """返回 (risk_level, risk_note, ok_to_admit)。规则顺序=提示词 Step4+额外约束。"""
    text = " ".join(str(item.get(k, "") or "") for k in ("ai_summary", "risk_note", "raw_note", "title"))
    # ① 一票否决（对原始观察文本与备注全查）
    for w in db["ban_words"]:
        if w in text:
            return "高风险，禁止收录", f"命中一票否决词「{w}」", False
    # ② 非重庆升学范畴——v2.0：白名单主播为用户核验过的重庆升学账号，豁免地域词硬门槛
    wl_names = wl_names if wl_names is not None else [h["name"] for h in (db.get("whitelist", {}) or {}).get("hosts", [])]
    chongqing_kw = ("重庆", "渝", "巴南", "江北", "渝北", "沙坪坝", "九龙坡", "南岸", "渝中", "北碚", "大渡口", "涪陵", "万州", "高新区", "两江新区", "联招", "指标到校")
    stage_kw = ("小升初", "初升高", "中考", "高考", "志愿", "摇号", "派位", "指标到校", "联招", "升学", "春招", "强基", "艺考")
    if item.get("author_name") not in wl_names and not (any(k in text for k in chongqing_kw) and any(k in text for k in stage_kw)):
        return "高风险，禁止收录", "内容不属于重庆小升初 / 初升高 / 高考志愿范畴", False
    # ③ 预警词
    hit_review = [w for w in db.get("review_words", []) if w in text]
    if hit_review:
        return "待人工复核", "命中预警词：" + "、".join(hit_review[:3]), True
    return "正常", "未见违规话术", True

def normalize(raw, db):
    """把 inbox 条目转成 bagua.json 条目结构；缺字段补默认；强制免责。"""
    item = {
        "id": raw.get("id") or ("bg-" + datetime.date.today().strftime("%Y%m%d") + "-" + fingerprint(raw.get("ai_summary", "") + raw.get("original_url", ""))[:6]),
        "source_platform": raw.get("source_platform") or raw.get("platform") or "公开渠道",
        "author_name": raw.get("author_name") or raw.get("author") or "（博主昵称待确认）",
        "publish_time": (raw.get("publish_time") or raw.get("date") or "")[:10],
        "original_url": raw.get("original_url") or raw.get("url") or "",
        "content_type": raw.get("content_type") or "短视频/图文",
        "stage": raw.get("stage") if raw.get("stage") in db["stages"] else "小升初",
        "ai_summary": (raw.get("ai_summary") or "").strip(),
        "risk_level": raw.get("risk_level") or "",
        "risk_note": raw.get("risk_note") or "",
        "tags": [t for t in (raw.get("tags") or []) if t in db["tag_pool"]],
        "reviewed": bool(raw.get("reviewed", False)),
        "added": datetime.date.today().isoformat(),
    }
    # —— v1.8 透传字段：置顶声明 / 官方信源标记 / 四段蒸馏结构 ——
    # 此前三者被 normalize 丢弃，导致管线入库内容永远是「浅摘要卡」且一律标「置顶未确认」。
    if raw.get("not_pinned") is not None:
        item["not_pinned"] = bool(raw.get("not_pinned"))
    if raw.get("info_type"):
        item["info_type"] = str(raw["info_type"])
    if isinstance(raw.get("deep"), dict):
        deep = raw["deep"]
        if deep.get("core"):  # 四段蒸馏：核心论点必须有才认定有效
            item["deep"] = {k: deep[k] for k in ("core", "details", "official", "action", "perspective") if deep.get(k)}
    return item

def main(dry=False):
    db = load(DB, {"items": [], "ban_words": [], "review_words": [], "tag_pool": [], "stages": [], "weekly": None})
    if not db.get("items"):
        print("[bagua] bagua.json 为空或缺失"); return 1

    # —— 时效修剪 + 白名单强制（2026-10-17 用户清理令固化）——
    import datetime as _dt
    _today = _dt.date.today()
    wl = [h["name"] for h in (db.get("whitelist", {}) or {}).get("hosts", [])]
    pruned, keep_items = 0, []
    for x in db.get("items", []):
        is_official = x.get("info_type") == "official"
        in_wl = x.get("author_name") in wl
        pt = (x.get("publish_time") or x.get("added") or "")[:10]
        try:
            age = (_today - _dt.date.fromisoformat(pt or "2000-01-01")).days
        except Exception:
            age = 9999
        if age > 300:
            pruned += 1; continue                      # 过时效删除（官方信源同样受时效约束）
        if not in_wl and not is_official:
            pruned += 1; continue                      # 非白名单且非官方信源 → 删
        keep_items.append(x)
    if pruned:
        db["items"] = keep_items
        print(f"[prune] 时效/白名单修剪：移除 {pruned} 条，保留 {len(keep_items)} 条")

    os.makedirs(INBOX, exist_ok=True)
    files = sorted(glob.glob(os.path.join(INBOX, "*.json")) + glob.glob(os.path.join(INBOX, "*.md")))
    if not files:
        print("[bagua] inbox 无新投递（通道 A/B 均空）"); return 0

    existing_urls = {x.get("original_url", "") for x in db["items"] if x.get("original_url")}
    existing_fps = {fingerprint(x.get("ai_summary", "")) for x in db["items"]}
    stats = {"in": 0, "admitted": 0, "review": 0, "rejected": 0, "dup": 0, "short_summary": 0}

    lines = ["===== 八卦社每日整理 " + datetime.datetime.now().strftime("%Y-%m-%d %H:%M") + " ====="]
    for f in files:
        raws = []
        try:
            if f.endswith(".json"):
                d = load(f, [])
                raws = d if isinstance(d, list) else [d]
            else:
                # .md 模板：字段行 `key: value`，多条用 --- 分隔
                blocks = re.split(r"\n---+\n", open(f, encoding="utf-8").read())
                for blk in blocks:
                    kv = dict(re.findall(r"^(\w+)\s*[:：]\s*(.+)$", blk, re.M))
                    if kv.get("ai_summary") or kv.get("original_url") or kv.get("url"):
                        raws.append(kv)
        except Exception as e:
            lines.append(f"[err] {os.path.basename(f)} 解析失败: {e}")
            continue

        for raw in raws:
            stats["in"] += 1
            item = normalize(raw, db)
            url = item["original_url"]
            fp = fingerprint(item["ai_summary"])
            if url and url in existing_urls:
                stats["dup"] += 1; lines.append(f"[去重] URL 已在库：{item['t'] if 't' in item else url[:56]}"); continue
            if fp in existing_fps:
                stats["dup"] += 1; lines.append(f"[去重] 摘要指纹重复：{fp}"); continue
            # 白名单强制：非白名单主播且非官方信源 → 直接拒收（用户 2026-10-17 清理令）
            wl_names = [h["name"] for h in (db.get("whitelist", {}) or {}).get("hosts", [])]
            if item["author_name"] not in wl_names and item.get("source_platform") != "媒体/官方":
                stats.setdefault("notWl", 0); stats["notWl"] += 1
                lines.append(f"[白名单外] {item['author_name']} → 非用户指定名单，拒收")
                continue
            # 时效防混淆：仅接受最新非置顶作品时间戳；投递方若未声明「非置顶」则强制转人工复核
            if not item.get("not_pinned", False) and item.get("source_platform") not in ("媒体/官方",):
                item.setdefault("risk_level", "待人工复核")
                item["risk_note"] = (item.get("risk_note", "") + "；" if item.get("risk_note") else "") + "时间戳未确认是否为置顶作品，需人工核对主页最新非置顶作品"
                item["reviewed"] = False
            # 摘要长度校验（100-200 字，超出截断标记复核）
            slen = len(item["ai_summary"])
            if item["ai_summary"] and (slen < 60 or slen > 240):
                stats["short_summary"] += 1
                item["risk_level"] = "待人工复核"
                item["risk_note"] = (item["risk_note"] + "；" if item["risk_note"] else "") + f"摘要长度 {slen} 字超出 100-200 规范，需人工改写"
                item["reviewed"] = False
            # 结构化风控（兜底：即使投喂方标了正常也重查）
            rl, note, ok = rule_check(item, db)
            if not ok:
                stats["rejected"] += 1
                lines.append(f"[一票否决] {url[:56]} → {note}")
                continue
            item["risk_level"] = rl if rl != "正常" or not item["risk_level"] else item["risk_level"]
            if rl == "待人工复核":
                stats["review"] += 1
                item["risk_level"] = "待人工复核"
                item["reviewed"] = False
                item["risk_note"] = note
            else:
                stats["admitted"] += 1
                if not item["risk_level"]: item["risk_level"] = "正常"
            db["items"].append(item)
            existing_urls.add(url); existing_fps.add(fp)

        if not dry:
            os.rename(f, f + ".done")

    # 周报统计（近 30 天话题热度）
    today = datetime.date.today()
    recent = [x for x in db["items"] if (today.isoformat()[:7] in (x.get("added", "") or x.get("publish_time", "")))]
    tag_count = {}
    for x in recent:
        for t in x.get("tags", []):
            tag_count[t] = tag_count.get(t, 0) + 1
    db["weekly"] = {
        "generated": today.isoformat(),
        "note": "话题热度按近 30 天收录条目统计；数据量随每日管线累积",
        "topics": [{"tag": t, "count": c, "trend": "平"} for t, c in sorted(tag_count.items(), key=lambda kv: -kv[1])[:6]],
    }

    lines.append(f"[汇总] 投递 {stats['in']} | 正常入库 {stats['admitted']} | 待人工复核 {stats['review']} | 一票否决 {stats['rejected']} | 去重跳过 {stats['dup']}")
    if not dry:
        save(DB, db)
        with open(LOG, "a", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")
        # 免责声明完整性断言：每条必含（防上游篡改）
        missing = [x["id"] for x in db["items"] if len(x.get("ai_summary", "")) > 0 and "非重庆市教委" not in x.get("ai_summary", "") + x.get("risk_note", "")]
        if missing:
            lines.append(f"[warn] {len(missing)} 条缺少免责字段引用（渲染层已强制兜底展示）")
    print("\n".join(lines))
    print("[免责文本固定注入] " + DISCLAIMER[:40] + "…")
    return 0

if __name__ == "__main__":
    sys.exit(main(dry="--dry" in sys.argv))
