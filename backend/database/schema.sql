-- 车站在线售票系统数据库表结构
-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS ticket_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ticket_system;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  password VARCHAR(255) NOT NULL COMMENT '密码（bcrypt加密）',
  email VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  phone VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user' COMMENT '角色',
  status TINYINT NOT NULL DEFAULT 1 COMMENT '状态（1:正常 0:禁用）',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 默认管理员账号改由应用启动时在开发环境种子（seedAdmin）创建

