"use client"

import { useState, useRef } from "react"
import { Upload, X, FileText, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import { useToast } from "./ToastContext"
import { db } from "../firebase"
import { doc, setDoc, getDoc, updateDoc, increment } from "firebase/firestore"
import { checkPartsUpdateWithHugo } from "../services/apiService"
import { useNavigate } from "react-router-dom"

export default function FileUploader({ onUploadComplete }) {
  const [files, setFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [uploadedFiles, setUploadedFiles] = useState({
    "parts.json": false,
    "orders.json": false,
    "sales.json": false,
  })
  const fileInputRef = useRef(null)
  const { addToast } = useToast()
  const navigate = useNavigate()

  // Store parsed data from files
  const [parsedData, setParsedData] = useState({
    parts: null,
    orders: null,
    sales: null,
  })

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    handleFiles(selectedFiles)
  }

  const handleFiles = (newFiles) => {
    // Filter for only JSON files
    const jsonFiles = newFiles.filter((file) => file.name.endsWith(".json"))

    if (jsonFiles.length !== newFiles.length) {
      addToast("Only JSON files are supported", "warning")
    }

    // Check if the files are the expected ones
    const validFileNames = ["parts.json", "orders.json", "sales.json"]
    const validFiles = jsonFiles.filter((file) => validFileNames.includes(file.name))

    if (validFiles.length !== jsonFiles.length) {
      addToast("Only parts.json, orders.json, and sales.json files are supported", "warning")
    }

    // Initialize progress for each file
    const newProgress = { ...uploadProgress }
    validFiles.forEach((file) => {
      newProgress[file.name] = 0
    })
    setUploadProgress(newProgress)

    // Add files to state, replacing any existing file with the same name
    setFiles((prev) => {
      const existingFileNames = prev.map((f) => f.name)
      const filesToKeep = prev.filter((f) => !validFiles.some((newFile) => newFile.name === f.name))
      return [...filesToKeep, ...validFiles]
    })

    // Parse the JSON files
    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)

          if (file.name === "parts.json") {
            setParsedData((prev) => ({ ...prev, parts: data }))
          } else if (file.name === "orders.json") {
            setParsedData((prev) => ({ ...prev, orders: data }))
          } else if (file.name === "sales.json") {
            setParsedData((prev) => ({ ...prev, sales: data }))
          }
        } catch (error) {
          addToast(`Error parsing ${file.name}: ${error.message}`, "error")
          removeFile(file.name)
        }
      }
      reader.readAsText(file)
    })
  }

  const removeFile = (fileName) => {
    setFiles(files.filter((file) => file.name !== fileName))

    // Remove from progress tracking
    const newProgress = { ...uploadProgress }
    delete newProgress[fileName]
    setUploadProgress(newProgress)

    // Reset parsed data for this file
    if (fileName === "parts.json") {
      setParsedData((prev) => ({ ...prev, parts: null }))
    } else if (fileName === "orders.json") {
      setParsedData((prev) => ({ ...prev, orders: null }))
    } else if (fileName === "sales.json") {
      setParsedData((prev) => ({ ...prev, sales: null }))
    }

    // Reset uploaded status
    setUploadedFiles((prev) => ({ ...prev, [fileName]: false }))
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    setIsUploading(true)
    const newUploadedFiles = { ...uploadedFiles }

    try {
      // Process each file
      for (const file of files) {
        // Update progress to 10%
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: 10,
        }))

        if (file.name === "parts.json" && parsedData.parts) {
          await uploadPartsData(parsedData.parts)
          newUploadedFiles["parts.json"] = true
        } else if (file.name === "orders.json" && parsedData.orders) {
          await uploadOrdersData(parsedData.orders)
          newUploadedFiles["orders.json"] = true
        } else if (file.name === "sales.json" && parsedData.sales) {
          await uploadSalesData(parsedData.sales)
          newUploadedFiles["sales.json"] = true
        }

        // Update progress to 100%
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: 100,
        }))
      }

      // If orders were uploaded and we have parts data, update specs quantities
      if (newUploadedFiles["orders.json"] && parsedData.parts) {
        await updateSpecsQuantities(parsedData.orders, parsedData.parts)
      }

      setUploadedFiles(newUploadedFiles)
      addToast("Files uploaded successfully to Firebase", "success")

      // Notify parent component if needed
      if (onUploadComplete) {
        onUploadComplete()
      }

      // Get parts update from ChatGPT
      if (newUploadedFiles["parts.json"]) {
        try {
          // Show a notification that we're checking inventory
          addToast("Getting parts update from AI...", "info")

          // Wait a moment to ensure data is properly saved in Firebase
          setTimeout(async () => {
            await checkPartsUpdateWithHugo(true) // true = send to Slack

            // Show notification with link to notifications page
            addToast(
              <div>
                Parts update complete.
                <button
                  className="ml-2 underline text-blue-400 hover:text-blue-300"
                  onClick={() => navigate("/notifications")}
                >
                  View update
                </button>
              </div>,
              "success",
              8000,
            )
          }, 2000)
        } catch (error) {
          console.error("Error getting parts update:", error)
        }
      }
    } catch (error) {
      console.error("Upload error:", error)
      addToast(`Upload failed: ${error.message}`, "error")
    } finally {
      setIsUploading(false)
    }
  }

  // Upload parts data to Firebase
  const uploadPartsData = async (partsData) => {
    try {
      // Upload each part to parts/{part_id}
      const promises = Object.entries(partsData).map(async ([partId, partData]) => {
        await setDoc(doc(db, "parts", partId), partData)
      })

      await Promise.all(promises)
      addToast("Parts data uploaded successfully", "success")
    } catch (error) {
      throw new Error(`Error uploading parts data: ${error.message}`)
    }
  }

  // Upload orders data to Firebase
  const uploadOrdersData = async (ordersData) => {
    try {
      // Upload each order to orders/{order_id}
      const promises = Object.entries(ordersData).map(async ([orderId, orderData]) => {
        await setDoc(doc(db, "orders", orderId), orderData)
      })

      await Promise.all(promises)
      addToast("Orders data uploaded successfully", "success")
    } catch (error) {
      throw new Error(`Error uploading orders data: ${error.message}`)
    }
  }

  // Upload sales data to Firebase
  const uploadSalesData = async (salesData) => {
    try {
      // Upload each sale to sales/{sale_id}
      const promises = Object.entries(salesData).map(async ([saleId, saleData]) => {
        await setDoc(doc(db, "sales", saleId), saleData)
      })

      await Promise.all(promises)
      addToast("Sales data uploaded successfully", "success")
    } catch (error) {
      throw new Error(`Error uploading sales data: ${error.message}`)
    }
  }

  // Update specs quantities based on orders and parts data
  const updateSpecsQuantities = async (ordersData, partsData) => {
    try {
      // Process each order
      for (const [orderId, orderData] of Object.entries(ordersData)) {
        const { part_id, quantity_ordered } = orderData

        // Find the part in parts data
        const part = partsData[part_id]
        if (!part) {
          console.warn(`Part ${part_id} not found in parts data`)
          continue
        }

        // Get models that use this part
        const models = part.used_in_models || []

        // Update specs/scanned_{model}_specs for each model
        for (const model of models) {
          try {
            // Check if the document exists
            const specRef = doc(db, "specs", `scanned_${model}_specs`)
            const specDoc = await getDoc(specRef)

            if (specDoc.exists()) {
              // Update existing document
              await updateDoc(specRef, {
                quantity: increment(quantity_ordered),
              })
            } else {
              // Create new document
              await setDoc(specRef, {
                quantity: quantity_ordered,
              })
            }

            console.log(`Updated specs/scanned_${model}_specs quantity by ${quantity_ordered}`)
          } catch (error) {
            console.error(`Error updating specs/scanned_${model}_specs quantity:`, error)
          }
        }
      }

      addToast("Specs quantities updated successfully", "success")
    } catch (error) {
      throw new Error(`Error updating specs quantities: ${error.message}`)
    }
  }

  const getFileIcon = (fileName) => {
    if (fileName === "parts.json") {
      return <FileText className="text-emerald-500" />
    } else if (fileName === "orders.json") {
      return <FileText className="text-blue-500" />
    } else if (fileName === "sales.json") {
      return <FileText className="text-purple-500" />
    } else {
      return <FileText className="text-gray-500" />
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Upload className="w-5 h-5 mr-2 text-emerald-500" />
        Import Data
      </h2>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging ? "border-emerald-500 bg-emerald-500/10" : "border-gray-700 hover:border-gray-500"
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          multiple
          accept=".json"
          className="hidden"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center justify-center">
          <Upload className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-lg font-medium text-gray-300 mb-1">
            {isDragging ? "Drop files here" : "Drag and drop JSON files here"}
          </p>
          <p className="text-sm text-gray-500 mb-3">or click to browse</p>
          <p className="text-xs text-gray-600">Required files: parts.json, orders.json, sales.json</p>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Files to upload ({files.length}/3)</h3>
          <div className="space-y-3">
            {files.map((file) => (
              <div key={file.name} className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center">
                  {getFileIcon(file.name)}
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>

                <div className="flex items-center">
                  {uploadProgress[file.name] > 0 && uploadProgress[file.name] < 100 ? (
                    <div className="w-24 bg-gray-700 rounded-full h-2 mr-3">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${uploadProgress[file.name]}%` }}
                      ></div>
                    </div>
                  ) : uploadProgress[file.name] === 100 ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 mr-3" />
                  ) : null}

                  {!isUploading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(file.name)
                      }}
                      className="text-gray-400 hover:text-red-500"
                      disabled={isUploading}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={uploadFiles}
              disabled={isUploading || files.length === 0}
              className={`flex items-center px-4 py-2 rounded-lg text-white font-medium ${
                isUploading || files.length === 0
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  Import Data
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="mt-6 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-1">Required JSON Files</h4>
            <ul className="text-xs text-gray-500 list-disc pl-4 space-y-1">
              <li>
                <span className="text-emerald-500">parts.json</span> - Contains part information
              </li>
              <li>
                <span className="text-blue-500">orders.json</span> - Contains order information
              </li>
              <li>
                <span className="text-purple-500">sales.json</span> - Contains sales information
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-2">
              The system will upload data to Firebase and update specs quantities based on orders and parts data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
