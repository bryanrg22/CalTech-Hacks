"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Plus, ArrowUpDown, AlertTriangle, Edit, Trash2 } from "lucide-react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { useParts } from "../hooks/useFirebaseData"
import LoadingSpinner from "../components/LoadingSpinner"
import Modal from "../components/Modal"
import PartForm from "../components/PartForm"
import ConfirmDialog from "../components/ConfirmDialog"
import { deleteDocument } from "../services/apiService"
import { useToast } from "../components/ToastContext"

export default function Parts() {
  const { data: partsData, loading, error, refetch } = useParts()
  const { addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filteredParts, setFilteredParts] = useState([])

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPart, setSelectedPart] = useState(null)

  // Filter parts based on search term and filter status
  useEffect(() => {
    if (partsData) {
      const filtered = partsData.filter((part) => {
        const partName = part.part_name || `Part ${part.id}`
        const matchesSearch =
          partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          part.id.toLowerCase().includes(searchTerm.toLowerCase())

        if (filterStatus === "all") return matchesSearch
        if (filterStatus === "low_stock") return matchesSearch && part.quantity < part.min_stock
        if (filterStatus === "healthy") return matchesSearch && part.quantity >= part.min_stock

        return matchesSearch
      })

      setFilteredParts(filtered)
    }
  }, [partsData, searchTerm, filterStatus])

  // Get stock status
  const getStockStatus = (part) => {
    if (part.quantity < part.min_stock) {
      return { status: "low", color: "text-red-500", bgColor: "bg-red-500/20" }
    } else if (part.quantity < part.min_stock * 1.5) {
      return { status: "warning", color: "text-amber-500", bgColor: "bg-amber-500/20" }
    } else {
      return { status: "healthy", color: "text-emerald-500", bgColor: "bg-emerald-500/20" }
    }
  }

  const handleAddPart = () => {
    setIsAddModalOpen(true)
  }

  const handleEditPart = (part) => {
    setSelectedPart(part)
    setIsEditModalOpen(true)
  }

  const handleDeletePart = (part) => {
    setSelectedPart(part)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeletePart = async () => {
    try {
      await deleteDocument("parts", selectedPart.id)
      addToast(`Part ${selectedPart.id} deleted successfully`, "success")
      refetch()
    } catch (error) {
      addToast(`Error deleting part: ${error.message}`, "error")
    }
  }

  const handleSavePart = () => {
    setIsAddModalOpen(false)
    setIsEditModalOpen(false)
    refetch()
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64">
        <Header title="Parts Inventory" />

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
                  placeholder="Search parts..."
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
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Parts</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="healthy">Healthy Stock</option>
                </select>
              </div>
            </div>

            {/* Add Part Button */}
            <button
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
              onClick={handleAddPart}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Part
            </button>
          </div>

          {/* Parts Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">Error loading parts data: {error.message}</div>
            ) : filteredParts.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No parts found matching your criteria.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3">
                        <div className="flex items-center">
                          Part ID
                          <button className="ml-1 text-gray-400">
                            <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3">
                        <div className="flex items-center">
                          Name
                          <button className="ml-1 text-gray-400">
                            <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Type
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Used In
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Location
                      </th>
                      <th scope="col" className="px-4 py-3">
                        <div className="flex items-center">
                          Stock
                          <button className="ml-1 text-gray-400">
                            <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Min Stock
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParts.map((part, index) => {
                      const stockStatus = getStockStatus(part)

                      return (
                        <tr
                          key={part.id}
                          className={`border-b border-gray-800 ${index % 2 === 0 ? "bg-gray-800/30" : ""}`}
                        >
                          <td className="px-4 py-3 font-medium">{part.id}</td>
                          <td className="px-4 py-3 font-medium">{part.part_name || `Part ${part.id}`}</td>
                          <td className="px-4 py-3 capitalize">{part.part_type || "N/A"}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {part.used_in_models && part.used_in_models.length > 0 ? (
                                part.used_in_models.map((model) => (
                                  <span key={model} className="px-2 py-1 bg-gray-800 text-xs rounded-md">
                                    {model}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500">None</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">{part.location || "N/A"}</td>
                          <td className="px-4 py-3 font-medium">{part.quantity}</td>
                          <td className="px-4 py-3">{part.min_stock}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color}`}
                            >
                              {part.quantity < part.min_stock && <AlertTriangle className="w-3 h-3 mr-1" />}
                              {stockStatus.status === "low"
                                ? "Low Stock"
                                : stockStatus.status === "warning"
                                  ? "Warning"
                                  : "Healthy"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <button
                                className="text-blue-500 hover:text-blue-400"
                                onClick={() => handleEditPart(part)}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="text-red-500 hover:text-red-400"
                                onClick={() => handleDeletePart(part)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
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

      {/* Add Part Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Part">
        <PartForm onSave={handleSavePart} onCancel={() => setIsAddModalOpen(false)} />
      </Modal>

      {/* Edit Part Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Part: ${selectedPart?.part_name || selectedPart?.id}`}
      >
        <PartForm
          part={selectedPart}
          isEditing={true}
          onSave={handleSavePart}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeletePart}
        title="Delete Part"
        message={`Are you sure you want to delete ${selectedPart?.part_name || selectedPart?.id}? This action cannot be undone.`}
      />
    </div>
  )
}
