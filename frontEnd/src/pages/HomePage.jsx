import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Heart, Settings, LogOut, TrendingUp, TrendingDown, DollarSign, SearchIcon } from 'lucide-react'
import StockChart from '../components/TimeSeries'
import StockAllocation from './StockAllocation'

export default function HomePage() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [likedStocks, setLikedStocks] = useState({})
  const navigate = useNavigate()

  const handleNavigation = (page) => {
    setActivePage(page)
  }

  const handleSignOut = () => {
    // Add your sign out logic here
    navigate('/') // Navigate to the SignIn page
  }

  const toggleLike = (company) => {
    setLikedStocks(prev => ({
      ...prev,
      [company]: !prev[company]
    }))
  }

  const NavItem = ({ page, icon: Icon }) => (
    <button
      className={`flex items-center px-4 py-2 ${
        activePage === page ? 'text-white' : 'text-gray-400 hover:text-white'
      } text-sm font-medium`}
      onClick={() => handleNavigation(page)}
    >
      <Icon className="w-5 h-5 mr-2" />
      <span>{page}</span>
    </button>
  )

  const sentimentData = [
    { company: 'AMZN', sentiment: 'Positive', summary: 'Based on the news coverage, Amazon (AMZN) appears to be a strong contender in the evolving Al landscape, with initiatives ranging from its Just Walk Out technology to its Al shopping assistant in India. Given its diverse business model and continued innovation, I would recommend holding AMN stock, as its future potential seems strong. Selling would be premature, and buying at this point might not be the most strategic move given the current market conditions.', trend: 'up', owned: true },
    { company: 'NVDA', sentiment: 'Neutral', summary: 'Based on the news coverage, Amazon (AMZN) is reportedly increasing its investment in artificial intelligence (AI) hardware, a development that could significantly benefit NVIDIA (NVDA). As a leading provider of AI chips and GPUs, NVDA stands to gain from increased demand for these components. However, it\'s important to note that investing in stocks involves risk. Factors such as economic conditions, competition, and technological advancements could impact NVDA\'s performance.', trend: 'neutral', owned: false },
    { company: 'TSLA', sentiment: 'Neutral', summary: 'Given the mixed sentiment surrounding Tesia, I would recommend holding TSLA stock. The news paints a picture of both potential and challenges, with some highlighting Innovative technology and growth in China, while others raise concerns about the company\'s management, manufacturing, and even the safety of its vehicles. It\'s too early to confidently buy or sell based on this information alone.', trend: 'neutral', owned: false },
    { company: 'AAPL', sentiment: 'Positive', summary: 'Based on the news, Apple (AAPL) seems poised for growth with the upcoming iPhone 16 launch, new health features, and continued strong Al integration. I would recommend buying AAPL, as the positive sentiment surrounding these developments suggests potential for future gains. While the recent job cuts and competition from Huawei are concerns, the overall picture remains positive.', trend: 'up', owned: false },
  ]

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src="/logo.png"
              alt="Market Sense Logo"
              className="w-8 h-8"
              style={{
                aspectRatio: "1/1",
                objectFit: "contain"
              }}
            />
            <span className="text-xl font-semibold">eduTrade</span>
          </div>
          <div className="flex items-center space-x-4">
            <img
              alt="User avatar"
              className="w-8 h-8 rounded-full"
              src="/pfp.png"
              style={{
                aspectRatio: "1/1",
                objectFit: "cover",
              }}
            />
            <div className="text-sm">
              <p className="font-medium">Bryan Ramirez-Gonzalez</p>
              <p className="text-gray-400">@bryanram</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md flex items-center"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-8 overflow-auto">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <StockChart />
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <StockAllocation />
            </div>
          </div>
          {/* Sentiment Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sentimentData.map((item, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-semibold flex items-center">
                      {item.company}
                      {item.owned ? (
                        <DollarSign className="w-5 h-5 ml-2 text-green-500" />
                      ) : (
                        <button 
                          onClick={() => toggleLike(item.company)}
                          className="ml-2 focus:outline-none"
                        >
                          <Heart 
                            className={`w-5 h-5 ${likedStocks[item.company] ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
                          />
                        </button>
                      )}
                    </h3>
                    {item.owned ? (
                      <p className="text-xs text-green-500 mt-1">Owned Stock</p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">+ Recommended</p>
                    )}
                  </div>
                  {item.trend === 'up' && <TrendingUp className="text-green-500" />}
                  {item.trend === 'down' && <TrendingDown className="text-red-500" />}
                  {item.trend === 'neutral' && <span className="text-yellow-500">⟷</span>}
                </div>
                <p className="text-lg mb-2">Sentiment: <span className={`font-semibold ${
                  item.sentiment === 'Positive' || item.sentiment === 'Very Positive' ? 'text-green-500' :
                  item.sentiment === 'Negative' ? 'text-red-500' : 'text-yellow-500'
                }`}>{item.sentiment}</span></p>
                <p className="text-sm text-gray-400">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}