# 车站在线售票管理信息系统

## 项目概述

设计并实现一个完整的车站在线售票管理信息系统，支持用户购票、管理员管理等核心功能。

## 技术栈

### 前端技术栈
- **框架**: React 18+
- **语言**: TypeScript
- **UI组件库**: Ant Design (Antd)
- **图表库**: ECharts
- **构建工具**: Vite / Create React App
- **状态管理**: React Hooks (Context API) / Zustand
- **路由**: React Router v6
- **HTTP请求**: Axios
- **表单验证**: Ant Design Form / Yup

### 后端技术栈
- **框架**: Express.js
- **语言**: TypeScript
- **ORM**: Sequelize / TypeORM / Prisma（可选）
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcrypt
- **验证**: express-validator / joi
- **跨域**: cors
- **环境变量**: dotenv

### 数据库
- **数据库**: MySQL 8.0+
- **数据库管理工具**: MySQL Workbench / Navicat

## 用户角色与权限

### 一般用户 (User)
- 注册与登录系统
- 查看、搜索车票信息
- 购票/订票功能
- 订单管理（查看个人订单、订单详情）
- 余票查询
- 发布留言、查看留言

### 系统管理员 (Admin)
- 用户管理（增删改查、权限控制）
- 车次基础信息管理
- 车站售票信息管理
- 退票情况管理
- 数据统计与可视化分析

---

## 功能需求详细说明

### 一、一般用户功能模块

#### 1. 用户注册与登录
**功能描述**:
- 用户可以通过用户名、密码、邮箱等信息注册账号
- 注册时进行数据验证（用户名唯一性、密码强度等）
- 用户登录验证，支持记住登录状态
- 密码加密存储，使用bcrypt进行哈希处理

**技术要求**:
- 前端表单验证（实时验证）
- 后端数据验证（防止绕过前端验证）
- JWT token认证机制
- 登录状态持久化

#### 2. 查看、搜索车票信息
**功能描述**:
- 车票信息列表展示（分页、排序）
- 多条件搜索（日期、到站名、班次）
- 车票详细信息查看
- 支持模糊搜索

**技术要求**:
- 分页查询优化（避免大数据量加载）
- 数据库索引优化（日期、到站名、班次）
- 搜索结果高亮显示

#### 3. 购票/订票功能 ⭐ (新增)
**功能描述**:
- 选择车次、日期、座位类型
- 选择购票数量
- 填写乘客信息（姓名、身份证号等）
- 创建订单
- 订单确认页面

**业务规则**:
- 购票前检查余票数量
- 购票成功后减少对应座位余票
- 生成唯一订单号
- 订单初始状态为"待支付"

**技术要求**:
- 事务处理（保证数据一致性）
- 并发控制（防止超卖，使用乐观锁或悲观锁）
- 库存实时更新
- 表单数据校验

#### 4. 订单管理功能 ⭐ (新增)
**功能描述**:
- 查看个人订单列表
- 订单状态筛选（待支付、已支付、已出行、已退票、已取消）
- 订单详情查看（订单号、车次信息、乘客信息、金额、状态等）
- 订单支付（可选：模拟支付）
- 订单取消（未支付订单可取消）

**技术要求**:
- 订单状态流转管理
- 支付接口集成（或模拟支付流程）
- 订单详情页面数据展示

#### 5. 余票查询与管理 ⭐ (新增)
**功能描述**:
- 实时查询指定车次、日期、座位类型的余票数量
- 购票时自动显示余票信息
- 余票不足时提示用户

**技术要求**:
- 实时库存计算（总票数 - 已售票数 - 锁定票数）
- 缓存优化（可选：Redis缓存热门车次余票）
- 数据库查询优化

#### 6. 发布留言、查看留言
**功能描述**:
- 用户发布留言（内容验证、防XSS攻击）
- 查看所有留言列表（按时间倒序）
- 留言分页显示
- 管理员可删除不当留言（可选功能）

**技术要求**:
- XSS防护（内容过滤）
- 留言字数限制
- 时间戳记录

---

### 二、系统管理员功能模块

