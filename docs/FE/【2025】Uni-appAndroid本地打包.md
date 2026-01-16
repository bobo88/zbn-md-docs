# Uni-app Android 本地打包步骤

## 一、安装 Android Studio 打包 SDK

### 1. 下载安装 Android Studio

- **下载地址**：https://developer.android.google.cn/studio/archive?hl=zh-cn （官方地址）
- **安装选项**：
  - 选择 Android SDK
  - 选择 Google USB Driver（主要用于后期 USB 调试，不需要可忽略）

### 2. 下载 uni-app 提供的 Android 离线 SDK

- **下载地址**：https://nativesupport.dcloud.net.cn/AppDocs/download/android.html （uni 小程序 SDK）

![An image](/images/FE/uniapp-android-1.png)

⚠️ **重要注意事项**：

- Android 离线 SDK 的版本必须与 HBuilder X 的版本匹配，版本不匹配会导致报错
- 解压下载的离线 SDK，解压后可见 `HBuilder-Integrate-AS` 文件夹，后续操作围绕该文件夹展开

**离线 SDK 目录结构示例**：

```
Android-SDK@版本号/
├── HBuilder-Integrate-AS/
│   ├── simpleDemo/          ← 核心文件夹
│   ├── libs/
│   └── ...
└── ...
```

![An image](/images/FE/uniapp-android-2.png)

### 3. 配置 AppKey 及申请 Android 平台签名证书

#### 3.1 AppKey 申请

- **要求**：3.1.0 版本开始需要申请
- **步骤参考**：https://nativesupport.dcloud.net.cn/AppDocs/usesdk/appkey

#### 3.2 签名证书生成

- **参考文档**：https://ask.dcloud.net.cn/article/35777
- **生成方法**：
  1. 使用 JDK 的 keytool 工具生成
  2. 或使用 Android Studio 生成
  3. 或使用在线工具生成

### 4. 将 HBuilder-Integrate-AS 导入 Android Studio

1. 打开 Android Studio
2. 选择 "Open an existing project"
3. 选择解压后的 `HBuilder-Integrate-AS` 文件夹
4. 等待项目同步完成

![An image](/images/FE/uniapp-android-3.png)

## 二、修改 HBuilder-Integrate-AS 配置信息

### （1）清理默认资源

![An image](/images/FE/uniapp-android-4.png)

**删除以下目录中的默认项目**：

```
路径：HBuilder-Integrate-AS → simpleDemo → src → main → assets → apps
```

删除 `apps` 文件夹内的所有内容。

### （2）生成并替换本地资源包

#### 步骤 1：在 HBuilder X 中生成本地资源包

1. 打开 HBuilder X 项目
2. 菜单栏选择：**发行 → 原生 App-本地打包 → 生成本地 App 打包资源**
3. 等待生成完成

#### 步骤 2：复制生成的资源包内容

生成的资源包通常位于项目的 `unpackage/dist/build/app` 目录下。

![An image](/images/FE/uniapp-android-5.png)

![An image](/images/FE/uniapp-android-6.png)

#### 步骤 3：粘贴到指定目录

将生成的资源包内容复制到：

```
路径：HBuilder-Integrate-AS → simpleDemo → src → main → assets → apps
```

**目录结构应类似**：

```
apps/
└── __UNI__XXXXXXX/          ← 你的应用标识
    ├── www/
    │   ├── css/
    │   ├── js/
    │   ├── index.html
    │   └── manifest.json    ← 重要配置文件
    └── ...
```

#### 步骤 4：刷新目录结构

在 Android Studio 中右键点击 `apps` 文件夹，选择 "Synchronize" 或刷新项目，确认内容已更新为自己的资源。

### （3）修改 dcloud_control.xml 文件

![An image](/images/FE/uniapp-android-7.png)

![An image](/images/FE/uniapp-android-8.png)

**文件路径**：

```
HBuilder-Integrate-AS → simpleDemo → src → main → assets → data → dcloud_control.xml
```

**修改内容**：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<apps>
    <app
        appid="__UNI__EE9C18E"  <!-- 修改为你的应用ID -->
        appver=""/>
</apps>
```

**确认应用 ID 一致**：

- 确保 `dcloud_control.xml` 中的 `appid` 与以下文件中的 id 一致：
  ```
  apps → __UNI__EE9C18E → www → manifest.json
  ```
- 在 `manifest.json` 中找到 `id` 字段进行比对

### （4）修改 AndroidManifest.xml

**文件路径**：

```
simpleDemo → src → main → AndroidManifest.xml
```

**修改内容示例**：

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.example.myapp"  <!-- 修改为你的包名 -->
    android:versionCode="100"
    android:versionName="1.0.0">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme">

        <meta-data
            android:name="dcloud_appkey"
            android:value="你的AppKey" />  <!-- 仅修改value值 -->

        <!-- 其他配置保持不变 -->
    </application>
</manifest>
```

**注意事项**：

- **包名**：需与开发者中心获取的包名一致
- **AppKey**：从开发者中心查看获取，仅修改 `value` 值，`name` 值保持不变

