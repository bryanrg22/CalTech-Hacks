"use client"

import { useState, useEffect } from "react"
import {
  Home,
  Package,
  ShoppingCart,
  Truck,
  Users,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
  Map,
  Bot,
  Bell,
  Upload,
  Boxes,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [hasNotifications, setHasNotifications] = useState(false)
  const location = useLocation()

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  // Check for notifications
  useEffect(() => {
    const checkNotifications = () => {
      const storedAlert = localStorage.getItem("lowStockAlert")
      if (storedAlert) {
        try {
          const { timestamp } = JSON.parse(storedAlert)
          // Check if notification is less than 24 hours old
          const notificationTime = new Date(timestamp)
          const now = new Date()
          const timeDiff = now - notificationTime

          // If less than 24 hours old and not on notifications page, show indicator
          if (timeDiff < 24 * 60 * 60 * 1000 && location.pathname !== "/notifications") {
            setHasNotifications(true)
          } else {
            setHasNotifications(false)
          }
        } catch (error) {
          console.error("Error parsing notification data:", error)
        }
      } else {
        setHasNotifications(false)
      }
    }

    checkNotifications()

    // Check for new notifications every minute
    const interval = setInterval(checkNotifications, 60000)

    return () => clearInterval(interval)
  }, [location.pathname])

  const navItems = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Hugo AI", icon: Bot, path: "/hugo-ai" },
    { name: "Analytics", icon: BarChart2, path: "/analytics" },
    { name: "Products", icon: Boxes, path: "/products" },
    { name: "Parts", icon: Package, path: "/parts" },
    { name: "Sales", icon: ShoppingCart, path: "/sales" },
    { name: "Orders", icon: Truck, path: "/orders" },
    { name: "Suppliers", icon: Users, path: "/suppliers" },
    { name: "Map", icon: Map, path: "/map" },
    {
      name: "Notifications",
      icon: Bell,
      path: "/notifications",
      badge: hasNotifications,
    },
    { name: "Settings", icon: Settings, path: "/settings" },
  ]

  return (
    <div className="relative">
      {/* Hamburger menu button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-4 left-4 bg-gray-800 text-white p-2 rounded-md focus:outline-none md:hidden"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 z-10`}
      >
        {/* Sidebar content */}
        <div className="flex items-center justify-center h-16 bg-gray-900">
          <img
              src="/logo.png"
              alt="My profile picture"
              className="w-12 h-12 rounded-full mr-2"
            />
          <span className="text-lg font-bold">Swerve</span>
        </div>
        <nav className="mt-5">
          {navItems.map((item) => (
            <Link
              to={item.path}
              key={item.name}
              className={`flex items-center py-2 px-4 hover:bg-gray-700 transition-colors duration-200 ${
                location.pathname === item.path ? "bg-gray-700" : ""
              }`}
            >
              <item.icon className="mr-2" />
              {item.name}
              {item.badge && <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-2 h-2"></span>}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 w-full p-4">
          <button className="flex items-center py-2 px-4 hover:bg-gray-700 transition-colors duration-200 w-full justify-start">
            <LogOut className="mr-2" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
