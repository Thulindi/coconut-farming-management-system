import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { financialAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import FinancialRecordModal from '../../components/financial/FinancialRecordModal';

const COLORS = ['#0f766e', '#0284c7', '#ea580c', '#eab308', '#8b5cf6'];

const StatCard = ({ icon, title, value, colorType }) => {
  const isPositive = colorType === 'success';
  const isNegative = colorType === 'error';
  
  const bgClass = isPositive ? 'bg-emerald-50' : isNegative ? 'bg-rose-50' : 'bg-slate-50';
  const textClass = isPositive ? 'text-emerald-700' : isNegative ? 'text-rose-600' : 'text-slate-700';
  const borderClass = isPositive ? 'border-emerald-100' : isNegative ? 'border-rose-100' : 'border-slate-100';

  return (
    <div className={`p-8 rounded-[32px] border ${borderClass} shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col justify-center min-h-[160px] bg-white`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center`}>
          <span className={`material-symbols-outlined ${textClass} text-xl`}>{icon}</span>
        </div>
        <p className="text-[9px] font-bold text-slate-400 tracking-[0.15em] uppercase">{title}</p>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-[14px] font-bold text-slate-400 tracking-tight">LKR</span>
        <span className={`text-4xl font-black ${textClass} tracking-tighter`}>{(value || 0).toLocaleString()}</span>
      </div>
    </div>
  );
};

const FinancialDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    loadData();
    
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowDownloadMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const [dashRes, monthlyRes, categoryRes] = await Promise.all([
        financialAPI.getDashboard(user.id),
        financialAPI.getMonthlyComparison(user.id, 6),
        financialAPI.getCategoryBreakdown(user.id),
      ]);
      setDashboard(dashRes.data);
      setMonthlyData(monthlyRes.data || []);
      setCategoryData(categoryRes.data || []);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (format) => {
    if (!user?.id) return;
    try {
      const res = await financialAPI.getRecords(user.id);
      const records = res.data || [];
      
      if (records.length === 0) {
        alert("No records found to export.");
        return;
      }

      if (format === 'pdf') {
        generatePDF(records);
      } else {
        generateExcel(records);
      }
      setShowDownloadMenu(false);
    } catch (error) {
      console.error('Error generating report:', error);
      alert("Failed to generate report.");
    }
  };

  const generatePDF = (records) => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();
    
    doc.setFillColor(15, 118, 110);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("FINANCIAL SUMMARY REPORT", 20, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${timestamp}`, 20, 33);
    doc.text(`Farmer: ${user.fullName || user.username}`, 140, 33);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Overall Financial Status", 20, 55);

    const totalIncome = dashboard?.totalIncome || 0;
    const totalExpense = dashboard?.totalExpense || 0;
    const netProfit = totalIncome - totalExpense;

    autoTable(doc, {
      startY: 60,
      head: [['Metric', 'Amount (LKR)']],
      body: [
        ['Total Income', totalIncome.toLocaleString()],
        ['Total Expenses', totalExpense.toLocaleString()],
        ['Net Profit', { content: netProfit.toLocaleString(), styles: { fontStyle: 'bold', textColor: netProfit >= 0 ? [5, 150, 105] : [220, 38, 38] } }]
      ],
      theme: 'striped',
      headStyles: { fillStyle: 'F', fillColor: [241, 245, 249], textColor: [71, 85, 105] },
      styles: { fontSize: 10 }
    });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Detailed Transaction Records", 20, doc.lastAutoTable.finalY + 15);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Date', 'Type', 'Category', 'Amount (LKR)', 'Description']],
      body: records.map(r => [
        new Date(r.recordDate).toLocaleDateString(),
        r.recordType,
        r.category,
        r.amount.toLocaleString(),
        r.description || '-'
      ]),
      headStyles: { fillColor: [15, 118, 110] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 9 }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Coconut Farming Management System - Confidential Report - Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    }

    doc.save(`Financial_Report_${user.username}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateExcel = (records) => {
    const headers = ["Date", "Type", "Category", "Amount (LKR)", "Description"];
    const csvRows = [
      headers.join(","),
      ...records.map(r => [
        new Date(r.recordDate).toLocaleDateString(),
        r.recordType,
        `"${r.category}"`,
        r.amount,
        `"${(r.description || '').replace(/"/g, '""')}"`
      ].join(","))
    ];

    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Financial_Report_${user.username}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateRecord = async (data) => {
    try {
      await financialAPI.createRecord(user.id, data);
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Error creating record:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 flex-col space-y-4 animate-fade-in">
        <span className="material-symbols-outlined text-5xl text-emerald-600 animate-spin">autorenew</span>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading financial data...</p>
      </div>
    );
  }

  const profit = (dashboard?.totalIncome || 0) - (dashboard?.totalExpense || 0);

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-end items-start md:items-end gap-4">
        <div className="flex flex-col sm:flex-row gap-3 relative">
          
          {/* Download Dropdown */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-black text-white px-6 py-3.5 rounded-full transition-all shadow-lg group border border-slate-800"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span className="text-xs font-bold tracking-wider uppercase">Download Report</span>
              <span className={`material-symbols-outlined text-[16px] transition-transform duration-300 ${showDownloadMenu ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            
            {showDownloadMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-50 animate-fade-in-up">
                <div className="px-5 py-2 mb-2 border-b border-slate-50">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Format</p>
                </div>
                <button 
                  onClick={() => handleDownloadReport('pdf')}
                  className="w-full flex items-center space-x-3 px-5 py-3 hover:bg-slate-50 text-slate-700 transition-colors group text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all">
                    <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Premium PDF</span>
                </button>
                <button 
                  onClick={() => handleDownloadReport('excel')}
                  className="w-full flex items-center space-x-3 px-5 py-3 hover:bg-slate-50 text-slate-700 transition-colors group text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <span className="material-symbols-outlined text-[18px]">table_view</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider">Excel / CSV</span>
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-full transition-all shadow-md group border border-emerald-500/20"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="text-xs font-bold tracking-wider uppercase">Add Record</span>
          </button>
          <button 
            onClick={() => navigate('/financial/records')}
            className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3.5 rounded-full transition-all shadow-sm border border-slate-200 group"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-slate-600">receipt_long</span>
            <span className="text-xs font-bold tracking-wider uppercase">View All Records</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon="trending_up"
          title="Total Income"
          value={dashboard?.totalIncome}
          colorType="success"
        />
        <StatCard
          icon="trending_down"
          title="Total Expenses"
          value={dashboard?.totalExpense}
          colorType="error"
        />
        <StatCard
          icon="account_balance"
          title="Net Profit"
          value={profit}
          colorType={profit >= 0 ? 'primary' : 'error'}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Monthly Comparison Bar Chart */}
        <div className="lg:col-span-8 bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight font-headline">Monthly Comparison</h2>
            <div className="flex space-x-2">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Income</span>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Expense</span>
              </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dx={-10} tickFormatter={(val) => `LKR ${val/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                  formatter={(value) => [`LKR ${value.toLocaleString()}`, '']}
                />
                <Bar dataKey="income" fill="#059669" name="Income" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expense" fill="#f43f5e" name="Expense" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="lg:col-span-4 bg-[#f8faf9] rounded-[40px] p-10 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-headline mb-6 text-center">Breakdown</h2>
          
          <div className="h-[250px] w-full relative flex-1">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                     formatter={(value) => [`LKR ${value.toLocaleString()}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 font-medium text-sm">
                No data available
              </div>
            )}
          </div>
          
          {/* Legend */}
          <div className="mt-4 space-y-3">
            {categoryData.map((entry, index) => (
              <div key={index} className="flex flex-row items-center justify-between text-xs font-bold">
                <div className="flex items-center space-x-2">
                   <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                   <span className="text-slate-600 truncate max-w-[120px]">{entry.category}</span>
                </div>
                <span className="text-slate-900">Rs. {entry.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>

        </div>

      </div>

      <FinancialRecordModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateRecord}
      />
    </div>
  );
};

export default FinancialDashboard;
