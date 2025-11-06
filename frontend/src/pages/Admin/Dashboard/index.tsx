import React, { useEffect, useRef, useState } from 'react';
import { App, Button, Card, Col, Row, Space, Statistic, Typography, DatePicker, Form } from 'antd';
import { useNavigate } from 'react-router-dom';
import { BarChartOutlined, UserOutlined, ScheduleOutlined, ShoppingOutlined, ProfileOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { fetchSummary, fetchTrend, fetchTop } from '@/api/statistics';
import * as echarts from 'echarts';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{ users: number; orders: number; salesAmount: number; refunds: number }>({ users: 0, orders: 0, salesAmount: 0, refunds: 0 });
  const [chartsForm] = Form.useForm();
  const salesRef = useRef<HTMLDivElement>(null);
  const refundRef = useRef<HTMLDivElement>(null);
  const topTrainRef = useRef<HTMLDivElement>(null);
  const destPieRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<echarts.ECharts[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // 顶部汇总不受时间筛选影响
        const [sumRes, trendRes, topRes] = await Promise.all([
          fetchSummary({}),
          (async () => {
            const v = chartsForm.getFieldsValue();
            const p: any = {};
            if (v.dateRange) {
              const [s, e] = v.dateRange as [dayjs.Dayjs, dayjs.Dayjs];
              p.startDate = dayjs(s).format('YYYY-MM-DD');
              p.endDate = dayjs(e).format('YYYY-MM-DD');
            }
            const t = await fetchTrend(p);
            (t as any)._params = p; // 供下方 top 同步
            return t;
          })(),
          (async () => {
            const v = chartsForm.getFieldsValue();
            const p: any = {};
            if (v.dateRange) {
              const [s, e] = v.dateRange as [dayjs.Dayjs, dayjs.Dayjs];
              p.startDate = dayjs(s).format('YYYY-MM-DD');
              p.endDate = dayjs(e).format('YYYY-MM-DD');
            }
            return fetchTop({ ...p, limit: 10 });
          })()
        ]);
        setSummary(sumRes.data);

        // 构建图表数据
        const dateSales = (trendRes.data.sales || []).map((r: any) => ({ date: r.get?.('date') || r.date, count: Number(r.get?.('salesCount') || r.salesCount || 0), amount: Number(r.get?.('salesAmount') || r.salesAmount || 0) }));
        const dateRefunds = (trendRes.data.refunds || []).map((r: any) => ({ date: r.get?.('date') || r.date, count: Number(r.get?.('refundCount') || r.refundCount || 0), amount: Number(r.get?.('refundAmount') || r.refundAmount || 0) }));
        const xDates = Array.from(new Set([...dateSales.map(d => d.date), ...dateRefunds.map(d => d.date)])).sort();
        const salesSeries = xDates.map(d => (dateSales.find(x => x.date === d)?.amount || 0));
        const refundRateSeries = xDates.map(d => {
          const s = dateSales.find(x => x.date === d)?.count || 0;
          const r = dateRefunds.find(x => x.date === d)?.count || 0;
          return s > 0 ? Number(((r / s) * 100).toFixed(2)) : 0;
        });
        const trains = (topRes.data.trains || []).map((r: any) => ({ key: r.get?.('train_number') || r.train_number, count: Number(r.get?.('count') || r.count || 0) }));
        const trainNames = trains.map(t => t.key);
        const trainCounts = trains.map(t => t.count);
        const dests = (topRes.data.destinations || []).map((r: any) => ({ name: r.get?.('destination') || r.destination, value: Number(r.get?.('count') || r.count || 0) }));

        chartsRef.current.forEach(c => c.dispose());
        chartsRef.current = [];
        if (salesRef.current) { const c = echarts.init(salesRef.current); c.setOption({ title: { text: '销售额趋势(¥)' }, tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: xDates }, yAxis: { type: 'value' }, series: [{ type: 'line', data: salesSeries, smooth: true }], grid: { left: 40, right: 20, bottom: 40, top: 50 }, }); chartsRef.current.push(c); }
        if (refundRef.current) { const c = echarts.init(refundRef.current); c.setOption({ title: { text: '退票率趋势(%)' }, tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: xDates }, yAxis: { type: 'value' }, series: [{ type: 'line', data: refundRateSeries, smooth: true }], grid: { left: 40, right: 20, bottom: 40, top: 50 }, }); chartsRef.current.push(c); }
        if (topTrainRef.current) { const c = echarts.init(topTrainRef.current); c.setOption({ title: { text: '热门车次(按销量)' }, tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: trainNames, axisLabel: { interval: 0, rotate: 30 } }, yAxis: { type: 'value' }, series: [{ type: 'bar', data: trainCounts }], grid: { left: 50, right: 20, bottom: 80, top: 50 }, }); chartsRef.current.push(c); }
        if (destPieRef.current) { const c = echarts.init(destPieRef.current); c.setOption({ title: { text: '到站占比', left: 'center' }, tooltip: { trigger: 'item' }, legend: { bottom: 0 }, series: [{ type: 'pie', radius: ['40%', '70%'], data: dests }] }); chartsRef.current.push(c); }

        const onResize = () => chartsRef.current.forEach(c => c.resize());
        window.addEventListener('resize', onResize);
        setTimeout(onResize, 0);
      } catch (e) {
        message.error('加载概览失败');
      } finally { setLoading(false); }
    };
    void load();
  }, []);

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>仪表盘</Title>

      <Row gutter={16}>
        <Col xs={24} md={6}><Card loading={loading}><Statistic title="用户数" value={summary.users} prefix={<UserOutlined />} /></Card></Col>
        <Col xs={24} md={6}><Card loading={loading}><Statistic title="订单数" value={summary.orders} prefix={<ProfileOutlined />} /></Card></Col>
        <Col xs={24} md={6}><Card loading={loading}><Statistic title="销售额(¥)" value={summary.salesAmount} precision={2} prefix={<ShoppingOutlined />} /></Card></Col>
        <Col xs={24} md={6}><Card loading={loading}><Statistic title="退票数" value={summary.refunds} prefix={<BarChartOutlined />} /></Card></Col>
      </Row>

      <Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Button block icon={<UserOutlined />} onClick={() => navigate('/admin/users')}>用户管理</Button>
          </Col>
          <Col xs={24} md={8}>
            <Button block icon={<ScheduleOutlined />} onClick={() => navigate('/admin/trains')}>车次管理</Button>
          </Col>
          <Col xs={24} md={8}>
            <Button block icon={<ShoppingOutlined />} onClick={() => navigate('/admin/ticket-sales')}>售票管理</Button>
          </Col>
          <Col xs={24} md={8}>
            <Button block icon={<ProfileOutlined />} onClick={() => navigate('/admin/orders')}>订单管理</Button>
          </Col>
          <Col xs={24} md={8}>
            <Button block icon={<ProfileOutlined />} onClick={() => navigate('/admin/refunds')}>退票管理</Button>
          </Col>
          <Col xs={24} md={8}>
            <Button block icon={<BarChartOutlined />} onClick={() => navigate('/admin/statistics')}>数据统计</Button>
          </Col>
        </Row>
      </Card>

      <Card title={<span>数据概览</span>} style={{ marginTop: 8 }} extra={
        <Form form={chartsForm} layout="inline" onFinish={() => { void (async () => {
          setLoading(true);
          try {
            const v = chartsForm.getFieldsValue();
            const p: any = {};
            if (v.dateRange) {
              const [s, e] = v.dateRange as [dayjs.Dayjs, dayjs.Dayjs];
              p.startDate = dayjs(s).format('YYYY-MM-DD');
              p.endDate = dayjs(e).format('YYYY-MM-DD');
            }
            const [trendRes, topRes] = await Promise.all([ fetchTrend(p), fetchTop({ ...p, limit: 10 }) ]);
            const dateSales = (trendRes.data.sales || []).map((r: any) => ({ date: r.get?.('date') || r.date, count: Number(r.get?.('salesCount') || r.salesCount || 0), amount: Number(r.get?.('salesAmount') || r.salesAmount || 0) }));
            const dateRefunds = (trendRes.data.refunds || []).map((r: any) => ({ date: r.get?.('date') || r.date, count: Number(r.get?.('refundCount') || r.refundCount || 0), amount: Number(r.get?.('refundAmount') || r.refundAmount || 0) }));
            const xDates = Array.from(new Set([...dateSales.map(d => d.date), ...dateRefunds.map(d => d.date)])).sort();
            const salesSeries = xDates.map(d => (dateSales.find(x => x.date === d)?.amount || 0));
            const refundRateSeries = xDates.map(d => { const s = dateSales.find(x => x.date === d)?.count || 0; const r = dateRefunds.find(x => x.date === d)?.count || 0; return s > 0 ? Number(((r / s) * 100).toFixed(2)) : 0; });
            const trains = (topRes.data.trains || []).map((r: any) => ({ key: r.get?.('train_number') || r.train_number, count: Number(r.get?.('count') || r.count || 0) }));
            const trainNames = trains.map(t => t.key); const trainCounts = trains.map(t => t.count);
            const dests = (topRes.data.destinations || []).map((r: any) => ({ name: r.get?.('destination') || r.destination, value: Number(r.get?.('count') || r.count || 0) }));
            chartsRef.current.forEach(c => c.dispose()); chartsRef.current = [];
            if (salesRef.current) { const c = echarts.init(salesRef.current); c.setOption({ title: { text: '销售额趋势(¥)' }, tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: xDates }, yAxis: { type: 'value' }, series: [{ type: 'line', data: salesSeries, smooth: true }], grid: { left: 40, right: 20, bottom: 40, top: 50 }, }); chartsRef.current.push(c); }
            if (refundRef.current) { const c = echarts.init(refundRef.current); c.setOption({ title: { text: '退票率趋势(%)' }, tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: xDates }, yAxis: { type: 'value' }, series: [{ type: 'line', data: refundRateSeries, smooth: true }], grid: { left: 40, right: 20, bottom: 40, top: 50 }, }); chartsRef.current.push(c); }
            if (topTrainRef.current) { const c = echarts.init(topTrainRef.current); c.setOption({ title: { text: '热门车次(按销量)' }, tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: trainNames, axisLabel: { interval: 0, rotate: 30 } }, yAxis: { type: 'value' }, series: [{ type: 'bar', data: trainCounts }], grid: { left: 50, right: 20, bottom: 80, top: 50 }, }); chartsRef.current.push(c); }
            if (destPieRef.current) { const c = echarts.init(destPieRef.current); c.setOption({ title: { text: '到站占比', left: 'center' }, tooltip: { trigger: 'item' }, legend: { bottom: 0 }, series: [{ type: 'pie', radius: ['40%', '70%'], data: dests }] }); chartsRef.current.push(c); }
          } finally { setLoading(false); }
        })(); }}>
          <Form.Item name="dateRange" label="日期">
            <DatePicker.RangePicker />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>查询</Button>
          </Form.Item>
        </Form>
      }>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div ref={salesRef} style={{ height: 280 }} />
          <div ref={refundRef} style={{ height: 280 }} />
          <div ref={topTrainRef} style={{ height: 280 }} />
          <div ref={destPieRef} style={{ height: 280 }} />
        </div>
      </Card>
    </Space>
  );
};

export default function Page() {
  return <Dashboard />;
}


