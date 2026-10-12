import React, { useRef, useState, useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, useMap, Marker, Polygon, Popup } from 'react-leaflet';
import { area, polygon } from '@turf/turf';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import leaflet-draw for side effects (adds classes to L)
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';

import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for leaflet internal icons if missing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: iconMarker,
  shadowUrl: iconShadow,
});

// Manual Drawing Component to replace the broken react-leaflet-draw wrapper
const DrawingComponent = ({ onCreated, onDeleted, featureGroupRef }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !featureGroupRef.current) return;

    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        rectangle: false,
        circle: false,
        circlemarker: false,
        marker: false,
        polyline: false,
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e1e100',
            message: '<strong>Error:</strong> shape edges cannot cross!'
          },
          shapeOptions: {
            color: '#2c4d3f', // Branding color
            weight: 3,
            fillOpacity: 0.2
          }
        }
      },
      edit: {
        featureGroup: featureGroupRef.current,
        remove: true
      }
    });

    map.addControl(drawControl);

    const handleCreated = (e) => {
      onCreated(e);
    };

    const handleDeleted = (e) => {
      onDeleted(e);
    };

    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.DELETED, handleDeleted);

    return () => {
      map.removeControl(drawControl);
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.DELETED, handleDeleted);
    };
  }, [map, onCreated, onDeleted, featureGroupRef]);

  return null;
};

// Helper component to handle map centering/zooming programmatically
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  return null;
};

const MapAreaSelector = ({ 
  onAreaCalculated, 
  center = [7.8731, 80.7718], 
  zoom = 7,
  initialPosition = null,
  isReadOnly = false
}) => {
  const featureGroupRef = useRef();

  const handleCreated = (e) => {
    if (isReadOnly) return;
    const { layer } = e;
    const drawnItems = featureGroupRef.current;
    
    // Clear previous drawings so only one polygon exists
    drawnItems.eachLayer((l) => {
      if (l !== layer) {
        drawnItems.removeLayer(l);
      }
    });

    // Add the new layer to the feature group
    drawnItems.addLayer(layer);

    if (layer instanceof L.Polygon) {
      const latLngs = layer.getLatLngs()[0];
      
      // Convert to GeoJSON format for Turf.js (lon, lat)
      const coordinates = latLngs.map(latLng => [latLng.lng, latLng.lat]);
      // Close the polygon by repeating the first coordinate at the end
      if (coordinates.length > 0) {
        coordinates.push([...coordinates[0]]);
      }

      try {
        const poly = polygon([coordinates]);
        const areaSqMeters = area(poly);
        const areaAcres = areaSqMeters * 0.000247105;

        // Take the first point as the general GPS location
        const centerLat = latLngs[0].lat;
        const centerLng = latLngs[0].lng;

        // Send to parent component
        onAreaCalculated({
          areaInAcres: areaAcres.toFixed(2),
          latitude: centerLat.toFixed(6),
          longitude: centerLng.toFixed(6)
        });
      } catch (err) {
        console.error("Error calculating area:", err);
      }
    }
  };

  const handleDeleted = () => {
    if (isReadOnly) return;
    onAreaCalculated({ areaInAcres: '', latitude: '', longitude: '' });
  };

  return (
    <div style={{ height: '400px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <MapController center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FeatureGroup ref={featureGroupRef}>
          {!isReadOnly && (
            <DrawingComponent 
              onCreated={handleCreated} 
              onDeleted={handleDeleted}
              featureGroupRef={featureGroupRef}
            />
          )}
        </FeatureGroup>

        {/* Show marker if initialPosition is provided (for view mode) */}
        {initialPosition && initialPosition.lat && initialPosition.lng && (
          <Marker position={[initialPosition.lat, initialPosition.lng]}>
            {initialPosition.label && (
              <Popup>{initialPosition.label}</Popup>
            )}
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapAreaSelector;
