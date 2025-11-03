import React, { useEffect, useState } from 'react';
import { App, Avatar, Button, Card, Form, Input, Modal, Space, Tag, Typography } from 'antd';
import { MessageOutlined, UserOutlined, SendOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { fetchMessages, createMessage, type Message } from '@/api/message';
import { useAuth } from '@/store/AuthContext';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
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
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Title level={3} style={{ marginBottom: 32, fontWeight: 400, fontSize: 28 }}>
        留言板
      </Title>

      {/* 发布留言表单 */}
      <Card
        variant="borderless"
        style={{
          marginBottom: 32,
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e8e8e8',
        }}
      >
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
              style={{
                fontSize: 15,
                borderRadius: 8,
                border: '1px solid #d2d2d7',
                resize: 'none',
              }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              icon={<SendOutlined />}
              style={{
                borderRadius: 22,
                height: 40,
                paddingLeft: 24,
                paddingRight: 24,
              }}
            >
              发布留言
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 留言列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg) => (
          <Card
            key={msg.id}
            variant="borderless"
            style={{
              borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e8e8e8',
            }}
            bodyStyle={{ padding: '20px 24px' }}
          >
            <div style={{ display: 'flex', gap: 16 }}>
              <Avatar
                icon={<UserOutlined />}
                style={{ backgroundColor: '#f5f5f5', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <Text strong style={{ fontSize: 15 }}>
                    {msg.username}
                  </Text>
                  {msg.user_id === user?.id && getStatusTag(msg)}
                  <Text type="secondary" style={{ fontSize: 13, marginLeft: 'auto' }}>
                    {dayjs(msg.created_at).format('YYYY-MM-DD HH:mm')}
                  </Text>
                </div>
                <Paragraph
                  style={{
                    marginBottom: msg.reply ? 16 : 0,
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: '#1d1d1f',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.content}
                </Paragraph>
                {msg.reply && (
                  <div
                    style={{
                      background: '#f5f5f7',
                      borderRadius: 8,
                      padding: '12px 16px',
                      marginTop: 12,
                      borderLeft: '3px solid #0071e3',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Text strong style={{ fontSize: 13, color: '#0071e3' }}>
                        管理员回复
                      </Text>
                      {msg.reply_time && (
                        <Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>
                          {dayjs(msg.reply_time).format('YYYY-MM-DD HH:mm')}
                        </Text>
                      )}
                    </div>
                    <Text style={{ fontSize: 14, color: '#1d1d1f', whiteSpace: 'pre-wrap' }}>
                      {msg.reply}
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {messages.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '64px 24px', color: '#86868b' }}>
          <MessageOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }} />
          <Text type="secondary">暂无留言</Text>
        </div>
      )}

      {total > pageSize && (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Button
            onClick={() => setPage(p => p + 1)}
            disabled={page * pageSize >= total}
            style={{ borderRadius: 22, height: 40, paddingLeft: 24, paddingRight: 24 }}
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

