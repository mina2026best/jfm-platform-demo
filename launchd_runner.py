#!/usr/local/bin/python3
# launchd argv[0] 必须是已获 TCC 授权的解释器（/bin/bash 读 Documents 被 EPERM，实测 2026-10-19）。
# 经此 runner 以 /bin/bash 执行真正的更新脚本。模式同 quantkb runjob.py。
import sys, subprocess
sys.exit(subprocess.call(["/bin/bash", sys.argv[1]]))
