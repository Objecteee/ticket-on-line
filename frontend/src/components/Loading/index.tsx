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
  return (
    <div className="loading-container">
      <Spin size={size} tip={tip} />
    </div>
  );
};

export default Loading;

