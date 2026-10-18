# 每日自动采集定时任务（launchd）

## 安装
cp scripts/com.jfm.daily-update.plist ~/Library/LaunchAgents/
launchctl unload ~/Library/LaunchAgents/com.jfm.daily-update.plist 2>/dev/null
launchctl load ~/Library/LaunchAgents/com.jfm.daily-update.plist

## 行为
- 每日 07:30 / 13:45 自动执行 scripts_daily_update.sh：
  资讯抓取 → 八卦社自主采集（bagua_auto.py）→ 风控入库（bagua_daily.py）→ 重建 → 守卫推送
- RunAtLoad：登录/加载任务时立即跑一次（开机即更新）
- 日志：data/daily-update.log；手动触发：bash scripts_daily_update.sh

## 已知问题（2026-10-18 实测）
launchd 拉起的 bash 无「文稿」文件夹访问权（macOS TCC），报 Operation not permitted。
修法：系统设置 → 隐私与安全性 → 完全磁盘访问权限 → 添加并勾选 /bin/bash（或换用
非保护目录部署仓库）。授权未开启期间，自动更新由 AI 会话层定时任务（每日 07:35/13:50/10:30 巡检）兜底执行。
