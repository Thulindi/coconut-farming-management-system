import React, { useState, useEffect } from 'react';
import { weatherAPI } from '../../api';

const WeatherWidget = ({ city = "Colombo" }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const response = await weatherAPI.getCurrent(city);
        setWeather(response.data);
      } catch (err) {
        setError("Could not load weather data.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city]);

  if (loading) return <div className="p-4 bg-white rounded shadow text-gray-500">Loading Weather...</div>;
  if (error) return <div className="p-4 bg-white rounded shadow text-red-500">{error}</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-bold mb-2">Weather - {weather.name || city}</h3>
      {weather && (
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-3xl font-semibold">{weather.main?.temp}°C</p>
            <p className="text-sm text-gray-500 capitalize">{weather.weather?.[0]?.description}</p>
          </div>
          <div className="text-sm text-gray-600">
            <p>Humidity: {weather.main?.humidity}%</p>
            <p>Wind: {weather.wind?.speed} m/s</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
