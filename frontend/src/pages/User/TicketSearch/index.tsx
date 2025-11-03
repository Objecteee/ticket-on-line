import React, { useState } from 'react';
import { App, Button, Card, DatePicker, Form, Input, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { searchTickets, type TicketItem } from '@/api/ticket';

const { Title } = Typography;

const TicketSearchPage: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TicketItem[]>([]);

  const columns: ColumnsType<TicketItem> = [
    { title: '车次', dataIndex: 'train_number', width: 120 },
    { title: '出发站', dataIndex: 'departure_station' },
    { title: '到达站', dataIndex: 'arrival_station' },
    { title: '出发时间', dataIndex: 'departure_time', width: 110 },
    { title: '到达时间', dataIndex: 'arrival_time', width: 110 },
    { title: '票价(¥)', dataIndex: 'price_from', width: 120, render: (v) => <span>{v} 起</span> },
    { title: '是否有票', dataIndex: 'has_ticket', width: 110, render: (v) => (v ? <Tag color="success">有票</Tag> : <Tag color="error">无票</Tag>) },
    { title: '操作', width: 120, fixed: 'right', render: (_, record) => (<Button type="link" disabled={!record.has_ticket}>去订票</Button>) },
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
    <Card bordered={false}>
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


