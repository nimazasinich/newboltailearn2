import React from 'react';
import type { DatasetItem } from '../types/datasets';

type Props = {
  item: DatasetItem;
  busy?: boolean;
  progress?: number;
  onDownload: (id: string, title: string) => void;
};

const DatasetCard: React.FC<Props> = ({ item, busy, progress, onDownload }) => {
  return (
    <div className="backdrop-blur-md bg-white/60 rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col gap-3" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
        <div className="flex gap-2">
          {item.tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-slate-100 border border-slate-200">{tag}</span>
          ))}
        </div>
      </div>

      <p className="text-slate-600 text-sm leading-6">{item.description}</p>

      <div className="flex items-center justify-start gap-4 text-xs text-slate-600">
        {typeof item.sizeMB === 'number' && <span>حجم: {item.sizeMB} MB</span>}
        {typeof item.records === 'number' && <span>رکورد: {item.records.toLocaleString('fa-IR')}</span>}
        {item.license && <span>License: {item.license}</span>}
        {item.updatedAt && <span>Updated: {new Date(item.updatedAt).toLocaleDateString('fa-IR')}</span>}
      </div>

      <div className="mt-1">
        <button
          disabled={busy}
          onClick={() => onDownload(String(item.id), item.title || String(item.id))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 hover:bg-slate-50 disabled:opacity-60"
        >
          {busy ? (progress ? `Downloading ${progress}%` : 'Preparing…') : 'One-Click Download'}
        </button>

        {busy && (
          <div className="mt-2 h-2 w-full bg-slate-100 rounded">
            <div className="h-full rounded bg-slate-700 transition-all" style={{ width: `${progress ?? 0}%` }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DatasetCard;
