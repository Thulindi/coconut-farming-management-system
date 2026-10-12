import React, { useState, useEffect } from 'react';
import { gpsAPI } from '../../api';

const GpsWidget = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await gpsAPI.getLocations();
        setLocations(response.data);
      } catch (err) {
        setError("Could not load GPS locations.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  if (loading) return <div className="p-4 bg-white rounded shadow text-gray-500">Loading GPS...</div>;
  if (error) return <div className="p-4 bg-white rounded shadow text-red-500">{error}</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-bold mb-2">Tracked Locations</h3>
      {locations.length === 0 ? (
        <p className="text-sm text-gray-500">No tracked locations found.</p>
      ) : (
        <ul className="space-y-2">
          {locations.map((loc) => (
            <li key={loc.id || loc.boundaryCoordinates} className="text-sm p-2 bg-gray-50 rounded">
              <span className="font-semibold">{loc.name || 'Plantation Area'}: </span> 
              <span>Lat: {loc.latitude || 'N/A'}, Lon: {loc.longitude || 'N/A'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GpsWidget;
