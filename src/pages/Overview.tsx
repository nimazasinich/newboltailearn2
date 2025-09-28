import React from 'react';
import Overview from 'ui/EnhancedOverview';
import { monitoring } from '../services/monitoring-new';
import ExecutiveHeader from '../components/layout/ExecutiveHeader';
import QuickActions from '../components/layout/QuickActions';

export default function OverviewPage() {
  const [stat, setStat] = React.useState<any>(null);

  React.useEffect(() => {
    monitoring.status().then(setStat).catch(() => setStat(null));
  }, []);

  return (
    <>
      <ExecutiveHeader title="نمای کلی سیستم" subtitle="Persian Legal AI" actions={<QuickActions />} />
      <div className="panel elev-1" style={{ padding: '24px' }}>
        <div className="glass elev-1">
          <Overview systemStatus={stat} />
        </div>
      </div>
    </>
  );
}