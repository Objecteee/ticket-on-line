/**
 * 加载组件
 */
import React from 'react';
import { Spin } from 'antd';
import './index.less';

interface LoadingProps {
  tip?: string;
  size?: 'small' | 'default' | 'large';
}

const Loading: React.FC<LoadingProps> = ({ tip = '加载中...', size = 'default' }) => {
  // 使用 fullscreen 模式以启用 tip，避免 antd 警告
  return <Spin fullscreen size={size} tip={tip} />;
};

export default Loading;

