import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { articleAPI, commentAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      const [aRes, cRes] = await Promise.all([articleAPI.getById(id), commentAPI.getByArticle(id)]);
      const articleData = aRes.data;
      
      const role = sessionStorage.getItem('roles') || '';
      const isAdmin = role.includes('ADMIN');
      const isAuthor = String(user?.id) === String(articleData.userId);

      // Security check: If not approved, only author or admin can view
      if (articleData.status !== 'APPROVED' && !isAdmin && !isAuthor) {
          alert('This article is pending approval and is not yet public.');
          navigate('/community/articles');
          return;
      }

      setArticle(articleData); 
      setComments(cRes.data || []);
    } catch (e) { 
      console.error(e); 
      alert('Error loading article details: ' + (e.response?.data?.message || e.message));
    } finally { 
      setLoading(false); 
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await commentAPI.create({ articleId: id, content: newComment, userId: user?.id });
      setNewComment(''); 
      loadData();
    } catch (e) { 
      console.error(e); 
      alert('Error adding comment: ' + (e.response?.data?.message || e.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this article? This cannot be undone.')) return;
    try { 
      const role = sessionStorage.getItem('roles') || '';
      const isAdmin = role.includes('ADMIN');
      
      if (isAdmin) {
          await articleAPI.adminDelete(id, user?.id || 1);
      } else {
          await articleAPI.delete(id, user?.id); 
      }
      navigate('/community/articles'); 
    } catch (e) { 
      console.error(e); 
      alert('Error deleting article: ' + (e.response?.data?.message || e.message));
    }
  };

  const handleUpdateStatus = async (status) => {
    setActionLoading(true);
    try {
        await articleAPI.updateStatus(id, status);
        alert(`Article ${status.toLowerCase()} successfully!`);
        loadData();
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Failed to update article status.');
    } finally {
        setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center py-20 space-y-4 animate-fade-in">
        <span className="material-symbols-outlined text-4xl text-emerald-300 animate-spin">autorenew</span>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="py-20 text-center">
        <span className="material-symbols-outlined text-6xl text-slate-200 block mb-4">article</span>
        <p className="text-slate-400 font-bold">Article not found.</p>
      </div>
    );
  }

  const isOwner = String(user?.id) === String(article.userId);
  const isAdmin = user?.roles?.includes('ADMIN');

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await commentAPI.delete(commentId, user?.id, isAdmin);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (e) {
      console.error(e);
      alert('Failed to delete comment.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-4xl mx-auto">
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/community')}
        className="flex items-center space-x-2 text-sm font-bold text-slate-500 hover:text-emerald-700 transition-colors group"
      >
        <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span>Back to Community Dashboard</span>
      </button>

      {/* Article Card */}
      <div className="bg-white rounded-[32px] p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
        
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-bl-[100px] -z-10 opacity-50"></div>

        {/* Article Header */}
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              {article.categoryName && (
                <span className="inline-flex items-center px-2.5 py-1 rounded bg-emerald-50 border border-emerald-100 text-[10px] font-black tracking-widest uppercase text-emerald-700 mb-4 w-fit">
                  {article.categoryName}
                </span>
              )}
              {article.status !== 'APPROVED' && (
                <span className="inline-flex items-center px-2.5 py-1 rounded bg-amber-50 border border-amber-100 text-[10px] font-black tracking-widest uppercase text-amber-600 mb-4 ml-2 w-fit">
                   {article.status} - Pending Approval
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter font-headline leading-tight">
                {article.title}
              </h1>
            </div>
            
            {(isOwner || user?.roles?.includes('ADMIN')) && (
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => navigate(`/community/articles/${id}/edit`)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition-all font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md"
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                  <span>Delete</span>
                </button>
              </div>
            )}
            
            {sessionStorage.getItem('roles')?.includes('ADMIN') && article.status === 'PENDING' && (
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleUpdateStatus('APPROVED')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-md flex items-center space-x-1"
                >
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handleUpdateStatus('REJECTED')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-md flex items-center space-x-1"
                >
                  <span className="material-symbols-outlined text-sm">cancel</span>
                  <span>Reject</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Article Meta */}
          <div className="flex items-center space-x-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-6 mb-8">
            <span className="flex items-center space-x-1">
              <span className="material-symbols-outlined text-[14px]">account_circle</span>
              <span>{article.userName || 'Unknown Author'}</span>
            </span>
            {article.createdAt && (
              <>
                <span className="text-slate-300">•</span>
                <span className="flex items-center space-x-1">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  <span>{new Date(article.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </span>
              </>
            )}
          </div>

          {/* Article Full Image */}
          {article.articlePhoto && (
            <div className="mb-8 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
              <img src={article.articlePhoto} className="w-full h-auto max-h-[500px] object-cover" alt={article.title} />
            </div>
          )}
          
          {/* Article Content */}
          <div className="text-slate-700 leading-relaxed font-medium text-base whitespace-pre-wrap">
            {article.content}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50/50 rounded-bl-[100px] -z-10 opacity-50"></div>

        <div className="relative z-10">
          <h2 className={`text-xl font-black text-slate-900 tracking-tight font-headline flex items-center space-x-2 border-b border-slate-50 pb-4 mb-8`}>
            <span className="material-symbols-outlined text-sky-600">chat</span>
            <span>Discussions <span className="text-sky-600 ml-1">{comments.length}</span></span>
          </h2>

          {/* Add Comment */}
          <div className="flex items-start space-x-3 mb-8 pb-8 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-black flex items-center justify-center text-sm shrink-0">
              {user?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="flex-1 flex items-center space-x-3">
              <input
                type="text"
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
              />
              <button
                onClick={handleAddComment}
                disabled={submitting || !newComment.trim()}
                className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </div>
          
          {/* Comments List */}
          {comments.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm font-medium">
              <span className="material-symbols-outlined text-5xl text-slate-200 block mb-3">speaker_notes_off</span>
              No comments yet. Be the first to join the discussion!
            </div>
          ) : (
            <div className="space-y-5">
              {comments.map((c) => (
                <div key={c.id} className="flex items-start space-x-4">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center text-xs shrink-0">
                    {(c.userName || c.username || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-2xl px-5 py-4 group/comment relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-slate-700">{c.userName || c.username || 'Unknown User'}</span>
                      <div className="flex items-center space-x-3">
                        <span className="text-[10px] font-bold text-slate-400">
                          {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                        </span>
                        {(isOwner || user?.roles?.includes('ADMIN')) && (
                          <button 
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-rose-400 hover:text-rose-600 transition-colors opacity-0 group-hover/comment:opacity-100"
                            title="Delete comment"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-slate-700">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ArticleDetail;
