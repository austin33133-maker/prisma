# Dazi API 服务器部署指南

从零把这个后端放到公网服务器上，全程大约 30 分钟。

## 一、买服务器

- **推荐**：新加坡区域的云主机（目标市场是东南亚，延迟最低）。
  - 入门配置：2 核 CPU / 2GB 内存 / 40GB 硬盘，足够支撑 MVP 阶段几千日活。
  - 可选厂商:DigitalOcean、Vultr、AWS Lightsail、阿里云国际版，均有新加坡机房，月费约 $10–20。
- 系统选 **Ubuntu 24.04 LTS**。
- 买一个域名（如 `yourdomain.com`），在 DNS 里加一条 A 记录：`api.yourdomain.com` → 服务器公网 IP。

## 二、初始化服务器

SSH 登录服务器后执行：

```sh
# 安装 Docker（官方一键脚本）
curl -fsSL https://get.docker.com | sh

# 拉取代码
git clone <你的仓库地址> app
cd app/apps/dazi-server
```

## 三、配置域名

编辑 `Caddyfile`，把 `api.yourdomain.com` 换成你的真实域名。
Caddy 会自动申请并续期 HTTPS 证书（Let's Encrypt），不需要手动操作。

## 四、启动

```sh
docker compose up -d --build
```

完成。验证：

```sh
curl https://api.yourdomain.com/health
# 期望输出 {"ok":true}
```

数据库是 SQLite，数据保存在 Docker 卷 `dazi-data` 中，重启和重新部署不会丢失。

## 五、日常运维

```sh
docker compose logs -f api        # 看日志
docker compose up -d --build      # 更新代码后重新部署
docker compose down               # 停止（数据不丢）

# 备份数据库（建议加进 crontab 每天一次）
docker compose cp api:/app/data/dazi.db ./backup-$(date +%F).db
```

## 六、客户端接入

App 端把 API 地址指向 `https://api.yourdomain.com`
（在 `apps/dazi-client` 中配置 `EXPO_PUBLIC_API_URL` 环境变量即可）。

## 七、什么时候需要升级架构

| 信号 | 动作 |
|---|---|
| 日活过万 / 写入变慢 | SQLite 换 PostgreSQL（Prisma schema 改一行 provider，数据用脚本迁移） |
| 需要实时消息推送 | 加 WebSocket 网关（当前客户端是轮询拉取） |
| 单机扛不住 | API 无状态，可直接横向扩容 + 负载均衡；SQLite 必须先换 Postgres |
| 上语音房（阶段二） | 接声网/即构 RTC，与本服务解耦，只需加房间和钱包相关 API |

## 安全注意事项

- 当前注册接口没有密码/OTP（MVP 演示用）。**公开发布前必须**接入真实认证
  （推荐 Google/Apple OAuth，海外用户标配），并给注册和发消息接口加频率限制。
- 服务器防火墙只开 22、80、443 端口（`ufw allow 22,80,443/tcp && ufw enable`）。
- 不要把 `.env` 提交进 git（已在 `.gitignore` 中）。
