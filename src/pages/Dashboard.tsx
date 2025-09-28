import React from 'react';
import Dashboard from 'ui/EnhancedDashboard';
import { monitoring } from '../services/monitoring-new';
import { training } from '../services/training-new';
import { datasets } from '../services/datasets-new';
import ExecutiveHeader from '../components/layout/ExecutiveHeader';
import QuickActions from '../components/layout/QuickActions';

export default function DashboardPage() {
  const [stat, setStat] = React.useState<any>(null);
  const [models, setModels] = React.useState<any[]>([]);
  const [datasetsList, setDatasetsList] = React.useState<any[]>([]);

  React.useEffect(() => {
    monitoring.status().then(setStat).catch(() => setStat(null));
    training.models().then(setModels).catch(() => setModels([]));
    datasets.list().then(setDatasetsList).catch(() => setDatasetsList([]));
  }, []);

  return (
    <>
      <ExecutiveHeader title="داشبورد پیشرفته" subtitle="Persian Legal AI" actions={<QuickActions />} />
      <div className="panel elev-1" style={{ padding: '24px' }}>
        <div className="glass elev-1">
          <Dashboard 
            systemStatus={stat}
            models={models}
            datasets={datasetsList}
          />
        </div>
      </div>
    </>
  );
}