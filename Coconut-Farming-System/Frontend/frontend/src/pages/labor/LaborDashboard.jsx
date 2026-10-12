import React, { useState, useEffect } from 'react';
import { laborAnalyticsAPI, workLogAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Workers from './Workers';
import Tasks from './Tasks';
import WorkLogs from './WorkLogs';
import LaborAnalytics from './LaborAnalytics';

const StatCard = ({ icon, title, value, displayValue, colorType, onClick }) => {
  const isPrimary = colorType === 'primary';
  const isSuccess = colorType === 'success';
  const isWarning = colorType === 'warning';
  
  let bgClass, textClass, borderClass;
  if (isPrimary) { bgClass = 'bg-indigo-50'; textClass = 'text-indigo-600'; borderClass = 'border-indigo-100'; }
  else if (isSuccess) { bgClass = 'bg-emerald-50'; textClass = 'text-emerald-600'; borderClass = 'border-emerald-100'; }
  else if (isWarning) { bgClass = 'bg-amber-50'; textClass = 'text-amber-600'; borderClass = 'border-amber-100'; }
  else { bgClass = 'bg-sky-50'; textClass = 'text-sky-600'; borderClass = 'border-sky-100'; }

  return (
    <div 
      onClick={onClick}
      className={`p-6 md:p-8 rounded-[28px] border ${borderClass} shadow-sm transition-all group relative overflow-hidden flex flex-col justify-center min-h-[140px] bg-white ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : ''}`}
    >
      <div className="flex items-center space-x-3 mb-4 z-10">
        <div className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center transition-transform group-hover:scale-110`}>
          <span className={`material-symbols-outlined ${textClass} text-xl`}>{icon}</span>
        </div>
        <p className="text-[9px] font-bold text-slate-400 tracking-[0.15em] uppercase">{title}</p>
      </div>
      <div className="flex items-baseline space-x-2 z-10">
        <span className={`text-4xl font-black ${textClass} tracking-tighter`}>
          {displayValue !== undefined ? displayValue : value.toLocaleString()}
        </span>
      </div>
      
      {/* Subtle background decoration */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 ${bgClass} rounded-full opacity-30 transform group-hover:scale-150 transition-transform duration-500 pointer-events-none`}></div>
    </div>
  );
};

const LaborDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tasks'); // Default to tasks as per user preference
  const [stats, setStats] = useState({ totalWorkers: 0, activeWorkers: 0, totalTasks: 0, completedTasks: 0, totalLaborCost: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    if (user?.id) loadStats(); 
  }, [user?.id]);

  const loadStats = async () => {
    if (!user?.id) return;
    try {
      const [analyticsRes, logsRes] = await Promise.all([
        laborAnalyticsAPI.getDashboard(user.id),
        workLogAPI.getAll(user.id)
      ]);
      const analyticsData = analyticsRes.data || {};
      const logs = logsRes.data || [];
      const totalLaborCost = logs.reduce((sum, l) => sum + (l.calculatedSalary || 0), 0);
      setStats({ ...analyticsData, totalLaborCost });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'workers', label: 'Workers', icon: 'groups' },
    { id: 'tasks', label: 'Tasks', icon: 'assignment' },
    { id: 'logs', label: 'Work Logs', icon: 'history' },
    { id: 'analytics', label: 'Analytics', icon: 'bar_chart' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center py-20 space-y-4 animate-fade-in">
        <span className="material-symbols-outlined text-5xl text-indigo-600 animate-spin">autorenew</span>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Initialising Labor Hub...</p>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'tasks': return <Tasks embedded={true} refreshStats={loadStats} />;
      case 'logs': return <WorkLogs embedded={true} refreshStats={loadStats} />;
      case 'analytics': return <LaborAnalytics embedded={true} />;
      case 'workers':
      default: return <Workers embedded={true} refreshStats={loadStats} />;
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon="group" title="Total Workers" value={stats.totalWorkers || 0} colorType="primary" />
        <StatCard icon="how_to_reg" title="Active Workers" value={stats.activeWorkers || 0} colorType="success" />
        <StatCard icon="task_alt" title="Completed Tasks" value={stats.completedTasks || 0} colorType="warning" />
        <StatCard
          icon="payments"
          title="Total Labor Cost"
          value={0}
          displayValue={`Rs. ${(stats.totalLaborCost || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          colorType="info"
        />
      </div>

      {/* Modern Tab Navigation */}
      <div className="border-b border-slate-100 mb-8 mt-4">
        <div className="flex space-x-8 overflow-x-auto custom-scrollbar scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 flex items-center space-x-2 transition-all relative ${
                activeTab === tab.id
                  ? 'text-indigo-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className={`material-symbols-outlined text-[16px] ${activeTab === tab.id ? 'font-black text-indigo-600' : ''}`}>
                {tab.icon}
              </span>
              <span className={`text-xs font-bold uppercase tracking-widest whitespace-nowrap ${activeTab === tab.id ? '' : 'font-medium'}`}>
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full animate-tab-slide"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-300">
        {renderActiveTab()}
      </div>

      {/* Animation Styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes tabSlide {
          from { width: 0; opacity: 0; }
          to { width: 100%; opacity: 1; }
        }
        .animate-tab-slide {
          animation: tabSlide 0.3s ease-out forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

    </div>
  );
};

export default LaborDashboard;
