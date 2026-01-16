# Ubuntu 24 搭建 Mailcow 邮件服务

本文档旨在指导您在 Ubuntu 24 系统上安装并部署 Mailcow，一个功能齐全的 Docker 化邮件服务器解决方案。

## 安装前的系统要求

- **内存**：至少 4GB（推荐 8GB 或以上）
- **磁盘空间**：至少 20GB
- **操作系统**：Ubuntu 20.04/22.04 LTS（本文基于 Ubuntu 24 进行说明）
- **依赖软件**：Docker 和 Docker Compose 必须已安装

---

## 一、安装 Docker

### 1. 更新系统包索引

```bash
sudo apt update
```

### 2. 安装必要的依赖包

```bash
sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release
```

### 3. 添加 Docker 官方 GPG 密钥

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

### 4. 添加 Docker 官方软件仓库

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 5. 安装 Docker Engine

```bash
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io
```

### 6. 启动 Docker 服务并设置为开机自启

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

### 7. 验证 Docker 是否安装成功

```bash
docker --version
```

![An image](/images/RD/mailcow-1.png)

### 8. 安装 Docker Compose 插件

```bash
sudo apt install docker-compose-plugin
```

### 9. 验证 Docker Compose 是否安装成功

```bash
docker compose version
```

![An image](/images/RD/mailcow-2.png)

---

## 二、安装 Mailcow

### 1. 修改主机名

请将 `mail.youliroam.cn` 替换为您自己的邮件服务器域名。

```bash
sudo hostnamectl set-hostname mail.youliroam.cn
```

### 2. 安装所需依赖

```bash
sudo apt update
sudo apt install curl git apt-transport-https ca-certificates curl gnupg lsb-release
```

### 3. 下载 Mailcow

```bash
# 克隆 mailcow 仓库
sudo mkdir -p /opt
cd /opt
sudo git clone https://github.com/mailcow/mailcow-dockerized
cd mailcow-dockerized
```

> 注：根据 Mailcow 官方 [GitHub 仓库](https://github.com/mailcow/mailcow-dockerized)，它是一款基于 Docker 的邮件服务器解决方案。

### 4. 生成配置文件

运行交互式脚本，根据提示输入您的邮件域名等信息。

```bash
sudo ./generate_config.sh
```

### 5. 启动 Mailcow

```bash
# 确保在 mailcow-dockerized 目录下
cd /opt/mailcow-dockerized

# 拉取所有 Docker 镜像（可能需要一些时间）
sudo docker compose pull

# 以后台模式启动所有服务
sudo docker compose up -d
```

---

## 三、验证安装与基本配置

启动所有容器需要几分钟时间。当服务就绪后，您可以通过以下步骤进行初始配置。

### 1. 以管理员身份登录

- 在浏览器中访问您的服务器地址或域名，例如：`https://mail.youliroam.cn`。
- 使用默认的管理员账号和密码登录：**admin / moohoo**。

![An image](/images/RD/mailcow-3.png)

![An image](/images/RD/mailcow-4.png)

### 2. 配置邮箱，添加域名

在管理面板中，添加您计划用于收发邮件的域名。

![An image](/images/RD/mailcow-5.png)

![An image](/images/RD/mailcow-6.png)

![An image](/images/RD/mailcow-7.png)

### 3. 添加用户邮箱账号

为您的域名创建用户邮箱账户（如 `user@youliroam.cn`）。

![An image](/images/RD/mailcow-8.png)

![An image](/images/RD/mailcow-9.png)

### 4. 用户登录

新创建的用户可以使用以下方式登录：

- **Webmail**：访问 `https://mail.youliroam.cn/SOGo/` 登录使用 Web 邮箱界面。
- **客户端配置**：使用 IMAP/SMTP 设置配置邮件客户端（如 Outlook、Thunderbird 或移动端邮件 App）。

![An image](/images/RD/mailcow-10.png)

![An image](/images/RD/mailcow-11.png)

---

## ⚠️ 重要提示与故障排查

1.  **域名与网络**：确保您的服务器域名（`mail.youliroam.cn`）已正确解析到服务器的公网 IP 地址。同时，防火墙需要开放 80（HTTP）、443（HTTPS）、25（SMTP）、465（SMTPS）、587（Submission）、993（IMAPS）和 995（POPS3）等端口。
2.  **配置文件检查**：如果在启动时遇到问题，请仔细检查 `mailcow-dockerized` 目录下的 `mailcow.conf` 配置文件内容是否正确。
3.  **服务状态**：您可以使用 `sudo docker compose ps` 命令来查看所有容器的运行状态，确保它们都处于 “Up” 状态。
4.  **官方支持**：如果遇到复杂问题，建议查阅 [Mailcow 官方文档](https://mailcow.github.io/mailcow-dockerized-docs/) 或在相关社区寻求帮助。根据其 GitHub 页面，若发现关键安全问题，请通过邮件联系开发者。

希望这份文档能帮助您成功搭建属于自己的邮件服务器！
