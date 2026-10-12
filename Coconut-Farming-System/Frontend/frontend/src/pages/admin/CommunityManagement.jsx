import React, { useState, useEffect } from 'react';
import { articleAPI, communityDashboardAPI, communityCategoryAPI, commentAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon, title, value, colorType }) => {
  const isPrimary = colorType === 'primary';
  const isWarning = colorType === 'warning';
  const isSuccess = colorType === 'success';
  const isInfo = colorType === 'info';

  let bgClass, textClass, borderClass;
  if (isPrimary) { bgClass = 'bg-emerald-50'; textClass = 'text-emerald-700'; borderClass = 'border-emerald-100'; }
  else if (isWarning) { bgClass = 'bg-orange-50'; textClass = 'text-orange-600'; borderClass = 'border-orange-100'; }
  else if (isSuccess) { bgClass = 'bg-blue-50'; textClass = 'text-blue-700'; borderClass = 'border-blue-100'; }
  else { bgClass = 'bg-slate-50'; textClass = 'text-slate-600'; borderClass = 'border-slate-100'; }

  return (
    <div className={`p-6 rounded-[28px] border ${borderClass} shadow-sm bg-white flex items-center space-x-4 transition-all hover:shadow-md hover:-translate-y-0.5`}>
      <div className={`w-12 h-12 rounded-2xl ${bgClass} flex items-center justify-center shrink-0`}>
        <span className={`material-symbols-outlined ${textClass} text-xl`}>{icon}</span>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 tracking-[0.1em] uppercase mb-0.5">{title}</p>
        <p className={`text-2xl font-black ${textClass} tracking-tight`}>{value ? value.toLocaleString() : 0}</p>
      </div>
    </div>
  );
};

