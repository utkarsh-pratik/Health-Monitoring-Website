import React from "react";
import patientHome from "../assets/image.png"; // Assuming you have a local image
import { Link } from "react-router-dom";

const PatientHome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-950 to-black text-white px-6 py-16 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background visual element */}
      <div className="absolute inset-0 opacity-10">
        <img
          src="https://www.transparenttextures.com/patterns/stardust.png"
          alt="bg pattern"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main content */}
      <div className="z-10 max-w-5xl w-full flex flex-col md:flex-row items-center justify-center gap-10 text-center md:text-left">
        {/* Left Section - Text */}
        <div className="space-y-6 max-w-lg">
          <h1 className="text-4xl md:text-5xl font-extrabold text-pink-400 drop-shadow-xl">
            Welcome to HealthCard 💖
            <br />
            <span className="text-white">Your Gateway to Better Health 🩺</span>
          </h1>

          <p className="text-lg md:text-xl text-purple-200 leading-relaxed">
            Easily connect with trusted doctors, manage appointments, and take control of your health journey — all in one place.
          </p>

          <div className="space-x-4">
        <Link to="/patient/appointments"className="px-6 py-3 bg-indigo-700 hover:bg-indigo-800 transition text-white rounded-xl font-semibold shadow-lg">
              📅 Book Appointment
            </Link>
            <button className="px-6 py-3 bg-pink-600 hover:bg-pink-700 transition text-white rounded-xl font-semibold shadow-lg">
              🔍 Analyze report
            </button>
            
          </div>
        </div>

        {/* Right Section - Illustration */}
        <div className="max-w-md w-full">
            <img
                src={patientHome}
                alt="HealthCard Illustration"
                className="rounded-3xl shadow-lg transform transition-transform duration-300 hover:scale-105"
            />
        </div>
      </div>
    </div>
  );
};

export default PatientHome;
