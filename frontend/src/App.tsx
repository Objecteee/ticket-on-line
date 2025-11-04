/**
 * 应用根组件
 */
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AuthProvider } from '@/store/AuthContext';
import { createRouter } from '@/router';
import '@/styles/user-theme.css';
import './App.less';

// 创建路由实例
const router = createRouter();

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;

