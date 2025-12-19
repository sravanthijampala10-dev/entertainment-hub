import React from 'react';

export default function SmallBarChart({ data = [], width = 160, height = 60 }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const bw = width / (data.length || 1);
  return (
    <svg width={width} height={height} className="block">
      {data.map((d, i) => {
        const h = (d.value / max) * (height - 12);
        return (
          <rect key={i} x={i * bw + 4} y={height - h - 6} width={bw - 8} height={h} rx={3} fill={d.color || '#f59e0b'} />
        );
      })}
    </svg>
  );
}
