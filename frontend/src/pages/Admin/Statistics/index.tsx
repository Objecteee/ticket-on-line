import React, { useEffect, useRef, useState } from 'react';
import { App, Button, Card, DatePicker, Form, Space, Typography } from 'antd';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import { fetchTrend, fetchTop } from '@/api/statistics';

const { Title } = Typography;

const StatisticsPage: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const salesRef = useRef<HTMLDivElement>(null);
  const refundRef = useRef<HTMLDivElement>(null);
  const topTrainRef = useRef<HTMLDivElement>(null);
  const destPieRef = useRef<HTMLDivElement>(null);

  const loadCharts = async () => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const params: any = {};
      if (values.dateRange) {
        const [s, e] = values.dateRange as [dayjs.Dayjs, dayjs.Dayjs];
        params.startDate = dayjs(s).format('YYYY-MM-DD');
        params.endDate = dayjs(e).format('YYYY-MM-DD');
      }
      const [{ data: trend }, { data: top }] = await Promise.all([
        fetchTrend(params),
        fetchTop({ ...params, limit: 10 })
      ]);

      // 准备趋势数据
      const dateSales = (trend.sales || []).map((r: any) => ({ date: r.get?.('date') || r.date, count: Number(r.get?.('salesCount') || r.salesCount || 0), amount: Number(r.get?.('salesAmount') || r.salesAmount || 0) }));
      const dateRefunds = (trend.refunds || []).map((r: any) => ({ date: r.get?.('date') || r.date, count: Number(r.get?.('refundCount') || r.refundCount || 0), amount: Number(r.get?.('refundAmount') || r.refundAmount || 0) }));
      const xDates = Array.from(new Set([...dateSales.map(d => d.date), ...dateRefunds.map(d => d.date)])).sort();
      const salesSeries = xDates.map(d => (dateSales.find(x => x.date === d)?.amount || 0));
      const refundRateSeries = xDates.map(d => {
        const s = dateSales.find(x => x.date === d)?.count || 0;
        const r = dateRefunds.find(x => x.date === d)?.count || 0;
        return s > 0 ? Number(((r / s) * 100).toFixed(2)) : 0;
      });

      // 销售额趋势
      if (salesRef.current) {
        const chart = echarts.init(salesRef.current);
        chart.setOption({
          title: { text: '销售额趋势(¥)' },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: xDates },
          yAxis: { type: 'value' },
          series: [{ type: 'line', name: '销售额', data: salesSeries, smooth: true }],
          grid: { left: 40, right: 20, bottom: 40, top: 50 },
        });
      }

      // 退票率趋势
      if (refundRef.current) {
        const chart = echarts.init(refundRef.current);
        chart.setOption({
          title: { text: '退票率趋势(%)' },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: xDates },
          yAxis: { type: 'value' },
          series: [{ type: 'line', name: '退票率', data: refundRateSeries, smooth: true }],
          grid: { left: 40, right: 20, bottom: 40, top: 50 },
        });
      }

      // Top 车次
      const trains = (top.trains || []).map((r: any) => ({ key: r.get?.('train_number') || r.train_number, count: Number(r.get?.('count') || r.count || 0) }));
      const trainNames = trains.map(t => t.key);
      const trainCounts = trains.map(t => t.count);
      if (topTrainRef.current) {
        const chart = echarts.init(topTrainRef.current);
        chart.setOption({
          title: { text: '热门车次(按销量)' },
          tooltip: { trigger: 'axis' },
          xAxis: { type: 'category', data: trainNames, axisLabel: { interval: 0, rotate: 30 } },
          yAxis: { type: 'value' },
          series: [{ type: 'bar', data: trainCounts }],
          grid: { left: 50, right: 20, bottom: 80, top: 50 },
        });
      }

      // 到站占比
      const dests = (top.destinations || []).map((r: any) => ({ name: r.get?.('destination') || r.destination, value: Number(r.get?.('count') || r.count || 0) }));
      if (destPieRef.current) {
        const chart = echarts.init(destPieRef.current);
        chart.setOption({
          title: { text: '到站占比', left: 'center' },
          tooltip: { trigger: 'item' },
          legend: { bottom: 0 },
          series: [{ type: 'pie', radius: ['40%', '70%'], data: dests }],
        });
      }
    } catch (e) {
      message.error((e as Error).message || '统计加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadCharts(); }, []);

  const onSearch = () => { void loadCharts(); };

  return (
    <Card title={<Title level={4} style={{ margin: 0 }}>数据统计</Title>} bordered={false}
      extra={<Form form={form} layout="inline" onFinish={onSearch}>
        <Form.Item name="dateRange" label="日期"><DatePicker.RangePicker /></Form.Item>
        <Form.Item><Space><Button type="primary" htmlType="submit" loading={loading}>查询</Button><Button onClick={() => { form.resetFields(); void loadCharts(); }}>重置</Button></Space></Form.Item>
      </Form>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div ref={salesRef} style={{ height: 360, background: '#fff' }} />
        <div ref={refundRef} style={{ height: 360, background: '#fff' }} />
        <div ref={topTrainRef} style={{ height: 360, background: '#fff' }} />
        <div ref={destPieRef} style={{ height: 360, background: '#fff' }} />
      </div>
    </Card>
  );
};

export default function Page() {
  return (
    <App>
      <StatisticsPage />
    </App>
  );
}


