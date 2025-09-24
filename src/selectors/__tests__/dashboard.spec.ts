import { toKpiStats, toBarSeries, toLineSeries, toStatsCards } from '@/selectors/dashboard';

describe('Dashboard Selectors', () => {
  describe('toKpiStats', () => {
    test('maps metrics correctly', () => {
      const metrics = { cpuUsage: 23, memory: 512, uptime: 3600 };
      const result = toKpiStats(metrics);
      
      expect(result).toHaveLength(3);
      expect(result.find(x => x.label === 'CPU')?.value).toBe('23%');
      expect(result.find(x => x.label === 'RAM')?.value).toBe('512 MB');
      expect(result.find(x => x.label === 'Uptime')?.value).toBe('60 min');
    });

    test('handles null/undefined metrics', () => {
      expect(toKpiStats(null)).toEqual([]);
      expect(toKpiStats(undefined)).toEqual([]);
    });

    test('handles missing values with dashes', () => {
      const result = toKpiStats({});
      expect(result.find(x => x.label === 'CPU')?.value).toBe('-');
      expect(result.find(x => x.label === 'RAM')?.value).toBe('-');
      expect(result.find(x => x.label === 'Uptime')?.value).toBe('-');
    });
  });

  describe('toBarSeries', () => {
    test('groups by status correctly', () => {
      const models = [
        { name: 'Model 1', status: 'idle' },
        { name: 'Model 2', status: 'idle' },
        { name: 'Model 3', status: 'training' },
        { name: 'Model 4', status: 'completed' }
      ];
      
      const result = toBarSeries(models);
      
      expect(result).toEqual([
        { name: 'idle', count: 2 },
        { name: 'training', count: 1 },
        { name: 'completed', count: 1 }
      ]);
    });

    test('handles models without status', () => {
      const models = [
        { name: 'Model 1' },
        { name: 'Model 2', status: 'idle' }
      ];
      
      const result = toBarSeries(models);
      
      expect(result).toEqual([
        { name: 'unknown', count: 1 },
        { name: 'idle', count: 1 }
      ]);
    });

    test('handles empty array', () => {
      expect(toBarSeries([])).toEqual([]);
    });

    test('handles null/undefined input', () => {
      expect(toBarSeries(null as any)).toEqual([]);
      expect(toBarSeries(undefined as any)).toEqual([]);
    });
  });

  describe('toLineSeries', () => {
    test('maps training history correctly', () => {
      const training = {
        history: [
          { time: '2023-01-01', accuracy: 0.8, loss: 0.2 },
          { time: '2023-01-02', accuracy: 0.85, loss: 0.15 }
        ]
      };
      
      const result = toLineSeries(training);
      
      expect(result).toEqual([
        { time: '2023-01-01', acc: 0.8, loss: 0.2 },
        { time: '2023-01-02', acc: 0.85, loss: 0.15 }
      ]);
    });

    test('handles missing time with index', () => {
      const training = {
        history: [
          { accuracy: 0.8, loss: 0.2 },
          { accuracy: 0.85, loss: 0.15 }
        ]
      };
      
      const result = toLineSeries(training);
      
      expect(result).toEqual([
        { time: 0, acc: 0.8, loss: 0.2 },
        { time: 1, acc: 0.85, loss: 0.15 }
      ]);
    });

    test('handles non-array history', () => {
      expect(toLineSeries({ history: null })).toEqual([]);
      expect(toLineSeries({})).toEqual([]);
    });
  });

  describe('toStatsCards', () => {
    test('maps models and metrics to stats cards', () => {
      const models = [
        { name: 'Model 1', status: 'idle' },
        { name: 'Model 2', status: 'training' }
      ];
      const metrics = {
        training: { active: 1 },
        uptime: 3600,
        successRate: 85
      };
      
      const result = toStatsCards(models, metrics);
      
      expect(result).toEqual([
        { title: 'Total Models', value: 2, icon: 'Brain' },
        { title: 'Active Training', value: 1, icon: 'Activity' },
        { title: 'System Uptime', value: '60m', icon: 'Clock' },
        { title: 'Success Rate', value: '85%', icon: 'CheckCircle' }
      ]);
    });

    test('handles missing data gracefully', () => {
      const result = toStatsCards([], {});
      
      expect(result).toEqual([
        { title: 'Total Models', value: 0, icon: 'Brain' },
        { title: 'Active Training', value: 0, icon: 'Activity' },
        { title: 'System Uptime', value: '0m', icon: 'Clock' },
        { title: 'Success Rate', value: '0%', icon: 'CheckCircle' }
      ]);
    });
  });
});
