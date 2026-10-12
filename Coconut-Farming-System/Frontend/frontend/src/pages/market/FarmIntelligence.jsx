import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { landAPI, weatherAPI } from '../../api';

// ── Sri Lankan Coconut Market Centres ──────────────────────────────────────
const SL_MARKETS = [
  // Western Province
  { name: 'Colombo Wholesale (Pettah)', lat: 6.9271, lng: 79.8612, range: '90,000–100,000', unit: 'per 1,000 nuts' },
  { name: 'Gampaha Market', lat: 7.0873, lng: 80.0137, range: '80,000–90,000', unit: 'per 1,000 nuts' },
  { name: 'Negombo Market', lat: 7.2084, lng: 79.8358, range: '85,000–95,000', unit: 'per 1,000 nuts' },
  { name: 'Kalutara Market', lat: 6.5854, lng: 79.9607, range: '78,000–88,000', unit: 'per 1,000 nuts' },

  // North Western (Coconut Triangle 🔥)
  { name: 'Kurunegala Market', lat: 7.4861, lng: 80.3628, range: '80,000–90,000', unit: 'per 1,000 nuts' },
  { name: 'Chilaw Market', lat: 7.5757, lng: 79.7949, range: '85,000–95,000', unit: 'per 1,000 nuts' },
  { name: 'Puttalam Market', lat: 8.0362, lng: 79.8283, range: '80,000–90,000', unit: 'per 1,000 nuts' },
  { name: 'Kuliyapitiya Market', lat: 7.4688, lng: 80.0401, range: '80,000–90,000', unit: 'per 1,000 nuts' },

  // Southern Province
  { name: 'Matara Market', lat: 5.9549, lng: 80.5550, range: '75,000–85,000', unit: 'per 1,000 nuts' },
  { name: 'Galle Market', lat: 6.0535, lng: 80.2210, range: '78,000–88,000', unit: 'per 1,000 nuts' },
  { name: 'Hambantota Market', lat: 6.1241, lng: 81.1185, range: '72,000–82,000', unit: 'per 1,000 nuts' },

  // Central Province
  { name: 'Kandy Market', lat: 7.2906, lng: 80.6337, range: '85,000–95,000', unit: 'per 1,000 nuts' },
  { name: 'Dambulla Economic Center', lat: 7.8680, lng: 80.6510, range: '85,000–95,000', unit: 'per 1,000 nuts' },

  // Sabaragamuwa
  { name: 'Kegalle Market', lat: 7.2513, lng: 80.3464, range: '80,000–90,000', unit: 'per 1,000 nuts' },
  { name: 'Ratnapura Market', lat: 6.6828, lng: 80.3990, range: '78,000–88,000', unit: 'per 1,000 nuts' },

  // Uva / Eastern (less production but trading exists)
  { name: 'Badulla Market', lat: 6.9934, lng: 81.0550, range: '85,000–95,000', unit: 'per 1,000 nuts' },
  { name: 'Monaragala Market', lat: 6.8728, lng: 81.3507, range: '80,000–90,000', unit: 'per 1,000 nuts' },
  { name: 'Ampara Market', lat: 7.2917, lng: 81.6730, range: '80,000–90,000', unit: 'per 1,000 nuts' },

  // Northern (limited but included for coverage)
  { name: 'Anuradhapura Market', lat: 8.3114, lng: 80.4037, range: '80,000–90,000', unit: 'per 1,000 nuts' },
  { name: 'Jaffna Market', lat: 9.6615, lng: 80.0255, range: '85,000–95,000', unit: 'per 1,000 nuts' },
];

// Haversine distance in km
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNearestMarket(lat, lng) {
  return SL_MARKETS.map(m => ({ ...m, distance: haversine(lat, lng, m.lat, m.lng) }))
    .sort((a, b) => a.distance - b.distance)[0];
}

