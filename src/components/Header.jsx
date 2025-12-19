import React from 'react';

export default function Header({ onSearch, exportCSV }) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold text-amber-300">🎬 Movie Dashboard</h2>
        <p className="text-sm text-gray-400">Centralized view — frontend only</p>
      </div>

      <div className="flex items-center gap-3">
        <input
          onChange={(e) => onSearch && onSearch(e.target.value)}
          placeholder="Quick search actors or movies..."
          className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm w-72 focus:ring-2 focus:ring-amber-400 outline-none"
        />
        <button onClick={exportCSV} className="px-3 py-2 rounded-lg bg-amber-400 text-black font-medium">Export CSV</button>
      </div>
    </header>
  );
}
