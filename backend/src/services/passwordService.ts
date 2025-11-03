import dayjs from 'dayjs';
import User from '../models/User';
import PasswordReset from '../models/PasswordReset';
import { hashPassword } from '../utils/encryption';

const generateCode = (): string => String(Math.floor(100000 + Math.random() * 900000));

export const requestResetCode = async (identifier: string) => {
  // identifier 可以是 username/email/phone
  const user = await User.findOne({ where: {
    // 简单匹配：优先用户名，再邮箱，再手机号
    username: identifier,
  } as any }) || await User.findOne({ where: { email: identifier } }) || await User.findOne({ where: { phone: identifier } });
  if (!user) throw new Error('用户不存在');
  const code = generateCode();
  const expires = dayjs().add(10, 'minute').toDate();
  await PasswordReset.create({ user_id: user.id, identifier, code, expires_at: expires });
  // 真实环境应发送邮件/短信；此项目返回 code 便于测试
  return { code, expires_at: expires, user_id: user.id };
};

export const resetPasswordByCode = async (identifier: string, code: string, newPassword: string) => {
  const record = await PasswordReset.findOne({ where: { identifier, code, used: 0 }, order: [['created_at', 'DESC']] });
  if (!record) throw new Error('验证码无效');
  if (dayjs(record.expires_at).isBefore(dayjs())) throw new Error('验证码已过期');
  const user = await User.findByPk(record.user_id);
  if (!user) throw new Error('用户不存在');
  const hashed = await hashPassword(newPassword);
  await user.update({ password: hashed });
  await record.update({ used: 1 });
  return true;
};


