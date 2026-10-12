import React, { useState, useEffect } from 'react';
import { financialAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import FinancialRecordModal from '../../components/financial/FinancialRecordModal';

const CATEGORIES = ['Harvest Sales', 'Subsidies', 'Other Income', 'Fertilizer', 'Labor', 'Equipment', 'Transport', 'Other Expense'];

const FinancialRecords = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const location = useLocation();
  
  useEffect(() => {
    loadRecords();
    
    // Check for add action in query params
    const params = new URLSearchParams(location.search);
    if (params.get('action') === 'add') {
      setDialogOpen(true);
      // Optional: Clear the URL param without full page reload if desired, 
      // but let's keep it simple for now as per user request.
    }
  }, [location.search]);

  const loadRecords = async () => {
    if (!user?.id) return;
    try {
      const response = await financialAPI.getRecords(user.id);
      setRecords(response.data || []);
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    try {
      if (editingRecord) {
        await financialAPI.updateRecord(editingRecord.id, user.id, data);
      } else {
        await financialAPI.createRecord(user.id, data);
      }
      closeDialog();
      loadRecords();
    } catch (error) {
      console.error('Error saving record:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await financialAPI.deleteRecord(id, user.id);
      loadRecords();
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const openEditDialog = (record) => {
    setEditingRecord(record);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingRecord(null);
  };

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
      
      {/* Back Link */}
      <Link 
        to="/financial" 
        className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 hover:text-[#2c4d3f] transition-colors uppercase tracking-[0.2em] mb-4 group"
      >
        <span className="material-symbols-outlined text-[14px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span>Back to Dashboard</span>
      </Link>

      {/* Records Table Header Actions (None needed here as it's a list) */}


      {/* Main Table Container */}
      <div className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
        
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-[100px] -z-10 opacity-50"></div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 tracking-widest uppercase border-b border-slate-100/50">
                <th className="pb-4">Date</th>
                <th className="pb-4">Type</th>
                <th className="pb-4">Category</th>
                <th className="pb-4">Description</th>
                <th className="pb-4 text-right">Amount (LKR)</th>
                <th className="pb-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {records.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 text-sm font-medium">
                    No financial records found.
                  </td>
                </tr>
              ) : (
                records.map((record) => {
                  const isIncome = record.recordType === 'INCOME';
                  return (
                    <tr key={record.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50/50 last:border-0 relative">
                      <td className="py-5 font-bold text-slate-900 pr-4">{new Date(record.recordDate).toLocaleDateString()}</td>
                      <td className="py-5 pr-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase space-x-1 ${
                          isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          <span className={`material-symbols-outlined text-[12px] leading-none`}>
                            {isIncome ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                          <span>{record.recordType}</span>
                        </span>
                      </td>
                      <td className="py-5 font-bold text-slate-700 pr-4">{record.category}</td>
                      <td className="py-5 font-medium text-slate-500 pr-4 max-w-[200px] truncate">{record.description || '-'}</td>
                      <td className={`py-5 font-black text-right pr-4 ${isIncome ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {record.amount?.toLocaleString()}
                      </td>
                      <td className="py-5 text-right space-x-2 w-24">
                          <button 
                            onClick={() => openEditDialog(record)}
                            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-[#2c4d3f] text-slate-400 hover:text-white inline-flex items-center justify-center transition-colors shadow-sm"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(record.id)}
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
      </div>

      <FinancialRecordModal 
        isOpen={dialogOpen}
        onClose={closeDialog}
        onSave={handleSave}
        editingRecord={editingRecord}
      />

    </div>
  );
};

export default FinancialRecords;
