# 快速启动指南

## 您的数据库已配置好！

我已经为您配置好了TiDB Cloud数据库连接。

### 第1步：复制环境变量文件

将 `.env.local` 文件重命名为 `.env`：

**Windows (PowerShell):**
```powershell
Copy-Item .env.local .env
```

**Mac/Linux:**
```bash
cp .env.local .env
```

或者手动操作：
1. 找到项目根目录下的 `.env.local` 文件
2. 复制一份并重命名为 `.env`

---

### 第2步：安装依赖

```bash
pnpm install
```

如果您使用yarn：
```bash
yarn install
```

---

### 第3步：创建数据库表

```bash
pnpm db:push
```

这个命令会自动在您的TiDB数据库中创建所有需要的表：
- `users` - 用户表
- `quotations` - 报价单表
- `quotationItems` - 报价明细表

**注意**：TiDB Cloud会自动处理SSL连接，您无需额外配置。

---

### 第4步：启动项目

```bash
pnpm dev
```

然后在浏览器中访问：http://localhost:3000

---

## 您的数据库信息

- **主机**: gateway01.ap-southeast-1.prod.aws.tidbcloud.com
- **端口**: 4000
- **用户名**: sZjquT5XcuoHF8t.root
- **密码**: yAgtDV6byMJJwYdZ
- **数据库**: test

**连接字符串已配置在 `.env.local` 文件中**

---

## 常见问题

### Q: 运行 `pnpm db:push` 时报 SSL 错误？

**A:** 已修复！新版本的 `.env.local` 使用了简化的连接字符串，TiDB会自动处理SSL。

如果您之前下载过旧版本，请：
1. 删除 `.env` 文件
2. 重新复制 `.env.local` 为 `.env`
3. 再次运行 `pnpm db:push`

### Q: 运行 `pnpm db:push` 时显示 "No schema changes, nothing to migrate"？

**A:** 这是正常的！说明数据库表结构已经是最新的。继续运行 `pnpm dev` 即可。

### Q: 启动后无法登录？

**A:** 这个项目使用OAuth登录，如果您不需要登录功能，可以：
1. 修改代码移除登录验证
2. 或者直接使用报价功能（部分功能可能需要登录）

### Q: 产品数据在哪里？

**A:** 产品数据存储在以下文件中：
- `product_prices.pkl` - 309个产品的底价数据
- `quotation_logic.py` - 产品搜索和价格计算逻辑

这些文件已经包含在项目中，无需额外配置。

---

## 项目结构

```
quotation_tool/
├── .env.local          # 数据库配置模板（复制为.env使用）
├── SETUP_GUIDE.md      # 本文件
├── client/             # 前端代码
│   └── src/
│       ├── pages/      # 页面组件
│       └── components/ # UI组件
├── server/             # 后端代码
│   ├── routers.ts      # API路由
│   └── db.ts           # 数据库查询
├── drizzle/            # 数据库schema
├── product_prices.pkl  # 产品数据
└── quotation_logic.py  # 报价逻辑
```

---

## 完整命令流程

```bash
# 1. 解压项目
tar -xzf quotation_tool_configured.tar.gz
cd quotation_tool

# 2. 复制环境变量（Windows PowerShell）
Copy-Item .env.local .env

# 或者 Mac/Linux
cp .env.local .env

# 3. 安装依赖
pnpm install

# 4. 创建数据库表
pnpm db:push

# 5. 启动项目
pnpm dev

# 6. 访问 http://localhost:3000
```

就这么简单！🎉

---

## 技术说明

### 为什么移除了SSL配置中的JSON格式？

TiDB Cloud要求使用SSL连接，但 `drizzle-kit` 工具不支持在连接字符串中使用JSON格式的SSL配置（如 `?ssl={"rejectUnauthorized":true}`）。

好消息是：**TiDB的MySQL驱动会自动使用SSL连接**，所以我们可以安全地使用简化的连接字符串。

### 数据库表会自动创建吗？

是的！运行 `pnpm db:push` 时，Drizzle会：
1. 读取 `drizzle/schema.ts` 中的表定义
2. 连接到您的TiDB数据库
3. 自动创建所有表和索引

您无需手动在TiDB控制台中创建表。

