import React, { useEffect, useState } from 'react';
import { App, Button, Card, Form, Input, Modal, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { createPassenger, deletePassenger, fetchPassengers, setDefaultPassenger, updatePassenger, clearDefaultPassenger, type Passenger } from '@/api/passenger';

const { Title } = Typography;

const PassengersPage: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Passenger[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await fetchPassengers();
      setData(data);
    } catch (e) {
      message.error((e as Error).message || '加载失败');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const onCreate = () => {
    form.resetFields();
    Modal.confirm({
      title: '新增乘车人',
      icon: null,
      content: (
        <Form layout="vertical" form={form}>
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="id_card" label="证件号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input />
          </Form.Item>
        </Form>
      ),
      okText: '保存',
      onOk: async () => {
        const vals = await form.validateFields();
        await createPassenger(vals);
        message.success('已新增');
        await load();
      },
    });
  };

  const onEdit = (p: Passenger) => {
    form.setFieldsValue(p);
    Modal.confirm({
      title: `编辑乘车人：${p.name}`,
      icon: null,
      content: (
        <Form layout="vertical" form={form}>
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="id_card" label="证件号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input />
          </Form.Item>
        </Form>
      ),
      okText: '保存',
      onOk: async () => {
        const vals = await form.validateFields();
        await updatePassenger(p.id, vals);
        message.success('已保存');
        await load();
      },
    });
  };

  const setDefault = async (p: Passenger) => {
    await setDefaultPassenger(p.id);
    message.success('已设为默认');
    await load();
  };

  const clearDefault = async () => {
    await clearDefaultPassenger();
    message.success('已取消默认');
    await load();
  };

  const onDelete = async (p: Passenger) => {
    await deletePassenger(p.id);
    message.success('已删除');
    await load();
  };

  const columns: ColumnsType<Passenger> = [
    { title: '姓名', dataIndex: 'name', width: 140 },
    { title: '证件号', dataIndex: 'id_card' },
    { title: '手机号', dataIndex: 'phone', width: 160 },
    { title: '默认', dataIndex: 'is_default', width: 90, render: (v) => Number(v) === 1 ? <Tag color="success">默认</Tag> : <Tag>—</Tag> },
    { title: '操作', width: 220, fixed: 'right', render: (_, r) => (
      <Space size={8}>
        <Button type="link" onClick={() => onEdit(r)}>编辑</Button>
        {Number(r.is_default) === 1 ? (
          <Button type="link" onClick={() => void clearDefault()}>取消默认</Button>
        ) : (
          <Button type="link" onClick={() => void setDefault(r)}>设为默认</Button>
        )}
        <Button type="link" danger onClick={() => void onDelete(r)}>删除</Button>
      </Space>
    ) },
  ];

  return (
    <Card variant="borderless" title={<Title level={4} style={{ margin: 0 }}>乘车人管理</Title>} extra={<Button type="primary" onClick={onCreate}>新增</Button>}>
      <Table<Passenger>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        size="middle"
        variant="borderless"
      />
    </Card>
  );
};

export default function Page() {
  return (
    <App>
      <PassengersPage />
    </App>
  );
}


