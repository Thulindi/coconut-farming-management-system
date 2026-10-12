import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fertilizerAPI, landAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const Fertilizing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [land, setLand] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const initialForm = {
    fertilizerType: '',
    frequency: 'MONTHLY',
    recommendedQuantity: '',
    nextDueDate: new Date().toISOString().split('T')[0],
    applicationMethod: '',
    notes: '',
    status: 'ACTIVE'
  };
  
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const [landRes, schedulesRes] = await Promise.all([
        landAPI.getById(id, user.id),
        fertilizerAPI.getSchedules(id, user.id),
      ]);
      setLand(landRes.data);
      setSchedules(schedulesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const handleOpenEdit = (schedule) => {
    setEditId(schedule.id);
    setForm({
      fertilizerType: schedule.fertilizerType,
      frequency: schedule.frequency,
      recommendedQuantity: schedule.recommendedQuantity.toString(),
      nextDueDate: schedule.nextDueDate,
      applicationMethod: schedule.applicationMethod || '',
      notes: schedule.notes || '',
      status: schedule.status || 'ACTIVE'
    });
    setDialogOpen(true);
  };

  const handleDelete = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await fertilizerAPI.deleteSchedule(scheduleId, user.id);
      loadData();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Error deleting schedule');
    }
  };

  const handleMarkCompleted = async (schedule) => {
    try {
      await fertilizerAPI.updateSchedule(schedule.id, user.id, {
        ...schedule,
        status: 'COMPLETED'
      });
      loadData();
    } catch (error) {
      console.error('Error marking as completed:', error);
      alert('Error updating status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await fertilizerAPI.updateSchedule(editId, user.id, {
          ...form,
          recommendedQuantity: Number(form.recommendedQuantity),
        });
      } else {
        await fertilizerAPI.createSchedule(id, user.id, {
          ...form,
          recommendedQuantity: Number(form.recommendedQuantity),
        });
      }
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Error saving schedule: ' + (error.response?.data?.message || error.message));
    }
  };

  const isOverdue = (date, status) => {
    if (status !== 'ACTIVE') return false;
    return new Date(date) < new Date().setHours(0, 0, 0, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 flex-col space-y-4 animate-fade-in">
        <span className="material-symbols-outlined text-5xl text-[#2c4d3f] animate-spin">autorenew</span>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading schedules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div>
        <button 
          onClick={() => navigate(`/plantation/lands/${id}`)}
          className="group flex items-center space-x-2 text-slate-400 hover:text-[#2c4d3f] transition-colors mb-4"
        >
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="text-[10px] font-bold tracking-widest uppercase">Back to Land Details</span>
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter font-headline mb-2">Fertilizing Schedule</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {land?.locationName} - {land?.district}
            </p>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 bg-[#2c4d3f] hover:bg-[#1f382d] text-white px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="text-xs font-bold uppercase tracking-wider">Add Schedule</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-bl-[100px] -z-10 opacity-50"></div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 tracking-widest uppercase border-b border-slate-100/50">
                <th className="pb-4">Fertilizer Type</th>
                <th className="pb-4">Frequency</th>
                <th className="pb-4 text-right">Quantity</th>
                <th className="pb-4">Method</th>
                <th className="pb-4">Status</th>
                <th className="pb-4 text-right">Next Due</th>
                <th className="pb-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 text-sm font-medium">
                    No fertilizer schedules found. Add a new schedule to get started.
                  </td>
                </tr>
              ) : (
                schedules.map((schedule) => (
                  <tr key={schedule.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50/50 last:border-0 relative">
                    <td className="py-5 font-bold text-slate-900 pr-4">{schedule.fertilizerType}</td>
                    <td className="py-5 font-medium text-slate-500 pr-4">{schedule.frequency}</td>
                    <td className="py-5 font-bold text-slate-700 text-right pr-4">{schedule.recommendedQuantity} kg</td>
                    <td className="py-5 font-medium text-slate-500 pr-4">{schedule.applicationMethod || '-'}</td>
                    <td className="py-5 pr-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center w-fit px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                          (schedule.status || 'ACTIVE') === 'ACTIVE' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : schedule.status === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-500'
                        }`}>
                          {schedule.status || 'ACTIVE'}
                        </span>
                        {isOverdue(schedule.nextDueDate, schedule.status) && (
                          <span className="flex items-center text-[9px] font-black text-red-500 uppercase tracking-tighter animate-pulse">
                            <span className="material-symbols-outlined text-[12px] mr-1">warning</span>
                            Overdue
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`py-5 text-right font-bold ${isOverdue(schedule.nextDueDate, schedule.status) ? 'text-red-500' : 'text-slate-700'}`}>
                      {schedule.nextDueDate ? new Date(schedule.nextDueDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {schedule.status === 'ACTIVE' && (
                            <button 
                                onClick={() => handleMarkCompleted(schedule)}
                                className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center justify-center cursor-pointer group/btn"
                                title="Mark as Completed"
                            >
                                <span className="material-symbols-outlined text-[18px]">done_all</span>
                            </button>
                        )}
                        <button 
                            onClick={() => handleOpenEdit(schedule)}
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center cursor-pointer group/btn"
                            title="Edit"
                        >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                            onClick={() => handleDelete(schedule.id)}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center justify-center cursor-pointer group/btn"
                            title="Delete"
                        >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
            
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-slate-900 tracking-tight font-headline">
                {editId ? 'Modify Fertilizer Schedule' : 'Add Fertilizer Schedule'}
              </h2>
              <button onClick={() => setDialogOpen(false)} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              <form id="fertilizer-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Fertilizer Type *</label>
                  <input
                    type="text"
                    required
                    value={form.fertilizerType}
                    onChange={(e) => setForm({ ...form, fertilizerType: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
                    placeholder="e.g. Urea, NPK"
                  />
                </div>

                <div className="space-y-2 relative group/select">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Frequency</label>
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all appearance-none cursor-pointer custom-select-arrow"
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="SEMI_ANNUAL">Semi-Annual</option>
                    <option value="ANNUAL">Yearly</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Next Due Date *</label>
                  <input
                    type="date"
                    required
                    value={form.nextDueDate}
                    onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Quantity (kg) *</label>
                  <input
                    type="number"
                    required
                    value={form.recommendedQuantity}
                    onChange={(e) => setForm({ ...form, recommendedQuantity: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Application Method</label>
                  <input
                    type="text"
                    value={form.applicationMethod}
                    onChange={(e) => setForm({ ...form, applicationMethod: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
                    placeholder="e.g. Broadcast"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Schedule Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all appearance-none cursor-pointer custom-select-arrow"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="PAUSED">Paused</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all resize-none"
                    placeholder="Any specific instructions..."
                  />
                </div>

              </form>
            </div>

            <div className="px-8 py-6 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50">
              <button 
                onClick={() => setDialogOpen(false)}
                className="px-6 py-2.5 rounded-full font-bold text-xs text-slate-500 hover:bg-slate-200 uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="fertilizer-form"
                className="px-6 py-2.5 rounded-full font-bold text-xs text-white bg-[#2c4d3f] hover:bg-[#1f382d] uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                {editId ? 'Save Changes' : 'Add Schedule'}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default Fertilizing;
