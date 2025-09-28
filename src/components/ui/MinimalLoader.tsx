import React from 'react';

type Props = {
  title?: string;
  subtitle?: string;
  progress?: number;
};

export default function MinimalLoader({
  title = 'Persian Legal AI',
  subtitle = 'Preparing…',
  progress
}: Props) {
  return (
    <div className="glass" style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center' }}>
      <div className="card elev-2" style={{ padding: '20px 22px', width: 'min(92vw, 360px)', textAlign: 'center' }}>
        <div className="h2" style={{ marginBottom: 8 }}>{title}</div>
        <div className="caption" style={{ marginBottom: 12, color: 'var(--muted)' }}>{subtitle}</div>
        <div style={{ height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${Math.max(0, Math.min(100, progress ?? 22))}%`,
              background: 'linear-gradient(90deg, var(--primary), var(--accent))',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>
    </div>
  );
}