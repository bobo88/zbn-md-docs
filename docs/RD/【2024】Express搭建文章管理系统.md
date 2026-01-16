# Express - 文章管理系统搭建文档

> 作者：Bob，时间：2024.11.26

<!-- ::: tip 文章信息



::: -->

本系统主要配合“官网”进行文章的管理和展示。

## 一、技术栈

### 1.1 前端

**仓库地址：** `git@gl.szzbn.cn:FE/cms-vue3.git`

- VUE3
- Element Plus
- ...

### 1.2 后端

**仓库地址：** `git@gl.szzbn.cn:FE/cms-express.git`

- Express（Node）
- MongoDB
- ...

## 二、系统架构设计

### 2.1 前端

- **文章列表页面：** 显示所有文章，支持分页、排序、筛选。
- **文章详情页面：** 显示单篇文章的内容。
- **文章编辑页面：** 管理后台，支持编辑、添加、删除文章。
- **用户登录/注册：** 用户认证，支持 JWT 登录。
- **权限管理：** 根据用户角色展示不同的功能模块（如管理员和普通用户的权限不同）。

### 2.2 后端

- **用户认证与授权：** 使用 JWT 实现用户登录，保证接口安全。
- **文章管理：** 提供增、删、改、查接口来管理文章。
- **评论管理：** 支持文章的评论功能。
- **分类标签：** 为文章添加分类或标签，便于管理和筛选。
- **日志与监控：** 记录系统操作日志，监控后台接口状态。

### 2.3 数据库

- **用户表：** 存储用户的基本信息、角色、权限等。
- **文章表：** 存储文章的基本信息，如标题、内容、作者、创建时间等。
- **评论表：** 存储文章的评论。
- **分类表：** 存储文章的分类。
- **标签表：** 存储文章的标签。

## 三、功能设计

TODO

### 3.1 用户注册登录（双重加密）

**用户注册：** 后端将密码加密处理为 hash 值。

![An image](/images/RD/Express-1.jpg)

![An image](/images/RD/Express-2.jpg)

**用户登录：**

1. 用户密码不能明文传送，需要加密处理；
2. 后端获取数据需要进行 2 步解密比对操作：
   - **A、** 将非明文密码解密处理（密钥 KEY 与前端加密时的 KEY 保持一致）；
   - **B、** 将解密后的密码与数据库（mongoDB）中的 hash 密码进行比对，一致则登录 OK。

![An image](/images/RD/Express-3.jpg)

**登录页面真实验证**

![An image](/images/RD/Express-4.png)

![An image](/images/RD/Express-5.png)

## 四、数据库设计

TODO

## 五、后端 API 设计

文章管理、权限管理、用户管理、评论管理。

### API 文档：文章管理

**备注：** 文章的创建、更新、删除操作，必须登录验证 JWT 才能进行，否则无法操作。

#### 1. 获取文章列表

- **接口 URL：** `/list`
- **请求方法：** POST
- **请求参数：**
  - `currentPage` (可选，默认值: 1) - 当前页码
  - `pageSize` (可选，默认值: 10) - 每页显示数量
- **响应示例：**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "list": [
      {
        "id": "1",
        "title": "文章标题1",
        "slug": "article-title-1",
        "excerpt": "文章摘要",
        "author": "用户ID",
        "category": "类别ID",
        "tags": ["标签ID1", "标签ID2"],
        "status": "published",
        "published_at": "2023-11-01T10:00:00Z"
      }
    ],
    "count": 100
  }
}
```

#### 2. 获取所有文章 -- API 已完成

- **接口 URL：** `/list/all`
- **请求方法：** GET
- **请求参数：** 无
- **响应示例：**

```json
{
  "code": 200,
  "message": "成功",
  "data": [
    {
      "id": "1",
      "title": "文章标题1",
      "slug": "article-title-1",
      "excerpt": "文章摘要"
    }
  ]
}
```

![An image](/images/RD/Express-6.png)

#### 3. 创建文章

- **接口 URL：** `/create`
- **请求方法：** POST
- **请求参数：**
  - `title` (必填) - 文章标题
  - `slug` (必填) - 文章的 Slug
  - `content` (必填) - 文章内容
  - `excerpt` (必填) - 文章摘要
  - `author` (必填) - 文章作者（User ID）
  - `category` (必填) - 文章分类（Category ID）
  - `tags` (可选) - 文章标签（Tag ID 数组）
  - `status` (可选, 默认值: draft) - 文章状态：published, draft, archived
- **响应示例：**

```json
{
  "code": 200,
  "message": "文章创建成功",
  "data": {}
}
```

#### 4. 更新文章

- **接口 URL：** `/update`
- **请求方法：** PUT
- **请求参数：**
  - `id` (必填) - 文章 ID
  - `title` (可选) - 文章标题
  - `slug` (可选) - 文章 Slug
  - `content` (可选) - 文章内容
  - `excerpt` (可选) - 文章摘要
  - `author` (可选) - 文章作者（User ID）
  - `category` (可选) - 文章分类（Category ID）
  - `tags` (可选) - 文章标签（Tag ID 数组）
  - `status` (可选) - 文章状态：published, draft, archived
- **响应示例：**

```json
{
  "code": 200,
  "message": "文章更新成功",
  "data": {}
}
```

#### 5. 删除文章

- **接口 URL：** `/delete/:id`
- **请求方法：** DELETE
- **请求参数：**
  - `id` (必填) - 文章 ID
- **响应示例：**

```json
{
  "code": 200,
  "message": "文章删除成功",
  "data": {}
}
```

#### 6. 获取文章详情 -- API 已完成

- **接口 URL：** `/detail/:id`
- **请求方法：** GET
- **请求参数：**
  - `id` (必填) - 文章 ID
- **响应示例：**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "id": "1",
    "title": "文章标题1",
    "slug": "article-title-1",
    "content": "文章内容",
    "excerpt": "文章摘要",
    "author": "用户ID",
    "category": "类别ID",
    "tags": ["标签ID1", "标签ID2"],
    "status": "published",
    "published_at": "2023-11-01T10:00:00Z",
    "comments": [
      {
        "user_id": "用户ID",
        "content": "评论内容",
        "created_at": "2023-11-02T12:00:00Z"
      }
    ]
  }
}
```

#### 7. 获取上一篇和下一篇文章

- **接口 URL：** `/prev-next/:id`
- **请求方法：** GET
- **请求参数：**
  - `id` (必填) - 当前文章 ID
- **响应示例：**

```json
{
  "code": 200,
  "message": "成功",
  "data": {
    "prev": {
      "id": "0",
      "title": "上一篇文章",
      "slug": "previous-article",
      "typeid": "类别ID"
    },
    "next": {
      "id": "2",
      "title": "下一篇文章",
      "slug": "next-article",
      "typeid": "类别ID"
    }
  }
}
```

### 注意事项

- 所有接口返回的 `code` 为 200 表示请求成功，非 200 的 `code` 表示发生了错误。
- 各个接口响应内容中的 `message` 提供了简短的响应说明。
- 对于分页接口 `/list`，响应的 `list` 数组会包含当前页的文章，`count` 表示文章的总数。

## 六、前端页面实现

TODO
