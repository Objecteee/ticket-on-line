/**
 * 用户管理服务层（管理员）
 */
import { Op } from 'sequelize';
import User from '../models/User';
import { hashPassword } from '../utils/encryption';

export interface ListUsersParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  role?: 'user' | 'admin';
  status?: number; // 1/0
  sortBy?: 'created_at' | 'username' | 'status' | 'role';
  order?: 'asc' | 'desc';
}

export const listUsers = async (params: ListUsersParams) => {
  const {
    page = 1,
    pageSize = 10,
    keyword,
    role,
    status,
    sortBy = 'created_at',
    order = 'desc',
  } = params;

  const where: any = {};
  if (keyword) {
    where[Op.or] = [
      { username: { [Op.like]: `%${keyword}%` } },
      { email: { [Op.like]: `%${keyword}%` } },
      { phone: { [Op.like]: `%${keyword}%` } },
    ];
  }
  if (role) where.role = role;
  if (status === 0 || status === 1) where.status = status;

  const offset = (page - 1) * pageSize;

  const { rows, count } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password'] },
    order: [[sortBy, order.toUpperCase()]],
    limit: pageSize,
    offset,
  });

  return {
    list: rows,
    total: count,
    page,
    pageSize,
  };
};

export interface CreateUserParams {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  role?: 'user' | 'admin';
  status?: number;
}

export const createUser = async (data: CreateUserParams) => {
  const { username, password, email, phone, role = 'user', status = 1 } = data;

  // 唯一性检查
  const existed = await User.findOne({ where: { username } });
  if (existed) throw new Error('用户名已存在');
  if (email) {
    const existedEmail = await User.findOne({ where: { email } });
    if (existedEmail) throw new Error('邮箱已被使用');
  }
  if (phone) {
    const existedPhone = await User.findOne({ where: { phone } });
    if (existedPhone) throw new Error('手机号已被使用');
  }

  const hashed = await hashPassword(password);
  const user = await User.create({ username, password: hashed, email, phone, role, status });
  const plain = user.get({ plain: true }) as any;
  delete plain.password;
  return plain;
};

export interface UpdateUserParams {
  email?: string;
  phone?: string;
  status?: number;
  role?: 'user' | 'admin';
}

export const updateUser = async (id: number, data: UpdateUserParams) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error('用户不存在');

  const updates: any = {};
  if (typeof data.email !== 'undefined') updates.email = data.email;
  if (typeof data.phone !== 'undefined') updates.phone = data.phone;
  if (typeof data.status !== 'undefined') updates.status = data.status;
  if (typeof data.role !== 'undefined') updates.role = data.role;

  // 唯一性检查
  if (updates.email) {
    const existedEmail = await User.findOne({ where: { email: updates.email, id: { [Op.ne]: id } } });
    if (existedEmail) throw new Error('邮箱已被使用');
  }
  if (updates.phone) {
    const existedPhone = await User.findOne({ where: { phone: updates.phone, id: { [Op.ne]: id } } });
    if (existedPhone) throw new Error('手机号已被使用');
  }

  await user.update(updates);
  const plain = user.get({ plain: true }) as any;
  delete plain.password;
  return plain;
};

export const setUserStatus = async (id: number, status: number) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error('用户不存在');
  await user.update({ status });
  const plain = user.get({ plain: true }) as any;
  delete plain.password;
  return plain;
};

export const setUserRole = async (id: number, role: 'user' | 'admin') => {
  const user = await User.findByPk(id);
  if (!user) throw new Error('用户不存在');
  await user.update({ role });
  const plain = user.get({ plain: true }) as any;
  delete plain.password;
  return plain;
};

export const resetUserPassword = async (id: number, newPassword: string) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error('用户不存在');
  const hashed = await hashPassword(newPassword);
  await user.update({ password: hashed });
  return true;
};

export const getUserById = async (id: number) => {
  const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
  if (!user) throw new Error('用户不存在');
  return user;
};


