import React from 'react';
import { Card, Row, Col, Typography, Space } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, UserOutlined, SettingOutlined, MessageOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './index.less';

const { Title, Text } = Typography;

const menuCards = [
  {
    key: 'ticket-search',
    title: '车票查询',
    icon: <SearchOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
    description: '搜索车次、查看余票、在线订票',
    path: '/user/ticket-search',
    color: '#1890ff',
  },
  {
    key: 'orders',
    title: '我的订单',
    icon: <ShoppingCartOutlined style={{ fontSize: 48, color: '#52c41a' }} />,
    description: '查看订单详情、申请退款、取消订单',
    path: '/user/orders',
    color: '#52c41a',
  },
  {
    key: 'messages',
    title: '留言板',
    icon: <MessageOutlined style={{ fontSize: 48, color: '#fa541c' }} />,
    description: '发布留言、查看其他用户留言、管理员回复',
    path: '/user/messages',
    color: '#fa541c',
  },
  {
    key: 'passengers',
    title: '乘车人管理',
    icon: <UserOutlined style={{ fontSize: 48, color: '#722ed1' }} />,
    description: '管理常用乘车人、设置默认乘车人',
    path: '/user/passengers',
    color: '#722ed1',
  },
  {
    key: 'profile',
    title: '个人资料',
    icon: <SettingOutlined style={{ fontSize: 48, color: '#fa8c16' }} />,
    description: '修改个人信息、账号设置',
    path: '/user/profile',
    color: '#fa8c16',
  },
];

const UserHomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', padding: '48px 0 64px' }}>
        <Title level={2} style={{ margin: 0, fontWeight: 300 }}>欢迎使用在线售票系统</Title>
        <Text type="secondary" style={{ fontSize: 16 }}>请选择下方功能开始使用</Text>
      </div>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {menuCards.map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.key}>
            <Card
              hoverable
              style={{
                height: '100%',
                borderRadius: 12,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              bodyStyle={{
                padding: '24px 16px',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
              onClick={() => navigate(card.path)}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  margin: '0 auto 24px',
                  border: `2px solid ${card.color}`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                }}
              >
                {card.icon}
              </div>
              <Title level={4} style={{ margin: '0 0 12px', fontWeight: 500 }}>{card.title}</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: 14, lineHeight: 1.6, minHeight: 44 }}>
                {card.description}
              </Text>
              <Space style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>立即使用</Text>
                <ArrowRightOutlined style={{ color: card.color }} />
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default UserHomePage;
