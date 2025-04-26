"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { useSupply } from "../hooks/useFirebaseData"

export default function LowStockAlert({ partsData }) {
  const { data: supplyData, loading: supplyLoading } = useSupply()
  const [lowStockItems, setLowStockItems] = useState([])

  useEffect(() => {
    if (partsData && partsData.length > 0 && supplyData && supplyData.length > 0) {
      // Find parts with quantity below min_stock
      const lowStock = partsData
        .filter((part) => part.quantity < part.min_stock)
        .map((part) => {
          // Find supplier info for this part
          const supplierInfo = supplyData.find((supply) => {
            // Extract part_id from the composite key (e.g., "SupA_P303" -> "P303")
            const underscoreIndex = supply.id.indexOf("_")
            const supplyPartId = underscoreIndex > 0 ? supply.id.substring(underscoreIndex + 1) : ""
            return supplyPartId === part.id
          })

          // Extract supplier_id from the composite key
          let supplierId = "Unknown"
          if (supplierInfo) {
            const underscoreIndex = supplierInfo.id.indexOf("_")
            supplierId = underscoreIndex > 0 ? supplierInfo.id.substring(0, underscoreIndex) : supplierInfo.id
          }

          return {
            id: part.id,
            name: part.part_name || `Part ${part.id}`,
            currentStock: part.quantity,
            minStock: part.min_stock,
            supplier: supplierId,
            leadTime: supplierInfo?.lead_time_days || 0,
          }
        })

      setLowStockItems(lowStock)
    }
  }, [partsData, supplyData])

  if (lowStockItems.length === 0) {
    return <p className="text-gray-400">No low stock items found.</p>
  }

  return (
    <div className="space-y-4">
      {lowStockItems.map((item) => (
        <div
          key={item.id}
          className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-amber-900/20 border border-amber-800/30 rounded-lg"
        >
          <div className="flex items-start md:items-center mb-3 md:mb-0">
            <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5 md:mt-0" />
            <div>
              <h3 className="font-medium text-white">{item.name}</h3>
              <p className="text-sm text-gray-400">
                ID: {item.id} | Supplier: {item.supplier}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6">
            <div className="bg-gray-800 px-3 py-1.5 rounded-md text-sm">
              <span className="text-gray-400">Current:</span>
              <span className="ml-1 font-medium text-red-400">{item.currentStock}</span>
            </div>
            <div className="bg-gray-800 px-3 py-1.5 rounded-md text-sm">
              <span className="text-gray-400">Min:</span>
              <span className="ml-1 font-medium text-white">{item.minStock}</span>
            </div>
            <div className="bg-gray-800 px-3 py-1.5 rounded-md text-sm">
              <span className="text-gray-400">Lead time:</span>
              <span className="ml-1 font-medium text-white">{item.leadTime} days</span>
            </div>

            <button className="flex items-center text-sm text-amber-400 hover:text-amber-300 transition-colors">
              Order now
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
