import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { adminAPI } from '../../api';
import { notificationAPI } from '../../api/notificationAPI';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    farms: 0,
    communityPosts: 0,
    activeOfficers: 0,
  });
  const [registrations, setRegistrations] = useState([]);
  const [systemControl, setSystemControl] = useState([
    { label: 'FIELD OFFICERS ACTIVE', progress: 0, value: '0 / 0', color: 'bg-blue-500' },
    { label: 'COMMUNITY MODERATION', progress: 0, value: '0 Pending', color: 'bg-orange-500' },
    { label: 'KNOWLEDGE BASE ARTICLES', progress: 0, value: '0 Total', color: 'bg-emerald-500' },
  ]);
  const [loading, setLoading] = useState(true);

  // Report Data State
  const [reportStats, setReportStats] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.getDashboardStats();
        const data = response.data;
        
        setStats({
          totalUsers: data.totalUsers,
          farms: data.totalLands,
          communityPosts: data.totalArticles,
          activeOfficers: data.activeOfficers,
        });

        setRegistrations(data.recentRegistrations || []);

        const sc = data.systemControl;
        setSystemControl([
          { 
            label: 'FIELD OFFICERS ACTIVE', 
            progress: sc.totalFieldOfficers > 0 ? (sc.fieldOfficersActive / sc.totalFieldOfficers) * 100 : 0, 
            value: `${sc.fieldOfficersActive} / ${sc.totalFieldOfficers}`, 
            color: 'bg-blue-500' 
          },
          { 
            label: 'COMMUNITY MODERATION', 
            progress: data.totalArticles > 0 ? (sc.communityModerationPending / data.totalArticles) * 100 : 0, 
            value: `${sc.communityModerationPending} Pending`, 
            color: 'bg-orange-500' 
          },
          { 
            label: 'KNOWLEDGE BASE ARTICLES', 
            progress: data.totalArticles > 0 ? (sc.knowledgeBaseArticlesTotal / data.totalArticles) * 100 : 0, 
            value: `${sc.knowledgeBaseArticlesTotal} Total`, 
            color: 'bg-emerald-50' 
          },
        ]);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleDownloadReport = async () => {
    try {
      setIsPrinting(true);
      const token = sessionStorage.getItem('token');
      const res = await axios.get('/api/admin/reports/stats', {
          headers: { Authorization: `Bearer ${token}` }
      });
      setReportStats(res.data);
      
      // Short delay to ensure state updates and DOM is ready before printing
      setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 500);
    } catch (err) {
      console.error("Error generating report", err);
      setIsPrinting(false);
      alert("Failed to generate report. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="flex flex-col items-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-emerald-500 animate-spin">autorenew</span>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aggregating live system data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in text-slate-900">
      {/* Header */}
      <div className="no-print">
        <h1 className="text-4xl font-black tracking-tighter font-headline uppercase leading-none">System Admin</h1>
        <p className="text-[10px] font-bold text-slate-400 mt-2 tracking-[0.2em] uppercase">OVERALL CONTROL DASHBOARD</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
        {[
          { label: 'Registered Farms', value: stats.farms, icon: 'potted_plant', color: 'emerald' },
          { label: 'Active Officers', value: stats.activeOfficers, icon: 'badge', color: 'blue' },
          { label: 'Community Posts', value: stats.communityPosts, icon: 'forum', color: 'orange' },
          { label: 'System Users', value: stats.totalUsers, icon: 'group', color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center space-x-4 group hover:shadow-md transition-all`}>
            <div className={`w-12 h-12 bg-${stat.color}-50 rounded-2xl flex items-center justify-center text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
              <span className="material-symbols-outlined">{stat.icon}</span>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 leading-tight">{stat.value}</div>
              <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
        
        {/* Table Card */}
        <div className="lg:col-span-8 bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-8 right-8 w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
             
             <h2 className="text-2xl font-black tracking-tight font-headline mb-10">Recent User Registrations</h2>

             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[10px] font-bold text-slate-300 tracking-[0.1em] uppercase border-b border-slate-50">
                            <th className="pb-6">USER NAME</th>
                            <th className="pb-6">ROLE</th>
                            <th className="pb-6 text-center">REG. DATE</th>
                            <th className="pb-6 text-right">STATUS</th>
                        </tr>
                    </thead>
                    <tbody className="text-[13px] font-medium">
                        {registrations.map((reg, i) => (
                            <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="py-8">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                            {reg.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <span className="font-bold">{reg.name}</span>
                                    </div>
                                </td>
                                <td className="py-8">
                                    <span className="text-[10px] font-black tracking-tight text-slate-400">{reg.role}</span>
                                </td>
                                <td className="py-8 text-center text-slate-400">
                                    {reg.date}
                                </td>
                                <td className="py-8 text-right">
                                    <span className={`text-[9px] font-black px-4 py-1.5 rounded-lg border uppercase tracking-tight ${
                                        reg.status === 'APPROVED' 
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                                        : 'bg-red-50 border-red-100 text-red-400'
                                    }`}>
                                        {reg.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>

        {/* System Control Card */}
        <div className="lg:col-span-4 bg-[#1a2233] rounded-[40px] p-10 text-white flex flex-col shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[60px] -mr-16 -mt-16"></div>
            
            <div className="flex items-center space-x-4 mb-10 relative z-10">
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <span className="material-symbols-outlined text-white text-3xl">settings</span>
                </div>
                <div>
                    <h3 className="text-xl font-black tracking-tight leading-none mb-1">SYSTEM CONTROL</h3>
                    <p className="text-[9px] font-bold text-emerald-400 tracking-[0.10em] uppercase">ACTIVITY TRACKING</p>
                </div>
            </div>

            <div className="space-y-8 mb-10 relative z-10 flex-1">
                {systemControl.map((item, i) => (
                    <div key={i} className="space-y-3">
                        <div className="flex justify-between text-[9px] font-bold tracking-widest text-white/40 uppercase">
                            <span>{item.label}</span>
                            <span className="text-white/60">{item.value}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                                style={{ width: `${item.progress}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 relative z-10">
                <button 
                  onClick={handleDownloadReport}
                  disabled={isPrinting}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 py-4 rounded-2xl text-[11px] font-bold tracking-widest uppercase transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                    {isPrinting ? 'Generating Report...' : 'Download Full System Report'}
                </button>
            </div>
        </div>
      </div>

      {/* ============================================================
          OFFICIAL REPORT TEMPLATE (HIDDEN ON SCREEN, VISIBLE ON PRINT)
      ============================================================ */}
      {reportStats && (
        <div className="hidden print:block bg-white p-0 m-0 text-gray-900 font-sans text-sm print-report-container">
            {/* Official Header */}
            <div className="border-b-2 border-[#2c4d3f] pb-4 mb-6 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-[#2c4d3f] rounded flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-xl">eco</span>
                        </div>
                        <span className="text-2xl font-black text-[#2c4d3f] tracking-tighter">CocoSmart</span>
                    </div>
                    <h1 className="text-2xl font-black uppercase text-gray-900 tracking-tight">System Performance Audit</h1>
                    <p className="text-gray-500 font-bold tracking-widest text-[10px]">Official Analytics & Management Report</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-gray-900">DATE: {new Date().toLocaleDateString()}</p>
                    <p className="text-[10px] text-gray-400">{new Date().toLocaleTimeString()}</p>
                </div>
            </div>

            {/* 1. Executive Summary */}
            <div className="mb-8" style={{ pageBreakInside: 'avoid' }}>
                <h2 className="text-sm font-black mb-4 flex items-center gap-2 border-l-4 border-[#2c4d3f] pl-2 uppercase">
                    I. Executive Summary
                </h2>
                <div className="grid grid-cols-4 gap-2">
                    <div className="border border-gray-200 p-3 rounded-lg text-center">
                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Total Users</p>
                        <p className="text-xl font-black text-gray-900">{reportStats?.totalUsers}</p>
                    </div>
                    <div className="border border-gray-200 p-3 rounded-lg text-center">
                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Total Lands</p>
                        <p className="text-xl font-black text-gray-900">{reportStats?.totalLands}</p>
                    </div>
                    <div className="border border-gray-200 p-3 rounded-lg text-center">
                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Total Yield</p>
                        <p className="text-xl font-black text-gray-900">{reportStats?.totalCoconutsHarvested?.toLocaleString()}</p>
                    </div>
                    <div className="border border-gray-200 p-3 rounded-lg text-center">
                        <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Articles</p>
                        <p className="text-xl font-black text-gray-900">{reportStats?.totalArticles}</p>
                    </div>
                </div>
            </div>

            {/* 2. Regional Data */}
            <div className="mb-8" style={{ pageBreakInside: 'avoid' }}>
                <h2 className="text-sm font-black mb-4 flex items-center gap-2 border-l-4 border-[#2c4d3f] pl-2 uppercase">
                    II. Regional Land Distribution
                </h2>
                <table className="w-full border-collapse border border-gray-200 text-xs">
                    <thead>
                        <tr className="bg-gray-50 text-[10px]">
                            <th className="border border-gray-200 p-2 text-left uppercase">District</th>
                            <th className="border border-gray-200 p-2 text-center uppercase">Land Units</th>
                            <th className="border border-gray-200 p-2 text-left uppercase">Market Density</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(reportStats?.landsByDistrict || {}).map(([district, count]) => (
                            <tr key={district}>
                                <td className="border border-gray-200 p-2 font-bold">{district}</td>
                                <td className="border border-gray-200 p-2 text-center">{count}</td>
                                <td className="border border-gray-200 p-2">
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-[#2c4d3f] h-full" style={{ width: `${(count / reportStats?.totalLands) * 100}%` }}></div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Official Footer */}
            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                <p>Verified by CocoSmart Management Node</p>
                <p>© 2026 OFFICIAL SYSTEM EXPORT</p>
            </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        @media print {
            @page { size: A4; margin: 0; }
            .no-print { display: none !important; }
            body { background: white !important; margin: 0; padding: 0; }
            .animate-fade-in { animation: none !important; }
            
            .print-report-container {
                width: 100% !important;
                padding: 1cm 2cm !important;
                box-sizing: border-box !important;
            }

            table { width: 100% !important; }
        }
      `}} />
    </div>
  );
};

export default AdminDashboard;

