import React, { useEffect, useState } from 'react';
import { App, Button, Card, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchAdminMessages, approveMessage, rejectMessage, replyMessage, deleteMessage, type Message, type MessageStatus } from '@/api/message';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const MessagesPage: React.FC = () => {
  const { message: messageApi } = App.useApp();
  const [filterForm] = Form.useForm();
  const [replyForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Message[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<{ status?: MessageStatus }>({});
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await fetchAdminMessages({ page, pageSize, ...filters });
      setData(data.list);
      setTotal(data.total);
    } catch (e) {
      messageApi.error((e as Error).message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [page, pageSize, filters]);

  const onSearch = () => {
    const vals = filterForm.getFieldsValue();
    setFilters({ status: vals.status });
    setPage(1);
  };

  const handleApprove = async (msg: Message) => {
    try {
      await approveMessage(msg.id);
      messageApi.success('已审核通过');
      await load();
    } catch (e) {
      messageApi.error((e as Error).message || '操作失败');
    }
  };

  const handleReject = async (msg: Message) => {
    try {
      await rejectMessage(msg.id);
      messageApi.success('已拒绝');
      await load();
    } catch (e) {
      messageApi.error((e as Error).message || '操作失败');
    }
  };

  const handleReply = (msg: Message) => {
    setCurrentMessage(msg);
    replyForm.setFieldsValue({ reply: msg.reply || '' });
    setReplyModalOpen(true);
  };

  const onReplySubmit = async () => {
    if (!currentMessage) return;
    try {
      const vals = await replyForm.validateFields();
      await replyMessage(currentMessage.id, vals.reply);
      messageApi.success('已回复');
      setReplyModalOpen(false);
      await load();
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return;
      messageApi.error((e as Error).message || '回复失败');
    }
  };

  const handleDelete = async (msg: Message) => {
    try {
      await deleteMessage(msg.id);
      messageApi.success('已删除');
      await load();
    } catch (e) {
      messageApi.error((e as Error).message || '删除失败');
    }
  };

  const columns: ColumnsType<Message> = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: '用户名', dataIndex: 'username', width: 120 },
    {
      title: '留言内容',
      dataIndex: 'content',
      ellipsis: true,
      render: (text: string) => (
        <Text style={{ maxWidth: 300, display: 'block' }} ellipsis={{ tooltip: text }}>
          {text}
        </Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: MessageStatus) => {
        if (status === 'approved') return <Tag color="success" icon={<CheckCircleOutlined />}>已通过</Tag>;
        if (status === 'rejected') return <Tag color="error" icon={<CloseCircleOutlined />}>已拒绝</Tag>;
        return <Tag color="default" icon={<ClockCircleOutlined />}>待审核</Tag>;
      },
    },
    {
      title: '回复',
      dataIndex: 'reply',
      width: 120,
      render: (reply: string | null) => (reply ? <Tag color="blue">已回复</Tag> : <Text type="secondary">—</Text>),
    },
    { title: '发布时间', dataIndex: 'created_at', width: 160, render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm') },
    {
      title: '操作',
      fixed: 'right',
      width: 280,
      render: (_: any, record: Message) => (
        <Space size={8}>
          {record.status === 'pending' && (
            <>
              <Button type="link" size="small" onClick={() => void handleApprove(record)}>通过</Button>
              <Button type="link" size="small" danger onClick={() => void handleReject(record)}>拒绝</Button>
            </>
          )}
          <Button type="link" size="small" onClick={() => handleReply(record)}>回复</Button>
          <Popconfirm
            title="确认删除"
            description="删除后不可恢复"
            onConfirm={() => void handleDelete(record)}
            okText="删除"
            okButtonProps={{ danger: true }}
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card variant="borderless">
      <Title level={4} style={{ marginTop: 0 }}>留言管理</Title>
      <Form layout="inline" form={filterForm} onFinish={onSearch} style={{ marginBottom: 16 }}>
        <Form.Item name="status" label="状态">
          <Select
            allowClear
            style={{ width: 140 }}
            options={[
              { value: 'pending', label: '待审核' },
              { value: 'approved', label: '已通过' },
              { value: 'rejected', label: '已拒绝' },
            ]}
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">查询</Button>
            <Button onClick={() => { filterForm.resetFields(); setFilters({}); setPage(1); }}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <Table<Message>
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
        bordered={false}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={`回复留言 - ${currentMessage?.username}`}
        open={replyModalOpen}
        onCancel={() => setReplyModalOpen(false)}
        onOk={onReplySubmit}
        okText="回复"
        cancelText="取消"
        width={600}
      >
        <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>原留言：</Text>
          <Paragraph style={{ marginTop: 8, marginBottom: 0, fontSize: 14 }}>
            {currentMessage?.content}
          </Paragraph>
        </div>
        <Form form={replyForm} layout="vertical">
          <Form.Item
            name="reply"
            label="回复内容"
            rules={[{ required: true, max: 500, message: '回复内容不能超过500字' }]}
          >
            <TextArea rows={4} maxLength={500} showCount placeholder="请输入回复内容..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default function Page() {
  return (
    <App>
      <MessagesPage />
    </App>
  );
}

