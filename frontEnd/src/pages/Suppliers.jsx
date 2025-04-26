"use client"

import { useState, useEffect } from "react"
import { Users, Search, Filter, ArrowUpDown, Star, Clock, Package } from "lucide-react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { useSupply } from "../hooks/useFirebaseData"
import LoadingSpinner from "../components/LoadingSpinner"

export default function Suppliers() {
  const { data: supplyData, loading, error } = useSupply()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRating, setFilterRating] = useState("all")
  const [suppliers, setSuppliers] = useState([])
  const [filteredSuppliers, setFilteredSuppliers] = useState([])

  // Process supply data to extract supplier information
  useEffect(() => {
    if (supplyData && supplyData.length > 0) {
      // Extract unique supplier IDs and aggregate their data
      const supplierMap = {}

      supplyData.forEach((item) => {
        // Extract supplier_id from the composite key (e.g., "SupA_P303" -> "SupA")
        const underscoreIndex = item.id.indexOf("_")
        if (underscoreIndex <= 0) return

        const supplierId = item.id.substring(0, underscoreIndex)
        const partId = item.id.substring(underscoreIndex + 1)

        if (!supplierMap[supplierId]) {
          supplierMap[supplierId] = {
            id: supplierId,
            name: `Supplier ${supplierId.replace("Sup", "")}`, // Format name (SupA -> Supplier A)
            location: item.location || "Unknown",
            parts: [partId],
            part_names: [],
            reliability_sum: item.reliability_rating || 0,
            reliability_count: 1,
            lead_time_sum: item.lead_time_days || 0,
            lead_time_count: 1,
            min_order_value: item.min_order_qty ? item.min_order_qty * (item.price_per_unit || 0) : 1000,
            contact: `contact@${supplierId.toLowerCase()}.com`,
          }
        } else {
          if (!supplierMap[supplierId].parts.includes(partId)) {
            supplierMap[supplierId].parts.push(partId)
          }
          supplierMap[supplierId].reliability_sum += item.reliability_rating || 0
          supplierMap[supplierId].reliability_count += 1
          supplierMap[supplierId].lead_time_sum += item.lead_time_days || 0
          supplierMap[supplierId].lead_time_count += 1
        }
      })

      // Calculate averages and format supplier data
      const supplierList = Object.values(supplierMap).map((supplier) => ({
        id: supplier.id,
        name: supplier.name,
        location: supplier.location,
        parts: supplier.parts,
        part_names: supplier.part_names,
        reliability: supplier.reliability_sum / supplier.reliability_count,
        avg_lead_time: Math.round(supplier.lead_time_sum / supplier.lead_time_count),
        min_order_value: supplier.min_order_value,
        contact: supplier.contact,
      }))

      setSuppliers(supplierList)
    }
  }, [supplyData])

  // Filter suppliers based on search term and reliability rating
  useEffect(() => {
    if (suppliers.length > 0) {
      const filtered = suppliers.filter((supplier) => {
        const matchesSearch =
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.location.toLowerCase().includes(searchTerm.toLowerCase())

        if (filterRating === "all") return matchesSearch
        if (filterRating === "high") return matchesSearch && supplier.reliability >= 0.9
        if (filterRating === "medium") return matchesSearch && supplier.reliability >= 0.8 && supplier.reliability < 0.9
        if (filterRating === "low") return matchesSearch && supplier.reliability < 0.8

        return matchesSearch
      })

      setFilteredSuppliers(filtered)
    }
  }, [suppliers, searchTerm, filterRating])

  // Get reliability rating display
  const getReliabilityDisplay = (reliability) => {
    if (reliability >= 0.9) {
      return { text: "High", color: "text-emerald-500", bgColor: "bg-emerald-500/20" }
    } else if (reliability >= 0.8) {
      return { text: "Medium", color: "text-amber-500", bgColor: "bg-amber-500/20" }
    } else {
      return { text: "Low", color: "text-red-500", bgColor: "bg-red-500/20" }
    }
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64">
        <Header title="Suppliers" />

        <main className="flex-1 overflow-auto p-6">
          {/* Filters and Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-2.5"
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Filter className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-2.5"
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                >
                  <option value="all">All Reliability</option>
                  <option value="high">High Reliability</option>
                  <option value="medium">Medium Reliability</option>
                  <option value="low">Low Reliability</option>
                </select>
              </div>
            </div>

            {/* Add Supplier Button */}
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 mr-2" />
              Add Supplier
            </button>
          </div>

          {/* Suppliers Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">Error loading supplier data: {error.message}</div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No suppliers found matching your criteria.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3">
                        <div className="flex items-center">
                          Supplier
                          <button className="ml-1 text-gray-400">
                            <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Location
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Parts Supplied
                      </th>
                      <th scope="col" className="px-4 py-3">
                        <div className="flex items-center">
                          Reliability
                          <button className="ml-1 text-gray-400">
                            <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3">
                        <div className="flex items-center">
                          Lead Time
                          <button className="ml-1 text-gray-400">
                            <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Min Order
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Contact
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.map((supplier, index) => {
                      const reliabilityDisplay = getReliabilityDisplay(supplier.reliability)

                      return (
                        <tr
                          key={supplier.id}
                          className={`border-b border-gray-800 ${index % 2 === 0 ? "bg-gray-800/30" : ""}`}
                        >
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium">{supplier.name}</div>
                              <div className="text-xs text-gray-400">{supplier.id}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">{supplier.location}</td>
                          <td className="px-4 py-3">
                            {supplier.parts.length > 0 ? (
                              <div className="flex items-center">
                                <Package className="w-4 h-4 mr-1 text-gray-400" />
                                <span>{supplier.parts.length} parts</span>
                              </div>
                            ) : (
                              <span className="text-gray-500">No parts</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${reliabilityDisplay.bgColor} ${reliabilityDisplay.color} mr-2`}
                              >
                                <Star className="w-3 h-3 mr-1" />
                                {reliabilityDisplay.text}
                              </span>
                              <span>{(supplier.reliability * 100).toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1 text-gray-400" />
                              <span>{supplier.avg_lead_time} days</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">${supplier.min_order_value.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <a href={`mailto:${supplier.contact}`} className="text-emerald-500 hover:text-emerald-400">
                              {supplier.contact}
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <button className="text-emerald-500 hover:text-emerald-400">View Details</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
