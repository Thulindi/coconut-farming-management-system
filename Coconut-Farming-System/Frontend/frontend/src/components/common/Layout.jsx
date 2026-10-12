/* 
// Previous MUI-based Layout - commented out as requested
import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Collapse,
} from '@mui/material';
// ... other MUI imports
*/

import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
import { notificationAPI } from '../../api/notificationAPI';
import axios from 'axios';
import ChatBot from './ChatBot';

const Layout = ({ children }) => {
  const { user, logout, getPrimaryRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [marketPrice, setMarketPrice] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isBroadcastMode, setIsBroadcastMode] = useState(false);
  const [broadcast, setBroadcast] = useState({ message: '', type: 'INFO' });
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);
  const notifRef = useRef(null);

  const role = getPrimaryRole();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.username) return;
      try {
        const response = await authAPI.getProfile(user.username);
        if (response.data?.profilePhoto) {
          setProfilePhoto(response.data.profilePhoto);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();

    const handleProfileUpdate = () => fetchProfile();
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [user?.username]);

  useEffect(() => {
    const fetchMarketPrice = async () => {
      try {
        const response = await axios.get('/api/financial/market-price');
        setMarketPrice(response.data);
      } catch (error) {
        console.error('Error fetching market price:', error);
      }
    };
    fetchMarketPrice();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user?.username && role) {
        try {
          const res = await notificationAPI.getUserNotifications(user.username, role);
          setNotifications(res.data);
        } catch (err) {
          console.error("Error fetching notifications", err);
        }
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.username, role]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id, user.username);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) { console.error(err); }
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleClearAll = async () => {
    try {
      await notificationAPI.deleteAllNotifications(user.username, role);
      setNotifications([]);
    } catch (err) { console.error(err); }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcast.message.trim()) return;
    
    setIsBroadcasting(true);
    setBroadcastResult(null);
    try {
      await notificationAPI.broadcastMessage(broadcast.message, broadcast.type);
      setBroadcastResult({ type: 'success', text: 'Sent!' });
      setBroadcast({ message: '', type: 'INFO' });
      setTimeout(() => {
        setBroadcastResult(null);
        setIsBroadcastMode(false);
      }, 2000);
    } catch (err) {
      setBroadcastResult({ type: 'error', text: 'Failed' });
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Overview Dashboard';
    if (path.startsWith('/plantation/lands')) return 'Land Management';
    if (path.startsWith('/plantation/field-visits')) return 'Field Visits';
    if (path.startsWith('/financial')) return 'Financial Analytics';
    if (path.startsWith('/inventory')) return 'Inventory & Supplies';
    if (path.startsWith('/labor')) return 'Labor Management';
    if (path === '/community') return 'Community Dashboard';
    if (path.startsWith('/community/articles')) return 'Community Topics';
    if (path.startsWith('/community/news')) return 'Farming News';
    if (path.startsWith('/farm-intelligence')) return 'Farm Intelligence';
    if (path.startsWith('/profile')) return 'My Profile';
    if (path.startsWith('/admin/users')) return 'User Management';
    if (path.startsWith('/admin/lands')) return 'Land Oversight';
    if (path.startsWith('/admin/community')) return 'Community Moderation';
    if (path.startsWith('/admin/reports')) return 'System Analytics Reports';
    if (path.startsWith('/officer/lands')) return 'Regional Oversight';
    return 'CocoSmart';
  };


  const menuItems = [
    { 
      title: 'MAIN DASHBOARD', 
      items: [
        { text: 'Overview', icon: 'grid_view', path: '/', roles: ['FARMER', 'OFFICER'] },
        { text: 'My Plantation', icon: 'park', path: '/plantation', roles: ['FARMER'] },
        { text: 'Stocks & Supplies', icon: 'inventory_2', path: '/inventory', roles: ['FARMER'] },
        { text: 'Financial & Profit', icon: 'payments', path: '/financial', roles: ['FARMER'] }
      ]
    },
    { 
      title: 'ADMIN CONTROL', 
      items: [
        { text: 'System Overview', icon: 'analytics', path: '/dashboard', roles: ['ADMIN'] },
        { text: 'User Management', icon: 'group_add', path: '/admin/users', roles: ['ADMIN'] },
        { text: 'Land Oversight', icon: 'potted_plant', path: '/admin/lands', roles: ['ADMIN'] },
        { text: 'System Reports', icon: 'description', path: '/admin/reports', roles: ['ADMIN'] }
      ]
    },
    { 
      title: 'CONTENT CONTROL', 
      items: [
        { text: 'Manage Community', icon: 'forum', path: '/admin/community', roles: ['ADMIN'] }
      ]
    },
    { 
      title: 'OPERATIONS', 
      items: [
        { text: 'Labor Tasks', icon: 'assignment', path: '/labor', roles: ['FARMER'] },
        { text: 'Field Visits', icon: 'directions_car', path: '/plantation/field-visits', roles: ['FARMER', 'OFFICER'] },
        { text: 'Regional Lands', icon: 'potted_plant', path: '/officer/lands', roles: ['OFFICER'] },
        { text: 'Community', icon: 'groups', path: '/community', roles: ['FARMER', 'OFFICER'] },
        { text: 'Farming News', icon: 'menu_book', path: '/community/news', roles: ['FARMER', 'OFFICER'] },
        { text: 'Farm Intelligence', icon: 'insights', path: '/farm-intelligence', roles: ['FARMER'] }
      ]
    },
    {
      title: 'ADVANCED',
      items: [
          { text: 'AI Leaf Disease Detection', icon: 'psychology', path: '/ai-detection', roles: ['FARMER', 'ADMIN'] }
      ]
    }
  ];

  const filteredMenu = menuItems.map(section => ({
    ...section,
    items: section.items.filter(item => item.roles.includes(role))
  })).filter(section => section.items.length > 0);

  return (
    <div className="flex min-h-screen bg-[#f8faf9] font-body">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-[280px] bg-[#1a2233] text-white flex flex-col transition-all duration-300 z-50 rounded-r-[40px] shadow-2xl overflow-hidden no-print`}>
        {/* Logo */}
        <div className="p-8 flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#2c4d3f] rounded-xl flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-2xl">eco</span>
          </div>
          <div className="text-2xl font-black text-white tracking-tighter font-headline">CocoSmart</div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-6 overflow-y-auto custom-scrollbar">
          {filteredMenu.map((section, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="px-4 text-[10px] font-bold tracking-[0.2em] text-white/30 mb-4 uppercase">{section.title}</h3>
              <div className="space-y-2">
                {section.items.map((item, idy) => (
                  <NavLink
                    key={idy}
                    to={item.path}
                    end
                    className={({ isActive }) => 
                      `flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                        isActive 
                        ? 'bg-[#346854] text-white shadow-lg' 
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                    <span className="text-[14px] font-medium tracking-tight">{item.text}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Market Price / Extra Info Card */}
        {(role === 'FARMER' || role === 'OFFICER' || role === 'ADMIN') && (
          <div className="px-6 mb-4">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Market Price</span>
                    <span className="text-[8px] font-medium text-white/20 uppercase italic">Source: CDA</span>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-xl font-bold text-white leading-none">
                          {marketPrice ? `Rs. ${marketPrice.average}` : 'Loading...'}
                        </div>
                        <div className="text-[10px] text-white/40 mt-1 uppercase tracking-tight font-medium">Per Coconut (Avg)</div>
                    </div>
                </div>
            </div>
          </div>
        )}


        {/* Logout */}
        <div className="p-6 pt-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 bg-red-400/10 hover:bg-red-400/20 text-red-300 py-3 rounded-2xl transition-all border border-red-400/20 group"
          >
            <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">logout</span>
            <span className="font-bold text-sm tracking-tight">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[280px] min-h-screen relative overflow-hidden bg-[#f8faf9] print:m-0 print:p-0 print:static">
        {/* Top Global Header */}
        <header className="sticky top-0 z-40 bg-[#f8faf9]/80 backdrop-blur-md px-10 py-6 flex justify-between items-center border-b border-slate-100/50 no-print">
            {/* Page Title */}
            <div className="animate-fade-in">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter font-headline leading-tight">{getPageTitle()}</h2>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mt-0.5 opacity-80">Coconut Farming Management System</p>
            </div>

            <div className="flex items-center space-x-4">
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                    <div 
                        className="w-12 h-12 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center cursor-pointer hover:shadow-md transition-all relative group"
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                    >
                        <span className="material-symbols-outlined text-slate-600 group-hover:text-emerald-600 transition-colors">notifications</span>
                        {notifications.filter(n => !n.read).length > 0 && (
                            <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        )}
                    </div>
                    
                    {/* Notification Dropdown */}
                    {isNotifOpen && (
                        <div className="absolute right-0 mt-3 w-96 bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden transform opacity-100 scale-100 transition-all origin-top-right z-50">
                            <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h4 className="font-black text-slate-800 text-sm tracking-tight">
                                        {isBroadcastMode ? 'SYSTEM BROADCAST' : 'NOTIFICATIONS'}
                                    </h4>
                                    {!isBroadcastMode && (
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                            {notifications.filter(n => !n.read).length} Unread Messages
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {role === 'ADMIN' && (
                                        <button 
                                            onClick={() => {
                                                setIsBroadcastMode(!isBroadcastMode);
                                                setBroadcastResult(null);
                                            }}
                                            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all shadow-sm ${
                                                isBroadcastMode 
                                                ? 'bg-slate-800 text-white' 
                                                : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                            }`}
                                        >
                                            {isBroadcastMode ? 'Close' : 'Broadcast'}
                                        </button>
                                    )}
                                    {!isBroadcastMode && notifications.length > 0 && (
                                        <button 
                                            onClick={handleClearAll}
                                            className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                                            title="Clear All"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="max-h-80 overflow-y-auto custom-scrollbar bg-white">
                                {isBroadcastMode ? (
                                    <div className="p-5 space-y-4 animate-in fade-in zoom-in duration-200">
                                        <textarea 
                                            value={broadcast.message}
                                            onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
                                            placeholder="Type global message (e.g. Maintenance at 10 PM)..."
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none h-28 outline-none"
                                        />
                                        <div className="flex space-x-2">
                                            <select 
                                                value={broadcast.type}
                                                onChange={(e) => setBroadcast({ ...broadcast, type: e.target.value })}
                                                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-500 uppercase outline-none flex-1"
                                            >
                                                <option value="INFO">Information</option>
                                                <option value="WARNING">Maintenance</option>
                                                <option value="SUCCESS">Update</option>
                                            </select>
                                            <button 
                                                onClick={handleBroadcast}
                                                disabled={isBroadcasting || !broadcast.message.trim()}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-[10px] font-bold uppercase transition-all disabled:opacity-50 flex items-center justify-center min-w-[100px] shadow-sm"
                                            >
                                                {isBroadcasting ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Send Broadcast'}
                                            </button>
                                        </div>
                                        {broadcastResult && (
                                            <p className={`text-center text-[10px] font-bold uppercase tracking-tight ${broadcastResult.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {broadcastResult.text}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    notifications.length === 0 ? (
                                        <div className="p-10 text-center flex flex-col items-center">
                                            <span className="material-symbols-outlined text-slate-200 text-4xl mb-2">notifications_off</span>
                                            <div className="text-slate-400 text-sm font-medium">No new notifications</div>
                                        </div>
                                    ) : (
                                        notifications.map(notif => (
                                            <div 
                                                key={notif.id} 
                                                onClick={() => handleMarkAsRead(notif.id)}
                                                className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors flex items-start space-x-3 ${!notif.read ? 'bg-emerald-50/30' : ''}`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'WARNING' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    <span className="material-symbols-outlined text-[16px]">
                                                        {notif.type === 'WARNING' ? 'warning' : 'info'}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <p className={`text-sm ${!notif.read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{notif.message}</p>
                                                        <button 
                                                            onClick={(e) => handleDeleteNotification(e, notif.id)}
                                                            className="text-slate-300 hover:text-red-500 transition-colors ml-2"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                                        </button>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 mt-1 block">
                                                        {new Date(notif.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Info Overlay (Clickable) */}
                <div 
                    className="flex items-center bg-white p-2 pr-6 rounded-full shadow-sm border border-slate-100 group cursor-pointer hover:shadow-md transition-all shrink-0"
                    onClick={() => navigate('/profile')}
                >
                    <div className="w-10 h-10 rounded-full bg-[#2c4d3f] flex items-center justify-center text-white font-bold overflow-hidden shadow-inner">
                        {profilePhoto ? (
                            <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            user?.username?.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="ml-3">
                        <div className="text-[12px] font-bold text-slate-800 leading-none truncate max-w-[150px]">{user?.username || 'User'}</div>
                        <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">{role}</div>
                    </div>
                </div>
            </div>
        </header>

        {/* Page Content */}
        <div className="p-10 pt-6">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </div>
      </main>

      {/* Persistent ChatBot Widget */}
      <div className="no-print">
        <ChatBot />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        @media print {
          .no-print { display: none !important; }
          main { margin-left: 0 !important; padding: 0 !important; background: white !important; width: 100% !important; position: absolute !important; top: 0 !important; left: 0 !important; }
          body { background: white !important; margin: 0 !important; padding: 0 !important; }
          .max-w-7xl { max-width: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
          .p-10.pt-6 { padding: 0 !important; }
          * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
        }
      `}} />
    </div>
  );
};

export default Layout;

