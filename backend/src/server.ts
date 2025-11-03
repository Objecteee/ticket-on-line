/**
 * 服务器入口文件
 */
import app from './app';
import { env } from './config/env';
import { testConnection } from './config/database';
import User from './models/User';
import { seedAdmin } from './seeds/seedAdmin';
import Train from './models/Train';
import Order from './models/Order';
import TicketSale from './models/TicketSale';
import Refund from './models/Refund';
import TicketInventory from './models/TicketInventory';
import TrainStop from './models/TrainStop';
import Passenger from './models/Passenger';
import PasswordReset from './models/PasswordReset';
import Message from './models/Message';

const PORT = env.PORT;

/**
 * 启动服务器
 */
const startServer = async (): Promise<void> => {
  try {
    // 测试数据库连接
    await testConnection();

    // 同步数据库模型（开发环境）
    if (env.NODE_ENV === 'development') {
      await User.sync({ alter: false });
      await Train.sync({ alter: false });
      await Order.sync({ alter: false });
      await TicketSale.sync({ alter: false });
      await Refund.sync({ alter: false });
      await TicketInventory.sync({ alter: false });
      await TrainStop.sync({ alter: false });
      await Passenger.sync({ alter: false });
      await PasswordReset.sync({ alter: false });
      await Message.sync({ alter: false });
      console.log('✅ 数据库模型已同步');

      // 初始化管理员账号（仅开发环境）
      await seedAdmin();
    }

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
      console.log(`📝 API文档: http://localhost:${PORT}/api/auth`);
      console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
};

// 启动服务器
startServer();

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', promise, '原因:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

