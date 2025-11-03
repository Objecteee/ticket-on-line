/**
 * 认证相关工具函数
 */

const TOKEN_KEY = 'ticket_token';
const USER_KEY = 'ticket_user';

/**
 * 保存Token
 */
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * 获取Token
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * 删除Token
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * 保存用户信息
 */
export const setUser = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * 获取用户信息
 */
export const getUser = (): any | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * 删除用户信息
 */
export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

/**
 * 清除所有认证信息
 */
export const clearAuth = (): void => {
  removeToken();
  removeUser();
};

/**
 * 检查是否已登录
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

