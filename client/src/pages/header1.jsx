import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardDropdown from "../components/dashboardDropdown";
import socket from '../socket';

const Header1 = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('patientNotifications');
    return saved ? JSON.parse(saved) : [];
  });
  const location = useLocation();
  const navigate = useNavigate();

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

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('patientNotifications', JSON.stringify(notifications));
  }, [notifications]);

  // Socket connection for notifications
  useEffect(() => {
    const patientId = localStorage.getItem('patientId');
    if (patientId) {
      socket.emit('registerPatient', patientId);
    }

    socket.on('appointmentStatus', (data) => {
      let message = data.message || '';
      if (!message) {
        if (data.status === 'Confirmed') {
          message = `Your appointment with Dr. ${data.doctorName} has been accepted`;
        } else if (data.status === 'Cancelled' || data.status === 'Rejected') {
          message = `Your appointment with Dr. ${data.doctorName} was ${data.status.toLowerCase()}`;
        } else {
          message = `Your appointment status was updated: ${data.status}`;
        }
      }

      const newNotification = {
        id: Date.now(),
        type: 'status',
        message,
        status: data.status,
        doctorName: data.doctorName,
        appointmentTime: data.appointmentTime,
        reason: data.reason,
        time: new Date().toLocaleTimeString(),
        read: false
      };

      setNotifications(prev => [newNotification, ...prev]);

      // Show browser notification if permission granted
      if (Notification.permission === "granted") {
        new Notification("Appointment Update", {
          body: message,
          icon: ""
        });
      }
    });

    return () => {
      socket.off('appointmentStatus');
    };
  }, []);

  // Notification indicator logic
  const hasUnread = notifications.some(n => !n.read);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
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
            to="/profile"
            className="hover:text-white transition duration-200"
            aria-current={location.pathname === "/profile" ? "page" : undefined}
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

          {/* Notification Link */}
          <Link
            to="/patient/notifications"
            className="nav-link flex items-center gap-1 relative"
            aria-label="Notifications and Reminders"
          >
            🔔 Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow animate-bounce" style={{minWidth:'1.5em',textAlign:'center'}}>
                {unreadCount}
              </span>
            )}
          </Link>

          <DashboardDropdown />

          <button
            onClick={handleLogout}
            className="hover:text-red-400 transition duration-200 font-semibold ml-4"
          >
            Logout
          </button>
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
            to="/patient/notifications"
            className="block text-gray-300 hover:text-white relative"
            onClick={() => setMenuOpen(false)}
            role="menuitem"
          >
            Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow animate-bounce" style={{minWidth:'1.5em',textAlign:'center'}}>
                {unreadCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => {
              setMenuOpen(false);
              handleLogout();
            }}
            className="block text-red-400 hover:text-red-300 font-semibold w-full text-left"
            role="menuitem"
          >
           ⏻ Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Header1;
