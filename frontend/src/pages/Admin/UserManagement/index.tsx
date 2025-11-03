import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, Select, Space, Table, Tag, App, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { fetchUsers, createUser, updateUser, updateUserStatus, updateUserRole, resetUserPassword } from '@/api/admin';
import { User } from '@/types/user';

const { confirm } = Modal;

const UserManagement: React.FC = () => {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useState<Record<string, any>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await fetchUsers({ page, pageSize, ...filters });
      setDataSource(data.list);
      setTotal(data.total);
    } catch (e: any) {
      message.error(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filters]);

  const columns: ColumnsType<User> = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '用户名', dataIndex: 'username' },
    { title: '邮箱', dataIndex: 'email' },
    { title: '手机号', dataIndex: 'phone' },
    {
      title: '角色',
      dataIndex: 'role',
      render: (role: User['role']) => (
        <Tag color={role === 'admin' ? 'processing' : 'default'}>{role}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (v: number) => (v === 1 ? <Tag color="success">启用</Tag> : <Tag color="error">禁用</Tag>),
    },
    {
      title: '操作',
      fixed: 'right',
      width: 320,
      render: (_, record) => (
        <Space size={8} wrap>
          <Button type="link" onClick={() => onEdit(record)}>编辑</Button>
          <Button type="link" onClick={() => onChangeRole(record)}>
            设为{record.role === 'admin' ? '用户' : '管理员'}
          </Button>
          <Button type="link" onClick={() => onToggleStatus(record)}>
            {record.status === 1 ? '禁用' : '启用'}
          </Button>
          <Button type="link" danger onClick={() => onResetPassword(record)}>重置密码</Button>
        </Space>
      ),
    },
  ];

  const onSearch = () => {
    const values = form.getFieldsValue();
    setPage(1);
    setFilters(values);
  };

  const onCreate = () => {
    let modalIns: any;
    const formIns = Form.useFormInstance?.() as any;
    modalIns = modal.confirm({
      title: '创建用户',
      icon: null,
      content: (
        <Form layout="vertical" form={formIns} initialValues={{ role: 'user', status: 1 }}>
          <Form.Item name="username" label="用户名" rules={[{ required: true }, { min: 3, max: 20 }]}>
            <Input placeholder="用户名" allowClear />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true }, { min: 6, max: 20 }]}>
            <Input.Password placeholder="初始密码" allowClear />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ type: 'email', warningOnly: true }]}>
            <Input placeholder="邮箱（可选）" allowClear />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ pattern: /^1[3-9]\d{9}$/ }]}>
            <Input placeholder="手机号（可选）" allowClear />
          </Form.Item>
          <Form.Item name="role" label="角色">
            <Select options={[{ value: 'user', label: '用户' }, { value: 'admin', label: '管理员' }]} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[{ value: 1, label: '启用' }, { value: 0, label: '禁用' }]} />
          </Form.Item>
        </Form>
      ),
      okText: '创建',
      cancelText: '取消',
      onOk: async () => {
        try {
          const values = await (formIns as any).validateFields();
          await createUser(values);
          message.success('创建成功');
          await loadData();
        } catch {
          return Promise.reject();
        }
      },
    });
  };

  const onEdit = (record: User) => {
    let formRef: any;
    modal.confirm({
      title: `编辑用户：${record.username}`,
      icon: null,
      content: (
        <Form
          layout="vertical"
          initialValues={{ email: record.email, phone: record.phone, status: record.status, role: record.role }}
          ref={(node) => (formRef = node)}
        >
          <Form.Item name="email" label="邮箱" rules={[{ type: 'email', warningOnly: true }]}>
            <Input placeholder="邮箱（可选）" allowClear />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ pattern: /^1[3-9]\d{9}$/ }]}>
            <Input placeholder="手机号（可选）" allowClear />
          </Form.Item>
          <Form.Item name="role" label="角色">
            <Select options={[{ value: 'user', label: '用户' }, { value: 'admin', label: '管理员' }]} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[{ value: 1, label: '启用' }, { value: 0, label: '禁用' }]} />
          </Form.Item>
        </Form>
      ),
      okText: '保存',
      cancelText: '取消',
      onOk: async () => {
        try {
          const values = await (formRef as any).validateFields();
          await updateUser(record.id, values);
          message.success('保存成功');
          await loadData();
        } catch {
          return Promise.reject();
        }
      },
    });
  };

  const onToggleStatus = (record: User) => {
    const nextStatus = record.status === 1 ? 0 : 1;
    confirm({
      title: `确认${nextStatus === 1 ? '启用' : '禁用'}该用户？`,
      onOk: async () => {
        await updateUserStatus(record.id, nextStatus as 0 | 1);
        message.success('已更新状态');
        await loadData();
      },
    });
  };

  const onChangeRole = (record: User) => {
    const nextRole = record.role === 'admin' ? 'user' : 'admin';
    confirm({
      title: `确认将其设为${nextRole === 'admin' ? '管理员' : '用户'}？`,
      onOk: async () => {
        await updateUserRole(record.id, nextRole);
        message.success('已更新角色');
        await loadData();
      },
    });
  };

  const onResetPassword = (record: User) => {
    let fp: any;
    modal.confirm({
      title: `重置密码：${record.username}`,
      icon: null,
      content: (
        <Form layout="vertical" ref={(n) => (fp = n)}>
          <Form.Item name="password" label="新密码" rules={[{ required: true }, { min: 6, max: 20 }]}>
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
        </Form>
      ),
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          const values = await (fp as any).validateFields();
          await resetUserPassword(record.id, values.password);
          message.success('密码已重置');
        } catch {
          return Promise.reject();
        }
      },
    });
  };

  return (
    <Card
      title="用户管理"
      extra={<Button type="primary" onClick={onCreate}>新建用户</Button>}
      styles={{ body: { paddingTop: 8 } as any }}
    >
      <Form
        form={form}
        layout="inline"
        onFinish={onSearch}
        initialValues={{ role: undefined, status: undefined }}
        style={{ marginBottom: 12 }}
      >
        <Form.Item name="keyword">
          <Input allowClear placeholder="用户名/邮箱/手机号" style={{ width: 220 }} />
        </Form.Item>
        <Form.Item name="role" label="角色">
          <Select allowClear style={{ width: 140 }} options={[{ value: 'user', label: '用户' }, { value: 'admin', label: '管理员' }]} />
        </Form.Item>
        <Form.Item name="status" label="状态">
          <Select allowClear style={{ width: 140 }} options={[{ value: 1, label: '启用' }, { value: 0, label: '禁用' }]} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">查询</Button>
            <Button onClick={() => { form.resetFields(); setPage(1); setFilters({}); }}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <Table<User>
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
        scroll={{ x: 900 }}
      />
    </Card>
  );
};

export default function Page() {
  return (
    <App>
      <UserManagement />
    </App>
  );
}


