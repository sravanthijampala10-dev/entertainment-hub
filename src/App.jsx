import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_BASE = "https://todolist.elevaitelabs.in/api/read_actor_movies.php"; // backend unchanged

function SmallBarChart({ data = [], width = 160, height = 60 }) {
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

export default function App() {
  const [records, setRecords] = useState([]);
  const [actor, setActor] = useState("");
  const [movie, setMovie] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Fetch records
  const fetchRecords = async () => {
    try {
      const res = await axios.get(`${API_BASE}/fetch.php`);
      setRecords(res.data);
    } catch (error) {
      console.error("Fetch error", error);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Add record
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!actor || !movie) return;

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/create.php`, {
        actor_name: actor,
        movie_name: movie,
      });
      setActor("");
      setMovie("");
      fetchRecords();
    } catch (error) {
      console.error("Create error", error);
    }
    setLoading(false);
  };

  // Delete record
  const deleteRecord = async (id) => {
    try {
      await axios.delete(`${API_BASE}/delete.php`, {
        data: { id },
      });
      fetchRecords();
    } catch (error) {
      console.error("Delete error", error);
    }
  };

  const total = records.length;
  const uniqueActors = useMemo(() => new Set(records.map(r => r.actor_name)).size, [records]);
  const moviesPerActor = useMemo(() => {
    const map = {};
    records.forEach(r => { map[r.actor_name] = (map[r.actor_name] || 0) + 1; });
    return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0,6).map(([k,v]) => ({label:k,value:v,color:'#f59e0b'}));
  }, [records]);

  const filtered = records.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'actor') return r.actor_name && r.actor_name.toLowerCase().includes(actor.toLowerCase());
    if (filter === 'movie') return r.movie_name && r.movie_name.toLowerCase().includes(movie.toLowerCase());
    return true;
  });

  // Sorting
  const sorted = useMemo(() => {
    const copy = [...filtered];
    if (sortBy === 'newest') return copy.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    if (sortBy === 'oldest') return copy.sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
    if (sortBy === 'actor') return copy.sort((a,b) => a.actor_name.localeCompare(b.actor_name));
    return copy;
  }, [filtered, sortBy]);

  // Pagination
  const pages = Math.max(1, Math.ceil(sorted.length / perPage));
  const pagedRecords = sorted.slice((page - 1) * perPage, page * perPage);

  // Recent activity (local only)
  const recent = useMemo(() => [...records].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)).slice(0,6), [records]);

  // Export CSV front-end only
  const exportCSV = () => {
    const headers = ['id','actor_name','movie_name','created_at'];
    const rows = records.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `records_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-black text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Sidebar */}
        <aside className={`md:col-span-1 bg-white/5 rounded-2xl p-6 border border-white/10 sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold text-amber-300 mb-1">Dashboard</h3>
              <p className="text-sm text-gray-400">Quick stats and insights — backend unchanged</p>
            </div>
            <div className="flex gap-2">
              <button title="Export CSV" onClick={exportCSV} className="btn-ghost">Export</button>
              <button title="Toggle" onClick={() => setSidebarCollapsed(s => !s)} className="btn-ghost">{sidebarCollapsed ? '☰' : '✕'}</button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-xs text-gray-400">Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{uniqueActors}</div>
              <div className="text-xs text-gray-400">Actors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{moviesPerActor.length}</div>
              <div className="text-xs text-gray-400">Top Actors</div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Top actors</h4>
            <SmallBarChart data={moviesPerActor} />
            <ul className="mt-3 text-sm text-gray-300 space-y-1">
              {moviesPerActor.map((m, i) => (
                <li key={i} className="flex justify-between">
                  <span>{m.label}</span>
                  <span className="text-amber-300 font-semibold">{m.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Filters</h4>
            <div className="flex gap-2">
              <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-lg ${filter==='all'?'bg-amber-400 text-black':''}`}>All</button>
              <button onClick={() => setFilter('actor')} className={`px-3 py-1 rounded-lg ${filter==='actor'?'bg-amber-400 text-black':''}`}>Actor</button>
              <button onClick={() => setFilter('movie')} className={`px-3 py-1 rounded-lg ${filter==='movie'?'bg-amber-400 text-black':''}`}>Movie</button>
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

        {/* Main area */}
        <main className="md:col-span-2 space-y-8">
          {/* Header */}
          <div className="text-center mb-2">
            <span className="inline-block px-4 py-1 mb-4 rounded-full text-sm bg-amber-400/20 text-amber-300">Movie Database SPA</span>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent">🎬 Actor & Movie Records</h1>
            <p className="text-gray-400 mt-1">Professional dashboard — Frontend only changes</p>
          </div>

          {/* Table Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4 gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-amber-300">📋 Stored Records</h2>
                  <div className="text-sm muted">{filtered.length} total</div>
                </div>
                <div className="flex items-center gap-3">
                  <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} className="btn-ghost">
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="actor">Actor</option>
                  </select>
                  <div className="text-sm muted">Page {page}/{pages}</div>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p-1))} className="btn-ghost">Prev</button>
                    <button onClick={() => setPage(p => Math.min(pages, p+1))} className="btn-ghost">Next</button>
                  </div>
                </div>
              </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-300 border-b border-white/20">
                    <th className="p-3">Actor Name</th>
                    <th className="p-3">Movie Name</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {pagedRecords.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center py-10 text-gray-400 italic">No records found. Add your first entry 🎥</td>
                    </tr>
                  )}

                  {pagedRecords.map((item) => (
                    <tr key={item.id} className="border-b border-white/10 hover:bg-white/5 transition">
                      <td className="p-3 font-medium">{item.actor_name}</td>
                      <td className="p-3 text-gray-300">{item.movie_name}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => deleteRecord(item.id)} className="px-4 py-1.5 rounded-lg text-sm font-medium bg-red-500/80 hover:bg-red-600 transition shadow-md">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Record Form */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/10">
            <h2 className="text-2xl font-semibold mb-6 text-amber-300">➕ Add New Record</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Actor Name</label>
                <input type="text" placeholder="e.g. Allu Arjun" value={actor} onChange={(e) => setActor(e.target.value)} className="w-full p-3 rounded-xl bg-black/40 border border-white/20 focus:ring-2 focus:ring-amber-400 focus:outline-none transition" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Movie Name</label>
                <input type="text" placeholder="e.g. Pushpa" value={movie} onChange={(e) => setMovie(e.target.value)} className="w-full p-3 rounded-xl bg-black/40 border border-white/20 focus:ring-2 focus:ring-amber-400 focus:outline-none transition" />
              </div>

              <div className="flex items-end">
                <button type="submit" disabled={loading} className="w-full h-[48px] rounded-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 text-black hover:scale-105 transition transform shadow-lg">{loading ? "Saving..." : "Add Record"}</button>
              </div>
            </form>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">Built with React • Tailwind CSS • PHP • MySQL</p>
        </main>
      </div>
    </div>
  );
}
