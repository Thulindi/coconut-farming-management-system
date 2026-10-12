import React, { useState, useEffect } from 'react';
import { purchaseAPI, inventoryAPI, supplierAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const Purchases = ({ embedded = false, items: propItems = [], suppliers: propSuppliers = [] }) => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [items, setItems] = useState(propItems);
  const [suppliers, setSuppliers] = useState(propSuppliers);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ itemId: '', supplierId: '', quantity: '', unitPrice: '', purchaseDate: new Date().toISOString().split('T')[0], notes: '' });

  useEffect(() => { loadData(); }, [user?.id]);

  useEffect(() => {
    if (propItems.length) setItems(propItems);
    if (propSuppliers.length) setSuppliers(propSuppliers);
  }, [propItems, propSuppliers]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const [pRes, iRes, sRes] = await Promise.all([
        purchaseAPI.getAll(user.id), 
        inventoryAPI.getAll(user.id), 
        supplierAPI.getAll(user.id)
      ]);
      setPurchases(pRes.data?.content || pRes.data || []); 
      if (!propItems.length) setItems(iRes.data?.content || iRes.data || []); 
      if (!propSuppliers.length) setSuppliers(sRes.data?.content || sRes.data || []);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await purchaseAPI.create(user.id, { ...form, quantity: Number(form.quantity), unitPrice: Number(form.unitPrice) });
      window.dispatchEvent(new CustomEvent('inventoryUpdated'));
      setDialogOpen(false); 
      setForm({ itemId: '', supplierId: '', quantity: '', unitPrice: '', purchaseDate: new Date().toISOString().split('T')[0], notes: '' }); 
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
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter font-headline mb-2">Purchase History</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Track inventory acquisitions</p>
          </div>
          <button 
            onClick={() => { loadData(); setDialogOpen(true); }}
            className="flex items-center space-x-2 bg-[#2c4d3f] hover:bg-[#1f382d] text-white px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="text-xs font-bold uppercase tracking-wider">Record Purchase</span>
          </button>
        </div>
      )}

      {/* Embedded-only Header Row */}
      {embedded && (
        <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight font-headline">Acquisition Logs</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Track your inventory purchases and costs</p>
            </div>
            <button 
              onClick={() => { loadData(); setDialogOpen(true); }}
              className="flex items-center space-x-2 bg-[#2c4d3f] hover:bg-[#1f382d] text-white px-5 py-2 rounded-full transition-all shadow-md group"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="text-xs font-bold uppercase tracking-wider">Record Purchase</span>
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
                  <th className="pb-4">Supplier</th>
                  <th className="pb-4 text-right">Quantity</th>
                  <th className="pb-4 text-right">Unit Price</th>
                  <th className="pb-4 text-right">Total (LKR)</th>
                  <th className="pb-4 pl-4 border-l border-slate-100">Notes</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {purchases.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 text-sm font-medium">
                      No purchases recorded yet.
                    </td>
                  </tr>
                ) : (
                  purchases.map((p) => (
                    <tr key={p.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50/50 last:border-0 relative">
                      <td className="py-5 font-bold text-slate-900 pr-4">{new Date(p.purchaseDate).toLocaleDateString()}</td>
                      <td className="py-5 font-bold text-emerald-700 pr-4">{p.item?.itemName || '-'}</td>
                      <td className="py-5 font-medium text-slate-500 pr-4">{p.supplier?.supplierName || '-'}</td>
                      <td className="py-5 font-black text-slate-800 text-right pr-4">{p.quantity}</td>
                      <td className="py-5 font-medium text-slate-500 text-right pr-4">Rs {p.unitPrice?.toLocaleString()}</td>
                      <td className="py-5 font-bold text-slate-700 text-right pr-4">Rs {(p.quantity * p.unitPrice)?.toLocaleString()}</td>
                      <td className="py-5 font-medium text-slate-400 pl-4 border-l border-slate-100/50 max-w-[200px] truncate">{p.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Purchase Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
            
            <div className={`px-8 py-6 flex justify-between items-center bg-slate-50 border-b border-slate-100`}>
              <h2 className={`text-xl font-black text-slate-900 tracking-tight font-headline flex items-center space-x-2`}>
                <span className="material-symbols-outlined text-[#2c4d3f]">receipt_long</span>
                <span>Record New Purchase</span>
              </h2>
              <button 
                type="button" 
                onClick={() => setDialogOpen(false)} 
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
              <form id="purchase-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="space-y-2 relative group/select">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Inventory Item *</label>
                  <select
                    required
                    value={form.itemId}
                    onChange={(e) => setForm({ ...form, itemId: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all appearance-none cursor-pointer custom-select-arrow"
                  >
                    <option value="" disabled>Select Item</option>
                    {items.map(i => <option key={i.itemId} value={i.itemId}>{i.itemName}</option>)}
                  </select>
                </div>

                <div className="space-y-2 relative group/select">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Supplier</label>
                  <select
                    value={form.supplierId}
                    onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all appearance-none cursor-pointer custom-select-arrow"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => <option key={s.supplierId} value={s.supplierId}>{s.supplierName}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Purchase Date *</label>
                  <input
                    type="date"
                    required
                    value={form.purchaseDate}
                    onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Unit Price (LKR) *</label>
                  <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rs.</span>
                     <input
                       type="number"
                       required
                       value={form.unitPrice}
                       onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                       className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
                       placeholder="0.00"
                     />
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Additional Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all resize-none"
                    placeholder="Delivery notes, condition, etc..."
                  />
                </div>

              </form>
            </div>

            <div className="px-8 py-6 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50">
              <button 
                type="button"
                onClick={() => setDialogOpen(false)}
                className="px-6 py-2.5 rounded-full font-bold text-xs text-slate-500 hover:bg-slate-200 uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="purchase-form"
                className={`px-6 py-2.5 rounded-full font-bold text-xs text-white uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 bg-[#2c4d3f] hover:bg-[#1f382d]`}
              >
                Record Purchase
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default Purchases;
