import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

const DiseaseDetection = () => {
    const { user } = useAuth();
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('detect'); // 'detect' or 'history'
    const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

    useEffect(() => {
        if (user?.id) {
            fetchHistory();
        }
    }, [user]);

    const fetchHistory = async () => {
        try {
            const response = await api.get(`/disease/history/${user.id}`);
            setHistory(response.data);
        } catch (err) {
            console.error('Failed to load history', err);
        }
    };

    const handleDelete = async (id, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this scan history?")) return;
        
        try {
            await api.delete(`/disease/history/${id}?userId=${user.id}`);
            setHistory(history.filter(item => item.id !== id));
            if (selectedHistoryItem?.id === id) {
                setSelectedHistoryItem(null);
            }
        } catch (err) {
            console.error('Failed to delete history', err);
            alert('Failed to delete history record.');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const handleDetect = async () => {
        if (!selectedFile || !user?.id) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('userId', user.id);

        try {
            const response = await api.post('/disease/detect', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setResult(response.data);
            fetchHistory(); // Refresh history
        } catch (err) {
            setError(err.response?.data || 'An error occurred during detection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-emerald-600">psychology</span>
                        AI Leaf Disease Detection
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Upload a photo of a coconut leaf to instantly detect diseases and get treatment recommendations.</p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    <button 
                        onClick={() => setActiveTab('detect')}
                        className={`px-6 py-2.5 rounded-xl font-bold tracking-tight transition-all text-sm ${activeTab === 'detect' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        New Scan
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2.5 rounded-xl font-bold tracking-tight transition-all text-sm ${activeTab === 'history' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        History ({history.length})
                    </button>
                </div>
            </div>

            {activeTab === 'detect' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upload Section */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-6">Upload Image</h2>
                        
                        <div 
                            className={`border-3 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${previewUrl ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50'}`}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-upload').click()}
                        >
                            <input 
                                id="file-upload" 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleFileChange} 
                            />
                            
                            {previewUrl ? (
                                <div className="space-y-4">
                                    <div className="relative w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden shadow-lg mx-auto border-4 border-white">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                    <p className="text-sm font-bold text-emerald-600">Click or drag to change image</p>
                                </div>
                            ) : (
                                <div className="space-y-4 py-8">
                                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                                        <span className="material-symbols-outlined text-4xl">cloud_upload</span>
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-slate-700">Drag & Drop your image here</p>
                                        <p className="text-slate-500 mt-1">or click to browse files</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleDetect}
                            disabled={!selectedFile || loading}
                            className={`w-full mt-6 py-4 rounded-2xl font-black text-lg tracking-wide uppercase transition-all flex items-center justify-center gap-2 ${!selectedFile ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30'}`}
                        >
                            {loading ? (
                                <>
                                    <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Analyzing AI Model...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">auto_awesome</span>
                                    Detect Disease
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 flex items-center gap-2">
                                <span className="material-symbols-outlined">error</span>
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Result Section */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-6">AI Analysis Result</h2>
                        
                        {result ? (
                            <div className="space-y-6 animate-fade-in">
                                <div className={`p-6 rounded-3xl border-2 flex items-center gap-6 ${result.diseaseName.includes('Healthy') ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${result.diseaseName.includes('Healthy') ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                        <span className="material-symbols-outlined text-3xl">
                                            {result.diseaseName.includes('Healthy') ? 'verified' : 'pest_control'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold uppercase tracking-widest opacity-60 mb-1">Detected Condition</p>
                                        <h3 className={`text-2xl font-black ${result.diseaseName.includes('Healthy') ? 'text-emerald-800' : 'text-amber-800'}`}>
                                            {result.diseaseName}
                                        </h3>
                                        <div className="mt-2 flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-black/5 rounded-full overflow-hidden w-32">
                                                <div 
                                                    className={`h-full rounded-full ${result.diseaseName.includes('Healthy') ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                    style={{ width: `${Math.round(result.confidence * 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs font-bold opacity-70">{Math.round(result.confidence * 100)}% Confidence</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">medical_services</span>
                                        Recommended Treatment / නිර්දේශිත ප්‍රතිකාරය
                                    </h4>
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                                            {result.treatmentRecommendation}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center opacity-40">
                                <span className="material-symbols-outlined text-7xl mb-4">image_search</span>
                                <p className="text-lg font-bold">Waiting for image analysis...</p>
                                <p className="text-sm mt-1">Upload an image and click detect to see results here.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Scan History</h2>
                    
                    {history.length === 0 ? (
                        <div className="text-center py-12 opacity-50">
                            <span className="material-symbols-outlined text-6xl mb-3">history_toggle_off</span>
                            <p className="text-lg font-bold">No history found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {history.map((item) => (
                                <div 
                                    key={item.id} 
                                    onClick={() => setSelectedHistoryItem(item)}
                                    className="border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition-all group cursor-pointer relative"
                                >
                                    <div className="h-48 bg-slate-100 relative">
                                        <img src={`http://localhost:8080${item.imageUrl}`} alt={item.diseaseName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">
                                            {Math.round(item.confidence * 100)}% Match
                                        </div>
                                        <button 
                                            onClick={(e) => handleDelete(item.id, e)}
                                            className="absolute top-3 right-3 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                                            title="Delete Record"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        <div className="text-xs font-bold text-slate-400 mb-2">
                                            {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <h3 className={`font-black text-lg mb-2 ${item.diseaseName.includes('Healthy') ? 'text-emerald-700' : 'text-amber-700'}`}>
                                            {item.diseaseName}
                                        </h3>
                                        <p className="text-sm text-slate-600 line-clamp-2 whitespace-pre-line">
                                            {item.treatmentRecommendation}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {/* Details Modal */}
            {selectedHistoryItem && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedHistoryItem(null)}>
                    <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
                        <div className="md:w-2/5 bg-slate-100 relative">
                            <img src={`http://localhost:8080${selectedHistoryItem.imageUrl}`} alt={selectedHistoryItem.diseaseName} className="w-full h-full object-cover min-h-[300px]" />
                            <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-xl text-xs font-bold text-slate-800 shadow-sm">
                                {new Date(selectedHistoryItem.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="md:w-3/5 p-8 relative">
                            <button 
                                onClick={() => setSelectedHistoryItem(null)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                            
                            <p className="text-sm font-bold uppercase tracking-widest opacity-60 mb-1 mt-4">Detected Condition</p>
                            <h3 className={`text-2xl font-black mb-4 ${selectedHistoryItem.diseaseName.includes('Healthy') ? 'text-emerald-800' : 'text-amber-800'}`}>
                                {selectedHistoryItem.diseaseName}
                            </h3>
                            
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${selectedHistoryItem.diseaseName.includes('Healthy') ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                        style={{ width: `${Math.round(selectedHistoryItem.confidence * 100)}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-bold opacity-70">{Math.round(selectedHistoryItem.confidence * 100)}% Confidence</span>
                            </div>

                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">medical_services</span>
                                Recommended Treatment / ප්‍රතිකාරය
                            </h4>
                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 max-h-48 overflow-y-auto custom-scrollbar">
                                <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-line text-sm">
                                    {selectedHistoryItem.treatmentRecommendation}
                                </p>
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                                <button 
                                    onClick={() => handleDelete(selectedHistoryItem.id)}
                                    className="px-5 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2 text-sm"
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                    Delete Record
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiseaseDetection;
