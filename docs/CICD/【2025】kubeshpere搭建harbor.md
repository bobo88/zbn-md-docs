# KubeSphere 搭建 Harbor 私有镜像仓库

## 1. 安装 Harbor

### 1.1 去应用商店安装

在 KubeSphere 的应用商店中搜索 Harbor 并进行安装。

![An image](/images/RD/harbor-1.png)

![An image](/images/RD/harbor-2.png)

![An image](/images/RD/harbor-3.png)

### 1.2 修改配置

使用以下配置，主要设置：

- 暴露类型：ingress
- TLS 证书：自动生成
- 域名：core.harbor.domain 和 notary.harbor.domain

```yaml
expose:
  type: ingress
  tls:
    enabled: true
    certSource: auto
    auto:
      commonName: ''
  ingress:
    hosts:
      core: core.harbor.domain
      notary: notary.harbor.domain
    controller: default
    annotations:
      ingress.kubernetes.io/ssl-redirect: 'true'
      ingress.kubernetes.io/proxy-body-size: '0'
      nginx.ingress.kubernetes.io/ssl-redirect: 'true'
      nginx.ingress.kubernetes.io/proxy-body-size: '0'

externalURL: https://core.harbor.domain
# 其他配置保持默认...
```

![An image](/images/RD/harbor-4.png)

### 1.3 等待安装完成并观察报错

**常见问题解决：**

1. **创建 PV 绑定**

   - 检查存储类配置
   - 确保 PVC 能正常绑定 PV

2. **设置 PV 权限**
   - 确保 PV 有正确的访问权限
   - 检查文件系统权限设置

**成功运行标准：**

- 所有 Pod 状态为 Running
- 服务正常启动
- 无错误日志输出

![An image](/images/RD/harbor-5.png)

## 2. 配置应用路由

Harbor 安装后会自动生成两个 Ingress，但需要根据实际域名进行调整：

### 2.1 手动创建自定义 Ingress

**第一个 Ingress (Harbor Core)：**

```yaml
kind: Ingress
apiVersion: networking.k8s.io/v1
metadata:
  name: harbor-core-ingress
  namespace: note
  annotations:
    kubesphere.io/alias-name: harbor-cdy
    kubesphere.io/creator: admin
spec:
  ingressClassName: kubesphere-router-namespace-note
  tls:
    - hosts:
        - core.harbor.domain
      secretName: harbor-tls
  rules:
    - host: core.harbor.domain
      http:
        paths:
          - path: /
            pathType: ImplementationSpecific
            backend:
              service:
                name: harbor-cdy-perqnby3xz8-portal
                port:
                  number: 80
          - path: /api/
            pathType: ImplementationSpecific
            backend:
              service:
                name: harbor-cdy-perqnby3xz8-core
                port:
                  number: 80
          - path: /service/
            pathType: ImplementationSpecific
            backend:
              service:
                name: harbor-cdy-perqnby3xz8-core
                port:
                  number: 80
          - path: /v2
            pathType: ImplementationSpecific
            backend:
              service:
                name: harbor-cdy-perqnby3xz8-core
                port:
                  number: 80
          - path: /chartrepo
            pathType: ImplementationSpecific
            backend:
              service:
                name: harbor-cdy-perqnby3xz8-core
                port:
                  number: 80
          - path: /c/
            pathType: ImplementationSpecific
            backend:
              service:
                name: harbor-cdy-perqnby3xz8-core
                port:
                  number: 80
```

**第二个 Ingress (Harbor Notary)：**

```yaml
kind: Ingress
apiVersion: networking.k8s.io/v1
metadata:
  name: harbor-notary-ingress
  namespace: note
  annotations:
    kubesphere.io/alias-name: harbor-ingress-notary
    kubesphere.io/creator: cdy
spec:
  ingressClassName: kubesphere-router-namespace-note
  tls:
    - hosts:
        - notary.harbor.domain
      secretName: harbor-tls
  rules:
    - host: notary.harbor.domain
      http:
        paths:
          - path: /
            pathType: ImplementationSpecific
            backend:
              service:
                name: harbor-cdy-perqnby3xz8-notary-server
                port:
                  number: 4443
```

### 2.2 创建 TLS 证书 Secret

```bash
# 创建包含证书的 Secret
kubectl create secret tls harbor-tls \
  --namespace=note \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

## 3. 登录 Harbor 创建项目

1. 访问 `https://core.harbor.domain`
2. 使用默认凭据登录：
   - 用户名：admin
   - 密码：Harbor12345（安装时配置的密码）
3. 创建新项目：
   - 点击"新建项目"
   - 输入项目名称（如：nginx）
   - 设置访问级别（公开/私有）
   - 点击"确定"

![An image](/images/RD/harbor-6.png)

![An image](/images/RD/harbor-7.png)

![An image](/images/RD/harbor-8.png)

## 4. 测试推送镜像到 Harbor

### 4.1 Docker 注册 Harbor 地址

```bash
# 登录 Harbor
docker login core.harbor.domain
# 输入用户名和密码
```

![An image](/images/RD/harbor-9.png)

### 4.2 推送镜像到 Harbor

```bash
# 拉取测试镜像
docker pull nginx:latest

# 重新打标签
docker tag nginx:latest core.harbor.domain/nginx/a:1.0.0

# 推送镜像
docker push core.harbor.domain/nginx/a:1.0.0
```

![An image](/images/RD/harbor-10.png)

## 5. 从 Harbor 拉取镜像部署应用

### 5.1 下载 Harbor CA 证书并创建 ConfigMap

