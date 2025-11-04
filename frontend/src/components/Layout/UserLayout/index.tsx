import React, { useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { HomeOutlined, SearchOutlined, ShoppingCartOutlined, UserOutlined, SettingOutlined, LogoutOutlined, MessageOutlined, MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { useAuth } from '@/store/AuthContext';
import '@/styles/apple-theme.css';
import './index.less';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const selectedKey = menuItems.find(item => location.pathname.startsWith(item.key))?.key || '/user/home';

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="user-layout">
      {/* 导航栏 */}
      <nav className="apple-navbar">
        <div className="navbar-container">
          <div className="navbar-logo" onClick={() => handleNavClick('/user/home')}>
            在线售票系统
          </div>
          
          {/* 桌面导航 */}
          <div className="navbar-menu desktop">
            {menuItems.map(item => (
              <button
                key={item.key}
                className={`navbar-item ${selectedKey === item.key ? 'active' : ''}`}
                onClick={() => handleNavClick(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* 用户信息 */}
          <div className="navbar-user">
            <span className="navbar-username">{user?.username || ''}</span>
            <button className="navbar-logout" onClick={logout}>
              <LogoutOutlined />
            </button>
          </div>

          {/* 移动端菜单按钮 */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
          </button>
        </div>

        {/* 移动端菜单 */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            {menuItems.map(item => (
              <button
                key={item.key}
                className={`mobile-menu-item ${selectedKey === item.key ? 'active' : ''}`}
                onClick={() => handleNavClick(item.key)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
            <div className="mobile-menu-divider" />
            <div className="mobile-menu-user">
              <span>{user?.username || ''}</span>
              <button onClick={logout}>退出登录</button>
            </div>
          </div>
        )}
      </nav>

      {/* 内容区域 */}
      <main className="user-content">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