#### 1. 用户管理
**功能描述**:
- 用户列表查询（分页、搜索）
- 用户信息查看
- 用户信息编辑
- 用户删除（软删除）
- 用户角色管理（分配管理员权限）

**技术要求**:
- 权限控制（仅管理员可访问）
- 批量操作支持
- 用户状态管理

#### 2. 车次基础信息管理 ⭐ (新增)
**功能描述**:
- 车次信息增删改查
- 车次字段包括：
  - 车次号（唯一）
  - 始发站
  - 终点站
  - 途经站点
  - 发车时间
  - 到达时间
  - 车型
  - 座位类型及对应票价
  - 总座位数（按座位类型）
- 车次信息批量导入（可选）

**技术要求**:
- 数据完整性校验
- 车次号唯一性约束
- 时间格式验证
- 关联售票信息表（外键约束）

#### 3. 车站售票信息管理
**功能描述**:
- 售票信息增删改查
- 主要字段：
  - 日期
  - 到站名
  - 班次
  - 座位类型
  - 售票张数
  - 实收金额
- 售票信息统计（按日期、车次、到站）
- 数据导出功能（Excel，可选）

**技术要求**:
- 与车次信息表关联
- 与订单表关联
- 统计查询性能优化
- 数据验证（金额、数量合理性）

#### 4. 退票情况管理
**功能描述**:
- 退票记录查看（列表、详情）
- 退票信息筛选（按日期、班次等）
- 主要字段：
  - 开车时间
  - 班次
  - 座位类型
  - 目的地
  - 线路
  - 车型
  - 票价
  - 手续费率
  - 手续费
- 退票统计与分析

**技术要求**:
- 与订单表关联
- 退票手续费计算
- 退票后余票自动增加

#### 5. 数据统计与可视化 ⭐ (使用ECharts)
**功能描述**:
- 售票数据统计图表
  - 每日售票量折线图
  - 热门车次柱状图
  - 售票收入趋势图
  - 各到站售票占比饼图
- 退票数据分析
  - 退票率趋势图
  - 退票原因分析（如有）
- 用户数据统计
  - 注册用户数趋势
  - 活跃用户分析

**技术要求**:
- ECharts图表集成
- 数据聚合查询优化
- 图表响应式设计
- 数据筛选与日期范围选择

---

## 数据库设计

### 核心数据表

#### 1. 用户表 (users)
```sql
- id: INT PRIMARY KEY AUTO_INCREMENT
- username: VARCHAR(50) UNIQUE NOT NULL  -- 用户名
- password: VARCHAR(255) NOT NULL         -- 密码（bcrypt加密）
- email: VARCHAR(100)                    -- 邮箱
- phone: VARCHAR(20)                      -- 手机号
- role: ENUM('user', 'admin') DEFAULT 'user'  -- 角色
- status: TINYINT DEFAULT 1              -- 状态（1:正常 0:禁用）
- created_at: DATETIME
- updated_at: DATETIME
```

#### 2. 车次信息表 (trains) ⭐ 新增
```sql
- id: INT PRIMARY KEY AUTO_INCREMENT
- train_number: VARCHAR(20) UNIQUE NOT NULL  -- 车次号
- departure_station: VARCHAR(50) NOT NULL    -- 始发站
- arrival_station: VARCHAR(50) NOT NULL       -- 终点站
- intermediate_stations: TEXT                 -- 途经站点（JSON格式）
- departure_time: TIME NOT NULL               -- 发车时间
- arrival_time: TIME NOT NULL                 -- 到达时间
- vehicle_type: VARCHAR(20)                   -- 车型
- total_seats_business: INT DEFAULT 0         -- 商务座总数
- total_seats_first: INT DEFAULT 0            -- 一等座总数
- total_seats_second: INT DEFAULT 0           -- 二等座总数
- price_business: DECIMAL(10,2)               -- 商务座票价
- price_first: DECIMAL(10,2)                  -- 一等座票价
- price_second: DECIMAL(10,2)                 -- 二等座票价
- status: TINYINT DEFAULT 1                   -- 状态（1:运营 0:停运）
- created_at: DATETIME
- updated_at: DATETIME
```

