import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { landAPI, gpsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import MapAreaSelector from '../../components/common/MapAreaSelector';

const DISTRICT_COORDINATES = {
  'Ampara': [7.2842, 81.6747],
  'Anuradhapura': [8.3114, 80.4037],
  'Badulla': [6.9934, 81.0553],
  'Batticaloa': [7.7102, 81.6924],
  'Colombo': [6.9271, 79.8612],
  'Galle': [6.0367, 80.2170],
  'Gampaha': [7.0917, 80.0000],
  'Hambantota': [6.1241, 81.1185],
  'Jaffna': [9.6612, 80.0255],
  'Kalutara': [6.5854, 79.9607],
  'Kandy': [7.2906, 80.6337],
  'Kegalle': [7.2522, 80.3423],
  'Kilinochchi': [9.3857, 80.4074],
  'Kurunegala': [7.4863, 80.3647],
  'Mannar': [8.9818, 79.9142],
  'Matale': [7.4675, 80.6234],
  'Matara': [5.9549, 80.5291],
  'Moneragala': [6.8837, 81.3414],
  'Mullaitivu': [9.2662, 80.8143],
  'Nuwara Eliya': [6.9497, 80.7891],
  'Polonnaruwa': [7.9403, 81.0188],
  'Puttalam': [8.0330, 79.8259],
  'Ratnapura': [6.7056, 80.3847],
  'Trincomalee': [8.5711, 81.2335],
  'Vavuniya': [8.7516, 80.4952]
};

const LandForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    farmerId: '',
    locationName: '',
    district: '',
    areaInAcres: '',
    numberOfTrees: '',
    coconutVariety: '',
    soilType: '',
    irrigationType: '',
    notes: '',
    status: 'ACTIVE',
    latitude: '',
    longitude: '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const [mapView, setMapView] = useState({ 
    center: [7.8731, 80.7718], 
    zoom: 7 
  });

  useEffect(() => {
    if (isEdit) {
      loadLand();
    } else if (user?.id) {
      setForm((prev) => ({ ...prev, farmerId: user.id }));
    }
  }, [id, user]);

  // Center map when district changes
  useEffect(() => {
    if (form.district) {
      const match = Object.keys(DISTRICT_COORDINATES).find(
        d => d.toLowerCase() === form.district.trim().toLowerCase()
      );
      if (match) {
        setMapView({ center: DISTRICT_COORDINATES[match], zoom: 12 });
      }
    }
  }, [form.district]);

  useEffect(() => {
    if (toast.open) {
      const timer = setTimeout(() => setToast({ ...toast, open: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.open]);

  const loadLand = async () => {
    if (!user?.id) return;
    try {
      const response = await landAPI.getById(id, user.id);
      const data = response.data;
      setForm({
        farmerId: data.farmerId || '',
        locationName: data.locationName || '',
        district: data.district || '',
        areaInAcres: data.areaInAcres || '',
        numberOfTrees: data.numberOfTrees || '',
        coconutVariety: data.coconutVariety || '',
        soilType: data.soilType || '',
        irrigationType: data.irrigationType || '',
        notes: data.notes || '',
        status: data.status || 'ACTIVE',
        latitude: '',
        longitude: '',
      });

      // Fetch GPS location matching the land's name in edit mode
      try {
        const gpsResponse = await gpsAPI.getLocations();
        const locations = gpsResponse.data;
        const matchedLocation = locations.find(loc => loc.name === data.locationName);
        if (matchedLocation) {
          setForm(prev => ({
            ...prev,
            latitude: matchedLocation.latitude,
            longitude: matchedLocation.longitude
          }));
          setMapView({ 
            center: [matchedLocation.latitude, matchedLocation.longitude], 
            zoom: 15 
          });
        }
      } catch (gpsError) {
        console.warn('Could not fetch GPS location for land edit:', gpsError);
      }
    } catch (error) {
      console.error('Error loading land:', error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAreaCalculated = ({ areaInAcres, latitude, longitude }) => {
    setForm((prev) => ({
      ...prev,
      areaInAcres,
      latitude,
      longitude
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      ...form,
      farmerId: user.id,
      areaInAcres: Number(form.areaInAcres),
      numberOfTrees: Number(form.numberOfTrees),
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
    };

    try {
      if (isEdit) {
        await landAPI.update(id, user.id, data);
        
        // Keep GPS API sync for backward compatibility if needed
        if (data.latitude && data.longitude) {
           try {
             await gpsAPI.saveLocation({
               name: form.locationName,
               latitude: data.latitude,
               longitude: data.longitude,
               description: form.notes || 'Updated from Land Form'
             });
           } catch (gpsError) {
             console.warn('GPS location update failed:', gpsError);
           }
        }

        setToast({ open: true, message: 'Land updated successfully', type: 'success' });
        setTimeout(() => navigate('/plantation/lands'), 1000);
      } else {
        await landAPI.create(user.id, data);
        
        if (data.latitude && data.longitude) {
          try {
            await gpsAPI.saveLocation({
              name: form.locationName,
              latitude: data.latitude,
              longitude: data.longitude,
              description: form.notes || 'Created from Land Form'
            });
          } catch (gpsError) {
            console.warn('GPS location save failed:', gpsError);
          }
        }
        
        setToast({ open: true, message: 'Land created successfully', type: 'success' });
        setTimeout(() => navigate('/plantation/lands'), 1000);
      }
    } catch (error) {
      console.error('Error saving land:', error);
      setToast({ open: true, message: 'Error saving land', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div>
        <button 
          onClick={() => navigate('/plantation/lands')}
          className="group flex items-center space-x-2 text-slate-400 hover:text-[#2c4d3f] transition-colors mb-4"
        >
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="text-[10px] font-bold tracking-widest uppercase">Back to Lands</span>
        </button>
        {/* Form Title is in Layout header */}

      </div>

      <div className="bg-white rounded-[32px] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden">
        
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-bl-[100px] -z-10 opacity-50"></div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Form Fields */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Farmer ID</label>
              <input
                type="number"
                name="farmerId"
                value={form.farmerId}
                readOnly
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Location Name *</label>
              <input
                type="text"
                name="locationName"
                value={form.locationName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
                placeholder="e.g. Bandara Estate 1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">District *</label>
              <input
                type="text"
                name="district"
                value={form.district}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
                placeholder="e.g. Kurunegala"
              />
            </div>
            
            {/* Map Section breaks out of grid */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4 space-y-4">
               <div className="flex items-center space-x-2">
                 <span className="material-symbols-outlined text-[#2c4d3f]">map</span>
                 <h3 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Plantation Boundary</h3>
               </div>
               <p className="text-xs text-slate-500 font-medium">Draw a polygon around your coconut estate on the map. We will automatically calculate the exact area in acres and pinpoint the GPS coordinates.</p>
               
               <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                 <MapAreaSelector 
                   onAreaCalculated={handleAreaCalculated} 
                   center={mapView.center}
                   zoom={mapView.zoom}
                   initialPosition={form.latitude && form.longitude ? { 
                     lat: Number(form.latitude), 
                     lng: Number(form.longitude),
                     label: form.locationName || 'Land Location'
                   } : null}
                 />
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Area (Acres) *</label>
              <input
                type="number"
                name="areaInAcres"
                value={form.areaInAcres}
                onChange={handleChange}
                required
                readOnly
                className="w-full px-4 py-3 bg-slate-50 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all cursor-not-allowed"
                placeholder="Auto-calculated"
              />
              <p className="text-[9px] text-emerald-600 font-bold tracking-wider mt-1 ml-1">AUTO-CALCULATED FROM MAP</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">GPS Latitude</label>
              <input
                type="number"
                step="0.000001"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                readOnly
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">GPS Longitude</label>
              <input
                type="number"
                step="0.000001"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                readOnly
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Number of Trees *</label>
              <input
                type="number"
                name="numberOfTrees"
                value={form.numberOfTrees}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Coconut Variety</label>
              <input
                type="text"
                name="coconutVariety"
                value={form.coconutVariety}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
                placeholder="e.g. CRIC 60"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Soil Type</label>
              <input
                type="text"
                name="soilType"
                value={form.soilType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
                placeholder="e.g. Sandy Loam"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Irrigation Type</label>
              <input
                type="text"
                name="irrigationType"
                value={form.irrigationType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all"
                placeholder="e.g. Drip Irrigation"
              />
            </div>

            <div className="space-y-2 relative group/select">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all appearance-none cursor-pointer custom-select-arrow"
              >
                <option value="ACTIVE" className="font-bold">Active</option>
                <option value="INACTIVE" className="font-bold">Inactive</option>
              </select>
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-2">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Additional Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] transition-all resize-none"
                placeholder="Add any additional details or observations..."
              />
            </div>

          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className={`flex flex-row items-center space-x-2 px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${
                loading 
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                  : 'bg-[#2c4d3f] hover:bg-[#1f382d] text-white hover:shadow-xl hover:-translate-y-0.5'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>{loading ? 'Saving...' : (isEdit ? 'Update Land' : 'Register Land')}</span>
            </button>
          </div>

        </form>
      </div>

      {/* Toast Notification */}
      {toast.open && (
        <div className={`fixed bottom-8 right-8 flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-2xl animate-fade-in z-50 ${
          toast.type === 'success' ? 'bg-emerald-900 text-emerald-50' : 'bg-rose-900 text-rose-50'
        }`}>
          <span className="material-symbols-outlined">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <p className="text-sm font-bold">{toast.message}</p>
          <button onClick={() => setToast({ ...toast, open: false })} className="ml-4 opacity-70 hover:opacity-100">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

    </div>
  );
};

export default LandForm;
