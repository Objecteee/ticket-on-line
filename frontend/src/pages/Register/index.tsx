/**
 * 注册页面
 */
import React, { useState } from 'react';
import { Form, Input, Button, Card } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { usernameRules, passwordRules, confirmPasswordRules, emailRules, phoneRules } from '@/utils/validation';
import './index.less';

interface RegisterFormValues {
  username: string;
  password: string;
  confirmPassword: string;
  email?: string;
  phone?: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * 处理注册提交
   */
  const handleSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      await register(values.username, values.password, values.email, values.phone);
      // 注册成功后跳转到登录页
      navigate('/login', { replace: true });
    } catch (error) {
      // 错误已在register函数中处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <Card className="register-card" title={<div className="register-title">用户注册</div>}>
          <Form
            form={form}
            name="register"
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
                placeholder="请输入用户名（3-20个字符）"
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
                placeholder="请输入密码（6-20个字符）"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认密码"
              dependencies={['password']}
              rules={confirmPasswordRules(form.getFieldValue)}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请再次输入密码"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱"
              rules={emailRules}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="请输入邮箱地址（可选）"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label="手机号"
              rules={phoneRules}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="请输入手机号码（可选）"
                autoComplete="tel"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
              >
                注册
              </Button>
            </Form.Item>

            <div className="register-footer">
              <span>已有账号？</span>
              <Link to="/login">立即登录</Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Register;

