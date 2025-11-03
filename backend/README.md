# 车站在线售票系统 - 后端项目

## 技术栈

- Node.js + Express
- TypeScript
- MySQL + Sequelize ORM
- JWT认证
- bcrypt密码加密

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接和JWT密钥：

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=ticket_system
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key_please_change_in_production
JWT_EXPIRES_IN=7d
```

### 3. 初始化数据库

#### 方式一：使用SQL脚本（推荐）

```bash
mysql -u root -p < database/schema.sql
```

#### 方式二：手动创建

1. 创建数据库：
```sql
CREATE DATABASE ticket_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 运行SQL脚本：
```bash
mysql -u root -p ticket_system < database/schema.sql
```

### 4. 启动服务器

#### 开发模式（热重载）
```bash
npm run dev
```

#### 生产模式
```bash
npm run build
npm start
```

服务器将在 http://localhost:3000 启动

## API接口

### 认证接口

#### 用户注册
- **URL**: `POST /api/auth/register`
- **请求体**:
```json
{
  "username": "testuser",
  "password": "123456",
  "email": "test@example.com",
  "phone": "13800138000"
}
```

#### 用户登录
- **URL**: `POST /api/auth/login`
- **请求体**:
```json
{
  "username": "testuser",
  "password": "123456"
}
```

#### 用户登出
- **URL**: `POST /api/auth/logout`
- **需要认证**: 否

## 项目结构

```
backend/
├── src/
│   ├── config/          # 配置文件
│   ├── models/          # 数据模型
│   ├── controllers/     # 控制器
│   ├── services/        # 业务逻辑层
│   ├── routes/          # 路由定义
│   ├── middleware/      # 中间件
│   ├── validators/      # 数据验证器
│   ├── utils/           # 工具函数
│   ├── types/           # TypeScript类型
│   ├── app.ts           # Express应用配置
│   └── server.ts        # 服务器入口
├── database/            # 数据库脚本
└── package.json
```

## 数据库表结构

### users 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT UNSIGNED | 主键，自增 |
| username | VARCHAR(50) | 用户名，唯一 |
| password | VARCHAR(255) | 密码（bcrypt加密） |
| email | VARCHAR(100) | 邮箱，可选 |
| phone | VARCHAR(20) | 手机号，可选 |
| role | ENUM | 角色：user/admin |
| status | TINYINT | 状态：1正常/0禁用 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

## 安全特性

1. **密码加密**: 使用bcrypt，salt rounds = 10
2. **JWT认证**: Token过期时间可配置
3. **数据验证**: 使用express-validator进行请求数据验证
4. **SQL注入防护**: 使用Sequelize ORM参数化查询
5. **错误处理**: 统一的错误处理机制

## 注意事项

1. **生产环境配置**:
   - 修改默认JWT_SECRET
   - 使用强密码
   - 配置HTTPS
   - 设置适当的CORS策略

2. **数据库连接池**: 已在配置中设置连接池参数，可根据实际情况调整

3. **日志记录**: 建议添加日志系统（如winston）用于生产环境

## 开发说明

- 开发模式下，服务器会自动同步数据库模型
- 使用nodemon实现热重载
- TypeScript严格模式已启用

