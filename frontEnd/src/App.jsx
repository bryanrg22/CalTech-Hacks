import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import SignIn from "./pages/SignIn"
import Dashboard from "./pages/Dashboard"
import Parts from "./pages/Parts"
import Sales from "./pages/Sales"
import Orders from "./pages/Orders"
import Suppliers from "./pages/Suppliers"
import Analytics from "./pages/Analytics"
import Settings from "./pages/Settings"
import { ToastProvider } from "./components/ToastContext"

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/parts" element={<Parts />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    </ToastProvider>
  )
}

export default App
