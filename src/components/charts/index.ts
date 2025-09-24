// Chart Components Export
export { 
  ChartJSWrapper, 
  LineChartJS, 
  BarChartJS, 
  PieChartJS, 
  DoughnutChartJS, 
  AreaChartJS, 
  ScatterChartJS 
} from './ChartJSWrapper';

export { 
  ChartSelector, 
  ChartPerformanceTest 
} from './ChartSelector';

// Chart data utilities
export const chartUtils = {
  // Generate random data for testing
  generateRandomData: (count: number, type: 'line' | 'bar' | 'pie' = 'line') => {
    const data = Array.from({ length: count }, (_, i) => ({
      name: `Item ${i + 1}`,
      value: Math.random() * 100,
      ...(type === 'line' && { timestamp: new Date(Date.now() - (count - i) * 24 * 60 * 60 * 1000) })
    }));
    
    if (type === 'pie') {
      return data.map((item, index) => ({
        ...item,
        color: `hsl(${index * 45}, 70%, 50%)`
      }));
    }
    
    return data;
  },

  // Format data for different chart types
  formatForChart: (data: any[], type: 'line' | 'bar' | 'pie' | 'area') => {
    switch (type) {
      case 'line':
        return data.map(item => ({
          name: item.name || item.label,
          value: item.value || item.count || item.accuracy,
          timestamp: item.timestamp || item.date
        }));
      
      case 'bar':
        return data.map(item => ({
          name: item.name || item.type || item.category,
          value: item.value || item.count || item.accuracy
        }));
      
      case 'pie':
        return data.map((item, index) => ({
          name: item.name || item.type || `Item ${index + 1}`,
          value: item.value || item.count || item.percentage,
          color: item.color || `hsl(${index * 45}, 70%, 50%)`
        }));
      
      case 'area':
        return data.map(item => ({
          name: item.name || item.date,
          value: item.value || item.count || item.amount
        }));
      
      default:
        return data;
    }
  },

  // Persian number formatting
  formatPersianNumber: (num: number): string => {
    return num.toLocaleString('fa-IR');
  },

  // Persian percentage formatting
  formatPersianPercentage: (num: number, decimals = 1): string => {
    return `${num.toFixed(decimals).replace('.', '/')}%`;
  },

  // Color palette for charts
  getColorPalette: (count: number) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(`hsl(${(i * 360) / count}, 70%, 50%)`);
    }
    return colors;
  }
};

// Chart configuration presets
export const chartPresets = {
  // Persian RTL configuration
  persianRTL: {
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
    scales: {
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
    }
  },

  // Performance optimized configuration
  performance: {
    animation: {
      duration: 0
    },
    interaction: {
      intersect: false
    },
    plugins: {
      legend: {
        display: false
      }
    }
  },

  // Dark theme configuration
  darkTheme: {
    plugins: {
      legend: {
        labels: {
          color: '#e5e7eb'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#e5e7eb',
        bodyColor: '#e5e7eb'
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#9ca3af'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#9ca3af'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      }
    }
  }
};
