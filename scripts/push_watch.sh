#!/bin/bash
# 家长屿 · 智能推送：先探可达性，通了立刻推（GitHub 本机间歇黑洞）
cd ~/.openclaw-autoclaw/agents/auto-designer/workspace/DELIVERY/鸡父母平台-MVP网站 || exit 1
probe() { curl -s -o /dev/null -m 8 -w "%{http_code}" https://github.com 2>/dev/null; }
for i in $(seq 1 60); do
  code=$(probe)
  ahead=$(git rev-list --count origin/main..main 2>/dev/null)
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
