import React, { useState, useEffect } from 'react';
import { newsAPI } from '../../api';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadNews(); }, []);

  const loadNews = async () => {
    try {
      const res = await newsAPI.getNews();
      if (res.data.error) {
        console.error("Backend error:", res.data.error);
        setNews([]);
      } else {
        // Cap at 20 articles
        setNews((res.data.articles || []).slice(0, 20));
      }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center py-20 space-y-4 animate-fade-in">
        <span className="material-symbols-outlined text-4xl text-emerald-300 animate-spin">autorenew</span>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Fetching Latest News...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter font-headline mb-2">Agriculture Global News</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Latest updates from the farming world</p>
        </div>
      </div>

      {news.length === 0 ? (
        <div className="bg-white rounded-[32px] p-12 text-center text-slate-400 text-sm font-medium border border-slate-100 shadow-sm">
          <span className="material-symbols-outlined text-6xl text-slate-200 block mb-4">newspaper</span>
          No news available at the moment. Please check back later.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item, i) => (
            <div key={i} className="bg-white rounded-[24px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col h-full group">
              {(item.image || item.urlToImage) && (
                <div className="w-full h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10"></div>
                  <img
                    src={item.image || item.urlToImage}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
              )}
              
              <div className="p-6 flex flex-col flex-1">
                {item.source?.name && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase bg-emerald-50 text-emerald-600 mb-3 w-fit">
                    {item.source.name}
                  </span>
                )}
                
                <h3 className="text-lg font-black text-slate-800 leading-tight mb-3 line-clamp-3 group-hover:text-emerald-700 transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-sm font-medium text-slate-500 line-clamp-3 mb-6 flex-1">
                  {item.description || item.summary || 'No further description provided.'}
                </p>
                
                {item.url && (
                  <div className="pt-4 border-t border-slate-50 mt-auto">
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center space-x-1 text-xs font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-800 transition-colors"
                    >
                      <span>Read Full Story</span>
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
    </div>
  );
};

export default News;
