"use client"

import { ArrowRight, CheckCircle, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { useParts } from "../../hooks/useFirebaseData"

export default function OrdersTable({ ordersData }) {
  const { data: partsData, loading: partsLoading } = useParts()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    if (ordersData && ordersData.length > 0 && partsData && partsData.length > 0) {
      // Enrich orders with part names
      const enrichedOrders = ordersData.map((order) => {
        const part = partsData.find((p) => p.id === order.part_id)
        return {
          ...order,
          part_name: part ? part.part_name || `Part ${part.id}` : `Unknown Part (${order.part_id})`,
        }
      })

      setOrders(enrichedOrders)
    }
  }, [ordersData, partsData])

  if (orders.length === 0) {
    return <p className="text-gray-400">No orders found.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-400 uppercase bg-gray-800">
          <tr>
            <th scope="col" className="px-4 py-3 rounded-tl-lg">
              Order ID
            </th>
            <th scope="col" className="px-4 py-3">
              Part
            </th>
            <th scope="col" className="px-4 py-3">
              Supplier
            </th>
            <th scope="col" className="px-4 py-3">
              Quantity
            </th>
            <th scope="col" className="px-4 py-3">
              Order Date
            </th>
            <th scope="col" className="px-4 py-3">
              Expected Delivery
            </th>
            <th scope="col" className="px-4 py-3">
              Status
            </th>
            <th scope="col" className="px-4 py-3 rounded-tr-lg">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order.id} className={`border-b border-gray-800 ${index % 2 === 0 ? "bg-gray-800/30" : ""}`}>
              <td className="px-4 py-3 font-medium">{order.id}</td>
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium">{order.part_name}</div>
                  <div className="text-xs text-gray-400">{order.part_id}</div>
                </div>
              </td>
              <td className="px-4 py-3">{order.supplier_id}</td>
              <td className="px-4 py-3">{order.quantity_ordered || order.quantity}</td>
              <td className="px-4 py-3">{order.order_date}</td>
              <td className="px-4 py-3">{order.expected_delivery_date || order.expected_delivery}</td>
              <td className="px-4 py-3">
                {order.status === "delivered" ? (
                  <span className="flex items-center text-emerald-500">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Delivered
                  </span>
                ) : (
                  <span className="flex items-center text-amber-500">
                    <Clock className="w-4 h-4 mr-1" />
                    Pending
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <button className="text-emerald-500 hover:text-emerald-400 flex items-center">
                  Details
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
