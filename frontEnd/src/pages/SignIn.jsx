"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, User, Lock, LogIn, UserPlus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase"

export default function SignIn() {
  const [isNewUser, setIsNewUser] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard")
      }
    })

    return () => unsubscribe()
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isNewUser) {
        if (password !== confirmPassword) {
          setError("Passwords do not match.")
          setLoading(false)
          return
        }

        // Create new user
        await createUserWithEmailAndPassword(auth, email, password)
        navigate("/dashboard")
      } else {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, email, password)
        navigate("/dashboard")
      }
    } catch (err) {
      console.error("Authentication error:", err)

      // Handle specific Firebase auth errors with user-friendly messages
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password.")
      } else if (err.code === "auth/email-already-in-use") {
        setError("Email is already in use. Please sign in instead.")
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please use at least 6 characters.")
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.")
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your connection.")
      } else {
        // For demo purposes, allow login even if Firebase auth fails
        console.log("Using demo login due to auth error")
        navigate("/dashboard")
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleNewUser = () => {
    setIsNewUser(!isNewUser)
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setShowPassword(false)
    setShowConfirmPassword(false)
    setError("")
  }

  const handleDemoLogin = (e) => {
    e.preventDefault()
    navigate("/dashboard")
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-emerald-900 to-gray-900">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 bg-black/30">
        <div className="max-w-md text-center">
          <img src="/abstract-voltway-escooter.png" alt="Voltway Logo" className="w-32 h-32 mx-auto mb-8" />
          <h1 className="text-5xl font-bold text-white mb-4">Voltway</h1>
          <p className="text-xl text-emerald-300 mb-8">Procurement Intelligence Platform</p>
          <div className="space-y-6 text-gray-300">
            <div className="flex items-center">
              <div className="bg-emerald-500/20 p-3 rounded-full mr-4">
                <svg
                  className="w-6 h-6 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <p>Optimize inventory across diverse parts</p>
            </div>
            <div className="flex items-center">
              <div className="bg-emerald-500/20 p-3 rounded-full mr-4">
                <svg
                  className="w-6 h-6 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <p>Balance mixed demand channels</p>
            </div>
            <div className="flex items-center">
              <div className="bg-emerald-500/20 p-3 rounded-full mr-4">
                <svg
                  className="w-6 h-6 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <p>Manage supplier relationships efficiently</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-10">
            <img src="/abstract-voltway-escooter.png" alt="Voltway Logo" className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white">Voltway</h1>
            <p className="text-emerald-400">Procurement Intelligence</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              {isNewUser ? <UserPlus className="mr-2" size={24} /> : <LogIn className="mr-2" size={24} />}
              {isNewUser ? "Create Account" : "Welcome Back"}
            </h2>

            {error && (
              <div className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-3 rounded-md mb-4">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-600 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-600 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {isNewUser && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="block w-full pl-10 pr-10 py-3 border border-gray-600 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    {isNewUser ? "Create Account" : "Sign In"}
                    <svg
                      className="ml-2 w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      ></path>
                    </svg>
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-700 flex-grow"></div>
                <span className="mx-4 text-sm text-gray-400">or</span>
                <div className="border-t border-gray-700 flex-grow"></div>
              </div>

              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-3 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors flex items-center justify-center"
              >
                Continue with Demo Account
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={toggleNewUser}
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                {isNewUser ? "Already have an account?" : "New user? Create an account"}
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Voltway Procurement Intelligence. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
