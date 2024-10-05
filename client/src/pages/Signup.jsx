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
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        username: '',
        password: ''
    })
    const navigate = useNavigate();

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            name: '',
            email: '',
            username: '',
            password: ''
        };

        if (!name.trim()) {
            newErrors.name = 'Name is required';
            isValid = false;
        } else if (name.trim().length < 4) {
            newErrors.name = 'Name must be at least  characters long';
            isValid = false;
        } else if (!/^[A-Za-z]+$/.test(name.trim())) {
            newErrors.name = 'Name must contain only alphabets';
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        if (!username) {
            newErrors.username = 'Username is required';
            isValid = false;
        } else if (username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters long';
            isValid = false;
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores';
            isValid = false;
        }

        if (!password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
            isValid = false;
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        try {
            const response = await axios.post(`${backendUrl}/users/`, {
                name,
                email,
                username,
                password
            });
            console.log("User created:", response.data);
            navigate('/signin')
        } catch (error) {
            console.error("Error creating user:", error);
            if (error.response?.data) {
                const serverErrors = error.response.data;
                const newErrors = { ...errors };
                
                if (serverErrors.email) newErrors.email = serverErrors.email;
                if (serverErrors.username) newErrors.username = serverErrors.username;
                
                setErrors(newErrors);
            }
        }
    }

    return (
        <div className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-l from-teal-400 via-cyan-400 to-blue-400 p-4">
            <div className="absolute top-4 left-4 flex items-center gap-2 text-white font-bold text-xl sm:text-2xl md:text-3xl">
                <img src="/fav-rounded.png" className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full" alt="Logo" />
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
                        className={`w-full p-2 rounded-md border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name) setErrors({...errors, name: ''});
                        }}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        id="email"
                        type="email" 
                        placeholder="john@example.com" 
                        className={`w-full p-2 rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors({...errors, email: ''});
                        }}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input 
                        id="username"
                        type="text" 
                        placeholder="johndoe123" 
                        className={`w-full p-2 rounded-md border ${errors.username ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            if (errors.username) setErrors({...errors, username: ''});
                        }}
                    />
                    {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                        <input 
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••" 
                            className={`w-full p-2 rounded-md border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-teal-500 focus:border-transparent`}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) setErrors({...errors, password: ''});
                            }}
                        />
                        <button 
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {!showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                        </button>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
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