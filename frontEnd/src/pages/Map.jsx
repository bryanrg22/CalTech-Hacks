"use client";

import React, { useState, useEffect, useRef } from "react";
import { Package, ShoppingCart, Truck, Users } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useParts, useOrders, useSales, useSupply } from "../hooks/useFirebaseData";
import LoadingSpinner from "../components/LoadingSpinner";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { Map as MapGL } from "react-map-gl/maplibre";

//test
// View settings for the globe
const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 20,
  zoom: 1.5,
  pitch: 30,
  bearing: 0
};

// Hard-coded supply chain routes
const SUPPLY_CHAIN_ROUTES = [
  {
    source: { name: "Los Angeles", coordinates: [-118.2437, 34.0522] },
    destination: { name: "Tokyo", coordinates: [139.6917, 35.6895] },
    volume: 250, 
    type: "import"
  },
  {
    source: { name: "Los Angeles", coordinates: [-118.2437, 34.0522] },
    destination: { name: "Singapore", coordinates: [103.8198, 1.3521] },
    volume: 180,
    type: "export"
  },
  {
    source: { name: "New York", coordinates: [-74.0060, 40.7128] },
    destination: { name: "London", coordinates: [-0.1278, 51.5074] },
    volume: 320,
    type: "export"
  },
  {
    source: { name: "Shanghai", coordinates: [121.4737, 31.2304] },
    destination: { name: "Los Angeles", coordinates: [-118.2437, 34.0522] },
    volume: 400,
    type: "export"
  },
  {
    source: { name: "Rotterdam", coordinates: [4.4777, 51.9244] },
    destination: { name: "New York", coordinates: [-74.0060, 40.7128] },
    volume: 150,
    type: "export"
  },
  {
    source: { name: "Mumbai", coordinates: [72.8777, 19.0760] },
    destination: { name: "Dubai", coordinates: [55.2708, 25.2048] },
    volume: 120,
    type: "export"
  },
  {
    source: { name: "Sao Paulo", coordinates: [-46.6333, -23.5505] },
    destination: { name: "Miami", coordinates: [-80.1918, 25.7617] },
    volume: 200,
    type: "export"
  },
  {
    source: { name: "Sydney", coordinates: [151.2093, -33.8688] },
    destination: { name: "Singapore", coordinates: [103.8198, 1.3521] },
    volume: 180,
    type: "export"
  }
];

