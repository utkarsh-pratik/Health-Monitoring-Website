// client/src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api'; // Correctly imported

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Use the 'api' helper here instead of 'axios'
            const res = await api.post("/api/auth/login", { email, password });
            
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.user.role);
            
            if (res.data.user.role === "doctor" && res.data.user.doctorId) {
                localStorage.setItem("doctorId", res.data.user.doctorId);
                console.log("[LOGIN] Set doctorId in localStorage:", res.data.user.doctorId);
            }
            if (res.data.user.role === "patient" && res.data.user._id) {
                localStorage.setItem("patientId", res.data.user._id);
            }

            if (res.data.user.role === "patient") {
                navigate("/patient/home");
            } else if (res.data.user.role === "doctor") {
                navigate("/doctor/home");
            } else {
                setError("Invalid user role");
            }
        } catch (error) {
            console.error("Login Error:", error);
            setError(error.response?.data?.error || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-900 via-black to-blue-900 p-4">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md text-center text-white">
                <h2 className="text-3xl font-semibold mb-4">Login</h2>
                {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Email"
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
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 font-bold p-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white rounded-lg hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 transition duration-300 shadow-xl animate-pulse"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;