# KubeSphere 安装 OpenELB 指南

## 1. 安装 OpenELB

在 KubeSphere 应用商店中安装 OpenELB 插件：

1. 进入 **平台管理** → **应用商店**
2. 搜索 "openelb"
3. 点击 **安装**，选择目标命名空间（如 `kubesphere-system`）
4. 等待安装完成

![An image](/images/RD/openelb-1.png)

![An image](/images/RD/openelb-2.png)

![An image](/images/RD/openelb-3.png)

## 2. 修改 kube-proxy 配置

### 2.1 通过命令行修改

```bash
# 编辑 kube-proxy ConfigMap
kubectl edit configmap kube-proxy -n kube-system
```

在 `config.conf` 中添加或修改以下配置：

```yaml
ipvs:
  strictARP: true
```

### 2.2 通过界面修改（可选）

在 KubeSphere 控制台中：

1. 进入 **平台管理** → **集群管理**
2. 点击 **配置** → **配置字典**
3. 搜索并选择 `kube-proxy`
4. 编辑 `config.conf`，添加上述配置

![An image](/images/RD/openelb-4.png)

![An image](/images/RD/openelb-5.png)

### 2.3 重启 kube-proxy

```bash
# 重启 kube-proxy 组件
kubectl rollout restart daemonset kube-proxy -n kube-system

# 验证重启状态
kubectl get pods -n kube-system -l k8s-app=kube-proxy
```

## 3. 配置网络接口

### 3.1 检查网卡

```bash
# 查看节点网卡信息
ip addr show
```

### 3.2 配置节点注解

根据节点网卡情况配置：

**情况一：单个网卡**（无需指定）

```bash
# 无需额外配置，OpenELB 自动选择默认网卡
```

**情况二：多个网卡**（需要指定）

```bash
# 为节点添加注解指定 IP（以 master 节点为例）
kubectl annotate nodes <node-name> layer2.openelb.kubesphere.io/v1alpha1="192.168.1.11"

# 示例：为名为 sv2 的节点配置
kubectl annotate nodes sv2 layer2.openelb.kubesphere.io/v1alpha1="192.168.1.11"

# 验证注解
kubectl describe node <node-name> | grep openelb
```

## 4. 创建 IP 地址池

### 4.1 创建 EIP 配置文件

创建 `eip-pool.yaml`：

```yaml
apiVersion: network.kubesphere.io/v1alpha2
kind: Eip
metadata:
  name: eip-pool
  annotations:
    eip.openelb.kubesphere.io/is-default-eip: 'true'
spec:
  address: 192.168.1.70-192.168.1.100 # IP 地址范围
  protocol: layer2 # OpenELB 模式（layer2、BGP、VIP）
  interface: eno8303 # 网卡名称（仅 layer2 模式需要）
  disable: false # 是否禁用
```

### 4.2 应用配置

```bash
# 创建 EIP 池
kubectl apply -f eip-pool.yaml

# 验证 EIP 池状态
kubectl get eip

# 输出示例：
# NAME       CIDR                         USAGE   TOTAL
# eip-pool   192.168.1.70-192.168.1.100   1       31
```

## 5. 启用项目网关

### 5.1 在企业空间中启用网关

1. 进入目标 **企业空间**
2. 点击 **网关设置**
3. 点击 **启用网关**
4. 配置网关：
   - **访问模式**：选择 `NodePort` 或 `LoadBalancer`
   - **网关类型**：选择 `OpenELB`
   - **负载均衡器**：选择 `openelb`
   - **EIP 池**：选择 `eip-pool`

![An image](/images/RD/openelb-6.png)

### 5.2 网关配置示例

```yaml
# 网关创建后自动生成的配置
apiVersion: v1
kind: Service
metadata:
  name: ks-router-<project-name>
  namespace: <project-namespace>
  annotations:
    lb.kubesphere.io/v1alpha1: openelb
    protocol.openelb.kubesphere.io/v1alpha1: layer2
    eip.openelb.kubesphere.io/v1alpha2: eip-pool
spec:
  type: LoadBalancer
  selector:
    app: ks-router
  ports:
    - name: http
      port: 80
      targetPort: 80
    - name: https
      port: 443
      targetPort: 443
```

