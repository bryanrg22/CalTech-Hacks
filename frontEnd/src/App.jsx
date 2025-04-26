import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Parts from "./pages/Parts"
import Sales from "./pages/Sales"
import Orders from "./pages/Orders"
import Suppliers from "./pages/Suppliers"
import Analytics from "./pages/Analytics"
import Settings from "./pages/Settings"
import Map from "./pages/Map"
import HugoAI from "./pages/HugoAI"
import { ToastProvider } from "./components/ToastContext"

function App() {
  return (
    <Router>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<Map />} />
          <Route path="/parts" element={<Parts />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/hugo-ai" element={<HugoAI />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </ToastProvider>
    </Router>
  )
}

export default App