function getFarmingTip(weather) {
  if (!weather || !weather.weather) return null;
  const id = weather.weather[0]?.id;
  const temp = weather.main?.temp;
  const humidity = weather.main?.humidity;

  if (id >= 200 && id < 300) return { icon: '⛈️', tip: 'Severe storm alert - avoid field work today.', color: 'rose' };
  if (id >= 500 && id < 600) return { icon: '🌧️', tip: 'Rainy conditions - check for waterlogging near coconut roots.', color: 'blue' };
  if (humidity > 85)          return { icon: '💧', tip: 'High humidity - monitor for fungal disease risk on fronds.', color: 'indigo' };
  if (temp > 35)              return { icon: '🌡️', tip: 'Heat stress risk - ensure adequate irrigation for young palms.', color: 'amber' };
  if (id >= 800 && id <= 801) return { icon: '☀️', tip: 'Clear skies - ideal conditions for harvesting today.', color: 'emerald' };
  return { icon: '🌤️', tip: 'Moderate conditions - good day for general farm work.', color: 'slate' };
}

function getWeatherIcon(id) {
  if (!id) return '🌡️';
  if (id >= 200 && id < 300) return '⛈️';
  if (id >= 300 && id < 400) return '🌦️';
  if (id >= 500 && id < 600) return '🌧️';
  if (id >= 600 && id < 700) return '❄️';
  if (id === 800) return '☀️';
  if (id === 801) return '🌤️';
  if (id <= 804) return '☁️';
  return '🌡️';
}

