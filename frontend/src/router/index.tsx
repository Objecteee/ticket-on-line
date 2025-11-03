/**
 * 路由配置
 */
import React from 'react';
import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import { useAuth } from '@/store/AuthContext';
import Loading from '@/components/Loading';
import AdminLayout from '@/components/Layout/AdminLayout';
import AdminDashboardPage from '@/pages/Admin/Dashboard';
import AdminUserPage from '@/pages/Admin/UserManagement';
import AdminTrainPage from '@/pages/Admin/TrainManagement';
import AdminTicketSalesPage from '@/pages/Admin/TicketSales';
import AdminOrdersPage from '@/pages/Admin/Orders';
import AdminRefundsPage from '@/pages/Admin/Refunds';
import AdminStatisticsPage from '@/pages/Admin/Statistics';
import UserTicketSearchPage from '@/pages/User/TicketSearch';
import { getToken } from '@/utils/auth';
import { decodeJwtPayload } from '@/utils/auth';

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
  const token = getToken();
  const roleFromToken: string | undefined = token ? decodeJwtPayload(token)?.role : undefined;
  const isAdmin = (user?.role === 'admin') || (roleFromToken === 'admin');
  const authed = isAuthenticated || !!token;
  if (!authed) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

/** 仅普通用户可访问 */
export const UserRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <Loading />;
  const token = getToken();
  const roleFromToken: string | undefined = token ? decodeJwtPayload(token)?.role : undefined;
  const isUser = (user?.role === 'user') || (roleFromToken === 'user');
  const authed = isAuthenticated || !!token;
  if (!authed) return <Navigate to="/login" replace />;
  if (!isUser) return <Navigate to="/" replace />;
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
        <Navigate to="/admin" replace />
      </ProtectedRoute>
    ),
  },
  {
    path: '/user/home',
    element: (
      <UserRoute>
        <UserTicketSearchPage />
      </UserRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'users', element: <AdminUserPage /> },
      { path: 'trains', element: <AdminTrainPage /> },
      { path: 'ticket-sales', element: <AdminTicketSalesPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
      { path: 'refunds', element: <AdminRefundsPage /> },
      { path: 'statistics', element: <AdminStatisticsPage /> },
    ],
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
  return createBrowserRouter(routes);
};

