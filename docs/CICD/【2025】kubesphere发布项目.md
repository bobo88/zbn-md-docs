# KubeSphere 发布项目

## 1. 通过应用部署

### 1.1 部署 Deployment 和 Service

![An image](/images/RD/kubesphere-1.png)

将编辑好的 deployment.yaml 复制到 KubeSphere 应用部署编辑器中：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: go-app-deployment
  namespace: q-note
spec:
  replicas: 2
  selector:
    matchLabels:
      app: go-app
  template:
    metadata:
      labels:
        app: go-app
    spec:
      containers:
        - name: go-app-container
          image: registry.cn-shenzhen.aliyuncs.com/youli371966511/pm-go:1.0.2 # 使用你的Docker镜像地址
          ports:
            - containerPort: 80
          volumeMounts:
            - name: config-volume
              mountPath: /app/config
      volumes:
        - name: config-volume
          configMap:
            name: config-yaml
---
apiVersion: v1
kind: Service
metadata:
  name: go-app-service
  namespace: q-note
  labels:
    app: go-app-svc
  annotations:
    kubesphere.io/creator: admin
spec:
  selector:
    app: go-app
  ports:
    - name: http-80
      protocol: TCP
      targetPort: 80
      port: 80
```

### 1.2 点击确定自动创建

点击 **确定** 按钮，KubeSphere 会自动创建 Deployment 和 Service。

![An image](/images/RD/kubesphere-2.png)

![An image](/images/RD/kubesphere-3.png)

### 1.3 访问部署好的项目

通过分配的端口（如 `30477`）访问部署好的项目：

```
http://<节点IP>:30477
```

![An image](/images/RD/kubesphere-4.png)

## 2. 通过持续部署（GitOps）

### 2.1 前提条件

1. **添加代码仓库**：

   - 在 KubeSphere 中配置 Git 仓库凭证
   - 添加包含部署配置文件的代码仓库

2. **配置部署文件**：在代码仓库中准备 `deployment.yaml` 文件，包含 Deployment 和 Service 配置。

![An image](/images/RD/kubesphere-5.png)

![An image](/images/RD/kubesphere-6.png)

![An image](/images/RD/kubesphere-7.png)

![An image](/images/RD/kubesphere-8.png)

![An image](/images/RD/kubesphere-9.png)

![An image](/images/RD/kubesphere-10.png)

![An image](/images/RD/kubesphere-11.png)

### 2.2 创建持续部署

1. 进入 **应用负载** → **持续部署**
2. 点击 **创建** 按钮
3. 选择 **代码仓库** 作为部署来源
4. 配置以下信息：

| 配置项   | 说明                               |
| -------- | ---------------------------------- |
| 名称     | 部署名称（如 `go-app-deployment`） |
| 命名空间 | 目标命名空间（如 `q-note`）        |
| 代码仓库 | 选择已配置的 Git 仓库              |
| 分支     | 部署配置所在分支（如 `main`）      |
| 路径     | 部署文件路径（如 `/manifests/`）   |
| 同步策略 | 自动/手动同步                      |

### 2.3 示例仓库结构

```
your-git-repo/
├── manifests/
│   ├── deployment.yaml
│   └── service.yaml
└── README.md
```

### 2.4 点击确定自动部署

点击 **确定** 后，KubeSphere 会自动：

1. 拉取代码仓库中的配置
2. 解析 Kubernetes 清单文件
3. 将资源部署到指定命名空间
4. 监控部署状态

![An image](/images/RD/kubesphere-12.png)

## 3. 配置管理（ConfigMap）

### 3.1 创建 ConfigMap

如果应用需要配置文件，需要提前创建 ConfigMap：

1. 进入 **配置管理** → **配置字典**
2. 点击 **创建** 按钮
3. 填写以下信息：

**基础信息**：

- 名称：`config-yaml`
- 命名空间：`q-note`
- 描述：Go 应用配置文件

**数据配置**：

```yaml
app.yaml: |
  server:
    port: 8080
    host: 0.0.0.0

  database:
    host: mysql-service
    port: 3306
    name: mydb
    user: root
    password: password123

  logging:
    level: info
    path: /var/log/go-app
```

### 3.2 验证 ConfigMap

```bash
# 查看 ConfigMap
kubectl get configmap config-yaml -n q-note -o yaml

# 查看 Pod 中的配置文件
kubectl exec -it <pod-name> -n q-note -- cat /app/config/app.yaml
```

## 4. 部署验证

### 4.1 检查部署状态

```bash
# 查看 Deployment 状态
kubectl get deployment go-app-deployment -n q-note

# 查看 Pod 状态
kubectl get pods -n q-note -l app=go-app

# 查看 Service 状态
kubectl get service go-app-service -n q-note

# 查看 ConfigMap 状态
kubectl get configmap config-yaml -n q-note
```

### 4.2 访问测试

```bash
# 获取 NodePort
kubectl get svc go-app-service -n q-note -o jsonpath='{.spec.ports[0].nodePort}'

# 测试访问
curl http://<任意节点IP>:<NodePort>/health
```

## 5. 注意事项

### 5.1 ConfigMap 使用要点

1. **更新 ConfigMap**：

   ```bash
   # 更新 ConfigMap
   kubectl edit configmap config-yaml -n q-note

   # 重启 Pod 使配置生效
   kubectl rollout restart deployment/go-app-deployment -n q-note
   ```

2. **配置热更新**：
   - 某些应用支持配置文件热更新
   - 如果不支持，需要重启 Pod

### 5.2 持续部署最佳实践

1. **版本控制**：

   - 所有部署配置纳入 Git 版本控制
   - 使用标签或分支管理不同环境

2. **回滚机制**：

   ```bash
   # 查看部署历史
   kubectl rollout history deployment/go-app-deployment -n q-note

   # 回滚到指定版本
   kubectl rollout undo deployment/go-app-deployment -n q-note --to-revision=2
   ```

3. **健康检查**：

   ```yaml
   # 在 deployment.yaml 中添加健康检查
   livenessProbe:
     httpGet:
       path: /health
       port: 80
     initialDelaySeconds: 30
     periodSeconds: 10

   readinessProbe:
     httpGet:
       path: /ready
       port: 80
     initialDelaySeconds: 5
     periodSeconds: 5
   ```

### 5.3 安全考虑

1. **敏感信息管理**：

   - 使用 Secret 存储密码、令牌等敏感信息
   - 避免在 ConfigMap 中存储敏感数据

2. **访问控制**：
   - 配置合适的 RBAC 权限
   - 限制对生产环境命名空间的访问

---

**部署成功标志**：

1. 所有 Pod 状态为 "Running"
2. ConfigMap 正确挂载到容器
3. 服务可通过 NodePort 正常访问
4. 健康检查通过
