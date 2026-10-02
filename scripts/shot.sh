#!/bin/bash
# 截图（自清理）。用法: scripts/shot.sh <url> <out.png> [W,H]
# 为什么不是一行 chrome 命令：headless Chrome 写完图不退出，直接跑会留下几十个僵尸进程。
# 这里用独立 user-data-dir 起进程 → 轮询产物 → 到点强杀并精确清理该实例。
U="$1"; O="$2"; SZ="${3:-1440,1600}"
[ -z "$U" ] || [ -z "$O" ] && { echo "用法: shot.sh <url> <out.png> [W,H]"; exit 2; }
UD="$(mktemp -d /tmp/chrome-shot-XXXXXX)"
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CH" --headless=new --disable-gpu --no-sandbox --no-first-run --disable-extensions \
  --hide-scrollbars --window-size="$SZ" --user-data-dir="$UD" \
  --virtual-time-budget=8000 --screenshot="$O" "$U" >/dev/null 2>&1 &
P=$!
for _ in $(seq 1 40); do [ -s "$O" ] && break; sleep 1; done
sleep 1
kill -9 $P 2>/dev/null; pkill -9 -f "$UD" 2>/dev/null; rm -rf "$UD"
[ -s "$O" ] && { echo "OK $O ($(wc -c < "$O" | tr -d ' ') bytes)"; exit 0; }
echo "FAIL $O（页面未加载或超时）"; exit 1