#### 3. 订单表 (orders) ⭐ 新增
```sql
- id: INT PRIMARY KEY AUTO_INCREMENT
- order_number: VARCHAR(50) UNIQUE NOT NULL   -- 订单号
- user_id: INT NOT NULL                       -- 用户ID（外键）
- train_id: INT NOT NULL                      -- 车次ID（外键）
- train_number: VARCHAR(20) NOT NULL         -- 车次号
- travel_date: DATE NOT NULL                  -- 出行日期
- seat_type: VARCHAR(20) NOT NULL             -- 座位类型
- ticket_count: INT NOT NULL                  -- 购票数量
- passenger_name: VARCHAR(50) NOT NULL        -- 乘客姓名
- passenger_id_card: VARCHAR(18)               -- 身份证号
- ticket_price: DECIMAL(10,2) NOT NULL        -- 单价
- total_amount: DECIMAL(10,2) NOT NULL        -- 总金额
- order_status: VARCHAR(20) DEFAULT 'pending' -- 订单状态
                                                    -- pending:待支付
                                                    -- paid:已支付
                                                    -- completed:已出行
                                                    -- refunded:已退票
                                                    -- cancelled:已取消
- payment_time: DATETIME                      -- 支付时间
- created_at: DATETIME
- updated_at: DATETIME
```

#### 4. 售票信息表 (ticket_sales)
```sql
- id: INT PRIMARY KEY AUTO_INCREMENT
- sale_date: DATE NOT NULL                    -- 日期
- train_id: INT NOT NULL                      -- 车次ID（外键）
- train_number: VARCHAR(20) NOT NULL          -- 班次
- destination: VARCHAR(50) NOT NULL           -- 到站名
- seat_type: VARCHAR(20) NOT NULL             -- 座位类型
- ticket_count: INT NOT NULL                  -- 售票张数
- actual_amount: DECIMAL(10,2) NOT NULL       -- 实收金额
- order_id: INT                               -- 关联订单ID（外键）
- created_at: DATETIME
- updated_at: DATETIME
```

#### 5. 退票情况表 (refunds)
```sql
- id: INT PRIMARY KEY AUTO_INCREMENT
- order_id: INT NOT NULL                      -- 订单ID（外键）
- train_id: INT NOT NULL                      -- 车次ID（外键）
- departure_time: DATETIME NOT NULL           -- 开车时间
- train_number: VARCHAR(20) NOT NULL          -- 班次
- seat_type: VARCHAR(20) NOT NULL             -- 座位类型
- destination: VARCHAR(50) NOT NULL           -- 目的地
- route: VARCHAR(100)                         -- 线路
- vehicle_type: VARCHAR(20)                   -- 车型
- ticket_price: DECIMAL(10,2) NOT NULL        -- 票价
- ticket_count: INT NOT NULL                  -- 退票数量
- service_fee_rate: DECIMAL(5,2) DEFAULT 0    -- 手续费率（%）
- service_fee: DECIMAL(10,2) NOT NULL        -- 手续费
- refund_amount: DECIMAL(10,2) NOT NULL       -- 退款金额
- refund_reason: VARCHAR(255)                 -- 退票原因
- created_at: DATETIME
- updated_at: DATETIME
```

#### 6. 留言表 (messages)
```sql
- id: INT PRIMARY KEY AUTO_INCREMENT
- user_id: INT NOT NULL                       -- 用户ID（外键）
- username: VARCHAR(50)                      -- 用户名（冗余，便于展示）
- content: TEXT NOT NULL                     -- 留言内容
- status: TINYINT DEFAULT 1                  -- 状态（1:正常 0:删除）
- created_at: DATETIME
- updated_at: DATETIME
```

