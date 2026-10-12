import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { landAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const LandList = ({ showFertilizing, showHarvest }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const loadLands = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (status) params.status = status;
      const response = await landAPI.getAll(user.id, params);
      setLands(response.data.content || response.data || []);
    } catch (error) {
      console.error('Error loading lands:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLands();
  }, []);

  const handleView = (id) => {
    if (showFertilizing) {
      navigate(`/plantation/lands/${id}/fertilizing`);
    } else if (showHarvest) {
      navigate(`/plantation/lands/${id}/harvest`);
    } else {
      navigate(`/plantation/lands/${id}`);
    }
  };

  const title = showFertilizing ? 'Fertilizing Management' : showHarvest ? 'Harvest Management' : 'Land Management';
  const subtitle = showFertilizing ? 'Manage fertilizing schedules' : showHarvest ? 'Track plantation yield' : 'Manage your plantation lands';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Actions */}
      <div className="flex justify-end items-start">
        {!showFertilizing && !showHarvest && (
          <button
            onClick={() => navigate('/plantation/lands/new')}
            className="flex items-center space-x-2 bg-[#1a2233] hover:bg-[#111622] text-white px-5 py-2.5 rounded-full transition-all shadow-md group"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="text-xs font-bold tracking-wider uppercase">Add Land</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search lands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
          />
        </div>
        
        <div className="relative w-full md:w-48 group/select">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none z-10">filter_list</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full pl-11 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all appearance-none cursor-pointer custom-select-arrow text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <button
          onClick={loadLands}
          className="w-full md:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
        >
          Apply Filters
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black text-slate-900 tracking-tight font-headline">Registered Lands</h2>
          <div className="flex space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2c4d3f]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-slate-100"></div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="material-symbols-outlined text-4xl text-slate-200 animate-spin">autorenew</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 tracking-widest uppercase border-b border-slate-100/50">
                  <th className="pb-4">Location</th>
                  <th className="pb-4">District</th>
                  <th className="pb-4 text-right">Area (Acres)</th>
                  <th className="pb-4 text-right">Trees</th>
                  <th className="pb-4">Variety</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {lands.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 text-sm font-medium">
                      No lands found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  lands.map((land) => (
                    <tr key={land.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50/50 last:border-0">
                      <td className="py-5 font-bold text-slate-900 pr-4">{land.locationName}</td>
                      <td className="py-5 font-medium text-slate-500 pr-4">{land.district}</td>
                      <td className="py-5 font-bold text-slate-700 text-right pr-4">{land.areaInAcres}</td>
                      <td className="py-5 font-bold text-slate-700 text-right pr-4">{land.numberOfTrees}</td>
                      <td className="py-5 font-medium text-slate-500 pr-4">{land.coconutVariety || '-'}</td>
                      <td className="py-5 pr-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                          land.status === 'ACTIVE' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {land.status}
                        </span>
                      </td>
                      <td className="py-5 text-right">
                        <button 
                          onClick={() => handleView(land.id)}
                          className="w-8 h-8 rounded-full bg-slate-50 hover:bg-[#2c4d3f] text-slate-400 hover:text-white flex items-center justify-center transition-colors shadow-sm ml-auto"
                          title="View Details"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
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

    </div>
  );
};

export default LandList;
