"use client"

import { useState, useEffect } from "react"

export default function SupplierReliabilityChart({ suppliersData }) {
  const [suppliers, setSuppliers] = useState([])

  useEffect(() => {
    if (suppliersData && suppliersData.length > 0) {
      // Extract unique supplier IDs and calculate average reliability
      const supplierMap = {}

      suppliersData.forEach((item) => {
        // Extract supplier_id from the composite key (e.g., "SupA_P303" -> "SupA")
        const underscoreIndex = item.id.indexOf("_")
        const supplierId = underscoreIndex > 0 ? item.id.substring(0, underscoreIndex) : item.id

        if (!supplierMap[supplierId]) {
          supplierMap[supplierId] = {
            id: supplierId,
            name: `Supplier ${supplierId.replace("Sup", "")}`, // Format name (SupA -> Supplier A)
            reliabilitySum: item.reliability_rating || 0,
            count: 1,
          }
        } else {
          supplierMap[supplierId].reliabilitySum += item.reliability_rating || 0
          supplierMap[supplierId].count += 1
        }
      })

      // Calculate average reliability for each supplier
      const supplierList = Object.values(supplierMap).map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
        reliability: supplier.reliabilitySum / supplier.count,
      }))

      // Sort by reliability (highest first)
      supplierList.sort((a, b) => b.reliability - a.reliability)

      setSuppliers(supplierList)
    }
  }, [suppliersData])

  if (suppliers.length === 0) {
    return <p className="text-gray-400">No supplier data available.</p>
  }

  return (
    <div className="space-y-4">
      {suppliers.map((supplier) => (
        <div key={supplier.id} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{supplier.name}</span>
            <span className="text-xs text-gray-400">{(supplier.reliability * 100).toFixed(0)}% Reliability</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${supplier.reliability * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
