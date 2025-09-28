import React from 'react';
import { ProjectDownloader } from 'ui/ProjectDownloader';
import { exporter } from '../services/export-new';
import ExecutiveHeader from '../components/layout/ExecutiveHeader';
import QuickActions from '../components/layout/QuickActions';

export default function ExportPage() {
  const handleExport = async (options: any) => {
    try {
      const result = await exporter.create(options);
      return result;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  };

  const handleDownload = async (exportId: string) => {
    try {
      const blob = await exporter.download(exportId);
      return blob;
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  };

  return (
    <>
      <ExecutiveHeader title="صادرات پروژه" subtitle="Persian Legal AI" actions={<QuickActions />} />
      <div className="panel elev-1" style={{ padding: '24px' }}>
        <div className="glass elev-1">
          <ProjectDownloader 
            onExport={handleExport}
            onDownload={handleDownload}
          />
        </div>
      </div>
    </>
  );
}