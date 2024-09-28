import { Outlet, Link } from 'react-router-dom'
import { Home, LogOut } from 'lucide-react'

const NavbarLayout = () => {
  return (
    <div className="h-screen flex flex-col">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img src="/src/assets/fav-rounded.png" className="h-10 w-10 rounded-full" alt="Logo" />
                <span className="ml-2 text-xl font-bold text-gray-800">QuickLeave</span>
              </Link>
            </div>
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition duration-150 ease-in-out"
              >
                <Home className="h-5 w-5 mr-1" />
                Home
              </Link>
              <button 
                className="ml-4 flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition duration-150 ease-in-out"
                onClick={() => console.log('Logout clicked')}
              >
                <LogOut className="h-5 w-5 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow overflow-auto bg-gradient-to-l from-teal-400 via-cyan-400 to-blue-400">
        <Outlet />
      </main>
    </div>
  )
}

export default NavbarLayout