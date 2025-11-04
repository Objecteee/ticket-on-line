import React, { useEffect, useState } from 'react';
import { App, Avatar, Button, Form, Input, Space, Tag, Typography } from 'antd';
import { MessageOutlined, UserOutlined, SendOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { fetchMessages, createMessage, type Message } from '@/api/message';
import { useAuth } from '@/store/AuthContext';
import dayjs from 'dayjs';
import '@/styles/apple-theme.css';
import './index.less';

const { TextArea } = Input;

const MessagesPage: React.FC = () => {
  const { message } = App.useApp();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await fetchMessages({ page, pageSize });
      setMessages(data.list);
      setTotal(data.total);
    } catch (e) {
      message.error((e as Error).message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [page, pageSize]);

  const onSubmit = async () => {
    try {
      const vals = await form.validateFields();
      setSubmitting(true);
      await createMessage(vals.content);
      message.success('留言已提交，等待审核');
      form.resetFields();
      await load();
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return;
      message.error((e as Error).message || '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusTag = (msg: Message) => {
    if (msg.status === 'approved') return <Tag color="success" icon={<CheckCircleOutlined />}>已通过</Tag>;
    if (msg.status === 'rejected') return <Tag color="error" icon={<CloseCircleOutlined />}>已拒绝</Tag>;
    return <Tag color="default" icon={<ClockCircleOutlined />}>待审核</Tag>;
  };

  return (
    <div className="messages-page apple-fade-in">
      <div className="page-header">
        <h1 className="page-title">留言板</h1>
        <p className="page-subtitle">发布留言、查看其他用户留言、管理员回复</p>
      </div>

      <div className="message-form-card apple-card">
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Form.Item
            name="content"
            rules={[{ required: true, max: 500, message: '留言内容不能超过500字' }]}
            style={{ marginBottom: 16 }}
          >
            <TextArea
              placeholder="写下您的留言..."
              rows={4}
              maxLength={500}
              showCount
              className="apple-input"
              style={{ fontSize: 15, resize: 'none' }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              icon={<SendOutlined />}
              className="apple-button apple-button-primary"
            >
              发布留言
            </Button>
          </Form.Item>
        </Form>
      </div>

      <div className="messages-list">
        {messages.map((msg) => (
          <div key={msg.id} className="message-card apple-card">
            <div className="message-header">
              <Avatar icon={<UserOutlined />} className="message-avatar" />
              <div className="message-meta">
                <span className="message-username">{msg.username}</span>
                {msg.user_id === user?.id && getStatusTag(msg)}
                <span className="message-time">{dayjs(msg.created_at).format('YYYY-MM-DD HH:mm')}</span>
              </div>
            </div>
            <div className="message-content">
              {msg.content}
            </div>
            {msg.reply && (
              <div className="message-reply">
                <div className="reply-header">
                  <span className="reply-label">管理员回复</span>
                  {msg.reply_time && (
                    <span className="reply-time">{dayjs(msg.reply_time).format('YYYY-MM-DD HH:mm')}</span>
                  )}
                </div>
                <div className="reply-content">{msg.reply}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {messages.length === 0 && !loading && (
        <div className="empty-state">
          <MessageOutlined className="empty-icon" />
          <p>暂无留言</p>
        </div>
      )}

      {total > pageSize && (
        <div className="load-more">
          <Button
            onClick={() => setPage(p => p + 1)}
            disabled={page * pageSize >= total}
            className="apple-button apple-button-secondary"
          >
            加载更多
          </Button>
        </div>
      )}
    </div>
  );
};

export default function Page() {
  return (
    <App>
      <MessagesPage />
    </App>
  );
}
