import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { taskAPI, workLogAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const STATUS_CONFIG = {
  IN_PROGRESS: { label: 'In Progress', color: '#4f46e5' },
  COMPLETED:   { label: 'Completed',   color: '#10b981' },
  CANCELLED:   { label: 'Cancelled',   color: '#f43f5e' },
};

const WORKER_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#f43f5e', '#84cc16'];

const StatusTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-xl">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-indigo-700">{payload[0].value} <span className="text-sm font-bold text-slate-400">tasks</span></p>
      </div>
    );
  }
  return null;
};

const WorkerTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-xl">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-black text-indigo-700">{payload[0].value}h worked</p>
      </div>
    );
  }
  return null;
};

const LaborAnalytics = ({ embedded = false }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const [tRes, lRes] = await Promise.all([
        taskAPI.getAll(user.id),
        workLogAPI.getAll(user.id)
      ]);
      setTasks(tRes.data || []);
      setLogs(lRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center py-20 space-y-4 animate-fade-in">
        <span className="material-symbols-outlined text-4xl text-indigo-300 animate-spin">autorenew</span>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Analytics...</p>
      </div>
    );
  }

  // Task Status breakdown
  const totalTasks = tasks.length;
  const statusChartData = Object.keys(STATUS_CONFIG).map(key => ({
    name: STATUS_CONFIG[key].label,
    count: tasks.filter(t => t.status === key).length,
    color: STATUS_CONFIG[key].color,
  }));

  // Worker hours per worker
  const workerMap = {};
  logs.forEach(l => {
    const name = l.workerName || 'Unknown';
    if (!workerMap[name]) workerMap[name] = 0;
    workerMap[name] = +(workerMap[name] + (l.hoursWorked || 0)).toFixed(1);
  });
  const workerChartData = Object.entries(workerMap)
    .map(([name, hours]) => ({ name, 'Hours': hours }))
    .sort((a, b) => b['Hours'] - a['Hours'])
    .slice(0, 7);

  return (
    <div className={`${embedded ? 'space-y-6' : 'space-y-8 pb-10'} animate-fade-in`}>

      {!embedded && (
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter font-headline mb-2">Analytics</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Workforce intelligence & breakdown</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* ── Task Status Chart ── */}
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center space-x-3 border-b border-slate-50 pb-4 mb-6">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-indigo-600 text-[18px]">bar_chart</span>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight leading-none">Task Status</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{totalTasks} total tasks</p>
            </div>
          </div>

          {/* Status tiles */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {statusChartData.map(s => (
              <div key={s.name} className="rounded-2xl p-3 text-center" style={{ backgroundColor: s.color + '18' }}>
                <p className="text-xl font-black" style={{ color: s.color }}>{s.count}</p>
                <p className="text-[9px] font-bold mt-0.5 uppercase tracking-widest" style={{ color: s.color }}>{s.name}</p>
              </div>
            ))}
          </div>

          {/* Fixed-height bar chart */}
          <div style={{ height: 200 }}>
            {totalTasks > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} barSize={44} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<StatusTooltip />} cursor={{ fill: '#f8fafc', radius: 8 }} />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                    {statusChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-slate-300">
                  <span className="material-symbols-outlined text-5xl block mb-2">bar_chart</span>
                  <p className="text-sm font-bold text-slate-400">No tasks yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Worker Hours Chart ── */}
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center space-x-3 border-b border-slate-50 pb-4 mb-6">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-600 text-[18px]">groups</span>
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight leading-none">Worker Hours</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Hours logged per worker</p>
            </div>
          </div>

          {/* Fixed-height horizontal bar chart */}
          <div style={{ height: 300 }}>
            {workerChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={workerChartData}
                  layout="vertical"
                  barSize={20}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  barCategoryGap="30%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#475569' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<WorkerTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="Hours" radius={[0, 8, 8, 0]}>
                    {workerChartData.map((_, i) => (
                      <Cell key={i} fill={WORKER_COLORS[i % WORKER_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-slate-300">
                  <span className="material-symbols-outlined text-5xl block mb-2">groups</span>
                  <p className="text-sm font-bold text-slate-400">No work logs yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LaborAnalytics;
