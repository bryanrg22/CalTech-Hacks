"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Calendar, ArrowUpDown, ExternalLink, Edit, Trash2, Plus } from "lucide-react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { useSales } from "../hooks/useFirebaseData"
import LoadingSpinner from "../components/LoadingSpinner"
import Modal from "../components/Modal"
import SaleForm from "../components/SaleForm"
import ConfirmDialog from "../components/ConfirmDialog"
import { deleteDocument } from "../services/apiService"
import { useToast } from "../components/ToastContext"

export default function Sales() {
  const { data: salesData, loading, error, refetch } = useSales()
  const { addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filteredSales, setFilteredSales] = useState([])
  const [salesStats, setSalesStats] = useState({
    totalUnits: 0,
    webshopOrders: 0,
    fleetOrders: 0,
  })

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)

  // Filter sales based on search term and filter status
  useEffect(() => {
    if (salesData) {
      const filtered = salesData.filter((sale) => {
        const matchesSearch =
          sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${sale.model}_${sale.version}`.toLowerCase().includes(searchTerm.toLowerCase())

        if (filterStatus === "all") return matchesSearch
        if (filterStatus === "webshop") return matchesSearch && sale.order_type === "webshop"
        if (filterStatus === "fleet") return matchesSearch && sale.order_type === "fleet_framework"

        return matchesSearch
      })

      setFilteredSales(filtered)

      // Calculate stats
      const totalUnits = salesData.reduce((sum, sale) => sum + (sale.quantity || 0), 0)
      const webshopOrders = salesData.filter((sale) => sale.order_type === "webshop").length
      const fleetOrders = salesData.filter((sale) => sale.order_type === "fleet_framework").length

      setSalesStats({
        totalUnits,
        webshopOrders,
        fleetOrders,
      })
    }
  }, [salesData, searchTerm, filterStatus])

  const handleAddSale = () => {
    setIsAddModalOpen(true)
  }

  const handleEditSale = (sale) => {
    setSelectedSale(sale)
    setIsEditModalOpen(true)
  }

  const handleDeleteSale = (sale) => {
    setSelectedSale(sale)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteSale = async () => {
    try {
      await deleteDocument("sales", selectedSale.id)
      addToast(`Sale ${selectedSale.id} deleted successfully`, "success")
      refetch()
    } catch (error) {
      addToast(`Error deleting sale: ${error.message}`, "error")
    }
  }

  const handleSaveSale = () => {
    setIsAddModalOpen(false)
    setIsEditModalOpen(false)
    refetch()
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64">
        <Header title="Sales Orders" />

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
                  placeholder="Search sales..."
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
                  <option value="all">All Orders</option>
                  <option value="webshop">Webshop</option>
                  <option value="fleet">Fleet Framework</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <select className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-2.5">
                  <option value="all">All Dates</option>
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              {/* Add Sale Button */}
              <button
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
                onClick={handleAddSale}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Sale
              </button>

              {/* Export Button */}
              <button className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center justify-center">
                <ExternalLink className="w-5 h-5 mr-2" />
                Export Data
              </button>
            </div>
          </div>

          {/* Sales Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-medium text-gray-300 mb-2">Total Units</h3>
              <p className="text-3xl font-bold">{salesStats.totalUnits}</p>
              <div className="mt-2 text-sm text-emerald-500">+15% from last month</div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-medium text-gray-300 mb-2">Webshop Orders</h3>
              <p className="text-3xl font-bold">{salesStats.webshopOrders}</p>
              <div className="mt-2 text-sm text-emerald-500">+8% from last month</div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-medium text-gray-300 mb-2">Fleet Orders</h3>
              <p className="text-3xl font-bold">{salesStats.fleetOrders}</p>
              <div className="mt-2 text-sm text-emerald-500">+20% from last month</div>
            </div>
          </div>

          {/* Sales Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">Error loading sales data: {error.message}</div>
            ) : filteredSales.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No sales found matching your criteria.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-800">
                    <tr>
                      <th scope="col" className="px-4 py-3">
                        <div className="flex items-center">
                          Order ID
                          <button className="ml-1 text-gray-400">
                            <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Model
                      </th>
                      <th scope="col" className="px-4 py-3">
                        <div className="flex items-center">
                          Quantity
                          <button className="ml-1 text-gray-400">
                            <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Order Type
                      </th>
                      <th scope="col" className="px-4 py-3">
                        <div className="flex items-center">
                          Created
                          <button className="ml-1 text-gray-400">
                            <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3">
                        <div className="flex items-center">
                          Requested Date
                          <button className="ml-1 text-gray-400">
                            <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Accepted
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.map((sale, index) => (
                      <tr
                        key={sale.id}
                        className={`border-b border-gray-800 ${index % 2 === 0 ? "bg-gray-800/30" : ""}`}
                      >
                        <td className="px-4 py-3 font-medium">{sale.id}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-800">
                            {sale.model}_{sale.version}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">{sale.quantity}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                              sale.order_type === "webshop"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-purple-500/20 text-purple-400"
                            }`}
                          >
                            {sale.order_type === "webshop" ? "Webshop" : "Fleet Framework"}
                          </span>
                        </td>
                        <td className="px-4 py-3">{sale.created_at}</td>
                        <td className="px-4 py-3">{sale.requested_date}</td>
                        <td className="px-4 py-3">{sale.accepted_request_date || "-"}</td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <button className="text-blue-500 hover:text-blue-400" onClick={() => handleEditSale(sale)}>
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-500 hover:text-red-400" onClick={() => handleDeleteSale(sale)}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Sale Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Sale">
        <SaleForm onSave={handleSaveSale} onCancel={() => setIsAddModalOpen(false)} />
      </Modal>

      {/* Edit Sale Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Sale: ${selectedSale?.id}`}
      >
        <SaleForm
          sale={selectedSale}
          isEditing={true}
          onSave={handleSaveSale}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteSale}
        title="Delete Sale"
        message={`Are you sure you want to delete sale ${selectedSale?.id}? This action cannot be undone.`}
      />
    </div>
  )
}
