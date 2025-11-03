import React, { useEffect, useState } from 'react';
import { App, Button, Card, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { fetchOrders, fetchOrderDetail, cancelOrder, refundOrder, type Order, type OrderStatus } from '@/api/order';

const { Title } = Typography;

const OrdersPage: React.FC = () => {
  const { message: antdMessage } = App.useApp();
  const [filterForm] = Form.useForm();
  const [refundForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const loadData = async (): Promise<void> => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, pageSize, ...filters };
      if (params.dateRange) {
        const [s, e] = params.dateRange as [dayjs.Dayjs, dayjs.Dayjs];
        params.travel_date_start = dayjs(s).format('YYYY-MM-DD');
        params.travel_date_end = dayjs(e).format('YYYY-MM-DD');
        delete params.dateRange;
      }
      const { data } = await fetchOrders(params as any);
      setDataSource(data.list);
      setTotal(data.total);
    } catch (e) {
      antdMessage.error((e as Error).message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, [page, pageSize, filters]);

  const columns: ColumnsType<Order> = [
    { title: '订单号', dataIndex: 'order_number', width: 180 },
    { title: '车次', dataIndex: 'train_number', width: 110 },
    { title: '出行日期', dataIndex: 'travel_date', width: 120 },
    { title: '座位', dataIndex: 'seat_type', width: 100 },
    { title: '张数', dataIndex: 'ticket_count', width: 80 },
    { title: '金额(¥)', dataIndex: 'total_amount', width: 120 },
    {
      title: '状态', dataIndex: 'order_status', width: 110, render: (s: OrderStatus) => {
        const map: Record<OrderStatus, any> = {
          pending: { color: 'default', text: '待支付' },
          paid: { color: 'processing', text: '已支付' },
          completed: { color: 'success', text: '已出行' },
          refunded: { color: 'warning', text: '已退票' },
          cancelled: { color: 'error', text: '已取消' },
        };
        const m = map[s];
        return <Tag color={m.color}>{m.text}</Tag>;
      }
    },
    {
      title: '操作', fixed: 'right', width: 260, render: (_, record) => (
        <Space size={8}>
          <Button type="link" onClick={() => onDetail(record)}>详情</Button>
          {record.order_status !== 'cancelled' && record.order_status !== 'refunded' && (
            <Popconfirm title="确认取消该订单？" onConfirm={() => onCancel(record)} okText="取消订单" cancelText="返回">
              <Button type="link" danger>取消</Button>
            </Popconfirm>
          )}
          {record.order_status === 'paid' && (
            <Button type="link" onClick={() => onRefund(record)}>退款</Button>
          )}
        </Space>
      )
    }
  ];

  const onSearch = () => {
    const values = filterForm.getFieldsValue();
    setPage(1);
    setFilters(values);
  };

  const onDetail = async (record: Order) => {
    const { data } = await fetchOrderDetail(record.id);
    Modal.info({
      title: '订单详情',
      width: 520,
      content: (
        <div>
          <p>订单号：{data.order_number}</p>
          <p>车次：{data.train_number}</p>
          <p>出行日期：{data.travel_date}</p>
          <p>座位：{data.seat_type}</p>
          <p>张数：{data.ticket_count}</p>
          <p>金额(¥)：{data.total_amount}</p>
          <p>状态：{data.order_status}</p>
        </div>
      )
    });
  };

  const onCancel = async (record: Order) => {
    await cancelOrder(record.id);
    message.success('订单已取消');
    await loadData();
  };

  const onRefund = (record: Order) => {
    refundForm.resetFields();
    Modal.confirm({
      title: `订单退款：${record.order_number}`,
      icon: null,
      content: (
        <Form layout="vertical" form={refundForm}>
          <Form.Item name="service_fee_rate" label="手续费率(%)" rules={[{ required: true }]}> 
            <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="如 10 表示10%" />
          </Form.Item>
          <Form.Item name="refund_reason" label="退款原因"> <Input /> </Form.Item>
          <Form.Item name="destination" label="目的地"> <Input /> </Form.Item>
          <Form.Item name="route" label="线路"> <Input /> </Form.Item>
          <Form.Item name="vehicle_type" label="车型"> <Input /> </Form.Item>
        </Form>
      ),
      okText: '退款',
      cancelText: '取消',
      onOk: async () => {
        const values = await refundForm.validateFields();
        values.service_fee_rate = Number(values.service_fee_rate);
        await refundOrder(record.id, values);
        message.success('退款成功');
        await loadData();
      }
    });
  };

  return (
    <Card title={<Title level={4} style={{ margin: 0 }}>订单管理</Title>} bordered={false}>
      <Form form={filterForm} layout="inline" onFinish={onSearch} style={{ marginBottom: 12 }}>
        <Form.Item name="order_number" label="订单号"> <Input allowClear placeholder="支持模糊" /> </Form.Item>
        <Form.Item name="train_number" label="车次"> <Input allowClear /> </Form.Item>
        <Form.Item name="order_status" label="状态">
          <Select allowClear style={{ width: 160 }} options={[
            { value: 'pending', label: '待支付' },
            { value: 'paid', label: '已支付' },
            { value: 'completed', label: '已出行' },
            { value: 'refunded', label: '已退票' },
            { value: 'cancelled', label: '已取消' },
          ]} />
        </Form.Item>
        <Form.Item name="dateRange" label="出行日期"> <DatePicker.RangePicker /> </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">查询</Button>
            <Button onClick={() => { filterForm.resetFields(); setPage(1); setFilters({}); }}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <Table<Order>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={{ current: page, pageSize, total, showSizeChanger: true, onChange: (p, ps) => { setPage(p); setPageSize(ps); }, showTotal: t => `共 ${t} 条` }}
        size="middle"
        bordered={false}
        scroll={{ x: 1100 }}
      />
    </Card>
  );
};

export default function Page() {
  return (
    <App>
      <OrdersPage />
    </App>
  );
}


