# KubeSphere 中搭建 DevOps 创建流水线

## 前提条件

- 已有一个可用的企业空间（非 `system-workspace`）。
- 您需要加入一个企业空间并在企业空间中具有 DevOps 项目创建权限。
- KubeSphere 平台需要安装并启用 DevOps 扩展组件。
- 构建用镜像地址：`registry.cn-shenzhen.aliyuncs.com/youli371966511/go-build:2.0.0`（包含 `git`、`go`、`nerdctl`）。

## 1. 启用 DevOps 组件

![An image](/images/RD/devops-1.png)

确保 KubeSphere 已安装并启用 DevOps 扩展组件。

> **PS**：DevOps 需要存储卷，可以提前创建存储卷，再把 PVC 绑定到 PV。

## 2. 创建账号、企业空间、角色、账号

### 2.1 创建角色

![An image](/images/RD/devops-2.png)

![An image](/images/RD/devops-3.png)

进入 **平台管理** > **集群角色**，创建新的角色。

### 2.2 编辑角色权限

![An image](/images/RD/devops-4.png)

为角色分配以下权限（示例）：

- `devops.view`
- `devops.create`
- `devops.edit`
- `devops.delete`
- `projects.view`
- `projects.create`
- `projects.edit`

### 2.3 授权对应权限

将创建的角色授权给目标用户或用户组。

![An image](/images/RD/devops-5.png)

### 2.4 添加用户

进入 **平台管理** > **用户**，添加新用户。

![An image](/images/RD/devops-6.png)

### 2.5 创建企业空间

进入 **企业空间**，点击 **创建**，填写企业空间信息。

![An image](/images/RD/devops-7.png)

![An image](/images/RD/devops-8.png)

![An image](/images/RD/devops-9.png)

### 2.6 邀请成员

在企业空间中，点击 **成员管理**，邀请成员并分配角色。

![An image](/images/RD/devops-10.png)

## 3. 修改 `jenkins_casc_config`

### 3.1 找到配置字典

进入 **平台管理** > **配置字典**，搜索 `jenkins_casc_config`，点击修改 YAML。

![An image](/images/RD/devops-11.png)

### 3.2 添加配置

在 `jenkins.cloud.kubernetes.podTemplates` 下添加以下配置：

```yaml
- name: 'gobuild2'
  namespace: 'kubesphere-devops-worker'
  label: 'gobuild2'
  nodeUsageMode: 'EXCLUSIVE'
  idleMinutes: 0
  containers:
    - name: 'go'
      image: 'registry.cn-shenzhen.aliyuncs.com/youli371966511/go-build:2.0.0'
      command: 'cat'
      args: ''
      ttyEnabled: true
      privileged: true
      resourceRequestCpu: '100m'
      resourceLimitCpu: '4000m'
      resourceRequestMemory: '100Mi'
      resourceLimitMemory: '8192Mi'
    - name: 'jnlp'
      image: 'swr.cn-southwest-2.myhuaweicloud.com/ks/jenkins/inbound-agent:4.10-2'
      args: '^${computer.jnlpmac} ^${computer.name}'
      resourceRequestCpu: '50m'
      resourceLimitCpu: '500m'
      resourceRequestMemory: '400Mi'
      resourceLimitMemory: '1536Mi'
  workspaceVolume:
    emptyDirWorkspaceVolume:
      memory: false
  volumes:
    - hostPathVolume:
        hostPath: '/var/run/containerd/containerd.sock'
        mountPath: '/var/run/containerd/containerd.sock'
    - hostPathVolume:
        hostPath: '/var/data/jenkins_go_cache'
        mountPath: '/home/jenkins/go/pkg'
    - hostPathVolume:
        hostPath: '/var/data/jenkins_sonar_cache'
        mountPath: '/root/.sonar/cache'
  yaml: |
    spec:
      activeDeadlineSeconds: 21600
      affinity:
        nodeAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 1
            preference:
              matchExpressions:
              - key: node-role.kubernetes.io/worker
                operator: In
                values:
                - ci
      tolerations:
      - key: "node.kubernetes.io/ci"
        operator: "Exists"
        effect: "NoSchedule"
      - key: "node.kubernetes.io/ci"
        operator: "Exists"
        effect: "PreferNoSchedule"
      containers:
      - name: "go"
        resources:
          requests:
            ephemeral-storage: "1Gi"
          limits:
            ephemeral-storage: "10Gi"
      securityContext:
        fsGroup: 1000
```

