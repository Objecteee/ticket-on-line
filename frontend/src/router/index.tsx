/**
 * 路由配置
 */
import React from 'react';
import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import { useAuth } from '@/store/AuthContext';
import Loading from '@/components/Loading';
import AdminUserPage from '@/pages/Admin/UserManagement';

/**
 * 路由守卫组件 - 需要登录
 */
export const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * 公开路由组件 - 已登录用户不能访问（如登录页、注册页）
 */
export const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/** 仅管理员可访问 */
export const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

/**
 * 路由配置数组
 */
const routes: RouteObject[] = [
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <div>首页（待实现）</div>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <AdminRoute>
        <AdminUserPage />
      </AdminRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

/**
 * 创建路由配置
 */
export const createRouter = () => {
  // 开启 v7_startTransition 以消除 React Router 的未来版本警告
  return createBrowserRouter(routes, {
    future: {
      v7_startTransition: true,
    },
  });
};