## 6. 创建应用路由（Ingress）

### 6.1 创建 Ingress 资源

在 KubeSphere 控制台中：

1. 进入目标项目
2. 点击 **应用负载** → **应用路由**
3. 点击 **创建**
4. 配置路由规则：
   - **名称**：自定义路由名称
   - **路由规则**：
     - **域名**：例如 `app.example.com`
     - **路径**：例如 `/`
     - **服务**：选择目标服务
     - **端口**：选择服务端口

![An image](/images/RD/openelb-7.png)

![An image](/images/RD/openelb-8.png)

![An image](/images/RD/openelb-9.png)

![An image](/images/RD/openelb-10.png)

### 6.2 Ingress 配置示例

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  namespace: <namespace>
  annotations:
    kubernetes.io/ingress.class: nginx
spec:
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: app-service
                port:
                  number: 80
```

## 7. 配置域名解析

### 7.1 DNS 配置

根据分配的 EIP 地址配置 DNS 解析：

- **记录类型**：A 记录
- **主机名**：例如 `app.example.com`
- **IP 地址**：OpenELB 分配的 IP（如 `192.168.1.70`）

### 7.2 验证解析

```bash
# 验证 DNS 解析
nslookup app.example.com

# 或使用 dig
dig app.example.com
```

![An image](/images/RD/openelb-11.png)

## 8. 验证运行结果

![An image](/images/RD/openelb-12.png)

### 8.1 检查服务状态

```bash
# 查看 LoadBalancer 服务
kubectl get svc -n <namespace> -l app=ks-router

# 查看分配的 IP
kubectl get svc <service-name> -n <namespace> -o jsonpath='{.status.loadBalancer.ingress[0].ip}'
```

### 8.2 访问测试

使用配置的域名访问应用：

```bash
# 测试 HTTP 访问
curl -I http://app.example.com

# 测试 HTTPS 访问（如配置）
curl -I https://app.example.com
```

### 8.3 查看 OpenELB 状态

```bash
# 查看 OpenELB 控制器
kubectl get pods -n openelb-system

# 查看 OpenELB 日志
kubectl logs -f deployment/openelb-manager -n openelb-system

# 查看 EIP 使用情况
kubectl get eip
```

## 9. 故障排除

### 常见问题及解决方案

| 问题 | 检查项 | 解决方案 |
| --- | --- | --- |
| EIP 池无法分配 IP | 1. EIP 范围是否正确<br>2. IP 是否已被占用 | 检查网络配置，确保 IP 范围可用 |
| 网关无法访问 | 1. 网关是否启用<br>2. NodePort 是否分配<br>3. 防火墙规则 | 检查网关状态，验证端口访问 |
| DNS 解析失败 | 1. DNS 配置是否正确<br>2. 网络连通性 | 验证 DNS 解析，检查网络 |
| 服务无法访问 | 1. Ingress 配置<br>2. 后端服务状态<br>3. 端口映射 | 检查 Ingress 和后端服务 |

### 检查命令

```bash
# 查看所有相关资源状态
kubectl get all -n openelb-system
kubectl get eip
kubectl get svc -A | grep LoadBalancer

# 查看事件日志
kubectl get events -n <namespace> --sort-by='.lastTimestamp'

# 网络连通性测试
ping <eip-address>
telnet <eip-address> <port>
```

## 10. 维护说明

### 更新 EIP 池

```bash
# 编辑 EIP 配置
kubectl edit eip eip-pool

# 或重新应用配置文件
kubectl apply -f eip-pool.yaml
```

### 清理资源

```bash
# 删除 EIP 池
kubectl delete eip eip-pool

# 卸载 OpenELB（谨慎操作）
helm uninstall openelb -n openelb-system
```

---

**注意事项**：

1. 确保 IP 地址范围不与现有网络冲突
2. 生产环境建议使用 BGP 模式提高可用性
3. 定期监控 EIP 使用情况，避免地址耗尽
4. 配置适当的防火墙规则
5. 记录所有网络配置变更
