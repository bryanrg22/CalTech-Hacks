"use client"

import { useState, useEffect } from "react"
import { Bell, AlertTriangle, Clock, CheckCircle, RefreshCw } from "lucide-react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { chatWithHugo } from "../services/apiService"
import { useToast } from "../components/ToastContext"

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      // Check if we have a stored parts update
      const storedUpdate = localStorage.getItem("partsUpdate")

      if (storedUpdate) {
        const { message, timestamp } = JSON.parse(storedUpdate)

        // Add the stored update to notifications
        setNotifications([
          {
            id: "parts-update",
            type: "info",
            title: "Parts Status Update",
            message: message,
            timestamp: new Date(timestamp),
            read: false,
          },
        ])
      } else {
        // If no stored update, show empty state
        setNotifications([])
      }
    } catch (error) {
      console.error("Error loading notifications:", error)
      addToast("Failed to load notifications", "error")
    } finally {
      setLoading(false)
    }
  }

  const refreshNotifications = async () => {
    setRefreshing(true)
    try {
      // Ask ChatGPT for parts update
      const response = await chatWithHugo("update user on orders, parts, sales, specs, and supply")

      // Save the response to localStorage
      localStorage.setItem(
        "partsUpdate",
        JSON.stringify({
          message: response,
          timestamp: new Date().toISOString(),
        }),
      )

      // Update notifications
      setNotifications([
        {
          id: "parts-update",
          type: "info",
          title: "Parts Status Update",
          message: response,
          timestamp: new Date(),
          read: false,
        },
      ])

      addToast("Parts status updated", "success")
    } catch (error) {
      console.error("Error refreshing parts status:", error)
      addToast("Failed to refresh parts status", "error")
    } finally {
      setRefreshing(false)
    }
  }

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />
      case "info":
        return <Clock className="w-5 h-5 text-blue-500" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64">
        <Header title="Notifications" />

        <main className="flex-1 overflow-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <Bell className="w-5 h-5 mr-2 text-blue-500" />
              Parts Status Updates
            </h2>
            <button
              onClick={refreshNotifications}
              disabled={refreshing}
              className={`flex items-center px-3 py-2 rounded-md text-sm ${
                refreshing ? "bg-gray-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Updating..." : "Get Update"}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-gray-900 border rounded-lg shadow-lg overflow-hidden ${
                    notification.read ? "border-gray-800" : "border-blue-800"
                  }`}
                >
                  <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <div className="flex items-center">
                      {getNotificationIcon(notification.type)}
                      <h3 className="font-medium ml-2">{notification.title}</h3>
                    </div>
                    <span className="text-xs text-gray-400">{formatTimestamp(notification.timestamp)}</span>
                  </div>
                  <div className="p-4">
                    <div className="text-gray-300 whitespace-pre-wrap">{notification.message}</div>
                  </div>
                  <div className="px-4 py-3 bg-gray-800 flex justify-between">
                    <button
                      onClick={() => {
                        try {
                          const { sendSlackMessage, formatSlackInventoryAlert } = require("../services/slackService")
                          sendSlackMessage(formatSlackInventoryAlert(notification.message))
                            .then(() => addToast("Update sent to Slack", "success"))
                            .catch((error) => addToast(`Failed to send to Slack: ${error.message}`, "error"))
                        } catch (error) {
                          addToast(`Failed to send to Slack: ${error.message}`, "error")
                        }
                      }}
                      className="text-sm text-green-400 hover:text-green-300 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                      </svg>
                      Send to Slack
                    </button>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-sm text-blue-400 hover:text-blue-300"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Bell className="w-12 h-12 mb-4 text-gray-600" />
              <p className="text-lg">No updates yet</p>
              <p className="text-sm mt-2">Click "Get Update" to receive the latest information about parts status</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
