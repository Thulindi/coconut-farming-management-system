import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const LowStock = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const res = await inventoryAPI.getLowStock(user.id);
      setItems(res.data || []);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-rose-900 tracking-tighter font-headline mb-2">Low Stock Alerts</h1>
        <p className="text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em]">Items that require immediate attention</p>
      </div>

      {items.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center space-x-4 shadow-sm animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-orange-600">warning</span>
          </div>
          <p className="text-sm font-bold text-orange-900">
            <span className="font-black">{items.length} item(s)</span> are running low on stock and need replenishment.
          </p>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white rounded-[32px] p-8 md:p-10 border border-rose-100 shadow-sm relative overflow-hidden">
        
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-bl-[100px] -z-10 opacity-50"></div>

        {loading ? (
          <div className="flex justify-center flex-col items-center py-12 space-y-4">
             <span className="material-symbols-outlined text-4xl text-rose-200 animate-spin">autorenew</span>
          </div>
        ) : (
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 tracking-widest uppercase border-b border-rose-100/50">
                  <th className="pb-4">Item Name</th>
                  <th className="pb-4">Category</th>
                  <th className="pb-4 text-right">Current Stock</th>
                  <th className="pb-4 text-right">Min Level</th>
                  <th className="pb-4 pl-4 border-l border-slate-100/50">Unit</th>
                  <th className="pb-4 pl-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                          <span className="material-symbols-outlined text-emerald-500 text-3xl">check_circle</span>
                        </div>
                        <p className="text-emerald-700 font-bold tracking-tight">All items are well stocked!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((i) => {
                    const isOut = i.quantity === 0;
                    return (
                      <tr key={i.itemId} className="group hover:bg-rose-50/30 transition-colors border-b border-rose-50/50 last:border-0 relative">
                        <td className="py-5 font-black text-rose-900 pr-4">{i.itemName}</td>
                        <td className="py-5 font-bold text-slate-500 pr-4">{i.category}</td>
                        <td className={`py-5 font-black text-right pr-4 ${isOut ? 'text-rose-600' : 'text-orange-600'}`}>{i.quantity}</td>
                        <td className="py-5 font-bold text-slate-400 text-right pr-4">{i.minStockLevel}</td>
                        <td className="py-5 font-medium text-slate-400 pl-4 border-l border-slate-100/50 pr-4">{i.unit}</td>
                        <td className="py-5 pl-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase mt-4 ${
                            isOut ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {isOut ? 'Out of Stock' : 'Low Stock'}
                          </span>
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

    </div>
  );
};

export default LowStock;
