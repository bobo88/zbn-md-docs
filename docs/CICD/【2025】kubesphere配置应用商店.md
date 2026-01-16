# KubeSphere 配置应用商店指南

## 一、安装应用商店

![An image](/images/RD/kubesphere-store-1.png)

![An image](/images/RD/kubesphere-store-2.png)

![An image](/images/RD/kubesphere-store-3.png)

### 1.1 访问扩展市场

1. 登录 KubeSphere 控制台
2. 在左侧导航栏中找到 **平台管理**
3. 点击 **集群管理**
4. 选择需要安装应用商店的集群
5. 进入 **集群设置** → **扩展组件**

### 1.2 安装应用商店组件

在扩展组件页面中：

1. **找到应用商店**

   ```bash
   扩展组件列表：
   - 应用商店 (App Store)
   - 服务网格 (Service Mesh)
   - 监控告警 (Monitoring)
   - 日志收集 (Logging)
   - ...
   ```

2. **点击安装**

   - 找到 "应用商店" 组件
   - 点击右侧的 **安装** 按钮
   - 确认安装参数（通常使用默认配置即可）

3. **等待安装完成**

   ```bash
   安装过程包括：
   - 创建必要的命名空间（如 openpitrix-system）
   - 部署应用商店控制器
   - 部署前端界面
   - 配置相关服务
   ```

4. **验证安装状态**

   ```bash
   # 查看 Pod 状态
   kubectl get pods -n openpitrix-system

   # 预期输出：
   NAME                                       READY   STATUS    RESTARTS   AGE
   openpitrix-api-gateway-xxx                 1/1     Running   0          2m
   openpitrix-app-manager-xxx                 1/1     Running   0          2m
   openpitrix-category-manager-xxx            1/1     Running   0          2m
   openpitrix-cluster-manager-xxx             1/1     Running   0          2m
   openpitrix-db-xxx                          1/1     Running   0          2m
   openpitrix-repo-indexer-xxx                1/1     Running   0          2m
   openpitrix-runtime-manager-xxx             1/1     Running   0          2m
   ```

## 二、配置应用商店

![An image](/images/RD/kubesphere-store-4.png)

![An image](/images/RD/kubesphere-store-5.png)

![An image](/images/RD/kubesphere-store-6.png)

![An image](/images/RD/kubesphere-store-7.png)

![An image](/images/RD/kubesphere-store-8.png)

### 2.1 进入应用商店管理

1. 登录 KubeSphere 控制台
2. 在左侧导航栏中找到 **应用商店**
3. 点击右上角的 **应用仓库管理**

### 2.2 添加应用仓库

点击 **添加仓库** 按钮，填写仓库信息：

#### 仓库配置示例：

```yaml
# 基础配置
仓库名称: ks-app-center          # 显示名称，可自定义
仓库地址: https://charts.kubesphere.io/main  # 官方仓库地址
同步间隔: 30分钟                 # 定期同步应用列表
描述: KubeSphere 官方应用仓库    # 可选描述信息

# 其他可选仓库
- Bitnami 仓库: https://charts.bitnami.com/bitnami
- Helm 官方仓库: https://helm-charts.itboon.top
- 自定义仓库: http://your-chart-repo.com
```

#### 添加步骤：

1. **填写基本信息**

   ```
   仓库名称: ks-app-center
   仓库地址: https://charts.kubesphere.io/main
   同步间隔: 30分钟
   ```

2. **添加凭据（如果需要认证）**

   - 对于私有仓库，可能需要配置用户名和密码
   - 点击 "添加凭证"
   - 选择凭据类型（用户名/密码、Token 等）
   - 填写认证信息

3. **测试连接**

   - 点击 **验证** 按钮测试仓库连接
   - 确保返回成功状态

4. **保存配置**
   - 点击 **确定** 保存仓库配置
   - 系统会自动开始同步仓库中的应用

### 2.3 仓库状态管理

#### 查看仓库状态：

```bash
# 在 KubeSphere 界面查看
状态列显示：
- 同步中：正在从远程仓库拉取应用信息
- 已就绪：同步完成，应用可用
- 失败：同步失败，需检查网络或配置

# 命令行查看
kubectl get apprepos -n openpitrix-system
```

#### 手动同步仓库：

1. 在仓库列表中，找到需要同步的仓库
2. 点击右侧的 **⋮**（更多操作）
3. 选择 **同步**
4. 等待同步完成

#### 删除仓库：

1. 找到需要删除的仓库
2. 点击右侧的 **⋮**（更多操作）
3. 选择 **删除**
4. 确认删除操作

