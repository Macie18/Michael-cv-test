# `naidongma.com` 发布清单

本项目是无构建步骤的双语静态网站。仓库根目录中的内容可直接上传到 OSS Bucket 根目录；无需 Node.js、数据库或云密钥写入仓库。

## 推荐上线架构

保持 `naidongma-web` 为私有 Bucket，并使用阿里云 CDN 的“同账号私有 OSS 回源”。这会由阿里云使用临时令牌访问源站，不需要在 GitHub、代码或说明文档中保存 AccessKey。

- 源站：香港 OSS `naidongma-web`
- 加速域名：`naidongma.com`（主域名）
- 可选别名：`www.naidongma.com`，统一 301 到主域名
- 加速区域：若尚无 ICP 备案，选择“全球（不含中国内地）”
- 源站类型：OSS 域名；选择 `naidongma-web` 的香港外网域名
- 私有回源：开启“阿里云 OSS 私有 Bucket 回源”，选择“同账号回源”
- HTTPS：在 CDN 域名上部署覆盖主域名（及 `www`，如启用）的证书，并开启 HTTP → HTTPS 301

## 上传

在 OSS 控制台进入 `naidongma-web` → 文件管理，将仓库根目录下的全部站点文件与文件夹上传到 Bucket 根目录。必须保留目录结构，特别是 `Assets/`、`data/`、`en/`、`profile/`、`practice/`、`publications/`、`team/` 和 `global/`。

上传完成后至少应能看到：

- `index.html`
- `en/index.html`
- `styles.css`、`editorial.css`、`app.js`
- `robots.txt`、`sitemap.xml`、`llms.txt`、`404.html`

## CDN 目录首页规则（私有 Bucket 必需）

私有回源请求不会触发 OSS 的匿名默认首页逻辑。请在 CDN → 域名管理 → 缓存配置 → 重写访问 URL 中按顺序添加以下规则，执行规则都选 `break`，让浏览器地址保持不变：

1. 待重写 Path：`^/$`；目标 Path：`/index.html`
2. 待重写 Path：`^/(.+)/$`；目标 Path：`/$1/index.html`
3. 待重写 Path：`^/([^.?#]+)$`；目标 Path：`/$1/index.html`

第三条兼容用户访问不带结尾斜杠的目录路径。单独访问真实文件（例如 `.css`、`.js`、`.webp`、`.xml`）不会被改写。

## DNS 与 HTTPS

1. 在 CDN 控制台复制 `naidongma.com` 对应的 CNAME 目标。
2. 在云解析 DNS 中为主机记录 `@` 添加 CNAME，指向该目标；如启用 `www`，再添加 `www` CNAME。
3. 等待 DNS 生效后，在 CDN 的 HTTPS 配置中部署证书并启用强制 HTTPS。
4. 缓存建议：HTML/JSON/XML/TXT 为短缓存或不缓存；带版本管理的 CSS、JS、图片可设较长缓存。首次上线先使用短缓存，验证后再延长。

自动续签与最小权限配置见 [`ops/HTTPS-AUTOMATION.md`](ops/HTTPS-AUTOMATION.md)。该方案使用 GitHub OIDC 和阿里云 STS 临时凭证，不在仓库中保存长期 AccessKey 或证书私钥。

## 上线验收

逐项检查：

- `https://naidongma.com/` 与 `https://naidongma.com/en/`
- 六组中英文页面及语言切换
- CSS、头像、团队照片、地图与文章目录均正常加载
- `/robots.txt`、`/sitemap.xml`、`/llms.txt` 可公开访问
- HTTP 自动 301 到 HTTPS；`www`（如启用）统一 301 到主域名
- 不存在的路径返回 HTTP 404，并显示 `404.html`（可在 CDN 设置自定义错误页）
- 响应中没有 `X-Robots-Tag: noindex`

## 搜索引擎与 AI 抓取

1. 在 Google Search Console、Bing Webmaster Tools 和百度搜索资源平台分别添加 `naidongma.com`，按平台提供的 DNS TXT 记录完成所有权验证。
2. 提交 `https://naidongma.com/sitemap.xml`。
3. 用 Google URL Inspection / Bing URL Inspection 检查首页与英文首页并请求收录。
4. `robots.txt` 对所有抓取工具开放；页面包含 canonical、双向 `hreflang`、结构化人物信息和可选的 `llms.txt`。`llms.txt` 是补充信息，不替代 robots、sitemap 或页面正文。
5. 任何平台提供的验证令牌只放在 DNS 或平台要求的验证文件中，不写进公开说明、聊天或截图。

## 更新与回滚

每次发布前保留上一版压缩包。上传新文件后刷新 CDN 目录缓存，再验证中英文首页和一个子页面。出现问题时，重新上传上一版并再次刷新缓存即可回滚。
