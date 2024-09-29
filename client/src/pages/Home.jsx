import { User, UserPlus } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Home = () => {
  const user = useSelector(state => state.auth.user);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex flex-col justify-center items-center p-8 bg-gradient-to-b from-cyan-800 to-cyan-600">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center text-white">
          Hello {user?.name}, welcome to QuickLeave
        </h1>
        <p className="text-xl text-gray-100 text-center max-w-2xl mb-12">
          Simplify your leave management process with our intuitive system. 
          Please choose your designation to continue.
        </p>
      </div>
      <div className="bg-cyan-500 py-16 flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-12">
        <Link to="/employee" className="bg-white text-cyan-800 font-bold py-4 px-8 rounded-lg shadow-lg hover:bg-cyan-100 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 flex items-center">
          <User className="mr-2" />
          Employee
        </Link>
        <Link to="/manager" className="bg-white text-cyan-800 font-bold py-4 px-8 rounded-lg shadow-lg hover:bg-cyan-100 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 flex items-center">
          <UserPlus className="mr-2" />
          Manager
        </Link>
      </div>
    </div>
  )
}

export default Home