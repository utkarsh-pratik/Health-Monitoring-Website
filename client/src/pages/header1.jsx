import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import DashboardDropdown from "../components/dashboardDropdown";


const PatientHome = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Appointment booked successfully!",
      type: "success",
      time: new Date().toLocaleTimeString(),
    },
    {
      id: 2,
      message: "New doctor added to the system.",
      type: "info",
      time: new Date().toLocaleTimeString(),
    },
    {
      id: 3,
      message: "Appointment slot almost full!",
      type: "warning",
      time: new Date().toLocaleTimeString(),
    },
  ]);

  const notifRef = useRef();
  const location = useLocation();

  // Close notification dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Request permission for browser notifications if not granted
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Function to add new notifications dynamically
  const addNotification = (message, type = "info") => {
    const newNotif = {
      id: Date.now(),
      message,
      type,
      time: new Date().toLocaleTimeString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Optionally trigger browser notification
    if (Notification.permission === "granted") {
      new Notification("New Notification", {
        body: message,
        icon: "/icons/appointment-success.png",
      });
    }
  };

  // Helper to display notification count capped at 9+
  const notifCountDisplay = () => {
    const count = notifications.length;
    return count > 9 ? "9+" : count;
  };

  return (
    <nav
      className="bg-gray-800 text-white shadow-md fixed top-0 w-full z-50 transition-all duration-300"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          to="/patient/home"
          className="text-2xl font-extrabold text-gray-200 hover:text-gray-100 tracking-wide"
          aria-label="Go to HealthCard Home"
        >
          HealthCard <span aria-hidden="true" className="text-pink-400">🩺</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8 font-medium text-gray-300 items-center relative">
          <Link
            to="/patient/home"
            className="hover:text-white transition duration-200"
            aria-current={location.pathname === "/patient/home" ? "page" : undefined}
          >
            Home
          </Link>
          <Link
            to="/patient/appointments"
            className="hover:text-white transition duration-200"
            aria-current={location.pathname === "/patient/appointments" ? "page" : undefined}
          >
            Book Appointment
          </Link>
          <Link
            to="/patient/home"
            className="hover:text-white transition duration-200"
            aria-current={location.pathname === "/patient/home" ? "page" : undefined}
          >
            Profile
          </Link>
          <Link to="/patient/favorites">Favourites</Link>
          <Link
            to="/patient/appointments/upcoming"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition"
            aria-current={location.pathname === "/patient/appointments/upcoming" ? "page" : undefined}
          >
            Booked Appointments
          </Link>

          <DashboardDropdown />

       
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-2xl text-gray-300 hover:text-white transition focus:outline-none"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={`${menuOpen ? "Close" : "Open"} mobile menu`}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          type="button"
        >
          {menuOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-gray-800 px-4 py-4 space-y-3 transition-all duration-300 ease-in-out"
          role="menu"
        >
          <Link
            to="/patient/home"
            className="block text-gray-300 hover:text-white"
            onClick={() => setMenuOpen(false)}
            role="menuitem"
          >
            Home
          </Link>
          <Link
            to="/patient/appointments"
            className="block text-gray-300 hover:text-white"
            onClick={() => setMenuOpen(false)}
            role="menuitem"
          >
            Book Appointment
          </Link>
          <Link
            to="/profile"
            className="block text-gray-300 hover:text-white"
            onClick={() => setMenuOpen(false)}
            role="menuitem"
          >
            Profile
          </Link>
          <Link
            to="/logout"
            className="block text-red-400 hover:text-red-300"
            onClick={() => setMenuOpen(false)}
            role="menuitem"
          >
            Logout
          </Link>
        </div>
      )}

     
    </nav>
  );
};

export default PatientHome;
