import request from '@/utils/request';

export interface Passenger {
  id: number;
  name: string;
  id_card: string;
  phone?: string;
  is_default: number;
}

export const fetchPassengers = () => request.get<Passenger[]>('/user/passengers');
export const createPassenger = (data: { name: string; id_card: string; phone?: string }) => request.post('/user/passengers', data);
export const updatePassenger = (id: number, data: Partial<{ name: string; id_card: string; phone?: string }>) => request.put(`/user/passengers/${id}`, data);
export const deletePassenger = (id: number) => request.delete(`/user/passengers/${id}`);
export const setDefaultPassenger = (id: number) => request.post(`/user/passengers/${id}/default`);
export const clearDefaultPassenger = () => request.post('/user/passengers/default/clear');


