/* ------------------------------------------------------------------
   src/utils/withFakeGeo.js     (robust version)
   ------------------------------------------------------------------ */
   import { WAREHOUSES, SUPPLIERS } from "../data/geoLookup";

   /* helper ----------------------------------------------------------- */
   function pickWarehouseCoords(part, index = 0) {
     // Detect a warehouse key: "WH_" + first 3 letters of part_id
     const partId = typeof part.part_id === "string" ? part.part_id : "";
     const whKey  = "WH_" + partId.slice(0, 3).toUpperCase();  // e.g. "P30" → WH_P30
     return WAREHOUSES[whKey] ?? WAREHOUSES.WH_LAX;             // fall back to LAX
   }
   
   function pickSupplierCoords(supplier) {
     // Supplier IDs may look like "SupA_P301" – take the chunk before "_"
     const base = typeof supplier.supplier_id === "string"
       ? supplier.supplier_id.split("_")[0]
       : "";
     return SUPPLIERS[base] ?? SUPPLIERS.SupA;                  // fall back to Shenzhen
   }
   
   /* main ------------------------------------------------------------- */
   export function withFakeGeo(parts = [], supply = []) {
     /* 1️⃣  patch PART docs → warehouses */
     const partsFixed = parts.map((p, idx) => {
       if (p?.location?.lat != null && p?.location?.lon != null) return p; // already geo-tagged
   
       const [lon, lat] = pickWarehouseCoords(p, idx);
       return {
         ...p,
         location: {
           ...p.location,
           lat,
           lon,
           code: "WH_" + (p.part_id ?? idx)      // still give it a code
         }
       };
     });
   
     /* 2️⃣  patch SUPPLY docs → suppliers */
     const supplyFixed = supply.map((s) => {
       if (s?.lat != null && s?.lon != null) return s;          // already geo-tagged
   
       const [lon, lat] = pickSupplierCoords(s);
       return { ...s, lat, lon };
     });
   
     return { partsFixed, supplyFixed };
   }
   