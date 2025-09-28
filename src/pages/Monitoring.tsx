import React from 'react';
import MonitoringPage from 'ui/EnhancedMonitoringPage';
import { monitoring } from '../services/monitoring-new';
import { getSocket } from '../services/wsClient-new';
import ExecutiveHeader from '../components/layout/ExecutiveHeader';
import QuickActions from '../components/layout/QuickActions';

export default function MonitoringPageWrapper() {
  const [logs, setLogs] = React.useState<any[]>([]);
  const [status, setStatus] = React.useState<any>(null);

  React.useEffect(() => {
    monitoring.logs().then(setLogs).catch(() => setLogs([]));
    monitoring.status().then(setStatus).catch(() => setStatus(null));
  }, []);

  // WebSocket connection for real-time updates
  React.useEffect(() => {
    const socket = getSocket('ws://localhost:8080');
    
    socket.on('connect', () => {
      console.log('Connected to monitoring WebSocket');
    });

    socket.on('logs', (newLogs) => {
      setLogs(prev => [...prev, ...newLogs]);
    });

    socket.on('status', (newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <ExecutiveHeader title="مانیتورینگ سیستم" subtitle="Persian Legal AI" actions={<QuickActions />} />
      <div className="panel elev-1" style={{ padding: '24px' }}>
        <div className="glass elev-1">
          <MonitoringPage 
            logs={logs}
            status={status}
          />
        </div>
      </div>
    </>
  );
}