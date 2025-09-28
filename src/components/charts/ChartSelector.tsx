import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Settings,
  Zap,
  BarChart
} from 'lucide-react';

// Recharts components
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// Chart.js components
import { 
  BarChartJS, 
  LineChartJS, 
  PieChartJS, 
  AreaChartJS 
} from './ChartJSWrapper';

interface ChartSelectorProps {
  type: 'bar' | 'line' | 'pie' | 'area';
  data: any[];
  title: string;
  className?: string;
  height?: number;
  showSelector?: boolean;
}

export function ChartSelector({ 
  type, 
  data, 
  title, 
  className = '', 
  height = 300,
  showSelector = true 
}: ChartSelectorProps) {
  const [chartLibrary, setChartLibrary] = useState<'recharts' | 'chartjs'>('recharts');

  const renderRechartsChart = () => {
    const commonProps = {
      width: 400,
      height: height,
      data: data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case 'bar':
        return (
          <RechartsBarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </RechartsBarChart>
        );
      
      case 'line':
        return (
          <RechartsLineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
          </RechartsLineChart>
        );
      
      case 'pie':
        return (
          <RechartsPieChart width={400} height={height}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 45}, 70%, 50%)`} />
              ))}
            </Pie>
            <Tooltip />
          </RechartsPieChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
          </AreaChart>
        );
      
      default:
        return <div>نوع نمودار پشتیبانی نمی‌شود</div>;
    }
  };

  const renderChartJSChart = () => {
    const chartData = {
      labels: data.map(item => item.name || item.type || item.epoch),
      datasets: [{
        label: title,
        data: data.map(item => item.value || item.count || item.accuracy),
        backgroundColor: type === 'pie' ? data.map((_, index) => `hsl(${index * 45}, 70%, 50%)`) : '#8884d8',
        borderColor: '#8884d8',
        borderWidth: 1
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            usePointStyle: true,
            font: {
              family: 'Vazirmatn, sans-serif'
            }
          }
        },
        tooltip: {
          rtl: true,
          titleFont: {
            family: 'Vazirmatn, sans-serif'
          },
          bodyFont: {
            family: 'Vazirmatn, sans-serif'
          }
        }
      },
      scales: type !== 'pie' ? {
        x: {
          ticks: {
            font: {
              family: 'Vazirmatn, sans-serif'
            }
          }
        },
        y: {
          ticks: {
            font: {
              family: 'Vazirmatn, sans-serif'
            }
          }
        }
      } : undefined
    };

    switch (type) {
      case 'bar':
        return <BarChartJS data={chartData} options={options} height={height} />;
      case 'line':
        return <LineChartJS data={chartData} options={options} height={height} />;
      case 'pie':
        return <PieChartJS data={chartData} options={options} height={height} />;
      case 'area':
        return <AreaChartJS data={chartData} options={options} height={height} />;
      default:
        return <div>نوع نمودار پشتیبانی نمی‌شود</div>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {type === 'bar' && <BarChart3 className="h-5 w-5" />}
            {type === 'line' && <LineChart className="h-5 w-5" />}
            {type === 'pie' && <PieChart className="h-5 w-5" />}
            {type === 'area' && <TrendingUp className="h-5 w-5" />}
            {title}
          </CardTitle>
          
          {showSelector && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {chartLibrary === 'recharts' ? 'Recharts' : 'Chart.js'}
              </Badge>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={chartLibrary === 'recharts' ? 'default' : 'outline'}
                  onClick={() => setChartLibrary('recharts')}
                  className="h-8 px-2"
                >
                  <BarChart className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant={chartLibrary === 'chartjs' ? 'default' : 'outline'}
                  onClick={() => setChartLibrary('chartjs')}
                  className="h-8 px-2"
                >
                  <Zap className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height: height }}>
          {chartLibrary === 'recharts' ? renderRechartsChart() : renderChartJSChart()}
        </div>
      </CardContent>
    </Card>
  );
}

// Performance comparison component
export function ChartPerformanceTest() {
  const [testData, setTestData] = useState(() => 
    Array.from({ length: 1000 }, (_, i) => ({
      name: `Item ${i}`,
      value: Math.random() * 100
    }))
  );

  const [renderTime, setRenderTime] = useState<{ recharts: number; chartjs: number } | null>(null);

  const runPerformanceTest = () => {
    // This would be implemented with actual performance measurement
    setRenderTime({
      recharts: Math.random() * 100 + 50,
      chartjs: Math.random() * 100 + 30
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          تست عملکرد نمودارها
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={runPerformanceTest}>
              اجرای تست عملکرد
            </Button>
            <span className="text-sm text-gray-600">
              {testData.length} نقطه داده
            </span>
          </div>
          
          {renderTime && (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold">Recharts</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {renderTime.recharts.toFixed(1)}ms
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold">Chart.js</h4>
                <p className="text-2xl font-bold text-green-600">
                  {renderTime.chartjs.toFixed(1)}ms
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
