/**
 * 初始化管理员账户（开发环境）
 */
import User from '../models/User';
import { hashPassword } from '../utils/encryption';
import { env } from '../config/env';

export const seedAdmin = async (): Promise<void> => {
  try {
    const existing = await User.findOne({ where: { username: 'admin' } });
    if (existing) {
      // 已存在则确保角色为admin（不强制修改密码以避免覆盖）
      if (existing.role !== 'admin') {
        await existing.update({ role: 'admin' });
        console.log('🔧 已将现有用户 admin 提升为管理员');
      }
      return;
    }

    const hashed = await hashPassword(env.ADMIN_DEFAULT_PASSWORD);
    await User.create({
      username: 'admin',
      password: hashed,
      role: 'admin',
      status: 1,
    });
    console.log('✅ 已创建默认管理员账号 admin');
  } catch (e) {
    console.error('❌ 创建默认管理员账号失败:', e);
  }
};


