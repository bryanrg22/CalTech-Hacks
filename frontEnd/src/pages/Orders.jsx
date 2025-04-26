"use client"

import { useState, useEffect } from "react"
import { Truck, Search, Filter, Calendar, ArrowUpDown, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { useOrders, useParts } from "../hooks/useFirebaseData"
import LoadingSpinner from "../components/LoadingSpinner"

export default function Orders() {
  const { data: ordersData, loading: ordersLoading, error: ordersError } = useOrders()
  const { data: partsData, loading: partsLoading } = useParts()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filteredOrders, setFilteredOrders] = useState([])
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    onTimePercentage: 0,
  })

  // Enrich orders with part names and filter based on search term and filter status
  useEffect(() => {
    if (ordersData && partsData) {
      // Enrich orders with part names
      const enrichedOrders = ordersData.map((order) => {
        const part = partsData.find((p) => p.id === order.part_id)
        return {
          ...order,
          part_name: part ? part.part_name || `Part ${part.id}` : `Unknown Part (${order.part_id})`,
          supplier_name: `Supplier ${order.supplier_id.replace("Sup", "")}`,
        }
      })

      // Filter orders
      const filtered = enrichedOrders.filter((order) => {
        const matchesSearch =
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.part_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())

        if (filterStatus === "all") return matchesSearch
        if (filterStatus === "ordered") return matchesSearch && order.status === "ordered"
        if (filterStatus === "delivered") return matchesSearch && order.status === "delivered"

        return matchesSearch
      })

      setFilteredOrders(filtered)

      // Calculate stats
      const total = ordersData.length
      const pending = ordersData.filter((order) => order.status === "ordered").length
      const delivered = ordersData.filter((order) => order.status === "delivered").length

      // Calculate on-time delivery percentage
      let onTimeCount = 0
      let totalDelivered = 0

      ordersData.forEach((order) => {
        if (order.status === "delivered" && order.actual_delivered_at) {
          totalDelivered++
          const actualDate = new Date(order.actual_delivered_at)
          const expectedDate = new Date(order.expected_delivery_date || order.expected_delivery)

          if (actualDate <= expectedDate) {
            onTimeCount++
          }
        }
      })

      const onTimePercentage = totalDelivered > 0 ? Math.round((onTimeCount / totalDelivered) * 100) : 0

      setOrderStats({
        total,
        pending,
        delivered,
        onTimePercentage,
      })
    }
  }, [ordersData, partsData, searchTerm, filterStatus])

  // Calculate delivery status
  const getDeliveryStatus = (order) => {
    if (order.status === "delivered") {
      const actualDate = new Date(order.actual_delivered_at)
      const expectedDate = new Date(order.expected_delivery_date || order.expected_delivery)

      if (actualDate <= expectedDate) {
        return { status: "on-time", color: "text-emerald-500", bgColor: "bg-emerald-500/20" }
      } else {
        return { status: "delayed", color: "text-amber-500", bgColor: "bg-amber-500/20" }
      }
    } else {
      const today = new Date()
      const expectedDate = new Date(order.expected_delivery_date || order.expected_delivery)

      if (today > expectedDate) {
        return { status: "overdue", color: "text-red-500", bgColor: "bg-red-500/20" }
      } else {
        // Check if within 3 days of expected delivery
        const daysUntilDelivery = Math.ceil((expectedDate - today) / (1000 * 60 * 60 * 24))

        if (daysUntilDelivery <= 3) {
          return { status: "approaching", color: "text-amber-500", bgColor: "bg-amber-500/20" }
        } else {
          return { status: "on-track", color: "text-blue-500", bgColor: "bg-blue-500/20" }
        }
      }
    }
  }

  const isLoading = ordersLoading || partsLoading

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64">
        <Header title="Purchase Orders" />

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
                  placeholder="Search orders..."
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
                  <option value="ordered">Pending</option>
                  <option value="delivered">Delivered</option>
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

            {/* Create Order Button */}
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 mr-2" />
              Create Order
            </button>
          </div>

          {/* Orders Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-medium text-gray-300 mb-2">Total Orders</h3>
              <p className="text-3xl font-bold">{orderStats.total}</p>
              <div className="mt-2 text-sm text-emerald-500">+20% from last month</div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-medium text-gray-300 mb-2">Pending</h3>
              <p className="text-3xl font-bold">{orderStats.pending}</p>
              <div className="mt-2 text-sm text-emerald-500">+50% from last month</div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-medium text-gray-300 mb-2">Delivered</h3>
              <p className="text-3xl font-bold">{orderStats.delivered}</p>
              <div className="mt-2 text-sm text-red-500">-10% from last month</div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-medium text-gray-300 mb-2">On-Time Delivery</h3>
              <p className="text-3xl font-bold">{orderStats.onTimePercentage}%</p>
              <div className="mt-2 text-sm text-emerald-500">+5% from last month</div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <LoadingSpinner />
              </div>
            ) : ordersError ? (
              <div className="p-8 text-center text-red-500">Error loading orders data: {ordersError.message}</div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No orders found matching your criteria.</div>
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
                        Part
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Supplier
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
                        <div className="flex items-center">
                          Order Date
                          <button className="ml-1 text-gray-400">
                            <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Expected Delivery
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, index) => {
                      const deliveryStatus = getDeliveryStatus(order)

                      return (
                        <tr
                          key={order.id}
                          className={`border-b border-gray-800 ${index % 2 === 0 ? "bg-gray-800/30" : ""}`}
                        >
                          <td className="px-4 py-3 font-medium">{order.id}</td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium">{order.part_name}</div>
                              <div className="text-xs text-gray-400">{order.part_id}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium">{order.supplier_name}</div>
                              <div className="text-xs text-gray-400">{order.supplier_id}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium">{order.quantity_ordered || order.quantity}</td>
                          <td className="px-4 py-3">{order.order_date}</td>
                          <td className="px-4 py-3">{order.expected_delivery_date || order.expected_delivery}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${deliveryStatus.bgColor} ${deliveryStatus.color}`}
                            >
                              {order.status === "delivered" ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  {deliveryStatus.status === "on-time" ? "On Time" : "Delayed"}
                                </>
                              ) : deliveryStatus.status === "overdue" ? (
                                <>
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Overdue
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 mr-1" />
                                  {deliveryStatus.status === "approaching" ? "Due Soon" : "On Track"}
                                </>
                              )}
                            </span>
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
