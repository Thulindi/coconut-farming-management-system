import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminReports = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const res = await axios.get('/api/admin/reports/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(res.data);
            } catch (err) {
                console.error("Error fetching report stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-[#2c4d3f]/20 border-t-[#2c4d3f] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
            
            {/* ============================================================
                DASHBOARD VIEW (VISIBLE ON SCREEN, HIDDEN ON PRINT)
            ============================================================ */}
            <div className="no-print space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Reports</h1>
                        <p className="text-gray-500 font-medium">Comprehensive analytics and data exports</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-6 py-3 bg-[#1a2233] text-white rounded-2xl font-bold hover:bg-[#2c374d] transition-all shadow-lg active:scale-95"
                        >
                            <span className="material-symbols-outlined text-[20px]">file_download</span>
                            Generate PDF Report
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Users" value={stats?.totalUsers} icon="groups" color="blue" subtitle="Registered Accounts" />
                    <StatCard title="Total Lands" value={stats?.totalLands} icon="potted_plant" color="emerald" subtitle="Active Plantations" />
                    <StatCard title="Total Yield" value={stats?.totalCoconutsHarvested?.toLocaleString()} icon="eco" color="amber" subtitle="Total Coconuts" />
                    <StatCard title="Articles" value={stats?.totalArticles} icon="forum" color="purple" subtitle="Community Content" />
                </div>

                {/* Web Tabs */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex border-b border-gray-100">
                        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon="person" label="Users" />
                        <TabButton active={activeTab === 'lands'} onClick={() => setActiveTab('lands')} icon="map" label="Regions" />
                        <TabButton active={activeTab === 'harvest'} onClick={() => setActiveTab('harvest')} icon="trending_up" label="Yield" />
                    </div>

                    <div className="p-10">
                        {activeTab === 'users' && <UserStatsSection stats={stats} />}
                        {activeTab === 'lands' && <LandStatsSection stats={stats} />}
                        {activeTab === 'harvest' && <HarvestStatsSection stats={stats} />}
                    </div>
                </div>
            </div>

            {/* ============================================================
                OFFICIAL REPORT TEMPLATE (HIDDEN ON SCREEN, VISIBLE ON PRINT)
            ============================================================ */}
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
                            <p className="text-xl font-black text-gray-900">{stats?.totalUsers}</p>
                        </div>
                        <div className="border border-gray-200 p-3 rounded-lg text-center">
                            <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Total Lands</p>
                            <p className="text-xl font-black text-gray-900">{stats?.totalLands}</p>
                        </div>
                        <div className="border border-gray-200 p-3 rounded-lg text-center">
                            <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Total Yield</p>
                            <p className="text-xl font-black text-gray-900">{stats?.totalCoconutsHarvested?.toLocaleString()}</p>
                        </div>
                        <div className="border border-gray-200 p-3 rounded-lg text-center">
                            <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Articles</p>
                            <p className="text-xl font-black text-gray-900">{stats?.totalArticles}</p>
                        </div>
                    </div>
                </div>

                {/* 2. Demographic Analysis */}
                <div className="mb-8" style={{ pageBreakInside: 'avoid' }}>
                    <h2 className="text-sm font-black mb-4 flex items-center gap-2 border-l-4 border-[#2c4d3f] pl-2 uppercase">
                        II. Demographic Breakdown
                    </h2>
                    <table className="w-full border-collapse border border-gray-200 text-xs">
                        <thead>
                            <tr className="bg-gray-50 text-[10px]">
                                <th className="border border-gray-200 p-2 text-left uppercase">User Role</th>
                                <th className="border border-gray-200 p-2 text-center uppercase">Count</th>
                                <th className="border border-gray-200 p-2 text-center uppercase">Share</th>
                                <th className="border border-gray-200 p-2 text-left uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-200 p-2 font-bold italic">Farmers</td>
                                <td className="border border-gray-200 p-2 text-center">{stats?.totalFarmers}</td>
                                <td className="border border-gray-200 p-2 text-center">{Math.round((stats?.totalFarmers / stats?.totalUsers) * 100)}%</td>
                                <td className="border border-gray-200 p-2 text-gray-500">Active Production Units</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-200 p-2 font-bold italic">Officers</td>
                                <td className="border border-gray-200 p-2 text-center">{stats?.totalOfficers}</td>
                                <td className="border border-gray-200 p-2 text-center">{Math.round((stats?.totalOfficers / stats?.totalUsers) * 100)}%</td>
                                <td className="border border-gray-200 p-2 text-gray-500">{stats?.pendingUsers} Pending Approval</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 3. Regional Data */}
                <div className="mb-8" style={{ pageBreakInside: 'avoid' }}>
                    <h2 className="text-sm font-black mb-4 flex items-center gap-2 border-l-4 border-[#2c4d3f] pl-2 uppercase">
                        III. Regional Land Distribution
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
                            {Object.entries(stats?.landsByDistrict || {}).map(([district, count]) => (
                                <tr key={district}>
                                    <td className="border border-gray-200 p-2 font-bold">{district}</td>
                                    <td className="border border-gray-200 p-2 text-center">{count}</td>
                                    <td className="border border-gray-200 p-2">
                                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-[#2c4d3f] h-full" style={{ width: `${(count / stats?.totalLands) * 100}%` }}></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 4. Production Trends */}
                <div className="mb-8" style={{ pageBreakInside: 'avoid' }}>
                    <h2 className="text-sm font-black mb-4 flex items-center gap-2 border-l-4 border-[#2c4d3f] pl-2 uppercase">
                        IV. Production Analytics
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(stats?.harvestTrends || {}).slice(-4).map(([month, amount]) => (
                            <div key={month} className="flex justify-between items-center p-2 border-b border-gray-100">
                                <span className="font-bold text-gray-600 uppercase text-[10px]">{month}</span>
                                <span className="font-black text-[#2c4d3f]">{amount.toLocaleString()} nuts</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Official Footer */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                    <p>Verified by CocoSmart Management Node</p>
                    <p>© 2026 OFFICIAL SYSTEM EXPORT</p>
                </div>
            </div>

            <style>{`
                @media print {
                    @page { size: A4; margin: 0; }
                    .no-print { display: none !important; }
                    body { background: white !important; margin: 0; padding: 0; width: 210mm; }
                    .animate-fadeIn, .animate-slideUp { animation: none !important; }
                    
                    /* Force full width on print */
                    .max-w-7xl { 
                        width: 100% !important; 
                        max-width: 100% !important; 
                        margin: 0 !important; 
                        padding: 0 !important; 
                    }
                    
                    .print-report-container {
                        width: 100% !important;
                        padding: 0.5cm 1cm !important;
                        box-sizing: border-box !important;
                    }

                    table { width: 100% !important; }
                }
            `}</style>
        </div>
    );
};

// --- Subcomponents for Web View ---

const UserStatsSection = ({ stats }) => (
    <div className="space-y-8 animate-slideUp">
        <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">User Demographics</h3>
            <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full">
                {stats?.pendingUsers} Pending Approvals
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
                <ProgressBar label="Farmers" value={stats?.totalFarmers} total={stats?.totalUsers} color="#10b981" />
                <ProgressBar label="Officers" value={stats?.totalOfficers} total={stats?.totalUsers} color="#3b82f6" />
                <ProgressBar label="Admins" value={stats?.totalUsers - stats?.totalFarmers - stats?.totalOfficers} total={stats?.totalUsers} color="#8b5cf6" />
            </div>
            <div className="bg-[#f8faf9] rounded-3xl p-8 flex items-center border border-gray-100">
                <p className="text-gray-500 text-sm leading-relaxed">
                    User distribution shows a healthy ecosystem with {Math.round((stats?.totalFarmers/stats?.totalUsers)*100)}% active farmers. 
                    Regional officer growth is currently at {Math.round((stats?.totalOfficers/stats?.totalUsers)*100)}%.
                </p>
            </div>
        </div>
    </div>
);

const LandStatsSection = ({ stats }) => (
    <div className="space-y-8 animate-slideUp">
        <h3 className="text-xl font-bold text-gray-900">Regional Overview</h3>
        <div className="grid gap-4">
            {Object.entries(stats?.landsByDistrict || {}).map(([district, count]) => (
                <div key={district} className="flex items-center justify-between p-6 bg-[#f8faf9] rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                            <span className="material-symbols-outlined text-emerald-600">location_on</span>
                        </div>
                        <span className="font-bold text-gray-700">{district}</span>
                    </div>
                    <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-black text-sm">{count} Lands</span>
                </div>
            ))}
        </div>
    </div>
);

const HarvestStatsSection = ({ stats }) => (
    <div className="space-y-8 animate-slideUp">
        <h3 className="text-xl font-bold text-gray-900">Harvest Statistics</h3>
        <div className="grid gap-4">
            {Object.entries(stats?.harvestTrends || {}).reverse().map(([month, amount]) => (
                <div key={month} className="flex items-center gap-6 p-6 bg-[#f8faf9] rounded-2xl border border-gray-100">
                    <div className="min-w-[120px] font-bold text-gray-600">{month}</div>
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, (amount / (stats?.totalCoconutsHarvested || 1)) * 500)}%` }}></div>
                    </div>
                    <div className="font-black text-gray-900">{amount.toLocaleString()} <span className="text-[10px] text-gray-400">Nuts</span></div>
                </div>
            ))}
        </div>
    </div>
);

// --- Shared Components ---

const StatCard = ({ title, value, icon, color, subtitle }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
    };

    return (
        <div className={`p-8 rounded-[2.5rem] border ${colors[color]} shadow-sm relative overflow-hidden group`}>
            <div className="relative z-10">
                <span className="material-symbols-outlined text-2xl mb-4 block">{icon}</span>
                <h3 className="text-[11px] font-black uppercase tracking-widest opacity-60 mb-1">{title}</h3>
                <div className="text-3xl font-black text-gray-900 mb-2">{value}</div>
                <div className="text-[10px] font-bold opacity-60">{subtitle}</div>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-7xl opacity-5 rotate-12 group-hover:scale-110 transition-transform">{icon}</span>
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-3 py-6 font-bold transition-all border-b-2 ${active ? 'text-[#2c4d3f] border-[#2c4d3f] bg-emerald-50/20' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
        {label}
    </button>
);

const ProgressBar = ({ label, value, total, color }) => {
    const percentage = Math.round((value / total) * 100) || 0;
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-600">{label}</span>
                <span style={{ color }}>{percentage}% ({value})</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full transition-all duration-1000" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
            </div>
        </div>
    );
};

export default AdminReports;
