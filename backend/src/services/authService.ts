/**
 * 认证服务
 */
import User from '../models/User';
import { hashPassword, comparePassword } from '../utils/encryption';
import { generateToken } from '../utils/jwt';
import { UserInfo, JWTPayload } from '../types';

/**
 * 用户注册
 */
export const registerUser = async (
  username: string,
  password: string,
  email?: string,
  phone?: string
): Promise<UserInfo> => {
  // 检查用户名是否已存在
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    throw new Error('用户名已存在');
  }

  // 如果提供了邮箱，检查邮箱是否已使用
  if (email) {
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      throw new Error('邮箱已被注册');
    }
  }

  // 如果提供了手机号，检查手机号是否已使用
  if (phone) {
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      throw new Error('手机号已被注册');
    }
  }

  // 加密密码
  const hashedPassword = await hashPassword(password);

  // 创建用户
  const user = await User.create({
    username,
    password: hashedPassword,
    email,
    phone,
    role: 'user',
    status: 1,
  });

  // 返回用户信息（不包含密码）
  const userInfo: UserInfo = {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  return userInfo;
};

/**
 * 用户登录
 */
export const loginUser = async (username: string, password: string): Promise<{ token: string; user: UserInfo }> => {
  // 查找用户（包含密码字段）
  const user = await User.findOne({ where: { username } });
  if (!user) {
    throw new Error('用户名或密码错误');
  }

  // 检查用户状态
  if (user.status !== 1) {
    throw new Error('账户已被禁用');
  }

  // 验证密码
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('用户名或密码错误');
  }

  // 生成JWT Token
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
  };
  const token = generateToken(payload);

  // 返回用户信息（不包含密码）
  const userInfo: UserInfo = {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  return { token, user: userInfo };
};

