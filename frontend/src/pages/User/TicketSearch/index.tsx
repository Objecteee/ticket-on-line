import React, { useState } from 'react';
import { App, Button, DatePicker, Form, Input, InputNumber, Modal, Radio, Select, Space } from 'antd';
import dayjs from 'dayjs';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { searchTickets, type TicketItem, getTicketDetail, type TicketDetailResponse } from '@/api/ticket';
import { createOrder } from '@/api/order';
import { fetchPassengers, type Passenger } from '@/api/passenger';
import '@/styles/user-theme.css';
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
    <div className="search-page-apple">
      {/* 搜索区域 */}
      <div className="search-section apple-card apple-fade-in-up">
        <h2 className="section-title">搜索车票</h2>
        <Form form={form} layout="vertical" onFinish={onSearch} style={{ marginTop: 32 }}>
          <div className="search-form-grid">
            <Form.Item name="date" label="出行日期" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} size="large" />
            </Form.Item>
            <Form.Item name="departure" label="出发站" rules={[{ required: true }]}>
              <Input size="large" placeholder="出发站" allowClear />
            </Form.Item>
            <Form.Item name="arrival" label="到达站" rules={[{ required: true }]}>
              <Input size="large" placeholder="到达站" allowClear />
            </Form.Item>
            <Form.Item name="train_number" label="车次号（可选）">
              <Input size="large" placeholder="如 G1234" allowClear />
            </Form.Item>
          </div>
          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={loading} size="large" className="btn-apple">
              查询车票
            </Button>
          </Form.Item>
        </Form>
      </div>

      {/* 结果区域 */}
      {data.length > 0 && (
        <div className="results-section apple-fade-in-up" style={{ marginTop: 48 }}>
          <h2 className="section-title">查询结果</h2>
          <div className="tickets-list">
            {data.map((item) => (
              <div key={item.train_id} className="ticket-item apple-card">
                <div className="ticket-header">
                  <div className="train-number">{item.train_number}</div>
                  <div className={`ticket-status ${item.has_ticket ? 'available' : 'unavailable'}`}>
                    {item.has_ticket ? (
                      <>
                        <CheckCircleOutlined /> 有票
                      </>
                    ) : (
                      <>
                        <CloseCircleOutlined /> 无票
                      </>
                    )}
                  </div>
                </div>
                
                <div className="ticket-route">
                  <div className="route-station">
                    <div className="station-time">{item.departure_time}</div>
                    <div className="station-name">{item.departure_station}</div>
                  </div>
                  <div className="route-separator">—</div>
                  <div className="route-station">
                    <div className="station-time">{item.arrival_time}</div>
                    <div className="station-name">{item.arrival_station}</div>
                  </div>
                </div>

                <div className="ticket-footer">
                  <div className="ticket-price">
                    <span className="price-label">票价</span>
                    <span className="price-value">¥{item.price_from}</span>
                    <span className="price-unit">起</span>
                  </div>
                  <Button
                    type="primary"
                    size="large"
                    disabled={!item.has_ticket}
                    onClick={() => void handleBook(item)}
                    className="btn-apple"
                  >
                    立即订票
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.length === 0 && !loading && (
        <div className="empty-state apple-fade-in-up">
          <p className="empty-text">请输入查询条件并点击查询</p>
        </div>
      )}

      {/* 订票弹窗 */}
      <Modal
        title="选择座位与乘车人"
        open={bookOpen}
        onCancel={() => setBookOpen(false)}
        onOk={onSubmitOrder}
        confirmLoading={bookLoading}
        width={640}
        okText="确认下单"
        cancelText="取消"
      >
        {detail && (
          <div className="booking-content">
            <div className="booking-info">
              <div className="info-row">
                <span className="info-label">车次</span>
                <span className="info-value">{detail.train_number}</span>
              </div>
              <div className="info-row">
                <span className="info-label">出行日期</span>
                <span className="info-value">{bookMeta?.date}</span>
              </div>
              <div className="info-row">
                <span className="info-label">路线</span>
                <span className="info-value">{detail.departure_station} {detail.departure_time} → {detail.arrival_station} {detail.arrival_time}</span>
              </div>
            </div>
            
            <Form form={bookForm} layout="vertical" style={{ marginTop: 32 }}>
              <Form.Item label="选择乘车人">
                <Select
                  mode="multiple"
                  value={selectedPassengerIds}
                  onChange={(ids) => { setSelectedPassengerIds(ids as number[]); if ((ids as number[]).length) bookForm.setFieldsValue({ count: (ids as number[]).length }); }}
                  placeholder="可多选，未选择则使用下方临时录入"
                  size="large"
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
                <InputNumber min={1} max={9} disabled={selectedPassengerIds.length > 0} style={{ width: '100%' }} size="large" />
              </Form.Item>
              <Form.Item name="passenger_name" label="临时录入：姓名" rules={[{ required: selectedPassengerIds.length === 0 }]}>
                <Input placeholder="未选择乘车人时必填" disabled={selectedPassengerIds.length > 0} size="large" />
              </Form.Item>
              <Form.Item name="passenger_id_card" label="临时录入：证件号" rules={[{ required: selectedPassengerIds.length === 0 }]}>
                <Input placeholder="未选择乘车人时必填" disabled={selectedPassengerIds.length > 0} size="large" />
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
