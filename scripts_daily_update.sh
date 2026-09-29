#!/bin/bash
# 鸡父母平台 · 每日资讯自动更新（抓取 → 重建 → 推送）
# 建议由 AutoClaw 定时任务每日调用；或在站点目录手动执行本脚本。
set -u
cd "$(dirname "$0")"
echo "===== [1/3] 抓取资讯 $(date '+%F %T') ====="
python3 daily_update.py || { echo "[warn] 抓取失败，继续尝试重建"; }
echo "===== [2/3] 重建站点 ====="
python3 build.py
echo "===== [3/3] 推送 GitHub Pages ====="
git add -A
git commit -m "每日资讯自动更新 $(date '+%F')" 2>/dev/null || echo "(无变更)"
for i in 1 2 3 4 5; do
  git push origin main 2>&1 | tail -1
  R=$(git rev-parse origin/main 2>/dev/null); H=$(git rev-parse HEAD)
  if [ "$R" = "$H" ]; then echo "PUSH OK"; break; fi
  sleep 12
done
echo "===== 完成 $(date '+%F %T') ====="
