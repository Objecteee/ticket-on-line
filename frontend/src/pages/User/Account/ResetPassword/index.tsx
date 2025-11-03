import React, { useState } from 'react';
import { App, Button, Card, Form, Input, Space, Typography } from 'antd';
import { requestResetCode, resetPassword } from '@/api/account';

const { Title, Text } = Typography;

const ResetPasswordPage: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [codeInfo, setCodeInfo] = useState<{ code: string; expires_at: string } | null>(null);

  const onGetCode = async () => {
    try {
      const identifier = form.getFieldValue('identifier');
      if (!identifier) return message.warning('请填写用户名/邮箱/手机号');
      setLoading(true);
      const { data } = await requestResetCode(identifier);
      setCodeInfo({ code: data.code, expires_at: data.expires_at });
      message.success('验证码已发送（开发环境直接返回）');
    } catch (e) { message.error((e as Error).message || '获取验证码失败'); }
    finally { setLoading(false); }
  };

  const onSubmit = async () => {
    try {
      const vals = await form.validateFields();
      setLoading(true);
      await resetPassword({ identifier: vals.identifier, code: vals.code, new_password: vals.new_password });
      message.success('密码已重置');
      form.resetFields(['code', 'new_password']);
    } catch (e) { message.error((e as Error).message || '重置失败'); }
    finally { setLoading(false); }
  };

  return (
    <Card variant="borderless" style={{ maxWidth: 520 }}>
      <Title level={4} style={{ marginTop: 0 }}>找回/重置密码</Title>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <Form.Item name="identifier" label="用户名 / 邮箱 / 手机号" rules={[{ required: true }]}>
          <Input placeholder="请输入绑定信息" />
        </Form.Item>
        <Form.Item label="验证码" required>
          <Space.Compact style={{ width: '100%' }}>
            <Form.Item name="code" noStyle rules={[{ required: true }]}> 
              <Input placeholder="请输入验证码" />
            </Form.Item>
            <Button onClick={onGetCode} loading={loading}>获取验证码</Button>
          </Space.Compact>
          {codeInfo && (
            <Text type="secondary">开发环境验证码：{codeInfo.code}，有效至 {codeInfo.expires_at}</Text>
          )}
        </Form.Item>
        <Form.Item name="new_password" label="新密码" rules={[{ required: true, min: 6 }]}>
          <Input.Password placeholder="至少6位" />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>重置密码</Button>
            <Button onClick={() => form.resetFields()}>重置表单</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default function Page() {
  return (
    <App>
      <ResetPasswordPage />
    </App>
  );
}


