import React from 'react';

export default function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 10,
            background: 'linear-gradient(90deg, rgba(255,255,255,.06), rgba(0,0,0,.06), rgba(255,255,255,.06))',
            borderRadius: 6,
            margin: '8px 0',
            animation: 'sk 1.2s linear infinite'
          }}
        />
      ))}
      <style>
        {`
          @keyframes sk {
            0% { background-position: -200px 0; }
            100% { background-position: 200px 0; }
          }
        `}
      </style>
    </div>
  );
}