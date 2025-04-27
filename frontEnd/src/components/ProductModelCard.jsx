"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Package, FileText, List } from "lucide-react"

export default function ProductModelCard({ model }) {
  const [expanded, setExpanded] = useState(false)
  const [showRequirements, setShowRequirements] = useState(false)

  const getStatusColor = (status, urgency) => {
    if (status === "low") {
      return urgency === "high" ? "red" : urgency === "medium" ? "amber" : "yellow"
    }
    return "emerald"
  }

  const getStatusIcon = (status) => {
    return status === "low" ? (
      <AlertTriangle className={`w-5 h-5 ${getStatusTextColor(status, model.urgency)}`} />
    ) : (
      <CheckCircle className="w-5 h-5 text-emerald-500" />
    )
  }

  const getStatusText = (status, urgency) => {
    if (status === "low") {
      return urgency === "high" ? "Critical" : urgency === "medium" ? "Warning" : "Low"
    }
    return "In Stock"
  }

  const getStatusTextColor = (status, urgency) => {
    if (status === "low") {
      return urgency === "high" ? "text-red-500" : urgency === "medium" ? "text-amber-500" : "text-yellow-500"
    }
    return "text-emerald-500"
  }

  const getStatusBgColor = (status, urgency) => {
    if (status === "low") {
      return urgency === "high"
        ? "bg-red-500/10 border-red-500/30"
        : urgency === "medium"
          ? "bg-amber-500/10 border-amber-500/30"
          : "bg-yellow-500/10 border-yellow-500/30"
    }
    return "bg-emerald-500/10 border-emerald-500/30"
  }

  // Group parts by type
  const partsByType = model.parts.reduce((acc, part) => {
    const type = part.part_type || "unknown"
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(part)
    return acc
  }, {})

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">{model.name}</h3>
          <p className="text-sm text-gray-400">Model ID: {model.id}</p>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusBgColor(
            model.status,
            model.urgency,
          )}`}
        >
          {getStatusIcon(model.status)}
          <span className={`ml-1.5 ${getStatusTextColor(model.status, model.urgency)}`}>
            {getStatusText(model.status, model.urgency)}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 bg-gray-800/50 flex flex-wrap gap-4">
        <div className="flex items-center">
          <Package className="w-4 h-4 text-purple-400 mr-1.5" />
          <span className="text-sm text-gray-300">
            <span className="font-medium">{model.parts.length}</span> parts
          </span>
        </div>
        <div className="flex items-center">
          <AlertTriangle className="w-4 h-4 text-amber-400 mr-1.5" />
          <span className="text-sm text-gray-300">
            <span className="font-medium">{model.parts.filter((p) => p.stock_status === "low").length}</span> low stock
          </span>
        </div>
        <div className="flex items-center">
          <CheckCircle className="w-4 h-4 text-emerald-400 mr-1.5" />
          <span className="text-sm text-gray-300">
            <span className="font-medium">{model.parts.filter((p) => p.stock_status === "ok").length}</span> in stock
          </span>
        </div>
      </div>

      {/* Toggle buttons */}
      <div className="flex border-t border-gray-800">
        <button
          onClick={() => {
            setExpanded(!expanded)
            if (showRequirements) setShowRequirements(false)
          }}
          className={`flex-1 p-3 flex items-center justify-center hover:bg-gray-800/70 transition-colors ${
            expanded ? "bg-gray-800/70" : "bg-gray-800/30"
          }`}
        >
          <Package className="w-4 h-4 text-gray-400 mr-1.5" />
          <span className="text-sm text-gray-400">{expanded ? "Hide" : "Show"} parts</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400 ml-1" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
          )}
        </button>

        <button
          onClick={() => {
            setShowRequirements(!showRequirements)
            if (expanded) setExpanded(false)
          }}
          className={`flex-1 p-3 flex items-center justify-center hover:bg-gray-800/70 transition-colors ${
            showRequirements ? "bg-gray-800/70" : "bg-gray-800/30"
          }`}
        >
          <FileText className="w-4 h-4 text-gray-400 mr-1.5" />
          <span className="text-sm text-gray-400">{showRequirements ? "Hide" : "Show"} requirements</span>
          {showRequirements ? (
            <ChevronUp className="w-4 h-4 text-gray-400 ml-1" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
          )}
        </button>
      </div>

      {/* Parts list (expanded) */}
      {expanded && (
        <div className="p-4 space-y-6">
          {Object.entries(partsByType).map(([type, parts]) => (
            <div key={type} className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300 capitalize">{type} Parts</h4>
              <div className="space-y-2">
                {parts.map((part) => (
                  <div
                    key={part.id}
                    className={`p-3 rounded-md border ${
                      part.stock_status === "low"
                        ? part.urgency === "high"
                          ? "bg-red-900/10 border-red-800/30"
                          : part.urgency === "medium"
                            ? "bg-amber-900/10 border-amber-800/30"
                            : "bg-yellow-900/10 border-yellow-800/30"
                        : "bg-gray-800 border-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium">{part.name}</h5>
                        <p className="text-xs text-gray-400">ID: {part.id}</p>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          part.stock_status === "low"
                            ? part.urgency === "high"
                              ? "bg-red-500/20 text-red-400"
                              : part.urgency === "medium"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {part.stock_status === "low"
                          ? part.urgency === "high"
                            ? "Critical"
                            : part.urgency === "medium"
                              ? "Warning"
                              : "Low"
                          : "In Stock"}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="bg-gray-800/80 px-3 py-2 rounded">
                        <p className="text-xs text-gray-400">Current Stock</p>
                        <p className="text-sm font-medium">{part.quantity}</p>
                      </div>
                      <div className="bg-gray-800/80 px-3 py-2 rounded">
                        <p className="text-xs text-gray-400">Min Stock</p>
                        <p className="text-sm font-medium">{part.min_stock}</p>
                      </div>
                      <div className="bg-gray-800/80 px-3 py-2 rounded">
                        <p className="text-xs text-gray-400">Required Qty</p>
                        <p className="text-sm font-medium">{part.required_qty}</p>
                      </div>
                    </div>

                    {part.notes && (
                      <div className="mt-2 text-xs text-gray-400">
                        <span className="font-medium">Notes:</span> {part.notes}
                      </div>
                    )}

                    {part.stock_status === "low" && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-800 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              part.urgency === "high"
                                ? "bg-red-600"
                                : part.urgency === "medium"
                                  ? "bg-amber-600"
                                  : "bg-yellow-600"
                            }`}
                            style={{ width: `${Math.max((part.quantity / part.min_stock) * 100, 5)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs mt-1 text-gray-400">
                          {Math.round((part.quantity / part.min_stock) * 100)}% of minimum stock
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Requirements list */}
      {showRequirements && (
        <div className="p-4 space-y-4">
          <h4 className="text-sm font-medium text-gray-300 flex items-center">
            <List className="w-4 h-4 mr-1.5 text-blue-400" />
            Requirements
          </h4>

          {model.requirements && model.requirements.length > 0 ? (
            <ul className="space-y-2">
              {model.requirements.map((req, index) => (
                <li key={index} className="bg-gray-800 p-3 rounded-md text-sm">
                  {req}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No requirements specified for this model.</p>
          )}
        </div>
      )}
    </div>
  )
}
