import React from 'react';
import DatasetGallery from 'ui/DatasetGallery';
import { datasets } from '../services/datasets-new';
import ExecutiveHeader from '../components/layout/ExecutiveHeader';
import QuickActions from '../components/layout/QuickActions';

export default function DatasetsPage() {
  const [datasetsList, setDatasetsList] = React.useState<any[]>([]);

  React.useEffect(() => {
    datasets.list().then(setDatasetsList).catch(() => setDatasetsList([]));
  }, []);

  const handleUpload = async (file: File) => {
    try {
      await datasets.upload(file);
      // Refresh the list
      datasets.list().then(setDatasetsList).catch(() => setDatasetsList([]));
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Add delete functionality if available
      console.log('Delete dataset:', id);
      // Refresh the list
      datasets.list().then(setDatasetsList).catch(() => setDatasetsList([]));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <>
      <ExecutiveHeader title="گالری داده‌ها" subtitle="Persian Legal AI" actions={<QuickActions />} />
      <div className="panel elev-1" style={{ padding: '24px' }}>
        <div className="glass elev-1">
          <DatasetGallery 
            datasets={datasetsList}
            onUpload={handleUpload}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </>
  );
}