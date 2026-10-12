import React, { useState, useEffect } from 'react';
import { taskCategoryAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const TaskCategories = ({ embedded = false }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    if (!user?.id) return;
    try { 
      const res = await taskCategoryAPI.getAll(user.id); 
      setCategories(res.data || []); 
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await taskCategoryAPI.update(editingId, user.id, form); 
      else await taskCategoryAPI.create(user.id, form);
      
      closeDialog(); 
      loadData();
    } catch (e) { 
      console.error(e); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try { 
      await taskCategoryAPI.delete(id, user.id); 
      loadData(); 
    } catch (e) { 
      console.error(e); 
    }
  };

  const openEdit = (c) => { 
    setEditingId(c.id); 
    setForm({ name: c.name, description: c.description || '' }); 
    setDialogOpen(true); 
  };

  const closeDialog = () => { 
    setDialogOpen(false); 
    setEditingId(null); 
    setForm({ name: '', description: '' }); 
  };

  return (
    <div className={`${embedded ? 'space-y-6' : 'space-y-8 pb-10'} animate-fade-in`}>
      {/* Header */}
      {!embedded && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter font-headline mb-2">Category Setup</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Define task classifications</p>
          </div>
          <button 
            onClick={() => setDialogOpen(true)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="text-xs font-bold uppercase tracking-wider">Add Category</span>
          </button>
        </div>
      )}

      {/* Embedded-only Header Row */}
      {embedded && (
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight font-headline">Classifications</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Define task classifications</p>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full transition-all shadow-md group"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="text-xs font-bold uppercase tracking-wider">Add Category</span>
          </button>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
        
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-bl-[100px] -z-10 opacity-50"></div>

        {loading ? (
          <div className="flex justify-center flex-col items-center py-12 space-y-4">
             <span className="material-symbols-outlined text-4xl text-slate-300 animate-spin">autorenew</span>
          </div>
        ) : (
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 tracking-widest uppercase border-b border-slate-100/50">
                  <th className="pb-4">Category Name</th>
                  <th className="pb-4 pl-4 border-l border-slate-100/50">Description</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-slate-400 text-sm font-medium">
                      No categories found. Add your first category.
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr key={c.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50/50 last:border-0 relative">
                      <td className="py-5 font-black text-slate-900 pr-4">{c.name}</td>
                      <td className="py-5 font-medium text-slate-500 pl-4 border-l border-slate-100/50 pr-4 max-w-md">{c.description || '-'}</td>
                      <td className="py-5 text-right space-x-2 w-24">
                          <button 
                            onClick={() => openEdit(c)}
                            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-indigo-600 text-slate-400 hover:text-white inline-flex items-center justify-center transition-colors shadow-sm"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(c.id)}
                            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-rose-500 text-slate-400 hover:text-white inline-flex items-center justify-center transition-colors shadow-sm"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative flex flex-col max-h-[90vh]">
            
            <div className={`px-8 py-6 flex justify-between items-center bg-indigo-50 border-b border-indigo-100`}>
              <h2 className={`text-xl font-black text-indigo-900 tracking-tight font-headline flex items-center space-x-2`}>
                <span className="material-symbols-outlined text-indigo-600">
                  {editingId ? 'edit_square' : 'category'}
                </span>
                <span>{editingId ? 'Edit Category' : 'Add Category'}</span>
              </h2>
              <button type="button" onClick={closeDialog} className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
              <form id="category-form" onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                    placeholder="e.g. Pest Control"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all resize-none"
                    placeholder="Brief description of the category..."
                  />
                </div>

              </form>
            </div>

            <div className="px-8 py-6 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50">
              <button 
                type="button"
                onClick={closeDialog}
                className="px-6 py-2.5 rounded-full font-bold text-xs text-slate-500 hover:bg-slate-200 uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="category-form"
                className={`px-6 py-2.5 rounded-full font-bold text-xs text-white uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 bg-indigo-600 hover:bg-indigo-700`}
              >
                {editingId ? 'Save Changes' : 'Add Category'}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default TaskCategories;
