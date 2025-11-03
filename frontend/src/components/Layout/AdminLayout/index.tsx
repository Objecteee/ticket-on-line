import React, { useMemo } from 'react';
import { Layout, Menu, Breadcrumb, Button, Space, Typography } from 'antd';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { DashboardOutlined, UserOutlined, ScheduleOutlined, ShoppingOutlined, ProfileOutlined, BarChartOutlined, LogoutOutlined, ArrowLeftOutlined, MessageOutlined } from '@ant-design/icons';
import { useAuth } from '@/store/AuthContext';

const { Header, Sider, Content } = Layout;

const routesMeta: Record<string, { title: string; path: string }> = {
  '/admin': { title: '仪表盘', path: '/admin' },
  '/admin/users': { title: '用户管理', path: '/admin/users' },
  '/admin/trains': { title: '车次管理', path: '/admin/trains' },
  '/admin/ticket-sales': { title: '售票管理', path: '/admin/ticket-sales' },
  '/admin/orders': { title: '订单管理', path: '/admin/orders' },
  '/admin/refunds': { title: '退票管理', path: '/admin/refunds' },
  '/admin/statistics': { title: '数据统计', path: '/admin/statistics' },
  '/admin/messages': { title: '留言管理', path: '/admin/messages' },
};

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const selectedKey = useMemo(() => {
    const path = location.pathname.replace(/\/$/, '');
    const keys = Object.keys(routesMeta);
    return keys.find(k => path === k) || '/admin';
  }, [location.pathname]);

  const breadcrumb = useMemo(() => {
    const parts: string[] = [];
    const path = location.pathname.replace(/\/$/, '');
    const root = '/admin';
    if (path.startsWith(root)) {
      parts.push(root);
      const rest = path.slice(root.length).split('/').filter(Boolean);
      let acc = root;
      for (const p of rest) {
        acc += `/${p}`;
        if (routesMeta[acc]) parts.push(acc);
      }
    }
    return parts.map(p => ({ title: routesMeta[p]?.title || p, path: p }));
  }, [location.pathname]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" width={220} breakpoint="lg">
        <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: '0 16px', fontWeight: 600, fontSize: 16 }}>管理控制台</div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={[
            { key: '/admin', icon: <DashboardOutlined />, label: '仪表盘', onClick: () => navigate('/admin') },
            { key: '/admin/users', icon: <UserOutlined />, label: '用户管理', onClick: () => navigate('/admin/users') },
            { key: '/admin/trains', icon: <ScheduleOutlined />, label: '车次管理', onClick: () => navigate('/admin/trains') },
            { key: '/admin/ticket-sales', icon: <ShoppingOutlined />, label: '售票管理', onClick: () => navigate('/admin/ticket-sales') },
            { key: '/admin/orders', icon: <ProfileOutlined />, label: '订单管理', onClick: () => navigate('/admin/orders') },
            { key: '/admin/refunds', icon: <ProfileOutlined />, label: '退票管理', onClick: () => navigate('/admin/refunds') },
            { key: '/admin/messages', icon: <MessageOutlined />, label: '留言管理', onClick: () => navigate('/admin/messages') },
            { key: '/admin/statistics', icon: <BarChartOutlined />, label: '数据统计', onClick: () => navigate('/admin/statistics') },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space size={12}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
            <Breadcrumb
              items={breadcrumb.map(b => ({ title: <a onClick={() => navigate(b.path)}>{b.title}</a> }))}
            />
          </Space>
          <Space>
            <Typography.Text type="secondary">{user?.username}</Typography.Text>
            <Button type="link" icon={<LogoutOutlined />} onClick={logout}>退出</Button>
          </Space>
        </Header>
        <Content style={{ margin: 16 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 16 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;


