import React, { useEffect, useState } from 'react';
import { App, Avatar, Button, Form, Input, Space } from 'antd';
import { MessageOutlined, UserOutlined, SendOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { fetchMessages, createMessage, type Message } from '@/api/message';
import { useAuth } from '@/store/AuthContext';
import dayjs from 'dayjs';
import '@/styles/user-theme.css';
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
    if (msg.status === 'approved') return <span className="status-tag approved"><CheckCircleOutlined /> 已通过</span>;
    if (msg.status === 'rejected') return <span className="status-tag rejected"><CloseCircleOutlined /> 已拒绝</span>;
    return <span className="status-tag pending"><ClockCircleOutlined /> 待审核</span>;
  };

  return (
    <div className="messages-page-apple">
      <div className="page-header apple-fade-in-up">
        <h1 className="page-title">留言板</h1>
        <p className="page-subtitle">分享您的想法，与其他用户交流</p>
      </div>

      <div className="message-form-section apple-card apple-fade-in-up">
        <div className="form-header">
          <MessageOutlined className="form-icon" />
          <h2 className="form-title">发布留言</h2>
        </div>
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <Form.Item
            name="content"
            rules={[{ required: true, max: 500, message: '留言内容不能超过500字' }]}
            style={{ marginBottom: 16 }}
          >
            <TextArea
              placeholder="写下您的留言..."
              rows={5}
              maxLength={500}
              showCount
              style={{ fontSize: 15, resize: 'none', borderRadius: 12 }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              icon={<SendOutlined />}
              size="large"
              className="btn-apple"
            >
              发布留言
            </Button>
          </Form.Item>
        </Form>
      </div>

      <div className="messages-section">
        <h2 className="section-title">留言列表</h2>
        <div className="messages-list">
          {messages.map((msg, index) => (
            <div key={msg.id} className="message-item apple-card apple-fade-in-up" style={{ animationDelay: `${index * 0.03}s` }}>
              <div className="message-header">
                <Avatar
                  size={40}
                  icon={<UserOutlined />}
                  className="message-avatar"
                />
                <div className="message-meta">
                  <div className="message-user-info">
                    <span className="message-username">{msg.username}</span>
                    {msg.user_id === user?.id && getStatusTag(msg)}
                  </div>
                  <span className="message-time">{dayjs(msg.created_at).format('YYYY-MM-DD HH:mm')}</span>
                </div>
              </div>
              
              <div className="message-content">
                {msg.content}
              </div>
              
              {msg.reply && (
                <div className="message-reply">
                  <div className="reply-header">
                    <span className="reply-badge">管理员回复</span>
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
      </div>

      {messages.length === 0 && !loading && (
        <div className="empty-state apple-fade-in-up">
          <p className="empty-text">暂无留言，成为第一个留言的用户吧</p>
        </div>
      )}

      {total > pageSize && (
        <div className="load-more-section">
          <Button
            onClick={() => setPage(p => p + 1)}
            disabled={page * pageSize >= total}
            size="large"
            className="btn-apple-secondary"
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
