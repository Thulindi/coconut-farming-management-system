import L from 'leaflet';
import 'leaflet-draw';

// This shim solves the "Missing Export Default" error in Vite
// by explicitly exporting the Draw object from the Leaflet instance.
export default L.Draw;
