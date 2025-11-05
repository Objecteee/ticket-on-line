/**
 * 路由配置
 */
import React from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import { useAuth } from '@/store/AuthContext';
import Loading from '@/components/Loading';
import AdminLayout from '@/components/Layout/AdminLayout';
import UserLayout from '@/components/Layout/UserLayout';
import AdminDashboardPage from '@/pages/Admin/Dashboard';
import AdminUserPage from '@/pages/Admin/UserManagement';
import AdminTrainPage from '@/pages/Admin/TrainManagement';
import AdminTicketSalesPage from '@/pages/Admin/TicketSales';
import AdminOrdersPage from '@/pages/Admin/Orders';
import AdminRefundsPage from '@/pages/Admin/Refunds';
import AdminStatisticsPage from '@/pages/Admin/Statistics';
import UserHomePage from '@/pages/User/Home';
import UserTicketSearchPage from '@/pages/User/TicketSearch';
import UserBookPage from '@/pages/User/Book';
import UserOrdersPage from '@/pages/User/Orders';
import UserPassengersPage from '@/pages/User/Passengers';
import ResetPasswordPage from '@/pages/User/Account/ResetPassword';
import UserProfilePage from '@/pages/User/Profile';
import UserMessagesPage from '@/pages/User/Messages';
import AdminMessagesPage from '@/pages/Admin/Messages';
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
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (isAuthenticated || getToken()) {
    const token = getToken();
    const roleFromToken: string | undefined = token ? decodeJwtPayload(token)?.role : undefined;
    const currentRole = user?.role || roleFromToken;
    
    // 根据角色重定向到对应的首页
    if (currentRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (currentRole === 'user') {
      return <Navigate to="/user/home" replace />;
    }
  }

  return children;
};

/** 仅管理员可访问 */
export const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <Loading />;
  const token = getToken();
  const roleFromToken: string | undefined = token ? decodeJwtPayload(token)?.role : undefined;
  const currentRole = user?.role || roleFromToken;
  const authed = isAuthenticated || !!token;
  
  if (!authed) {
    return <Navigate to="/login" replace />;
  }
  
  // 如果是普通用户，重定向到用户首页
  if (currentRole === 'user') {
    return <Navigate to="/user/home" replace />;
  }
  
  // 如果不是管理员，重定向到登录页重新验证
  if (currentRole !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

/** 仅普通用户可访问 */
export const UserRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  const token = getToken();
  const roleFromToken: string | undefined = token ? decodeJwtPayload(token)?.role : undefined;
  const currentRole = user?.role || roleFromToken;
  
  // 如果没有认证，重定向到登录页
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }
  
  // 如果已认证，检查角色
  if (isAuthenticated || token) {
    // 如果是管理员，重定向到管理员页面
    if (currentRole === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    
    // 如果是普通用户，允许访问
    if (currentRole === 'user') {
      return children;
    }
    
    // 如果角色不明确或其他情况，重定向到登录页重新验证
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

/**
 * 路由配置数组
 */
export const routes: RouteObject[] = [
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
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <ResetPasswordPage />
      </PublicRoute>
    ),
  },
  {
    path: '/user',
    element: (
      <UserRoute>
        <UserLayout />
      </UserRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/user/home" replace /> },
      { path: 'home', element: <UserHomePage /> },
      { path: 'ticket-search', element: <UserTicketSearchPage /> },
      { path: 'book', element: <UserBookPage /> },
      { path: 'orders', element: <UserOrdersPage /> },
      { path: 'passengers', element: <UserPassengersPage /> },
      { path: 'profile', element: <UserProfilePage /> },
      { path: 'messages', element: <UserMessagesPage /> },
    ],
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
      { path: 'messages', element: <AdminMessagesPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];

