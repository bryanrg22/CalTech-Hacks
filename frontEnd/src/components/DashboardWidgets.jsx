"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Upload } from "lucide-react"
import FileUploader from "./FileUploader"

export function DataImportWidget() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div
        className="p-4 border-b border-gray-800 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h2 className="text-lg font-bold flex items-center">
          <Upload className="w-5 h-5 mr-2 text-emerald-500" />
          Data Import
        </h2>
        <button className="text-gray-400 hover:text-white">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="p-4">
          <FileUploader
            onUploadComplete={() => {
              // You can add logic here to refresh data after upload
              console.log("Upload complete, refreshing data...")
            }}
          />
        </div>
      )}
    </div>
  )
}
