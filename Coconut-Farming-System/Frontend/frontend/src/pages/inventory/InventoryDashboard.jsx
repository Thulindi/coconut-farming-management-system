import React, { useState, useEffect } from 'react';
import { inventoryAPI, supplierAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import InventoryItems from './InventoryItems';
import Suppliers from './Suppliers';
import Purchases from './Purchases';
import Usage from './Usage';

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
        <p className={`text-2xl font-black ${textClass} tracking-tight`}>{value.toLocaleString()}</p>
      </div>
    </div>
  );
};

const InventoryDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('items'); // items, suppliers, purchases, usage
  const [stats, setStats] = useState({ items: 0, lowStock: 0, suppliers: 0, totalValue: 0 });
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();

    // Listen for inventory updates to refresh stats
    const handleUpdate = () => loadStats();
    window.addEventListener('inventoryUpdated', handleUpdate);
    return () => window.removeEventListener('inventoryUpdated', handleUpdate);
  }, [user?.id]);

  const loadStats = async () => {
    if (!user?.id) return;
    try {
      const [itemsRes, lowStockRes, suppliersRes] = await Promise.all([
        inventoryAPI.getAll(user.id),
        inventoryAPI.getLowStock(user.id),
        supplierAPI.getAll(user.id),
      ]);

      const itemsData = itemsRes.data?.content || itemsRes.data || [];
      const suppliersData = suppliersRes.data?.content || suppliersRes.data || [];
      const totalValue = itemsData.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

      setItems(itemsData);
      setSuppliers(suppliersData);
      setStats({
        items: itemsData.length,
        lowStock: (lowStockRes.data || []).length,
        suppliers: suppliersData.length,
        totalValue,
      });
    } catch (error) {
      console.error('Error loading inventory stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'items', label: 'Stock Items', icon: 'inventory_2' },
    { id: 'suppliers', label: 'Suppliers', icon: 'local_shipping' },
    { id: 'purchases', label: 'Purchases', icon: 'receipt_long' },
    { id: 'usage', label: 'Usage Logs', icon: 'outbox' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 flex-col space-y-4 animate-fade-in">
        <span className="material-symbols-outlined text-5xl text-[#2c4d3f] animate-spin">autorenew</span>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Initialising Inventory Hub...</p>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'suppliers': return <Suppliers embedded={true} data={suppliers} />;
      case 'purchases': return <Purchases embedded={true} items={items} suppliers={suppliers} />;
      case 'usage': return <Usage embedded={true} items={items} />;
      case 'items':
      default: return <InventoryItems embedded={true} />;
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-10">

      {/* Stats Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon="inventory_2" title="Total Items" value={stats.items} colorType="primary" />
        <StatCard icon="warning" title="Low Stock" value={stats.lowStock} colorType="warning" />
        <StatCard icon="local_shipping" title="Active Suppliers" value={stats.suppliers} colorType="success" />
        <div className="p-6 rounded-[28px] border border-blue-100 shadow-sm bg-white flex items-center space-x-4 transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-blue-700 text-xl">payments</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-[0.1em] uppercase mb-0.5">Total Stock Value</p>
            <p className="text-xl font-black text-blue-700 tracking-tight">Rs. {stats.totalValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Modern Tab Navigation */}
      <div className="border-b border-slate-100 mb-8">
        <div className="flex space-x-8 overflow-x-auto custom-scrollbar scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 flex items-center space-x-2 transition-all relative ${activeTab === tab.id
                  ? 'text-[#2c4d3f]'
                  : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              <span className={`material-symbols-outlined text-sm ${activeTab === tab.id ? 'font-bold' : ''}`}>
                {tab.icon}
              </span>
              <span className={`text-xs font-bold uppercase tracking-widest whitespace-nowrap ${activeTab === tab.id ? '' : 'font-medium'}`}>
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#2c4d3f] rounded-t-full animate-tab-slide"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-300">
        {renderActiveTab()}
      </div>

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
      `}} />

    </div>
  );
};

export default InventoryDashboard;
