"use client"

import { Info } from "lucide-react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import HugoChat from "../components/HugoChat"

export default function HugoAI() {
  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64">
        <Header title="Hugo AI Assistant" />

        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Chat panel */}
            <div className="lg:col-span-2 h-full flex flex-col">
              <HugoChat />
            </div>

            {/* Info panel */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold flex items-center mb-4">
                <Info className="w-5 h-5 mr-2 text-blue-500" />
                About Hugo
              </h2>

              <div className="space-y-4 text-gray-300">
                <p>
                  Hugo is your AI procurement assistant, designed to help you manage inventory, analyze supply chain
                  data, and optimize your procurement processes.
                </p>

                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="font-medium text-white mb-2">What Hugo can do:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Answer questions about inventory status</li>
                    <li>Provide insights on supplier performance</li>
                    <li>Help with order planning and forecasting</li>
                    <li>Analyze sales trends and patterns</li>
                    <li>Suggest procurement optimizations</li>
                  </ul>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="font-medium text-white mb-2">Example questions:</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="bg-gray-700 px-3 py-2 rounded">"Which parts are running low on stock?"</li>
                    <li className="bg-gray-700 px-3 py-2 rounded">"Who is our most reliable supplier?"</li>
                    <li className="bg-gray-700 px-3 py-2 rounded">"What were our top selling models last month?"</li>
                    <li className="bg-gray-700 px-3 py-2 rounded">"When should I reorder batteries?"</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
