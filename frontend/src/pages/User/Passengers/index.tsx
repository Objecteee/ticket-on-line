import React, { useEffect, useState } from 'react';
import { App, Button, Form, Input, Modal, Space, Tag } from 'antd';
import { createPassenger, deletePassenger, fetchPassengers, setDefaultPassenger, updatePassenger, clearDefaultPassenger, type Passenger } from '@/api/passenger';
import '@/styles/apple-theme.css';
import './index.less';

const PassengersPage: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Passenger[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await fetchPassengers();
      setData(data);
    } catch (e) {
      message.error((e as Error).message || '加载失败');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const handleCreate = () => {
    form.resetFields();
    setEditingId(null);
    setModalOpen(true);
  };

  const handleEdit = (p: Passenger) => {
    form.setFieldsValue(p);
    setEditingId(p.id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const vals = await form.validateFields();
      if (editingId) {
        await updatePassenger(editingId, vals);
        message.success('已保存');
      } else {
        await createPassenger(vals);
        message.success('已新增');
      }
      setModalOpen(false);
      await load();
    } catch (e) {
      if (e && typeof e === 'object' && 'errorFields' in e) return;
      message.error((e as Error).message || '操作失败');
    }
  };

  const handleSetDefault = async (p: Passenger) => {
    await setDefaultPassenger(p.id);
    message.success('已设为默认');
    await load();
  };

  const handleClearDefault = async () => {
    await clearDefaultPassenger();
    message.success('已取消默认');
    await load();
  };

  const handleDelete = async (p: Passenger) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除乘车人"${p.name}"吗？`,
      okText: '删除',
      okButtonProps: { danger: true },
      onOk: async () => {
        await deletePassenger(p.id);
        message.success('已删除');
        await load();
      },
    });
  };

  return (
    <div className="passengers-page apple-fade-in">
      <div className="page-header">
        <h1 className="page-title">乘车人管理</h1>
        <p className="page-subtitle">管理常用乘车人、设置默认乘车人</p>
        <Button type="primary" onClick={handleCreate} className="apple-button apple-button-primary header-action">
          新增乘车人
        </Button>
      </div>

      <div className="passengers-list">
        {loading && (
          <div className="loading-state">
            <p>加载中...</p>
          </div>
        )}
        {!loading && data.length === 0 && (
          <div className="empty-state">
            <p>暂无乘车人，点击上方按钮添加</p>
          </div>
        )}
        {!loading && data.map((p) => (
          <div key={p.id} className="passenger-card apple-card">
            <div className="passenger-content">
              <div className="passenger-info">
                <div className="passenger-name-row">
                  <span className="passenger-name">{p.name}</span>
                  {Number(p.is_default) === 1 && (
                    <Tag color="success" className="default-tag">默认</Tag>
                  )}
                </div>
                <div className="passenger-details">
                  <div className="detail-item">
                    <span className="detail-label">证件号：</span>
                    <span className="detail-value">{p.id_card}</span>
                  </div>
                  {p.phone && (
                    <div className="detail-item">
                      <span className="detail-label">手机号：</span>
                      <span className="detail-value">{p.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="passenger-actions">
              <Button type="link" onClick={() => handleEdit(p)} className="action-btn">编辑</Button>
              {Number(p.is_default) === 1 ? (
                <Button type="link" onClick={() => void handleClearDefault()} className="action-btn">取消默认</Button>
              ) : (
                <Button type="link" onClick={() => void handleSetDefault(p)} className="action-btn">设为默认</Button>
              )}
              <Button type="link" danger onClick={() => void handleDelete(p)} className="action-btn">删除</Button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        title={editingId ? '编辑乘车人' : '新增乘车人'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText="保存"
        cancelText="取消"
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入姓名" className="apple-input" />
          </Form.Item>
          <Form.Item name="id_card" label="证件号" rules={[{ required: true, message: '请输入证件号' }]}>
            <Input placeholder="请输入证件号" className="apple-input" />
          </Form.Item>
          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" className="apple-input" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default function Page() {
  return (
    <App>
      <PassengersPage />
    </App>
  );
}
