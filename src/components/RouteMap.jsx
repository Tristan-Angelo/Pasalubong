/**
 * RouteMap Component
 * 
 * Displays an interactive map showing the walking route between pickup (seller) 
 * and delivery (customer) locations using OpenStreetMap and Leaflet.
 * 
 * Features:
 * - Interactive map with zoom and pan
 * - Custom markers for pickup (green) and delivery (red) locations
 * - Automatic route calculation and display
 * - Distance and estimated walking time
 * - Responsive design for mobile devices
 * 
 * Props:
 * @param {Object} pickupLocation - {lat, lon, address} of pickup location
 * @param {Object} deliveryLocation - {lat, lon, address} of delivery location
 * @param {string} distance - Distance in kilometers
 * @param {number} estimatedTime - Estimated time in minutes
 */
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RouteMap = ({ pickupLocation, deliveryLocation, distance, estimatedTime }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !pickupLocation || !deliveryLocation) return;

    // Initialize map if not already initialized
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [pickupLocation.lat, pickupLocation.lon],
        13
      );

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }

    // Remove existing routing control if any
    if (routingControlRef.current) {
      mapInstanceRef.current.removeControl(routingControlRef.current);
    }

    // Create custom icons
    const pickupIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const deliveryIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Add routing control
    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(pickupLocation.lat, pickupLocation.lon),
        L.latLng(deliveryLocation.lat, deliveryLocation.lon)
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: '#6366f1', opacity: 0.8, weight: 5 }]
      },
      createMarker: function(i, waypoint, n) {
        const marker = L.marker(waypoint.latLng, {
          icon: i === 0 ? pickupIcon : deliveryIcon,
          draggable: false
        });
        
        if (i === 0) {
          marker.bindPopup('<b>📦 Pickup Location</b><br>Seller Address');
        } else {
          marker.bindPopup('<b>🏠 Delivery Location</b><br>Customer Address');
        }
        
        return marker;
      }
    }).addTo(mapInstanceRef.current);

    // Cleanup function
    return () => {
      if (routingControlRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeControl(routingControlRef.current);
      }
    };
  }, [pickupLocation, deliveryLocation]);

  return (
    <div className="space-y-4">
      {/* Route Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-600 font-medium">Distance</p>
          <p className="text-lg font-bold text-blue-900">{distance} km</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs text-green-600 font-medium">Est. Time</p>
          <p className="text-lg font-bold text-green-900">{estimatedTime} min</p>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border-2 border-gray-300 shadow-lg"
        style={{ zIndex: 1 }}
      />

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span className="text-gray-700">Pickup (Seller)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span className="text-gray-700">Delivery (Customer)</span>
        </div>
      </div>
    </div>
  );
};

export default RouteMap;