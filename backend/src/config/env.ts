/**
 * 环境变量配置
 */
import dotenv from 'dotenv';

dotenv.config();

export const env = {
  // 服务器配置
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),

  // 数据库配置
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
  DB_NAME: process.env.DB_NAME || 'ticket_system',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',

  // JWT配置
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // 默认管理员密码（仅开发环境用于初始化）
  ADMIN_DEFAULT_PASSWORD: process.env.ADMIN_DEFAULT_PASSWORD || 'admin123',
};

