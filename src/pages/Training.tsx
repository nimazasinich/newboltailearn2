import React from 'react';
import TrainingManagement from 'ui/TrainingManagement';
import { training } from '../services/training-new';
import { datasets } from '../services/datasets-new';
import ExecutiveHeader from '../components/layout/ExecutiveHeader';
import QuickActions from '../components/layout/QuickActions';

export default function TrainingPage() {
  const [models, setModels] = React.useState<any[]>([]);
  const [datasetsList, setDatasetsList] = React.useState<any[]>([]);

  React.useEffect(() => {
    training.models().then(setModels).catch(() => setModels([]));
    datasets.list().then(setDatasetsList).catch(() => setDatasetsList([]));
  }, []);

  const handleStartTraining = async (modelId: string, datasetId: string) => {
    try {
      await training.start(modelId, datasetId);
    } catch (error) {
      console.error('Training start failed:', error);
    }
  };

  return (
    <>
      <ExecutiveHeader title="مدیریت آموزش" subtitle="Persian Legal AI" actions={<QuickActions />} />
      <div className="panel elev-1" style={{ padding: '24px' }}>
        <div className="glass elev-1">
          <TrainingManagement 
            models={models}
            datasets={datasetsList}
            onStartTraining={handleStartTraining}
          />
        </div>
      </div>
    </>
  );
}