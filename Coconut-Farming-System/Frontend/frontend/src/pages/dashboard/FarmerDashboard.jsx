/*
// Original MUI-based Farmer Dashboard - commented out as requested
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import { Grass, TrendingUp, AttachMoney, Cloud } from '@mui/icons-material';

const StatCard = ({ icon, title, content, color }) => (
  // ... existing code
);

const FarmerDashboard = () => {
    // ... existing code
}
*/

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { landAPI, weatherAPI, financialAPI, fertilizerAPI, authAPI, taskAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ icon, title, value, unit, colorType, delay }) => {
  const isEmerald = colorType === 'emerald';
  const isOrange = colorType === 'orange';
  const isBlue = colorType === 'blue';
  const isSlate = colorType === 'slate';

  let bgClass, textClass, borderClass;
  if (isEmerald) { bgClass = 'bg-emerald-50'; textClass = 'text-emerald-700'; borderClass = 'border-emerald-100'; }
  else if (isOrange) { bgClass = 'bg-orange-50'; textClass = 'text-orange-600'; borderClass = 'border-orange-100'; }
  else if (isBlue) { bgClass = 'bg-blue-50'; textClass = 'text-blue-600'; borderClass = 'border-blue-100'; }
  else { bgClass = 'bg-slate-50'; textClass = 'text-slate-600'; borderClass = 'border-slate-100'; }

  return (
    <div 
      className={`p-6 rounded-[28px] border ${borderClass} shadow-sm bg-white flex items-center space-x-4 transition-all hover:shadow-md hover:-translate-y-1 animate-slide-up opacity-0`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className={`w-12 h-12 rounded-2xl ${bgClass} flex items-center justify-center shrink-0`}>
        <span className={`material-symbols-outlined ${textClass} text-xl`}>{icon}</span>
      </div>
      <div>
        <p className="text-[9px] font-bold text-slate-400 tracking-[0.1em] uppercase mb-0.5">{title}</p>
        <div className="flex items-baseline space-x-1">
          <span className={`text-2xl font-black ${textClass} tracking-tight`}>{value}</span>
          {unit && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight ml-1">{unit}</span>}
        </div>
      </div>
    </div>
  );
};

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [marketPrice, setMarketPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Weather & Lands State
  const [lands, setLands] = useState([]);
  const [selectedLand, setSelectedLand] = useState(null);
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [financialData, setFinancialData] = useState(null);
  const [activeScheduleCount, setActiveScheduleCount] = useState(0);
  const [profile, setProfile] = useState(null);
  const [realTasks, setRealTasks] = useState([]);

  useEffect(() => {
    const farmerId = sessionStorage.getItem('userId');
    const username = sessionStorage.getItem('username');

    const fetchProfile = async () => {
        try {
            const response = await authAPI.getProfile(username);
            setProfile(response.data);
        } catch (err) {
            console.error("Error fetching profile:", err);
        }
    };
    if (username) fetchProfile();
    const fetchMarketPrice = async () => {
      try {
        const response = await axios.get('/api/financial/market-price');
        setMarketPrice(response.data);
      } catch (error) {
        console.error('Error fetching market price:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketPrice();

    const fetchDashboardStats = async () => {
        try {
            const countRes = await fertilizerAPI.getActiveCount(farmerId);
            setActiveScheduleCount(countRes.data);
        } catch (err) {
            console.error("Error fetching schedule count:", err);
        }
    };
    fetchDashboardStats();

    const fetchLands = async () => {
      try {
        const response = await landAPI.getAll(farmerId);
        // Handle Spring Page object
        const landData = response.data.content || response.data || [];
        setLands(landData);
        
        if (landData.length > 0) {
          setSelectedLand(landData[0]);
        } else {
          // Default to Kurunegala if no lands are added
          setSelectedLand({ id: 'default', locationName: 'Kurunegala', district: 'Kurunegala' });
        }
      } catch (err) {
        console.error("Error fetching lands:", err);
        // Fallback to Kurunegala on error
        setSelectedLand({ id: 'default', locationName: 'Kurunegala', district: 'Kurunegala' });
      }
    };
    fetchLands();

    const fetchFinancialData = async () => {
      try {
        const response = await financialAPI.getDashboard(farmerId);
        setFinancialData(response.data);
      } catch (err) {
        console.error("Error fetching financial data:", err);
      }
    };
    fetchFinancialData();

    const fetchRealTasks = async () => {
        try {
            // Fetch all tasks to include Completed and Cancelled ones
            const response = await taskAPI.getAll(farmerId);
            const allTasks = response.data || [];
            
            // Sort to show meaningful recent activity
            const sortedTasks = [...allTasks].sort((a, b) => 
                new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
            );
            
            setRealTasks(sortedTasks.slice(0, 5));
        } catch (err) {
            console.error("Error fetching labor tasks:", err);
        }
    };
    if (farmerId) fetchRealTasks();
  }, []);


  useEffect(() => {
    if (selectedLand) {
      const fetchWeather = async () => {
        try {
          setWeatherLoading(true);
          const location = selectedLand.district || selectedLand.locationName;
          const response = await weatherAPI.getAdvice(location);
          setWeatherInfo(response.data);
        } catch (err) {
          console.error("Error fetching weather:", err);
        } finally {
          setWeatherLoading(false);
        }
      };
      fetchWeather();
    }
  }, [selectedLand]);

  const totalTrees = lands.reduce((sum, land) => sum + (land.numberOfTrees || 0), 0);
  const netProfit = financialData?.totalProfit !== undefined ? financialData.totalProfit : 0;

  const stats = [
    { label: 'TOTAL PLANTATION', value: totalTrees.toLocaleString(), unit: 'Trees', icon: 'forest', color: 'emerald' },
    { label: 'ACTIVE FERTILIZING SCHEDULES', value: activeScheduleCount, unit: 'Plans', icon: 'calendar_clock', color: 'blue' },
    { 
      label: 'MARKET PRICE (NUT)', 
      value: marketPrice ? `${marketPrice.largeMin}-${marketPrice.largeMax}` : '---', 
      unit: 'Rs (L)', 
      icon: 'trending_up',
      subtitle: marketPrice ? `S: ${marketPrice.smallMin}-${marketPrice.smallMax} Rs` : '',
      source: 'Source: CDA',
      color: 'slate'
    },
    { label: 'REAL TIME NET PROFIT', value: `Rs. ${netProfit.toLocaleString()}`, unit: '', icon: 'account_balance_wallet', color: 'orange' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
        case 'COMPLETED': return 'text-emerald-600';
        case 'IN_PROGRESS': return 'text-blue-600';
        case 'CANCELLED': return 'text-rose-600';
        case 'ON_HOLD': return 'text-orange-500';
        default: return 'text-slate-400';
    }
  };

  const getProgressWidth = (status) => {
    switch (status) {
        case 'COMPLETED': return '100%';
        case 'IN_PROGRESS': return '50%';
        case 'CANCELLED': return '0%';
        default: return '10%';
    }
  };

  const getProgressBarColor = (status) => {
    switch (status) {
        case 'COMPLETED': return 'bg-emerald-500';
        case 'IN_PROGRESS': return 'bg-blue-500';
        case 'CANCELLED': return 'bg-rose-500';
        case 'ON_HOLD': return 'bg-orange-400';
        default: return 'bg-slate-300';
    }
  };

  const formatStatusText = (status) => {
      if (!status) return 'Unknown';
      return status.replace(/_/g, ' ').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          if (stat.label === 'MARKET PRICE (NUT)') {
            return (
              <div 
                key={index} 
                className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between min-h-[100px] animate-slide-up opacity-0"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-center space-x-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-slate-600 text-xl">{stat.icon}</span>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 tracking-[0.1em] mb-0.5 uppercase">{stat.label}</p>
                        <div className="flex items-baseline justify-between space-x-4">
                            <span className="text-xl font-black text-slate-900 tracking-tight">
                                {loading ? '---' : `${marketPrice?.largeMin}-${marketPrice?.largeMax}`}
                            </span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight whitespace-nowrap">RS (LARGE)</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="flex items-baseline space-x-2">
                        <span className="text-sm font-black text-slate-600">
                            {loading ? '---' : `${marketPrice?.smallMin}-${marketPrice?.smallMax}`}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">RS (SMALL)</span>
                    </div>
                    <p className="text-[8px] font-medium text-slate-300 uppercase tracking-tighter italic">{stat.source}</p>
                </div>
              </div>
            );
          }
          return (
            <StatCard 
              key={index}
              title={stat.label}
              value={stat.value}
              unit={stat.unit}
              icon={stat.icon}
              colorType={stat.color}
              delay={index * 100}
            />
          );
        })}
      </div>

      {/* Main Section: Analytics & Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Table Card */}
        <div className="lg:col-span-8 bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight font-headline">Labor Task Analytics</h2>
            <div className="flex space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-100"></div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[9px] font-bold text-slate-400 tracking-widest uppercase border-b border-slate-100/50">
                  <th className="pb-6">TASK NAME</th>
                  <th className="pb-6">LABORER</th>
                  <th className="pb-6">PROGRESS</th>
                  <th className="pb-6">STATUS</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {realTasks.length === 0 ? (
                    <tr>
                        <td colSpan="4" className="py-12 text-center text-slate-400 font-medium tracking-tight">
                            No active labor tasks found. Add tasks in the Labor module to track progress.
                        </td>
                    </tr>
                ) : (
                    realTasks.map((task, index) => (
                      <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-8 font-bold text-slate-900 pr-4">{task.title}</td>
                        <td className="py-8 font-medium text-slate-500 pr-4">{task.workerName || 'Unassigned'}</td>
                        <td className="py-8 pr-10 w-48">
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${getProgressBarColor(task.status)} rounded-full transition-all duration-1000 ease-out`}
                                    style={{ width: getProgressWidth(task.status) }}
                                ></div>
                            </div>
                        </td>
                        <td className="py-8">
                            <span className={`text-[11px] font-bold ${getStatusColor(task.status)}`}>
                                {formatStatusText(task.status)}
                            </span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weather Card */}
        <div className="lg:col-span-4 bg-[#242b3d] rounded-[40px] p-10 text-white relative overflow-hidden flex flex-col shadow-2xl">
            {/* Background pattern/glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-[60px] -mr-16 -mt-16"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <span className="material-symbols-outlined text-white text-3xl">bolt</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight leading-none mb-1">Weather Alert</h3>
                      <p className="text-[9px] font-bold text-orange-400 tracking-[0.10em] uppercase">
                        {weatherLoading ? 'Updating...' : (weatherInfo?.alert || 'NO MAJOR ALERTS')}
                      </p>
                    </div>
                </div>

                {/* Land Selection Dropdown */}
                <div className="relative group/select flex items-center space-x-1">
                  <span className="material-symbols-outlined text-white/30 text-[14px]">location_on</span>
                  <div className="relative">
                    <select 
                      className="bg-white/5 border border-white/10 text-[9px] font-bold py-1.5 px-3 rounded-lg appearance-none pr-8 cursor-pointer hover:bg-white/10 transition-colors uppercase tracking-wider outline-none max-w-[120px] truncate custom-select-arrow"
                      value={selectedLand?.id || 'default'}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'default') {
                          setSelectedLand({ id: 'default', locationName: 'Kurunegala', district: 'Kurunegala' });
                        } else {
                          // Robust ID comparison
                          const land = lands.find(l => String(l.id) === String(val));
                          if (land) setSelectedLand(land);
                        }
                      }}
                    >
                      {lands.length > 0 ? (
                        lands.map(land => (
                          <option key={land.id} value={land.id} className="bg-[#242b3d] text-white py-2">{land.locationName}</option>
                        ))
                      ) : (
                        <option value="default" className="bg-[#242b3d] text-white py-2">Kurunegala</option>
                      )}
                    </select>
                  </div>
                </div>
            </div>

            <div className="min-h-[112px] h-28 overflow-y-auto custom-scrollbar pr-2 mb-8 relative z-10 transition-all">
              <p className="text-white/80 text-sm leading-relaxed font-medium">
                  {weatherLoading ? 'Analyzing local conditions for your plantation...' : (weatherInfo?.farmingAdvice || 'Select a land to receive coconut-specific farming advice.')}
              </p>
            </div>

            <div className="pt-8 border-t border-white/10 mt-auto relative z-10">
                <p className="text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase mb-8">
                  {weatherInfo?.city ? `4-DAY FORECAST: ${weatherInfo.city.toUpperCase()}` : 'NEXT 4 DAYS FORECAST'}
                </p>
                <div className="grid grid-cols-4 gap-4 text-center min-h-[80px]">
                    {weatherLoading ? (
                        <div className="col-span-4 py-4 text-white/20 text-[10px] font-bold uppercase tracking-widest animate-pulse">Updating Forecast...</div>
                    ) : (
                      weatherInfo?.forecast?.list ? (
                        weatherInfo.forecast.list.filter((_, i) => i % 8 === 0).slice(0, 4).map((f, i) => {
                            const date = new Date(f.dt * 1000);
                            const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                            const condition = f.weather[0].main.toLowerCase();
                            const icon = condition.includes('rain') ? 'rainy' : condition.includes('cloud') ? 'partly_cloudy_day' : 'sunny';
                            
                            return (
                              <div key={i} className="space-y-3 group cursor-default">
                                  <span className="text-[10px] font-bold text-white/40 group-hover:text-white transition-colors">{dayLabel}</span>
                                  <div className="flex justify-center transition-transform group-hover:scale-110">
                                      <span className={`material-symbols-outlined text-2xl ${icon === 'sunny' ? 'text-orange-400' : icon === 'partly_cloudy_day' ? 'text-yellow-400' : 'text-blue-400'}`}>
                                          {icon}
                                      </span>
                                  </div>
                                  <div className="text-sm font-bold">{Math.round(f.main.temp)}°</div>
                              </div>
                            );
                        })
                      ) : (
                        <div className="col-span-4 py-4 text-white/10 text-[9px] font-bold uppercase tracking-[0.2em]">Forecast Data Currently Unavailable</div>
                      )
                    )}
                </div>
            </div>

        </div>


      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        /* Hide default select arrow and set a custom SVG background one */
        select {
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          appearance: none !important;
        }
        select::-ms-expand {
          display: none !important;
        }
        .custom-select-arrow {
          background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22rgba(255%2C255%2C255%2C0.4)%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E") !important;
          background-repeat: no-repeat !important;
          background-position: right 0.6rem center !important;
          background-size: 0.8em !important;
        }
      `}} />
    </div>
  );
};

export default FarmerDashboard;


