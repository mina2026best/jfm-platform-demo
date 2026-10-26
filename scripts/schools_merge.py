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
    global added, enriched, skipped
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

# 3) 补丁批次（batch-zhongxin2）：高考事实追加 + 字段核正
def resolve_key(k):
    if k in db: return k
    nk = re.sub(r'（([^）]*?)区）', r'（\1）', k).replace('（高新区）','（沙坪坝）') if '大学城' in k else re.sub(r'（([^）]*?)区）', r'（\1）', k)
    if nk in db: return nk
    base = k.split('（')[0].replace('重庆市','').replace('重庆','',1)
    cands = [dk for dk in db if dk.split('（')[0].lstrip('重庆') == base]
    if len(cands) == 1: return cands[0]
    cands2 = [dk for dk in db if base and base in dk.split('（')[0].replace('重庆市','').replace('重庆','',1)]
    if len(cands2) == 1: return cands2[0]
    return None

try:
    patches = json.load(open(f'{ROOT}/schools_inbox/batch-zhongxin2.json', encoding='utf-8'))
except FileNotFoundError:
    patches = []
pg_ok = pg_skip = 0
for it in patches:
    k = it.get('键名', ''); t = resolve_key(k)
    if not t:
        errors.append(f'[patch] 未匹配：{k}'); pg_skip += 1; continue
    if it.get('类型') == 'gaokao':
        line = f"（{it.get('年度','')}，据{it.get('口径','官方')}）：{it.get('数据','')}"
        cur = db[t].get('高考成绩')
        db[t]['高考成绩'] = (cur + '\n' + line) if cur and line not in cur else (line if not cur else cur)
        src = it.get('来源', '')
        if src.startswith('http'):
            db[t]['资料来源'] = sorted(set((db[t].get('资料来源') or []) + [src]))
        pg_ok += 1
    elif it.get('类型') == 'field':
        f, v = it.get('字段'), it.get('值', '')
        cur = db[t].get(f)
        if not cur:
            db[t][f] = v; pg_ok += 1
        elif cur.strip() != v.strip():
            if f == '校区地址' and v[:12] not in cur:
                db[t][f] = cur + '；另一口径/校区：' + v
                pg_ok += 1
            # 其余字段已有值且不同 → 保留既有（不覆盖）
        else:
            pg_ok += 1


# 4) 区县高考批次（batch-gaokao-quxian）→ 高考成绩
try:
    gk_items = json.load(open(f'{ROOT}/schools_inbox/batch-gaokao-quxian.json', encoding='utf-8'))
except FileNotFoundError:
    gk_items = []
for it in gk_items:
    k = it.get('键名', ''); t = resolve_key(k)
    if not t:
        errors.append(f'[gaokao] 未匹配：{k}'); continue
    line = f"（{it.get('年度','')}，据{it.get('口径','官方发布')}）：{it.get('数据','')}"
    cur = db[t].get('高考成绩')
    if line in (cur or ''): continue
    db[t]['高考成绩'] = (cur + '\n' + line) if cur else line
    src = it.get('来源', '')
    if src.startswith('http'):
        db[t]['资料来源'] = sorted(set((db[t].get('资料来源') or []) + [src]))
    # 有真实数据后更新暂缺说明
    if '录取线' in (db[t].get('暂缺字段') or ''):
        db[t]['暂缺字段'] = '近三年分学校实录线（官方未集中发布，逐步补充中）'

# 5) 中考录取参考：全市联招三年线（联招区县学校）+ 万州区线（万州学校）
lines_json = json.load(open(f'{ROOT}/schools_inbox/batch-lines.json', encoding='utf-8'))
city = '；'.join(f"{x['年度']}年 {x['内容']}" for x in lines_json['全市联招'])
city_src = [x['来源'] for x in lines_json['全市联招']]
qx = {x['区县']: x for x in lines_json.get('区县', [])}
qx_src = {x['区县']: x['来源'] for x in lines_json.get('区县', [])}
LIANZHAO_QUS = {'渝中区','江北区','南岸区','沙坪坝区','九龙坡区','大渡口区','渝北区','北碚区','巴南区','两江新区','重庆高新区'}
for k, v in db.items():
    qu = v.get('所在区', '')
    ref = None
    if qu in LIANZHAO_QUS:
        ref = f"全市联招统一录取送档线（官方口径，供参考，以当年公布为准）：{city}"
    elif qu == '万州区':
        q = qx.get('万州区')
        ref = f"万州区普高最低录取控制线（2024，区教委划定）：{q['内容']}；全市联招线不适用于非联招区县" if q else None
    if ref and not v.get('中考录取参考'):
        v['中考录取参考'] = ref
        v['资料来源'] = sorted(set((v.get('资料来源') or []) + (city_src if qu in LIANZHAO_QUS else [qx_src.get('万州区','')]))) if (qu in LIANZHAO_QUS or qx_src.get('万州区')) else v.get('资料来源')
print(f'中考录取参考：已注入 {sum(1 for v in db.values() if v.get("中考录取参考"))} 校')
print(f'补丁：应用 {pg_ok} | 未匹配 {pg_skip}')

print(f'新增 {added} | 丰富 {enriched} | 跳过 {skipped} | 总量 {len(db)}')
for e in errors:
    print(e)
if '-w' in sys.argv:
    json.dump(db, open(f'{ROOT}/schools.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print('SAVED')
