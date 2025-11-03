/**
 * API统一响应格式
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 分页响应数据
 */
export interface PaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