## 4. 创建流水线

### 4.1 创建 DevOps 项目

进入目标企业空间，点击 **DevOps 项目** > **创建**，填写项目信息。

![An image](/images/RD/devops-12.png)

### 4.2 创建凭证

进入创建的 DevOps 项目（如 `note-golang`）：

1. 点击 **凭证** > **创建**。
2. 选择类型（如 **用户名和密码**、**SSH 密钥**）。
3. 填写凭证信息（如 Gitee 账号密码）。
4. 保存后得到凭证 ID（如 `gitee-id`、`aliyun-images-id`）。

![An image](/images/RD/devops-13.png)

### 4.3 创建流水线

1. 在 DevOps 项目中，点击 **流水线** > **创建**。
2. 填写流水线名称，选择 **代码仓库** 或 **Jenkinsfile** 方式。

![An image](/images/RD/devops-14.png)

### 4.4 编辑流水线（Jenkinsfile）

在流水线编辑器中，填入以下 Jenkinsfile 内容：

```groovy
pipeline {
  agent {
    node {
      label 'gobuild2'
    }
  }
  stages {
    stage('pull') {
      agent none
      steps {
        container('go') {
          git(url: 'https://gitee.com/youliroam/pm-be.git', credentialsId: 'gitee-id', branch: 'master', changelog: true, poll: false)
          sh 'ls -lh'
        }
      }
    }

    stage('build') {
      agent none
      steps {
        container('go') {
          sh 'export GOPROXY=https://goproxy.cn'
          sh 'go mod tidy'
          sh 'pwd'
          sh 'ls -lh'
          sh 'go build -o main main.go'
        }
      }
    }

    stage('pack') {
      agent none
      steps {
        container('go') {
          sh 'buildctl --version'
          sh 'buildkitd &'
          sh 'nerdctl build -t registry.cn-shenzhen.aliyuncs.com/youli371966511/pm-go:v1.0.1 .'
          sh 'ls -lh'
        }
      }
    }

    stage('push') {
      agent none
      steps {
        container('go') {
          withCredentials([usernamePassword(credentialsId: 'aliyun-images-id', passwordVariable: 'PASSWD', usernameVariable: 'USER')]) {
            sh 'echo "$PASSWD" | nerdctl login --username "$USER" --password-stdin $REGISTRY'
            sh 'nerdctl push registry.cn-shenzhen.aliyuncs.com/youli371966511/pm-go:v1.0.1'
          }
        }
      }
    }
  }
  environment {
    REPO_URL = 'https://gitee.com/youliroam/zbn_note.git'
    BRANCH = 'master'
    GOPROXY = 'https://goproxy.cn,direct'
    REGISTRY = 'registry.cn-shenzhen.aliyuncs.com'
    NAMEPACE = 'youli371966511'
    APP_NAME = 'note_go'
  }
}
```

保存后流水线配置如图：

![An image](/images/RD/devops-15.png)

### 4.5 运行流水线

1. 点击流水线列表中的 **运行**。
2. 选择分支（如 `master`）。
3. 点击 **确定**，开始执行流水线。
4. 在 **活动** 中查看实时日志和构建状态。

## 5. 查看运行结果

- 进入流水线详情，点击 **活动** 查看执行历史。
- 点击具体运行记录，查看 **阶段视图** 和 **日志**。
- 构建成功后，镜像将被推送到指定的镜像仓库。

**备注**：

- 确保节点标签和容忍配置与集群节点匹配。
- 凭证 ID 需与 Jenkinsfile 中引用的凭证 ID 一致。
- 镜像仓库需提前创建并确保凭证有效。
