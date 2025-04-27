"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Package,
  ShoppingCart,
  Truck,
  Users,
  BarChart2,
} from "lucide-react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import InventoryStatusCard from "../components/InventoryStatusCard"
import OrdersTable from "../components/OrdersTable"
import SalesChart from "../components/SalesChart"
import SupplierReliabilityChart from "../components/SupplierReliabilityChart"
import LowStockAlert from "../components/LowStockAlert"
import { useParts, useOrders, useSales, useSupply } from "../hooks/useFirebaseData"
import LoadingSpinner from "../components/LoadingSpinner"
import { DataImportWidget } from "../components/DashboardWidgets"

export default function Dashboard() {
  const { data: partsData, loading: partsLoading } = useParts()
  const { data: ordersData, loading: ordersLoading } = useOrders({
    orderBy: { field: "order_date", direction: "desc" },
    limit: 5,
  })
  const { data: salesData, loading: salesLoading } = useSales()
  const { data: suppliersData, loading: suppliersLoading } = useSupply()

  const [stats, setStats] = useState([
    {
      title: "Total Parts",
      value: "0",
      change: "0%",
      trend: "neutral",
      icon: Package,
      color: "emerald",
    },
    {
      title: "Active Orders",
      value: "0",
      change: "0%",
      trend: "neutral",
      icon: Truck,
      color: "blue",
    },
    {
      title: "Sales Orders",
      value: "0",
      change: "0%",
      trend: "neutral",
      icon: ShoppingCart,
      color: "purple",
    },
    {
      title: "Suppliers",
      value: "0",
      change: "0%",
      trend: "neutral",
      icon: Users,
      color: "amber",
    },
  ])

  // Update stats when data is loaded
  useEffect(() => {
    if (!partsLoading && !ordersLoading && !salesLoading && !suppliersLoading) {
      // Get unique supplier IDs from supply collection
      const uniqueSuppliers = [
        ...new Set(
          suppliersData.map((item) => {
            // Extract supplier ID from the composite key (e.g., "SupA_P303" -> "SupA")
            const underscoreIndex = item.id.indexOf("_")
            return underscoreIndex > 0 ? item.id.substring(0, underscoreIndex) : item.id
          }),
        ),
      ]

      // Count active orders (status === "ordered")
      const activeOrders = ordersData.filter((order) => order.status === "ordered").length

      setStats([
        {
          title: "Total Parts",
          value: partsData.length.toString(),
          change: "+12%", // This would ideally be calculated from historical data
          trend: "up",
          icon: Package,
          color: "emerald",
        },
        {
          title: "Active Orders",
          value: activeOrders.toString(),
          change: "-5%", // This would ideally be calculated from historical data
          trend: "down",
          icon: Truck,
          color: "blue",
        },
        {
          title: "Sales Orders",
          value: salesData.length.toString(),
          change: "+18%", // This would ideally be calculated from historical data
          trend: "up",
          icon: ShoppingCart,
          color: "purple",
        },
        {
          title: "Suppliers",
          value: uniqueSuppliers.length.toString(),
          change: "0%", // This would ideally be calculated from historical data
          trend: "neutral",
          icon: Users,
          color: "amber",
        },
      ])
    }
  }, [partsData, ordersData, salesData, suppliersData, partsLoading, ordersLoading, salesLoading, suppliersLoading])

  const isLoading = partsLoading || ordersLoading || salesLoading || suppliersLoading

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64">
        <Header title="Procurement Dashboard" />

        <main className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                  <div key={stat.title} className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full bg-${stat.color}-500/20 text-${stat.color}-500`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      {stat.trend === "up" && <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />}
                      {stat.trend === "down" && <TrendingDown className="w-4 h-4 text-red-500 mr-1" />}
                      {stat.trend === "neutral" && <div className="w-4 h-4 mr-1" />}
                      <span
                        className={`text-sm font-medium ${
                          stat.trend === "up"
                            ? "text-emerald-500"
                            : stat.trend === "down"
                              ? "text-red-500"
                              : "text-gray-400"
                        }`}
                      >
                        {stat.change} from last month
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Import Widget */}
              <div className="mb-8">
                <DataImportWidget />
              </div>

              {/* Alerts and Inventory Status */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg shadow-lg">
                  <div className="p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
                      Inventory Alerts
                    </h2>
                  </div>
                  <div className="p-6">
                    <LowStockAlert partsData={partsData} />
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg">
                  <div className="p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-blue-500" />
                      Inventory Status
                    </h2>
                  </div>
                  <div className="p-6">
                    <InventoryStatusCard partsData={partsData} />
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg">
                  <div className="p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold flex items-center">
                      <ShoppingCart className="w-5 h-5 mr-2 text-purple-500" />
                      Sales Overview
                    </h2>
                  </div>
                  <div className="p-6">
                    <SalesChart salesData={salesData} />
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg">
                  <div className="p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold flex items-center">
                      <BarChart2 className="w-5 h-5 mr-2 text-emerald-500" />
                      Supplier Reliability
                    </h2>
                  </div>
                  <div className="p-6">
                    <SupplierReliabilityChart suppliersData={suppliersData} />
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg">
                <div className="p-6 border-b border-gray-800">
                  <h2 className="text-xl font-bold flex items-center">
                    <Truck className="w-5 h-5 mr-2 text-blue-500" />
                    Recent Orders
                  </h2>
                </div>
                <div className="p-6">
                  <OrdersTable ordersData={ordersData} />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
