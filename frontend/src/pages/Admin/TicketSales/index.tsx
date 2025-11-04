import React, { useEffect, useState } from 'react';
import { App, Button, Card, DatePicker, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { fetchTicketSales, createTicketSale, updateTicketSale, deleteTicketSale, exportTicketSalesCsv, type TicketSale } from '@/api/ticketSale';

const { Title } = Typography;

const TicketSalesPage: React.FC = () => {
  const { message: antdMessage } = App.useApp();
  const [filterForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [createForm] = Form.useForm();
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<TicketSale[]>([]);
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
        params.startDate = dayjs(s).format('YYYY-MM-DD');
        params.endDate = dayjs(e).format('YYYY-MM-DD');
        delete params.dateRange;
      }
      const { data } = await fetchTicketSales(params as { [k: string]: unknown });
      setDataSource(data.list);
      setTotal(data.total);
    } catch (e) {
      antdMessage.error((e as Error).message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, [page, pageSize, filters]);

  const columns: ColumnsType<TicketSale> = [
    { title: '日期', dataIndex: 'sale_date', width: 120 },
    { title: '车次', dataIndex: 'train_number', width: 120 },
    { title: '到站', dataIndex: 'destination', width: 120 },
    { title: '座位', dataIndex: 'seat_type', width: 100 },
    { title: '张数', dataIndex: 'ticket_count', width: 90 },
    { title: '实收(¥)', dataIndex: 'actual_amount', width: 120 },
    {
      title: '操作',
      fixed: 'right',
      width: 220,
      render: (_, record) => (
        <Space size={8}>
          <Button type="link" onClick={() => onEdit(record)}>编辑</Button>
          <Popconfirm title="确认删除该记录？" okText="删除" okButtonProps={{ danger: true }} cancelText="取消" onConfirm={() => onDelete(record)}>
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const onSearch = () => {
    const values = filterForm.getFieldsValue();
    setPage(1);
    setFilters(values);
  };

  const onCreate = () => {
    createForm.resetFields();
    setCreateOpen(true);
  };

  const handleCreateOk = async () => {
    const values = await createForm.validateFields();
    values.sale_date = dayjs(values.sale_date).format('YYYY-MM-DD');
    await createTicketSale(values);
    message.success('创建成功');
    setCreateOpen(false);
    await loadData();
  };

  const onEdit = (record: TicketSale) => {
    editForm.resetFields();
    editForm.setFieldsValue({ ...record, sale_date: dayjs(record.sale_date) });
    Modal.confirm({
      title: '编辑售票记录',
      icon: null,
      content: (
        <Form layout="vertical" form={editForm}>
          <Form.Item name="sale_date" label="日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="train_number" label="车次" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="destination" label="到站" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="seat_type" label="座位" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="ticket_count" label="张数" rules={[{ type: 'number', min: 1 }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="actual_amount" label="实收(¥)" rules={[{ pattern: /^\d+(\.\d{1,2})?$/, message: '金额格式不正确' }]}>
            <Input />
          </Form.Item>
        </Form>
      ),
      okText: '保存',
      cancelText: '取消',
      onOk: async () => {
        const values = await editForm.validateFields();
        values.sale_date = dayjs(values.sale_date).format('YYYY-MM-DD');
        await updateTicketSale(record.id, values as Partial<TicketSale>);
        message.success('保存成功');
        await loadData();
      },
    });
  };

  const onDelete = async (record: TicketSale) => {
    await deleteTicketSale(record.id);
    message.success('删除成功');
    await loadData();
  };

  const onExportCsv = async () => {
    const params = filterForm.getFieldsValue();
    const resp = await exportTicketSalesCsv(params as unknown as Record<string, unknown>);
    const blob = new Blob([resp as any], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ticket_sales.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card title={<Title level={4} style={{ margin: 0 }}>售票管理</Title>} variant="borderless" extra={<Space><Button onClick={onExportCsv}>导出CSV</Button><Button type="primary" onClick={onCreate}>新建记录</Button></Space>}>
      <Form form={filterForm} layout="inline" onFinish={onSearch} style={{ marginBottom: 12 }}>
        <Form.Item name="dateRange" label="日期">
          <DatePicker.RangePicker />
        </Form.Item>
        <Form.Item name="train_number" label="车次">
          <Input allowClear placeholder="车次号" />
        </Form.Item>
        <Form.Item name="destination" label="到站">
          <Input allowClear placeholder="到站名" />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">查询</Button>
            <Button onClick={() => { filterForm.resetFields(); setPage(1); setFilters({}); }}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <Table<TicketSale>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={{ current: page, pageSize, total, showSizeChanger: true, onChange: (p, ps) => { setPage(p); setPageSize(ps); }, showTotal: t => `共 ${t} 条` }}
        size="middle"
        variant="borderless"
        scroll={{ x: 1000 }}
      />

      <Modal title="新建售票记录" open={createOpen} onOk={handleCreateOk} onCancel={() => setCreateOpen(false)} okText="创建" cancelText="取消" destroyOnHidden>
        <Form layout="vertical" form={createForm} preserve={false}>
          <Form.Item name="sale_date" label="日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="train_number" label="车次" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="destination" label="到站" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="seat_type" label="座位" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="ticket_count" label="张数" rules={[{ type: 'number', min: 1 }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="actual_amount" label="实收(¥)" rules={[{ pattern: /^\d+(\.\d{1,2})?$/, message: '金额格式不正确' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default function Page() {
  return (
    <App>
      <TicketSalesPage />
    </App>
  );
}