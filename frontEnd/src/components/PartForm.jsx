"use client"

import { useState, useEffect } from "react"
import { createOrUpdateDocument, updateDocumentFields } from "../services/apiService"
import { useToast } from "../components/ToastContext"

export default function PartForm({ part, onSave, onCancel, isEditing = false }) {
  const { addToast } = useToast()
  const [formData, setFormData] = useState({
    part_name: "",
    part_type: "",
    quantity: 0,
    min_stock: 0,
    location: "",
    used_in_models: [],
    blocked: false,
  })
  const [loading, setLoading] = useState(false)
  const [modelInput, setModelInput] = useState("")

  useEffect(() => {
    if (part) {
      setFormData({
        part_name: part.part_name || "",
        part_type: part.part_type || "",
        quantity: part.quantity || 0,
        min_stock: part.min_stock || 0,
        location: part.location || "",
        used_in_models: part.used_in_models || [],
        blocked: part.blocked || false,
      })
    }
  }, [part])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    })
  }

  const addModel = () => {
    if (modelInput.trim() && !formData.used_in_models.includes(modelInput.trim())) {
      setFormData({
        ...formData,
        used_in_models: [...formData.used_in_models, modelInput.trim()],
      })
      setModelInput("")
    }
  }

  const removeModel = (model) => {
    setFormData({
      ...formData,
      used_in_models: formData.used_in_models.filter((m) => m !== model),
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEditing) {
        await updateDocumentFields("parts", part.id, formData)
        addToast(`Part ${part.id} updated successfully`, "success")
      } else {
        // Generate a new ID for the part (e.g., P400, P401, etc.)
        const newId = `P${Math.floor(Math.random() * 100) + 400}`
        await createOrUpdateDocument("parts", newId, formData)
        addToast(`Part ${newId} created successfully`, "success")
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
      <div>
        <label htmlFor="part_name" className="block text-sm font-medium text-gray-400 mb-1">
          Part Name
        </label>
        <input
          type="text"
          id="part_name"
          name="part_name"
          value={formData.part_name}
          onChange={handleChange}
          required
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
        />
      </div>

      <div>
        <label htmlFor="part_type" className="block text-sm font-medium text-gray-400 mb-1">
          Part Type
        </label>
        <select
          id="part_type"
          name="part_type"
          value={formData.part_type}
          onChange={handleChange}
          required
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
        >
          <option value="">Select Type</option>
          <option value="assembly">Assembly</option>
          <option value="electronic">Electronic</option>
          <option value="mechanical">Mechanical</option>
          <option value="frame">Frame</option>
          <option value="battery">Battery</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
            min="0"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
          />
        </div>

        <div>
          <label htmlFor="min_stock" className="block text-sm font-medium text-gray-400 mb-1">
            Min Stock
          </label>
          <input
            type="number"
            id="min_stock"
            name="min_stock"
            value={formData.min_stock}
            onChange={handleChange}
            min="0"
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
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">Used In Models</label>
        <div className="flex">
          <input
            type="text"
            value={modelInput}
            onChange={(e) => setModelInput(e.target.value)}
            placeholder="e.g. S1_V1"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-l-lg p-2.5 text-white"
          />
          <button
            type="button"
            onClick={addModel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 rounded-r-lg"
          >
            Add
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.used_in_models.map((model) => (
            <div key={model} className="bg-gray-800 text-white px-3 py-1 rounded-full flex items-center">
              <span className="mr-1">{model}</span>
              <button type="button" onClick={() => removeModel(model)} className="text-gray-400 hover:text-white">
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="blocked"
          name="blocked"
          checked={formData.blocked}
          onChange={handleChange}
          className="w-4 h-4 bg-gray-800 border-gray-700 rounded"
        />
        <label htmlFor="blocked" className="ml-2 text-sm font-medium text-gray-400">
          Blocked
        </label>
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
            <>{isEditing ? "Update Part" : "Create Part"}</>
          )}
        </button>
      </div>
    </form>
  )
}
