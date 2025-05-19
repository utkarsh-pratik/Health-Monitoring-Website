import React, { useState } from "react";
import { Link } from "react-router-dom";
import DashboardDropdown from "../components/dashboardDropdown";

const PatientHome = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-800 text-white shadow-md fixed top-0 w-full z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/patient/home" className="text-2xl font-extrabold text-gray-200 hover:text-gray-100 tracking-wide">
          HealthCard <span className="text-pink-400">🩺</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-8 font-medium text-gray-300">
  <Link to="/patient/home" className="hover:text-white transition duration-200">Home</Link>
  <Link to="/patient/appointments" className="hover:text-white transition duration-200">Book Appointment</Link>
  <Link to="/profile" className="hover:text-white transition duration-200">Profile</Link>
  <Link to="/patient/appointments/upcoming" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition">
    Booked Appointments
  </Link>


  <DashboardDropdown />
  
</div>


        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl text-gray-300 hover:text-white transition focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* Mobile Links */}
      {menuOpen && (
        <div className="md:hidden bg-gray-800 px-4 py-4 space-y-3 transition-all duration-300 ease-in-out">
          <Link to="/" className="block text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/patient/appointments" className="block text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>Book Appointment</Link>
          <Link to="/profile" className="block text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>Profile</Link>
          <Link to="/logout" className="block text-red-400 hover:text-red-300" onClick={() => setMenuOpen(false)}>Logout</Link>
        </div>
      )}
    </nav>
  );
};

export default PatientHome;
