"use client"

import { useState } from "react"
import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import { Save, User, Shield, Bell, Database, Globe, Key } from "lucide-react"

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account")

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-64">
        <Header title="Settings" />

        <main className="flex-1 overflow-auto p-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Settings Navigation */}
              <div className="w-full md:w-64 bg-gray-800/50">
                <nav className="p-4">
                  <ul className="space-y-1">
                    <li>
                      <button
                        className={`flex items-center w-full px-4 py-3 rounded-md transition-colors ${
                          activeTab === "account"
                            ? "bg-emerald-600/20 text-emerald-400"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`}
                        onClick={() => setActiveTab("account")}
                      >
                        <User className="w-5 h-5 mr-3" />
                        Account
                      </button>
                    </li>
                    <li>
                      <button
                        className={`flex items-center w-full px-4 py-3 rounded-md transition-colors ${
                          activeTab === "security"
                            ? "bg-emerald-600/20 text-emerald-400"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`}
                        onClick={() => setActiveTab("security")}
                      >
                        <Shield className="w-5 h-5 mr-3" />
                        Security
                      </button>
                    </li>
                    <li>
                      <button
                        className={`flex items-center w-full px-4 py-3 rounded-md transition-colors ${
                          activeTab === "notifications"
                            ? "bg-emerald-600/20 text-emerald-400"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`}
                        onClick={() => setActiveTab("notifications")}
                      >
                        <Bell className="w-5 h-5 mr-3" />
                        Notifications
                      </button>
                    </li>
                    <li>
                      <button
                        className={`flex items-center w-full px-4 py-3 rounded-md transition-colors ${
                          activeTab === "database"
                            ? "bg-emerald-600/20 text-emerald-400"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`}
                        onClick={() => setActiveTab("database")}
                      >
                        <Database className="w-5 h-5 mr-3" />
                        Database
                      </button>
                    </li>
                    <li>
                      <button
                        className={`flex items-center w-full px-4 py-3 rounded-md transition-colors ${
                          activeTab === "api"
                            ? "bg-emerald-600/20 text-emerald-400"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`}
                        onClick={() => setActiveTab("api")}
                      >
                        <Globe className="w-5 h-5 mr-3" />
                        API Access
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>

              {/* Settings Content */}
              <div className="flex-1 p-6">
                {activeTab === "account" && (
                  <div>
                    <h2 className="text-xl font-bold mb-6">Account Settings</h2>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
                          defaultValue="Admin User"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
                          defaultValue="admin@voltway.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-400 mb-2">
                          Role
                        </label>
                        <select
                          id="role"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
                        >
                          <option>Administrator</option>
                          <option>Procurement Manager</option>
                          <option>Inventory Manager</option>
                          <option>Sales Manager</option>
                        </select>
                      </div>
                      <div>
                        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center">
                          <Save className="w-5 h-5 mr-2" />
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div>
                    <h2 className="text-xl font-bold mb-6">Security Settings</h2>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-400 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="current-password"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-400 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="new-password"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-400 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirm-password"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
                        />
                      </div>
                      <div>
                        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center">
                          <Key className="w-5 h-5 mr-2" />
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div>
                    <h2 className="text-xl font-bold mb-6">Notification Settings</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Low Stock Alerts</h3>
                          <p className="text-sm text-gray-400">Get notified when inventory is running low</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Order Updates</h3>
                          <p className="text-sm text-gray-400">Get notified about order status changes</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Sales Notifications</h3>
                          <p className="text-sm text-gray-400">Get notified about new sales orders</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">System Notifications</h3>
                          <p className="text-sm text-gray-400">Get notified about system updates and maintenance</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                      <div className="mt-6">
                        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center">
                          <Save className="w-5 h-5 mr-2" />
                          Save Preferences
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "database" && (
                  <div>
                    <h2 className="text-xl font-bold mb-6">Database Settings</h2>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="firebase-project" className="block text-sm font-medium text-gray-400 mb-2">
                          Firebase Project ID
                        </label>
                        <input
                          type="text"
                          id="firebase-project"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
                          defaultValue="hacktech-cce3f"
                          readOnly
                        />
                      </div>
                      <div>
                        <label htmlFor="firebase-region" className="block text-sm font-medium text-gray-400 mb-2">
                          Firebase Region
                        </label>
                        <select
                          id="firebase-region"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
                        >
                          <option>us-central1</option>
                          <option>us-east1</option>
                          <option>us-west1</option>
                          <option>europe-west1</option>
                          <option>asia-east1</option>
                        </select>
                      </div>
                      <div className="p-4 bg-amber-900/20 border border-amber-800/30 rounded-lg">
                        <h3 className="font-medium text-amber-400 mb-2">Firebase Security Rules</h3>
                        <p className="text-sm text-gray-300 mb-4">
                          Your current Firebase security rules are preventing data access. Please update your rules in
                          the Firebase console to allow read/write operations.
                        </p>
                        <pre className="bg-gray-800 p-3 rounded-md text-xs overflow-auto">
                          {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}
                        </pre>
                      </div>
                      <div>
                        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center">
                          <Save className="w-5 h-5 mr-2" />
                          Save Database Settings
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "api" && (
                  <div>
                    <h2 className="text-xl font-bold mb-6">API Access Settings</h2>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="api-key" className="block text-sm font-medium text-gray-400 mb-2">
                          API Key
                        </label>
                        <div className="flex">
                          <input
                            type="password"
                            id="api-key"
                            className="w-full bg-gray-800 border border-gray-700 rounded-l-lg p-2.5 text-white"
                            defaultValue="AIzaSyCel2lcphKfP3ruLV5v-P9aRtgVhnjI7uI"
                            readOnly
                          />
                          <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 rounded-r-lg">Show</button>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="api-status" className="block text-sm font-medium text-gray-400 mb-2">
                          API Status
                        </label>
                        <div className="flex items-center">
                          <span className="inline-block w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                          <span>Active</span>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="api-rate-limit" className="block text-sm font-medium text-gray-400 mb-2">
                          Rate Limit
                        </label>
                        <select
                          id="api-rate-limit"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
                        >
                          <option>100 requests/minute</option>
                          <option>500 requests/minute</option>
                          <option>1000 requests/minute</option>
                          <option>Unlimited</option>
                        </select>
                      </div>
                      <div>
                        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center">
                          <Key className="w-5 h-5 mr-2" />
                          Regenerate API Key
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
