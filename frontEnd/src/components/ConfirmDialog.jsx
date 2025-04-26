"use client"

import { AlertTriangle } from "lucide-react"

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4 md:mx-0">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="mr-4 bg-red-900/20 p-2 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-white">{title}</h3>
          </div>
          <p className="text-gray-300 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md">
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
