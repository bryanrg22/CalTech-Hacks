"use client"

import { useState, useEffect } from "react"
import { createOrUpdateDocument, updateDocumentFields } from "../services/apiService"
import { useToast } from "../components/ToastContext"
import { useParts } from "../hooks/useFirebaseData"

export default function OrderForm({ order, onSave, onCancel, isEditing = false }) {
  const { addToast } = useToast()
  const { data: partsData, loading: partsLoading } = useParts()
  const [formData, setFormData] = useState({
    part_id: "",
    supplier_id: "",
    quantity: 0,
    order_date: new Date().toISOString().split("T")[0],
    expected_delivery: "",
    status: "ordered",
    actual_delivered_at: null,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (order) {
      setFormData({
        part_id: order.part_id || "",
        supplier_id: order.supplier_id || "",
        quantity: order.quantity || order.quantity_ordered || 0,
        order_date: order.order_date || new Date().toISOString().split("T")[0],
        expected_delivery: order.expected_delivery || order.expected_delivery_date || "",
        status: order.status || "ordered",
        actual_delivered_at: order.actual_delivered_at || null,
      })
    }
  }, [order])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === "number" ? Number(value) : value,
    })
  }

  const handleStatusChange = (e) => {
    const status = e.target.value
    setFormData({
      ...formData,
      status,
      actual_delivered_at: status === "delivered" ? new Date().toISOString() : null,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEditing) {
        await updateDocumentFields("orders", order.id, formData)
        addToast(`Order ${order.id} updated successfully`, "success")
      } else {
        // Generate a new ID for the order (e.g., O5125, O5126, etc.)
        const newId = `O${Math.floor(Math.random() * 100) + 5125}`
        await createOrUpdateDocument("orders", newId, formData)
        addToast(`Order ${newId} created successfully`, "success")
      }

      if (onSave) onSave()
    } catch (error) {
      addToast(`Error: ${error.message}`, "error")
    } finally {
      setLoading(false)
    }
  }

  // List of suppliers (in a real app, this would come from the database)
  const suppliers = [
    { id: "SupA", name: "Supplier A" },
    { id: "SupB", name: "Supplier B" },
    { id: "SupC", name: "Supplier C" },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="part_id" className="block text-sm font-medium text-gray-400 mb-1">
          Part
        </label>
        <select
          id="part_id"
          name="part_id"
          value={formData.part_id}
          onChange={handleChange}
          required
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
          disabled={partsLoading}
        >
          <option value="">Select Part</option>
          {partsData &&
            partsData.map((part) => (
              <option key={part.id} value={part.id}>
                {part.part_name || part.id} ({part.id})
              </option>
            ))}
        </select>
      </div>

      <div>
        <label htmlFor="supplier_id" className="block text-sm font-medium text-gray-400 mb-1">
          Supplier
        </label>
        <select
          id="supplier_id"
          name="supplier_id"
          value={formData.supplier_id}
          onChange={handleChange}
          required
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
        >
          <option value="">Select Supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name} ({supplier.id})
            </option>
          ))}
        </select>
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="order_date" className="block text-sm font-medium text-gray-400 mb-1">
            Order Date
          </label>
          <input
            type="date"
            id="order_date"
            name="order_date"
            value={formData.order_date}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
          />
        </div>

        <div>
          <label htmlFor="expected_delivery" className="block text-sm font-medium text-gray-400 mb-1">
            Expected Delivery
          </label>
          <input
            type="date"
            id="expected_delivery"
            name="expected_delivery"
            value={formData.expected_delivery}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-400 mb-1">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleStatusChange}
          required
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
        >
          <option value="ordered">Ordered</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {formData.status === "delivered" && (
        <div className="p-4 bg-emerald-900/20 border border-emerald-800/30 rounded-lg">
          <p className="text-sm text-emerald-400">
            This order will be marked as delivered as of {new Date().toLocaleDateString()}.
          </p>
        </div>
      )}

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
            <>{isEditing ? "Update Order" : "Create Order"}</>
          )}
        </button>
      </div>
    </form>
  )
}
