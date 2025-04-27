"use client"

import { useState, useEffect } from "react"
import { Package, Search, Filter, ChevronDown, ChevronUp, Loader } from "lucide-react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { db } from "../firebase"
import { doc, getDoc } from "firebase/firestore"
import { useToast } from "../components/ToastContext"
import ProductModelCard from "../components/ProductModelCard"
import { useParts } from "../hooks/useFirebaseData"

export default function Products() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("model")
  const [sortDirection, setSortDirection] = useState("asc")
  const [filterStatus, setFilterStatus] = useState("all") // all, low, ok
  const { addToast } = useToast()
  const { data: partsData, loading: partsLoading } = useParts()

  // List of all available models
  const availableModels = ["S1_V1", "S1_V2", "S2_V2", "S3_V1", "S3_V2"]

  useEffect(() => {
    if (!partsLoading) {
      fetchModels()
    }
  }, [partsLoading])

  const fetchModels = async () => {
    setLoading(true)
    try {
      const modelsData = []

      // Process each model from the available models list
      for (const modelId of availableModels) {
        // Fetch the specs document for this model
        const specDocRef = doc(db, "specs", `scanned_${modelId}_specs`)
        const specDoc = await getDoc(specDocRef)

        if (!specDoc.exists()) {
          console.warn(`No specs found for model ${modelId}`)
          continue
        }

        const specData = specDoc.data()
        const billOfMaterials = specData["bill of materials"] || []

        // Skip the first element which is just "array"
        const parts = billOfMaterials.slice(1) || []

        // Process each part in the bill of materials
        const modelParts = []

        for (const part of parts) {
          // Find the corresponding part in partsData to get stock information
          const partId = part.Part_ID
          const partDetails = partsData.find((p) => p.id === partId)

          // Calculate stock status
          let stockStatus = "ok"
          let urgency = "low"

          if (partDetails) {
            if (partDetails.quantity < partDetails.min_stock) {
              stockStatus = "low"

              // Calculate urgency based on how far below min_stock
              const ratio = partDetails.quantity / partDetails.min_stock
              if (ratio < 0.5) {
                urgency = "high"
              } else {
                urgency = "medium"
              }
            }

            modelParts.push({
              id: partId,
              name: part.Part_Name || partDetails.part_name || `Part ${partId}`,
              quantity: partDetails.quantity || 0,
              min_stock: partDetails.min_stock || 0,
              required_qty: part.Qty || 0,
              notes: part.Notes || "",
              stock_status: stockStatus,
              urgency: urgency,
              part_type: partDetails.part_type || "unknown",
            })
          } else {
            // If part not found in parts collection, still add it with default values
            modelParts.push({
              id: partId,
              name: part.Part_Name || `Part ${partId}`,
              quantity: 0,
              min_stock: 0,
              required_qty: part.Qty || 0,
              notes: part.Notes || "",
              stock_status: "unknown",
              urgency: "unknown",
              part_type: "unknown",
            })
          }
        }

        // Get requirements
        const requirements = specData.requirements || []
        // Skip the first element which is just "array"
        const requirementsList = requirements.slice(1) || []

        // Calculate overall model status based on parts
        const hasLowStockParts = modelParts.some((part) => part.stock_status === "low")
        const hasHighUrgencyParts = modelParts.some((part) => part.urgency === "high")

        let modelStatus = "ok"
        let modelUrgency = "low"

        if (hasLowStockParts) {
          modelStatus = "low"
          modelUrgency = hasHighUrgencyParts ? "high" : "medium"
        }

        // Format model name for display
        const displayName = modelId.replace(/_/g, " ")

        modelsData.push({
          id: modelId,
          name: displayName,
          description: `${displayName} Electric Scooter`,
          image: null,
          parts: modelParts,
          requirements: requirementsList,
          status: modelStatus,
          urgency: modelUrgency,
        })
      }

      setModels(modelsData)
    } catch (error) {
      console.error("Error fetching models:", error)
      addToast("Failed to load product models", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // New field, default to ascending
      setSortBy(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field) => {
    if (sortBy !== field) return null
    return sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  // Filter and sort models
  const filteredAndSortedModels = models
    .filter((model) => {
      // Apply search filter
      const searchMatch =
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.id.toLowerCase().includes(searchTerm.toLowerCase())

      // Apply status filter
      const statusMatch =
        filterStatus === "all" ||
        (filterStatus === "low" && model.status === "low") ||
        (filterStatus === "ok" && model.status === "ok")

      return searchMatch && statusMatch
    })
    .sort((a, b) => {
      // Apply sorting
      let comparison = 0

      if (sortBy === "model") {
        comparison = a.name.localeCompare(b.name)
      } else if (sortBy === "status") {
        comparison = a.status.localeCompare(b.status)
      } else if (sortBy === "urgency") {
        const urgencyOrder = { high: 0, medium: 1, low: 2, unknown: 3 }
        comparison = urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
      } else if (sortBy === "parts") {
        comparison = a.parts.length - b.parts.length
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64">
        <Header title="Products" />

        <main className="flex-1 overflow-auto p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold flex items-center">
              <Package className="w-5 h-5 mr-2 text-purple-500" />
              Scooter Models
            </h2>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search models..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md appearance-none w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="low">Low Stock</option>
                  <option value="ok">In Stock</option>
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Sort options */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => handleSort("model")}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
                sortBy === "model" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"
              }`}
            >
              Model Name {getSortIcon("model")}
            </button>
            <button
              onClick={() => handleSort("status")}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
                sortBy === "status" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"
              }`}
            >
              Status {getSortIcon("status")}
            </button>
            <button
              onClick={() => handleSort("urgency")}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
                sortBy === "urgency" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"
              }`}
            >
              Urgency {getSortIcon("urgency")}
            </button>
            <button
              onClick={() => handleSort("parts")}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm ${
                sortBy === "parts" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"
              }`}
            >
              Parts Count {getSortIcon("parts")}
            </button>
          </div>

          {loading || partsLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader className="w-8 h-8 text-purple-500 animate-spin" />
              <span className="ml-2 text-gray-400">Loading product models...</span>
            </div>
          ) : filteredAndSortedModels.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredAndSortedModels.map((model) => (
                <ProductModelCard key={model.id} model={model} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Package className="w-12 h-12 mb-4 text-gray-600" />
              <p className="text-lg">No models found</p>
              <p className="text-sm mt-2">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "No scooter models have been added yet"}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