#### 7. 余票库存表 (ticket_inventory) ⭐ 新增（可选方案）
```sql
- id: INT PRIMARY KEY AUTO_INCREMENT
- train_id: INT NOT NULL                     -- 车次ID（外键）
- travel_date: DATE NOT NULL                  -- 出行日期
- seat_type: VARCHAR(20) NOT NULL             -- 座位类型
- total_seats: INT NOT NULL                   -- 总座位数
- sold_seats: INT DEFAULT 0                  -- 已售座位数
- locked_seats: INT DEFAULT 0                 -- 锁定座位数（待支付订单）
- available_seats: INT GENERATED ALWAYS AS (total_seats - sold_seats - locked_seats) VIRTUAL  -- 可用座位数（计算字段）
- created_at: DATETIME
- updated_at: DATETIME
- UNIQUE KEY uk_train_date_seat (train_id, travel_date, seat_type)  -- 唯一约束
```
**说明**: 此表用于实时库存管理，也可通过订单表实时计算，根据系统复杂度选择。

---

### 数据库索引设计

为了提高查询性能，建议创建以下索引：

```sql
-- 用户表索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- 车次信息表索引
CREATE UNIQUE INDEX idx_trains_number ON trains(train_number);
CREATE INDEX idx_trains_status ON trains(status);

-- 订单表索引
CREATE UNIQUE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_train_id ON orders(train_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_travel_date ON orders(travel_date);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- 售票信息表索引
CREATE INDEX idx_ticket_sales_date ON ticket_sales(sale_date);
CREATE INDEX idx_ticket_sales_train_id ON ticket_sales(train_id);
CREATE INDEX idx_ticket_sales_destination ON ticket_sales(destination);
CREATE INDEX idx_ticket_sales_order_id ON ticket_sales(order_id);

-- 退票情况表索引
CREATE INDEX idx_refunds_order_id ON refunds(order_id);
CREATE INDEX idx_refunds_train_id ON refunds(train_id);
CREATE INDEX idx_refunds_departure_time ON refunds(departure_time);
CREATE INDEX idx_refunds_created_at ON refunds(created_at);

-- 留言表索引
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- 余票库存表索引（如果使用）
CREATE UNIQUE INDEX idx_inventory_train_date_seat ON ticket_inventory(train_id, travel_date, seat_type);
CREATE INDEX idx_inventory_travel_date ON ticket_inventory(travel_date);
```

### 外键关系

```sql
-- 订单表外键
ALTER TABLE orders ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE orders ADD CONSTRAINT fk_orders_train FOREIGN KEY (train_id) REFERENCES trains(id) ON DELETE RESTRICT;

-- 售票信息表外键
ALTER TABLE ticket_sales ADD CONSTRAINT fk_sales_train FOREIGN KEY (train_id) REFERENCES trains(id) ON DELETE RESTRICT;
ALTER TABLE ticket_sales ADD CONSTRAINT fk_sales_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

-- 退票情况表外键
ALTER TABLE refunds ADD CONSTRAINT fk_refunds_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
ALTER TABLE refunds ADD CONSTRAINT fk_refunds_train FOREIGN KEY (train_id) REFERENCES trains(id) ON DELETE RESTRICT;

-- 留言表外键
ALTER TABLE messages ADD CONSTRAINT fk_messages_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

---

## 项目结构设计

### 前端项目结构 (React + TypeScript + Ant Design)

```
frontend/
├── public/                 # 静态资源
├── src/
│   ├── assets/             # 静态资源（图片、样式等）
│   ├── components/         # 公共组件
│   │   ├── Layout/         # 布局组件
│   │   ├── Header/          # 头部组件
│   │   ├── Footer/          # 底部组件
│   │   ├── Table/           # 表格组件封装
│   │   └── Chart/           # 图表组件封装（ECharts）
│   ├── pages/              # 页面组件
│   │   ├── Login/           # 登录页
│   │   ├── Register/        # 注册页
│   │   ├── User/            # 用户相关页面
│   │   │   ├── TicketSearch/    # 车票查询
│   │   │   ├── TicketBooking/  # 购票页面
│   │   │   ├── OrderList/       # 订单列表
│   │   │   ├── OrderDetail/    # 订单详情
│   │   │   └── Messages/        # 留言页面
│   │   └── Admin/           # 管理员页面
│   │       ├── UserManagement/  # 用户管理
│   │       ├── TrainManagement/ # 车次管理
│   │       ├── TicketManagement/ # 售票管理
│   │       ├── RefundManagement/ # 退票管理
│   │       └── Statistics/      # 数据统计
│   ├── api/                # API接口封装
│   │   ├── user.ts         # 用户相关接口
│   │   ├── ticket.ts       # 车票相关接口
│   │   ├── order.ts        # 订单相关接口
│   │   ├── train.ts        # 车次相关接口
│   │   └── admin.ts        # 管理员相关接口
│   ├── hooks/              # 自定义Hooks
│   │   ├── useAuth.ts      # 认证Hook
│   │   ├── useRequest.ts   # 请求Hook
│   │   └── usePagination.ts # 分页Hook
│   ├── utils/              # 工具函数
│   │   ├── request.ts      # Axios封装
│   │   ├── auth.ts         # 认证工具
│   │   ├── validation.ts   # 表单验证
│   │   └── format.ts       # 数据格式化
│   ├── store/              # 状态管理
│   │   ├── authStore.ts    # 用户认证状态
│   │   └── appStore.ts     # 应用全局状态
│   ├── types/              # TypeScript类型定义
│   │   ├── user.ts
│   │   ├── ticket.ts
│   │   ├── order.ts
│   │   └── api.ts
│   ├── styles/             # 全局样式
│   ├── App.tsx             # 根组件
│   ├── router.tsx          # 路由配置
│   └── main.tsx            # 入口文件
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 后端项目结构 (Express + TypeScript)

