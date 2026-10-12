import React, { useState, useEffect } from 'react';
import { inventoryAPI, supplierAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['Fertilizers', 'Pesticides', 'Seeds', 'Tools', 'Equipment', 'Packaging', 'Other'];

const InventoryItems = ({ embedded = false }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    itemName: '',
    category: '',
    quantity: '',
    unit: '',
    unitPrice: '',
    minStockLevel: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, [user?.id, search, category]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      const [itemsRes, suppliersRes] = await Promise.all([
        inventoryAPI.getAll(user.id, { search, category }),
        supplierAPI.getAll(user.id),
      ]);
      setItems(itemsRes.data?.content || itemsRes.data || []);
      setSuppliers(suppliersRes.data?.content || suppliersRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    loadData();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        quantity: Number(form.quantity),
        unitPrice: Number(form.unitPrice),
        minStockLevel: Number(form.minStockLevel),
      };
      if (editingId) {
        await inventoryAPI.update(editingId, user.id, data);
      } else {
        await inventoryAPI.create(user.id, data);
      }
      window.dispatchEvent(new CustomEvent('inventoryUpdated'));
      closeDialog();
      loadData();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await inventoryAPI.delete(id, user.id);
      window.dispatchEvent(new CustomEvent('inventoryUpdated'));
      loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const openEditDialog = (item) => {
    setEditingId(item.itemId);
    setForm({
      itemName: item.itemName,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      minStockLevel: item.minStockLevel,
      description: item.description || '',
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm({
      itemName: '',
      category: '',
      quantity: '',
      unit: '',
      unitPrice: '',
      minStockLevel: '',
      description: '',
    });
  };

  const isLowStock = (item) => item.quantity <= item.minStockLevel;

  return (
    <div className={`${embedded ? 'space-y-6' : 'space-y-8 pb-10'} animate-fade-in`}>

      {/* Header */}
      {!embedded && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter font-headline mb-2">Inventory Items</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Catalog of farming supplies</p>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center space-x-2 bg-[#2c4d3f] hover:bg-[#1f382d] text-white px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="text-xs font-bold uppercase tracking-wider">Add Item</span>
          </button>
        </div>
      )}

      {/* Embedded-only Header Row */}
      {embedded && (
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight font-headline">Stock Catalog</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Manage and track your farming supplies</p>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center space-x-2 bg-[#2c4d3f] hover:bg-[#1f382d] text-white px-5 py-2 rounded-full transition-all shadow-md group"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="text-xs font-bold uppercase tracking-wider">Add Item</span>
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-5 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="md:col-span-4 relative group/select">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[18px]">category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all appearance-none cursor-pointer custom-select-arrow"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <button
            onClick={handleSearch}
            className="w-full h-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-xl transition-all shadow-sm font-bold text-xs uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">

        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-[100px] -z-10 opacity-50"></div>

        {loading ? (
          <div className="flex justify-center flex-col items-center py-12 space-y-4">
            <span className="material-symbols-outlined text-4xl text-slate-300 animate-spin">autorenew</span>
          </div>
        ) : (
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 tracking-widest uppercase border-b border-slate-100/50">
                  <th className="pb-4">Name</th>
                  <th className="pb-4">Category</th>
                  <th className="pb-4 text-right">Quantity</th>
                  <th className="pb-4 border-l border-slate-100 pl-4">Unit</th>
                  <th className="pb-4 text-right">Price (LKR)</th>
                  <th className="pb-4 pl-4">Status</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 text-sm font-medium">
                      No items found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const lowStock = isLowStock(item);
                    return (
                      <tr key={item.itemId} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50/50 last:border-0 relative">
                        <td className="py-5 font-bold text-slate-900 pr-4">{item.itemName}</td>
                        <td className="py-5 font-bold text-slate-500 pr-4">{item.category}</td>
                        <td className={`py-5 font-black text-right pr-4 ${lowStock ? 'text-orange-600' : 'text-slate-800'}`}>
                          {item.quantity?.toLocaleString()}
                        </td>
                        <td className="py-5 font-medium text-slate-400 pl-4 border-l border-slate-100/50">{item.unit}</td>
                        <td className="py-5 font-bold text-slate-600 text-right pr-4">
                          {item.priceBreakdown && item.priceBreakdown.length > 0 ? (
                            <div className="flex flex-col space-y-0.5">
                              {item.priceBreakdown.map((batch, idx) => (
                                <span key={idx} className="text-[11px] bg-slate-100 rounded px-2 py-0.5 whitespace-nowrap">{batch}</span>
                              ))}
                            </div>
                          ) : (
                            item.unitPrice?.toLocaleString() || '-'
                          )}
                        </td>
                        <td className="py-5 pl-4 flex items-center h-full">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase mt-4 ${lowStock ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                            {lowStock ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td className="py-5 text-right space-x-2 w-24">
                          <button
                            onClick={() => openEditDialog(item)}
                            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-[#2c4d3f] text-slate-400 hover:text-white inline-flex items-center justify-center transition-colors shadow-sm"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item.itemId)}
                            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-rose-500 text-slate-400 hover:text-white inline-flex items-center justify-center transition-colors shadow-sm"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Item Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden relative flex flex-col max-h-[90vh]">

            <div className={`px-8 py-6 flex justify-between items-center bg-slate-50 border-b border-slate-100`}>
              <h2 className={`text-xl font-black text-slate-900 tracking-tight font-headline flex items-center space-x-2`}>
                <span className="material-symbols-outlined text-[#2c4d3f]">
                  {editingId ? 'edit_square' : 'add_box'}
                </span>
                <span>{editingId ? 'Edit Inventory Item' : 'Add New Item'}</span>
              </h2>
              <button onClick={closeDialog} className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
              <form id="item-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-6">

                <div className="space-y-2 sm:col-span-6">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={form.itemName}
                    onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
                    placeholder="e.g. Urea Fertilizer"
                  />
                </div>

                <div className="space-y-2 relative group/select sm:col-span-6">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Category *</label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all appearance-none cursor-pointer custom-select-arrow"
                  >
                    <option value="" disabled>Select Category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 sm:col-span-6">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Unit *</label>
                  <input
                    type="text"
                    required
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
                    placeholder="kg, liters, packets"
                  />
                </div>

                <div className="space-y-2 sm:col-span-6">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Min Stock Level</label>
                  <input
                    type="number"
                    value={form.minStockLevel}
                    onChange={(e) => setForm({ ...form, minStockLevel: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-orange-600 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
                    placeholder="0"
                  />
                </div>


                <div className="space-y-2 sm:col-span-12">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all resize-none"
                    placeholder="Additional details..."
                  />
                </div>

              </form>
            </div>

            <div className="px-8 py-6 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50">
              <button
                onClick={closeDialog}
                className="px-6 py-2.5 rounded-full font-bold text-xs text-slate-500 hover:bg-slate-200 uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="item-form"
                className={`px-6 py-2.5 rounded-full font-bold text-xs text-white uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 bg-[#2c4d3f] hover:bg-[#1f382d]`}
              >
                {editingId ? 'Update Item' : 'Add Item'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default InventoryItems;
