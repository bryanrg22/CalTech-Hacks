"use client"

import { useState, useEffect } from "react"
import { getDocs, query, where, orderBy, limit, collection } from "firebase/firestore"
import { db, auth } from "../firebase"

// Hook for fetching data from a collection
export function useCollection(collectionName, options = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Build query with options
        let dataQuery = collection(db, collectionName)

        if (options.where) {
          dataQuery = query(dataQuery, where(options.where.field, options.where.operator, options.where.value))
        }

        if (options.orderBy) {
          dataQuery = query(dataQuery, orderBy(options.orderBy.field, options.orderBy.direction || "asc"))
        }

        if (options.limit) {
          dataQuery = query(dataQuery, limit(options.limit))
        }

        const querySnapshot = await getDocs(dataQuery)
        const documents = []

        querySnapshot.forEach((doc) => {
          documents.push({
            id: doc.id,
            ...doc.data(),
          })
        })

        setData(documents)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)

        // If permission error, use demo data
        if (err.code === "permission-denied") {
          console.log(`Permission denied for ${collectionName}, using demo data`)
          setData(getDemoData(collectionName))
        } else {
          setError(err)
        }

        setLoading(false)
      }
    }

    fetchData()
  }, [collectionName, JSON.stringify(options)])

  return { data, loading, error }
}

// Demo data for when Firebase permissions fail
function getDemoData(collectionName) {
  switch (collectionName) {
    case "parts":
      return [
        {
          id: "P300",
          part_name: "Battery Pack 36V",
          part_type: "assembly",
          used_in_models: ["S1_V1"],
          min_stock: 15,
          quantity: 25,
          location: "WH1",
          blocked: false,
          stock_level: 30,
        },
        {
          id: "P312",
          part_name: "Battery Pack 48V",
          part_type: "assembly",
          used_in_models: ["S2_V1", "S2_V2"],
          min_stock: 20,
          quantity: 12,
          location: "WH1",
          blocked: false,
          stock_level: 10,
        },
        {
          id: "P315",
          part_name: "Controller Unit V2",
          part_type: "assembly",
          used_in_models: ["S1_V2", "S2_V1", "S2_V2"],
          min_stock: 15,
          quantity: 8,
          location: "WH2",
          blocked: false,
          stock_level: 8,
        },
        {
          id: "P320",
          part_name: "Frame Assembly S2",
          part_type: "assembly",
          used_in_models: ["S2_V1", "S2_V2"],
          min_stock: 10,
          quantity: 5,
          location: "WH3",
          blocked: false,
          stock_level: 5,
        },
      ]
    case "orders":
      return [
        {
          id: "O5124",
          part_id: "P312",
          part_name: "Battery Pack 48V",
          supplier_id: "SupA",
          supplier_name: "Electro Solutions",
          quantity: 50,
          order_date: "2024-04-15",
          expected_delivery: "2024-04-29",
          status: "ordered",
          actual_delivered_at: null,
        },
        {
          id: "O5123",
          part_id: "P315",
          part_name: "Controller Unit V2",
          supplier_id: "SupB",
          supplier_name: "Tech Components Inc",
          quantity: 30,
          order_date: "2024-04-12",
          expected_delivery: "2024-05-03",
          status: "ordered",
          actual_delivered_at: null,
        },
        {
          id: "O5118",
          part_id: "P324",
          part_name: "Motor 500W",
          supplier_id: "SupA",
          supplier_name: "Electro Solutions",
          quantity: 40,
          order_date: "2024-04-05",
          expected_delivery: "2024-04-19",
          status: "delivered",
          actual_delivered_at: "2024-04-20",
        },
      ]
    case "sales":
      return [
        {
          id: "S6001",
          model: "S2",
          version: "V1",
          quantity: 50,
          order_type: "fleet_framework",
          requested_date: "2024-05-15",
          created_at: "2024-04-10",
          accepted_request_date: "2024-04-12",
        },
        {
          id: "S6002",
          model: "S2",
          version: "V2",
          quantity: 25,
          order_type: "webshop",
          requested_date: "2024-05-10",
          created_at: "2024-04-12",
          accepted_request_date: "2024-04-13",
        },
        {
          id: "S6003",
          model: "S1",
          version: "V2",
          quantity: 30,
          order_type: "fleet_framework",
          requested_date: "2024-05-20",
          created_at: "2024-04-15",
          accepted_request_date: "2024-04-16",
        },
      ]
    case "supply":
      return [
        {
          id: "SupA_P300",
          reliability_rating: 0.95,
          lead_time_days: 14,
          min_order_qty: 10,
          price_per_unit: 500,
          location: "Shenzhen, China",
        },
        {
          id: "SupB_P315",
          reliability_rating: 0.82,
          lead_time_days: 21,
          min_order_qty: 5,
          price_per_unit: 600,
          location: "San Jose, USA",
        },
        {
          id: "SupC_P320",
          reliability_rating: 0.78,
          lead_time_days: 30,
          min_order_qty: 5,
          price_per_unit: 500,
          location: "Hamburg, Germany",
        },
        {
          id: "SupA_P312",
          reliability_rating: 0.95,
          lead_time_days: 14,
          min_order_qty: 10,
          price_per_unit: 600,
          location: "Shenzhen, China",
        },
      ]
    default:
      return []
  }
}

// Specialized hooks for each collection
export function useSales(options = {}) {
  return useCollection("sales", options)
}

export function useOrders(options = {}) {
  return useCollection("orders", options)
}

export function useParts(options = {}) {
  return useCollection("parts", options)
}

export function useSupply(options = {}) {
  return useCollection("supply", options)
}
