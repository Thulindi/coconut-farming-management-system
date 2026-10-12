import React, { useState, useEffect } from 'react';
import { landAPI } from '../../api';
import MapAreaSelector from '../../components/common/MapAreaSelector';

const LandOversight = () => {
    const [lands, setLands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [districtFilter, setDistrictFilter] = useState('');
    const [selectedLand, setSelectedLand] = useState(null);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);

    const districts = [
        'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 
        'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 
        'Mannar', 'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya', 
        'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
    ];

    useEffect(() => {
        fetchLands();
    }, [districtFilter]);

    const fetchLands = async () => {
        setLoading(true);
        try {
            const response = await landAPI.getAllAdmin(districtFilter);
            setLands(response.data.content || []);
        } catch (error) {
            console.error('Error fetching lands for admin:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewOnMap = (land) => {
        setSelectedLand(land);
        setIsMapModalOpen(true);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter font-headline mb-2 uppercase">
                        Land Oversight
                    </h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                        <span className="material-symbols-outlined text-[14px] mr-2 text-emerald-500">monitoring</span>
                        Unified Monitoring of all registered plantation lands
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg group-focus-within:text-emerald-500 transition-colors">filter_list</span>
                        <select 
                            value={districtFilter}
                            onChange={(e) => setDistrictFilter(e.target.value)}
                            className="pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-[12px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer shadow-sm hover:shadow-md"
                        >
                            <option value="">All Districts</option>
                            {districts.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300 pointer-events-none text-sm">expand_more</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center space-x-4 group hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined">map</span>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900">{lands.length}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Plots</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center space-x-4 group hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined">potted_plant</span>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900">
                            {lands.reduce((sum, l) => sum + (l.numberOfTrees || 0), 0).toLocaleString()}
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Trees</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center space-x-4 group hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined">square_foot</span>
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900">
                            {lands.reduce((sum, l) => sum + Number(l.areaInAcres || 0), 0).toFixed(1)} ac
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Combined Area</div>
                    </div>
                </div>
            </div>

            {/* Main Land Table */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50 bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">District</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Owner ID</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Trees</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Area (Ac)</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Variety</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="7" className="px-8 py-6">
                                            <div className="h-6 bg-slate-100 rounded-lg w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : lands.length > 0 ? (
                                lands.map((land) => (
                                    <tr key={land.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs uppercase">
                                                    {land.locationName?.charAt(0)}
                                                </div>
                                                <div className="text-sm font-black text-slate-800 tracking-tight">{land.locationName}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center space-x-1">
                                                <span className="material-symbols-outlined text-[14px] text-slate-300">location_on</span>
                                                <span className="text-xs font-bold text-slate-500">{land.district}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 tracking-tighter">
                                                USR#{land.farmerId}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="text-sm font-bold text-slate-700">{land.numberOfTrees}</span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className="px-3 py-1 bg-emerald-50 rounded-full text-[10px] font-black text-emerald-600">
                                                {land.areaInAcres} AC
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-bold text-slate-500 italic">{land.coconutVariety || 'Standard'}</span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => handleViewOnMap(land)}
                                                className="inline-flex items-center space-x-2 px-4 py-2 bg-[#2c4d3f] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#1f382d] hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">distance</span>
                                                <span>View on Map</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center opacity-30">
                                            <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
                                            <p className="text-sm font-bold uppercase tracking-widest">No lands found in this area</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Map Modal */}
            {isMapModalOpen && selectedLand && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-fade-in">
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setIsMapModalOpen(false)}
                    ></div>
                    <div className="relative bg-white w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden border border-white/20 flex flex-col h-full max-h-[85vh]">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white relative z-10 shadow-sm">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase font-headline">
                                    {selectedLand.locationName}
                                </h3>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="material-symbols-outlined text-[14px] text-emerald-600">location_on</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        GPS: {selectedLand.latitude || '7.8731'} , {selectedLand.longitude || '80.7718'}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsMapModalOpen(false)}
                                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center transition-all"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Map Content */}
                        <div className="flex-1 overflow-hidden relative">
                            {selectedLand.latitude ? (
                                <MapAreaSelector 
                                    isReadOnly={true}
                                    center={[Number(selectedLand.latitude), Number(selectedLand.longitude)]}
                                    zoom={16}
                                    initialPosition={{
                                        lat: Number(selectedLand.latitude),
                                        lng: Number(selectedLand.longitude),
                                        label: `${selectedLand.locationName} - USR#${selectedLand.farmerId}`
                                    }}
                                />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400">
                                    <span className="material-symbols-outlined text-6xl mb-4 text-slate-200">fmd_bad</span>
                                    <p className="text-sm font-bold uppercase tracking-widest text-slate-300">GPS Data Unavailable for this plot</p>
                                    <p className="text-[10px] mt-2 font-medium opacity-60">Wait for farmer to update location via Map Selector</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer Info */}
                        <div className="p-8 bg-slate-50 border-t border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Variety</div>
                                <div className="text-sm font-black text-slate-800">{selectedLand.coconutVariety || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Soil Type</div>
                                <div className="text-sm font-black text-slate-800">{selectedLand.soilType || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Irrigation</div>
                                <div className="text-sm font-black text-slate-800">{selectedLand.irrigationType || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notes</div>
                                <div className="text-[11px] font-medium text-slate-500 italic max-w-xs truncate">{selectedLand.notes || 'No specific notes recorded.'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    );
};

export default LandOversight;
