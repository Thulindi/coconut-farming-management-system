import React, { useState, useEffect } from 'react';
import { supplierAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const Suppliers = ({ embedded = false }) => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ supplierName: '', contactPerson: '', phone: '', email: '', address: '' });

  useEffect(() => { loadData(); }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const res = await supplierAPI.getAll(user.id);
      setSuppliers(res.data || []);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await supplierAPI.update(editingId, user.id, form);
      else await supplierAPI.create(user.id, form);
      window.dispatchEvent(new CustomEvent('inventoryUpdated'));
      closeDialog(); 
      loadData();
    } catch (e) { 
      console.error(e); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this supplier?')) return;
    try { 
      await supplierAPI.delete(id, user.id); 
      window.dispatchEvent(new CustomEvent('inventoryUpdated'));
      loadData(); 
    } catch (e) { 
      console.error(e); 
    }
  };

  const openEdit = (s) => {
    setEditingId(s.supplierId); 
    setForm({ 
      supplierName: s.supplierName, 
      contactPerson: s.contactPerson || '', 
      phone: s.phone || '', 
      email: s.email || '', 
      address: s.address || '' 
    }); 
    setDialogOpen(true);
  };

  const closeDialog = () => { 
    setDialogOpen(false); 
    setEditingId(null); 
    setForm({ supplierName: '', contactPerson: '', phone: '', email: '', address: '' }); 
  };

  return (
    <div className={`${embedded ? 'space-y-6' : 'space-y-8 pb-10'} animate-fade-in`}>
      
      {/* Sub-header Actions */}
      <div className="flex justify-end items-center mb-2">
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center space-x-2 bg-[#2c4d3f] hover:bg-[#1f382d] text-white px-5 py-2.5 rounded-full transition-all shadow-md group"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span className="text-xs font-bold uppercase tracking-wider">{embedded ? 'Add Supplier' : 'Register Supplier'}</span>
        </button>
      </div>

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
                  <th className="pb-4">Supplier Name</th>
                  <th className="pb-4">Contact Person</th>
                  <th className="pb-4">Phone</th>
                  <th className="pb-4">Email</th>
                  <th className="pb-4">Address</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 text-sm font-medium">
                      No suppliers registered yet.
                    </td>
                  </tr>
                ) : (
                  suppliers.map((s) => (
                    <tr key={s.supplierId} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50/50 last:border-0 relative">
                      <td className="py-5 font-black text-slate-900 pr-4">{s.supplierName}</td>
                      <td className="py-5 font-bold text-slate-600 pr-4">{s.contactPerson || '-'}</td>
                      <td className="py-5 font-bold text-slate-500 pr-4">{s.phone || '-'}</td>
                      <td className="py-5 font-medium text-slate-400 pr-4">{s.email || '-'}</td>
                      <td className="py-5 font-medium text-slate-400 pr-4 max-w-[200px] truncate">{s.address || '-'}</td>
                      <td className="py-5 text-right space-x-2 w-24">
                          <button 
                            onClick={() => openEdit(s)}
                            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-[#2c4d3f] text-slate-400 hover:text-white inline-flex items-center justify-center transition-colors shadow-sm"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(s.supplierId)}
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

      {/* Supplier Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
            
            <div className={`px-8 py-6 flex justify-between items-center bg-slate-50 border-b border-slate-100`}>
              <h2 className={`text-xl font-black text-slate-900 tracking-tight font-headline flex items-center space-x-2`}>
                <span className="material-symbols-outlined text-[#2c4d3f]">
                  {editingId ? 'edit_square' : 'add_business'}
                </span>
                <span>{editingId ? 'Edit Supplier' : 'Register Supplier'}</span>
              </h2>
              <button onClick={closeDialog} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
              <form id="supplier-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Company / Supplier Name *</label>
                  <input
                    type="text"
                    required
                    value={form.supplierName}
                    onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Contact Person</label>
                  <input
                    type="text"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Phone Number</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Office Address</label>
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all resize-none"
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
                form="supplier-form"
                className={`px-6 py-2.5 rounded-full font-bold text-xs text-white uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 bg-[#2c4d3f] hover:bg-[#1f382d]`}
              >
                {editingId ? 'Update Supplier' : 'Register Supplier'}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default Suppliers;
