import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { visitAPI, authAPI, articleAPI } from '../../api';

const OfficerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  
  // Stats
  const [pendingVisits, setPendingVisits] = useState([]);
  const [scheduledVisitsCount, setScheduledVisitsCount] = useState(0);
  const [recentArticles, setRecentArticles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const officerId = sessionStorage.getItem('userId');
        
        // Get profile for district
        const profileRes = await authAPI.getProfile(user.username);
        setProfile(profileRes.data);
        
        let districtStr = profileRes.data.district;

        if (districtStr) {
          // Fetch pending visits for the district
          const pendingRes = await visitAPI.getPendingByDistrict(districtStr);
          setPendingVisits(pendingRes.data.slice(0, 5));
        }

        if (officerId) {
          // Fetch all visits assigned to this officer to count scheduled ones
          const officerVisitsRes = await visitAPI.getOfficerVisits(officerId);
          const scheduledCount = officerVisitsRes.data.filter(v => v.status === 'SCHEDULED' || v.status === 'ACCEPTED').length;
          setScheduledVisitsCount(scheduledCount);
        }

        // Fetch recent community discussion
        const articlesRes = await articleAPI.getAll(0, 3);
        if (articlesRes.data && articlesRes.data.content) {
          setRecentArticles(articlesRes.data.content);
        }

      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.username) fetchData();
  }, [user]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const StatCard = ({ icon, title, subtitle, value, bgColor, iconColor }) => (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group">
      <div className={`absolute -right-6 -top-6 w-24 h-24 ${bgColor} rounded-full opacity-20 group-hover:scale-110 transition-transform duration-500`}></div>
      <div>
        <h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">{title}</h3>
        <p className="text-2xl font-black text-slate-800 font-headline mb-1">{value}</p>
        <p className="text-[10px] text-slate-400 font-medium">{subtitle}</p>
      </div>
      <div className={`w-14 h-14 ${bgColor} rounded-2xl flex items-center justify-center relative z-10 shadow-inner`}>
        <span className={`material-symbols-outlined text-[28px] ${iconColor}`}>{icon}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative bg-[#1a2233] rounded-[2.5rem] p-10 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-[500px] h-full bg-gradient-to-l from-emerald-500/20 to-transparent pointer-events-none"></div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/10">
             <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
             <span className="text-xs font-bold text-emerald-100 uppercase tracking-widest">Regional Agriculture Officer</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight font-headline">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">{profile?.fullName || user.username}</span>
          </h1>
          <p className="text-slate-300 font-medium max-w-xl text-sm leading-relaxed">
            Overseeing agricultural activities {profile?.district ? `in ${profile.district} District` : ''}. 
            Review pending farmer requests, manage community discussions, and track regional yield.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-[#2c4d3f]/20 border-t-[#2c4d3f] rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div onClick={() => navigate('/plantation/field-visits')}>
              <StatCard 
                icon="directions_car" 
                title="Action Required" 
                value={pendingVisits.length.toString()} 
                subtitle={`Pending visits in ${profile?.district || 'your area'}`}
                bgColor="bg-red-50" 
                iconColor="text-red-500" 
              />
            </div>
            
            <StatCard 
              icon="assignment_turned_in" 
              title="Scheduled Tasks" 
              value={scheduledVisitsCount.toString()} 
              subtitle="Accepted visits assigned to you"
              bgColor="bg-blue-50" 
              iconColor="text-blue-500" 
            />
            
            <StatCard 
              icon="monitoring" 
              title="Regional Yield" 
              value="+5.2%" 
              subtitle="Compared to last quarter"
              bgColor="bg-emerald-50" 
              iconColor="text-emerald-500" 
            />
            
            <div onClick={() => navigate('/community/news')}>
              <StatCard 
                icon="campaign" 
                title="Circulars" 
                value="3" 
                subtitle="New government guidelines"
                bgColor="bg-amber-50" 
                iconColor="text-amber-500" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Priority Field Visits Widget */}
            <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 font-headline">Priority Field Visits</h2>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Pending in {profile?.district || 'your district'}</p>
                </div>
                <button 
                  onClick={() => navigate('/plantation/field-visits')}
                  className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#2c4d3f] hover:bg-emerald-50 transition-all group"
                >
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>

              <div className="flex-1">
                {pendingVisits.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">check_circle</span>
                    <p className="text-slate-600 font-bold">All caught up!</p>
                    <p className="text-xs text-slate-400 mt-1">No pending field visit requests.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingVisits.map(visit => (
                      <div key={visit.id} className="group p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all flex justify-between items-center cursor-pointer relative overflow-hidden" onClick={() => navigate('/plantation/field-visits')}>
                        <div className="absolute left-0 top-0 w-1 h-full bg-red-400"></div>
                        <div className="flex items-center gap-4 pl-3">
                          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                            <span className="material-symbols-outlined">fmd_bad</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{visit.farmerName}</p>
                            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px] md:max-w-xs">{visit.reason}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase tracking-wider">Pending</span>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">{formatDate(visit.requestedDate)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Community Widget */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col h-full bg-gradient-to-b from-white to-slate-50/50">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 font-headline">Community Pulse</h2>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Recent Discussions</p>
                </div>
                <button 
                  onClick={() => navigate('/community/articles/new')}
                  className="w-10 h-10 rounded-xl bg-[#2c4d3f] flex items-center justify-center text-white hover:bg-[#1b3228] transition-all shadow-md group"
                  title="Create New Post"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>

              <div className="flex-1">
                {recentArticles.length === 0 ? (
                  <div className="text-center p-6 pb-0">
                     <p className="text-sm text-slate-500">No recent discussions found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentArticles.map(article => (
                      <div 
                        key={article.id} 
                        onClick={() => navigate(`/community/articles/${article.id}`)}
                        className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors cursor-pointer"
                      >
                         <h4 className="text-sm font-bold text-slate-800 mb-1 line-clamp-1">{article.title}</h4>
                         <p className="text-xs text-slate-500 line-clamp-2">{article.description || article.content.substring(0, 50) + '...'}</p>
                         <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-50">
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-wider">{article.categoryName}</span>
                            <span className="text-[9px] text-slate-400 font-medium">By {article.authorName}</span>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <button 
                  onClick={() => navigate('/community')}
                  className="w-full mt-6 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 uppercase tracking-widest transition-colors"
                >
                  View All Forum Activity
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OfficerDashboard;
