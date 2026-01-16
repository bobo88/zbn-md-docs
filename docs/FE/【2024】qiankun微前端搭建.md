# Qiankun 微前端搭建

## 前文介绍

### 1. 它是什么？

简单来说，qiankun 就是一个可以让多个前端应用像"拼积木"一样组合在一起运行的工具。

### 2. 它解决的什么问题？

- **项目庞大、难以维护：** 它可以拆分项目和模块，提升开发效率和上线稳定性。
  - 复杂的前端项目，代码量大、模块多，开发效率和上线速度越来越慢。
- **技术栈多样：** 它可以集成不同的项目到一个项目里面来，且不需要大量重构工作。
  - 不同的框架（Vue、React、jQuery 等），迁移成本高。
- **独立开发、独立部署：** 它可以独立开发和部署任何一个子项目，整个系统不受影响。
  - 各个功能模块都在一个项目中，任何小改动都可能影响整个系统，发布流程复杂且高风险。

![An image](/images/FE/qiankun-1.jpg)

如上图所示，我们可以将 **N 个** 不同技术栈、不同类型的 **后台管理系统** 融合到 **一个** 框架里面来，原有的后台管理系统依然可以独立开发和独立部署。

---

## 一、项目概述

本项目基于 Qiankun 微前端框架，包含一个主应用和两个子应用（可拓展为 N 个）。

- **主应用：** micro-main
- **子应用 1：** vue-order
- **子应用 2：** vue-user

通过微前端架构实现了子应用独立开发、独立部署，同时支持全局状态共享及应用间通信。

**仓库地址：** `git@gl.szzbn.cn:FE/qiankun.git`

---

## 二、快速启动

### 2.1 环境依赖

- Node.js: >= 14.x
- npm 或 yarn

### 2.2 克隆项目

```bash
git clone git@gl.szzbn.cn:FE/qiankun.git
cd micro-main
```

### 2.3 安装依赖

主应用和子应用均需要分别安装依赖。

#### 主应用 micro-main

```bash
cd micro-main
npm install
```

#### 子应用 vue-order

```bash
cd vue-order
npm install
```

#### 子应用 vue-user

```bash
cd vue-user
npm install
```

### 2.4 启动项目

#### 启动主应用

```bash
cd micro-main
npm run serve
```

#### 启动子应用

- **启动 vue-order**

```bash
cd vue-order
npm run serve
```

- **启动 vue-user**

```bash
cd vue-user
npm run serve
```

**主应用启动后会自动加载子应用。**

---

## 三、目录结构

### 3.1 主应用 micro-main

```
micro-main/
├── src/
│   ├── main.js         # 项目入口文件
│   ├── router/         # 主应用路由
│   ├── store/          # Vuex 状态管理
│   ├── components/     # 主应用组件
│   └── App.vue         # 根组件
└── qiankun/            # Qiankun 配置
    ├── registerApps.js # 子应用注册
    └── globalState.js  # 全局状态管理
```

### 3.2 子应用 vue-order 和 vue-user

```
vue-order/ 或 vue-user/
├── src/
│   ├── main.js         # 子应用入口文件
│   ├── router/         # 子应用路由
│   ├── store/          # Vuex 状态管理（可选）
│   ├── components/     # 子应用组件
│   └── App.vue         # 根组件
```

---

## 四、应用通信

### 4.1 全局状态管理

通过 Qiankun 提供的 `initGlobalState` 和 `onGlobalStateChange` 实现全局状态共享。

#### 主应用 micro-main

```javascript
// src/qiankun/globalState.js
import { initGlobalState } from 'qiankun';

const initialState = {
  userInfo: { name: '张三' },
  theme: 'light',
};

const actions = initGlobalState(initialState);

actions.onGlobalStateChange((newState, prevState) => {
  console.log('主应用检测到全局状态变化：', newState, prevState);
});

export default actions;
```

#### 子应用 vue-order 或 vue-user

```javascript
// src/main.js
import { registerMicroApps, start } from 'qiankun';
import actions from './globalState';

actions.onGlobalStateChange((newState, prevState) => {
  console.log('子应用检测到全局状态变化：', newState, prevState);
});

// 修改全局状态
actions.setGlobalState({
  theme: 'dark',
});
```

### 4.2 自定义事件通信

通过 `window.dispatchEvent` 和 `window.addEventListener` 进行简单事件通信。

---

## 五、样式隔离

在子应用中设置沙箱模式，避免样式污染。

#### 主应用注册子应用时的配置

```javascript
registerMicroApps([
  {
    name: 'vue-order',
    entry: '//localhost:8081',
    container: '#sub-container',
    activeRule: '/vue-order',
    props: {
      sandbox: {
        strictStyleIsolation: true,
      },
    },
  },
  {
    name: 'vue-user',
    entry: '//localhost:8082',
    container: '#sub-container',
    activeRule: '/vue-user',
  },
]);
```

---

## 六、常见问题

### 6.1 子应用加载失败

- 检查子应用是否正确启动并可访问。
- 确保 `entry` 配置正确。

### 6.2 样式污染问题

- 使用 Qiankun 的 `strictStyleIsolation`。
- 子应用内部使用 `scoped` 样式。