export default function SupplyChainMap() {
  // Firebase hooks and stats logic 
  const { data: partsData, loading: partsLoading } = useParts();
  const { data: ordersData, loading: ordersLoading } = useOrders({ orderBy: { field: "order_date", direction: "desc" }, limit: 5 });
  const { data: salesData, loading: salesLoading } = useSales();
  const { data: suppliersData, loading: suppliersLoading } = useSupply();

  const [stats, setStats] = useState([
    { title: "Total Parts", value: "0", change: "0%", trend: "neutral", icon: Package, color: "emerald" },
    { title: "Active Orders", value: "0", change: "0%", trend: "neutral", icon: Truck, color: "blue" },
    { title: "Sales Orders", value: "0", change: "0%", trend: "neutral", icon: ShoppingCart, color: "purple" },
    { title: "Suppliers", value: "0", change: "0%", trend: "neutral", icon: Users, color: "amber" }
  ]);

  // Auto-rotation state
  const [autoRotate, setAutoRotate] = useState(true);
  const rotationIntervalRef = useRef(null);
  const mapRef = useRef(null);

  // Update stats when data loads
  useEffect(() => {
    if (!partsLoading && !ordersLoading && !salesLoading && !suppliersLoading) {
      const uniqueSuppliers = [...new Set(suppliersData.map(item => {
        const idx = item.id.indexOf("_");
        return idx > 0 ? item.id.substring(0, idx) : item.id;
      }))];

      const activeOrders = ordersData.filter(o => o.status === "ordered").length;
      setStats([
        { title: "Total Parts", value: partsData.length.toString(), change: "+12%", trend: "up", icon: Package, color: "emerald" },
        { title: "Active Orders", value: activeOrders.toString(), change: "-5%", trend: "down", icon: Truck, color: "blue" },
        { title: "Sales Orders", value: salesData.length.toString(), change: "+18%", trend: "up", icon: ShoppingCart, color: "purple" },
        { title: "Suppliers", value: uniqueSuppliers.length.toString(), change: "0%", trend: "neutral", icon: Users, color: "amber" }
      ]);
    }
  }, [partsData, ordersData, salesData, suppliersData, partsLoading, ordersLoading, salesLoading, suppliersLoading]);

  // Clean up rotation interval on unmount
  useEffect(() => {
    return () => {
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
        rotationIntervalRef.current = null;
      }
    };
  }, []);

  const isLoading = partsLoading || ordersLoading || salesLoading || suppliersLoading;

  // Function to create a curved line between two points
  function createArcLine(source, destination, steps = 100) {
    const coords = [];
    
    // Convert to radians
    const sourceRad = [source[0] * Math.PI / 180, source[1] * Math.PI / 180];
    const destRad = [destination[0] * Math.PI / 180, destination[1] * Math.PI / 180];
    
    // Calculate the great circle distance
    let d = Math.acos(
      Math.sin(sourceRad[1]) * Math.sin(destRad[1]) +
      Math.cos(sourceRad[1]) * Math.cos(destRad[1]) * Math.cos(sourceRad[0] - destRad[0])
    );
    
    // Check if points are nearly antipodal (opposite sides of the globe)
    if (Math.abs(d - Math.PI) < 0.00001) {
      // For antipodal points, we need a different approach
      const midLat = (source[1] + destination[1]) / 2;
      const midLng = (source[0] + destination[0] + 
        (Math.abs(source[0] - destination[0]) > 180 ? 360 : 0)) / 2;
      
      const mid = [midLng, midLat];
      
      // Create two arcs: source to mid, and mid to destination
      const firstHalf = createHalfArc(source, mid, steps / 2);
      const secondHalf = createHalfArc(mid, destination, steps / 2);
      
      return [...firstHalf, ...secondHalf];
    }
    
    // Handle the case where the route would go the long way around the globe
    // Check if the longitude difference is more than 180 degrees
    const rawLngDiff = Math.abs(source[0] - destination[0]);
    if (rawLngDiff > 180) {
      // Need to go the other way around the globe
      // We'll split this into two segments to ensure proper arc
      
      // Find a midpoint that crosses the date line
      let midLng;
      if (source[0] < destination[0]) {
        // source is west of destination, crossing east
        midLng = (source[0] - 180 + destination[0] + 180) / 2;
        if (midLng < -180) midLng += 360;
      } else {
        // source is east of destination, crossing west
        midLng = (source[0] + 180 + destination[0] - 180) / 2;
        if (midLng > 180) midLng -= 360;
      }
      
      const midLat = (source[1] + destination[1]) / 2;
      const mid = [midLng, midLat];
      
      // Create two arcs: source to mid, and mid to destination
      const firstHalf = createHalfArc(source, mid, steps / 2);
      const secondHalf = createHalfArc(mid, destination, steps / 2);
      
      return [...firstHalf, ...secondHalf];
    }
    
    // Standard case - create a simple arc
    return createHalfArc(source, destination, steps);
  }
  
  // Helper function to create a half arc between two points
  function createHalfArc(source, destination, steps) {
    const coords = [];
    
    // Convert to radians
    const sourceRad = [source[0] * Math.PI / 180, source[1] * Math.PI / 180];
    const destRad = [destination[0] * Math.PI / 180, destination[1] * Math.PI / 180];
    
    // Calculate the great circle distance
    const d = Math.acos(
      Math.sin(sourceRad[1]) * Math.sin(destRad[1]) +
      Math.cos(sourceRad[1]) * Math.cos(destRad[1]) * Math.cos(sourceRad[0] - destRad[0])
    );
    
    // Generate points along the curve
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      
      // Use spherical interpolation (slerp)
      const a = Math.sin((1 - t) * d) / Math.sin(d);
      const b = Math.sin(t * d) / Math.sin(d);
      
      // Calculate the interpolated point
      const x = a * Math.cos(sourceRad[1]) * Math.cos(sourceRad[0]) + b * Math.cos(destRad[1]) * Math.cos(destRad[0]);
      const y = a * Math.cos(sourceRad[1]) * Math.sin(sourceRad[0]) + b * Math.cos(destRad[1]) * Math.sin(destRad[0]);
      const z = a * Math.sin(sourceRad[1]) + b * Math.sin(destRad[1]);
      
      // Add some height using a sine curve to create an arc
      // The magnitude of the arc depends on the distance between points
      const height = Math.sin(Math.PI * t) * Math.min(0.7, d * 0.3);
      const magnitude = 1.0 + height * 0.5;
      
      const elevatedX = x * magnitude;
      const elevatedY = y * magnitude;
      const elevatedZ = z * magnitude;
      
      // Convert elevated point back to longitude/latitude
      const longitude = Math.atan2(elevatedY, elevatedX) * 180 / Math.PI;
      const latitude = Math.atan2(elevatedZ, Math.sqrt(elevatedX * elevatedX + elevatedY * elevatedY)) * 180 / Math.PI;
      
      coords.push([longitude, latitude]);
    }
    
    return coords;
  }

  // Add flow lines to the map once it's loaded
  const onMapLoad = (event) => {
    const map = event.target;
    
    // Set projection to globe
    map.setProjection('globe');
    
    // Force a style repaint to fully apply the globe projection
    map.once('style.load', () => {
      // Sometimes the globe projection needs an extra nudge to render properly
      map.setBearing(0.1);
      setTimeout(() => map.setBearing(0), 10);
    });
    
    // Start rotation if enabled
    if (autoRotate) {
      startRotation(map);
    }
    
    // Create layers for each route
    SUPPLY_CHAIN_ROUTES.forEach((route, index) => {
      const routeId = `route-${index}`;
      const sourceId = `source-${index}`;
      const destId = `dest-${index}`;
      
      // Create arc coordinates
      const arcCoords = createArcLine(route.source.coordinates, route.destination.coordinates);
      
      // Add source for route line
      map.addSource(routeId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: arcCoords
          }
        }
      });
      
      // Add route line layer
      map.addLayer({
        id: routeId,
        type: 'line',
        source: routeId,
        paint: {
          'line-color': route.type === 'export' ? '#4CAF50' : '#FF5252',
          'line-width': Math.max(2, route.volume / 100),
          'line-opacity': 0.8
        }
      });
      
      // Add source endpoint
      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {
            name: route.source.name
          },
          geometry: {
            type: 'Point',
            coordinates: route.source.coordinates
          }
        }
      });
      
      map.addLayer({
        id: sourceId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': 6,
          'circle-color': route.type === 'export' ? '#4CAF50' : '#FF5252',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF'
        }
      });
      
      // Add destination endpoint
      map.addSource(destId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {
            name: route.destination.name
          },
          geometry: {
            type: 'Point',
            coordinates: route.destination.coordinates
          }
        }
      });
      
      map.addLayer({
        id: destId,
        type: 'circle',
        source: destId,
        paint: {
          'circle-radius': 6,
          'circle-color': route.type === 'export' ? '#FF5252' : '#4CAF50',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF'
        }
      });
    });
  };

  // Toggle rotation
  const toggleRotation = () => {
    setAutoRotate(!autoRotate);
    
    if (!autoRotate) {
      if (mapRef.current) {
        const map = mapRef.current.getMap();
        startRotation(map);
      }
    } else {
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
        rotationIntervalRef.current = null;
      }
    }
  };

  // Start rotation animation
  const startRotation = (map) => {
    // Clear any existing interval
    if (rotationIntervalRef.current) {
      clearInterval(rotationIntervalRef.current);
    }
    
    // Set up rotation interval
    rotationIntervalRef.current = setInterval(() => {
      const currentCenter = map.getCenter();
      map.easeTo({
        center: [currentCenter.lng + 0.5, currentCenter.lat],
        duration: 300,
        easing: t => t
      });
    }, 300);
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header title="Supply Chain Map" />
        <main className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Stats cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4 flex items-center">
                    <div className={`p-3 rounded-md bg-${stat.color}-900 mr-4`}>
                      <stat.icon className={`text-${stat.color}-500`} size={24} />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">{stat.title}</p>
                      <div className="flex items-center">
                        <p className="text-2xl font-bold mr-2">{stat.value}</p>
                        <span className={`text-sm ${
                          stat.trend === 'up' ? 'text-green-500' : 
                          stat.trend === 'down' ? 'text-red-500' : 
                          'text-gray-400'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Map container */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="mb-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">Global Supply Chain Flow</h2>
                    <p className="text-gray-400">Visualizing import/export routes between major hubs</p>
                  </div>
                  <button 
                    className={`px-3 py-1 rounded-md ${autoRotate ? 'bg-red-600' : 'bg-blue-600'}`}
                    onClick={toggleRotation}
                  >
                    {autoRotate ? 'Pause Rotation' : 'Start Rotation'}
                  </button>
                </div>
                <div style={{ position: 'relative', width: '100%', height: '70vh', borderRadius: '0.5rem', overflow: 'hidden' }}>
                  <MapGL
                    ref={mapRef}
                    mapLib={maplibregl}
                    mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                    initialViewState={INITIAL_VIEW_STATE}
                    attributionControl={false}
                    onLoad={onMapLoad}
                    projection="globe"
                    terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
                    style={{ width: '100%', height: '100%' }}
                  />
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 right-4 bg-gray-900 bg-opacity-80 p-3 rounded-md">
                    <div className="text-sm mb-2 font-bold">Supply Chain Routes</div>
                    <div className="flex items-center mb-1">
                      <div className="w-4 h-2 bg-green-500 mr-2 rounded-sm"></div>
                      <span className="text-xs">Export</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-2 bg-red-500 mr-2 rounded-sm"></div>
                      <span className="text-xs">Import</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}