import React, { useEffect, useState } from 'react';
import { App, Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, TimePicker, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { fetchTrains, createTrain, updateTrain, deleteTrain, type Train } from '@/api/train';
import { getTrainStops, saveTrainStops, type TrainStopDTO } from '@/api/trainStop';

const { Title } = Typography;

const TrainManagement: React.FC = () => {
  const { message } = App.useApp();
  const [filterForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [createForm] = Form.useForm();
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<Train[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [stopModalOpen, setStopModalOpen] = useState(false);
  const [currentTrain, setCurrentTrain] = useState<Train | null>(null);
  const [stops, setStops] = useState<TrainStopDTO[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await fetchTrains({ page, pageSize, ...filters });
      setDataSource(data.list);
      setTotal(data.total);
    } catch (e) {
      message.error((e as Error).message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, [page, pageSize, filters]);

  const columns: ColumnsType<Train> = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: '车次号', dataIndex: 'train_number', width: 120 },
    { title: '始发站', dataIndex: 'departure_station' },
    { title: '终点站', dataIndex: 'arrival_station' },
    { title: '发车时间', dataIndex: 'departure_time', width: 110 },
    { title: '到达时间', dataIndex: 'arrival_time', width: 110 },
    { title: '车型', dataIndex: 'vehicle_type', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v: number) => (v === 1 ? <Tag color="success">运营</Tag> : <Tag color="error">停运</Tag>),
    },
    {
      title: '操作',
      fixed: 'right',
      width: 240,
      render: (_, record) => (
        <Space size={8}>
          <Button type="link" onClick={() => onEdit(record)}>编辑</Button>
          <Button type="link" onClick={() => onManageStops(record)}>管理站点</Button>
          <Popconfirm
            title={`删除车次：${record.train_number}`}
            description="确认删除？该操作不可恢复"
            okText="删除"
            okButtonProps={{ danger: true }}
            cancelText="取消"
            onConfirm={() => onDelete(record)}
          >
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const onSearch = () => {
    const values = filterForm.getFieldsValue();
    setPage(1);
    setFilters(values);
  };

  const onCreate = () => {
    createForm.resetFields();
    createForm.setFieldsValue({ status: 1 });
    setCreateOpen(true);
  };

  const handleCreateOk = async () => {
    try {
      const values = await createForm.validateFields();
      // 时间规范化
      if (values.departure_time) values.departure_time = dayjs(values.departure_time).format('HH:mm:ss');
      if (values.arrival_time) values.arrival_time = dayjs(values.arrival_time).format('HH:mm:ss');
      await createTrain(values);
      message.success('创建成功');
      setCreateOpen(false);
      await loadData();
    } catch {}
  };

  const onEdit = (record: Train) => {
    editForm.resetFields();
    editForm.setFieldsValue({
      ...record,
      departure_time: dayjs(record.departure_time, 'HH:mm:ss'),
      arrival_time: dayjs(record.arrival_time, 'HH:mm:ss'),
    });
    Modal.confirm({
      title: `编辑车次：${record.train_number}`,
      icon: null,
      content: (
        <Form layout="vertical" form={editForm}>
          <Form.Item name="departure_station" label="始发站" rules={[{ required: true }]}>
            <Input placeholder="始发站" />
          </Form.Item>
          <Form.Item name="arrival_station" label="终点站" rules={[{ required: true }]}>
            <Input placeholder="终点站" />
          </Form.Item>
          <Form.Item name="departure_time" label="发车时间" rules={[{ required: true }]}>
            <TimePicker format="HH:mm:ss" />
          </Form.Item>
          <Form.Item name="arrival_time" label="到达时间" rules={[{ required: true }]}>
            <TimePicker format="HH:mm:ss" />
          </Form.Item>
          <Form.Item name="vehicle_type" label="车型">
            <Input placeholder="如 G/D/K 或车型名" />
          </Form.Item>
          <Form.Item name="total_seats_business" label="商务座" rules={[{ type: 'number', min: 0 }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="total_seats_first" label="一等座" rules={[{ type: 'number', min: 0 }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="total_seats_second" label="二等座" rules={[{ type: 'number', min: 0 }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="price_business" label="商务价(¥)">
            <Input placeholder="如 199.00" />
          </Form.Item>
          <Form.Item name="price_first" label="一等价(¥)">
            <Input placeholder="如 129.00" />
          </Form.Item>
          <Form.Item name="price_second" label="二等价(¥)">
            <Input placeholder="如 99.00" />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select options={[{ value: 1, label: '运营' }, { value: 0, label: '停运' }]} />
          </Form.Item>
        </Form>
      ),
      okText: '保存',
      cancelText: '取消',
      onOk: async () => {
        const values = await editForm.validateFields();
        values.departure_time = dayjs(values.departure_time).format('HH:mm:ss');
        values.arrival_time = dayjs(values.arrival_time).format('HH:mm:ss');
        await updateTrain(record.id, values);
        message.success('保存成功');
        await loadData();
      },
    });
  };

  const onDelete = async (record: Train) => {
    try {
      await deleteTrain(record.id);
      message.success('删除成功');
      await loadData();
    } catch (e) {
      message.error((e as Error).message || '删除失败');
    }
  };

  const onManageStops = async (record: Train) => {
    try {
      setCurrentTrain(record);
      const { data } = await getTrainStops(record.id);
      const list: TrainStopDTO[] = (data || []).map((s: any) => ({
        station_name: s.station_name,
        stop_order: s.stop_order,
        arrival_time: s.arrival_time,
        departure_time: s.departure_time,
      }));
      setStops(list);
      setStopModalOpen(true);
    } catch (e) {
      message.error((e as Error).message || '加载站点失败');
    }
  };

  const addStop = () => {
    const nextOrder = (stops[stops.length - 1]?.stop_order || 0) + 1;
    setStops([...stops, { station_name: '', stop_order: nextOrder, arrival_time: '00:00:00', departure_time: '00:00:00' }]);
  };

  const removeStop = (index: number) => {
    const next = stops.slice();
    next.splice(index, 1);
    setStops(next);
  };

  const updateStop = (index: number, key: keyof TrainStopDTO, value: any) => {
    const next = stops.slice();
    // 时间值可能是 dayjs 对象
    if (key === 'arrival_time' || key === 'departure_time') {
      value = dayjs(value).format('HH:mm:ss');
    }
    next[index] = { ...next[index], [key]: value } as TrainStopDTO;
    setStops(next);
  };

  const handleSaveStops = async () => {
    if (!currentTrain) return;
    const normalized = stops
      .map(s => ({ ...s, stop_order: Number(s.stop_order) }))
      .sort((a, b) => a.stop_order - b.stop_order);
    try {
      await saveTrainStops(currentTrain.id, normalized);
      message.success('站点已保存');
      setStopModalOpen(false);
    } catch (e) {
      message.error((e as Error).message || '保存失败');
    }
  };

  return (
    <Card title={<Title level={4} style={{ margin: 0 }}>车次管理</Title>} bordered={false} extra={<Button type="primary" onClick={onCreate}>新建车次</Button>}>
      <Form form={filterForm} layout="inline" onFinish={onSearch} style={{ marginBottom: 12 }}>
        <Form.Item name="keyword">
          <Input allowClear placeholder="车次/站名关键字" style={{ width: 240 }} />
        </Form.Item>
        <Form.Item name="vehicle_type" label="车型">
          <Input allowClear placeholder="G/D/K/车型" style={{ width: 160 }} />
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select allowClear style={{ width: 140 }} options={[{ value: 1, label: '运营' }, { value: 0, label: '停运' }]} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">查询</Button>
            <Button onClick={() => { filterForm.resetFields(); setPage(1); setFilters({}); }}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <Table<Train>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          showTotal: (t) => `共 ${t} 条`,
        }}
        size="middle"
        bordered={false}
        scroll={{ x: 1200 }}
      />

      <Modal title="新建车次" open={createOpen} onOk={handleCreateOk} onCancel={() => setCreateOpen(false)} okText="创建" cancelText="取消" destroyOnClose>
        <Form layout="vertical" form={createForm} preserve={false}>
          <Form.Item name="train_number" label="车次号" rules={[{ required: true }]}>
            <Input placeholder="如 G1234" />
          </Form.Item>
          <Form.Item name="departure_station" label="始发站" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="arrival_station" label="终点站" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="departure_time" label="发车时间" rules={[{ required: true }]}>
            <TimePicker format="HH:mm:ss" />
          </Form.Item>
          <Form.Item name="arrival_time" label="到达时间" rules={[{ required: true }]}>
            <TimePicker format="HH:mm:ss" />
          </Form.Item>
          <Form.Item name="vehicle_type" label="车型">
            <Input placeholder="如 G/D/K 或车型名" />
          </Form.Item>
          <Form.Item name="total_seats_business" label="商务座" rules={[{ type: 'number', min: 0 }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="total_seats_first" label="一等座" rules={[{ type: 'number', min: 0 }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="total_seats_second" label="二等座" rules={[{ type: 'number', min: 0 }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="price_business" label="商务价(¥)">
            <Input placeholder="如 199.00" />
          </Form.Item>
          <Form.Item name="price_first" label="一等价(¥)">
            <Input placeholder="如 129.00" />
          </Form.Item>
          <Form.Item name="price_second" label="二等价(¥)">
            <Input placeholder="如 99.00" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select options={[{ value: 1, label: '运营' }, { value: 0, label: '停运' }]} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={currentTrain ? `管理站点 - ${currentTrain.train_number}` : '管理站点'}
        open={stopModalOpen}
        onCancel={() => setStopModalOpen(false)}
        onOk={handleSaveStops}
        okText="保存"
        cancelText="取消"
        width={720}
      >
        <Table
          dataSource={stops.map((s, i) => ({ key: i, ...s }))}
          pagination={false}
          size="small"
          columns={[
            {
              title: '序号',
              dataIndex: 'stop_order',
              width: 80,
              render: (_: any, __: any, index: number) => (
                <InputNumber min={1} value={stops[index]?.stop_order} onChange={(v) => updateStop(index, 'stop_order', v || 1)} />
              ),
            },
            {
              title: '站名',
              dataIndex: 'station_name',
              render: (_: any, __: any, index: number) => (
                <Input value={stops[index]?.station_name} onChange={(e) => updateStop(index, 'station_name', e.target.value)} />
              ),
            },
            {
              title: '到达时间',
              dataIndex: 'arrival_time',
              render: (_: any, __: any, index: number) => (
                <TimePicker value={dayjs(stops[index]?.arrival_time, 'HH:mm:ss')} format="HH:mm:ss" onChange={(v) => updateStop(index, 'arrival_time', v)} />
              ),
            },
            {
              title: '发车时间',
              dataIndex: 'departure_time',
              render: (_: any, __: any, index: number) => (
                <TimePicker value={dayjs(stops[index]?.departure_time, 'HH:mm:ss')} format="HH:mm:ss" onChange={(v) => updateStop(index, 'departure_time', v)} />
              ),
            },
            {
              title: '操作',
              width: 90,
              render: (_: any, __: any, index: number) => (
                <Button danger type="link" onClick={() => removeStop(index)}>删除</Button>
              ),
            },
          ]}
          footer={() => (
            <Button onClick={addStop} type="dashed" block>新增站点</Button>
          )}
        />
      </Modal>
    </Card>
  );
};

export default function Page() {
  return (
    <App>
      <TrainManagement />
    </App>
  );
}


