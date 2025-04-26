"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Loader } from "lucide-react"
import { chatWithHugo } from "../services/apiService"
import { useToast } from "./ToastContext"

export default function HugoChat() {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const { addToast } = useToast()
  const inputRef = useRef(null)

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e) => {
    e?.preventDefault()

    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue("")

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage, timestamp: new Date() }])

    // Set loading state
    setIsLoading(true)

    try {
      // Send message to Hugo
      const response = await chatWithHugo(userMessage)

      // Add Hugo's response to chat
      setMessages((prev) => [...prev, { role: "assistant", content: response, timestamp: new Date() }])
    } catch (error) {
      console.error("Error chatting with Hugo:", error)
      addToast(`Failed to get response: ${error.message}`, "error")

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: "Sorry, I encountered an error processing your request. Please try again.",
          timestamp: new Date(),
          isError: true,
        },
      ])
    } finally {
      setIsLoading(false)
      // Focus the input field after sending
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Chat header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center border-b border-gray-700">
        <Bot className="w-5 h-5 text-emerald-500 mr-2" />
        <h2 className="text-lg font-medium">Hugo AI Assistant</h2>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
            <Bot className="w-12 h-12 text-emerald-500" />
            <p className="text-center">Hi, I'm Hugo! Ask me anything about procurement or inventory management.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === "user"
                    ? "bg-emerald-600 text-white"
                    : message.role === "system"
                      ? message.isError
                        ? "bg-red-900/30 border border-red-800/50 text-white"
                        : "bg-gray-700 text-white"
                      : "bg-gray-800 text-white"
                }`}
              >
                <div className="flex items-center mb-1">
                  {message.role === "user" ? (
                    <>
                      <span className="font-medium">You</span>
                      <User className="w-4 h-4 ml-1" />
                    </>
                  ) : message.role === "system" ? (
                    <span className="font-medium">System</span>
                  ) : (
                    <>
                      <span className="font-medium">Hugo</span>
                      <Bot className="w-4 h-4 ml-1 text-emerald-500" />
                    </>
                  )}
                  <span className="text-xs opacity-70 ml-2">{formatTime(message.timestamp)}</span>
                </div>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg px-4 py-3 text-white max-w-[80%]">
              <div className="flex items-center mb-1">
                <span className="font-medium">Hugo</span>
                <Bot className="w-4 h-4 ml-1 text-emerald-500" />
              </div>
              <div className="flex items-center space-x-2">
                <Loader className="w-4 h-4 animate-spin" />
                <p>Thinking...</p>
              </div>
            </div>
          </div>
        )}

        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Hugo a question..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 flex items-center justify-center ${
              isLoading || !inputValue.trim() ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading || !inputValue.trim()}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
