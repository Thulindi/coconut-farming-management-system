import React, { useState, useEffect } from 'react';

const CATEGORIES = ['Harvest Sales', 'Subsidies', 'Other Income', 'Fertilizer', 'Labor', 'Equipment', 'Transport', 'Other Expense'];

const FinancialRecordModal = ({ isOpen, onClose, onSave, editingRecord = null }) => {
  const [form, setForm] = useState({
    recordType: 'INCOME',
    category: '',
    amount: '',
    description: '',
    recordDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (editingRecord) {
      setForm({
        recordType: editingRecord.recordType,
        category: editingRecord.category,
        amount: editingRecord.amount,
        description: editingRecord.description || '',
        recordDate: editingRecord.recordDate?.split('T')[0] || new Date().toISOString().split('T')[0],
      });
    } else {
      setForm({
        recordType: 'INCOME',
        category: '',
        amount: '',
        description: '',
        recordDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [editingRecord, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, amount: Number(form.amount) });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        
        <div className={`px-8 py-6 flex justify-between items-center ${form.recordType === 'INCOME' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
          <h2 className={`text-xl font-black ${form.recordType === 'INCOME' ? 'text-emerald-900' : 'text-rose-900'} tracking-tight font-headline flex items-center space-x-2`}>
            <span className="material-symbols-outlined">
              {editingRecord ? 'edit_note' : 'add_circle'}
            </span>
            <span>{editingRecord ? 'Edit Record' : 'Record Transaction'}</span>
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/50 hover:bg-white text-slate-600 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 text-left">
          <form id="record-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2 relative group/select">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Type *</label>
              <select
                value={form.recordType}
                onChange={(e) => setForm({ ...form, recordType: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all appearance-none cursor-pointer custom-select-arrow"
              >
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>

            <div className="space-y-2 relative group/select">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Category *</label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all appearance-none cursor-pointer custom-select-arrow"
              >
                <option value="" disabled>Select Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Date *</label>
              <input
                type="date"
                required
                value={form.recordDate}
                onChange={(e) => setForm({ ...form, recordDate: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Amount (LKR) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rs.</span>
                <input
                  type="number"
                  required
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all resize-none"
                placeholder="Add details about this transaction..."
              />
            </div>

          </form>
        </div>

        <div className="px-8 py-6 border-t border-slate-100 flex justify-end space-x-3 bg-white">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-full font-bold text-xs text-slate-500 hover:bg-slate-50 uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="record-form"
            className={`px-6 py-2.5 rounded-full font-bold text-xs text-white uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
              form.recordType === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-500 hover:bg-rose-600'
            }`}
          >
            {editingRecord ? 'Update Record' : 'Save Record'}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default FinancialRecordModal;
