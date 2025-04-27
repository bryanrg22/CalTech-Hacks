import { Bell, Search, User } from "lucide-react"

export default function Header({ title }) {
  return (
    <header className="bg-gray-900 border-b border-gray-800 py-4 px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{title}</h1>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 p-2.5"
              placeholder="Search..."
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-white rounded-lg">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-emerald-500"></span>
          </button>

          {/* User */}
          <div className="flex items-center">
          <div className="w-8 h-8 rounded-full overflow-hidden">
              <img
                src="/pfp.jpg"
                alt="My profile picture"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="ml-2 text-sm font-medium text-white hidden md:inline-block">Admin User</span>
          </div>
        </div>
      </div>
    </header>
  )
}
