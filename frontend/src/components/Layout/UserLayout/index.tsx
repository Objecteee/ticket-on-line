import React, { useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { HomeOutlined, SearchOutlined, ShoppingCartOutlined, UserOutlined, SettingOutlined, LogoutOutlined, MessageOutlined, MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { useAuth } from '@/store/AuthContext';
import '@/styles/user-theme.css';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectedKey = menuItems.find(item => location.pathname.startsWith(item.key))?.key || '/user/home';

  const handleNavClick = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <div className="user-layout-apple">
      {/* 侧边栏 */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo" onClick={() => handleNavClick('/user/home')}>
            <div className="logo-text">在线售票</div>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <CloseOutlined />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const isActive = selectedKey === item.key;
            return (
              <button
                key={item.key}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.key)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.username || '用户'}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <LogoutOutlined />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="main-container">
        {/* 顶部栏 */}
        <header className="top-bar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
            <MenuOutlined />
          </button>
          <div className="top-bar-right">
            <div className="user-badge">
              <span className="user-name-short">{user?.username || '用户'}</span>
            </div>
          </div>
        </header>

        {/* 内容区域 */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>

      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default UserLayout;
