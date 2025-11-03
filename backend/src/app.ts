/**
 * Express应用配置
 */
import express, { Application } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import adminUsersRoutes from './routes/admin.users.routes';
import adminTrainsRoutes from './routes/admin.trains.routes';
import adminTicketSalesRoutes from './routes/admin.ticketSales.routes';
import adminTrainStopsRoutes from './routes/admin.trainStops.routes';
import adminOrdersRoutes from './routes/admin.orders.routes';
import adminRefundsRoutes from './routes/admin.refunds.routes';
import adminStatisticsRoutes from './routes/admin.statistics.routes';
import publicTicketsRoutes from './routes/public.tickets.routes';
import userOrdersRoutes from './routes/user.orders.routes';
import userPassengersRoutes from './routes/user.passengers.routes';
import userProfileRoutes from './routes/user.profile.routes';
import userMessagesRoutes from './routes/user.messages.routes';
import publicOrdersRoutes from './routes/public.orders.routes';
import adminMessagesRoutes from './routes/admin.messages.routes';

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
app.use('/api/tickets', publicTicketsRoutes);
app.use('/api/user/orders', userOrdersRoutes);
app.use('/api/user/passengers', userPassengersRoutes);
app.use('/api/user/profile', userProfileRoutes);
app.use('/api/user/messages', userMessagesRoutes);
app.use('/api/orders', publicOrdersRoutes);
app.use('/api/admin', adminUsersRoutes);
app.use('/api/admin', adminTrainsRoutes);
app.use('/api/admin', adminTrainStopsRoutes);
app.use('/api/admin', adminTicketSalesRoutes);
app.use('/api/admin', adminOrdersRoutes);
app.use('/api/admin', adminRefundsRoutes);
app.use('/api/admin', adminStatisticsRoutes);
app.use('/api/admin', adminMessagesRoutes);

// 404处理
app.use(notFoundHandler);

// 错误处理中间件（必须在最后）
app.use(errorHandler);

export default app;

