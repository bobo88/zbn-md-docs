# 部署 Redis 哨兵模式

## Ubuntu 24.04.3 搭建 Redis 哨兵模式

### 准备 3 台机器

- **主节点**：192.168.100.6
- **从节点**：192.168.100.4，192.168.100.5

---

### 1. 安装 Redis 和 Sentinel

```bash
# 3台机器都安装
sudo apt update
sudo apt install redis-server redis-sentinel -y
```

---

### 2. 修改主节点配置文件

```bash
# 在 192.168.100.6 机器上修改
sudo vim /etc/redis/redis.conf

# 修改以下内容，其他不变
bind 0.0.0.0
port 6379
dir /var/lib/redis
requirepass mima123
masterauth mima123

# 重启服务
sudo systemctl restart redis-server
```

---

### 3. 修改从节点配置文件

```bash
# 在 192.168.100.4 和 192.168.100.5 机器上修改
sudo vim /etc/redis/redis.conf

# 修改以下内容，其他不变
bind 0.0.0.0
port 6379
dir /var/lib/redis
replicaof 192.168.100.6 6379 #192.168.100.6
requirepass mima123
masterauth mima123

# 重启服务
sudo systemctl restart redis-server
```

---

### 4. 验证主从复制

**主节点上执行：**

![An image](/images/RD/redis-1.png)

**从节点上执行：**

![An image](/images/RD/redis-2.png)

---

### 5. 配置哨兵（3 个节点都配置）

```bash
sudo vim /etc/redis/sentinel.conf

# 修改以下内容
port 26379
sentinel monitor mymaster 192.168.100.6 6379 2
sentinel auth-pass mymaster mima123
sentinel down-after-milliseconds mymaster 5000
sentinel failover-timeout mymaster 60000
sentinel parallel-syncs mymaster 1
requirepass mima123

# 重启哨兵服务
sudo systemctl restart redis-sentinel
```

---

### 6. 验证

**任意节点上执行：**

![An image](/images/RD/redis-3.png)

---

### 7. PS

哨兵默认不启用 requirepass，如果需要生效则注释 `/etc/redis/sentinel.conf` 后面的：

```
#user default on nopass sanitize-payload ~* &* +@all
```
