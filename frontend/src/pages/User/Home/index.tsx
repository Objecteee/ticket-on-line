import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, ShoppingCartOutlined, UserOutlined, SettingOutlined, MessageOutlined, ArrowRightOutlined } from '@ant-design/icons';
import '@/styles/apple-theme.css';
import './index.less';

const menuCards = [
  {
    key: 'ticket-search',
    title: '车票查询',
    icon: <SearchOutlined />,
    description: '搜索车次、查看余票、在线订票',
    path: '/user/ticket-search',
  },
  {
    key: 'orders',
    title: '我的订单',
    icon: <ShoppingCartOutlined />,
    description: '查看订单详情、申请退款、取消订单',
    path: '/user/orders',
  },
  {
    key: 'messages',
    title: '留言板',
    icon: <MessageOutlined />,
    description: '发布留言、查看其他用户留言、管理员回复',
    path: '/user/messages',
  },
  {
    key: 'passengers',
    title: '乘车人管理',
    icon: <UserOutlined />,
    description: '管理常用乘车人、设置默认乘车人',
    path: '/user/passengers',
  },
  {
    key: 'profile',
    title: '个人资料',
    icon: <SettingOutlined />,
    description: '修改个人信息、账号设置',
    path: '/user/profile',
  },
];

const UserHomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page apple-fade-in">
      <div className="home-hero">
        <h1 className="home-title">欢迎回来</h1>
        <p className="home-subtitle">选择下方功能开始使用</p>
      </div>

      <div className="home-grid">
        {menuCards.map((card) => (
          <div
            key={card.key}
            className="home-card"
            onClick={() => navigate(card.path)}
          >
            <div className="home-card-icon">{card.icon}</div>
            <h3 className="home-card-title">{card.title}</h3>
            <p className="home-card-desc">{card.description}</p>
            <div className="home-card-action">
              <span>立即使用</span>
              <ArrowRightOutlined />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserHomePage;