```
backend/
├── src/
│   ├── config/             # 配置文件
│   │   ├── database.ts     # 数据库配置
│   │   ├── jwt.ts          # JWT配置
│   │   └── env.ts          # 环境变量
│   ├── models/             # 数据模型（Sequelize/TypeORM）
│   │   ├── User.ts
│   │   ├── Train.ts
│   │   ├── Order.ts
│   │   ├── TicketSale.ts
│   │   ├── Refund.ts
│   │   └── Message.ts
│   ├── controllers/        # 控制器
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── ticketController.ts
│   │   ├── orderController.ts
│   │   ├── trainController.ts
│   │   └── adminController.ts
│   ├── services/           # 业务逻辑层
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── ticketService.ts
│   │   ├── orderService.ts
│   │   └── inventoryService.ts  # 库存管理服务
│   ├── routes/             # 路由定义
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── ticket.routes.ts
│   │   ├── order.routes.ts
│   │   └── admin.routes.ts
│   ├── middleware/         # 中间件
│   │   ├── auth.middleware.ts    # 认证中间件
│   │   ├── role.middleware.ts    # 权限中间件
│   │   ├── error.middleware.ts   # 错误处理
│   │   └── validation.middleware.ts  # 数据验证
│   ├── validators/         # 数据验证器
│   │   ├── user.validator.ts
│   │   ├── order.validator.ts
│   │   └── train.validator.ts
│   ├── utils/              # 工具函数
│   │   ├── logger.ts       # 日志工具
│   │   ├── encryption.ts   # 加密工具
│   │   ├── dateFormat.ts   # 日期格式化
│   │   └── orderGenerator.ts  # 订单号生成
│   ├── types/              # TypeScript类型定义
│   │   └── index.ts
│   ├── app.ts              # Express应用配置
│   └── server.ts           # 服务器入口
├── database/
│   ├── migrations/         # 数据库迁移文件（可选）
│   └── seeds/              # 种子数据（可选）
├── .env.example            # 环境变量示例
├── package.json
├── tsconfig.json
└── nodemon.json            # 开发环境配置
```

---

## API接口设计

### 认证相关接口

#### 1. 用户注册
- **URL**: `POST /api/auth/register`
- **请求体**:
```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "phone": "string"
}
```
- **响应**: 
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "userId": 1,
    "username": "string"
  }
}
```

#### 2. 用户登录
- **URL**: `POST /api/auth/login`
- **请求体**:
```json
{
  "username": "string",
  "password": "string"
}
```
- **响应**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "jwt_token_string",
    "user": {
      "id": 1,
      "username": "string",
      "role": "user"
    }
  }
}
```

### 用户相关接口

