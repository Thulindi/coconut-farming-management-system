import React, { useState, useEffect } from 'react';
import { taskAPI, workerAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const PRIORITY_COLORS = {
  HIGH: 'amber',
  MEDIUM: 'sky',
  LOW: 'slate'
};

const STATUS_COLORS = {
  COMPLETED: 'emerald',
  IN_PROGRESS: 'indigo',
  CANCELLED: 'rose'
};

const STATUS_LABELS = {
  COMPLETED: 'Completed',
  IN_PROGRESS: 'In Progress',
  CANCELLED: 'Cancelled'
};

const CATEGORIES = ['Planting', 'Harvesting', 'Fertilizing', 'Pest Control', 'Irrigation', 'Maintenance', 'Other'];

const Tasks = ({ embedded = false, refreshStats }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'IN_PROGRESS', workerId: '', category: '', dueDate: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const [tRes, wRes] = await Promise.all([
        taskAPI.getAll(user.id), 
        workerAPI.getAll(user.id)
      ]);
      setTasks(tRes.data || []); 
      setWorkers(wRes.data || []); 
    } catch (e) { 
      console.error(e); 
      alert('Error loading task data: ' + (e.response?.data?.message || e.message));
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dueDate = form.dueDate && form.dueDate.length === 10 ? `${form.dueDate}T00:00:00` : form.dueDate;
      const data = { 
        ...form, 
        dueDate,
        workerId: form.workerId || null,
        estimatedHours: null
      };

      if (editingId) await taskAPI.update(editingId, user.id, data); 
      else await taskAPI.create(user.id, data);
      
      closeDialog(); 
      loadData();
      if (refreshStats) refreshStats();
    } catch (e) { 
      console.error(e); 
      alert('Error saving task: ' + (e.response?.data?.message || e.response?.data?.error || e.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try { 
      await taskAPI.delete(id, user.id); 
      loadData(); 
      if (refreshStats) refreshStats(); 
    } catch (e) { 
      console.error(e); 
      alert('Error deleting task: ' + (e.response?.data?.message || e.response?.data?.error || e.message));
    }
  };

  const openEdit = (t) => {
    setEditingId(t.id); 
    setForm({ 
      title: t.title, 
      description: t.description || '', 
      priority: t.priority, 
      status: t.status, 
      workerId: t.workerId || '', 
      category: t.category || '', 
      dueDate: t.dueDate?.split('T')[0] || ''
    }); 
    setDialogOpen(true);
  };

  const closeDialog = () => { 
    setDialogOpen(false); 
    setEditingId(null); 
    setForm({ title: '', description: '', priority: 'MEDIUM', status: 'IN_PROGRESS', workerId: '', category: '', dueDate: '' }); 
  };

  return (
    <div className={`${embedded ? 'space-y-6' : 'space-y-8 pb-10'} animate-fade-in`}>
      
      {/* Sub-header Actions */}
      <div className="flex justify-end items-center mb-2">
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full transition-all shadow-md group"
        >
          <span className="material-symbols-outlined text-[18px]">{embedded ? 'add' : 'add_task'}</span>
          <span className="text-xs font-bold uppercase tracking-wider">{embedded ? 'Add Task' : 'Create Task'}</span>
        </button>
      </div>

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
                  <th className="pb-4">Task Details</th>
                  <th className="pb-4">Assigned To</th>
                  <th className="pb-4 pl-4 border-l border-slate-100/50">Category</th>
                  <th className="pb-4 text-center">Priority</th>
                  <th className="pb-4 text-center">Status</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 text-sm font-medium">
                      No tasks found. Create a new task to get started.
                    </td>
                  </tr>
                ) : (
                  tasks.map((t) => {
                    const statusColor = STATUS_COLORS[t.status] || 'slate';
                    const priorityColor = PRIORITY_COLORS[t.priority] || 'slate';
                    return (
                      <tr key={t.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50/50 last:border-0 relative">
                        <td className="py-5 pr-4">
                          <p className="font-black text-slate-900">{t.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 flex items-center space-x-1">
                             <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                             <span>Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No Date set'}</span>
                          </p>
                        </td>
                        <td className="py-5 pr-4">
                          <div className="flex items-center space-x-3">
                            {t.workerName ? (
                              <>
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                                  {t.workerName.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-bold text-slate-700">{t.workerName}</span>
                              </>
                            ) : (
                              <span className="font-bold text-slate-400 italic">Unassigned</span>
                            )}
                          </div>
                        </td>
                        <td className="py-5 pl-4 border-l border-slate-100/50 pr-4">
                           <span className="font-bold text-slate-600">{t.category || '-'}</span>
                        </td>
                        <td className="py-5 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-${priorityColor}-100 text-${priorityColor}-700`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-5 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-${statusColor}-100 text-${statusColor}-700 border border-${statusColor}-200`}>
                            {STATUS_LABELS[t.status] || t.status}
                          </span>
                        </td>
                        <td className="py-5 text-right space-x-2 w-24">
                            <button 
                              onClick={() => openEdit(t)}
                              className="w-8 h-8 rounded-full bg-slate-50 hover:bg-indigo-600 text-slate-400 hover:text-white inline-flex items-center justify-center transition-colors shadow-sm"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(t.id)}
                              className="w-8 h-8 rounded-full bg-slate-50 hover:bg-rose-500 text-slate-400 hover:text-white inline-flex items-center justify-center transition-colors shadow-sm"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
            
            <div className={`px-8 py-6 flex justify-between items-center bg-indigo-50 border-b border-indigo-100`}>
              <h2 className={`text-xl font-black text-indigo-900 tracking-tight font-headline flex items-center space-x-2`}>
                <span className="material-symbols-outlined text-indigo-600">
                  {editingId ? 'edit_square' : 'add_task'}
                </span>
                <span>{editingId ? 'Edit Task' : 'Create New Task'}</span>
              </h2>
              <button type="button" onClick={closeDialog} className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
              <form id="task-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                    placeholder="e.g. Harvest block B"
                  />
                </div>

                <div className="space-y-2 relative group/select">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Assign Worker</label>
                    <select
                      value={form.workerId}
                      onChange={(e) => setForm({ ...form, workerId: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all appearance-none cursor-pointer custom-select-arrow"
                    >
                      <option value="">Unassigned</option>
                      {workers.filter(w => w.status === 'ACTIVE').map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                </div>

                <div className="space-y-2 relative group/select">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all appearance-none cursor-pointer custom-select-arrow"
                    >
                      <option value="">None</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="space-y-2 relative group/select">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all appearance-none cursor-pointer custom-select-arrow"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div className="space-y-2 relative group/select">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all appearance-none cursor-pointer custom-select-arrow"
                  >
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                  />
                </div>


                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all resize-none"
                    placeholder="Provide detailed instructions..."
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
                form="task-form"
                className={`px-6 py-2.5 rounded-full font-bold text-xs text-white uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 bg-indigo-600 hover:bg-indigo-700`}
              >
                {editingId ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default Tasks;
