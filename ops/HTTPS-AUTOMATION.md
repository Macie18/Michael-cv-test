# HTTPS 自动续签方案

网站使用 GitHub Actions 的 OIDC 身份临时扮演阿里云 RAM 角色。每次运行只取得 30 分钟 STS 凭证，不创建或保存长期 AccessKey。

## 阿里云一次性配置

1. 创建 OIDC 身份提供商 `GitHubActionsNaidongma`：
   - 颁发者 URL：`https://token.actions.githubusercontent.com`
   - 客户端 ID：`sts.aliyuncs.com`
   - 最早签发时间限制：`1` 小时
2. 创建可信实体为上述 OIDC 身份提供商的 RAM 角色 `NaidongmaHttpsAutomation`，信任策略使用 `aliyun-github-oidc-trust.template.json`，并将 `${ALIYUN_ACCOUNT_ID}` 替换为当前阿里云账号 ID。
3. 创建自定义权限策略，内容使用 `aliyun-https-permissions.template.json`，替换账号 ID 后只授权：
   - 在 `naidongma.com` 下添加和删除 DNS 记录；脚本进一步限制为两个 ACME 验证 TXT 名称。阿里云 RAM 的该授权按域名划分，并不强制限制记录名称或类型，因此必须保护仓库 main 分支与工作流修改权限；
   - 读取并更新 `naidongma.com` 和 `www.naidongma.com` 的 CDN 证书。
4. 将自定义权限策略只绑定给 `NaidongmaHttpsAutomation` 角色。

## GitHub 仓库变量

在仓库 Settings → Secrets and variables → Actions → Variables 中设置：

- `ACME_EMAIL`：ACME 注册联系邮箱；不要依赖证书机构发送到期邮件；
- `ALIYUN_OIDC_PROVIDER_ARN`：`acs:ram::<账号ID>:oidc-provider/GitHubActionsNaidongma`；
- `ALIYUN_ROLE_ARN`：`acs:ram::<账号ID>:role/NaidongmaHttpsAutomation`；
- `ALIYUN_CDN_DOMAINS`：`naidongma.com,www.naidongma.com`。在 `www` 尚未接入 CDN 前可暂设为 `naidongma.com`。

这些值不是云密钥。工作流不需要 GitHub Secret，也不会把证书私钥提交到仓库。

## 运行逻辑

- 每周一检查主域名的 CDN 证书；剩余有效期大于 35 天时不执行续签。
- 需要续签时，使用 Let's Encrypt DNS-01 同时签发 `naidongma.com` 与 `www.naidongma.com`。
- DNS hook 只允许修改 `_acme-challenge.naidongma.com` 和 `_acme-challenge.www.naidongma.com`，其他名称会被拒绝。
- 证书和私钥只存在于临时 GitHub Runner，部署到 CDN 后随 Runner 销毁。
- 手动运行工作流时可选择强制续签；不要频繁使用，以免触发 Let's Encrypt 频率限制。

## 首次上线后的 CDN 设置

证书首次部署并验证 HTTPS 正常后，在两个 CDN 域名上启用“强制 HTTPS”，跳转码选 `301`。该设置是持久配置，不需要每次续签重复执行。

定期检查 GitHub Actions 是否仍在运行。GitHub 可能在公共仓库长期无活动时停用定时工作流；如果仓库进入长期静默维护，应把同一套流程迁移到长期运行的托管任务，或至少设置独立的证书到期监控。