## 三、使用应用商店

![An image](/images/RD/kubesphere-store-9.png)

![An image](/images/RD/kubesphere-store-10.png)

![An image](/images/RD/kubesphere-store-11.png)

![An image](/images/RD/kubesphere-store-12.png)

![An image](/images/RD/kubesphere-store-13.png)

![An image](/images/RD/kubesphere-store-14.png)

### 3.1 浏览可用应用

1. 进入 **应用商店** 页面
2. 浏览应用分类：

   ```
   分类包括：
   - 数据库 (MySQL, PostgreSQL, MongoDB, Redis)
   - 消息队列 (RabbitMQ, Kafka)
   - 监控告警 (Prometheus, Grafana)
   - 开发工具 (Jenkins, GitLab)
   - 网络服务 (Nginx, Traefik)
   - 存储服务 (MinIO, Ceph)
   - AI/大数据 (TensorFlow, Spark)
   ```

3. 搜索应用：
   - 使用顶部搜索框搜索特定应用
   - 支持按名称、分类、描述搜索

### 3.2 从应用模板部署应用

#### 示例：部署 MySQL

1. **选择应用**

   - 在应用商店中找到 MySQL
   - 点击进入应用详情页

2. **查看应用信息**

   ```
   应用详情包括：
   - 应用描述
   - 版本列表
   - 配置文件（Chart 文件）
   - 部署要求
   - 维护者信息
   ```

3. **部署配置** 点击 **部署** 按钮，进入部署配置页面：

   **步骤一：基本信息**

   ```yaml
   应用名称: mysql-demo # 自定义应用名称
   位置（项目）: demo-project # 选择部署的项目/命名空间
   版本: 8.0.32 # 选择应用版本
   描述: MySQL 测试数据库 # 可选描述
   ```

   **步骤二：应用配置**

   - 使用默认配置或自定义配置
   - 可配置的选项包括：

     ```yaml
     # MySQL 配置示例
     auth:
       rootPassword: 'MyStrongPassword123'
       database: 'testdb'
       username: 'testuser'
       password: 'TestUser123'

     # 资源限制
     resources:
       requests:
         memory: '256Mi'
         cpu: '250m'
       limits:
         memory: '1Gi'
         cpu: '500m'

     # 存储配置
     primary:
       persistence:
         enabled: true
         size: '8Gi'
         storageClass: 'standard'

     # 网络配置
     service:
       type: NodePort
       port: 3306
     ```

   **步骤三：高级设置**

   - 标签和注解
   - 亲和性和容忍度
   - 更新策略

4. **确认部署**
   - 点击 **部署** 按钮
   - 查看部署状态

### 3.3 查看部署状态

1. 进入对应的项目
2. 在 **应用负载** → **应用** 中查看
3. 状态显示：

   ```
   部署状态：
   - 部署中：应用正在创建
   - 已部署：应用正常运行
   - 失败：部署过程出错
   ```

4. 点击应用名称查看详情：
   ```
   详情页面显示：
   - 工作负载状态
   - 服务访问信息
   - 配置信息
   - 事件日志
   - 监控指标
   ```

### 3.4 应用管理操作

#### 更新应用：

1. 进入应用详情页
2. 点击 **更多操作** → **编辑设置**
3. 修改配置参数
4. 确认更新

#### 回滚应用：

1. 进入应用详情页
2. 点击 **更多操作** → **回滚**
3. 选择要回滚到的版本
4. 确认回滚操作

#### 删除应用：

1. 进入应用详情页
2. 点击 **更多操作** → **删除**
3. 确认删除操作
4. 选择是否删除相关资源（PVC、ConfigMap 等）

## 四、创建自定义应用模板

### 4.1 准备 Helm Chart

```bash
# 创建 Helm Chart 结构
my-app/
├── Chart.yaml          # Chart 元数据
├── values.yaml         # 默认配置
├── templates/          # Kubernetes 模板文件
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
└── README.md           # 应用说明
```

### 4.2 Chart.yaml 示例

```yaml
apiVersion: v2
name: my-custom-app
description: A custom application for KubeSphere
type: application
version: 1.0.0
appVersion: 1.0.0
icon: https://example.com/icon.png
keywords:
  - webapp
  - custom
home: https://example.com
sources:
  - https://github.com/example/my-app
maintainers:
  - name: Your Name
    email: your.email@example.com
```

### 4.3 上传到仓库

1. **打包 Chart**

   ```bash
   helm package my-app/
   # 生成 my-custom-app-1.0.0.tgz
   ```

