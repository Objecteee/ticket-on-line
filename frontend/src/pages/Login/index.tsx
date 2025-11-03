/**
 * 登录页面
 */
import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { usernameRules, passwordRules } from '@/utils/validation';
import './index.less';

interface LoginFormValues {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * 处理登录提交
   */
  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      // 登录成功后跳转
      const redirect = new URLSearchParams(window.location.search).get('redirect') || '/';
      navigate(redirect, { replace: true });
    } catch (error) {
      // 错误已在login函数中处理，这里不需要额外处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <Card className="login-card" title={<div className="login-title">车站在线售票系统</div>}>
          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
            layout="vertical"
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={usernameRules}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入用户名"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={passwordRules}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
              >
                登录
              </Button>
            </Form.Item>

            <div className="login-footer">
              <span>还没有账号？</span>
              <Link to="/register">立即注册</Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;

