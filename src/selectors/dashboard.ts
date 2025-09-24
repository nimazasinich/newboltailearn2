type MetricPoint = { time: number | string; acc?: number; loss?: number };
type ModelItem = { name: string; status?: string };

export function toKpiStats(metrics: any) {
  if (!metrics) return [];
  return [
    { label: 'CPU',  value: metrics.cpuUsage != null ? `${metrics.cpuUsage}%` : '-' },
    { label: 'RAM',  value: metrics.memory != null ? `${metrics.memory} MB` : '-' },
    { label: 'Uptime', value: metrics.uptime != null ? `${Math.round(metrics.uptime/60)} min` : '-' },
  ];
}

export function toLineSeries(training: any): MetricPoint[] {
  const list = Array.isArray(training?.history) ? training.history : [];
  return list.map((p: any, i: number) => ({
    time: p.time ?? i,
    acc: p.accuracy,
    loss: p.loss,
  }));
}

export function toBarSeries(models: ModelItem[]) {
  const grouped: Record<string, number> = {};
  (models || []).forEach(m => {
    const k = m.status || 'unknown';
    grouped[k] = (grouped[k] || 0) + 1;
  });
  return Object.entries(grouped).map(([name, count]) => ({ name, count }));
}

export function toStatsCards(models: any[], metrics: any) {
  return [
    { title: 'Total Models', value: models?.length || 0, icon: 'Brain' },
    { title: 'Active Training', value: metrics?.training?.active || 0, icon: 'Activity' },
    { title: 'System Uptime', value: metrics?.uptime ? `${Math.round(metrics.uptime/60)}m` : '0m', icon: 'Clock' },
    { title: 'Success Rate', value: metrics?.successRate ? `${metrics.successRate}%` : '0%', icon: 'CheckCircle' },
  ];
}

export function toBarData(models: any[]) {
  const grouped: Record<string, number> = {};
  (models || []).forEach(m => {
    const k = m.type || 'unknown';
    grouped[k] = (grouped[k] || 0) + 1;
  });
  return Object.entries(grouped).map(([type, count]) => ({ type, count }));
}

export function toPieData(models: any[]) {
  const grouped: Record<string, number> = {};
  (models || []).forEach(m => {
    const k = m.type || 'unknown';
    grouped[k] = (grouped[k] || 0) + 1;
  });
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];
  return Object.entries(grouped).map(([name, value], index) => ({ 
    name, 
    value, 
    color: colors[index % colors.length] 
  }));
}

export function toLineData(models: any[]) {
  // Generate sample line data for demonstration
  return Array.from({ length: 10 }, (_, i) => ({
    epoch: i + 1,
    accuracy: Math.random() * 0.3 + 0.7 // Random accuracy between 0.7-1.0
  }));
}

export function toSystemMetrics(metrics: any) {
  return {
    cpuUsage: metrics?.cpuUsage || 0,
    memory: metrics?.memory || 0,
    uptime: metrics?.uptime || 0
  };
}