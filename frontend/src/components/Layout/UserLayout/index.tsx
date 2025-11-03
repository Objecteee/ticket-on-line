import React from 'react';
import { Layout, Menu, Button, Space, Typography } from 'antd';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { HomeOutlined, SearchOutlined, ShoppingCartOutlined, UserOutlined, SettingOutlined, LogoutOutlined, MessageOutlined } from '@ant-design/icons';
import { useAuth } from '@/store/AuthContext';
import './index.less';

const { Header, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/user/home', icon: <HomeOutlined />, label: '首页' },
  { key: '/user/ticket-search', icon: <SearchOutlined />, label: '车票查询' },
  { key: '/user/orders', icon: <ShoppingCartOutlined />, label: '我的订单' },
  { key: '/user/messages', icon: <MessageOutlined />, label: '留言板' },
  { key: '/user/passengers', icon: <UserOutlined />, label: '乘车人' },
  { key: '/user/profile', icon: <SettingOutlined />, label: '个人资料' },
];

const UserLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const selectedKey = menuItems.find(item => location.pathname.startsWith(item.key))?.key || '/user/home';

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#1890ff', marginRight: 48 }}>在线售票系统</div>
          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ border: 'none', flex: 1 }}
          />
        </div>
        <Space style={{ display: 'flex', alignItems: 'center' }}>
          <Text type="secondary">{user?.username || ''}</Text>
          <Button type="link" icon={<LogoutOutlined />} onClick={logout}>退出</Button>
        </Space>
      </Header>
      <Content style={{ padding: 24, minHeight: 'calc(100vh - 64px)' }}>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default UserLayout;