![An image](/images/RD/harbor-11.png)

**创建 ConfigMap：**

```yaml
kind: ConfigMap
apiVersion: v1
metadata:
  name: harbor-ca-cert
  namespace: note
  annotations:
    kubesphere.io/creator: admin
data:
  harbor-ca.crt: |
    -----BEGIN CERTIFICATE-----
    MIIDFDCCAfygAwIBAgIRAKLnQlk0AWuS6VaLxVbWkVcwDQYJKoZIhvcNAQELBQAw
    FDESMBAGA1UEAxMJaGFyYm9yLWNhMB4XDTI1MDcwMjEwMzQzN1oXDTI2MDcwMjEw
    MzQzN1owFDESMBAGA1UEAxMJaGFyYm9yLWNhMIIBIjANBgkqhkiG9w0BAQEFAAOC
    AQ8AMIIBCgKCAQEA3FPBAGUzcy2TS9+ePn5Ikdf9yrBDffdjYh9qXt4DsXRaTfg7
    v2F9xwkFCjf96p3lBUXLTo7yoOX4WVOKDBlsz7+REOfZTkeK1O0+oVT30zWGfSp0
    QYJOva950jKXvw4xwm8Zz9YB2Ial3oBbby3seRr/QLhK4yZP+a5eZnycRr2mcTYD
    k+sHlrMl7QDwtHxCJ8OIL1xZwjTB58QKrttgseDOcf5Qdm2XRrBq0HY176iGGbYR
    Ik1Fpux3K+7pRFWaVTbiTYlJd8hO+hAYHsQ79IO5LC0mcEeuwTTnpLHLECz4HKgq
    5a3bhw+PlSzmHN+uXqpuXfmGCHtMlxTitaYzcwIDAQABo2EwXzAOBgNVHQ8BAf8E
    BAMCAqQwHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMA8GA1UdEwEB/wQF
    MAMBAf8wHQYDVR0OBBYEFPlUEG3ynG0C0rXrZt19ssjUb1USMA0GCSqGSIb3DQEB
    CwUAA4IBAQDAGz78+6zfaBZsxRNH3pI36VEEW5az5MRML8Odo3FGBtjjcxFADJGm
    OP/CREVoEZVXmB9bpUJNeJkqc5wUULxypqXrsmitzIy2nXnzmoM+oFljIdGkQr+q
    gJyfN1TrgetHLvhJ84OvTvPOTGMVBSLp1IL8KtxxWw3JHf0SpAuu9t5RslF2TRLz
    R+VoXB2f252pQK+qn8eRbgsYFjVWUu38yuOp8W/n8HDROLWd1WWvkNGv+YOsbSvA
    7v44T76TkG5ZGr57bTTPH6ukP7JQrkEs2YR+HMWd+URnj2Km/nzE/qDnCz6xeri9
    n7VNHg8I6smlWzn7f8sJT2neWIdBInn6
    -----END CERTIFICATE-----
```

### 5.2 发布应用（Deployment）

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-cdy
  namespace: note
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx-cdy
  template:
    metadata:
      labels:
        app: nginx-cdy
    spec:
      containers:
        - name: nginx
          image: core.harbor.domain/nginx/a:1.0.0
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 80
          volumeMounts:
            - name: harbor-ca-cert
              mountPath: /etc/ssl/certs/harbor-ca.crt
              subPath: harbor-ca.crt
              readOnly: true
      imagePullSecrets:
        - name: harbor-registry-secret # 如果 Harbor 需要认证
      volumes:
        - name: harbor-ca-cert
          configMap:
            name: harbor-ca-cert
            items:
              - key: harbor-ca.crt
                path: harbor-ca.crt
```

### 5.3 创建认证 Secret（如果需要）

```bash
# 创建 Docker registry 认证 Secret
kubectl create secret docker-registry harbor-registry-secret \
  --namespace=note \
  --docker-server=core.harbor.domain \
  --docker-username=admin \
  --docker-password=Harbor12345
```

### 5.4 创建 Service 暴露应用

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-cdy-service
  namespace: note
spec:
  selector:
    app: nginx-cdy
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080 # NodePort 范围 30000-32767
  type: NodePort
```

![An image](/images/RD/harbor-12.png)

### 5.5 访问应用

1. 查看分配的 NodePort：

   ```bash
   kubectl get svc nginx-cdy-service -n note
   ```

![An image](/images/RD/harbor-13.png)

2. 通过以下方式访问：
   - 集群任意节点 IP + NodePort 端口
   - 例如：`http://<node-ip>:30080`

![An image](/images/RD/harbor-14.png)

## 注意事项

1. **域名解析**：确保 `core.harbor.domain` 和 `notary.harbor.domain` 能正确解析到集群入口
2. **证书信任**：如果是自签名证书，需要在客户端机器上添加信任
3. **存储配置**：根据实际需求调整 Harbor 的存储配置
4. **网络策略**：确保网络策略允许流量访问 Harbor 服务
5. **资源限制**：根据集群规模调整 Harbor 各组件的资源请求和限制

## 故障排查

1. **镜像推送失败**：

   - 检查 Docker 登录状态
   - 验证证书是否正确
   - 确认网络连通性

2. **Pod 无法拉取镜像**：

   - 检查 imagePullSecrets 配置
   - 验证 ConfigMap 中的 CA 证书
   - 确认网络策略允许访问 Harbor

3. **Ingress 访问问题**：
   - 检查 Ingress Controller 状态
   - 验证域名解析
   - 检查 TLS 证书配置
