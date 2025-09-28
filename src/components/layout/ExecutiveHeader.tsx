import React from 'react';

export default function ExecutiveHeader({
  title,
  subtitle,
  actions
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="glass elev-1" style={{ margin: '16px', padding: '16px 18px', borderRadius: 'var(--radius)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div className="h1" style={{ fontSize: 28, fontWeight: 900 }}>{title}</div>
          {subtitle ? <div className="caption" style={{ color: 'var(--muted)', marginTop: 4 }}>{subtitle}</div> : null}
        </div>
        <div className="toolbar">{actions}</div>
      </div>
    </header>
  );
}