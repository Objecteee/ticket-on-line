import React, { useEffect, useMemo, useState } from 'react';
import { App, Button, Card, Descriptions, Form, Input, InputNumber, Radio, Space, Typography } from 'antd';
import { useSearchParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getTicketDetail, type TicketDetailResponse } from '@/api/ticket';
import { createOrder } from '@/api/order';

const { Title } = Typography;

const seatLabels: Record<string, string> = {
  business: '商务座',
  first: '一等座',
  second: '二等座',
};

const BookPage: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<TicketDetailResponse | null>(null);

  const date = searchParams.get('date') || dayjs().format('YYYY-MM-DD');
  const train_id = Number(searchParams.get('train_id') || 0);
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';

  const loadDetail = async () => {
    if (!train_id || !date || !from || !to) return;
    setLoading(true);
    try {
      const { data } = await getTicketDetail({ train_id, date, from, to });
      setDetail(data);
      const firstAvailable = data.seats.find(s => s.available > 0);
      form.setFieldsValue({ seat_type: firstAvailable?.seat_type, count: 1 });
    } catch (e) {
      message.error((e as Error).message || '加载失败');
    } finally { setLoading(false); }
  };

  useEffect(() => { void loadDetail(); }, [train_id, date, from, to]);

  const maxCount = useMemo(() => {
    const st = form.getFieldValue('seat_type');
    const item = detail?.seats.find(s => s.seat_type === st);
    return Math.min(9, Math.max(0, item?.available || 0));
  }, [detail, form]);

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createOrder({
        train_id,
        date,
        from,
        to,
        seat_type: values.seat_type,
        count: values.count,
        passenger_name: values.passenger_name,
        passenger_id_card: values.passenger_id_card,
      });
      message.success('下单成功');
      navigate('/user/home');
    } catch (e) {
      if (e) message.error((e as Error).message || '下单失败');
    }
  };

  return (
    <Card variant="borderless" loading={loading}>
      <Title level={4} style={{ marginTop: 0 }}>订票</Title>
      {detail && (
        <>
          <Descriptions column={2} size="small" style={{ marginBottom: 12 }}>
            <Descriptions.Item label="车次">{detail.train_number}</Descriptions.Item>
            <Descriptions.Item label="出行日期">{date}</Descriptions.Item>
            <Descriptions.Item label="出发">{detail.departure_station} {detail.departure_time}</Descriptions.Item>
            <Descriptions.Item label="到达">{detail.arrival_station} {detail.arrival_time}</Descriptions.Item>
          </Descriptions>

          <Form form={form} layout="vertical">
            <Form.Item name="seat_type" label="座位类型" rules={[{ required: true }]}>
              <Radio.Group>
                <Space size={16} wrap>
                  {detail.seats.map(s => (
                    <Radio key={s.seat_type} value={s.seat_type} disabled={s.available <= 0}>
                      {seatLabels[s.seat_type]}（¥{s.price}，余{Math.max(0, s.available)}）
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </Form.Item>
            <Form.Item name="count" label="张数" rules={[{ required: true, type: 'number', min: 1 }]} initialValue={1}>
              <InputNumber min={1} max={Math.max(1, maxCount)} />
            </Form.Item>
            <Form.Item name="passenger_name" label="乘车人姓名" rules={[{ required: true }]}>
              <Input placeholder="请输入姓名" />
            </Form.Item>
            <Form.Item name="passenger_id_card" label="证件号" rules={[{ required: true }]}>
              <Input placeholder="请输入身份证号" />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" onClick={onSubmit}>提交订单</Button>
                <Button onClick={() => navigate(-1)}>返回</Button>
              </Space>
            </Form.Item>
          </Form>
        </>
      )}
    </Card>
  );
};

export default function Page() {
  return (
    <App>
      <BookPage />
    </App>
  );
}


