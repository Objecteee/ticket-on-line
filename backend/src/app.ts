/**
 * Express应用配置
 */
import express, { Application } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import adminUsersRoutes from './routes/admin.users.routes';

const app: Application = express();

// CORS配置
app.use(cors({
  origin: env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
}));

// 解析JSON请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminUsersRoutes);

// 404处理
app.use(notFoundHandler);

// 错误处理中间件（必须在最后）
app.use(errorHandler);

export default app;

