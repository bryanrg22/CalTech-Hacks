"use client";

import React, { useState, useEffect, useRef } from "react";
import { Package, ShoppingCart, Truck, Users } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useParts, useOrders, useSales, useSupply } from "../hooks/useFirebaseData";
import LoadingSpinner from "../components/LoadingSpinner";
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { Map as RLMap } from "react-map-gl/maplibre";
import { ScatterplotLayer, ArcLayer } from "@deck.gl/layers";
import { MapboxOverlay } from "@deck.gl/mapbox";

// View settings for the globe
const INITIAL_VIEW_STATE = {
  longitude: -50,
  latitude: 20,
  zoom: 2,
  pitch: 0,
  bearing: 0
};

export default function Map() {
  // Points to render on the globe
  const sampleData = [
    { position: [-90, 20], size: 1000 },
    { position: [0, 0], size: 500 },
    { position: [90, -20], size: 2000 }
  ];

  // Routes between those points
  const routeData = [
    { source: [-90, 20], target: [0, 0] },
    { source: [0, 0],    target: [90, -20] }
  ];

  // Overlay that paints scatter + arcs on top of the MapLibre globe
  const overlay = new MapboxOverlay({
    beforeId: undefined,
    interleaved: true,
    layers: [
      new ScatterplotLayer({
        id: 'scatter-layer',
        data: sampleData,
        getPosition: d => d.position,
        getRadius:   d => d.size * 0.01,
        getFillColor:[200,200,200],
        pickable:    false
      }),
      new ArcLayer({
        id: 'arc-layer',
        data: routeData,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: [200, 200, 200],
        getTargetColor: [200, 200, 200],
        getWidth: 2,
        pickable: false,
        parameters: { depthTest: false }
      })
    ]
  });

  // Firebase hooks and stats logic remain unchanged
  const { data: partsData,     loading: partsLoading     } = useParts();
  const { data: ordersData,    loading: ordersLoading    } = useOrders({ orderBy: { field: "order_date", direction: "desc" }, limit: 5 });
  const { data: salesData,     loading: salesLoading     } = useSales();
  const { data: suppliersData, loading: suppliersLoading } = useSupply();

  const [stats, setStats] = useState([
    { title: "Total Parts",   value: "0", change: "0%", trend: "neutral", icon: Package,        color: "emerald" },
    { title: "Active Orders", value: "0", change: "0%", trend: "neutral", icon: Truck,          color: "blue"    },
    { title: "Sales Orders",  value: "0", change: "0%", trend: "neutral", icon: ShoppingCart, color: "purple"  },
    { title: "Suppliers",     value: "0", change: "0%", trend: "neutral", icon: Users,          color: "amber"   }
  ]);

  useEffect(() => {
    if (!partsLoading && !ordersLoading && !salesLoading && !suppliersLoading) {
      const uniqueSuppliers = [...new Set(suppliersData.map(item => {
        const idx = item.id.indexOf("_");
        return idx > 0 ? item.id.substring(0, idx) : item.id;
      }))];

      const activeOrders = ordersData.filter(o => o.status === "ordered").length;
      setStats([
        { title: "Total Parts",   value: partsData.length.toString(),        change: "+12%", trend: "up",    icon: Package,        color: "emerald" },
        { title: "Active Orders", value: activeOrders.toString(),            change: "-5%",  trend: "down", icon: Truck,          color: "blue"    },
        { title: "Sales Orders",  value: salesData.length.toString(),         change: "+18%", trend: "up",    icon: ShoppingCart, color: "purple"  },
        { title: "Suppliers",     value: uniqueSuppliers.length.toString(),   change: "0%",   trend: "neutral",icon: Users,          color: "amber"   }
      ]);
    }
  }, [partsData, ordersData, salesData, suppliersData, partsLoading, ordersLoading, salesLoading, suppliersLoading]);

  const isLoading = partsLoading || ordersLoading || salesLoading || suppliersLoading;
  const mapRef = useRef(null);

  return (
    <div className="flex h-screen bg-gray-950 text-white">
            <style>{`.deckgl-overlay { z-index: 1000 !important; }`}</style>
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        <Header title="Supply Chain Globe" />
        <main className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : (
            <div style={{ position: 'relative', width: '100%', height: '80vh' }}>
              <RLMap
                ref={mapRef}
                attributionControl={false}
                logoPosition={null}
                reuseMaps
                initialViewState={INITIAL_VIEW_STATE}
                mapLib={maplibregl}
                mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                style={{ width: '100%', height: '100%' }}
                onLoad={() => {
                  const map = mapRef.current.getMap();
                  map.setProjection({ type: 'globe' });
                  map.addControl(overlay);
                }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