const PriceTip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-xl">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-black text-indigo-700">
          Rs. {payload[0].value.toFixed(2)} <span className="text-sm font-bold text-slate-400">/ nut</span>
        </p>
        {payload[0].payload.largeNutMin && (
          <p className="text-xs text-slate-500 mt-1">
            Large: Rs. {payload[0].payload.largeNutMin}–{payload[0].payload.largeNutMax}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const FarmIntelligence = () => {
  const [currentPrice, setCurrentPrice]   = useState(null);
  const [priceHistory, setPriceHistory]   = useState([]);
  
  const [lands, setLands]                 = useState([]);
  const [selectedLand, setSelectedLand]   = useState(null);
  const [weather, setWeather]             = useState(null);
  const [nearestMarket, setNearestMarket] = useState(null);
  const [locationError, setLocationError] = useState(null);
  
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingPrice, setLoadingPrice]   = useState(true);

  useEffect(() => {
    // Fetch current price & history
    axios.get('/api/financial/market-price')
      .then(r => setCurrentPrice(r.data))
      .catch(console.error)
      .finally(() => setLoadingPrice(false));

    axios.get('/api/financial/market-price/history')
      .then(r => setPriceHistory(r.data || []))
      .catch(console.error);

    // Fetch Lands
    const fetchLands = async () => {
      const farmerId = sessionStorage.getItem('userId');
      if (!farmerId) return;
      try {
        const response = await landAPI.getAll(farmerId);
        const landData = response.data.content || response.data || [];
        setLands(landData);
        if (landData.length > 0) {
          setSelectedLand(landData[0]);
        } else {
          setSelectedLand({ id: 'default', locationName: 'Kurunegala', district: 'Kurunegala' });
        }
      } catch (err) {
        setSelectedLand({ id: 'default', locationName: 'Kurunegala', district: 'Kurunegala' });
      }
    };
    fetchLands();
  }, []);

  // Fetch weather when land selection changes
  useEffect(() => {
    if (selectedLand) {
      setLoadingWeather(true);
      setLocationError(null);
      const location = selectedLand.district || selectedLand.locationName;
      
      weatherAPI.getCurrent(location)
        .then(r => {
           // We might get a wrapper from backend, let's extract
           const weatherData = r.data || r;
           if (weatherData.error) {
             setLocationError(weatherData.error);
             setWeather(null);
           } else {
             setWeather(weatherData);
             if (weatherData.coord && weatherData.coord.lat) {
               setNearestMarket(getNearestMarket(weatherData.coord.lat, weatherData.coord.lon));
             }
           }
        })
        .catch(() => setLocationError('Weather data unavailable.'))
        .finally(() => setLoadingWeather(false));
    }
  }, [selectedLand]);

  const tip = getFarmingTip(weather);
  const weatherId = weather?.weather?.[0]?.id;

  // Week-over-week change
  const priceChange = priceHistory.length >= 2
    ? ((priceHistory[priceHistory.length - 1].averagePrice - priceHistory[priceHistory.length - 2].averagePrice) /
       priceHistory[priceHistory.length - 2].averagePrice * 100).toFixed(1)
    : null;

  return (
    <div className="space-y-8 pb-10 animate-fade-in">

      {/* Top Row — Weather + Market Prices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Weather Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[32px] p-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>

          <div className="flex justify-between items-center mb-4 relative z-10">
            <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Live Weather</p>
            {/* Land Selection Dropdown */}
            <div className="relative group/select flex items-center space-x-1">
              <span className="material-symbols-outlined text-white/30 text-[14px]">location_on</span>
              <div className="relative">
                <select 
                  className="bg-white/5 border border-white/10 text-[9px] font-bold py-1.5 px-3 rounded-lg appearance-none pr-8 cursor-pointer hover:bg-white/10 transition-colors uppercase tracking-wider outline-none max-w-[120px] truncate custom-select-arrow"
                  value={selectedLand?.id || 'default'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'default') {
                      setSelectedLand({ id: 'default', locationName: 'Kurunegala', district: 'Kurunegala' });
                    } else {
                      const land = lands.find(l => String(l.id) === String(val));
                      if (land) setSelectedLand(land);
                    }
                  }}
                >
                  {lands.length > 0 ? (
                    lands.map(land => (
                      <option key={land.id} value={land.id} className="bg-[#242b3d] text-white py-2">{land.locationName}</option>
                    ))
                  ) : (
                    <option value="default" className="bg-[#242b3d] text-white py-2">Kurunegala</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {loadingWeather ? (
            <div className="flex items-center space-x-3 mt-4">
              <span className="material-symbols-outlined animate-spin text-white/50">autorenew</span>
              <p className="text-white/60 text-sm font-bold">Loading local weather…</p>
            </div>
          ) : locationError ? (
            <div className="mt-4">
              <p className="text-white/70 font-bold text-sm">{locationError}</p>
            </div>
          ) : weather && weather.main ? (
            <>
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-6xl">{getWeatherIcon(weatherId)}</span>
                <div>
                  <p className="text-5xl font-black tracking-tighter">{Math.round(weather.main.temp)}°C</p>
                  <p className="text-white/70 font-bold capitalize mt-1">{weather.weather[0].description}</p>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-widest">{weather.name}, Sri Lanka</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Humidity', val: `${weather.main.humidity}%`, icon: 'water_drop' },
                  { label: 'Wind', val: `${weather.wind.speed} m/s`, icon: 'air' },
                  { label: 'Feels Like', val: `${Math.round(weather.main.feels_like)}°C`, icon: 'thermometer' },
                ].map(s => (
                  <div key={s.label} className="bg-white/10 rounded-2xl p-3 text-center">
                    <span className="material-symbols-outlined text-white/60 text-sm block mb-1">{s.icon}</span>
                    <p className="text-white font-black text-sm">{s.val}</p>
                    <p className="text-white/50 text-[9px] uppercase tracking-wider mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>

        {/* Coconut Price Card */}
        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-50 rounded-bl-[80px] opacity-50 -z-10"></div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6">Live Coconut Price · CDA</p>

          {loadingPrice ? (
            <div className="flex items-center space-x-3 py-8">
              <span className="material-symbols-outlined animate-spin text-indigo-300">autorenew</span>
              <p className="text-slate-400 text-sm font-bold">Fetching from CDA…</p>
            </div>
          ) : currentPrice ? (
            <>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Average Price</p>
                  <p className="text-5xl font-black text-indigo-700 tracking-tighter">
                    Rs. {currentPrice.average?.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">per nut · {currentPrice.date}</p>
                </div>
                {priceChange !== null && (
                  <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-full ${parseFloat(priceChange) >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'}`}>
                    <span className="material-symbols-outlined text-[16px]">
                      {parseFloat(priceChange) >= 0 ? 'trending_up' : 'trending_down'}
                    </span>
                    <span className="text-xs font-black">{priceChange > 0 ? '+' : ''}{priceChange}%</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Large Nut', min: currentPrice.largeMin, max: currentPrice.largeMax, color: 'indigo' },
                  { label: 'Small Nut', min: currentPrice.smallMin, max: currentPrice.smallMax, color: 'amber' },
                ].map(p => (
                  <div key={p.label} className={`bg-${p.color}-50 rounded-2xl p-4`}>
                    <p className={`text-[9px] font-bold text-${p.color}-400 uppercase tracking-widest mb-1`}>{p.label}</p>
                    <p className={`text-lg font-black text-${p.color}-700`}>
                      Rs. {p.min?.toFixed(0)}–{p.max?.toFixed(0)}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-sm font-bold py-8">Could not fetch market price.</p>
          )}
        </div>
      </div>

      {/* Farming Tip + Nearest Market Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Farming Tip */}
        {tip && (
          <div className={`bg-${tip.color}-50 border border-${tip.color}-100 rounded-[28px] p-6 flex items-start space-x-4`}>
            <div className={`w-12 h-12 rounded-2xl bg-${tip.color}-100 flex items-center justify-center text-2xl shrink-0`}>
              {tip.icon}
            </div>
            <div>
              <p className={`text-[9px] font-bold text-${tip.color}-400 uppercase tracking-widest mb-1`}>Today's Farming Tip</p>
              <p className={`text-sm font-bold text-${tip.color}-800 leading-relaxed`}>{tip.tip}</p>
            </div>
          </div>
        )}

        {/* Nearest Market */}
        <div className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm flex items-start space-x-4 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-50 rounded-full opacity-50"></div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-emerald-600">location_on</span>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nearest Coconut Market</p>
            {nearestMarket ? (
              <>
                <p className="text-base font-black text-slate-900">{nearestMarket.name}</p>
                <p className="text-sm font-bold text-emerald-600 mt-1">
                  {nearestMarket.distance.toFixed(1)} km away
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Farm-gate: Rs. {nearestMarket.range} {nearestMarket.unit}
                </p>
              </>
            ) : locationError ? (
              <p className="text-sm text-slate-400 font-bold">Location data unavailable</p>
            ) : (
              <p className="text-sm text-slate-400 font-bold">Loading market data…</p>
            )}
          </div>
        </div>
      </div>

      {/* Price History Chart */}
      <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-slate-50 pb-4 mb-8">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-indigo-600 text-[18px]">show_chart</span>
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight leading-none">Price Trend</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Average price per nut · Last 12 weeks
            </p>
          </div>
        </div>

        <div style={{ height: 280 }}>
          {priceHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="weekLabel"
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }}
                  axisLine={false} tickLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={v => `${v}`}
                />
                <Tooltip content={<PriceTip />} />
                {currentPrice?.average && (
                  <ReferenceLine
                    y={currentPrice.average}
                    stroke="#10b981"
                    strokeDasharray="5 3"
                    label={{ value: 'Current', position: 'insideTopRight', fontSize: 10, fontWeight: 700, fill: '#10b981' }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="averagePrice"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#4f46e5', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-300">
              <div className="text-center">
                <span className="material-symbols-outlined text-5xl block mb-2">show_chart</span>
                <p className="text-sm font-bold text-slate-400">Loading price history…</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default FarmIntelligence;
