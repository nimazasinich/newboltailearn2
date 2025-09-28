import React from 'react';
import ModelsPage from 'ui/EnhancedModelsPage';
import { training } from '../services/training-new';
import { monitoring } from '../services/monitoring-new';
import ExecutiveHeader from '../components/layout/ExecutiveHeader';
import QuickActions from '../components/layout/QuickActions';

export default function ModelsPageWrapper() {
  const [models, setModels] = React.useState<any[]>([]);
  const [metrics, setMetrics] = React.useState<any>(null);

  React.useEffect(() => {
    training.models().then(setModels).catch(() => setModels([]));
    monitoring.status().then(setMetrics).catch(() => setMetrics(null));
  }, []);

  return (
    <>
      <ExecutiveHeader title="مدیریت مدل‌ها" subtitle="Persian Legal AI" actions={<QuickActions />} />
      <div className="panel elev-1" style={{ padding: '24px' }}>
        <div className="glass elev-1">
          <ModelsPage 
            models={models}
            metrics={metrics}
          />
        </div>
      </div>
    </>
  );
}