"use client"

import { useState } from "react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { BarChart2, LineChartIcon, PieChartIcon, TrendingUp } from "lucide-react"
import { useSales, useOrders, useParts, useSupply } from "../hooks/useFirebaseData"
import LoadingSpinner from "../components/LoadingSpinner"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"

export default function Analytics() {
  const { data: salesData, loading: salesLoading } = useSales()
  const { data: ordersData, loading: ordersLoading } = useOrders()
  const { data: partsData, loading: partsLoading } = useParts()
  const { data: suppliersData, loading: suppliersLoading } = useSupply()
  const [activeChart, setActiveChart] = useState("sales")

  const isLoading = salesLoading || ordersLoading || partsLoading || suppliersLoading

  // Process data for charts
  const processInventoryData = () => {
    // Group parts by type
    const partsByType = partsData.reduce((acc, part) => {
      const type = part.part_type || "unknown"
      if (!acc[type]) {
        acc[type] = {
          name: type.charAt(0).toUpperCase() + type.slice(1),
          value: 0,
          count: 0,
        }
      }
      acc[type].value += part.quantity || 0
      acc[type].count += 1
      return acc
    }, {})

    return Object.values(partsByType)
  }

  const processOrdersData = () => {
    // Group orders by month
    const ordersByMonth = {}

    ordersData.forEach((order) => {
      // Extract date from order_date
      const date = new Date(order.order_date || "2024-01-01") // Default date if missing
      // Format as "Jan", "Feb", etc.
      const month = date.toLocaleDateString("en-US", { month: "short" })

      if (!ordersByMonth[month]) {
        ordersByMonth[month] = {
          month,
          ordered: 0,
          delivered: 0,
          total: 0,
        }
      }

      ordersByMonth[month].total += 1

      if (order.status === "delivered") {
        ordersByMonth[month].delivered += 1
      } else {
        ordersByMonth[month].ordered += 1
      }
    })

    // Convert to array and ensure we have at least 6 months of data
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentMonth = new Date().getMonth()

    const chartData = []
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const month = months[monthIndex]

      if (ordersByMonth[month]) {
        chartData.push(ordersByMonth[month])
      } else {
        // Add empty data for months without orders
        chartData.push({
          month,
          ordered: 0,
          delivered: 0,
          total: 0,
        })
      }
    }

    return chartData
  }

  const processSalesData = () => {
    // Group sales by model
    const salesByModel = salesData.reduce((acc, sale) => {
      const model = `${sale.model}_${sale.version}`
      if (!acc[model]) {
        acc[model] = {
          model,
          units: 0,
          revenue: 0,
        }
      }

      const quantity = sale.quantity || 0
      acc[model].units += quantity

      // Estimate revenue (demo data)
      const unitPrice = sale.model === "S1" ? 1200 : 1500
      acc[model].revenue += quantity * unitPrice

      return acc
    }, {})

    return Object.values(salesByModel)
  }

  const processPerformanceData = () => {
    // Create performance metrics over time
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

    return months.map((month, index) => {
      // Generate some demo metrics that show improvement over time
      const baseInventoryTurnover = 1.8 + index * 0.1
      const baseOrderCycleTime = 22 - index * 0.7
      const baseOnTimeDelivery = 70 + index * 1.5

      // Add some randomness
      const inventoryTurnover = baseInventoryTurnover + (Math.random() * 0.4 - 0.2)
      const orderCycleTime = baseOrderCycleTime + (Math.random() * 2 - 1)
      const onTimeDelivery = Math.min(100, baseOnTimeDelivery + (Math.random() * 3 - 1.5))

      return {
        month,
        inventoryTurnover: Number.parseFloat(inventoryTurnover.toFixed(1)),
        orderCycleTime: Number.parseFloat(orderCycleTime.toFixed(1)),
        onTimeDelivery: Number.parseFloat(onTimeDelivery.toFixed(1)),
      }
    })
  }

  const COLORS = ["#10B981", "#8B5CF6", "#F59E0B", "#3B82F6", "#EC4899", "#6366F1"]

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64">
        <Header title="Analytics Dashboard" />

        <main className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Analytics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Total Sales</p>
                      <p className="text-2xl font-bold mt-1">
                        {salesData.reduce((sum, sale) => sum + (sale.quantity || 0), 0)}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-purple-500/20 text-purple-500">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm font-medium text-emerald-500">+18% from last month</span>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Inventory Value</p>
                      <p className="text-2xl font-bold mt-1">
                        $
                        {partsData
                          .reduce((sum, part) => {
                            // Assuming average part value of $100
                            return sum + (part.quantity || 0) * 100
                          }, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-500">
                      <BarChart2 className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm font-medium text-emerald-500">+12% from last month</span>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Order Fulfillment</p>
                      <p className="text-2xl font-bold mt-1">
                        {ordersData.length === 0
                          ? "0"
                          : Math.round(
                              (ordersData.filter((order) => order.status === "delivered").length / ordersData.length) *
                                100,
                            )}
                        %
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-500/20 text-blue-500">
                      <PieChartIcon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm font-medium text-emerald-500">+5% from last month</span>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Low Stock Items</p>
                      <p className="text-2xl font-bold mt-1">
                        {partsData.filter((part) => part.quantity < part.min_stock).length}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-amber-500/20 text-amber-500">
                      <LineChartIcon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="w-4 h-4 text-red-500 mr-1" transform="rotate(180)" />
                    <span className="text-sm font-medium text-red-500">+3 from last month</span>
                  </div>
                </div>
              </div>

              {/* Chart Navigation */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg mb-8">
                <div className="flex flex-wrap border-b border-gray-800">
                  <button
                    className={`px-6 py-4 text-sm font-medium ${
                      activeChart === "sales"
                        ? "text-emerald-500 border-b-2 border-emerald-500"
                        : "text-gray-400 hover:text-white"
                    }`}
                    onClick={() => setActiveChart("sales")}
                  >
                    Sales Analysis
                  </button>
                  <button
                    className={`px-6 py-4 text-sm font-medium ${
                      activeChart === "inventory"
                        ? "text-emerald-500 border-b-2 border-emerald-500"
                        : "text-gray-400 hover:text-white"
                    }`}
                    onClick={() => setActiveChart("inventory")}
                  >
                    Inventory Distribution
                  </button>
                  <button
                    className={`px-6 py-4 text-sm font-medium ${
                      activeChart === "orders"
                        ? "text-emerald-500 border-b-2 border-emerald-500"
                        : "text-gray-400 hover:text-white"
                    }`}
                    onClick={() => setActiveChart("orders")}
                  >
                    Order Trends
                  </button>
                  <button
                    className={`px-6 py-4 text-sm font-medium ${
                      activeChart === "performance"
                        ? "text-emerald-500 border-b-2 border-emerald-500"
                        : "text-gray-400 hover:text-white"
                    }`}
                    onClick={() => setActiveChart("performance")}
                  >
                    Performance Metrics
                  </button>
                </div>

                <div className="p-6">
                  {activeChart === "sales" && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold flex items-center">
                        <BarChart2 className="w-5 h-5 mr-2 text-purple-500" />
                        Sales Analysis by Model
                      </h2>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={processSalesData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis dataKey="model" tick={{ fill: "#9CA3AF" }} axisLine={{ stroke: "#4B5563" }} />
                              <YAxis yAxisId="left" tick={{ fill: "#9CA3AF" }} axisLine={{ stroke: "#4B5563" }} />
                              <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fill: "#9CA3AF" }}
                                axisLine={{ stroke: "#4B5563" }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#1F2937",
                                  borderColor: "#374151",
                                  color: "#F9FAFB",
                                }}
                                itemStyle={{ color: "#F9FAFB" }}
                                labelStyle={{ color: "#F9FAFB", fontWeight: "bold", marginBottom: "5px" }}
                              />
                              <Legend wrapperStyle={{ color: "#9CA3AF" }} />
                              <Bar
                                yAxisId="left"
                                dataKey="units"
                                name="Units Sold"
                                fill="#8B5CF6"
                                radius={[4, 4, 0, 0]}
                              />
                              <Bar
                                yAxisId="right"
                                dataKey="revenue"
                                name="Revenue ($)"
                                fill="#10B981"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={processSalesData()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="units"
                                nameKey="model"
                                label={({ model, units, percent }) =>
                                  `${model}: ${units} (${(percent * 100).toFixed(0)}%)`
                                }
                              >
                                {processSalesData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value, name, props) => [`${value} units`, props.payload.model]}
                                contentStyle={{
                                  backgroundColor: "#1F2937",
                                  borderColor: "#374151",
                                  color: "#F9FAFB",
                                }}
                              />
                              <Legend formatter={(value, entry) => entry.payload.model} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeChart === "inventory" && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold flex items-center">
                        <PieChartIcon className="w-5 h-5 mr-2 text-blue-500" />
                        Inventory Distribution
                      </h2>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={processInventoryData()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, value, percent }) =>
                                  `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                                }
                              >
                                {processInventoryData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value, name, props) => [`${value} units`, props.payload.name]}
                                contentStyle={{
                                  backgroundColor: "#1F2937",
                                  borderColor: "#374151",
                                  color: "#F9FAFB",
                                }}
                              />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={processInventoryData()}
                              layout="vertical"
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                              <XAxis type="number" tick={{ fill: "#9CA3AF" }} axisLine={{ stroke: "#4B5563" }} />
                              <YAxis
                                dataKey="name"
                                type="category"
                                tick={{ fill: "#9CA3AF" }}
                                axisLine={{ stroke: "#4B5563" }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#1F2937",
                                  borderColor: "#374151",
                                  color: "#F9FAFB",
                                }}
                              />
                              <Legend />
                              <Bar dataKey="value" name="Quantity" fill="#3B82F6" radius={[0, 4, 4, 0]}>
                                {processInventoryData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeChart === "orders" && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold flex items-center">
                        <LineChartIcon className="w-5 h-5 mr-2 text-amber-500" />
                        Order Trends
                      </h2>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={processOrdersData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis dataKey="month" tick={{ fill: "#9CA3AF" }} axisLine={{ stroke: "#4B5563" }} />
                              <YAxis tick={{ fill: "#9CA3AF" }} axisLine={{ stroke: "#4B5563" }} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#1F2937",
                                  borderColor: "#374151",
                                  color: "#F9FAFB",
                                }}
                              />
                              <Legend />
                              <Area
                                type="monotone"
                                dataKey="ordered"
                                name="Ordered"
                                stackId="1"
                                stroke="#F59E0B"
                                fill="#F59E0B"
                                fillOpacity={0.3}
                              />
                              <Area
                                type="monotone"
                                dataKey="delivered"
                                name="Delivered"
                                stackId="1"
                                stroke="#10B981"
                                fill="#10B981"
                                fillOpacity={0.3}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeChart === "performance" && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" />
                        Performance Metrics
                      </h2>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={processPerformanceData()}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis dataKey="month" tick={{ fill: "#9CA3AF" }} axisLine={{ stroke: "#4B5563" }} />
                              <YAxis yAxisId="left" tick={{ fill: "#9CA3AF" }} axisLine={{ stroke: "#4B5563" }} />
                              <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fill: "#9CA3AF" }}
                                axisLine={{ stroke: "#4B5563" }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#1F2937",
                                  borderColor: "#374151",
                                  color: "#F9FAFB",
                                }}
                              />
                              <Legend />
                              <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="inventoryTurnover"
                                name="Inventory Turnover"
                                stroke="#10B981"
                                activeDot={{ r: 8 }}
                              />
                              <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="orderCycleTime"
                                name="Order Cycle Time (days)"
                                stroke="#F59E0B"
                              />
                              <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="onTimeDelivery"
                                name="On-Time Delivery (%)"
                                stroke="#3B82F6"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Analytics */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg">
                <div className="p-6 border-b border-gray-800">
                  <h2 className="text-xl font-bold flex items-center">
                    <LineChartIcon className="w-5 h-5 mr-2 text-emerald-500" />
                    Procurement Performance Metrics
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-300">Order Cycle Time</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Average</span>
                          <span className="text-sm font-medium">18 days</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: "60%" }} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-300">Supplier Performance</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">On-time Delivery</span>
                          <span className="text-sm font-medium">75%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: "75%" }} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-300">Inventory Turnover</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Monthly Rate</span>
                          <span className="text-sm font-medium">2.4x</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: "80%" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
