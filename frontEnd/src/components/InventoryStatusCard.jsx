"use client"

import { useState, useEffect } from "react"

export default function InventoryStatusCard({ partsData }) {
  const [inventoryStatus, setInventoryStatus] = useState([])

  useEffect(() => {
    if (partsData && partsData.length > 0) {
      // Group parts by part_type
      const partsByType = partsData.reduce((acc, part) => {
        const type = part.part_type || "unknown"
        if (!acc[type]) {
          acc[type] = []
        }
        acc[type].push(part)
        return acc
      }, {})

      // Calculate status for each type
      const statusByType = Object.keys(partsByType).map((type) => {
        const parts = partsByType[type]
        const total = parts.length

        // Count parts by stock level
        const healthy = parts.filter((part) => part.quantity >= part.min_stock * 1.2).length
        const warning = parts.filter(
          (part) => part.quantity >= part.min_stock && part.quantity < part.min_stock * 1.2,
        ).length
        const critical = parts.filter((part) => part.quantity < part.min_stock).length

        // Calculate percentages
        const healthyPercent = Math.round((healthy / total) * 100)
        const warningPercent = Math.round((warning / total) * 100)
        const criticalPercent = Math.round((critical / total) * 100)

        return {
          category: type.charAt(0).toUpperCase() + type.slice(1), // Capitalize first letter
          healthy: healthyPercent,
          warning: warningPercent,
          critical: criticalPercent,
        }
      })

      setInventoryStatus(statusByType)
    }
  }, [partsData])

  if (inventoryStatus.length === 0) {
    return <p className="text-gray-400">No inventory data available.</p>
  }

  return (
    <div className="space-y-4">
      {inventoryStatus.map((item) => (
        <div key={item.category} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{item.category}</span>
            <span className="text-xs text-gray-400">{item.healthy}% Healthy</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500"
              style={{
                width: "100%",
                background: `linear-gradient(to right, 
                  #10b981 0%, 
                  #10b981 ${item.healthy}%, 
                  #f59e0b ${item.healthy}%, 
                  #f59e0b ${item.healthy + item.warning}%, 
                  #ef4444 ${item.healthy + item.warning}%, 
                  #ef4444 100%)`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
