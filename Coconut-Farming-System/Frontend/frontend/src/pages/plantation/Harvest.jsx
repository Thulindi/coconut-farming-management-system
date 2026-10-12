import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { harvestAPI, landAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const Harvest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [land, setLand] = useState(null);
  const [harvests, setHarvests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHarvestId, setEditingHarvestId] = useState(null);
  const [form, setForm] = useState({
    harvestDate: new Date().toISOString().split('T')[0],
    season: 'DRY',
    totalCoconuts: '',
    income: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const [landRes, harvestsRes] = await Promise.all([
        landAPI.getById(id, user.id),
        harvestAPI.getByLand(id, user.id),
      ]);
      setLand(landRes.data);
      setHarvests(harvestsRes.data.content || harvestsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        totalCoconuts: Number(form.totalCoconuts),
        income: form.income ? Number(form.income) : null,
      };

      if (editingHarvestId) {
        await harvestAPI.update(editingHarvestId, user.id, payload);
      } else {
        await harvestAPI.create(id, user.id, payload);
      }

      setDialogOpen(false);
      setEditingHarvestId(null);
      setForm({
        harvestDate: new Date().toISOString().split('T')[0],
        season: 'DRY',
        totalCoconuts: '',
        income: '',
        notes: '',
      });
      loadData();
    } catch (error) {
      console.error('Error saving harvest:', error);
    }
  };

  const handleEdit = (harvest) => {
    setForm({
      harvestDate: new Date(harvest.harvestDate).toISOString().split('T')[0],
      season: harvest.season,
      totalCoconuts: harvest.totalCoconuts,
      income: harvest.income || '',
      notes: harvest.notes || '',
    });
    setEditingHarvestId(harvest.id);
    setDialogOpen(true);
  };

  const handleDelete = async (harvestId) => {
    if (window.confirm('Are you sure you want to delete this harvest record?')) {
      try {
        await harvestAPI.delete(harvestId, user.id);
        loadData();
      } catch (error) {
        console.error('Error deleting harvest:', error);
      }
    }
  };

  const chartData = harvests.slice(-12).map((h) => ({
    date: new Date(h.harvestDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    coconuts: h.totalCoconuts,
    income: h.income,
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 flex-col space-y-4 animate-fade-in">
        <span className="material-symbols-outlined text-5xl text-[#2c4d3f] animate-spin">autorenew</span>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading records...</p>
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
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter font-headline mb-2">Harvest Records</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {land?.locationName} - {land?.district}
            </p>
          </div>
          <button 
            onClick={() => {
              setEditingHarvestId(null);
              setForm({
                harvestDate: new Date().toISOString().split('T')[0],
                season: 'DRY',
                totalCoconuts: '',
                income: '',
                notes: '',
              });
              setDialogOpen(true);
            }}
            className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="text-xs font-bold uppercase tracking-wider">Record Harvest</span>
          </button>
        </div>
      </div>

      {harvests.length > 0 && (
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-900 tracking-tight font-headline">Harvest Trend</h2>
              <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-700"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                  <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{fill: '#0f766e', fontSize: 12, fontWeight: 700}} dx={-10} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#0284c7', fontSize: 12, fontWeight: 700}} dx={10} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                  />
                  <Bar yAxisId="left" dataKey="coconuts" fill="#0f766e" name="Coconuts" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar yAxisId="right" dataKey="income" fill="#0284c7" name="Income (LKR)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-slate-900 tracking-tight font-headline">All Harvests</h2>
        </div>
        
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 tracking-widest uppercase border-b border-slate-100/50">
                <th className="pb-4">Date</th>
                <th className="pb-4">Season</th>
                <th className="pb-4 text-right">Coconuts</th>
                <th className="pb-4 text-right">Income (LKR)</th>
                <th className="pb-4 border-l border-slate-100 pl-4">Notes</th>
                <th className="pb-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {harvests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 text-sm font-medium">
                    No harvest records found. Record your first harvest to get started.
                  </td>
                </tr>
              ) : (
                harvests.map((harvest) => (
                  <tr key={harvest.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50/50 last:border-0 relative">
                    <td className="py-5 font-bold text-slate-900 pr-4">{new Date(harvest.harvestDate).toLocaleDateString()}</td>
                    <td className="py-5 pr-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase ${
                        harvest.season === 'WET' ? 'bg-sky-100 text-sky-700' : 
                        harvest.season === 'DRY' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {harvest.season}
                      </span>
                    </td>
                    <td className="py-5 font-black text-slate-700 text-right pr-4">{harvest.totalCoconuts?.toLocaleString()}</td>
                    <td className="py-5 font-bold text-emerald-600 text-right pr-4">{harvest.income ? `Rs ${harvest.income.toLocaleString()}` : '-'}</td>
                    <td className="py-5 font-medium text-slate-500 pl-4 border-l border-slate-100/50 truncate max-w-[200px]">{harvest.notes || '-'}</td>
                    <td className="py-5 text-right space-x-2">
                        <button 
                          onClick={() => handleEdit(harvest)}
                          className="w-8 h-8 rounded-full bg-slate-50 hover:bg-orange-500 text-slate-400 hover:text-white inline-flex items-center justify-center transition-colors shadow-sm"
                          title="Edit Harvest"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(harvest.id)}
                          className="w-8 h-8 rounded-full bg-slate-50 hover:bg-rose-500 text-slate-400 hover:text-white inline-flex items-center justify-center transition-colors shadow-sm"
                          title="Delete Harvest"
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
      </div>

      {/* Harvest Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
            
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-slate-900 tracking-tight font-headline">
                {editingHarvestId ? 'Edit Harvest Record' : 'Record New Harvest'}
              </h2>
              <button onClick={() => setDialogOpen(false)} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              <form id="harvest-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Harvest Date *</label>
                  <input
                    type="date"
                    required
                    value={form.harvestDate}
                    onChange={(e) => setForm({ ...form, harvestDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>

                <div className="space-y-2 relative group/select">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Season</label>
                  <select
                    value={form.season}
                    onChange={(e) => setForm({ ...form, season: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all appearance-none cursor-pointer custom-select-arrow"
                  >
                    <option value="DRY">Dry Season</option>
                    <option value="WET">Wet Season</option>
                    <option value="INTER">Inter Season</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Total Coconuts *</label>
                  <input
                    type="number"
                    required
                    value={form.totalCoconuts}
                    onChange={(e) => setForm({ ...form, totalCoconuts: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Income (LKR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rs.</span>
                    <input
                      type="number"
                      value={form.income}
                      onChange={(e) => setForm({ ...form, income: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
                    placeholder="Observations, weather conditions during harvest..."
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
                form="harvest-form"
                className="px-6 py-2.5 rounded-full font-bold text-xs text-white bg-orange-500 hover:bg-orange-600 uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                {editingHarvestId ? 'Update Harvest' : 'Save Harvest'}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default Harvest;
