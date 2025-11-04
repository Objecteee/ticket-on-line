import React, { useEffect, useState } from 'react';
import { App, Button, Form, Input, Modal, Select, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import { FileTextOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, DollarOutlined, EyeOutlined, CreditCardOutlined } from '@ant-design/icons';
import type { Order, OrderStatus } from '@/api/order';
import { fetchMyOrders, fetchMyOrderDetail, payMyOrder, cancelMyOrder, refundMyOrder } from '@/api/userOrder';
import '@/styles/user-theme.css';
import './index.less';

const statusConfig: Record<OrderStatus, { text: string; icon: React.ReactNode }> = {
  pending: { text: '待支付', icon: <ClockCircleOutlined /> },
  paid: { text: '已支付', icon: <CheckCircleOutlined /> },
  completed: { text: '已完成', icon: <CheckCircleOutlined /> },
  refunded: { text: '已退款', icon: <CloseCircleOutlined /> },
  cancelled: { text: '已取消', icon: <CloseCircleOutlined /> },
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
        title: '订单详情',
        okText: '关闭',
        width: 600,
        maskClosable: true,
        content: (
          <div className="order-detail-content">
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">订单号</span>
                <span className="detail-value">{data.order_number}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">车次</span>
                <span className="detail-value">{data.train_number}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">出行日期</span>
                <span className="detail-value">{data.travel_date}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">座位类型</span>
                <span className="detail-value">{data.seat_type}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">票数</span>
                <span className="detail-value">{data.ticket_count} 张</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">总金额</span>
                <span className="detail-value price">¥{data.total_amount}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">状态</span>
                <span className="detail-value">{statusConfig[data.order_status].text}</span>
              </div>
              {data.payment_time && (
                <div className="detail-item">
                  <span className="detail-label">支付时间</span>
                  <span className="detail-value">{dayjs(data.payment_time).format('YYYY-MM-DD HH:mm:ss')}</span>
                </div>
              )}
            </div>
          </div>
        ),
      });
    } catch (e) {
      message.error((e as Error).message || '获取详情失败');
    }
  };

  const doPay = async (order: Order) => {
    Modal.confirm({
      title: '确认支付',
      content: `确认支付订单 ${order.order_number}，金额 ¥${order.total_amount}？`,
      okText: '确认支付',
      onOk: async () => {
        try {
          await payMyOrder(order.id);
          message.success('支付成功');
          await load();
        } catch (e) {
          message.error((e as Error).message || '支付失败');
        }
      },
    });
  };

  const doCancel = async (order: Order) => {
    Modal.confirm({
      title: '确认取消',
      content: `确认取消订单 ${order.order_number}？`,
      okText: '确认取消',
      onOk: async () => {
        try {
          await cancelMyOrder(order.id);
          message.success('已取消');
          await load();
        } catch (e) {
          message.error((e as Error).message || '取消失败');
        }
      },
    });
  };

  const doRefund = async (order: Order) => {
    Modal.confirm({
      title: '申请退款',
      content: `确认申请退款订单 ${order.order_number}？默认手续费率5%。`,
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
    <div className="orders-page-apple">
      <div className="page-header apple-fade-in-up">
        <h1 className="page-title">我的订单</h1>
        <p className="page-subtitle">管理您的出行订单</p>
      </div>

      <div className="filter-section apple-card apple-fade-in-up">
        <Form layout="inline" form={filterForm} onFinish={onSearch}>
          <Form.Item name="order_status" label="订单状态">
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
              <Button type="primary" htmlType="submit" className="btn-apple">查询</Button>
              <Button onClick={() => { filterForm.resetFields(); setFilters({}); setPage(1); }} className="btn-apple-secondary">重置</Button>
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
          <div className="empty-state apple-fade-in-up">
            <p className="empty-text">暂无订单</p>
          </div>
        )}
        {!loading && data.map((order, index) => {
          const status = statusConfig[order.order_status];
          return (
            <div key={order.id} className="order-card apple-card apple-fade-in-up" style={{ animationDelay: `${index * 0.03}s` }}>
              <div className="order-card-header">
                <div className="order-number">
                  <FileTextOutlined />
                  <span>{order.order_number}</span>
                </div>
                <div className="order-status">
                  {status.icon}
                  <span>{status.text}</span>
                </div>
              </div>
              
              <div className="order-card-body">
                <div className="order-info-grid">
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
                    <span className="info-value">{order.seat_type}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">票数</span>
                    <span className="info-value">{order.ticket_count} 张</span>
                  </div>
                  <div className="info-item price-item">
                    <span className="info-label">总金额</span>
                    <span className="info-value price">
                      <DollarOutlined />
                      {order.total_amount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="order-card-footer">
                <Space>
                  <Button icon={<EyeOutlined />} onClick={() => void viewDetail(order.id)} className="btn-apple-secondary">查看详情</Button>
                  {order.order_status === 'pending' && (
                    <>
                      <Button type="primary" icon={<CreditCardOutlined />} onClick={() => void doPay(order)} className="btn-apple">立即支付</Button>
                      <Button onClick={() => void doCancel(order)} className="btn-apple-secondary">取消订单</Button>
                    </>
                  )}
                  {(order.order_status === 'paid' || order.order_status === 'completed') && (
                    <Button onClick={() => void doRefund(order)} className="btn-apple">申请退款</Button>
                  )}
                </Space>
              </div>
            </div>
          );
        })}
      </div>

      {total > pageSize && (
        <div className="pagination-section">
          <Button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-apple-secondary">上一页</Button>
          <span className="page-info">第 {page} 页 / 共 {Math.ceil(total / pageSize)} 页</span>
          <Button disabled={page * pageSize >= total} onClick={() => setPage(p => p + 1)} className="btn-apple-secondary">下一页</Button>
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
