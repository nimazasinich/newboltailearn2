import * as React from 'react';

type IconProps = React.SVGProps<SVGSVGElement> & { className?: string };

export const ChartBarIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="1.5" d="M3 20h18M7 16v-6m5 6V8m5 8v-4"/>
  </svg>
);

export const BoltIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M11 2L3 14h6l-1 8 8-12h-6l1-8z"/>
  </svg>
);

export const PlayCircleIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm-2.5-6.5v-7l6 3.5-6 3.5Z"/>
  </svg>
);

export const CloudArrowDownIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="1.5" d="M7 18a4 4 0 1 1 .8-7.93A5 5 0 0 1 21 12a4 4 0 0 1-4 4h-2"/>
    <path strokeWidth="1.5" d="M12 7v8m0 0-3-3m3 3 3-3"/>
  </svg>
);

export const CheckBadgeIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 2 9.5 7 4 8l4 4-1 6 5-3 5 3-1-6 4-4-5.5-1L12 2Z"/>
    <path fill="#fff" d="M10.2 11.8 9 13l2 2 4-4-1.2-1.2-2.8 2.8-0.8-0.8Z"/>
  </svg>
);

export const ExclamationTriangleIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M1 20h22L12 2 1 20Zm12-3h-2v2h2v-2Zm0-6h-2v5h2v-5Z"/>
  </svg>
);
