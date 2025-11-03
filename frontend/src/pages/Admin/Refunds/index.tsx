import React, { useEffect, useState } from 'react';
import { App, Button, Card, DatePicker, Form, Input, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { fetchRefunds, type Refund } from '@/api/refund';

const { Title } = Typography;

const RefundsPage: React.FC = () => {
  const { message } = App.useApp();
  const [filterForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Refund[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, pageSize, ...filters };
      if (params.dateRange) {
        const [s, e] = params.dateRange as [dayjs.Dayjs, dayjs.Dayjs];
        params.startDate = dayjs(s).format('YYYY-MM-DD');
        params.endDate = dayjs(e).format('YYYY-MM-DD');
        delete params.dateRange;
      }
      const { data } = await fetchRefunds(params as any);
      setDataSource(data.list);
      setTotal(data.total);
    } catch (e) {
      message.error((e as Error).message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, [page, pageSize, filters]);

  const columns: ColumnsType<Refund> = [
    { title: '创建时间', dataIndex: 'created_at', width: 160 },
    { title: '订单ID', dataIndex: 'order_id', width: 100 },
    { title: '车次', dataIndex: 'train_number', width: 120 },
    { title: '座位', dataIndex: 'seat_type', width: 100 },
    { title: '目的地', dataIndex: 'destination', width: 120 },
    { title: '票价(¥)', dataIndex: 'ticket_price', width: 120 },
    { title: '数量', dataIndex: 'ticket_count', width: 80 },
    { title: '手续费率(%)', dataIndex: 'service_fee_rate', width: 120 },
    { title: '手续费(¥)', dataIndex: 'service_fee', width: 120 },
    { title: '退款金额(¥)', dataIndex: 'refund_amount', width: 130 },
  ];

  const onSearch = () => {
    const values = filterForm.getFieldsValue();
    setPage(1);
    setFilters(values);
  };

  return (
    <Card title={<Title level={4} style={{ margin: 0 }}>退票管理</Title>} bordered={false}>
      <Form form={filterForm} layout="inline" onFinish={onSearch} style={{ marginBottom: 12 }}>
        <Form.Item name="dateRange" label="日期"> <DatePicker.RangePicker /> </Form.Item>
        <Form.Item name="train_number" label="车次"> <Input allowClear /> </Form.Item>
        <Form.Item name="destination" label="目的地"> <Input allowClear /> </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">查询</Button>
            <Button onClick={() => { filterForm.resetFields(); setPage(1); setFilters({}); }}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <Table<Refund>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={{ current: page, pageSize, total, showSizeChanger: true, onChange: (p, ps) => { setPage(p); setPageSize(ps); }, showTotal: t => `共 ${t} 条` }}
        size="middle"
        bordered={false}
        scroll={{ x: 1200 }}
      />
    </Card>
  );
};

export default function Page() {
  return (
    <App>
      <RefundsPage />
    </App>
  );
}


