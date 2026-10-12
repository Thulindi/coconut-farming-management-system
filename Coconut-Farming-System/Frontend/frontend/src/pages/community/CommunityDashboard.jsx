import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { communityDashboardAPI, articleAPI, communityCategoryAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ icon, title, value, colorType }) => {
  const isPrimary = colorType === 'primary';
  const isSuccess = colorType === 'success';
  const isWarning = colorType === 'warning';
  const isInfo = colorType === 'info';
  
  let bgClass, textClass, borderClass;
  if (isPrimary) { bgClass = 'bg-emerald-50'; textClass = 'text-emerald-600'; borderClass = 'border-emerald-100'; }
  else if (isSuccess) { bgClass = 'bg-teal-50'; textClass = 'text-teal-600'; borderClass = 'border-teal-100'; }
  else if (isWarning) { bgClass = 'bg-amber-50'; textClass = 'text-amber-600'; borderClass = 'border-amber-100'; }
  else { bgClass = 'bg-sky-50'; textClass = 'text-sky-600'; borderClass = 'border-sky-100'; }

  return (
    <div className={`p-8 rounded-[32px] border ${borderClass} shadow-sm transition-all relative overflow-hidden flex flex-col justify-center min-h-[160px] bg-white hover:shadow-md hover:-translate-y-1`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center transition-transform hover:scale-110`}>
          <span className={`material-symbols-outlined ${textClass} text-xl`}>{icon}</span>
        </div>
        <p className="text-[9px] font-bold text-slate-400 tracking-[0.15em] uppercase">{title}</p>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className={`text-4xl font-black ${textClass} tracking-tighter`}>{value.toLocaleString()}</span>
      </div>
    </div>
  );
};

const CommunityDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentPosts, setRecentPosts] = useState([]);
  const [yourArticlesCount, setYourArticlesCount] = useState(0);
  const [topArticle, setTopArticle] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', categoryId: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsRes, postsRes, cRes] = await Promise.all([
        communityDashboardAPI.getStats(),
        articleAPI.getCommunityPosts(),
        communityCategoryAPI.getAll()
      ]);
      setStats(statsRes.data || {}); 
      setCategories(cRes.data || []);
      
      const allPosts = postsRes.data || [];
      // Calculate 'Your Articles' count
      const myPosts = allPosts.filter(p => String(user?.id) === String(p.userId));
      setYourArticlesCount(myPosts.length);

      // Find top article (most likes)
      if (allPosts.length > 0) {
        const top = [...allPosts].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))[0];
        if (top && (top.likeCount || 0) > 0) {
          setTopArticle(top);
        } else {
          setTopArticle(null);
        }
      }

      // Filter for recent list
      const filtered = allPosts.filter(p => p.status === 'APPROVED' || String(user?.id) === String(p.userId));
      setRecentPosts(filtered.slice(0, 5));
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleLike = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await articleAPI.likeArticle(id, user.id);
      setRecentPosts(prev => prev.map(p => p.id === id ? res.data : p));
      if (topArticle && topArticle.id === id) {
        setTopArticle(res.data);
      }
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, categoryId: form.categoryId || null, userId: user?.id };
      await articleAPI.create(data);
      alert('Post submitted successfully! It will be visible once an admin approves it.');
      setIsModalOpen(false);
      setForm({ title: '', content: '', categoryId: '' });
      loadData(); // refresh list
    } catch (error) {
      console.error(error);
      alert('Failed to publish post.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center py-20 space-y-4 animate-fade-in">
        <span className="material-symbols-outlined text-4xl text-fuchsia-300 animate-spin">autorenew</span>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Community...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      
      {/* Header Actions */}
      <div className="flex justify-end items-center">
        <button 
          onClick={() => navigate('/community/articles/new')}
          className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <span className="material-symbols-outlined text-[18px]">post_add</span>
          <span className="text-xs font-bold uppercase tracking-wider">New Post</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          icon="article"
          title="Total Articles"
          value={stats.totalPosts || 0}
          colorType="primary"
        />
        <StatCard
          icon="edit_document"
          title="Your Articles"
          value={yourArticlesCount}
          colorType="success"
        />
        <StatCard
          icon="group"
          title="Active Members"
          value={stats.activeUsers || 0}
          colorType="info"
        />
      </div>

      <div className="flex flex-col gap-6">

        {/* Top Liked Post Highlight (More compact version) */}
        {topArticle && (
          <div className="w-full">
            <div 
               className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-[24px] p-6 shadow-md relative overflow-hidden group cursor-pointer transition-all hover:shadow-lg" 
               onClick={() => navigate(`/community/articles/${topArticle.id}`)}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -translate-x-full group-hover:translate-x-full"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-yellow-300 animate-pulse text-2xl">local_fire_department</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-0.5">
                      <span className="text-[8px] font-black text-emerald-100 uppercase tracking-[0.2em]">Trending Discussion</span>
                    </div>
                    <h3 className="text-lg font-black text-white leading-tight line-clamp-1">
                      {topArticle.title}
                    </h3>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 shrink-0 md:border-l md:border-white/10 md:pl-6">
                  <div className="flex items-center space-x-2">
                     <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-[10px] uppercase">
                        {topArticle.userName?.charAt(0)}
                     </div>
                     <span className="text-white font-bold text-xs">{topArticle.userName}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={(e) => handleLike(e, topArticle.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm border border-white/10"
                    >
                      <span 
                        className={`material-symbols-outlined text-[14px] ${(topArticle.likedByUserIds || []).some(id => String(id) === String(user?.id)) ? 'text-rose-400' : 'text-white'}`}
                        style={{ fontVariationSettings: (topArticle.likedByUserIds || []).some(id => String(id) === String(user?.id)) ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        favorite
                      </span>
                      <span className="text-white font-bold text-[10px]">{topArticle.likeCount || 0}</span>
                    </button>
                    <span className="material-symbols-outlined text-white/50 text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Posts Panel */}
        <div className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden w-full">
          
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-bl-[100px] -z-10 opacity-50"></div>

          <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-4">
            <h2 className={`text-xl font-black text-slate-900 tracking-tight font-headline flex items-center space-x-2`}>
              <span className="material-symbols-outlined text-emerald-600">forum</span>
              <span>Recent Community Discussions</span>
            </h2>
            <button 
              onClick={() => navigate('/community/articles')}
              className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:text-emerald-800 transition-colors"
            >
              Explore All Posts &rarr;
            </button>
          </div>

        {recentPosts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm font-medium">
            <span className="material-symbols-outlined text-5xl text-slate-200 mb-3 block">speaker_notes_off</span>
            No discussions found yet. Be the first to start a topic!
          </div>
        ) : (
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div 
                key={post.id} 
                onClick={() => navigate(`/community/articles/${post.id}`)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-fuchsia-200 hover:bg-fuchsia-50/30 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="flex-1 min-w-0 pr-4">
                        <h4 className="text-sm font-black text-slate-800 line-clamp-1 group-hover/post:text-fuchsia-600 transition-colors">
                          {post.title}
                          {post.status !== 'APPROVED' && (
                            <span className="ml-2 px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded text-[8px] font-bold uppercase tracking-tighter">Pending</span>
                          )}
                        </h4>
                  <div className="flex items-center space-x-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                    <span className="flex items-center space-x-1">
                      <span className="material-symbols-outlined text-[14px]">account_circle</span>
                      <span>By {post.userName || 'Unknown'}</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded flex items-center space-x-1">
                      <span className="material-symbols-outlined text-[12px]">sell</span>
                      <span>{post.categoryName || 'General'}</span>
                    </span>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center shrink-0 space-x-2">
                  <button 
                    onClick={(e) => handleLike(e, post.id)} 
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-100 hover:border-rose-200 hover:bg-rose-50 transition-colors mr-2 group/like"
                  >
                    <span 
                      className={`material-symbols-outlined text-[16px] group-hover/like:text-rose-500 transition-colors ${(post.likedByUserIds || []).some(id => String(id) === String(user?.id)) ? 'text-rose-500' : 'text-slate-400'}`}
                      style={{ fontVariationSettings: (post.likedByUserIds || []).some(id => String(id) === String(user?.id)) ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      favorite
                    </span>
                    <span className={`text-[11px] font-bold ${post.likeCount > 0 ? 'text-rose-500' : 'text-slate-400'}`}>{post.likeCount || 0}</span>
                  </button>
                  <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-fuchsia-600 group-hover:text-white text-slate-400 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      {/* New Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-[600px] rounded-[2rem] p-8 shadow-2xl animate-fade-in overflow-hidden">
             {/* Decorative element */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-bl-[100px] -z-10 opacity-50"></div>
             
             <h2 className="text-2xl font-black text-slate-800 mb-1 font-headline">Capture a New Post</h2>
             <p className="text-sm text-slate-500 mb-6 font-medium">Have something interesting to share with the community?</p>
             
             <form onSubmit={handleSubmitPost} className="space-y-5 relative z-10">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1 block mb-2">Post Title *</label>
                  <input
                    required
                    type="text"
                    value={form.title}
                    onChange={e => setForm({...form, title: e.target.value})}
                    placeholder="E.g. Does anyone know how to treat yellowing fronds?"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all placeholder:font-normal"
                  />
               </div>

               <div className="relative group/select">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1 block mb-2">Topic Category</label>
                  <select
                    value={form.categoryId}
                    onChange={e => setForm({...form, categoryId: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all appearance-none cursor-pointer custom-select-arrow"
                  >
                    <option value="">Select Category (Optional)</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>

               <div>
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1 block mb-2">Content *</label>
                  <textarea
                    required
                    rows={6}
                    value={form.content}
                    onChange={e => setForm({...form, content: e.target.value})}
                    placeholder="Share your experience, question, or tips here..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all resize-none"
                  />
               </div>

               <div className="flex gap-4 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 border border-slate-200 bg-white text-slate-600 font-bold rounded-xl hover:bg-slate-50 focus:outline-none transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">{saving ? 'autorenew' : 'send'}</span>
                    <span>{saving ? 'Publishing...' : 'Publish Post'}</span>
                  </button>
               </div>
             </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CommunityDashboard;
