"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts"

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
            leadTimeSum: item.lead_time_days || 0,
          }
        } else {
          supplierMap[supplierId].reliabilitySum += item.reliability_rating || 0
          supplierMap[supplierId].count += 1
          supplierMap[supplierId].leadTimeSum += item.lead_time_days || 0
        }
      })

      // Calculate average reliability for each supplier
      const supplierList = Object.values(supplierMap).map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
        reliability: supplier.reliabilitySum / supplier.count,
        reliabilityPercent: Math.round((supplier.reliabilitySum / supplier.count) * 100),
        avgLeadTime: Math.round(supplier.leadTimeSum / supplier.count),
      }))

      // Sort by reliability (highest first)
      supplierList.sort((a, b) => b.reliability - a.reliability)

      setSuppliers(supplierList)
    }
  }, [suppliersData])

  const getReliabilityColor = (reliability) => {
    if (reliability >= 0.9) return "#10B981" // emerald-500
    if (reliability >= 0.8) return "#F59E0B" // amber-500
    return "#EF4444" // red-500
  }

  if (suppliers.length === 0) {
    return <p className="text-gray-400">No supplier data available.</p>
  }

  return (
    <div className="space-y-6">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={suppliers} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: "#9CA3AF" }} axisLine={{ stroke: "#4B5563" }} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#9CA3AF" }} axisLine={{ stroke: "#4B5563" }} />
            <Tooltip
              formatter={(value) => [`${value}%`, "Reliability"]}
              contentStyle={{
                backgroundColor: "#1F2937",
                borderColor: "#374151",
                color: "#F9FAFB",
              }}
              itemStyle={{ color: "#F9FAFB" }}
              labelStyle={{ color: "#F9FAFB", fontWeight: "bold", marginBottom: "5px" }}
            />
            <Bar dataKey="reliabilityPercent" name="Reliability" radius={[0, 4, 4, 0]}>
              {suppliers.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getReliabilityColor(entry.reliability)} />
              ))}
              <LabelList
                dataKey="reliabilityPercent"
                position="right"
                fill="#F9FAFB"
                formatter={(value) => `${value}%`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-300">Lead Time Comparison</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={suppliers} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: "#9CA3AF" }} axisLine={{ stroke: "#4B5563" }} />
              <YAxis
                tick={{ fill: "#9CA3AF" }}
                axisLine={{ stroke: "#4B5563" }}
                label={{ value: "Days", angle: -90, position: "insideLeft", fill: "#9CA3AF" }}
              />
              <Tooltip
                formatter={(value) => [`${value} days`, "Lead Time"]}
                contentStyle={{
                  backgroundColor: "#1F2937",
                  borderColor: "#374151",
                  color: "#F9FAFB",
                }}
                itemStyle={{ color: "#F9FAFB" }}
                labelStyle={{ color: "#F9FAFB", fontWeight: "bold", marginBottom: "5px" }}
              />
              <Bar dataKey="avgLeadTime" name="Lead Time" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
