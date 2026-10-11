# 埋点激活与正式域名切换 · 两步 SOP（v0.85）

代码侧已全部就绪。以下两步各需**一条你提供的信息**，改完即生效。

## 第一步：激活埋点（三选一，把对应值发我即可）

| 选项 | 你要做的事 | 我需要的值 |
|---|---|---|
| GA4（推荐，免费） | analytics.google.com → 创建媒体资源 → 数据流（网页） | 衡量 ID（形如 `G-XXXXXXXXXX`） |
| Plausible（最简，付费 $9/月起） | plausible.io 注册并添加域名 | 你的站点域名 |
| **百度统计（✅ 已选此路线）** | tongji.baidu.com → 管理 → 新增网站（域名填 `mina2026best.github.io`）→ 获取代码 | 复制代码里 `hm.js?` 后面那串 32 位 ID 发我即可 |

> 填入位置：`src/template.html` 头部 `window.JFM_ANALYTICS`。
> 已埋好的事件：`quiz_complete`（自查完成）/ `subscribe_ics`（订阅）/ `forum_post`（发帖）/ `subscribe_share`（分享）/ `order_intent`（会员意向）/ `contact_submit`（留言）/ `biz_submit`（B端意向）。
> 未填 ID 期间事件仅记录在访客本机（`jfm_event_log`），不外发、不虚报。

## 第二步：切换正式域名（README 查重口径显示 huaqice.com / huaqice.cn 均未注册可得）

1. 你在任意注册商（阿里云/腾讯云，约 ¥50-80/年）购买域名并完成实名认证
2. DNS 添加两条记录指向你选择的托管（GitHub Pages：`CNAME → mina2026best.github.io`；EdgeOne：按其控制台提示 CNAME）
3. 把域名发我，我改 `build.py` 第 10 行 `SITE_BASE = "https://你的域名"` 一处，canonical / OG / JSON-LD / sitemap / robots / 137 篇文章页全站自动切换
4. GitHub Pages 设置页填入自定义域 + 勾选 Enforce HTTPS；旧 github.io 地址自动 301 到新域
5. 仓库根放入 `CNAME` 文件（内容为域名）随代码一并提交

## 当前状态（v0.85 已就绪的部分）
- `build.py` 第 10 行 `SITE_BASE` 单源配置：全站 URL（canonical/OG/JSON-LD/sitemap/robots/文章页）改一处全生效
- `JFM_ANALYTICS` 三通道加载器：GA4 / Plausible / 自定义脚本（百度统计等），填 ID 即激活，事件已全部埋好
- `_headers`：EdgeOne/Cloudflare 部署时 hash 资源自动长缓存 immutable

## 百度统计通道已预打通（2026-10-11）

- 加载器支持 `custom.script = "https://hm.baidu.com/hm.js?{ID}"`，自动初始化 `_hmt` 队列
- 全部 7 个事件自动映射为百度 `_trackEvent`（分类 jfm）：自查完成 / 订阅 / 发帖 / 分享 / 会员意向 / 留言 / B端意向
- 你把 32 位 ID 发我 → 我填入 → 推送上线 → 你在百度统计"实时访客"里 1 分钟内可见验证数据
