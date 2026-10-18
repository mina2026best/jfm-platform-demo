# 每日自动采集定时任务安装
cp scripts/com.jfm.daily-update.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.jfm.daily-update.plist
# 运行日志：data/daily-update.log；手动触发：bash scripts_daily_update.sh
