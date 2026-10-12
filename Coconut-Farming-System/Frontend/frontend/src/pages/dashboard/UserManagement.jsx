/*
// Original MUI-based User Management - commented out as requested
import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  // ... other MUI imports
} from '@mui/material';
// ... existing code
*/

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Button as MuiButton,
} from '@mui/material';
import { adminAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Modals
  const [adminModal, setAdminModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [adminData, setAdminData] = useState({
    username: '',
    password: '',
    email: '',
    roles: ['ADMIN'],
  });

  const [editData, setEditData] = useState({
    username: '',
    email: '',
    fullName: '',
    phone: '',
    district: '',
    officerId: '',
    status: '',
    role: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllUsers();
      // Transforming data to match Figma visual states if needed, 
      // but sticking to real data from API.
      setAllUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ type: 'error', text: 'Failed to load users.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveUser(id);
      setMessage({ type: 'success', text: 'User approved successfully.' });
      fetchUsers();
      if (viewModal && selectedUser?.id === id) setViewModal(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to approve user.' });
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to suspend/ban this user?')) return;
    try {
      await adminAPI.rejectUser(id);
      setMessage({ type: 'success', text: 'User suspended successfully.' });
      fetchUsers();
      if (viewModal && selectedUser?.id === id) setViewModal(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to suspend user.' });
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('PERMANENT DELETE: Are you sure? This cannot be undone.')) return;
    try {
      await adminAPI.deleteUser(id);
      setMessage({ type: 'success', text: 'User permanently deleted.' });
      fetchUsers();
      if (viewModal && selectedUser?.id === id) setViewModal(false);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete user.' });
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createAdmin(adminData);
      setMessage({ type: 'success', text: 'Admin created successfully.' });
      setAdminModal(false);
      setAdminData({ username: '', password: '', email: '', roles: ['ADMIN'] });
      fetchUsers();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create admin.' });
    }
  };

  const openViewModal = (u) => {
    setSelectedUser(u);
    const role = u.roles?.includes('ADMIN') ? 'ADMIN' : u.roles?.includes('OFFICER') ? 'OFFICER' : 'FARMER';
    setSelectedRole(role);
    setViewModal(true);
  };

  const handleEditOpen = (u) => {
    setSelectedUser(u);
    const role = u.roles?.includes('ADMIN') ? 'ADMIN' : u.roles?.includes('OFFICER') ? 'OFFICER' : 'FARMER';
    setEditData({
      username: u.username || '',
      email: u.email || '',
      fullName: u.fullName || '',
      phone: u.phone || '',
      district: u.district || '',
      officerId: u.officerId || '',
      status: u.status || '',
      role: role
    });
    setEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Update general details
      await adminAPI.updateUser(selectedUser.id, editData);
      
      // 2. Update role if changed
      const currentRole = selectedUser.roles?.includes('ADMIN') ? 'ADMIN' : selectedUser.roles?.includes('OFFICER') ? 'OFFICER' : 'FARMER';
      if (editData.role !== currentRole) {
        await adminAPI.changeRole(selectedUser.id, editData.role);
      }

      setMessage({ type: 'success', text: 'User updated successfully.' });
      setEditModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ type: 'error', text: error.response?.data || 'Failed to update user.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in text-slate-900">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tighter font-headline uppercase leading-none">User Management</h1>
        <p className="text-[10px] font-bold text-slate-400 mt-2 tracking-[0.2em] uppercase">REVIEW AND MODERATE REGISTRATIONS</p>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm relative min-h-[600px]">
        
        {/* Top Action Bar */}
        <div className="mb-10">
            <button 
                onClick={() => setAdminModal(true)}
                className="bg-[#2c4d3f] hover:bg-[#1e352b] text-white px-8 py-3.5 rounded-2xl flex items-center space-x-2 font-bold text-sm shadow-lg shadow-emerald-900/10 transition-all hover:scale-[1.02] active:scale-95 group"
            >
                <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform">add</span>
                <span>Create Admin User</span>
            </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <CircularProgress sx={{ color: '#2c4d3f' }} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-slate-300 tracking-[0.15em] uppercase border-b border-slate-50">
                  <th className="pb-6">PROFILE DETAILS</th>
                  <th className="pb-6">REQUESTED ROLE</th>
                  <th className="pb-6 text-center">VERIFICATION STATUS</th>
                  <th className="pb-6 text-center">DATE REGISTERED</th>
                  <th className="pb-6 text-right pr-4">MODERATION ACTIONS</th>
                </tr>
              </thead>
              <tbody className="text-[13px] font-medium">
                {allUsers.length === 0 ? (
                    <tr><td colSpan={5} className="py-20 text-center text-slate-400 italic font-normal">No users found in the system.</td></tr>
                ) : (
                    allUsers.map((u, i) => (
                    <tr key={u.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-8">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 p-0.5 border border-slate-100 group-hover:border-emerald-200 transition-colors overflow-hidden">
                                     <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                                        {u.username?.charAt(0).toUpperCase() || 'U'}
                                     </div>
                                </div>
                                <div>
                                    <div className="font-black text-slate-900 group-hover:text-emerald-900 transition-colors text-sm">{u.username}</div>
                                    <div className="text-[11px] text-slate-400 font-medium group-hover:text-emerald-600/60 transition-colors">{u.email || 'no-email@example.com'}</div>
                                </div>
                            </div>
                        </td>
                        <td className="py-8">
                            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">{u.roles?.includes('ADMIN') ? 'ADMIN' : u.roles?.includes('OFFICER') ? 'OFFICER' : 'FARMER'}</span>
                        </td>
                        <td className="py-8 text-center">
                            <div className="flex justify-center">
                                <span className={`text-[9px] font-black px-4 py-1.5 rounded-full border uppercase tracking-wider flex items-center space-x-1.5 ${
                                    (u.status === 'ACTIVE' || u.status === 'APPROVED' || u.status === 'EMAIL_VERIFIED')
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                                    : (u.status === 'PENDING' || u.status === 'EMAIL_PENDING')
                                    ? 'bg-amber-50 border-amber-100 text-amber-500'
                                    : 'bg-red-50 border-red-100 text-red-400'
                                }`}>
                                    {(u.status === 'ACTIVE' || u.status === 'APPROVED' || u.status === 'EMAIL_VERIFIED') && <span className="material-symbols-outlined text-[12px]">check_circle</span>}
                                    {u.status === 'PENDING' && <span className="material-symbols-outlined text-[12px] animate-pulse">admin_panel_settings</span>}
                                    {u.status === 'EMAIL_PENDING' && <span className="material-symbols-outlined text-[12px] animate-pulse">mail</span>}
                                    {u.status === 'REJECTED' && <span className="material-symbols-outlined text-[12px]">cancel</span>}
                                    <span>
                                        {(u.status === 'ACTIVE' || u.status === 'APPROVED' || u.status === 'EMAIL_VERIFIED') ? 'APPROVED' : 
                                         u.status === 'PENDING' ? 'PENDING ADMIN' : 
                                         u.status === 'EMAIL_PENDING' ? 'PENDING EMAIL' : 'REJECTED'}
                                    </span>
                                </span>
                            </div>
                        </td>
                        <td className="py-8 text-center text-slate-400 font-bold tabular-nums">
                            Feb 27, 2026
                        </td>
                        <td className="py-8 text-right pr-4">
                            <div className="flex justify-end space-x-1">
                                <button 
                                    onClick={() => openViewModal(u)}
                                    className="p-2.5 text-blue-400 hover:bg-blue-50 rounded-xl transition-all hover:scale-110" 
                                    title="View Details"
                                >
                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                </button>
                                <button 
                                    onClick={() => handleEditOpen(u)}
                                    className={`p-2.5 text-amber-500 hover:bg-amber-50 rounded-xl transition-all hover:scale-110 ${u.roles?.includes('ADMIN') ? 'opacity-0 pointer-events-none' : ''}`} 
                                    title="Edit User Details"
                                >
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                                {u.status === 'PENDING' && (
                                    <button 
                                        onClick={() => handleApprove(u.id)}
                                        className="p-2.5 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all hover:scale-110" 
                                        title="Approve User"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">check</span>
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleDeleteUser(u.id)}
                                    disabled={u.username === user?.username}
                                    className={`p-2.5 text-red-300 hover:bg-red-50 rounded-xl transition-all hover:scale-110 ${u.username === user?.username ? 'opacity-0 pointer-events-none' : ''}`}
                                    title="Permanently Delete"
                                >
                                    <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Admin Dialog */}
      <Dialog open={adminModal} onClose={() => setAdminModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '2rem', p: 2 } }}>
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', tracking: '-0.02em', color: '#1a2233' }}>Create System Administrator</DialogTitle>
        <form onSubmit={handleCreateAdmin}>
          <DialogContent>
            <div className="space-y-4">
                <TextField
                  fullWidth
                  label="Username"
                  value={adminData.username}
                  onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
                  required
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: '1rem' } }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={adminData.email}
                  onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                  required
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: '1rem' } }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={adminData.password}
                  onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                  required
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: '1rem' } }}
                />
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 4, pt: 0 }}>
            <MuiButton onClick={() => setAdminModal(false)} sx={{ borderRadius: '1rem', px: 4, color: 'slate.500', fontWeight: 'bold' }}>Cancel</MuiButton>
            <MuiButton type="submit" variant="contained" sx={{ borderRadius: '1rem', px: 4, bgcolor: '#2c4d3f', '&:hover': { bgcolor: '#1e352b' }, fontWeight: 'bold', boxShadow: 'none' }}>Create Admin</MuiButton>
          </DialogActions>
        </form>
      </Dialog>

      {/* View User Dialog (Simplified for now to match high fidelity look) */}
      <Dialog open={viewModal} onClose={() => setViewModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '2rem', p: 2 } }}>
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', tracking: '-0.02em', color: '#1a2233' }}>User Profile Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center space-x-6">
                 <div className="w-20 h-20 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl">person</span>
                 </div>
                 <div>
                    <h4 className="text-xl font-black text-slate-900 leading-none">{selectedUser.username}</h4>
                    <p className="text-slate-400 font-medium mt-1">{selectedUser.email || 'N/A'}</p>
                    <div className="flex mt-2 flex-wrap gap-1">
                        {selectedUser.roles?.map(role => (
                            <span key={role} className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">
                                {role}
                            </span>
                        ))}
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                    <p className="text-[9px] font-black text-slate-300 tracking-widest uppercase mb-1">Status</p>
                    <p className={`font-black uppercase text-xs ${
                        (selectedUser.status === 'ACTIVE' || selectedUser.status === 'APPROVED' || selectedUser.status === 'EMAIL_VERIFIED') ? 'text-emerald-600' : 
                        selectedUser.status === 'REJECTED' ? 'text-red-500' : 'text-amber-500'
                    }`}>
                        {(selectedUser.status === 'ACTIVE' || selectedUser.status === 'APPROVED' || selectedUser.status === 'EMAIL_VERIFIED') ? 'APPROVED' : 
                         selectedUser.status === 'PENDING' ? 'PENDING ADMIN' :
                         selectedUser.status === 'EMAIL_PENDING' ? 'PENDING EMAIL' : 
                         selectedUser.status === 'REJECTED' ? 'BANNED / REJECTED' : selectedUser.status}
                    </p>
                  </div>
                  <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                    <p className="text-[9px] font-black text-slate-300 tracking-widest uppercase mb-1">Full Name</p>
                    <p className="font-bold text-slate-700 text-xs truncate" title={selectedUser.fullName}>{selectedUser.fullName || 'Not Provided'}</p>
                  </div>
                  <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                    <p className="text-[9px] font-black text-slate-300 tracking-widest uppercase mb-1">Phone Number</p>
                    <p className="font-bold text-slate-700 text-xs">{selectedUser.phone || 'Not Provided'}</p>
                  </div>
                  <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                    <p className="text-[9px] font-black text-slate-300 tracking-widest uppercase mb-1">District / Location</p>
                    <p className="font-bold text-slate-700 text-xs capitalize">{selectedUser.district || 'Not Provided'}</p>
                  </div>
                  {selectedUser.roles?.includes('OFFICER') && (
                    <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                        <p className="text-[9px] font-black text-slate-300 tracking-widest uppercase mb-1">Officer ID Number</p>
                        <p className="font-bold text-emerald-700 text-xs truncate">#{selectedUser.officerId || 'N/A'}</p>
                    </div>
                  )}
              </div>

              {/* Moderation Controls in Modal */}
              {!selectedUser.roles?.includes('ADMIN') && (
                <div className="pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-4">Moderation Controls</p>
                    <div className="flex space-x-3">
                        {(selectedUser.status === 'REJECTED' || selectedUser.status === 'PENDING') ? (
                            <button 
                                onClick={() => handleApprove(selectedUser.id)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-200"
                            >
                                <span className="material-symbols-outlined text-lg">check_circle</span>
                                <span>{selectedUser.status === 'REJECTED' ? 'Unban / Activate' : 'Approve User'}</span>
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleReject(selectedUser.id)}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center space-x-2 shadow-lg shadow-red-200"
                            >
                                <span className="material-symbols-outlined text-lg">block</span>
                                <span>Ban / Suspend User</span>
                            </button>
                        )}
                        <button 
                            onClick={() => handleDeleteUser(selectedUser.id)}
                            className="px-6 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-400 py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center"
                            title="Permanent Delete"
                        >
                            <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                    </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 0 }}>
          <MuiButton onClick={() => setViewModal(false)} sx={{ borderRadius: '1rem', px: 4, fontWeight: 'bold' }}>Close</MuiButton>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editModal} onClose={() => setEditModal(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '2rem', p: 2 } }}>
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', tracking: '-0.02em', color: '#1a2233' }}>Edit User Information</DialogTitle>
        <form onSubmit={handleUpdateUser}>
          <DialogContent>
            <div className="grid grid-cols-2 gap-6 pt-2">
                <TextField
                  fullWidth
                  label="Username"
                  value={editData.username}
                  onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                  required
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: '1rem' } }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  required
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: '1rem' } }}
                />
                <TextField
                  fullWidth
                  label="Full Name"
                  value={editData.fullName}
                  onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: '1rem' } }}
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: '1rem' } }}
                />
                <TextField
                  fullWidth
                  label="District"
                  value={editData.district}
                  onChange={(e) => setEditData({ ...editData, district: e.target.value })}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: '1rem' } }}
                />
                <TextField
                  select
                  fullWidth
                  label="System Role"
                  value={editData.role}
                  onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: '1rem' } }}
                >
                  <MenuItem value="FARMER">FARMER</MenuItem>
                  <MenuItem value="OFFICER">OFFICER</MenuItem>
                  <MenuItem value="ADMIN">ADMIN</MenuItem>
                </TextField>
                
                {editData.role === 'OFFICER' && (
                  <TextField
                    fullWidth
                    label="Officer ID"
                    value={editData.officerId}
                    onChange={(e) => setEditData({ ...editData, officerId: e.target.value })}
                    variant="outlined"
                    InputProps={{ sx: { borderRadius: '1rem' } }}
                  />
                )}

                <TextField
                  select
                  fullWidth
                  label="Account Status"
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  variant="outlined"
                  InputProps={{ sx: { borderRadius: '1rem' } }}
                >
                  <MenuItem value="APPROVED">APPROVED (ACTIVE)</MenuItem>
                  <MenuItem value="PENDING">PENDING ADMIN</MenuItem>
                  <MenuItem value="EMAIL_PENDING">PENDING EMAIL</MenuItem>
                  <MenuItem value="REJECTED">REJECTED (SUSPENDED)</MenuItem>
                </TextField>
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 4, pt: 0 }}>
            <MuiButton onClick={() => setEditModal(false)} sx={{ borderRadius: '1rem', px: 4, color: 'slate.500', fontWeight: 'bold' }}>Cancel</MuiButton>
            <MuiButton 
              type="submit" 
              variant="contained" 
              disabled={loading}
              sx={{ 
                borderRadius: '1rem', 
                px: 4, 
                bgcolor: '#2c4d3f', 
                '&:hover': { bgcolor: '#1e352b' }, 
                fontWeight: 'bold', 
                boxShadow: 'none' 
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Save Changes'}
            </MuiButton>
          </DialogActions>
        </form>
      </Dialog>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default UserManagement;

