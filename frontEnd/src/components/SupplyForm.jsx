"use client"

import { useState, useEffect } from "react"
import { createOrUpdateDocument, updateDocumentFields } from "../services/apiService"
import { useToast } from "./ToastContext"
import { useParts } from "../hooks/useFirebaseData"

export default function SupplyForm({ supply, onSave, onCancel, isEditing = false }) {
  const { addToast } = useToast()
  const { data: partsData, loading: partsLoading } = useParts()
  const [formData, setFormData] = useState({
    supplier_id: "",
    part_id: "",
    reliability_rating: 0.9,
    lead_time_days: 14,
    min_order_qty: 10,
    price_per_unit: 100,
    location: "",
  })
  const [loading, setLoading] = useState(false)
  const [compositeId, setCompositeId] = useState("")

  useEffect(() => {
    if (supply) {
      // Extract supplier_id and part_id from the composite key
      const underscoreIndex = supply.id.indexOf("_")
      const supplierId = underscoreIndex > 0 ? supply.id.substring(0, underscoreIndex) : ""
      const partId = underscoreIndex > 0 ? supply.id.substring(underscoreIndex + 1) : ""

      setFormData({
        supplier_id: supplierId,
        part_id: partId,
        reliability_rating: supply.reliability_rating || 0.9,
        lead_time_days: supply.lead_time_days || 14,
        min_order_qty: supply.min_order_qty || 10,
        price_per_unit: supply.price_per_unit || 100,
        location: supply.location || "",
      })

      setCompositeId(supply.id)
    }
  }, [supply])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    let parsedValue = value

    if (type === "number") {
      parsedValue = Number(value)
    } else if (name === "reliability_rating") {
      parsedValue = Number(value) / 100 // Convert percentage to decimal
    }

    setFormData({
      ...formData,
      [name]: parsedValue,
    })

    // Update composite ID when supplier_id or part_id changes
    if (name === "supplier_id" || name === "part_id") {
      const newCompositeId =
        name === "supplier_id" ? `${value}_${formData.part_id}` : `${formData.supplier_id}_${value}`

      setCompositeId(newCompositeId)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create composite ID from supplier_id and part_id
      const newCompositeId = `${formData.supplier_id}_${formData.part_id}`

      // Remove supplier_id and part_id from the data to be saved
      const { supplier_id, part_id, ...dataToSave } = formData

      if (isEditing) {
        await updateDocumentFields("supply", compositeId, dataToSave)
        addToast(`Supply relationship updated successfully`, "success")
      } else {
        await createOrUpdateDocument("supply", newCompositeId, dataToSave)
        addToast(`Supply relationship created successfully`, "success")
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
      <div className="grid grid-cols-2 gap-4">
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
            disabled={isEditing}
            className={`w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white ${isEditing ? "opacity-70" : ""}`}
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
          <label htmlFor="part_id" className="block text-sm font-medium text-gray-400 mb-1">
            Part
          </label>
          <select
            id="part_id"
            name="part_id"
            value={formData.part_id}
            onChange={handleChange}
            required
            disabled={isEditing || partsLoading}
            className={`w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white ${isEditing ? "opacity-70" : ""}`}
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="reliability_rating" className="block text-sm font-medium text-gray-400 mb-1">
            Reliability Rating (%)
          </label>
          <input
            type="number"
            id="reliability_rating"
            name="reliability_rating"
            value={formData.reliability_rating * 100}
            onChange={handleChange}
            min="0"
            max="100"
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
          />
        </div>

        <div>
          <label htmlFor="lead_time_days" className="block text-sm font-medium text-gray-400 mb-1">
            Lead Time (days)
          </label>
          <input
            type="number"
            id="lead_time_days"
            name="lead_time_days"
            value={formData.lead_time_days}
            onChange={handleChange}
            min="1"
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="min_order_qty" className="block text-sm font-medium text-gray-400 mb-1">
            Min Order Quantity
          </label>
          <input
            type="number"
            id="min_order_qty"
            name="min_order_qty"
            value={formData.min_order_qty}
            onChange={handleChange}
            min="1"
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
          />
        </div>

        <div>
          <label htmlFor="price_per_unit" className="block text-sm font-medium text-gray-400 mb-1">
            Price Per Unit ($)
          </label>
          <input
            type="number"
            id="price_per_unit"
            name="price_per_unit"
            value={formData.price_per_unit}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-400 mb-1">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g., Shenzhen, China"
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
            <>{isEditing ? "Update Supply" : "Create Supply"}</>
          )}
        </button>
      </div>
    </form>
  )
}
