"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertTriangle, X, Info } from "lucide-react"

export default function Toast({ message, type = "success", duration = 5000, onClose }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      if (onClose) onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertTriangle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  }

  const bgColors = {
    success: "bg-emerald-900/20 border-emerald-800/30",
    error: "bg-red-900/20 border-red-800/30",
    info: "bg-blue-900/20 border-blue-800/30",
  }

  const textColors = {
    success: "text-emerald-400",
    error: "text-red-400",
    info: "text-blue-400",
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center p-4 rounded-lg border ${bgColors[type]}`}
      role="alert"
    >
      <div className="flex items-center">
        {icons[type]}
        <div className="ml-3 text-sm font-medium text-white">{message}</div>
      </div>
      <button
        type="button"
        className={`ml-4 -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 ${textColors[type]} hover:bg-gray-800`}
        onClick={() => {
          setIsVisible(false)
          if (onClose) onClose()
        }}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )
}
