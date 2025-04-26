"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Home, Package, ShoppingCart, Truck, Users, BarChart2, Settings, LogOut, Menu, X, Zap } from "lucide-react"

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const navItems = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Parts", icon: Package, path: "/parts" },
    { name: "Sales", icon: ShoppingCart, path: "/sales" },
    { name: "Orders", icon: Truck, path: "/orders" },
    { name: "Suppliers", icon: Users, path: "/suppliers" },
    { name: "Analytics", icon: BarChart2, path: "/analytics" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ]

  const toggleSidebar = () => {
    setExpanded(!expanded)
  }

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white md:hidden"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-gray-900 border-r border-gray-800 transition-all duration-300 ease-in-out
          ${expanded ? "w-64" : "w-20"} 
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div
            className={`flex items-center ${expanded ? "justify-between" : "justify-center"} p-4 border-b border-gray-800`}
          >
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-emerald-500" />
              {expanded && <span className="ml-2 text-xl font-semibold text-white">Voltway</span>}
            </div>

            {/* Toggle button (desktop only) */}
            <button onClick={toggleSidebar} className="hidden md:block text-gray-400 hover:text-white">
              <Menu size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center ${expanded ? "px-4" : "justify-center"} py-3 rounded-md transition-colors
                      ${
                        isActive(item.path)
                          ? "bg-emerald-600/20 text-emerald-400"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive(item.path) ? "text-emerald-400" : ""}`} />
                    {expanded && <span className="ml-3">{item.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-800">
            <Link
              to="/"
              className={`flex items-center ${expanded ? "px-4" : "justify-center"} py-3 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors`}
            >
              <LogOut className="h-5 w-5" />
              {expanded && <span className="ml-3">Logout</span>}
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
