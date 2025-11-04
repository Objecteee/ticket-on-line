import React, { useEffect, useState } from 'react';
import { App, Avatar, Button, Form, Input, Space, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getProfile, updateProfile } from '@/api/account';
import '@/styles/apple-theme.css';
import './index.less';

const ProfilePage: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<{ username?: string; email?: string; phone?: string }>({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getProfile();
      setUserInfo({ username: data.username, email: data.email, phone: data.phone });
      form.setFieldsValue({ username: data.username, email: data.email, phone: data.phone });
    } catch (e) {
      message.error((e as Error).message || '加载资料失败');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const onSave = async () => {
    try {
      const vals = await form.validateFields();
      setLoading(true);
      await updateProfile(vals);
      message.success('已保存');
      await load();
    } catch (e) {
      message.error((e as Error).message || '保存失败');
    } finally { setLoading(false); }
  };

  return (
    <div className="profile-page apple-fade-in">
      <div className="profile-header">
        <Avatar
          size={100}
          icon={<UserOutlined />}
          className="profile-avatar"
        />
        <h1 className="profile-username">{userInfo.username || '用户'}</h1>
      </div>

      <div className="profile-form-card apple-card">
        <Form form={form} layout="vertical" onFinish={onSave}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, min: 3, max: 20, message: '用户名长度为3-20位' }]}
          >
            <Input placeholder="请输入用户名" className="apple-input" disabled={loading} />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
          >
            <Input placeholder="name@example.com" className="apple-input" disabled={loading} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入有效的11位手机号' }]}
          >
            <Input placeholder="请输入11位手机号" maxLength={11} className="apple-input" disabled={loading} />
          </Form.Item>

          <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
            <Space size={12} style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => void load()}
                disabled={loading}
                className="apple-button apple-button-secondary"
              >
                取消
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="apple-button apple-button-primary"
              >
                保存
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <App>
      <ProfilePage />
    </App>
  );
}