#### 3. 查询车票信息
- **URL**: `GET /api/tickets/search`
- **查询参数**: `?date=2024-01-01&destination=北京&trainNumber=G123`
- **响应**: 车票列表（分页）

#### 4. 查询余票
- **URL**: `GET /api/tickets/available`
- **查询参数**: `?trainId=1&date=2024-01-01&seatType=business`
- **响应**: 余票数量

#### 5. 创建订单
- **URL**: `POST /api/orders/create`
- **请求体**:
```json
{
  "trainId": 1,
  "travelDate": "2024-01-01",
  "seatType": "business",
  "ticketCount": 2,
  "passengerName": "张三",
  "passengerIdCard": "110101199001011234"
}
```
- **响应**: 订单信息（包含订单号）

#### 6. 查询个人订单列表
- **URL**: `GET /api/orders/my`
- **查询参数**: `?status=paid&page=1&pageSize=10`
- **响应**: 订单列表（分页）

#### 7. 查询订单详情
- **URL**: `GET /api/orders/:orderId`
- **响应**: 订单详细信息

#### 8. 支付订单
- **URL**: `POST /api/orders/:orderId/pay`
- **响应**: 支付结果

#### 9. 取消订单
- **URL**: `POST /api/orders/:orderId/cancel`
- **响应**: 取消结果

#### 10. 发布留言
- **URL**: `POST /api/messages/create`
- **请求体**:
```json
{
  "content": "留言内容"
}
```
- **响应**: 留言信息

#### 11. 查看留言列表
- **URL**: `GET /api/messages/list`
- **查询参数**: `?page=1&pageSize=10`
- **响应**: 留言列表（分页）

### 管理员相关接口

#### 12. 用户管理 - 查询用户列表
- **URL**: `GET /api/admin/users`
- **权限**: 仅管理员
- **查询参数**: `?page=1&pageSize=10&keyword=username`
- **响应**: 用户列表（分页）

#### 13. 用户管理 - 创建用户
- **URL**: `POST /api/admin/users`
- **权限**: 仅管理员
- **请求体**: 用户信息
- **响应**: 创建结果

#### 14. 用户管理 - 更新用户
- **URL**: `PUT /api/admin/users/:userId`
- **权限**: 仅管理员
- **响应**: 更新结果

#### 15. 用户管理 - 删除用户
- **URL**: `DELETE /api/admin/users/:userId`
- **权限**: 仅管理员
- **响应**: 删除结果

#### 16. 车次管理 - 查询车次列表
- **URL**: `GET /api/admin/trains`
- **权限**: 仅管理员
- **查询参数**: `?page=1&pageSize=10`
- **响应**: 车次列表（分页）

#### 17. 车次管理 - 创建车次
- **URL**: `POST /api/admin/trains`
- **权限**: 仅管理员
- **请求体**: 车次信息
- **响应**: 创建结果

#### 18. 车次管理 - 更新车次
- **URL**: `PUT /api/admin/trains/:trainId`
- **权限**: 仅管理员
- **响应**: 更新结果

#### 19. 车次管理 - 删除车次
- **URL**: `DELETE /api/admin/trains/:trainId`
- **权限**: 仅管理员
- **响应**: 删除结果

#### 20. 售票信息管理 - 查询售票列表
- **URL**: `GET /api/admin/ticket-sales`
- **权限**: 仅管理员
- **查询参数**: `?startDate=2024-01-01&endDate=2024-01-31&page=1`
- **响应**: 售票信息列表（分页）

#### 21. 退票管理 - 查询退票列表
- **URL**: `GET /api/admin/refunds`
- **权限**: 仅管理员
- **查询参数**: `?startDate=2024-01-01&endDate=2024-01-31&page=1`
- **响应**: 退票信息列表（分页）

#### 22. 数据统计 - 售票统计
- **URL**: `GET /api/admin/statistics/sales`
- **权限**: 仅管理员
- **查询参数**: `?startDate=2024-01-01&endDate=2024-01-31&type=daily`
- **响应**: 统计数据（用于ECharts图表）

