import React, { useEffect, useState } from 'react';
import { App, Button, Card, Form, Input, Modal, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Order, OrderStatus } from '@/api/order';
import { fetchMyOrders, fetchMyOrderDetail, cancelMyOrder, refundMyOrder } from '@/api/userOrder';

const { Title } = Typography;

const statusColor: Record<OrderStatus, string> = {
  pending: 'default',
  paid: 'processing',
  completed: 'success',
  refunded: 'blue',
  cancelled: 'error',
};

const OrdersPage: React.FC = () => {
  const { message } = App.useApp();
  const [filterForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<{ order_status?: OrderStatus }>({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await fetchMyOrders({ page, pageSize, ...filters });
      setData(data.list);
      setTotal(data.total);
    } catch (e) {
      message.error((e as Error).message || '加载失败');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [page, pageSize, filters]);

  const onSearch = () => {
    const vals = filterForm.getFieldsValue();
    setFilters({ order_status: vals.order_status });
    setPage(1);
  };

  const viewDetail = async (orderId: number) => {
    try {
      const { data } = await fetchMyOrderDetail(orderId);
      Modal.info({
        title: `订单详情 ${data.order_number}`,
        okText: '关闭',
        width: 640,
        maskClosable: true,
        content: (
          <div>
            <p>车次：{data.train_number}</p>
            <p>出行日期：{data.travel_date}</p>
            <p>座位：{data.seat_type} × {data.ticket_count}</p>
            <p>单价/总价：¥{data.ticket_price} / ¥{data.total_amount}</p>
            <p>状态：{data.order_status}</p>
            {data.payment_time && <p>支付时间：{dayjs(data.payment_time).format('YYYY-MM-DD HH:mm:ss')}</p>}
          </div>
        ),
      });
    } catch (e) {
      message.error((e as Error).message || '获取详情失败');
    }
  };

  const doCancel = async (order: Order) => {
    try {
      await cancelMyOrder(order.id);
      message.success('已取消');
      await load();
    } catch (e) {
      message.error((e as Error).message || '取消失败');
    }
  };

  const doRefund = async (order: Order) => {
    Modal.confirm({
      title: `申请退款 - ${order.order_number}`,
      content: '确认申请退款？默认手续费率5%。',
      okText: '申请退款',
      onOk: async () => {
        try {
          await refundMyOrder(order.id, { service_fee_rate: 5, refund_reason: '用户申请退款' });
          message.success('已提交退款');
          await load();
        } catch (e) {
          message.error((e as Error).message || '退款失败');
        }
      },
    });
  };

  const columns: ColumnsType<Order> = [
    { title: '订单号', dataIndex: 'order_number', width: 180 },
    { title: '车次', dataIndex: 'train_number', width: 100 },
    { title: '出行日期', dataIndex: 'travel_date', width: 120 },
    { title: '座位', dataIndex: 'seat_type', width: 100 },
    { title: '张数', dataIndex: 'ticket_count', width: 80 },
    { title: '金额(¥)', dataIndex: 'total_amount', width: 110 },
    { title: '状态', dataIndex: 'order_status', width: 110, render: (v: OrderStatus) => <Tag color={statusColor[v]}>{v}</Tag> },
    {
      title: '操作',
      fixed: 'right',
      width: 220,
      render: (_, record) => (
        <Space size={8}>
          <Button type="link" onClick={() => void viewDetail(record.id)}>详情</Button>
          <Button type="link" disabled={record.order_status !== 'paid'} onClick={() => void doCancel(record)}>取消</Button>
          <Button type="link" disabled={!(record.order_status === 'paid' || record.order_status === 'completed')} onClick={() => void doRefund(record)}>退款</Button>
        </Space>
      ),
    },
  ];

  return (
    <Card variant="borderless">
      <Title level={4} style={{ marginTop: 0 }}>我的订单</Title>
      <Form layout="inline" form={filterForm} onFinish={onSearch} style={{ marginBottom: 12 }}>
        <Form.Item name="order_status" label="状态">
          <Select allowClear style={{ width: 160 }} options={[
            { value: 'pending', label: '待支付' },
            { value: 'paid', label: '已支付' },
            { value: 'completed', label: '已完成' },
            { value: 'refunded', label: '已退款' },
            { value: 'cancelled', label: '已取消' },
          ]} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">查询</Button>
            <Button onClick={() => { filterForm.resetFields(); setFilters({}); setPage(1); }}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <Table<Order>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          showTotal: (t) => `共 ${t} 条`,
        }}
        size="middle"
        variant="borderless"
        scroll={{ x: 900 }}
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


