# Kubernetes 集群搭建指南

**环境信息**：Ubuntu 24.04.2 + kubectl 1.33.1 + containerd v1.7.27 + calico v3.30.0

## 1. 系统基础配置

### 1.1 修改主机名

- **Master 节点**：

```bash
sudo hostnamectl set-hostname k8smaster # 永久生效
```

- **Node1 节点**：

```bash
sudo hostnamectl set-hostname k8snode1  # 永久生效
```

### 1.2 关闭防火墙

```bash
sudo systemctl disable --now ufw
```

### 1.3 配置静态 IP

编辑网络配置文件：

```bash
sudo vim /etc/netplan/50-cloud-init.yaml
```

配置内容：

```yaml
network:
  version: 2
  ethernets:
    ens33:
      dhcp4: no
      addresses: [192.168.1.181/24] # 根据实际情况修改
      gateway4: 192.168.1.1
      nameservers:
        addresses: [192.168.1.1, 8.8.8.8, 114.114.114.114]
```

应用配置：

```bash
sudo netplan apply
```

### 1.4 启用 SSH 服务

```bash
sudo apt update
sudo apt install openssh-server
# 编辑 /etc/ssh/ssh_config 配置端口和密码认证
```

### 1.5 禁用交换分区

```bash
sudo swapoff -a
sudo sed -i '/swap/s/^/#/' /etc/fstab  # 永久禁用
```

### 1.6 配置内核参数

```bash
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sudo sysctl --system
```

## 2. 安装容器运行时 (containerd)

### 方法一：通过 Docker 仓库安装（推荐）

```bash
# 添加Docker官方GPG密钥
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 添加Docker仓库
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装containerd
sudo apt-get update
sudo apt-get install containerd.io

# 手动安装CNI插件
wget https://github.com/containernetworking/plugins/releases/download/v1.3.0/cni-plugins-linux-amd64-v1.3.0.tgz
sudo mkdir -p /opt/cni/bin
sudo tar Cxzvf /opt/cni/bin cni-plugins-linux-amd64-v1.3.0.tgz
```

### 方法二：直接下载安装

```bash
# 下载containerd
curl -LO https://github.com/containerd/containerd/releases/download/v1.7.27/cri-containerd-cni-1.7.27-linux-amd64.tar.gz

# 解压安装
sudo tar -zxvf cri-containerd-cni-1.7.27-linux-amd64.tar.gz -C /
```

### 配置 containerd

```bash
# 生成配置文件
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml

# 修改配置为systemd cgroup驱动
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml

# 修改pause镜像源（可选）
sudo sed -i 's|sandbox_image = ".*"|sandbox_image = "registry.aliyuncs.com/google_containers/pause:3.10"|' /etc/containerd/config.toml

# 重启服务
sudo systemctl restart containerd
sudo systemctl enable containerd
```

## 3. 安装 Kubernetes 组件

### 3.1 添加 Kubernetes 仓库

```bash
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gpg

# 添加GPG密钥
sudo mkdir -p -m 755 /etc/apt/keyrings
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.33/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

# 添加仓库
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.33/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
```

### 3.2 安装 kubelet、kubeadm、kubectl

```bash
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl  # 锁定版本
```

### 3.3 初始化 Master 节点

```bash
sudo kubeadm init \
  --apiserver-advertise-address=192.168.1.181 \
  --pod-network-cidr=192.168.0.0/16 \
  --image-repository=registry.aliyuncs.com/google_containers \
  --cri-socket=unix:///run/containerd/containerd.sock \
  --kubernetes-version=v1.33.1
```

### 3.4 配置 kubectl（普通用户）

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

## 4. 安装网络插件 (Calico)

### 方法一：使用 Operator 安装（推荐）

```bash
# 安装Operator
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.30.0/manifests/tigera-operator.yaml

# 安装Calico
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.30.0/manifests/custom-resources.yaml

# 查看安装状态
watch kubectl get tigerastatus
```

### 方法二：直接安装

```bash
# 下载配置文件
wget https://projectcalico.docs.tigera.io/archive/v3.25/manifests/calico.yaml

# 修改镜像源和IP范围
sed -i 's|docker.io/calico/|swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/calico/|g' calico.yaml
sed -i 's|value: ".*"|value: "192.168.0.0/16"|' calico.yaml

# 应用配置
kubectl apply -f calico.yaml
```

## 5. Node 节点加入集群

在 Node 节点上执行：

```bash
sudo kubeadm join 192.168.1.181:6443 \
  --token 03x52t.80r5lnek3r3lnijv1 \
  --discovery-token-ca-cert-hash sha256:b17b309ed4b8f687a63061717bea099f31a045116cd311ea7c7963389556e41d1 \
  --cri-socket=unix:///run/containerd/containerd.sock
```

## 6. 安装 KubeSphere（可选）

### 6.1 安装 Helm

```bash
# 添加Helm仓库并安装
helm upgrade --install \
  -n kubesphere-system \
  --create-namespace ks-core https://charts.kubesphere.com.cn/main/ks-core-1.1.3.tgz \
  --debug --wait \
  --set global.imageRegistry=swr.cn-southwest-2.myhuaweicloud.com/ks \
  --set extension.imageRegistry=swr.cn-southwest-2.myhuaweicloud.com/ks \
  --set hostClusterName=k8s-paco
```

### 6.2 检查安装状态

```bash
kubectl get pods -n kubesphere-system
```

### 6.3 访问 KubeSphere 控制台

- **地址**：http://192.168.1.181:30880
- **默认凭证**：
  - 用户名：`admin`
  - 密码：`P@88w0rd`

> **注意**：首次登录后请立即修改默认密码。

## 7. 验证安装

### 7.1 查看节点状态

```bash
kubectl get nodes
```

### 7.2 查看所有 Pod 状态

```bash
kubectl get pods --all-namespaces
```

### 7.3 查看集群信息

```bash
kubectl cluster-info
```

## 常见问题处理

1. **重置集群**：

```bash
sudo kubeadm reset
```

2. **重新生成加入令牌**：

```bash
sudo kubeadm token create --print-join-command
```

3. **查看容器运行时状态**：

```bash
sudo systemctl status containerd
```

4. **查看 kubelet 日志**：

```bash
sudo journalctl -u kubelet -f
```

**注意事项**：

- 所有节点需要时间同步
- 确保主机名解析正常
- 各节点防火墙需关闭或配置正确规则
- 网络插件安装后需等待几分钟才能正常通信
