#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""一次性重筛：仓库 src/news/ 的 seed+collected 全量过 v2.0 引擎，
回写 collected.json（剔除不合规，保留待审），重新生成 src/data-news.js。"""
import json, os, sys, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import keywords_rules as KR

ROOT = os.path.dirname(os.path.abspath(__file__))
NEWS = os.path.join(ROOT, "src", "news")
SEED = os.path.join(NEWS, "seed.json")
COLLECTED = os.path.join(NEWS, "collected.json")
OUT = os.path.join(ROOT, "src", "data-news.js")

def load(p, d):
    try: return json.load(open(p, encoding="utf-8"))
    except Exception: return d

def save(p, v):
    json.dump(v, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

seed = load(SEED, [])
collected = load(COLLECTED, [])

stats = {"kept": 0, "dropGate": 0, "dropNonK12": 0, "dropMod": 0, "dropBlocked": 0}
kept_collected = []
for c in collected:
    cat = KR.classify(c.get("t",""), c.get("sum",""), c.get("src",""), c.get("body",""))
    if cat is None:
        text = (c.get("t","") + " " + c.get("sum",""))
        if KR.is_blocked(c.get("t",""), c.get("sum","")): stats["dropBlocked"] += 1
        elif not KR._gate_hit(c.get("t",""), c.get("sum","")): stats["dropGate"] += 1
        elif KR._is_nonk12(c.get("t","") + " " + c.get("sum","")): stats["dropNonK12"] += 1
        else: stats["dropMod"] += 1
        continue
    c["cat"] = cat
    c["stages"] = KR.stage_tags(c.get("t",""), c.get("sum","") + " " + c.get("body",""))
    kept_collected.append(c)
stats["kept"] = len(kept_collected)

# seed 保留但同样校验归类（seed 是编辑部内容，仅打标不剔除；万一归类失败保持原 cat）
kept_seed = []
for s in seed:
    cat = KR.classify(s.get("t",""), s.get("sum",""), s.get("src",""), s.get("body",""))
    if cat:
        s["cat"] = cat
        s["stages"] = KR.stage_tags(s.get("t",""), s.get("sum","") + " " + s.get("body",""))
    else:
        s["stages"] = KR.stage_tags(s.get("t",""), s.get("sum","") + " " + s.get("body",""))
    kept_seed.append(s)

save(COLLECTED, kept_collected)

items = kept_seed + kept_collected
items.sort(key=lambda x: (x.get("date") or ""), reverse=True)
js = ("/* ---------- 资讯数据（由 collect.py 生成 · 请勿手改；改内容请编辑 src/news/seed.json 后重新运行） ---------- */\n"
      "var NEWS_FEED = " + json.dumps(items, ensure_ascii=False, indent=2) + ";\n"
      "var NEWS_META = " + json.dumps({
          "generated": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
          "seed": len(kept_seed), "collected": len(kept_collected), "fetchedPending": 0,
      }, ensure_ascii=False) + ";\n")
with open(OUT, "w", encoding="utf-8") as f:
    f.write(js)

cats = {}
for x in items: cats[x.get("cat","?")] = cats.get(x.get("cat","?"),0)+1
staged = len([x for x in items if x.get("stages")])
print(f"重筛完成: 保留 {len(items)} 条（seed {len(kept_seed)} + collected {stats['kept']}）")
print(f"剔除: {stats}")
print(f"分布: {cats}")
print(f"学段标签: {staged} 条")
