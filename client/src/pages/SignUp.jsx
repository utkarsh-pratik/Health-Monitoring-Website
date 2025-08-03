import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("patient");
    const [error, setError] = useState("");
    const navigate = useNavigate();
const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
        await axios.post("http://localhost:5000/api/auth/signup", {
            name,
            email,
            password,
            role: role.toLowerCase(), // 🛠️ Ensure it's valid
        });
        navigate("/login");
    } catch (error) {
        console.error("Signup Error:", error);
        setError(error.response?.data?.error || "Signup failed. Try again.");
    }
};

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-900 via-black to-blue-900 p-4">
            <div className="bg-gradient-to-br from-blue-900 via-black to-blue-900 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center text-white">
                <h2 className="text-3xl font-semibold mb-4">Create an Account</h2>
                {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
                <form onSubmit={handleSignup} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="p-3 border border-gray-600 rounded-lg bg-gray-700 focus:ring focus:ring-yellow-500 text-white placeholder-gray-400"
                    />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="p-3 border border-gray-600 rounded-lg bg-gray-700 focus:ring focus:ring-yellow-500 text-white placeholder-gray-400"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="p-3 border border-gray-600 rounded-lg bg-gray-700 focus:ring focus:ring-yellow-500 text-white placeholder-gray-400"
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="p-3 border border-gray-600 rounded-lg bg-gray-700 focus:ring focus:ring-yellow-500 text-white"
                    >
                        <option value="patient">Patient</option>
                        <option value="doctor">Doctor</option>
                    </select>
                    <button
                        type="submit"
                        className="mt-3 p-3 font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white rounded-lg hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 transition duration-300 shadow-xl animate-pulse"
                    >
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Signup;