/* -------------------------------------------------------------------
   src/pages/Map.jsx         — MOCK DATA VERSION
   ------------------------------------------------------------------- */
   "use client"

   import { useEffect, useMemo, useRef, useState } from "react"
   import Map from "react-map-gl/maplibre"
   import maplibregl from "maplibre-gl"
   import "maplibre-gl/dist/maplibre-gl.css"
   
   import Sidebar from "../components/Sidebar"
   import Header from "../components/Header"
   import LoadingSpinner from "../components/LoadingSpinner"
   import RoutePopup from "../components/RoutePopup"
   
   /* ═══════════════════════════════════════════════════════════════════
      1.  MOCK DATA  — tweak as you like
      ═══════════════════════════════════════════════════════════════════ */
   const WAREHOUSES = [
     { id: "WH_LAX", name: "Los Angeles DC", coords: [-118.255, 34.052] },
     { id: "WH_ORD", name: "Chicago DC", coords: [-87.907, 41.974] },
     { id: "WH_FRA", name: "Frankfurt Hub", coords: [8.57, 50.033] },
   ]
   
   const SUPPLIERS = [
     { id: "SupA", name: "Shenzhen Factory", coords: [114.058, 22.543] },
     { id: "SupB", name: "Taipei Fab", coords: [121.565, 25.034] },
     { id: "SupC", name: "Berlin Plastics", coords: [13.405, 52.52] },
     { id: "SupD", name: "São Paulo Foundry", coords: [-46.633, -23.55] },
   ]
   
   /* three purchase orders tie them together */
   const ORDERS = [
     {
       id: "O1001",
       warehouse_id: "WH_LAX",
       supplier_id: "SupA",
       status: "ordered",
       priority: "high",
       eta: "2025-05-15",
       distance: "11,825 km",
     },
     {
       id: "O1002",
       warehouse_id: "WH_ORD",
       supplier_id: "SupB",
       status: "ordered",
       priority: "low",
       eta: "2025-05-22",
       distance: "12,540 km",
     },
     {
       id: "O1003",
       warehouse_id: "WH_FRA",
       supplier_id: "SupC",
       status: "ordered",
       priority: "low",
       eta: "2025-05-10",
       distance: "545 km",
     },
   ]
   
   /* ═══════════════════════════════════════════════════════════════════
      2.  INITIAL VIEW
      ═══════════════════════════════════════════════════════════════════ */
   const INITIAL_VIEW_STATE = { longitude: -30, latitude: 25, zoom: 1.7, pitch: 0, bearing: 0 }
   
   /* ═══════════════════════════════════════════════════════════════════
      3.  REACT COMPONENT
      ═══════════════════════════════════════════════════════════════════ */
   export default function MapPage() {
     /* pretend to "load" */
     const [loading, setLoading] = useState(true)
     useEffect(() => {
       const t = setTimeout(() => setLoading(false), 500)
       return () => clearTimeout(t)
     }, [])
   
     /* State for the custom popup */
     const [popupInfo, setPopupInfo] = useState(null)
     const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
   
     /* build GeoJSON once (memo) */
     const { nodesGeoJSON, arcsGeoJSON } = useMemo(() => {
       const nodeFeatures = [
         ...WAREHOUSES.map((w) => ({
           type: "Feature",
           geometry: { type: "Point", coordinates: w.coords },
           properties: { type: "warehouse", name: w.name, id: w.id },
         })),
         ...SUPPLIERS.map((s) => ({
           type: "Feature",
           geometry: { type: "Point", coordinates: s.coords },
           properties: { type: "supplier", name: s.name, id: s.id },
         })),
       ]
   
       const arcFeatures = ORDERS.map((o) => {
         const wh = WAREHOUSES.find((w) => w.id === o.warehouse_id)
         const sp = SUPPLIERS.find((s) => s.id === o.supplier_id)
         return wh && sp
           ? {
               type: "Feature",
               geometry: { type: "LineString", coordinates: [wh.coords, sp.coords] },
               properties: {
                 urgent: o.priority === "high",
                 warehouse_id: wh.id,
                 warehouse_name: wh.name,
                 supplier_id: sp.id,
                 supplier_name: sp.name,
                 part_id: o.id?.replace("O", "P") ?? "P-???",
                 order_id: o.id,
                 priority: o.priority,
                 eta: o.eta,
                 distance: o.distance,
               },
             }
           : null
       }).filter(Boolean)
   
       return {
         nodesGeoJSON: { type: "FeatureCollection", features: nodeFeatures },
         arcsGeoJSON: { type: "FeatureCollection", features: arcFeatures },
       }
     }, [])
   
     /* map refs */
     const mapRef = useRef(null)
     const [mapReady, setMapReady] = useState(false)
     const mapContainerRef = useRef(null)
   
     /* update data when map ready */
     useEffect(() => {
       if (!mapReady) return
       const map = mapRef.current.getMap()
       map.getSource("nodes")?.setData(nodesGeoJSON)
       map.getSource("arcs")?.setData(arcsGeoJSON)
     }, [mapReady, nodesGeoJSON, arcsGeoJSON])
   
     /* UI */
     return (
       <div className="flex h-screen bg-gray-950 text-white">
         <Sidebar />
         <div className="flex-1 flex flex-col md:ml-64">
           <Header title="Supply Chain Globe" />
           <main className="flex-1 overflow-auto p-6">
             {loading ? (
               <div className="flex items-center justify-center h-full">
                 <LoadingSpinner />
               </div>
             ) : (
               <div ref={mapContainerRef} style={{ position: "relative", width: "100%", height: "80vh" }}>
                 <Map
                   ref={mapRef}
                   mapLib={maplibregl}
                   logoPosition={null}
                   attributionControl={false}
                   mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                   initialViewState={INITIAL_VIEW_STATE}
                   style={{ width: "100%", height: "100%" }}
                   onLoad={(e) => {
                     const map = e.target
                     window.supplyGlobe = map // debug in DevTools
                     map.setProjection({ type: "globe" })
   
                     /* --- add sources + layers ONCE --- */
                     map.addSource("nodes", { type: "geojson", data: { type: "FeatureCollection", features: [] } })
                     map.addLayer({
                       id: "node-circles",
                       type: "circle",
                       source: "nodes",
                       paint: {
                         "circle-radius": ["case", ["==", ["get", "type"], "warehouse"], 6, 4],
                         "circle-color": ["case", ["==", ["get", "type"], "warehouse"], "#24ffd1", "#ffb400"],
                         "circle-opacity": 0.9,
                       },
                     })
   
                     map.addSource("arcs", { type: "geojson", data: { type: "FeatureCollection", features: [] } })
                     map.addLayer({
                       id: "arc-lines",
                       type: "line",
                       source: "arcs",
                       paint: {
                         "line-width": ["case", ["==", ["get", "urgent"], true], 2.5, 1.2],
                         "line-color": ["case", ["==", ["get", "urgent"], true], "#ff008c", "#00c8ff"],
                         "line-opacity": 0.8,
                       },
                     })
   
                     /* ── interactivity ─────────────────────────────── */
                     // 1. pointer cursor on hover
                     map.on("mouseenter", "arc-lines", () => {
                       map.getCanvas().style.cursor = "pointer"
                     })
                     map.on("mouseleave", "arc-lines", () => {
                       map.getCanvas().style.cursor = ""
                     })
   
                     // 2. handle click on arc lines
                     map.on("click", "arc-lines", (ev) => {
                       // Get the properties from the feature
                       const properties = ev.features[0].properties
   
                       // Convert the point to pixel coordinates
                       const pixelPoint = map.project(ev.lngLat)
   
                       // Set the popup info and position
                       setPopupInfo(properties)
                       setPopupPosition({
                         x: pixelPoint.x,
                         y: pixelPoint.y,
                       })
                     })
   
                     // Close popup when clicking elsewhere on the map
                     map.on("click", (e) => {
                       const features = map.queryRenderedFeatures(e.point, {
                         layers: ["arc-lines"],
                       })
   
                       if (features.length === 0) {
                         setPopupInfo(null)
                       }
                     })
   
                     setMapReady(true) // now update-effect will push data
                   }}
                 />
   
                 {/* Render the custom popup component */}
                 {popupInfo && <RoutePopup data={popupInfo} position={popupPosition} onClose={() => setPopupInfo(null)} />}
               </div>
             )}
           </main>
         </div>
       </div>
     )
   }
   