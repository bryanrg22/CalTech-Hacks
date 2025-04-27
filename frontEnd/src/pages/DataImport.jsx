"use client"

import { useState } from "react"
import { Database, FileText, HelpCircle } from "lucide-react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import FileUploader from "../components/FileUploader"
import DataImportGuide from "../components/DataImportGuide"

export default function DataImport() {
  const [lastImport, setLastImport] = useState(null)

  const handleUploadComplete = () => {
    setLastImport(new Date().toLocaleString())
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64">
        <Header title="Data Import" />

        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main upload area */}
            <div className="lg:col-span-2">
              <FileUploader onUploadComplete={handleUploadComplete} />
            </div>

            {/* Sidebar with info */}
            <div className="space-y-6">
              {/* Import history */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-blue-500" />
                  Import History
                </h2>

                {lastImport ? (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Last import:</p>
                    <p className="text-white font-medium">{lastImport}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No recent imports</p>
                )}
              </div>

              {/* File format info */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-500" />
                  Required Files
                </h2>

                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <div className="bg-emerald-500/20 text-emerald-500 p-1 rounded mr-2">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-white">parts.json</p>
                      <p className="text-gray-400 text-xs">Part information</p>
                    </div>
                  </li>

                  <li className="flex items-start">
                    <div className="bg-blue-500/20 text-blue-500 p-1 rounded mr-2">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-white">orders.json</p>
                      <p className="text-gray-400 text-xs">Order information</p>
                    </div>
                  </li>

                  <li className="flex items-start">
                    <div className="bg-purple-500/20 text-purple-500 p-1 rounded mr-2">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-white">sales.json</p>
                      <p className="text-gray-400 text-xs">Sales information</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Help section */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center">
                  <HelpCircle className="w-5 h-5 mr-2 text-amber-500" />
                  Need Help?
                </h2>

                <p className="text-sm text-gray-400 mb-4">
                  For help with data imports or to learn about file format requirements, check out our documentation.
                </p>

                <button
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm font-medium"
                  onClick={() => window.open("/data-import-guide", "_blank")}
                >
                  View Documentation
                </button>
              </div>
            </div>
          </div>

          {/* Data Import Guide */}
          <div className="mt-6">
            <DataImportGuide />
          </div>
        </main>
      </div>
    </div>
  )
}
