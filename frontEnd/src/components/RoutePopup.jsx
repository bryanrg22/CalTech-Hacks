"use client"
import { X } from "lucide-react"

export default function RoutePopup({ data, position, onClose }) {
  if (!data) return null

  return (
    <div
      className="absolute z-10 bg-white rounded-md overflow-hidden w-64 shadow-lg"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -100%) translateY(-10px)",
      }}
    >
      {/* Header */}
      <div className="bg-emerald-100/80 px-4 py-3 flex justify-between items-center">
        <h3 className="text-emerald-800 font-medium">{data.part_id}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="text-gray-500 text-sm">Order ID</div>
          <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{data.order_id}</div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-gray-500 text-sm">From</div>
          <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
            {data.supplier_name || data.supplier_id}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-gray-500 text-sm">To</div>
          <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
            {data.warehouse_name || data.warehouse_id}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-gray-500 text-sm">Distance</div>
          <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{data.distance || "Unknown"}</div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-gray-500 text-sm">ETA</div>
          <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{data.eta || "Unknown"}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between p-4 bg-gray-50">
        <button className="text-blue-600 text-sm font-medium">Details</button>
        <button className="text-blue-600 text-sm font-medium">Track</button>
      </div>
    </div>
  )
}
