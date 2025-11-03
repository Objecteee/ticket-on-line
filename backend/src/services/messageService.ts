import { Op } from 'sequelize';
import Message, { MessageStatus } from '../models/Message';

export interface MessageListParams {
  page?: number;
  pageSize?: number;
  user_id?: number;
  status?: MessageStatus;
}

export const listMessages = async (params: MessageListParams) => {
  const { page = 1, pageSize = 10, user_id, status } = params;
  const where: any = {};
  if (user_id) where.user_id = user_id;
  if (status) where.status = status;

  const offset = (page - 1) * pageSize;
  const { rows, count } = await Message.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: pageSize,
    offset,
  });
  return { list: rows, total: count, page, pageSize };
};

export const createMessage = async (user_id: number, username: string, content: string) => {
  if (!content || content.trim().length === 0) throw new Error('留言内容不能为空');
  if (content.length > 500) throw new Error('留言内容不能超过500字');
  return Message.create({ user_id, username, content, status: 'pending' });
};

export const getMessageById = async (id: number) => {
  const msg = await Message.findByPk(id);
  if (!msg) throw new Error('留言不存在');
  return msg;
};

export const approveMessage = async (id: number) => {
  const msg = await Message.findByPk(id);
  if (!msg) throw new Error('留言不存在');
  await msg.update({ status: 'approved' });
  return msg;
};

export const rejectMessage = async (id: number) => {
  const msg = await Message.findByPk(id);
  if (!msg) throw new Error('留言不存在');
  await msg.update({ status: 'rejected' });
  return msg;
};

export const replyMessage = async (id: number, reply: string) => {
  const msg = await Message.findByPk(id);
  if (!msg) throw new Error('留言不存在');
  if (!reply || reply.trim().length === 0) throw new Error('回复内容不能为空');
  if (reply.length > 500) throw new Error('回复内容不能超过500字');
  await msg.update({ reply, reply_time: new Date(), status: 'approved' });
  return msg;
};

export const deleteMessage = async (id: number) => {
  const msg = await Message.findByPk(id);
  if (!msg) throw new Error('留言不存在');
  await msg.destroy();
  return true;
};

