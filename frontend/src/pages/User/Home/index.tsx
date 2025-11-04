import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, ShoppingCartOutlined, UserOutlined, SettingOutlined, MessageOutlined, RightOutlined } from '@ant-design/icons';
import '@/styles/user-theme.css';
import './index.less';

const menuCards = [
  {
    key: 'ticket-search',
    title: '车票查询',
    icon: <SearchOutlined />,
    description: '搜索车次、查看余票',
    path: '/user/ticket-search',
  },
  {
    key: 'orders',
    title: '我的订单',
    icon: <ShoppingCartOutlined />,
    description: '查看订单详情、管理订单',
    path: '/user/orders',
  },
  {
    key: 'messages',
    title: '留言板',
    icon: <MessageOutlined />,
    description: '发布留言、查看回复',
    path: '/user/messages',
  },
  {
    key: 'passengers',
    title: '乘车人管理',
    icon: <UserOutlined />,
    description: '管理常用乘车人',
    path: '/user/passengers',
  },
  {
    key: 'profile',
    title: '个人资料',
    icon: <SettingOutlined />,
    description: '修改个人信息',
    path: '/user/profile',
  },
];

const UserHomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page-apple">
      {/* 欢迎区域 */}
      <div className="welcome-section apple-fade-in-up">
        <h1 className="welcome-title">欢迎回来</h1>
        <p className="welcome-subtitle">选择功能开始使用</p>
      </div>

      {/* 功能卡片网格 */}
      <div className="features-grid">
        {menuCards.map((card, index) => (
          <div
            key={card.key}
            className="feature-card apple-card apple-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={() => navigate(card.path)}
          >
            <div className="card-icon">{card.icon}</div>
            <div className="card-body">
              <h3 className="card-title">{card.title}</h3>
              <p className="card-description">{card.description}</p>
            </div>
            <div className="card-action">
              <RightOutlined />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserHomePage;
