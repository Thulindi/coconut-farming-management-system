import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { articleAPI, communityCategoryAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const ArticleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', categoryId: '', articlePhoto: '' });

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      const cRes = await communityCategoryAPI.getAll();
      setCategories(cRes.data || []);
      if (isEdit) {
        const aRes = await articleAPI.getById(id);
        const articleData = aRes.data;
        const isAdmin = user?.roles?.includes('ADMIN');
        if (String(user?.id) !== String(articleData.userId) && !isAdmin) {
          alert('You can only edit your own articles.');
          navigate('/community/articles');
          return;
        }
        setForm({ 
          title: articleData.title, 
          content: articleData.content, 
          categoryId: articleData.categoryId || '',
          articlePhoto: articleData.articlePhoto || '' 
        });
      }
    } catch (e) { 
      console.error(e); 
      alert('Error loading article data: ' + (e.response?.data?.message || e.message));
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { 
        ...form, 
        categoryId: form.categoryId || null,
        userId: user?.id 
      };
      if (isEdit) {
        const isAdmin = user?.roles?.includes('ADMIN') || false;
        await articleAPI.update(id, data, isAdmin); 
      } else {
         await articleAPI.create(data);
      }
      
      if (!isEdit) {
        alert('Post submitted successfully! It will be visible to the community once an admin approves it.');
        navigate('/community/articles');
      } else {
        navigate(`/community/articles/${id}`);
      }
    } catch (e) { 
      console.error(e); 
      alert('Error saving article: ' + (e.response?.data?.message || e.response?.data?.error || e.message));
    } finally { 
      setSaving(false); 
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center py-20 space-y-4 animate-fade-in">
        <span className="material-symbols-outlined text-4xl text-emerald-300 animate-spin">autorenew</span>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-3xl mx-auto">
      
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate(isEdit ? `/community/articles/${id}` : '/community/articles')}
        className="flex items-center space-x-2 text-sm font-bold text-slate-500 hover:text-emerald-700 transition-colors group"
      >
        <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span>{isEdit ? 'Back to Article' : 'Back to Topics'}</span>
      </button>

      {/* Form Sub-Header (Page title is in Layout header) */}

      
      {/* Main Form Card */}
      <div className="bg-white rounded-[32px] p-8 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
        
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-bl-[100px] -z-10 opacity-50"></div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Post Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Give your post a clear, engaging title..."
              className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all placeholder:font-normal placeholder:text-slate-300"
            />
          </div>

          <div className="space-y-2 relative group/select">
            <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Topic Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all appearance-none cursor-pointer custom-select-arrow"
            >
              <option value="">Select Category (Optional)</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Content *</label>
            <textarea
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={14}
              placeholder="Start writing your article here... Share your knowledge, tips, experiences, or questions with the farming community."
              className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-4 pt-4">
            <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Post Photo (Optional)</label>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-full sm:w-48 h-32 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden group hover:border-emerald-500 transition-all cursor-pointer relative">
                {form.articlePhoto ? (
                  <>
                    <img src={form.articlePhoto} className="w-full h-full object-cover" alt="Preview" />
                    <button 
                      type="button"
                      onClick={() => setForm({ ...form, articlePhoto: '' })}
                      className="absolute top-2 right-2 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center space-y-1 text-slate-400">
                    <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                    <span className="text-[10px] font-bold uppercase">Add Photo</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setForm({ ...form, articlePhoto: reader.result });
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  Adding a high-quality photo can make your post more engaging. Recommended size: 1200x800px. Maximum size: 5MB.
                </p>
                {form.articlePhoto && (
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    Photo attached successfully
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(isEdit ? `/community/articles/${id}` : '/community/articles')}
              className="px-6 py-2.5 rounded-full font-bold text-xs text-slate-500 hover:bg-slate-100 uppercase tracking-wider transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 px-8 py-2.5 rounded-full font-bold text-xs text-white uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <span className="material-symbols-outlined text-[16px]">{saving ? 'autorenew' : isEdit ? 'save' : 'send'}</span>
              <span>{saving ? 'Saving...' : isEdit ? 'Update Post' : 'Publish Post'}</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
};

export default ArticleForm;