#### 23. 数据统计 - 退票统计
- **URL**: `GET /api/admin/statistics/refunds`
- **权限**: 仅管理员
- **查询参数**: `?startDate=2024-01-01&endDate=2024-01-31`
- **响应**: 退票统计数据

#### 24. 数据统计 - 用户统计
- **URL**: `GET /api/admin/statistics/users`
- **权限**: 仅管理员
- **查询参数**: `?startDate=2024-01-01&endDate=2024-01-31`
- **响应**: 用户统计数据

---

## 关键技术实现要点

### 1. 并发控制与防止超卖

**问题**: 高并发场景下，多个用户同时购买同一车次的最后一张票，可能导致超卖。

**解决方案**:
- **方案一（推荐）**: 使用数据库事务 + 行级锁（SELECT ... FOR UPDATE）
- **方案二**: 使用Redis分布式锁
- **方案三**: 使用乐观锁（版本号机制）

**实现示例（方案一）**:
```typescript
// 购票时使用事务和行级锁
await sequelize.transaction(async (t) => {
  // 锁定库存记录
  const inventory = await TicketInventory.findOne({
    where: { trainId, travelDate, seatType },
    lock: t.LOCK.UPDATE,
    transaction: t
  });
  
  if (inventory.availableSeats < ticketCount) {
    throw new Error('余票不足');
  }
  
  // 更新库存
  await inventory.update({
    soldSeats: inventory.soldSeats + ticketCount
  }, { transaction: t });
  
  // 创建订单
  const order = await Order.create({...}, { transaction: t });
  
  return order;
});
```

### 2. 订单号生成策略

**要求**: 唯一、可追溯、易识别

**方案**: 时间戳 + 随机数 + 用户ID
```typescript
function generateOrderNumber(userId: number): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${timestamp}${userId}${random}`;
}
```

### 3. JWT认证实现

**Token结构**:
```typescript
{
  userId: number,
  username: string,
  role: 'user' | 'admin',
  exp: number  // 过期时间
}
```

**中间件实现**:
```typescript
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ code: 401, message: '未提供认证令牌' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ code: 403, message: '令牌无效或已过期' });
  }
};
```

### 4. 权限控制中间件

```typescript
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ code: 403, message: '需要管理员权限' });
  }
  next();
};
```

### 5. ECharts图表集成

**前端实现示例**:
```typescript
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const SalesChart: React.FC<{ data: any[] }> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!chartRef.current) return;
    
    const chart = echarts.init(chartRef.current);
    
    const option = {
      title: { text: '每日售票量' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: data.map(d => d.date) },
      yAxis: { type: 'value' },
      series: [{
        data: data.map(d => d.count),
        type: 'line'
      }]
    };
    
    chart.setOption(option);
    
    return () => chart.dispose();
  }, [data]);
  
  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};
```

### 6. 数据验证

**使用express-validator示例**:
```typescript
import { body, validationResult } from 'express-validator';

