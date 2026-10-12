import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { visitAPI, authAPI, landAPI } from '../../api';

const FieldVisits = () => {
  const { user, getPrimaryRole } = useAuth();
  const role = getPrimaryRole();
  
  const [visits, setVisits] = useState([]);
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  
  // Modals state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  
  // Form state
  const [requestForm, setRequestForm] = useState({ district: '', reason: '', landId: '' });
  const [acceptForm, setAcceptForm] = useState({ officerMessage: '' });
  const [completeForm, setCompleteForm] = useState({ completionNote: '' });

  // Districts for Sri Lanka
  const districts = [
    "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", 
    "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", 
    "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala", 
    "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", 
    "Trincomalee", "Vavuniya"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch User Profile to get their district
        const profileRes = await authAPI.getProfile(user.username);
        setProfile(profileRes.data);
        
        if (role === 'FARMER') {
          setRequestForm(prev => ({ ...prev, district: profileRes.data.district || '' }));
          
          // Fetch visits
          try {
            const visitsRes = await visitAPI.getFarmerRequests(user.id);
            setVisits(visitsRes.data);
          } catch (err) {
            console.error("Error fetching farmer requests:", err);
          }

          // Fetch lands
          try {
            console.log("Fetching lands for user ID:", user.id);
            const landsRes = await landAPI.getAll(user.id);
            console.log("Lands API Raw Response:", landsRes);
            const landsData = landsRes.data?.content || landsRes.data || [];
            console.log("Processed Lands Data:", landsData);
            setLands(Array.isArray(landsData) ? landsData : []);
          } catch (err) {
            console.error("Error fetching lands:", err);
          }
        } else if (role === 'OFFICER') {
          const district = profileRes.data.district;
          if (district) {
            // Fetch pending requests for officer's district and their own accepted visits
            const [pendingRes, myVisitsRes] = await Promise.all([
              visitAPI.getPendingByDistrict(district),
              visitAPI.getOfficerVisits(user.id)
            ]);
            
            // Combine and remove duplicates (if any)
            const combined = [...pendingRes.data, ...myVisitsRes.data];
            const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
            setVisits(unique.sort((a,b) => new Date(b.requestedDate) - new Date(a.requestedDate)));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.id) fetchData();
  }, [user, role]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await visitAPI.createRequest(user.id, requestForm);
      setVisits([res.data, ...visits]);
      setIsRequestModalOpen(false);
      setRequestForm({ ...requestForm, reason: '', landId: '' });
    } catch (error) {
      console.error("Error creating request:", error);
      alert("Failed to submit request.");
    }
  };

  const handleAcceptVisit = async (e) => {
    e.preventDefault();
    try {
      const res = await visitAPI.acceptVisit(selectedVisit.id, user.id, acceptForm);
      setVisits(visits.map(v => v.id === selectedVisit.id ? res.data : v));
      setIsAcceptModalOpen(false);
      setAcceptForm({ officerMessage: '' });
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("Failed to accept visit.");
    }
  };

  const handleCompleteVisit = async (e) => {
    e.preventDefault();
    try {
      const res = await visitAPI.completeVisit(selectedVisit.id, user.id, completeForm);
      setVisits(visits.map(v => v.id === selectedVisit.id ? res.data : v));
      setIsCompleteModalOpen(false);
      setCompleteForm({ completionNote: '' });
    } catch (error) {
      console.error("Error completing visit:", error);
      alert("Failed to complete visit.");
    }
  };

  const handleHideVisit = async (visitId) => {
    try {
      if (window.confirm("Are you sure you want to remove this visit from your view?")) {
        await visitAPI.hideVisit(visitId, user.id);
        setVisits(visits.filter(v => v.id !== visitId));
      }
    } catch (error) {
      console.error("Error hiding visit:", error);
      alert("Failed to remove visit.");
    }
  };

  const handleHideVisitFarmer = async (visitId) => {
    try {
      if (window.confirm("Are you sure you want to delete this visit history?")) {
        await visitAPI.hideVisitFarmer(visitId, user.id);
        setVisits(visits.filter(v => v.id !== visitId));
      }
    } catch (error) {
      console.error("Error deleting visit:", error);
      alert("Failed to delete visit.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Pending';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const openInMap = (lat, lng) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
      COMPLETED: 'bg-green-100 text-green-800 border-green-200'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex justify-between items-center relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-emerald-50 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-600">directions_car</span>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight font-headline">Field Visits</h1>
          </div>
          <p className="text-slate-500 font-medium ml-13">
            {role === 'FARMER' ? 'Schedule an expert consultation for your plantation.' : 'Manage and respond to farmer site visit requests.'}
          </p>
        </div>
        {role === 'FARMER' && (
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="relative z-10 bg-[#2c4d3f] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1b3228] transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Request Visit
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-[#2c4d3f]/20 border-t-[#2c4d3f] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {visits.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-slate-300 text-4xl">inbox</span>
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No Field Visits Found</h3>
              <p className="text-slate-500">
                {role === 'FARMER' ? "You haven't requested any field visits yet." : "There are no pending requests in your district right now."}
              </p>
            </div>
          ) : (
            visits.map((visit) => (
              <div key={visit.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md flex flex-col md:flex-row gap-6">
                
                {/* Left Side: Summary Info */}
                <div className="md:w-1/3 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6 whitespace-nowrap relative">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <StatusBadge status={visit.status} />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{visit.district}</span>
                      </div>
                      {role === 'FARMER' && visit.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleHideVisitFarmer(visit.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                          title="Delete visit history"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Requested By</p>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                            {visit.farmerName?.charAt(0) || 'F'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{visit.farmerName}</p>
                            {visit.farmerPhone ? (
                              <a href={`tel:${visit.farmerPhone}`} className="text-xs text-emerald-600 hover:underline flex items-center gap-1 font-medium">
                                <span className="material-symbols-outlined text-[12px]">call</span>
                                {visit.farmerPhone}
                              </a>
                            ) : (
                              <p className="text-xs text-slate-400 italic">No phone provided</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {visit.landName && (
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Land / Plantation</p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-slate-700">{visit.landName}</p>
                            {visit.latitude && visit.longitude && (
                              <button 
                                onClick={() => openInMap(visit.latitude, visit.longitude)}
                                className="text-emerald-600 hover:text-emerald-700 p-1 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-1"
                                title="View on Google Maps"
                              >
                                <span className="material-symbols-outlined text-[18px]">map</span>
                                <span className="text-[10px] font-bold uppercase">View Map</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Requested On</p>
                        <p className="text-sm font-bold text-slate-700">{formatDate(visit.requestedDate)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {role === 'OFFICER' && visit.status === 'PENDING' && (
                    <button
                      onClick={() => { setSelectedVisit(visit); setIsAcceptModalOpen(true); }}
                      className="mt-6 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl transition-colors shadow-sm active:scale-95 flex justify-center items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">event_available</span>
                      Schedule Visit
                    </button>
                  )}
                  {role === 'OFFICER' && visit.status === 'SCHEDULED' && (
                    <button
                      onClick={() => { setSelectedVisit(visit); setIsCompleteModalOpen(true); }}
                      className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl transition-colors shadow-sm active:scale-95 flex justify-center items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      Mark Completed
                    </button>
                  )}
                  {role === 'OFFICER' && visit.status === 'COMPLETED' && (
                    <button
                      onClick={() => handleHideVisit(visit.id)}
                      className="mt-6 w-full bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 font-bold py-2.5 rounded-xl transition-colors shadow-sm active:scale-95 flex justify-center items-center gap-2 border border-slate-200 hover:border-red-200"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      Remove from view
                    </button>
                  )}
                </div>
                
                {/* Right Side: Details & Officer Info */}
                <div className="md:w-2/3 flex flex-col">
                  <h4 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2">Reason for Visit</h4>
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-2xl text-sm leading-relaxed border border-slate-100 flex-grow">
                    {visit.reason}
                  </p>
                  
                  {visit.status !== 'PENDING' && (
                    <div className="mt-4 bg-[#f8faf9] border border-emerald-100 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                      
                      <div className="flex align-center gap-3 w-full md:w-auto">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                           <span className="material-symbols-outlined text-emerald-600">badge</span>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-600/70 mb-0.5">Assigned Officer</p>
                          <p className="text-sm font-bold text-slate-800 leading-tight">{visit.officerName || 'Unknown Officer'}</p>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                            <span className="material-symbols-outlined text-[14px]">call</span>
                            {visit.officerPhone || 'No phone provided'}
                          </p>
                        </div>
                      </div>
                      
                      {visit.officerMessage && (
                        <div className="flex-1 w-full bg-white rounded-xl p-3 border border-emerald-50 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400"></div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Message from Officer</p>
                          <p className="text-sm text-slate-700 font-medium italic">"{visit.officerMessage}"</p>
                        </div>
                      )}
                      
                    </div>
                  )}

                  {visit.status === 'COMPLETED' && visit.completionNote && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-green-600 text-[18px]">fact_check</span>
                        <h4 className="text-[10px] font-bold text-green-700 tracking-widest uppercase">Completion Note</h4>
                      </div>
                      <p className="text-sm text-green-900 leading-relaxed font-medium">
                        "{visit.completionNote}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Request Modal (Farmer) */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsRequestModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-[500px] rounded-[2rem] p-8 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 font-headline">Request Field Visit</h2>
            <form onSubmit={handleCreateRequest} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2 ml-1">Plantation District</label>
                <select
                  required
                  value={requestForm.district}
                  onChange={(e) => setRequestForm({...requestForm, district: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] appearance-none"
                >
                  <option value="" disabled>Select District</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <p className="text-[10px] text-slate-400 mt-2 ml-1 font-medium italic">
                  * Requests are routed to officers within this district.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2 ml-1">Select Land</label>
                <select
                  required
                  value={requestForm.landId}
                  onChange={(e) => {
                    const selectedLand = lands.find(l => l.id === parseInt(e.target.value));
                    setRequestForm({
                      ...requestForm, 
                      landId: e.target.value,
                      district: selectedLand ? selectedLand.district : requestForm.district
                    });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] appearance-none"
                >
                  <option value="" disabled>Choose Plantation</option>
                  {lands.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.locationName} ({l.district})
                    </option>
                  ))}
                </select>
                {lands.length === 0 && (
                  <p className="text-[10px] text-red-400 mt-2 ml-1 font-medium italic">
                    You haven't registered any lands yet. Please add a land first.
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2 ml-1">Reason / Description</label>
                <textarea
                  required
                  rows="4"
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})}
                  placeholder="Describe the issue (e.g., Yellowing leaves, sudden pest infestation...)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2c4d3f] resize-none"
                ></textarea>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#2c4d3f] text-white font-bold rounded-xl hover:bg-[#1b3228] transition-colors shadow-lg"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accept Modal (Officer) */}
      {isAcceptModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAcceptModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-[500px] rounded-[2rem] p-8 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-800 mb-2 font-headline">Accept Request</h2>
            <p className="text-sm text-slate-500 mb-6">You are accepting a field visit from <strong className="text-slate-800">{selectedVisit?.farmerName}</strong>.</p>
            
            <form onSubmit={handleAcceptVisit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2 ml-1">Message to Farmer</label>
                <textarea
                  required
                  rows="3"
                  value={acceptForm.officerMessage}
                  onChange={(e) => setAcceptForm({...acceptForm, officerMessage: e.target.value})}
                  placeholder="E.g., I'll be there this Friday morning around 10 AM. Please keep the affected leaves ready for inspection."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                ></textarea>
                <p className="text-[10px] text-slate-400 mt-2 ml-1 font-medium">Your phone number will also be securely shared with the farmer.</p>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAcceptModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-lg"
                >
                  Confirm Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Modal (Officer) */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCompleteModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-[500px] rounded-[2rem] p-8 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-800 mb-2 font-headline">Complete Field Visit</h2>
            <p className="text-sm text-slate-500 mb-6">Record your final findings or notes for <strong className="text-slate-800">{selectedVisit?.farmerName}</strong>'s field visit.</p>
            
            <form onSubmit={handleCompleteVisit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2 ml-1">Completion Note</label>
                <textarea
                  required
                  rows="4"
                  value={completeForm.completionNote}
                  onChange={(e) => setCompleteForm({...completeForm, completionNote: e.target.value})}
                  placeholder="E.g., Visited the site. Found minor signs of leaf rot. Advised farmer to apply specific fungicide and reduce over-watering."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                ></textarea>
                <p className="text-[10px] text-slate-400 mt-2 ml-1 font-medium">This note will be visible to the farmer on their dashboard.</p>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FieldVisits;
