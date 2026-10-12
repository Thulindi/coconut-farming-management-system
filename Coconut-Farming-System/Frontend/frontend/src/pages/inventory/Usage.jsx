import React, { useState, useEffect } from 'react';
import { usageAPI, inventoryAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const Usage = ({ embedded = false, items: propItems = [] }) => {
  const { user } = useAuth();
  const [usage, setUsage] = useState([]);
  const [items, setItems] = useState(propItems);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ itemId: '', quantityUsed: '', farmSection: '', usedBy: '', usageDate: new Date().toISOString().split('T')[0], purpose: '' });

  useEffect(() => { loadData(); }, [user?.id]);

  useEffect(() => {
    if (propItems.length) setItems(propItems);
  }, [propItems]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const [uRes, iRes] = await Promise.all([usageAPI.getAll(user.id), inventoryAPI.getAll(user.id)]);
      setUsage(uRes.data?.content || uRes.data || []); 
      if (!propItems.length) setItems(iRes.data?.content || iRes.data || []);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.itemId || !form.quantityUsed) {
      return;
    }
    try {
      await usageAPI.create(user.id, { ...form, quantityUsed: Number(form.quantityUsed) });
      window.dispatchEvent(new CustomEvent('inventoryUpdated'));
      setDialogOpen(false); 
      setForm({ itemId: '', quantityUsed: '', farmSection: '', usedBy: '', usageDate: new Date().toISOString().split('T')[0], purpose: '' }); 
      loadData();
    } catch (e) { 
      console.error(e); 
    }
  };

  return (
    <div className={`${embedded ? 'space-y-6' : 'space-y-8 pb-10'} animate-fade-in`}>
      
      {/* Header */}
      {!embedded && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter font-headline mb-2">Usage Tracking</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Log inventory consumption</p>
          </div>
          <button 
            onClick={() => { loadData(); setDialogOpen(true); }}
            className="flex items-center space-x-2 bg-[#2c4d3f] hover:bg-[#1f382d] text-white px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="text-xs font-bold uppercase tracking-wider">Record Usage</span>
          </button>
        </div>
      )}

      {/* Embedded-only Header Row */}
      {embedded && (
        <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight font-headline">Usage History</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Track how your supplies are consumed</p>
            </div>
            <button 
              onClick={() => { loadData(); setDialogOpen(true); }}
              className="flex items-center space-x-2 bg-[#2c4d3f] hover:bg-[#1f382d] text-white px-5 py-2 rounded-full transition-all shadow-md group"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="text-xs font-bold uppercase tracking-wider">Record Usage</span>
            </button>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
        
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-[100px] -z-10 opacity-50"></div>

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
                  <th className="pb-4">Item</th>
                  <th className="pb-4 text-right">Qty Used</th>
                  <th className="pb-4 pl-4 border-l border-slate-100">Farm Section</th>
                  <th className="pb-4">Used By</th>
                  <th className="pb-4">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {usage.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 text-sm font-medium">
                      No usage records found.
                    </td>
                  </tr>
                ) : (
                  usage.map((u) => (
                    <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50/50 last:border-0 relative">
                      <td className="py-5 font-bold text-slate-900 pr-4">{new Date(u.usageDate).toLocaleDateString()}</td>
                      <td className="py-5 font-bold text-blue-600 pr-4">{u.item?.itemName || '-'}</td>
                      <td className="py-5 font-black text-slate-800 text-right pr-4">{u.quantityUsed}</td>
                      <td className="py-5 font-medium text-slate-500 pl-4 border-l border-slate-100/50 pr-4">{u.farmSection || '-'}</td>
                      <td className="py-5 font-medium text-slate-500 pr-4 truncate max-w-[150px]">{u.usedBy || '-'}</td>
                      <td className="py-5 font-medium text-slate-500 truncate max-w-[200px]">{u.purpose || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Usage Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
            
            <div className={`px-8 py-6 flex justify-between items-center bg-blue-50 border-b border-blue-100`}>
              <h2 className={`text-xl font-black text-blue-900 tracking-tight font-headline flex items-center space-x-2`}>
                <span className="material-symbols-outlined text-blue-600">outbox</span>
                <span>Record Usage</span>
              </h2>
              <button 
                type="button" 
                onClick={() => setDialogOpen(false)} 
                className="w-8 h-8 rounded-full bg-white/50 hover:bg-white text-blue-600 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
              <form id="usage-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="space-y-2 relative group/select">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Inventory Item *</label>
                  <select
                    required
                    value={form.itemId}
                    onChange={(e) => setForm({ ...form, itemId: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer custom-select-arrow"
                  >
                    <option value="" disabled>Select Item</option>
                    {items.map(i => <option key={i.itemId} value={i.itemId}>{i.itemName}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Quantity Used *</label>
                  <input
                    type="number"
                    required
                    value={form.quantityUsed}
                    onChange={(e) => setForm({ ...form, quantityUsed: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Usage Date *</label>
                  <input
                    type="date"
                    required
                    value={form.usageDate}
                    onChange={(e) => setForm({ ...form, usageDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Farm Section</label>
                  <input
                    type="text"
                    value={form.farmSection}
                    onChange={(e) => setForm({ ...form, farmSection: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="e.g. Block A"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Used By</label>
                  <input
                    type="text"
                    value={form.usedBy}
                    onChange={(e) => setForm({ ...form, usedBy: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Worker Name"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Purpose</label>
                  <textarea
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                    placeholder="Why was this used?"
                  />
                </div>

              </form>
            </div>

            <div className="px-8 py-6 border-t border-slate-100 flex justify-end space-x-3 bg-white">
              <button 
                type="button"
                onClick={() => setDialogOpen(false)}
                className="px-6 py-2.5 rounded-full font-bold text-xs text-slate-500 hover:bg-slate-50 uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="usage-form"
                className={`px-6 py-2.5 rounded-full font-bold text-xs text-white uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 bg-blue-600 hover:bg-blue-700`}
              >
                Save
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default Usage;
