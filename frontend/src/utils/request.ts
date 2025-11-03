/**
 * Axios请求封装
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { message } from 'antd';
import { ApiResponse } from '@/types/api';
import { getToken, clearAuth } from './auth';

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 添加token到请求头
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse;
    
    // 如果code不是200，视为错误
    if (res.code !== 200) {
      message.error(res.message || '请求失败');
      
      // 401未授权，清除认证信息并跳转登录
      if (res.code === 401) {
        clearAuth();
        window.location.href = '/login';
      }
      
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    
    return res;
  },
  (error: AxiosError) => {
    // 处理HTTP错误
    if (error.response) {
      const status = error.response.status;
      
      switch (status) {
        case 401:
          message.error('未授权，请重新登录');
          clearAuth();
          window.location.href = '/login';
          break;
        case 403:
          message.error('拒绝访问');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error('服务器错误');
          break;
        default:
          message.error(`请求失败: ${error.response.statusText}`);
      }
    } else if (error.request) {
      message.error('网络错误，请检查网络连接');
    } else {
      message.error(error.message || '请求失败');
    }
    
    return Promise.reject(error);
  }
);

export default service;

