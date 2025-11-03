import React, { useEffect, useState } from 'react';
import { App, Avatar, Button, Form, Input, Space, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getProfile, updateProfile } from '@/api/account';

const { Text } = Typography;

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
    } catch (e) { message.error((e as Error).message || '加载资料失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const onSave = async () => {
    try {
      const vals = await form.validateFields();
      setLoading(true);
      await updateProfile(vals);
      message.success('已保存');
      await load();
    } catch (e) { message.error((e as Error).message || '保存失败'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
      {/* 头像区域 */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <Avatar
          size={80}
          icon={<UserOutlined />}
          style={{
            backgroundColor: '#f5f5f5',
            border: '1px solid #e8e8e8',
            marginBottom: 16,
          }}
        />
        <div>
          <Text style={{ fontSize: 28, fontWeight: 300, color: '#1d1d1f', letterSpacing: '-0.5px' }}>
            {userInfo.username || '用户'}
          </Text>
        </div>
      </div>

      {/* 表单区域 */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 12,
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e8e8e8',
        }}
      >
        <Form form={form} layout="vertical" size="large" style={{ maxWidth: 480, margin: '0 auto' }}>
          <Form.Item
            name="username"
            label={
              <Text style={{ fontSize: 13, fontWeight: 400, color: '#86868b', letterSpacing: '-0.1px' }}>
                用户名
              </Text>
            }
            rules={[{ required: true, min: 3, max: 20, message: '用户名长度为3-20位' }]}
            style={{ marginBottom: 24 }}
          >
            <Input
              placeholder="请输入用户名"
              variant="borderless"
              style={{
                fontSize: 17,
                padding: '12px 0',
                borderBottom: '1px solid #d2d2d7',
                borderRadius: 0,
                color: '#1d1d1f',
              }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label={
              <Text style={{ fontSize: 13, fontWeight: 400, color: '#86868b', letterSpacing: '-0.1px' }}>
                邮箱
              </Text>
            }
            rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
            style={{ marginBottom: 24 }}
          >
            <Input
              placeholder="name@example.com"
              variant="borderless"
              style={{
                fontSize: 17,
                padding: '12px 0',
                borderBottom: '1px solid #d2d2d7',
                borderRadius: 0,
                color: '#1d1d1f',
              }}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label={
              <Text style={{ fontSize: 13, fontWeight: 400, color: '#86868b', letterSpacing: '-0.1px' }}>
                手机号
              </Text>
            }
            rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入有效的11位手机号' }]}
            style={{ marginBottom: 40 }}
          >
            <Input
              placeholder="请输入11位手机号"
              variant="borderless"
              maxLength={11}
              style={{
                fontSize: 17,
                padding: '12px 0',
                borderBottom: '1px solid #d2d2d7',
                borderRadius: 0,
                color: '#1d1d1f',
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space size={12} style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => void load()}
                disabled={loading}
                style={{
                  height: 44,
                  paddingLeft: 20,
                  paddingRight: 20,
                  borderRadius: 22,
                  fontSize: 17,
                  fontWeight: 400,
                  border: '1px solid #d2d2d7',
                  color: '#1d1d1f',
                }}
              >
                取消
              </Button>
              <Button
                type="primary"
                onClick={onSave}
                loading={loading}
                style={{
                  height: 44,
                  paddingLeft: 32,
                  paddingRight: 32,
                  borderRadius: 22,
                  fontSize: 17,
                  fontWeight: 400,
                  background: '#0071e3',
                  border: 'none',
                  boxShadow: 'none',
                }}
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


