#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""学校档案合并（一次性）：
- batch-enrich.json → 补齐现有 20 校缺失字段（只填空，不覆盖既有值）
- batch-quxian.json + batch-zhongxin.json → 新增学校（必须含 键名/办学性质/所在区/简介/资料来源）
校验：禁词（升学率/排名/分数线/重本率/一本率）；重复键拒绝；所在区格式统一。
"""
import json, re, sys

ROOT = 'src/data'
db = json.load(open(f'{ROOT}/schools.json', encoding='utf-8'))
BAN = ('升学率', '排名', '分数线', '重本率', '一本率', '上线率', '清北', '状元')

def norm_region(r):
    r = (r or '').strip()
    return r if r else '其他'

added = enriched = skipped = 0
errors = []

# 1) 丰富现有学校（键名映射：批内「南开中学（沙坪坝区）」→库内「南开中学（沙坪坝）」）
def strip_qu(key):
    return re.sub(r'（[^）]*区）$', '（', key)

enrich = json.load(open(f'{ROOT}/schools_inbox/batch-enrich.json', encoding='utf-8'))
# 库内键规范化索引：去掉括号内的「区」字（沙坪坝区→沙坪坝）
def keynorm(k):
    return re.sub(r'（([^）]*?)区）', r'（\1）', k)
dbnorm = {keynorm(dk): dk for dk in db}
for item in enrich:
    k = item['键名']
    target = dbnorm.get(keynorm(k))
    if target is None:
        # 宽松：名称主体（括号前）一致即可
        base = k.split('（')[0]
        cands = [dk for dk in db if dk.split('（')[0] == base]
        if len(cands) == 1:
            target = cands[0]
    if target is None:
        errors.append(f'[enrich] 未匹配到库内键：{k}')
        continue
    changed = False
    for f, v in item.items():
        if f == '键名':
            continue
        if not db[target].get(f):
            db[target][f] = v
            changed = True
    if changed:
        enriched += 1
        src = [x for x in item.get('官网', '').split() if x.startswith('http')]
        db[target]['资料来源'] = sorted(set(db[target].get('资料来源', []) + src)) if src else db[target].get('资料来源')
        db[target]['资料采集'] = f"资料采集：公开渠道（官网 / 政府公开信息 / 百科）· 2026-10-26，来源链接见《资料来源》"

# 2) 新增学校（含别名映射：批内键名 → 库内既有键名；None=既有档案已覆盖，跳过）
ALIAS = {
    '重庆求精中学（渝中区）': '求精中学（渝中）',
    '重庆复旦中学（渝中区）': '渝中区复旦中学（渝中）',
    '重庆三十七中（大渡口区）': '重庆三十七中（大渡口）',
    '重庆松树桥中学（渝北区）': '松树桥中学（渝北）',
    '重庆巴南中学（巴南区）': '巴南中学（巴南）',
    '重庆大学城一中（重庆高新区）': '大学城第一中学（沙坪坝）',
}

def add_batch(path):
    global added
    try:
        items = json.load(open(path, encoding='utf-8'))
    except FileNotFoundError:
        return
    for it in items:
        k = it.get('键名', '')
        if not k or not it.get('办学性质') or not it.get('所在区') or not it.get('简介') or not it.get('资料来源'):
            errors.append(f'[add] 字段不全，拒收：{k}')
            continue
        if k in ALIAS:
            target = ALIAS[k]
            if target is None or target not in db:
                errors.append(f'[alias] 既有档案已覆盖，跳过：{k} → {target}')
                continue
            changed = False
            for f, v in it.items():
                if f in ('键名', '所在区'):
                    continue
                if not db[target].get(f) and v:
                    db[target][f] = v
                    changed = True
            src = [u for u in it.get('资料来源', []) if u.startswith('http')]
            if src:
                db[target]['资料来源'] = sorted(set((db[target].get('资料来源') or []) + src))
            if changed or src:
                enriched += 1
            continue
        if k in db:
            errors.append(f'[add] 键已存在，跳过：{k}')
            skipped += 1
            continue
        text = it.get('简介', '') + it.get('办学特色', '')
        if any(b in text for b in BAN):
            errors.append(f'[add] 命中禁词，拒收：{k}')
            continue
        entry = dict(it)
        entry['所在区'] = norm_region(it['所在区'])
        entry['数据来源'] = '公开信息 · 核验 2026-10-26（来源链接见《资料来源》）'
        entry['资料采集'] = '资料采集：公开渠道（政府公开信息 / 校方官网 / 百科词条）· 2026-10-26'
        entry.setdefault('暂缺字段', '通勤参考/住宿/收费/评价（审核制，待采集与人工审核后补充）')
        db[k] = entry
        added += 1

add_batch(f'{ROOT}/schools_inbox/batch-quxian.json')
add_batch(f'{ROOT}/schools_inbox/batch-zhongxin.json')

print(f'新增 {added} | 丰富 {enriched} | 跳过 {skipped} | 总量 {len(db)}')
for e in errors:
    print(e)
if '-w' in sys.argv:
    json.dump(db, open(f'{ROOT}/schools.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print('SAVED')
