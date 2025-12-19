import React from 'react';

export default function StatCard({ value, label, accent = 'amber', className = '' }) {
  return (
    <div className={`bg-white/3 rounded-xl p-4 ${className}`}>
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-2xl font-bold text-amber-300">{value}</div>
    </div>
  );
}
