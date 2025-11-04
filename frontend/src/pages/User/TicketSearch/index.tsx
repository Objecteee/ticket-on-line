import React, { useState } from 'react';
import { App, Button, DatePicker, Form, Input, InputNumber, Modal, Radio, Select, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import { searchTickets, type TicketItem, getTicketDetail, type TicketDetailResponse } from '@/api/ticket';
import { createOrder } from '@/api/order';
import { fetchPassengers, type Passenger } from '@/api/passenger';
import '@/styles/apple-theme.css';
import './index.less';

const TicketSearchPage: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [bookForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TicketItem[]>([]);
  const [bookOpen, setBookOpen] = useState(false);
  const [bookLoading, setBookLoading] = useState(false);
  const [detail, setDetail] = useState<TicketDetailResponse | null>(null);
  const [bookMeta, setBookMeta] = useState<{ train_id: number; date: string; from: string; to: string } | null>(null);
  const seatLabels: Record<string, string> = { business: '商务座', first: '一等座', second: '二等座' };
  const [passengerList, setPassengerList] = useState<Passenger[]>([]);
  const [selectedPassengerIds, setSelectedPassengerIds] = useState<number[]>([]);

  const onSearch = async () => {
    try {
      const values = await form.validateFields();
      const params: {
        date: string;
        departure: string;
        arrival: string;
        train_number?: string;
      } = {
        date: dayjs(values.date).format('YYYY-MM-DD'),
        departure: values.departure,
        arrival: values.arrival,
        train_number: values.train_number,
      };
      setLoading(true);
      const { data } = await searchTickets(params);
      setData(data);
    } catch (e) {
      message.error((e as Error).message || '查询失败');
    } finally { setLoading(false); }
  };

  const handleBook = async (record: TicketItem) => {
    try {
      const dateVal = form.getFieldValue('date');
      if (!dateVal) return;
      const meta = {
        train_id: record.train_id,
        date: dayjs(dateVal).format('YYYY-MM-DD'),
        from: record.departure_station,
        to: record.arrival_station,
      };
      setBookLoading(true);
      const { data } = await getTicketDetail(meta);
      setDetail(data);
      setBookMeta(meta);
      const firstAvailable = data.seats.find(s => s.available > 0);
      try {
        const resp = await fetchPassengers();
        setPassengerList(resp.data || []);
        const def = (resp.data || []).find((p: Passenger) => p.is_default === 1);
        if (def) setSelectedPassengerIds([def.id]);
      } catch (err) { void err; }
      bookForm.setFieldsValue({ seat_type: firstAvailable?.seat_type, count: 1, passenger_name: '', passenger_id_card: '' });
      setBookOpen(true);
    } catch (e) {
      message.error((e as Error).message || '加载详情失败');
    } finally {
      setBookLoading(false);
    }
  };

  const onSubmitOrder = async () => {
    if (!bookMeta) return;
    try {
      const values = await bookForm.validateFields();
      const chosen = passengerList.filter(p => selectedPassengerIds.includes(p.id)).map(p => ({ name: p.name, id_card: p.id_card }));
      await createOrder({
        train_id: bookMeta.train_id,
        date: bookMeta.date,
        from: bookMeta.from,
        to: bookMeta.to,
        seat_type: values.seat_type,
        count: chosen.length ? undefined : values.count,
        passengers: chosen.length ? chosen : undefined,
        passenger_name: chosen.length ? undefined : values.passenger_name,
        passenger_id_card: chosen.length ? undefined : values.passenger_id_card,
      });
      message.success('下单成功');
      setBookOpen(false);
    } catch (e) {
      if (e) message.error((e as Error).message || '下单失败');
    }
  };

  return (
    <div className="ticket-search-page apple-fade-in">
      <div className="page-header">
        <h1 className="page-title">车票查询</h1>
        <p className="page-subtitle">搜索车次、查看余票、在线订票</p>
      </div>

      <div className="search-card apple-card">
        <Form form={form} layout="vertical" onFinish={onSearch}>
          <div className="search-form-grid">
            <Form.Item name="date" label="出行日期" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
            </Form.Item>
            <Form.Item name="departure" label="出发站" rules={[{ required: true }]}>
              <Input placeholder="请输入出发站" allowClear />
            </Form.Item>
            <Form.Item name="arrival" label="到达站" rules={[{ required: true }]}>
              <Input placeholder="请输入到达站" allowClear />
            </Form.Item>
            <Form.Item name="train_number" label="车次号（可选）">
              <Input placeholder="车次号" allowClear />
            </Form.Item>
          </div>
          <Form.Item style={{ marginBottom: 0, marginTop: 16 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} className="apple-button apple-button-primary">
                查询
              </Button>
              <Button onClick={() => { form.resetFields(); setData([]); }} className="apple-button apple-button-secondary">
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>

      {data.length > 0 && (
        <div className="results-section">
          <h2 className="results-title">查询结果</h2>
          <div className="ticket-list">
            {data.map((item) => (
              <div key={item.train_id} className="ticket-card apple-card">
                <div className="ticket-main">
                  <div className="ticket-train">
                    <span className="ticket-number">{item.train_number}</span>
                    <Tag color={item.has_ticket ? 'success' : 'default'} className="ticket-status">
                      {item.has_ticket ? '有票' : '无票'}
                    </Tag>
                  </div>
                  <div className="ticket-route">
                    <div className="route-item">
                      <div className="route-time">{item.departure_time}</div>
                      <div className="route-station">{item.departure_station}</div>
                    </div>
                    <div className="route-arrow">→</div>
                    <div className="route-item">
                      <div className="route-time">{item.arrival_time}</div>
                      <div className="route-station">{item.arrival_station}</div>
                    </div>
                  </div>
                  <div className="ticket-price">
                    <span className="price-label">票价</span>
                    <span className="price-value">¥{item.price_from} 起</span>
                  </div>
                </div>
                <div className="ticket-action">
                  <Button
                    type="primary"
                    disabled={!item.has_ticket}
                    onClick={() => void handleBook(item)}
                    className="apple-button apple-button-primary"
                  >
                    去订票
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.length === 0 && !loading && (
        <div className="empty-state">
          <p>请输入查询条件并点击查询</p>
        </div>
      )}

      <Modal
        title="订票"
        open={bookOpen}
        onCancel={() => setBookOpen(false)}
        onOk={onSubmitOrder}
        confirmLoading={bookLoading}
        width={720}
        okText="确认下单"
        cancelText="取消"
      >
        {detail && (
          <div className="book-modal">
            <div className="book-info">
              <div className="info-row">
                <span>车次：</span>
                <strong>{detail.train_number}</strong>
              </div>
              <div className="info-row">
                <span>出行日期：</span>
                <strong>{bookMeta?.date}</strong>
              </div>
              <div className="info-row">
                <span>路线：</span>
                <strong>{detail.departure_station} {detail.departure_time} → {detail.arrival_station} {detail.arrival_time}</strong>
              </div>
            </div>
            <Form form={bookForm} layout="vertical" style={{ marginTop: 24 }}>
              <Form.Item label="选择乘车人">
                <Select
                  mode="multiple"
                  value={selectedPassengerIds}
                  onChange={(ids) => { setSelectedPassengerIds(ids as number[]); if ((ids as number[]).length) bookForm.setFieldsValue({ count: (ids as number[]).length }); }}
                  placeholder="可多选，未选择则使用下方临时录入"
                  options={passengerList.map(p => ({ value: p.id, label: p.is_default ? `${p.name}（默认）` : p.name }))}
                />
              </Form.Item>
              <Form.Item name="seat_type" label="座位类型" rules={[{ required: true }]}>
                <Radio.Group>
                  <Space direction="vertical" size={12}>
                    {detail.seats.map(s => (
                      <Radio key={s.seat_type} value={s.seat_type} disabled={s.available <= 0}>
                        {seatLabels[s.seat_type]}（¥{s.price}，余{Math.max(0, s.available)}）
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              </Form.Item>
              <Form.Item name="count" label="张数" rules={[{ required: true, type: 'number', min: 1 }]} initialValue={1} extra="若选择了乘车人，将自动等于选择人数">
                <InputNumber min={1} max={9} disabled={selectedPassengerIds.length > 0} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="passenger_name" label="临时录入：姓名" rules={[{ required: selectedPassengerIds.length === 0 }]}>
                <Input placeholder="未选择乘车人时必填" disabled={selectedPassengerIds.length > 0} />
              </Form.Item>
              <Form.Item name="passenger_id_card" label="临时录入：证件号" rules={[{ required: selectedPassengerIds.length === 0 }]}>
                <Input placeholder="未选择乘车人时必填" disabled={selectedPassengerIds.length > 0} />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default function Page() {
  return (
    <App>
      <TicketSearchPage />
    </App>
  );
}
