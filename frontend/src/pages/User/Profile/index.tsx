import React, { useEffect, useState } from 'react';
import { App, Avatar, Button, Form, Input, Space } from 'antd';
import { UserOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { getProfile, updateProfile } from '@/api/account';
import '@/styles/user-theme.css';
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
    <div className="profile-page-apple">
      <div className="profile-header apple-fade-in-up">
        <Avatar
          size={100}
          icon={<UserOutlined />}
          className="profile-avatar"
        />
        <h1 className="profile-username">{userInfo.username || '用户'}</h1>
        <p className="profile-subtitle">管理您的个人信息</p>
      </div>

      <div className="profile-form-section apple-card apple-fade-in-up">
        <h2 className="form-title">个人资料</h2>
        
        <Form form={form} layout="vertical" onFinish={onSave} style={{ marginTop: 32 }}>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, min: 3, max: 20, message: '用户名长度为3-20位' }]}
          >
            <Input size="large" placeholder="请输入用户名" disabled={loading} />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
          >
            <Input size="large" placeholder="name@example.com" disabled={loading} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入有效的11位手机号' }]}
          >
            <Input size="large" placeholder="请输入11位手机号" maxLength={11} disabled={loading} />
          </Form.Item>

          <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
            <Space size={12} style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => void load()}
                disabled={loading}
                size="large"
                className="btn-apple-secondary"
              >
                重置
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                size="large"
                className="btn-apple"
              >
                保存更改
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