### （5）修改 build.gradle 配置

**文件路径**：

```
simpleDemo → build.gradle
```

**修改内容示例**：

```gradle
android {
    compileSdkVersion 30
    defaultConfig {
        applicationId "com.example.myapp"  // 设置为开发者中心的包名
        minSdkVersion 21
        targetSdkVersion 30
        versionCode 100
        versionName "1.0.0"
    }

    signingConfigs {
        config {
            keyAlias '你的密钥别名'
            keyPassword '你的密钥密码'
            storeFile file('你的证书文件名.keystore')  // 将证书文件放入项目文件夹
            storePassword '你的证书密码'
            v1SigningEnabled true
            v2SigningEnabled true
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.config
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
        debug {
            signingConfig signingConfigs.config
        }
    }
}
```

**证书文件放置**：

1. 将生成的签名证书文件（如 `myapp.keystore`）复制到 `simpleDemo` 文件夹
2. 在 `build.gradle` 中配置正确的文件名和路径

![An image](/images/FE/uniapp-android-9.png)

### （6）注意事项

- uniapp 生成的本地文件一般不需要修改
- 确保所有路径和文件名大小写正确
- 包名一旦确定，后续更新不能更改

## 三、打包本地 APK

### 打包步骤

1. 点击菜单：**Build → Build Bundle(s) / APK(s) → Build APK**
2. 等待打包完成，右下角会提示打包成功
3. 点击 "Locate" 打开 APK 所在文件夹

![An image](/images/FE/uniapp-android-10.png)

![An image](/images/FE/uniapp-android-11.png)

### 查找 APK 文件

APK 文件通常位于：

```
simpleDemo → build → outputs → apk → debug → simpleDemo-debug.apk
```

或

```
simpleDemo → build → outputs → apk → release → simpleDemo-release.apk
```

## 四、切换打包模式（debug/release）

### 切换步骤

1. 点击 **Build → Select Build Variant**
2. 在打开的窗口中选择需要的模式：
   - **debug**：调试模式，便于调试
   - **release**：发布模式，用于正式发布

**图示**：

```
Build Variants
┌──────────────────────┐
│ Active Build Variant │
├──────────────────────┤
│ debug                │ ← 选择此项
│ release              │
└──────────────────────┘
```

### 重新打包

选择模式后，重新执行打包步骤：

1. Build → Build Bundle(s) / APK(s) → Build APK
2. 等待打包完成

## 五、常见问题解决

### 1. 版本不匹配问题

**症状**：打包时报错，提示版本不兼容 **解决**：确保 HBuilder X 版本与离线 SDK 版本一致

### 2. AppKey 配置错误

**症状**：应用无法正常运行或某些功能失效 **解决**：

1. 确认在开发者中心正确申请了 AppKey
2. 确认 AndroidManifest.xml 中配置正确
3. 确保包名与开发者中心一致

### 3. 签名证书问题

**症状**：无法安装或安装后闪退 **解决**：

1. 确认证书文件路径正确
2. 确认密钥别名、密码配置正确
3. 如果是更新应用，必须使用相同的签名证书

### 4. 资源文件问题

**症状**：白屏或资源加载失败 **解决**：

1. 确认资源包正确放置在 apps 目录下
2. 确认 dcloud_control.xml 中的 appid 正确
3. 刷新 Android Studio 项目

## 六、优化建议

### 1. 使用 Gradle 配置变量

```gradle
// 在 gradle.properties 中定义变量
APP_PACKAGE_NAME=com.example.myapp
APP_VERSION_CODE=100
APP_VERSION_NAME=1.0.0

// 在 build.gradle 中引用
defaultConfig {
    applicationId APP_PACKAGE_NAME
    versionCode APP_VERSION_CODE as int
    versionName APP_VERSION_NAME
}
```

### 2. 自动化打包脚本

可以创建打包脚本简化流程：

```bash
#!/bin/bash
# build_apk.sh

# 生成资源包
hbuilderx_cli build --platform android --type app

# 复制资源包
cp -r unpackage/dist/build/app/* HBuilder-Integrate-AS/simpleDemo/src/main/assets/apps/

# 打开Android Studio项目
# 或直接使用gradle命令打包
cd HBuilder-Integrate-AS/simpleDemo
./gradlew assembleRelease
```

### 3. 版本管理建议

1. 每次更新应用时递增 versionCode
2. 使用语义化版本号管理 versionName
3. 备份签名证书文件

## 七、后续操作

### 1. 测试安装

1. 通过 USB 连接 Android 设备
2. 启用设备的 USB 调试模式
3. 将 APK 文件复制到设备安装测试

### 2. 发布到应用商店

1. 使用 release 模式打包
2. 对 APK 进行混淆和压缩优化
3. 按照各应用商店要求准备材料
4. 提交审核

### 3. 持续集成

可以考虑设置持续集成环境，自动化打包流程，提高开发效率。

---

**重要提醒**：本地打包相比云打包更灵活，但需要自行处理证书管理、版本控制等事项，建议做好相关文档记录和备份工作。