const ArticleModal = ({ articleId, isOpen, onClose, onActionSuccess, categories }) => {
    const { user } = useAuth();
    const [article, setArticle] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Edit Mode State
    const [isEditMode, setIsEditMode] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', content: '', categoryId: '' });
    
    // Comment State
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        if (isOpen && articleId) {
            loadArticleData();
            setIsEditMode(false);
        }
    }, [isOpen, articleId]);

    const loadArticleData = async () => {
        setLoading(true);
        try {
            const [aRes, cRes] = await Promise.all([
                articleAPI.getById(articleId),
                commentAPI.getByArticle(articleId)
            ]);
            setArticle(aRes.data);
            setComments(cRes.data || []);
            setEditForm({
                title: aRes.data.title,
                content: aRes.data.content,
                categoryId: aRes.data.categoryId || ''
            });
        } catch (error) {
            console.error('Error loading article:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (status) => {
        setActionLoading(true);
        try {
            await articleAPI.updateStatus(articleId, status);
            alert(`Article ${status.toLowerCase()} successfully!`);
            onActionSuccess();
            onClose();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update article status.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const userId = user?.id || sessionStorage.getItem('userId');
            const isAdmin = user?.roles?.includes('ADMIN') || false;
            await articleAPI.update(articleId, { ...editForm, userId }, isAdmin);
            alert('Article updated successfully!');
            setIsEditMode(false);
            loadArticleData();
            onActionSuccess();
        } catch (error) {
            console.error('Error updating article:', error);
            alert('Failed to update article.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this article?')) return;
        setActionLoading(true);
        try {
            const userId = user?.id || sessionStorage.getItem('userId');
            await articleAPI.adminDelete(articleId, userId);
            alert('Article deleted successfully!');
            onActionSuccess();
            onClose();
        } catch (error) {
            console.error('Error deleting article:', error);
            alert('Failed to delete article.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setSubmittingComment(true);
        try {
            const userId = user?.id || sessionStorage.getItem('userId');
            await commentAPI.create({
                content: newComment,
                articleId: articleId,
                userId: userId
            });
            setNewComment('');
            // Reload comments
            const cRes = await commentAPI.getByArticle(articleId);
            setComments(cRes.data || []);
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Failed to add comment.');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        try {
            const userId = user?.id || sessionStorage.getItem('userId');
            await commentAPI.delete(commentId, userId, true);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Failed to delete comment.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-fade-in border border-slate-200">
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <span className="material-symbols-outlined">{isEditMode ? 'edit_note' : 'menu_book'}</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 tracking-tight font-headline">
                                {isEditMode ? 'Edit Article' : 'Article Preview'}
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                                {isEditMode ? 'Modify discussion content' : 'Administrative View'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {!isEditMode && article && (
                            <button 
                                onClick={() => setIsEditMode(true)}
                                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center space-x-2 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                <span>Edit Mode</span>
                            </button>
                        )}
                        <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
                    {loading ? (
                        <div className="flex flex-col items-center py-20">
                            <span className="material-symbols-outlined text-4xl text-emerald-300 animate-spin">autorenew</span>
                            <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-[0.2em]">Synchronising data...</p>
                        </div>
                    ) : article ? (
                        <div className="space-y-8 animate-fade-in">
                            
                            {isEditMode ? (
                                /* EDIT MODE FORM */
                                <form onSubmit={handleSaveChanges} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Article Title</label>
                                            <input 
                                                type="text"
                                                required
                                                value={editForm.title}
                                                onChange={e => setEditForm({...editForm, title: e.target.value})}
                                                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all uppercase"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Category</label>
                                            <select 
                                                value={editForm.categoryId}
                                                onChange={e => setEditForm({...editForm, categoryId: e.target.value})}
                                                className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all appearance-none cursor-pointer custom-select-arrow"
                                            >
                                                <option value="">General</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Article Content</label>
                                        <textarea 
                                            required
                                            rows={12}
                                            value={editForm.content}
                                            onChange={e => setEditForm({...editForm, content: e.target.value})}
                                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all resize-none leading-relaxed"
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                                        <button 
                                            type="button" 
                                            onClick={() => setIsEditMode(false)}
                                            className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200 transition-all uppercase tracking-widest"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            disabled={actionLoading}
                                            className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50"
                                        >
                                            {actionLoading ? 'Saving...' : 'Verify & Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                /* VIEW MODE CONTENT */
                                <>
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-4">
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    {article.categoryName || 'General'}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    article.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' : 
                                                    article.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                    {article.status}
                                                </span>
                                            </div>
                                            <h1 className="text-3xl font-black text-slate-900 leading-tight mb-4 tracking-tight uppercase">{article.title}</h1>
                                            <div className="flex items-center space-x-3 text-xs font-bold text-slate-400 uppercase">
                                                <span className="flex items-center space-x-1"><span className="material-symbols-outlined text-[14px]">person</span><span>{article.userName}</span></span>
                                                <span>•</span>
                                                <span className="flex items-center space-x-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span><span>{new Date(article.createdAt).toLocaleDateString()}</span></span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {article.status === 'PENDING' && (
                                                <>
                                                    <button onClick={() => handleUpdateStatus('APPROVED')} disabled={actionLoading} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md">Approve</button>
                                                    <button onClick={() => handleUpdateStatus('REJECTED')} disabled={actionLoading} className="px-6 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-amber-600 transition-all shadow-md">Reject</button>
                                                </>
                                            )}
                                            <button onClick={handleDelete} disabled={actionLoading} className="w-12 h-12 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl flex items-center justify-center transition-all shadow-sm"><span className="material-symbols-outlined">delete</span></button>
                                        </div>
                                    </div>

                                    {/* Article Image Preview */}
                                    {article.articlePhoto && (
                                        <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm max-h-[300px]">
                                            <img src={article.articlePhoto} className="w-full h-full object-cover" alt="Article" />
                                        </div>
                                    )}

                                    <div className="bg-white rounded-3xl p-8 text-slate-700 leading-relaxed font-medium whitespace-pre-wrap border border-slate-100 shadow-sm">
                                        {article.content}
                                    </div>

                                    {/* Comments Section */}
                                    <div className="space-y-6 pt-6 border-t border-slate-200">
                                        <h3 className="text-lg font-black text-slate-800 flex items-center space-x-2">
                                            <span className="material-symbols-outlined text-blue-600">forum</span>
                                            <span>Discussion Feed ({comments.length})</span>
                                        </h3>
                                        
                                        {/* Admin Comment Input */}
                                        <div className="flex items-start space-x-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
                                                <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <textarea 
                                                    placeholder="As an admin, you can provide official guidance or moderate this discussion..."
                                                    value={newComment}
                                                    onChange={e => setNewComment(e.target.value)}
                                                    className="w-full bg-slate-50 border-none focus:ring-0 text-sm font-medium text-slate-700 rounded-xl p-3 resize-none h-20"
                                                />
                                                <div className="flex justify-end">
                                                    <button 
                                                        onClick={handleAddComment}
                                                        disabled={submittingComment || !newComment.trim()}
                                                        className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-40"
                                                    >
                                                        {submittingComment ? 'Posting...' : 'Post Admin Guidance'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {comments.length === 0 ? (
                                                <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No participant interaction found</p>
                                                </div>
                                            ) : (
                                                comments.map((c, i) => (
                                                    <div key={i} className="flex space-x-3 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0 border border-slate-100">
                                                            {(c.userName || c.username || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-xs font-black text-slate-800">{c.userName || c.username}</span>
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="text-[10px] text-slate-400 font-bold">{new Date(c.createdAt).toLocaleDateString()}</span>
                                                                    <button 
                                                                        onClick={() => handleDeleteComment(c.id)}
                                                                        className="w-7 h-7 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-slate-600 font-medium leading-relaxed">{c.content}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-20 text-slate-400">
                            <span className="material-symbols-outlined text-5xl mb-4">search_off</span>
                            <span className="font-bold text-sm uppercase tracking-widest">Article signature not found</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CommunityManagement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('moderation'); // moderation, all_articles
    const [pendingArticles, setPendingArticles] = useState([]);
    const [allArticles, setAllArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    
    // Modal State
    const [selectedArticleId, setSelectedArticleId] = useState(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [pendingRes, allRes, statsRes, catRes] = await Promise.all([
                articleAPI.getPending(),
                articleAPI.getCommunityPosts(),
                communityDashboardAPI.getStats(),
                communityCategoryAPI.getAll()
            ]);
            setPendingArticles(pendingRes.data.content || []);
            setAllArticles(allRes.data || []);
            setStats(statsRes.data || {});
            setCategories(catRes.data || []);
        } catch (error) {
            console.error('Error loading community data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        setActionLoading(id);
        try {
            await articleAPI.updateStatus(id, status);
            setPendingArticles(prev => prev.filter(a => a.id !== id));
            if (status === 'APPROVED') {
                const allRes = await articleAPI.getCommunityPosts();
                setAllArticles(allRes.data || []);
            }
            const statsRes = await communityDashboardAPI.getStats();
            setStats(statsRes.data || {});
            alert(`Article ${status.toLowerCase()} successfully!`);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update article status.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id, isAdminQueue = false) => {
        if (!window.confirm('Are you sure you want to delete this article?')) return;
        setActionLoading(id);
        try {
            const userId = user?.id || sessionStorage.getItem('userId');
            await articleAPI.adminDelete(id, userId);
            if (isAdminQueue) {
                setPendingArticles(prev => prev.filter(a => a.id !== id));
            } else {
                setAllArticles(prev => prev.filter(a => a.id !== id));
            }
            const statsRes = await communityDashboardAPI.getStats();
            setStats(statsRes.data || {});
            alert('Article deleted successfully!');
        } catch (error) {
            console.error('Error deleting article:', error);
            alert('Failed to delete article.');
        } finally {
            setActionLoading(null);
        }
    };

    const openViewer = (id) => {
        setSelectedArticleId(id);
        setIsViewerOpen(true);
    };

    const tabs = [
        { id: 'moderation', label: 'Moderation Queue', icon: 'gavel', badge: pendingArticles.length },
        { id: 'all_articles', label: 'All Articles', icon: 'article' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center flex-col items-center py-20 space-y-4 animate-fade-in">
                <span className="material-symbols-outlined text-4xl text-emerald-300 animate-spin">autorenew</span>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Initialising Admin Hub...</p>
            </div>
        );
    }

    const renderModerationQueue = () => (
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-amber-600 text-xl">gavel</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight font-headline">Pending Approvals</h2>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{pendingArticles.length} articles waiting for review</p>
                    </div>
                </div>
            </div>

            {pendingArticles.length === 0 ? (
                <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-4xl text-slate-200">task_alt</span>
                    </div>
                    <p className="text-slate-400 font-medium">Hooray! No pending articles to review.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {pendingArticles.map((article) => (
                        <div key={article.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-md transition-all group flex gap-6">
                                {article.articlePhoto && (
                                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                                        <img src={article.articlePhoto} className="w-full h-full object-cover" alt="Thumb" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openViewer(article.id)}>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[9px] font-bold uppercase tracking-widest">
                                            {article.categoryName || 'General'}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            By {article.userName} • {new Date(article.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800 mb-2 truncate group-hover:text-emerald-600 transition-colors">{article.title}</h3>
                                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed tracking-tight font-medium">
                                        {article.content}
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2 shrink-0">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(article.id, 'APPROVED'); }}
                                        disabled={actionLoading === article.id}
                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center space-x-2 disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        <span>Approve</span>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleUpdateStatus(article.id, 'REJECTED'); }}
                                        disabled={actionLoading === article.id}
                                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center space-x-2 disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-sm">cancel</span>
                                        <span>Reject</span>
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(article.id, true); }}
                                        disabled={actionLoading === article.id}
                                        className="w-10 h-10 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderAllArticles = () => (
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <span className="material-symbols-outlined text-blue-600 text-xl">article</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight font-headline">Published Articles</h2>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{allArticles.filter(a => a.status === 'APPROVED').length} active discussions</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {allArticles.filter(a => a.status === 'APPROVED').map((article) => (
                    <div key={article.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-md transition-all group flex gap-6">
                        {article.articlePhoto && (
                            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                                <img src={article.articlePhoto} className="w-full h-full object-cover" alt="Thumb" />
                            </div>
                        )}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 flex-1 min-w-0">
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openViewer(article.id)}>
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[9px] font-bold uppercase tracking-widest">
                                        {article.categoryName || 'General'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        By {article.userName} • {new Date(article.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-slate-800 mb-1 truncate group-hover:text-blue-600 transition-colors uppercase">{article.title}</h3>
                                <div className="flex items-center space-x-4 text-[10px] text-slate-400 font-bold uppercase">
                                    <span className="flex items-center space-x-1">
                                        <span className="material-symbols-outlined text-[14px]">favorite</span>
                                        <span>{article.likeCount || 0} Likes</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                        <span className="material-symbols-outlined text-[14px]">comment</span>
                                        <span>Click to view discussions</span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 shrink-0">
                                <button
                                    onClick={(e) => { e.stopPropagation(); openViewer(article.id); }}
                                    className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center space-x-2 shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                    <span>Preview</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(article.id); }}
                                    disabled={actionLoading === article.id}
                                    className="w-10 h-10 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all flex items-center justify-center disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter font-headline mb-2">Community Content Management</h1>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 tracking-[0.2em] uppercase">Unified dashboard for article oversight and moderation</p>
                </div>
            </div>

            {/* Top Stats Cards (Inventory Style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon="library_books" title="Total Articles" value={stats.totalPosts} colorType="primary" />
                <StatCard icon="pending" title="Review Queue" value={pendingArticles.length} colorType="warning" />
                <StatCard icon="group" title="Active Members" value={stats.activeUsers} colorType="success" />
                <StatCard icon="chat" title="Live Threads" value={stats.engagedArticles} colorType="info" />
            </div>

            {/* Modern Tab Navigation */}
            <div className="border-b border-slate-100 mb-8 mt-6">
                <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 px-2 flex items-center space-x-2 transition-all relative ${activeTab === tab.id
                                ? 'text-[#2c4d3f] font-bold'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-sm`}>
                                {tab.icon}
                            </span>
                            <span className={`text-xs font-bold uppercase tracking-widest whitespace-nowrap`}>
                                {tab.label}
                            </span>
                            {tab.badge > 0 && (
                                <span className="w-5 h-5 bg-amber-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                                    {tab.badge}
                                </span>
                            )}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#2c4d3f] rounded-t-full animate-tab-slide"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="transition-all duration-300">
                {activeTab === 'moderation' && renderModerationQueue()}
                {activeTab === 'all_articles' && renderAllArticles()}
            </div>

            {/* Universal In-page Modal */}
            <ArticleModal 
                articleId={selectedArticleId} 
                isOpen={isViewerOpen} 
                onClose={() => { setIsViewerOpen(false); setSelectedArticleId(null); }}
                onActionSuccess={loadData}
                categories={categories}
            />

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
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
            `}} />
        </div>
    );
};

export default CommunityManagement;
