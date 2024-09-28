import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { backendUrl } from "../utils/const";
import axios from "axios";

const Signup = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate();

    const handleSubmit = async(e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${backendUrl}/users`, {
                name,
                email,
                username,
        })
            console.log("User created:", response.data);
            navigate('/signin')
        } catch (error) {
            console.error("Error creating user:", error);
        }
    }
    

    return (
        <div className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-l from-teal-400 via-cyan-400 to-blue-400 p-4">
            <div className="absolute top-4 left-4 flex items-center gap-2 text-white font-bold text-xl sm:text-2xl md:text-3xl">
                <img src="/src/assets/fav-rounded.png" className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full" alt="Logo" />
                <h2>QuickLeave</h2>
            </div>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg flex flex-col w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Create an Account</h1>
                
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                        id="name"
                        type="text" 
                        placeholder="John Doe"
                        className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        id="email"
                        type="email" 
                        placeholder="john@example.com" 
                        className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input 
                        id="username"
                        type="text" 
                        placeholder="johndoe123" 
                        className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <input 
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••" 
                            className="w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button 
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {!showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                        </button>
                    </div>
                </div>

                <button 
                    className="w-full p-2 rounded-md bg-gradient-to-r from-teal-500 to-blue-500 text-white font-medium hover:from-teal-600 hover:to-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    type="submit">
                    Sign Up
                </button>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account? 
                    <Link to="/signin" className="font-medium text-teal-600 hover:text-teal-500"> Sign in</Link>
                </p>
            </form>
        </div>
    )
}

export default Signup