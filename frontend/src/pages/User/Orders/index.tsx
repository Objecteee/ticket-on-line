import React, { useEffect, useState } from 'react';
import { App, Button, Form, Input, Modal, Select, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import type { Order, OrderStatus } from '@/api/order';
import { fetchMyOrders, fetchMyOrderDetail, cancelMyOrder, refundMyOrder } from '@/api/userOrder';
import '@/styles/apple-theme.css';
import './index.less';

const statusColor: Record<OrderStatus, string> = {
  pending: 'default',
  paid: 'processing',
  completed: 'success',
  refunded: 'blue',
  cancelled: 'error',
};

const statusText: Record<OrderStatus, string> = {
  pending: '待支付',
  paid: '已支付',
  completed: '已完成',
  refunded: '已退款',
  cancelled: '已取消',
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
          <div className="order-detail-modal">
            <div className="detail-row">
              <span>车次：</span>
              <strong>{data.train_number}</strong>
            </div>
            <div className="detail-row">
              <span>出行日期：</span>
              <strong>{data.travel_date}</strong>
            </div>
            <div className="detail-row">
              <span>座位：</span>
              <strong>{data.seat_type} × {data.ticket_count}</strong>
            </div>
            <div className="detail-row">
              <span>单价/总价：</span>
              <strong>¥{data.ticket_price} / ¥{data.total_amount}</strong>
            </div>
            <div className="detail-row">
              <span>状态：</span>
              <Tag color={statusColor[data.order_status]}>{statusText[data.order_status]}</Tag>
            </div>
            {data.payment_time && (
              <div className="detail-row">
                <span>支付时间：</span>
                <strong>{dayjs(data.payment_time).format('YYYY-MM-DD HH:mm:ss')}</strong>
              </div>
            )}
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

  return (
    <div className="orders-page apple-fade-in">
      <div className="page-header">
        <h1 className="page-title">我的订单</h1>
        <p className="page-subtitle">查看订单详情、申请退款、取消订单</p>
      </div>

      <div className="filter-card apple-card">
        <Form layout="inline" form={filterForm} onFinish={onSearch}>
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
              <Button type="primary" htmlType="submit" className="apple-button apple-button-primary">查询</Button>
              <Button onClick={() => { filterForm.resetFields(); setFilters({}); setPage(1); }} className="apple-button apple-button-secondary">重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </div>

      <div className="orders-list">
        {loading && (
          <div className="loading-state">
            <p>加载中...</p>
          </div>
        )}
        {!loading && data.length === 0 && (
          <div className="empty-state">
            <p>暂无订单</p>
          </div>
        )}
        {!loading && data.map((order) => (
          <div key={order.id} className="order-card apple-card">
            <div className="order-header">
              <div className="order-number">{order.order_number}</div>
              <Tag color={statusColor[order.order_status]} className="order-status">
                {statusText[order.order_status]}
              </Tag>
            </div>
            <div className="order-content">
              <div className="order-info">
                <div className="info-item">
                  <span className="info-label">车次</span>
                  <span className="info-value">{order.train_number}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">出行日期</span>
                  <span className="info-value">{order.travel_date}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">座位</span>
                  <span className="info-value">{order.seat_type} × {order.ticket_count}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">金额</span>
                  <span className="info-value price">¥{order.total_amount}</span>
                </div>
              </div>
            </div>
            <div className="order-actions">
              <Button type="link" onClick={() => void viewDetail(order.id)} className="action-btn">详情</Button>
              <Button type="link" disabled={order.order_status !== 'paid'} onClick={() => void doCancel(order)} className="action-btn">取消</Button>
              <Button type="link" disabled={!(order.order_status === 'paid' || order.order_status === 'completed')} onClick={() => void doRefund(order)} className="action-btn">退款</Button>
            </div>
          </div>
        ))}
      </div>

      {total > pageSize && (
        <div className="pagination">
          <Button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="apple-button apple-button-secondary"
          >
            上一页
          </Button>
          <span className="page-info">第 {page} 页 / 共 {Math.ceil(total / pageSize)} 页</span>
          <Button
            disabled={page * pageSize >= total}
            onClick={() => setPage(p => p + 1)}
            className="apple-button apple-button-secondary"
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
};

export default function Page() {
  return (
    <App>
      <OrdersPage />
    </App>
  );
}
