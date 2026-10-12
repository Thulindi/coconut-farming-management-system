import React, { useState, useEffect } from 'react';
import { workerAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLORS = {
  ACTIVE: 'emerald',
  INACTIVE: 'slate'
};

const STATUS_LABELS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive'
};

const Workers = ({ embedded = false, refreshStats }) => {
  const { user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '', hireDate: new Date().toISOString().split('T')[0], status: 'ACTIVE', skills: '', hourlyRate: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    if (!user?.id) return;
    try { 
      const res = await workerAPI.getAll(user.id); 
      setWorkers(res.data?.content || res.data || []); 
    } catch (e) { 
      console.error(e); 
      alert('Error loading workers: ' + (e.response?.data?.message || e.message));
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const hireDate = form.hireDate && form.hireDate.length === 10 ? `${form.hireDate}T00:00:00` : form.hireDate;
      const data = { 
        ...form, 
        hireDate, 
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
        email: form.email || null,
        phoneNumber: form.phoneNumber || null,
        skills: form.skills || null
      };

      if (editingId) await workerAPI.update(editingId, user.id, data); 
      else await workerAPI.create(user.id, data);
      
      closeDialog(); 
      loadData();
      if (refreshStats) refreshStats();
    } catch (e) { 
      console.error(e); 
      alert('Error saving worker: ' + (e.response?.data?.message || e.response?.data?.error || e.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this worker?')) return;
    try { 
      await workerAPI.delete(id, user.id); 
      loadData(); 
      if (refreshStats) refreshStats(); 
    } catch (e) { 
      console.error(e); 
      alert('Error deleting worker: ' + (e.response?.data?.message || e.response?.data?.error || e.message));
    }
  };

  const openEdit = (w) => {
    setEditingId(w.id); 
    setForm({ 
      name: w.name, 
      email: w.email || '', 
      phoneNumber: w.phoneNumber || '', 
      hireDate: w.hireDate?.split('T')[0] || '', 
      status: w.status, 
      skills: w.skills || '', 
      hourlyRate: w.hourlyRate || '' 
    }); 
    setDialogOpen(true);
  };

  const closeDialog = () => { 
    setDialogOpen(false); 
    setEditingId(null); 
    setForm({ name: '', email: '', phoneNumber: '', hireDate: new Date().toISOString().split('T')[0], status: 'ACTIVE', skills: '', hourlyRate: '' }); 
  };

  return (
    <div className={`${embedded ? 'space-y-6' : 'space-y-8 pb-10'} animate-fade-in`}>
      
      {/* Sub-header Actions */}
      <div className="flex justify-end items-center mb-2">
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full transition-all shadow-md group"
        >
          <span className="material-symbols-outlined text-[18px]">{embedded ? 'add' : 'person_add'}</span>
          <span className="text-xs font-bold uppercase tracking-wider">{embedded ? 'Add Worker' : 'Register Worker'}</span>
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
                  <th className="pb-4">Name</th>
                  <th className="pb-4">Contact Details</th>
                  <th className="pb-4 pl-4 border-l border-slate-100/50">Skills</th>
                  <th className="pb-4 text-right">Rate / Hr</th>
                  <th className="pb-4 pl-4">Status</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {workers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 text-sm font-medium">
                      No workers found. Register your first worker to get started.
                    </td>
                  </tr>
                ) : (
                  workers.map((w) => {
                    const color = STATUS_COLORS[w.status] || 'slate';
                    return (
                      <tr key={w.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50/50 last:border-0 relative">
                        <td className="py-5 pr-4">
                          <p className="font-black text-slate-900">{w.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Hired {w.hireDate?.split('T')[0] || '-'}</p>
                        </td>
                        <td className="py-5 pr-4">
                          <div className="space-y-1">
                            <p className="font-medium text-slate-600 flex items-center space-x-2">
                              {w.phoneNumber && <span className="material-symbols-outlined text-[14px] text-slate-400">call</span>}
                              <span>{w.phoneNumber || 'No phone'}</span>
                            </p>
                            {w.email && (
                              <p className="font-medium text-slate-500 text-xs flex items-center space-x-2">
                                <span className="material-symbols-outlined text-[14px] text-slate-400">mail</span>
                                <span>{w.email}</span>
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-5 pl-4 border-l border-slate-100/50 pr-4">
                          <p className="font-bold text-slate-500 max-w-[150px] truncate">{w.skills || 'No specific skills'}</p>
                        </td>
                        <td className="py-5 font-black text-indigo-700 text-right pr-4">
                          {w.hourlyRate ? `Rs ${w.hourlyRate.toLocaleString()}` : '-'}
                        </td>
                        <td className="py-5 pl-4 h-full">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase mt-4 bg-${color}-100 text-${color}-700`}>
                            {STATUS_LABELS[w.status] || w.status}
                          </span>
                        </td>
                        <td className="py-5 text-right space-x-2 w-24">
                            <button 
                              onClick={() => openEdit(w)}
                              className="w-8 h-8 rounded-full bg-slate-50 hover:bg-indigo-600 text-slate-400 hover:text-white inline-flex items-center justify-center transition-colors shadow-sm"
                              title="Edit Worker"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(w.id)}
                              className="w-8 h-8 rounded-full bg-slate-50 hover:bg-rose-500 text-slate-400 hover:text-white inline-flex items-center justify-center transition-colors shadow-sm"
                              title="Delete Worker"
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

      {/* Add / Edit Worker Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
            
            <div className={`px-8 py-6 flex justify-between items-center bg-indigo-50 border-b border-indigo-100`}>
              <h2 className={`text-xl font-black text-indigo-900 tracking-tight font-headline flex items-center space-x-2`}>
                <span className="material-symbols-outlined text-indigo-600">
                  {editingId ? 'edit_square' : 'person_add'}
                </span>
                <span>{editingId ? 'Edit Worker Details' : 'Register New Worker'}</span>
              </h2>
              <button onClick={closeDialog} className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
              <form id="worker-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Phone Number</label>
                  <input
                    type="text"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Hire Date</label>
                  <input
                    type="date"
                    value={form.hireDate}
                    onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                  />
                </div>

                <div className="space-y-2 relative group/select">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Account Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all appearance-none cursor-pointer custom-select-arrow"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Hourly Rate (LKR)</label>
                  <input
                    type="number"
                    value={form.hourlyRate}
                    onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Key Skills</label>
                  <textarea
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all resize-none"
                    placeholder="E.g. Tractor driving, climbing..."
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
                form="worker-form"
                className={`px-6 py-2.5 rounded-full font-bold text-xs text-white uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 bg-indigo-600 hover:bg-indigo-700`}
              >
                {editingId ? 'Save Changes' : 'Add Worker'}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default Workers;
