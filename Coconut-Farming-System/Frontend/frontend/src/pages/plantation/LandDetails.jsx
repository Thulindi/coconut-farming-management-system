import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { landAPI, gpsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import MapAreaSelector from '../../components/common/MapAreaSelector';

const LandDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [land, setLand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);

  useEffect(() => {
    loadLand();
  }, [id, user]);

  const loadLand = async () => {
    if (!user?.id) return;
    try {
      const response = await landAPI.getById(id, user.id);
      const landData = response.data;
      setLand(landData);

      // Fetch GPS location matching the land's name
      try {
        const gpsResponse = await gpsAPI.getLocations();
        const locations = gpsResponse.data;
        const matchedLocation = locations.find(loc => loc.name === landData.locationName);
        if (matchedLocation) {
          setGpsLocation(matchedLocation);
        }
      } catch (gpsError) {
        console.warn('Could not fetch GPS location for land:', gpsError);
      }
    } catch (error) {
      console.error('Error loading land:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await landAPI.delete(id, user.id);
      navigate('/plantation/lands');
    } catch (error) {
      console.error('Error deleting land:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 flex-col space-y-4 animate-fade-in">
        <span className="material-symbols-outlined text-5xl text-[#2c4d3f] animate-spin">autorenew</span>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading details...</p>
      </div>
    );
  }

  if (!land) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">error_outline</span>
        <h2 className="text-xl font-black text-slate-800 tracking-tighter mb-2">Land Not Found</h2>
        <p className="text-slate-500 font-medium mb-6">The plantation record you're looking for was not found or has been removed.</p>
        <button 
          onClick={() => navigate('/plantation/lands')}
          className="bg-[#1a2233] hover:bg-[#111622] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
        >
          Return to Lands
        </button>
      </div>
    );
  }

  const details = [
    { label: 'District', value: land.district, icon: 'location_on' },
    { label: 'Area', value: `${land.areaInAcres} acres`, icon: 'aspect_ratio' },
    { label: 'Number of Trees', value: land.numberOfTrees, icon: 'park' },
    { label: 'Coconut Variety', value: land.coconutVariety || 'Not specified', icon: 'potted_plant' },
    { label: 'Soil Type', value: land.soilType || 'Not specified', icon: 'layers' },
    { label: 'Irrigation Type', value: land.irrigationType || 'Not specified', icon: 'water_drop' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Area */}
      <div>
        <button 
          onClick={() => navigate('/plantation/lands')}
          className="group flex items-center space-x-2 text-slate-400 hover:text-[#2c4d3f] transition-colors mb-4"
        >
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="text-[10px] font-bold tracking-widest uppercase">Back to Lands</span>
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter font-headline mb-2">{land.locationName}</h1>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase ${
                land.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {land.status}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l border-slate-200 pl-3">
                ID: {land.farmerId}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => navigate(`/plantation/lands/${id}/fertilizing`)}
              className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-4 py-2.5 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">vaccines</span>
              <span className="text-xs font-bold uppercase tracking-wider">Fertilizing</span>
            </button>
            <button 
              onClick={() => navigate(`/plantation/lands/${id}/harvest`)}
              className="flex items-center space-x-2 bg-orange-50 text-orange-700 hover:bg-orange-100 px-4 py-2.5 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">agriculture</span>
              <span className="text-xs font-bold uppercase tracking-wider">Harvest</span>
            </button>
            <button 
              onClick={() => navigate(`/plantation/lands/${id}/edit`)}
              className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:border-[#2c4d3f] hover:text-[#2c4d3f] rounded-xl transition-colors shadow-sm"
              title="Edit Land"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
            <button 
              onClick={() => setDeleteDialog(true)}
              className="w-10 h-10 flex items-center justify-center bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors shadow-sm"
              title="Delete Land"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {details.map((detail, index) => (
          <div key={index} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex items-start space-x-4">
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-slate-400 text-lg">{detail.icon}</span>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 tracking-[0.15em] uppercase mb-1">{detail.label}</p>
              <p className="text-lg font-black text-slate-800 tracking-tight">{detail.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Map Section */}
      {gpsLocation && (
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center space-x-3">
             <span className="material-symbols-outlined text-[#2c4d3f]">map</span>
             <h3 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Plantation Location</h3>
          </div>
          <div className="rounded-2xl overflow-hidden border border-slate-200">
            <MapAreaSelector 
              isReadOnly={true}
              center={[Number(gpsLocation.latitude), Number(gpsLocation.longitude)]}
              zoom={15}
              initialPosition={{
                lat: Number(gpsLocation.latitude),
                lng: Number(gpsLocation.longitude),
                label: gpsLocation.name
              }}
            />
          </div>
          <div className="flex justify-between items-center px-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Coordinates: {Number(gpsLocation.latitude).toFixed(6)}, {Number(gpsLocation.longitude).toFixed(6)}
            </p>
            <a 
              href={`https://www.google.com/maps?q=${gpsLocation.latitude},${gpsLocation.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-[#2c4d3f] hover:underline uppercase tracking-widest flex items-center"
            >
              Open in Google Maps
              <span className="material-symbols-outlined text-xs ml-1">open_in_new</span>
            </a>
          </div>
        </div>
      )}

      {/* Notes Section */}
      {land.notes && (
        <div className="bg-[#f8faf9] border border-slate-200 p-8 rounded-[32px]">
           <div className="flex items-center space-x-3 mb-4">
             <span className="material-symbols-outlined text-slate-400">notes</span>
             <h3 className="text-sm font-bold text-slate-700 tracking-wider uppercase">Important Notes</h3>
           </div>
           <p className="text-slate-600 font-medium leading-relaxed">
             {land.notes}
           </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white p-8 rounded-[32px] shadow-2xl w-full max-w-md">
            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-rose-600">warning</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Delete Plantation Record</h3>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-700">{land.locationName}</strong>? This action is permanent and will remove all associated harvesting and fertilizing history.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setDeleteDialog(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-50 uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-500 hover:bg-rose-600 uppercase tracking-wider transition-colors shadow-md shadow-rose-200"
              >
                Yes, Delete Land
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LandDetails;
