import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { articleAPI, communityCategoryAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const Articles = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [aRes, cRes] = await Promise.all([
        articleAPI.getCommunityPosts(), 
        communityCategoryAPI.getAll()
      ]);
      setArticles(aRes.data?.content || aRes.data || []); 
      setCategories(cRes.data || []);
    } catch (e) { 
      console.error(e); 
      alert('Error loading articles: ' + (e.response?.data?.message || e.message));
    } finally { 
      setLoading(false); 
    }
  };

  const filteredArticles = articles.filter(a => {
    const isApproved = a.status === 'APPROVED';
    const isAuthor = String(user?.id) === String(a.userId);
    const matchesCategory = categoryFilter ? a.categoryId === Number(categoryFilter) : true;
    
    // Show if approved OR if it's the user's own pending post
    return (isApproved || isAuthor) && matchesCategory;
  });

  const handleLike = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await articleAPI.likeArticle(id, user.id);
      setArticles(prev => prev.map(p => p.id === id ? res.data : p));
    } catch (error) {
      console.error('Error liking article:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center py-20 space-y-4 animate-fade-in">
        <span className="material-symbols-outlined text-4xl text-emerald-300 animate-spin">autorenew</span>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Topics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button 
            onClick={() => navigate('/community')}
            className="flex items-center space-x-1 text-slate-400 hover:text-emerald-600 transition-colors group font-bold text-xs uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex max-w-sm">
        <div className="relative group/select w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[18px]">filter_list</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all appearance-none cursor-pointer custom-select-arrow"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white rounded-[32px] p-12 text-center text-slate-400 text-sm font-medium border border-slate-100 shadow-sm">
          <span className="material-symbols-outlined text-6xl text-slate-200 block mb-4">search_off</span>
          No articles found for the selected category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map(article => (
            <div 
              key={article.id}
              onClick={() => navigate(`/community/articles/${article.id}`)}
              className="group bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full relative overflow-hidden"
            >
              {/* Post Thumbnail */}
              <div className="w-full h-48 bg-slate-100 relative overflow-hidden shrink-0">
                {article.articlePhoto ? (
                  <img src={article.articlePhoto} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={article.title} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-50/50">
                    <span className="material-symbols-outlined text-4xl text-emerald-100">image</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                   <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm border border-white/20 text-[9px] font-black tracking-widest uppercase text-slate-700 shadow-sm">
                      {article.categoryName || 'General'}
                   </span>
                   {article.status !== 'APPROVED' && (
                     <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[9px] font-black tracking-widest uppercase shadow-sm">
                        Pending
                     </span>
                   )}
                </div>
              </div>

              <div className="p-8 pt-6 relative z-10 flex flex-col flex-1">
                
                <h3 className="text-xl font-black text-slate-800 leading-tight mb-3 line-clamp-2 group-hover:text-emerald-700 transition-colors tracking-tight">
                  {article.title}
                </h3>
                
                <p className="text-sm font-medium text-slate-500 line-clamp-3 mb-6 flex-1">
                  {article.content?.replace(/(<([^>]+)>)/gi, "")}
                </p>
                
                <div className="pt-4 border-t border-slate-50 mt-auto flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Posted By</span>
                    <span className="text-xs font-black text-slate-700">{article.userName || 'Unknown User'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => handleLike(e, article.id)} 
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-100 hover:border-rose-200 hover:bg-rose-50 transition-colors group/like"
                    >
                      <span 
                        className={`material-symbols-outlined text-[16px] group-hover/like:text-rose-500 transition-colors ${(article.likedByUserIds || []).some(id => String(id) === String(user?.id)) ? 'text-rose-500' : 'text-slate-400'}`}
                        style={{ fontVariationSettings: (article.likedByUserIds || []).some(id => String(id) === String(user?.id)) ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        favorite
                      </span>
                      <span className={`text-[11px] font-bold ${article.likeCount > 0 ? 'text-rose-500' : 'text-slate-400'}`}>{article.likeCount || 0}</span>
                    </button>
                    <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
                       <span className="material-symbols-outlined text-[16px]">visibility</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Articles;
