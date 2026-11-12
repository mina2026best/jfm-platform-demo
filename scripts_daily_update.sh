#!/bin/bash
# 花期册 · 每日资讯自动更新（对齐线上 → 抓取 → 重建 → 推送）
# v2（2026-10-15）修「静默冻结」：旧版直接 commit+push，本地与 origin 分叉时 push 被拒
# （non-fast-forward），5 次重试后静默退出、无人发现 —— 线上资讯实测冻结在 10-11，10-12~10-14 三天的提交滞留本地。
# 根因：本仓有两个写入者——开发线（改代码、推 origin）与每日采集线（本脚本）。
# 修法：每次运行先对齐 origin 的代码线，只保留采集线的唯一资产 src/news/collected.json
# （已核对：分叉期间的提交只动 collected.json + data-news.js + 构建产物），随后用最新代码重建，push 必为快进。
set -u
cd "$(dirname "$0")"

echo "===== [0/4] 对齐线上 $(date '+%F %T') ====="
git fetch origin -q || echo "[warn] fetch 失败（网络），按本地状态继续"
BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)
if [ "${BEHIND:-0}" != "0" ]; then
  echo "[align] 线上领先 $BEHIND 个提交 → 以 origin/main 为基线重建（代码归开发线，采集数据保留）"
  KEEP=$(mktemp /tmp/jfm-keep-XXXXXX) && rmdir "$KEEP" && mkdir -p "$KEEP"
  # v3 扩大保留清单：八卦社与学校档案数据同属采集资产，对齐时不丢失
  cp src/news/collected.json "$KEEP/" 2>/dev/null || true
  cp src/news/bagua.json "$KEEP/" 2>/dev/null || true
  cp src/data/schools.json "$KEEP/" 2>/dev/null || true
  cp src/data/school_photos.json "$KEEP/" 2>/dev/null || true
  cp src/data/school_photo_credits.json "$KEEP/" 2>/dev/null || true
  cp -r src/news/bagua_inbox "$KEEP/bagua_inbox" 2>/dev/null || true
  cp -r src/data/schools_inbox "$KEEP/schools_inbox" 2>/dev/null || true
  git branch -f "backup/pre-align-$(date +%Y%m%d%H%M)" HEAD 2>/dev/null || true
  git reset --hard origin/main || { echo "ALIGN_FAILED"; exit 1; }
  cp "$KEEP/collected.json" src/news/collected.json 2>/dev/null || true
  cp "$KEEP/bagua.json" src/news/bagua.json 2>/dev/null || true
  cp "$KEEP/schools.json" src/data/schools.json 2>/dev/null || true
  cp "$KEEP/school_photos.json" src/data/school_photos.json 2>/dev/null || true
  cp "$KEEP/school_photo_credits.json" src/data/school_photo_credits.json 2>/dev/null || true
  cp -R "$KEEP/bagua_inbox/." src/news/bagua_inbox/ 2>/dev/null || true
  cp -R "$KEEP/schools_inbox/." src/data/schools_inbox/ 2>/dev/null || true
  rm -rf "$KEEP"
fi

echo "===== [1/4] 抓取资讯 ====="
/usr/local/bin/python3 daily_update.py || { echo "[warn] 抓取失败，继续尝试重建"; }
echo "===== [1.5/4] 八卦社每日整理 ====="
/usr/local/bin/python3 bagua_auto.py --max 12 || echo "[warn] 八卦社自动采集异常，继续管线"
/usr/local/bin/python3 bagua_daily.py || echo "[warn] 八卦社管线异常，继续重建"
echo "===== [2/4] 重建站点 ====="
/usr/local/bin/python3 build.py || { echo "BUILD_FAILED"; exit 1; }
# v2.2 移动端溢出回归断言（本地文件检查，非阻塞）
node scripts/overflow_check.js "file://$PWD/index.html" 2>/dev/null && echo "[ok] 移动端溢出回归通过" || echo "[warn] 移动端可能横向溢出——人工复核 scripts/overflow_check.js"
echo "===== [3/4] 提交 ====="
git add -A
git commit -m "每日资讯自动更新 $(date '+%F')" 2>/dev/null || echo "(无变更)"
echo "===== [4/4] 推送 GitHub Pages ====="
for i in 1 2 3 4 5; do
  OUT=$(git push origin main 2>&1 | tail -1); echo "$OUT"
  R=$(git rev-parse origin/main 2>/dev/null); H=$(git rev-parse HEAD)
  if [ "$R" = "$H" ]; then echo "PUSH OK"; echo "===== 完成 $(date '+%F %T') ====="; exit 0; fi
  if echo "$OUT" | grep -q "rejected"; then
    echo "[guard] 非快进被拒 → fetch + rebase（冲突即中止退出，防半途状态）"
    git fetch origin -q && git rebase origin/main || { git rebase --abort 2>/dev/null; echo "REBASE_CONFLICT：需人工处理"; exit 1; }
    /usr/local/bin/python3 build.py || { echo "BUILD_FAILED"; exit 1; }
    git add -A; git commit -m "rebase 后统一重建 $(date '+%F %T')" 2>/dev/null
    continue
  fi
  sleep 12
done
echo "PUSH_FAILED：本地 $(git rev-parse --short HEAD) 未上线（线上 $(git rev-parse --short origin/main)）——查分叉或网络"
echo "===== 失败 $(date '+%F %T') ====="
exit 1
