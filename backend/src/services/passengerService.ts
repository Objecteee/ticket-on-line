import Passenger from '../models/Passenger';

export const listPassengers = async (user_id: number) => {
  return Passenger.findAll({ where: { user_id }, order: [['is_default', 'DESC'], ['created_at', 'DESC']] });
};

export const createPassenger = async (user_id: number, data: { name: string; id_card: string; phone?: string }) => {
  return Passenger.create({ user_id, name: data.name, id_card: data.id_card, phone: data.phone || null });
};

export const updatePassenger = async (user_id: number, id: number, data: { name?: string; id_card?: string; phone?: string }) => {
  const p = await Passenger.findByPk(id);
  if (!p || p.user_id !== user_id) throw new Error('乘车人不存在');
  await p.update({ name: data.name ?? p.name, id_card: data.id_card ?? p.id_card, phone: data.phone ?? p.phone });
  return p;
};

export const deletePassenger = async (user_id: number, id: number) => {
  const p = await Passenger.findByPk(id);
  if (!p || p.user_id !== user_id) throw new Error('乘车人不存在');
  await p.destroy();
  return true;
};

export const setDefaultPassenger = async (user_id: number, id: number) => {
  const p = await Passenger.findByPk(id);
  if (!p || p.user_id !== user_id) throw new Error('乘车人不存在');
  await Passenger.update({ is_default: 0 }, { where: { user_id } });
  await p.update({ is_default: 1 });
  return true;
};

export const clearDefaultPassenger = async (user_id: number) => {
  await Passenger.update({ is_default: 0 }, { where: { user_id } });
  return true;
};


