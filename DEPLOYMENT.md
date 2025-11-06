# 生产环境部署指南

## 概述

本项目已配置为生产环境部署模式，前端代码构建为静态文件并集成到后端服务中。

## 项目结构

```
ticket-on-line/
├── frontend/          # 前端源码
├── backend/           # 后端源码
│   ├── public/       # 前端构建产物（自动生成）
│   └── dist/         # 后端构建产物
```

## 构建步骤

### 1. 安装依赖

```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 2. 配置环境变量

在 `backend` 目录下创建 `.env` 文件，参考 `env.example`：

```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
```

### 3. 构建项目

#### 方式一：分别构建

```bash
# 构建前端（输出到 backend/public）
cd frontend
npm run build

# 构建后端（输出到 backend/dist）
cd ../backend
npm run build
```

#### 方式二：一键构建（推荐）

```bash
cd backend
npm run build:all
```

这个命令会：
1. 先构建前端到 `backend/public`
2. 再构建后端到 `backend/dist`

### 4. 启动服务

```bash
cd backend
npm start
```

服务将在 `http://localhost:3000` 启动。

## 生产环境配置

### 环境变量

确保 `NODE_ENV=production`，这样：
- 后端会提供静态文件服务
- 所有非 API 路由会返回前端应用（SPA 路由支持）
- CORS 配置会使用生产环境的域名

### 静态文件服务

在生产环境下，后端会自动：
1. 提供 `backend/public` 目录下的静态文件（CSS、JS、图片等）
2. 对于所有非 `/api` 和 `/health` 的路由，返回 `index.html`（支持前端路由）

### API 请求

前端在生产环境下使用相对路径 `/api`，因为前后端在同一域名下，无需配置代理。

## 开发环境

开发环境仍然保持前后端分离：

```bash
# 终端1：启动后端
cd backend
npm run dev

# 终端2：启动前端开发服务器
cd frontend
npm run dev
```

前端开发服务器运行在 `http://localhost:3001`，通过代理访问后端 API。

## 部署注意事项

1. **数据库**：确保生产环境数据库已创建并配置正确
2. **端口**：根据实际部署环境修改端口配置
3. **域名**：在 `backend/src/app.ts` 中更新 CORS 配置的域名
4. **HTTPS**：生产环境建议使用 HTTPS
5. **进程管理**：建议使用 PM2 等进程管理工具
6. **反向代理**：可以使用 Nginx 作为反向代理

## PM2 部署示例

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
cd backend
pm2 start dist/server.js --name ticket-online

# 查看状态
pm2 status

# 查看日志
pm2 logs ticket-online

# 停止应用
pm2 stop ticket-online
```

## Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 故障排查

1. **静态文件404**：检查 `backend/public` 目录是否存在且包含构建产物
2. **路由404**：确保后端 `app.ts` 中的 SPA 路由配置正确
3. **API请求失败**：检查 CORS 配置和 API 路由是否正确
4. **构建失败**：检查 Node.js 版本和依赖是否正确安装

