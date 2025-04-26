"use client"

import { useState, useEffect } from "react"
import { createOrUpdateDocument, updateDocumentFields } from "../services/apiService"
import { useToast } from "../components/ToastContext"

export default function SaleForm({ sale, onSave, onCancel, isEditing = false }) {
  const { addToast } = useToast()
  const [formData, setFormData] = useState({
    model: "S2",
    version: "V1",
    quantity: 1,
    order_type: "webshop",
    requested_date: "",
    created_at: new Date().toISOString().split("T")[0],
    accepted_request_date: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sale) {
      setFormData({
        model: sale.model || "S2",
        version: sale.version || "V1",
        quantity: sale.quantity || 1,
        order_type: sale.order_type || "webshop",
        requested_date: sale.requested_date || "",
        created_at: sale.created_at || new Date().toISOString().split("T")[0],
        accepted_request_date: sale.accepted_request_date || "",
      })
    }
  }, [sale])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === "number" ? Number(value) : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEditing) {
        await updateDocumentFields("sales", sale.id, formData)
        addToast(`Sale ${sale.id} updated successfully`, "success")
      } else {
        // Generate a new ID for the sale (e.g., S6004, S6005, etc.)
        const newId = `S${Math.floor(Math.random() * 100) + 6004}`
        await createOrUpdateDocument("sales", newId, formData)
        addToast(`Sale ${newId} created successfully`, "success")
      }

      if (onSave) onSave()
    } catch (error) {
      addToast(`Error: ${error.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-400 mb-1">
            Model
          </label>
          <select
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
          >
            <option value="S1">S1</option>
            <option value="S2">S2</option>
          </select>
        </div>

        <div>
          <label htmlFor="version" className="block text-sm font-medium text-gray-400 mb-1">
            Version
          </label>
          <select
            id="version"
            name="version"
            value={formData.version}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
          >
            <option value="V1">V1</option>
            <option value="V2">V2</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-400 mb-1">
          Quantity
        </label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="1"
          required
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
        />
      </div>

      <div>
        <label htmlFor="order_type" className="block text-sm font-medium text-gray-400 mb-1">
          Order Type
        </label>
        <select
          id="order_type"
          name="order_type"
          value={formData.order_type}
          onChange={handleChange}
          required
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
        >
          <option value="webshop">Webshop</option>
          <option value="fleet_framework">Fleet Framework</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="created_at" className="block text-sm font-medium text-gray-400 mb-1">
            Created Date
          </label>
          <input
            type="date"
            id="created_at"
            name="created_at"
            value={formData.created_at}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
          />
        </div>

        <div>
          <label htmlFor="requested_date" className="block text-sm font-medium text-gray-400 mb-1">
            Requested Delivery Date
          </label>
          <input
            type="date"
            id="requested_date"
            name="requested_date"
            value={formData.requested_date}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="accepted_request_date" className="block text-sm font-medium text-gray-400 mb-1">
          Accepted Request Date
        </label>
        <input
          type="date"
          id="accepted_request_date"
          name="accepted_request_date"
          value={formData.accepted_request_date}
          onChange={handleChange}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </>
          ) : (
            <>{isEditing ? "Update Sale" : "Create Sale"}</>
          )}
        </button>
      </div>
    </form>
  )
}
