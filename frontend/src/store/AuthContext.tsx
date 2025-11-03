/**
 * 认证状态管理Context
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/user';
import { getToken, getUser, setToken, setUser, clearAuth } from '@/utils/auth';
import { login as loginApi, register as registerApi } from '@/api/auth';
import { message } from 'antd';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string, phone?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // 初始化时从localStorage恢复用户信息
  useEffect(() => {
    const initAuth = () => {
      const token = getToken();
      const userData = getUser();
      
      if (token && userData) {
        setUserState(userData);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * 登录
   */
  const login = async (username: string, password: string): Promise<void> => {
    try {
      const response = await loginApi({ username, password });
      const { token, user: userData } = response.data;
      
      setToken(token);
      setUser(userData);
      setUserState(userData);
      
      message.success('登录成功');
    } catch (error: any) {
      message.error(error.message || '登录失败，请检查用户名和密码');
      throw error;
    }
  };

  /**
   * 注册
   */
  const register = async (
    username: string,
    password: string,
    email?: string,
    phone?: string
  ): Promise<void> => {
    try {
      await registerApi({ username, password, email, phone });
      message.success('注册成功，请登录');
    } catch (error: any) {
      message.error(error.message || '注册失败');
      throw error;
    }
  };

  /**
   * 登出
   */
  const logout = (): void => {
    clearAuth();
    setUserState(null);
    message.success('已退出登录');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * 使用认证Context的Hook
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

