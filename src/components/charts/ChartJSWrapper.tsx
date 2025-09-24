import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Chart as ChartJS, ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import { ChartJS as ChartJSInstance } from '../../lib/charts';

interface ChartJSWrapperProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
  data: ChartData;
  options?: ChartOptions;
  className?: string;
  height?: number;
  width?: number;
}

export interface ChartJSWrapperRef {
  getChart: () => ChartJS | null;
  updateData: (data: ChartData) => void;
  destroy: () => void;
}

export const ChartJSWrapper = forwardRef<ChartJSWrapperRef, ChartJSWrapperProps>(
  ({ type, data, options = {}, className = '', height = 300, width }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<ChartJS | null>(null);

    useImperativeHandle(ref, () => ({
      getChart: () => chartRef.current,
      updateData: (newData: ChartData) => {
        if (chartRef.current) {
          chartRef.current.data = newData;
          chartRef.current.update();
        }
      },
      destroy: () => {
        if (chartRef.current) {
          chartRef.current.destroy();
          chartRef.current = null;
        }
      }
    }));

    useEffect(() => {
      if (!canvasRef.current) return;

      const config: ChartConfiguration = {
        type: type as any,
        data,
        options: {
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
          scales: type !== 'pie' && type !== 'doughnut' ? {
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
          } : undefined,
          ...options
        }
      };

      chartRef.current = new ChartJSInstance(canvasRef.current, config);

      return () => {
        if (chartRef.current) {
          chartRef.current.destroy();
          chartRef.current = null;
        }
      };
    }, [type, data, options]);

    useEffect(() => {
      if (chartRef.current && data) {
        chartRef.current.data = data;
        chartRef.current.update();
      }
    }, [data]);

    return (
      <div className={`relative ${className}`} style={{ height, width }}>
        <canvas ref={canvasRef} />
      </div>
    );
  }
);

ChartJSWrapper.displayName = 'ChartJSWrapper';

// Specialized chart components
export function LineChartJS({ data, options, ...props }: Omit<ChartJSWrapperProps, 'type'>) {
  return <ChartJSWrapper type="line" data={data} options={options} {...props} />;
}

export function BarChartJS({ data, options, ...props }: Omit<ChartJSWrapperProps, 'type'>) {
  return <ChartJSWrapper type="bar" data={data} options={options} {...props} />;
}

export function PieChartJS({ data, options, ...props }: Omit<ChartJSWrapperProps, 'type'>) {
  return <ChartJSWrapper type="pie" data={data} options={options} {...props} />;
}

export function DoughnutChartJS({ data, options, ...props }: Omit<ChartJSWrapperProps, 'type'>) {
  return <ChartJSWrapper type="doughnut" data={data} options={options} {...props} />;
}

export function AreaChartJS({ data, options, ...props }: Omit<ChartJSWrapperProps, 'type'>) {
  const areaOptions = {
    ...options,
    plugins: {
      ...options?.plugins,
      filler: {
        propagate: false
      }
    },
    scales: {
      ...options?.scales,
      x: {
        ...options?.scales?.x,
        stacked: true
      },
      y: {
        ...options?.scales?.y,
        stacked: true
      }
    }
  };

  return <ChartJSWrapper type="line" data={data} options={areaOptions} {...props} />;
}

export function ScatterChartJS({ data, options, ...props }: Omit<ChartJSWrapperProps, 'type'>) {
  return <ChartJSWrapper type="scatter" data={data} options={options} {...props} />;
}