export const validateOrderCreate = [
  body('trainId').isInt({ min: 1 }).withMessage('车次ID无效'),
  body('travelDate').isISO8601().withMessage('日期格式无效'),
  body('seatType').isIn(['business', 'first', 'second']).withMessage('座位类型无效'),
  body('ticketCount').isInt({ min: 1, max: 10 }).withMessage('购票数量应在1-10之间'),
  body('passengerName').notEmpty().withMessage('乘客姓名不能为空'),
  body('passengerIdCard').matches(/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/).withMessage('身份证号格式无效')
];
```

---

## 开发计划

### 第一阶段：基础架构搭建（1-2天）
- [ ] 初始化前后端项目
- [ ] 配置TypeScript、ESLint、Prettier
- [ ] 配置数据库连接
- [ ] 创建数据库表结构
- [ ] 实现基础工具函数（认证、请求封装等）

### 第二阶段：用户认证模块（2-3天）
- [ ] 用户注册功能
- [ ] 用户登录功能
- [ ] JWT认证中间件
- [ ] 前端路由守卫
- [ ] 登录状态管理

### 第三阶段：车次信息管理（2-3天）
- [ ] 车次信息CRUD（管理员）
- [ ] 车次列表查询（用户）
- [ ] 余票查询功能
- [ ] 前端车次展示页面

### 第四阶段：购票与订单功能（3-4天）
- [ ] 购票流程实现
- [ ] 订单创建与管理
- [ ] 并发控制实现
- [ ] 订单支付（模拟）
- [ ] 前端购票页面

### 第五阶段：售票与退票管理（2-3天）
- [ ] 售票信息记录与管理
- [ ] 退票功能实现
- [ ] 退票手续费计算
- [ ] 管理员管理界面

### 第六阶段：数据统计与可视化（2-3天）
- [ ] 统计数据接口开发
- [ ] ECharts图表集成
- [ ] 多种图表类型实现
- [ ] 数据筛选功能

### 第七阶段：留言功能（1天）
- [ ] 留言发布与查询
- [ ] 留言管理（管理员）

### 第八阶段：测试与优化（2-3天）
- [ ] 功能测试
- [ ] 性能优化
- [ ] 安全性检查
- [ ] 用户体验优化

---

## 部署说明

### 环境要求
- Node.js 18+
- MySQL 8.0+
- npm 或 yarn

### 后端部署步骤

1. **安装依赖**
```bash
cd backend
npm install
```

2. **配置环境变量**
创建 `.env` 文件：
```env
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ticket_system
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
```

3. **初始化数据库**
```bash
# 执行SQL脚本创建表结构
mysql -u root -p < database/schema.sql
```

4. **启动服务**
```bash
# 开发环境
npm run dev

# 生产环境
npm run build
npm start
```

### 前端部署步骤

1. **安装依赖**
```bash
cd frontend
npm install
```

2. **配置API地址**
在 `.env` 文件中配置：
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

3. **构建项目**
```bash
npm run build
```

4. **启动开发服务器**
```bash
npm run dev
```

---

## 注意事项

### 安全性
1. **密码加密**: 使用bcrypt，salt rounds >= 10
2. **SQL注入防护**: 使用参数化查询，避免字符串拼接
3. **XSS防护**: 对用户输入进行转义和过滤
4. **CSRF防护**: 使用CSRF token或SameSite Cookie
5. **API限流**: 防止恶意请求，使用express-rate-limit

### 性能优化
1. **数据库索引**: 为常用查询字段创建索引
2. **分页查询**: 所有列表接口必须支持分页
3. **缓存策略**: 对热点数据使用Redis缓存（可选）
4. **前端优化**: 使用React.memo、useMemo等优化渲染性能
5. **图片优化**: 压缩静态资源

### 代码规范
1. **TypeScript**: 严格类型检查，避免使用any
2. **命名规范**: 使用驼峰命名，组件使用PascalCase
3. **注释**: 关键业务逻辑添加注释
4. **错误处理**: 统一的错误处理机制
5. **日志记录**: 记录关键操作和错误信息

---

## 常见问题

### Q1: 如何处理订单超时未支付？
**A**: 可以设置定时任务，扫描超过30分钟未支付的订单，自动取消并释放库存。

### Q2: 余票数据如何实时更新？
**A**: 购票成功时减少库存，退票时增加库存。可以通过库存表或实时计算两种方式实现。

### Q3: 如何防止用户重复提交订单？
**A**: 前端使用防抖，后端检查短时间内同一用户的重复订单请求。

### Q4: 数据库连接池如何配置？
**A**: 在数据库配置中设置连接池参数：
```typescript
{
  max: 10,      // 最大连接数
  min: 2,       // 最小连接数
  acquire: 30000,
  idle: 10000
}
```

---

## 参考资料

- [React 官方文档](https://react.dev/)
- [Ant Design 文档](https://ant.design/)
- [ECharts 文档](https://echarts.apache.org/)
- [Express 官方文档](https://expressjs.com/)
- [MySQL 文档](https://dev.mysql.com/doc/)
- [TypeScript 文档](https://www.typescriptlang.org/)

---

## 项目状态

- [x] 需求分析
- [x] 技术选型
- [x] 数据库设计
- [x] 项目结构设计
- [ ] 开发实现
- [ ] 测试
- [ ] 部署

---

**最后更新**: 2024年