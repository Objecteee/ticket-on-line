import React, { useState } from 'react';
import { App, Button, Card, DatePicker, Descriptions, Form, Input, InputNumber, Modal, Radio, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { searchTickets, type TicketItem, getTicketDetail, type TicketDetailResponse } from '@/api/ticket';
import { createOrder } from '@/api/order';
import { fetchPassengers, type Passenger } from '@/api/passenger';

const { Title } = Typography;

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

  const columns: ColumnsType<TicketItem> = [
    { title: '车次', dataIndex: 'train_number', width: 120 },
    { title: '出发站', dataIndex: 'departure_station' },
    { title: '到达站', dataIndex: 'arrival_station' },
    { title: '出发时间', dataIndex: 'departure_time', width: 110 },
    { title: '到达时间', dataIndex: 'arrival_time', width: 110 },
    { title: '票价(¥)', dataIndex: 'price_from', width: 120, render: (v) => <span>{v} 起</span> },
    { title: '是否有票', dataIndex: 'has_ticket', width: 110, render: (v) => (v ? <Tag color="success">有票</Tag> : <Tag color="error">无票</Tag>) },
    { title: '操作', width: 120, fixed: 'right', render: (_, record) => (
      <Button
        type="link"
        disabled={!record.has_ticket}
        onClick={async () => {
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
            // 加载乘车人并优先选中默认
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
        }}
      >去订票</Button>
    ) },
  ];

  const onSearch = async () => {
    try {
      const values = await form.validateFields();
      const params: any = {
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

  return (
    <Card variant="borderless">
      <Title level={4} style={{ marginTop: 0 }}>车票查询</Title>
      <Form form={form} layout="inline" onFinish={onSearch} style={{ marginBottom: 12 }}>
        <Form.Item name="date" label="日期" rules={[{ required: true }]}>
          <DatePicker />
        </Form.Item>
        <Form.Item name="departure" label="出发站" rules={[{ required: true }]}>
          <Input placeholder="出发站" allowClear />
        </Form.Item>
        <Form.Item name="arrival" label="到达站" rules={[{ required: true }]}>
          <Input placeholder="到达站" allowClear />
        </Form.Item>
        <Form.Item name="train_number" label="车次号">
          <Input placeholder="可选" allowClear />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>查询</Button>
            <Button onClick={() => { form.resetFields(); setData([]); }}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <Table<TicketItem>
        rowKey={(r) => `${r.train_id}`}
        loading={loading}
        columns={columns}
        dataSource={data}
        size="middle"
        bordered={false}
      />
      <Modal
        title="订票"
        open={bookOpen}
        onCancel={() => setBookOpen(false)}
        confirmLoading={bookLoading}
        onOk={async () => {
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
        }}
        width={720}
      >
        <Card variant="borderless" loading={bookLoading} bodyStyle={{ padding: 0 }}>
          {detail && (
            <>
              <Descriptions column={2} size="small" style={{ marginBottom: 12 }}>
                <Descriptions.Item label="车次">{detail.train_number}</Descriptions.Item>
                <Descriptions.Item label="出行日期">{bookMeta?.date}</Descriptions.Item>
                <Descriptions.Item label="出发">{detail.departure_station} {detail.departure_time}</Descriptions.Item>
                <Descriptions.Item label="到达">{detail.arrival_station} {detail.arrival_time}</Descriptions.Item>
              </Descriptions>
              <Form form={bookForm} layout="vertical">
                <Form.Item label="选择乘车人">
                  <Select
                    mode="multiple"
                    value={selectedPassengerIds}
                    onChange={(ids) => { setSelectedPassengerIds(ids as number[]); if ((ids as number[]).length) bookForm.setFieldsValue({ count: (ids as number[]).length }); }}
                    style={{ width: '100%' }}
                    placeholder="可多选，未选择则使用下方临时录入"
                    options={passengerList.map(p => ({ value: p.id, label: p.is_default ? `${p.name}（默认）` : p.name }))}
                  />
                </Form.Item>
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
                <Form.Item name="count" label="张数" rules={[{ required: true, type: 'number', min: 1 }]} initialValue={1} extra="若选择了乘车人，将自动等于选择人数">
                  <InputNumber min={1} max={9} disabled={selectedPassengerIds.length > 0} />
                </Form.Item>
                <Form.Item name="passenger_name" label="临时录入：姓名" rules={[{ required: selectedPassengerIds.length === 0 }]}>
                  <Input placeholder="未选择乘车人时必填" disabled={selectedPassengerIds.length > 0} />
                </Form.Item>
                <Form.Item name="passenger_id_card" label="临时录入：证件号" rules={[{ required: selectedPassengerIds.length === 0 }]}>
                  <Input placeholder="未选择乘车人时必填" disabled={selectedPassengerIds.length > 0} />
                </Form.Item>
              </Form>
            </>
          )}
        </Card>
      </Modal>
    </Card>
  );
};

export default function Page() {
  return (
    <App>
      <TicketSearchPage />
    </App>
  );
}


