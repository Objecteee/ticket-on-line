/**
 * 路由配置入口
 */
import { createBrowserRouter } from 'react-router-dom';
import { routes } from './routes';

/**
 * 创建路由配置
 */
export const createRouter = () => {
  return createBrowserRouter(routes);
};
