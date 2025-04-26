import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { BarChart2, LineChart, PieChart, TrendingUp } from "lucide-react"
import { useSales, useOrders, useParts } from "../hooks/useFirebaseData"
import LoadingSpinner from "../components/LoadingSpinner"

export default function Analytics() {
  const { data: salesData, loading: salesLoading } = useSales()
  const { data: ordersData, loading: ordersLoading } = useOrders()
  const { data: partsData, loading: partsLoading } = useParts()

  const isLoading = salesLoading || ordersLoading || partsLoading

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
                        {Math.round(
                          (ordersData.filter((order) => order.status === "delivered").length / ordersData.length) * 100,
                        )}
                        %
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-blue-500/20 text-blue-500">
                      <PieChart className="w-6 h-6" />
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
                      <LineChart className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendingUp className="w-4 h-4 text-red-500 mr-1" transform="rotate(180)" />
                    <span className="text-sm font-medium text-red-500">+3 from last month</span>
                  </div>
                </div>
              </div>

              {/* Chart Placeholders */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg">
                  <div className="p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold flex items-center">
                      <BarChart2 className="w-5 h-5 mr-2 text-purple-500" />
                      Sales Trend Analysis
                    </h2>
                  </div>
                  <div className="p-6 h-64 flex items-center justify-center">
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <BarChart2 className="w-12 h-12 text-purple-500" />
                      </div>
                      <p className="text-gray-400 mb-2">Sales trend visualization would appear here</p>
                      <p className="text-sm text-gray-500">Implement with Chart.js or Recharts</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg">
                  <div className="p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold flex items-center">
                      <PieChart className="w-5 h-5 mr-2 text-blue-500" />
                      Inventory Distribution
                    </h2>
                  </div>
                  <div className="p-6 h-64 flex items-center justify-center">
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <PieChart className="w-12 h-12 text-blue-500" />
                      </div>
                      <p className="text-gray-400 mb-2">Inventory distribution visualization would appear here</p>
                      <p className="text-sm text-gray-500">Implement with Chart.js or Recharts</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Analytics */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg">
                <div className="p-6 border-b border-gray-800">
                  <h2 className="text-xl font-bold flex items-center">
                    <LineChart className="w-5 h-5 mr-2 text-emerald-500" />
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
