import React, { useState, useEffect } from 'react';
import { workLogAPI, workerAPI, taskAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const WorkLogs = ({ embedded = false, refreshStats }) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    workerId: '',
    taskId: '',
    workDate: new Date().toISOString().split('T')[0],
    hoursWorked: '',
    calculatedSalary: '',
    salaryOverride: false,
    description: ''
  });

  // Derived: auto-calculated salary preview
  const selectedWorker = workers.find(w => String(w.id) === String(form.workerId));
  const hourlyRate = selectedWorker?.hourlyRate || 0;
  const autoSalary = form.hoursWorked ? (Number(form.hoursWorked) * hourlyRate).toFixed(2) : '0.00';
  const displaySalary = form.salaryOverride ? form.calculatedSalary : autoSalary;

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const [lRes, wRes, tRes] = await Promise.all([
        workLogAPI.getAll(user.id),
        workerAPI.getAll(user.id),
        taskAPI.getAll(user.id)
      ]);
      setLogs(lRes.data || []);
      setWorkers(wRes.data || []);
      setTasks(tRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const salaryToSend = form.salaryOverride ? Number(form.calculatedSalary) : Number(autoSalary);
      const data = {
        ...form,
        hoursWorked: Number(form.hoursWorked),
        calculatedSalary: salaryToSend,
        taskId: form.taskId || null,
      };
      if (editingId) await workLogAPI.update(editingId, user.id, data);
      else await workLogAPI.create(user.id, data);

      closeDialog();
      loadData();
      if (refreshStats) refreshStats();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this work log? The linked salary expense will also be removed.')) return;
    try {
      await workLogAPI.delete(id, user.id);
      loadData();
      if (refreshStats) refreshStats();
    } catch (e) {
      console.error(e);
    }
  };

  const openEdit = (l) => {
    setEditingId(l.id);
    setForm({
      workerId: l.workerId || '',
      taskId: l.taskId || '',
      workDate: l.workDate?.split('T')[0] || '',
      hoursWorked: l.hoursWorked || '',
      calculatedSalary: l.calculatedSalary || '',
      salaryOverride: false,
      description: l.notes || ''
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm({ workerId: '', taskId: '', workDate: new Date().toISOString().split('T')[0], hoursWorked: '', calculatedSalary: '', salaryOverride: false, description: '' });
  };

  const totalLaborCost = logs.reduce((sum, l) => sum + (l.calculatedSalary || 0), 0);

  return (
    <div className={`${embedded ? 'space-y-6' : 'space-y-8 pb-10'} animate-fade-in`}>
      {/* Header */}
      {!embedded && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter font-headline mb-2">Work Logs</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Track worked hours & salary costs</p>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[18px]">more_time</span>
            <span className="text-xs font-bold uppercase tracking-wider">Log Hours</span>
          </button>
        </div>
      )}

      {/* Embedded-only Header Row */}
      {embedded && (
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight font-headline">Timesheets</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Track worked hours & salary costs</p>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full transition-all shadow-md group"
          >
            <span className="material-symbols-outlined text-[18px]">more_time</span>
            <span className="text-xs font-bold uppercase tracking-wider">Log Hours</span>
          </button>
        </div>
      )}

      {/* Total Labor Cost Banner */}
      {logs.length > 0 && (
        <div className="flex items-center space-x-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl px-6 py-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-indigo-600 text-xl">payments</span>
          </div>
          <div>
            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Total Labor Cost (All Logs)</p>
            <p className="text-2xl font-black text-indigo-700 tracking-tighter">
              Rs. {totalLaborCost.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="ml-auto text-[10px] font-bold text-indigo-400 uppercase tracking-widest hidden md:block">
            Auto-synced to Financial Module
            <span className="material-symbols-outlined text-emerald-500 text-[14px] ml-1 align-middle">check_circle</span>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">

        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-bl-[100px] -z-10 opacity-50"></div>

        {loading ? (
          <div className="flex justify-center flex-col items-center py-12 space-y-4">
            <span className="material-symbols-outlined text-4xl text-slate-300 animate-spin">autorenew</span>
          </div>
        ) : (
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 tracking-widest uppercase border-b border-slate-100/50">
                  <th className="pb-4">Date</th>
                  <th className="pb-4">Worker</th>
                  <th className="pb-4">Task / Assignment</th>
                  <th className="pb-4 text-right">Hours</th>
                  <th className="pb-4 text-right">Salary (Rs.)</th>
                  <th className="pb-4 pl-4 border-l border-slate-100/50">Notes</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 text-sm font-medium">
                      No work logs found. Log hours to get started.
                    </td>
                  </tr>
                ) : (
                  logs.map((l) => (
                    <tr key={l.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50/50 last:border-0 relative">
                      <td className="py-5 font-bold text-slate-900 pr-4">{new Date(l.workDate).toLocaleDateString()}</td>
                      <td className="py-5 pr-4">
                        <div className="flex items-center space-x-3">
                          {l.workerName ? (
                            <>
                              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                                {l.workerName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-slate-700 block">{l.workerName}</span>
                                {l.workerHourlyRate > 0 && (
                                  <span className="text-[9px] font-bold text-slate-400">Rs.{l.workerHourlyRate}/hr</span>
                                )}
                              </div>
                            </>
                          ) : (
                            <span className="font-bold text-slate-400 italic">Unknown</span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 font-bold text-slate-600 pr-4 max-w-[180px] truncate">{l.taskTitle || '-'}</td>
                      <td className="py-5 font-black text-indigo-700 text-right pr-4">{l.hoursWorked} h</td>
                      <td className="py-5 text-right pr-4">
                        <span className={`font-black text-sm ${(l.calculatedSalary || 0) > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                          {(l.calculatedSalary || 0) > 0 ? `Rs. ${(l.calculatedSalary).toLocaleString('en-LK', {minimumFractionDigits: 2})}` : '—'}
                        </span>
                      </td>
                      <td className="py-5 font-medium text-slate-500 pl-4 border-l border-slate-100/50 pr-4 max-w-[180px] truncate">{l.notes || '-'}</td>
                      <td className="py-5 text-right space-x-2 w-24">
                        <button
                          onClick={() => openEdit(l)}
                          className="w-8 h-8 rounded-full bg-slate-50 hover:bg-indigo-600 text-slate-400 hover:text-white inline-flex items-center justify-center transition-colors shadow-sm"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(l.id)}
                          className="w-8 h-8 rounded-full bg-slate-50 hover:bg-rose-500 text-slate-400 hover:text-white inline-flex items-center justify-center transition-colors shadow-sm"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]">

            <div className="px-8 py-6 flex justify-between items-center bg-indigo-50 border-b border-indigo-100">
              <h2 className="text-xl font-black text-indigo-900 tracking-tight font-headline flex items-center space-x-2">
                <span className="material-symbols-outlined text-indigo-600">
                  {editingId ? 'edit_square' : 'more_time'}
                </span>
                <span>{editingId ? 'Edit Work Log' : 'Add Work Log'}</span>
              </h2>
              <button type="button" onClick={closeDialog} className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
              <form id="log-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                <div className="space-y-2 relative group/select">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Assign Worker *</label>
                  <select
                    required
                    value={form.workerId}
                    onChange={(e) => setForm({ ...form, workerId: e.target.value, salaryOverride: false, calculatedSalary: '' })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all appearance-none cursor-pointer custom-select-arrow"
                  >
                    <option value="" disabled>Select Worker</option>
                    {workers.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name}{w.hourlyRate ? ` — Rs.${w.hourlyRate}/hr` : ' — No rate set'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 relative group/select">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Related Task</label>
                  <select
                    value={form.taskId}
                    onChange={(e) => setForm({ ...form, taskId: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all appearance-none cursor-pointer custom-select-arrow"
                  >
                    <option value="">No specific task</option>
                    {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={form.workDate}
                    onChange={(e) => setForm({ ...form, workDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Hours Worked *</label>
                  <input
                    type="number"
                    required
                    step="0.5"
                    value={form.hoursWorked}
                    onChange={(e) => setForm({ ...form, hoursWorked: e.target.value, salaryOverride: false, calculatedSalary: '' })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                    placeholder="e.g. 5.5"
                  />
                </div>

                {/* Salary Section */}
                <div className="sm:col-span-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Calculated Salary</p>
                      <p className="text-2xl font-black text-indigo-700 mt-1">
                        Rs. {Number(displaySalary || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                      </p>
                      {!form.salaryOverride && form.workerId && (
                        <p className="text-[10px] text-slate-400 font-medium mt-1">
                          {form.hoursWorked || '0'}h × Rs.{hourlyRate}/hr (auto)
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Manual Override</p>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={form.salaryOverride}
                          onChange={(e) => setForm({ ...form, salaryOverride: e.target.checked, calculatedSalary: e.target.checked ? autoSalary : '' })}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-indigo-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>

                  {form.salaryOverride && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase">Override Amount (Rs.)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={form.calculatedSalary}
                        onChange={(e) => setForm({ ...form, calculatedSalary: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl text-sm font-black text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                        placeholder="Enter custom salary amount..."
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Work Notes</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all resize-none"
                    placeholder="Briefly describe what was done..."
                  />
                </div>

              </form>
            </div>

            <div className="px-8 py-6 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50">
              <button
                type="button"
                onClick={closeDialog}
                className="px-6 py-2.5 rounded-full font-bold text-xs text-slate-500 hover:bg-slate-200 uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="log-form"
                className="px-6 py-2.5 rounded-full font-bold text-xs text-white uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 bg-indigo-600 hover:bg-indigo-700"
              >
                {editingId ? 'Save Changes' : 'Add Work Log'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default WorkLogs;