2. **创建 Helm 仓库**

   ```bash
   # 使用 ChartMuseum
   helm repo add chartmuseum http://chartmuseum.example.com
   curl --data-binary "@my-custom-app-1.0.0.tgz" http://chartmuseum.example.com/api/charts
   ```

3. **添加到 KubeSphere**
   - 按照第 2 节的方法添加自定义仓库
   - 仓库地址填写你的 ChartMuseum 地址

## 五、高级功能

### 5.1 应用商店权限管理

#### 项目级权限：

```yaml
# 在项目设置中配置
权限角色： - 操作员：可以部署和管理应用 - 查看者：只能查看应用信息 - 管理员：完全控制权限
```

#### 工作空间级权限：

```yaml
# 在工作空间设置中配置
权限包括： - 管理应用商店配置 - 管理应用仓库 - 审核应用部署
```

### 5.2 应用商店设置

1. 进入 **平台管理** → **应用商店** → **商店设置**
2. 可配置项：
   ```
   商店设置：
   - 默认仓库：设置首选应用仓库
   - 同步策略：全局同步设置
   - 显示设置：定制商店界面
   - 缓存策略：优化性能
   ```

### 5.3 应用审核流程

#### 启用审核：

```yaml
# 需要企业版支持
审核流程： 1. 用户提交应用部署请求 2. 管理员审核部署配置 3. 批准或拒绝部署 4. 记录审核日志
```

## 六、故障排查

### 6.1 常见问题

#### 问题一：应用商店无法访问

```bash
# 检查 Pod 状态
kubectl get pods -n openpitrix-system

# 检查服务状态
kubectl get svc -n openpitrix-system

# 检查日志
kubectl logs -f -n openpitrix-system -l app=openpitrix
```

#### 问题二：仓库同步失败

```bash
# 检查网络连接
curl -I https://charts.kubesphere.io/main

# 检查仓库配置
kubectl get apprepos -n openpitrix-system -o yaml

# 查看同步日志
kubectl logs -f -n openpitrix-system -l component=repo-indexer
```

#### 问题三：应用部署失败

```bash
# 检查事件
kubectl get events -n <namespace>

# 检查资源配额
kubectl describe quota -n <namespace>

# 检查存储类
kubectl get storageclass
```

### 6.2 性能优化

```yaml
# 调整应用商店资源
resources:
  requests:
    memory: '512Mi'
    cpu: '500m'
  limits:
    memory: '2Gi'
    cpu: '1'

# 调整缓存大小
cache:
  size: '1Gi'
  ttl: '3600s'
```

## 七、最佳实践

### 7.1 仓库管理实践

1. **分类管理**

   - 创建多个仓库按用途分类
   - 官方仓库 + 私有仓库组合使用

2. **版本控制**

   - 定期更新应用版本
   - 保留历史版本用于回滚

3. **安全实践**
   - 私有仓库使用 TLS
   - 定期轮换访问凭证
   - 审计应用部署记录

### 7.2 应用部署实践

1. **环境分离**

   ```yaml
   环境策略： - 开发环境：使用最新版本，频繁更新 - 测试环境：使用稳定版本，完整测试 - 生产环境：使用已验证版本，谨慎更新
   ```

2. **配置管理**

   - 使用 ConfigMap 和 Secret 管理配置
   - 避免在 values.yaml 中硬编码敏感信息
   - 为不同环境使用不同的配置文件

3. **监控告警**
   - 为关键应用设置监控
   - 配置资源使用告警
   - 监控应用健康状态

### 7.3 备份恢复

```bash
# 备份应用商店配置
kubectl get apprepos -n openpitrix-system -o yaml > apprepos-backup.yaml

# 备份已部署应用
helm list -A > helm-apps-backup.txt

# 恢复步骤
kubectl apply -f apprepos-backup.yaml
```

## 八、扩展阅读

### 8.1 官方文档

- [KubeSphere 应用商店官方文档](https://kubesphere.io/docs/pluggable-components/app-store/)
- [Helm Chart 开发指南](https://helm.sh/docs/topics/charts/)
- [ChartMuseum 使用指南](https://chartmuseum.com/docs/)

### 8.2 相关工具

- **Helm**: 包管理工具
- **ChartMuseum**: Helm Chart 仓库
- **Monocular**: Helm Chart UI
- **Artifact Hub**: CNCF 应用市场

### 8.3 社区资源

- [KubeSphere GitHub](https://github.com/kubesphere)
- [KubeSphere 论坛](https://kubesphere.com.cn/forum/)
- [KubeSphere Slack 频道](https://kubesphere.slack.com)
