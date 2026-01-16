# 应用商店打包（uni-app）

## 一、安卓打包

### 安卓打包流程

1. **HBuilderX** ⇒ 发行 ⇒ 原生 App-云打包；
2. **Android（apk 包）** ⇒ 使用云端证书 ⇒ 打包；
3. 等待打包完成，根据目录提示，找到生成的 apk 包。

**Android 证书说明**：

- 本文使用的是“云端证书”。
- 如果需要使用“自有证书”，请参考官方指南：[https://ask.dcloud.net.cn/article/35777](https://ask.dcloud.net.cn/article/35777)

> **提示**：Android 平台打包发布 apk 应用，需要使用数字证书（.keystore 文件）进行签名，用于表明开发者身份。Android 证书的生成是自助和免费的，不需要审批或付费。可以使用 JRE 环境中的 keytool 命令生成。

### 打包步骤截图

1. **选择“云打包”**

![An image](/images/FE/uniapp-build-1.png)

2. **选择“安卓”、“使用云端证书”、“打包”**

![An image](/images/FE/uniapp-build-2.png)

3. **打包校验**

![An image](/images/FE/uniapp-build-3.png)

4. **打包中**

![An image](/images/FE/uniapp-build-4.png)

5. **打包完成：找到对应的 apk 目录**

![An image](/images/FE/uniapp-build-5.png)

## 二、iOS 打包

### iOS 打包流程

1. **HBuilderX** ⇒ 发行 ⇒ 原生 App-云打包；
2. **iOS（ipa 包）** ⇒ iOS IDP/IEP 证书（输入：证书私钥密码、证书 profile 文件、私钥证书） ⇒ 打包；
3. 等待打包完成，根据目录提示，找到生成的 ipa 包。

**iOS IDP/IEP 证书说明**：

- **一定要有证书！！！** 参考官方指南：[https://ask.dcloud.net.cn/article/152](https://ask.dcloud.net.cn/article/152)
- 相关资源：
  - Apple Developer App：[https://apps.apple.com/cn/app/apple-developer/id640199958](https://apps.apple.com/cn/app/apple-developer/id640199958)
  - Apple 开发者支持：[https://developer.apple.com/cn/support/app-account/](https://developer.apple.com/cn/support/app-account/)
  - 环信证书指南：[https://www.easemob.com/news/5554](https://www.easemob.com/news/5554)
  - Appuploader 工具：[https://www.appuploader.net/](https://www.appuploader.net/)

### 选择 iOS 打包

●https://apps.apple.com/cn/app/apple-developer/id640199958

●https://developer.apple.com/cn/support/app-account/

●https://www.easemob.com/news/5554

●https://www.appuploader.net/

## 三、注意事项

iOS 证书收费 **688 元/年**。

## 四、其他打包方式

- **Taro**
- **Cordova**

---

**打包操作前请注意**：确保项目代码已提交备份，并仔细核对打包配置，特别是证书信息，以免打包失败或发布异常。
