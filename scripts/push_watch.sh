#!/bin/bash
# 家长搭子 · 智能推送：先探可达性，通了立刻推（GitHub 本机间歇黑洞）
cd "$(dirname "$0")/.." || exit 1   # 仓库根（原硬编码 auto-designer 旧路径已随 autoclaw 迁移失效，2026-10-19）
probe() { curl -s -o /dev/null -m 8 -w "%{http_code}" https://github.com 2>/dev/null; }
for i in $(seq 1 60); do
  code=$(probe)
  ahead=$(git rev-list --count origin/main..main 2>/dev/null)
  behind=$(git rev-list --count main..origin/main 2>/dev/null)
  if [ "${behind:-0}" != "0" ]; then
    echo "$(date +%H:%M:%S) DIVERGED：本地落后 origin/main $behind 个提交，push 必被拒（non-fast-forward）。先 git fetch 并 rebase/对齐再推（采集线见 scripts_daily_update.sh 的对齐步骤）。"
    exit 1
  fi
  if [ "$ahead" = "0" ]; then echo "$(date +%H:%M:%S) 已是最新，无需推送"; exit 0; fi
  if [ "$code" = "200" ] || [ "$code" = "301" ] || [ "$code" = "302" ]; then
    out=$(git -c http.lowSpeedLimit=1000 -c http.lowSpeedTime=20 push 2>&1 | tail -2)
    ahead2=$(git rev-list --count origin/main..main 2>/dev/null)
    echo "$(date +%H:%M:%S) 第${i}次 github=$code push后ahead=$ahead2 | $(echo "$out" | tr '\n' ' ' | cut -c1-100)"
    [ "$ahead2" = "0" ] && { echo "PUSH_OK"; exit 0; }
  else
    echo "$(date +%H:%M:%S) 第${i}次 github不可达($code)"
  fi
  sleep 60
done
echo "PUSH_FAILED"
exit 1
