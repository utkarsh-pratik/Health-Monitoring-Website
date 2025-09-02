// client/src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api'; 

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const { token, user } = res.data;
  
      // Store common user data
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", user._id);
      localStorage.setItem("name", user.name);
  
      // CORRECTED: Handle patient and doctor redirection logic properly.
      if (user.role === 'doctor' && user.doctorId) {
        localStorage.setItem('doctorId', user.doctorId);
        navigate("/doctor/home");
      } else if (user.role === 'patient') {
        // For patients, the patientId is the same as the user._id.
        localStorage.setItem('patientId', user._id);
        navigate("/patient/home");
      } else {
        // Fallback for incomplete profiles or other roles.
        setError("Login successful, but profile is incomplete. Please contact support.");
        navigate("/");
      }
  
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
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