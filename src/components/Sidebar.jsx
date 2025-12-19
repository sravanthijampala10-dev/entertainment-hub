import React from 'react';
import StatCard from './StatCard';
import SmallBarChart from './SmallBarChart';

export default function Sidebar({ total, uniqueActors, topCount, topActors, recent, onFilter, collapsed, onToggle }) {
  return (
    <aside className={`bg-white/5 rounded-2xl p-6 border border-white/10 sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-amber-300 mb-1">Dashboard</h3>
          <p className="text-sm text-gray-400">Insights & quick actions</p>
        </div>
        <div className="flex gap-2">
          <button title="Toggle" onClick={onToggle} className="btn-ghost">{collapsed ? '☰' : '✕'}</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard value={total} label="Records" />
        <StatCard value={uniqueActors} label="Actors" />
        <StatCard value={topCount} label="Top Actors" />
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Top actors</h4>
        <SmallBarChart data={topActors} />
        <ul className="mt-3 text-sm text-gray-300 space-y-1">
          {topActors.map((m, i) => (
            <li key={i} className="flex justify-between">
              <span>{m.label}</span>
              <span className="text-amber-300 font-semibold">{m.value}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium mb-2">Filters</h4>
        <div className="flex gap-2">
          <button onClick={() => onFilter('all')} className="px-3 py-1 rounded-lg bg-amber-400 text-black">All</button>
          <button onClick={() => onFilter('actor')} className="px-3 py-1 rounded-lg bg-white/5">Actor</button>
          <button onClick={() => onFilter('movie')} className="px-3 py-1 rounded-lg bg-white/5">Movie</button>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
        <ul className="text-sm text-gray-300 space-y-2">
          {recent.map((r) => (
            <li key={r.id} className="flex justify-between items-center">
              <div className="truncate">{r.actor_name} — <span className="muted">{r.movie_name}</span></div>
              <div className="text-xs muted">{new Date(r.created_at).toLocaleDateString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
