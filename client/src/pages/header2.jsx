import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../components/ProfileDropdown';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../api'; 

const socket = io(SOCKET_URL);

const DoctorHome = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('doctorNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('doctorNotifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Register doctor socket connection
    const doctorId = localStorage.getItem('doctorId');
    console.log('[SOCKET] Registering doctor socket with ID:', doctorId);
    if (doctorId) {
      socket.emit('registerDoctor', doctorId);
    }

    // Listen for new appointments
    socket.on('newAppointment', (data) => {
      const newNotification = {
        id: Date.now(),
        type: 'appointment',
        patientName: data.patientName,
        appointmentTime: data.appointmentTime,
        reason: data.reason,
        time: new Date().toLocaleTimeString(),
        read: false
      };
      // Always read latest from localStorage
      const saved = localStorage.getItem('doctorNotifications');
      const current = saved ? JSON.parse(saved) : [];
      const updated = [newNotification, ...current];
      setNotifications(updated);
      localStorage.setItem('doctorNotifications', JSON.stringify(updated));

      // Show browser notification if permission granted
      if (Notification.permission === "granted") {
        new Notification("New Appointment Request", {
          body: `${data.patientName} has requested an appointment`,
          icon: "/icons/appointment-success.png"
        });
      }
    });

    // Listen for payment notifications
    socket.on('paymentReceived', (data) => {
      const newNotification = {
        id: Date.now(),
        type: 'payment',
        patientName: data.patientName,
        amount: data.amount,
        paymentId: data.paymentId,
        appointmentId: data.appointmentId,
        time: new Date().toLocaleTimeString(),
        read: false
      };
      // Always read latest from localStorage
      const saved = localStorage.getItem('doctorNotifications');
      const current = saved ? JSON.parse(saved) : [];
      const updated = [newNotification, ...current];
      setNotifications(updated);
      localStorage.setItem('doctorNotifications', JSON.stringify(updated));

      // Show browser notification if permission granted
      if (Notification.permission === "granted") {
        new Notification("Payment Received", {
          body: `Payment of ₹${data.amount} received from ${data.patientName}`,
          icon: "/icons/payment-success.png"
        });
      }
    });

    return () => {
      socket.off('newAppointment');
      socket.off('paymentReceived');
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
      className="
        relative z-10 
        bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 
        text-white 
        border-b border-blue-700/40 
        backdrop-blur-md 
        shadow-lg
        px-6 py-3
        flex justify-center
      "
      style={{ position: 'sticky', top: 0 }}
      aria-label="Primary Navigation"
    >
      <div className="max-w-7xl w-full flex items-center justify-between">
        {/* Brand with emoji sparkle */}
        <div className="flex items-center gap-2">
          <span className="text-3xl select-none">✨</span>
          <span className="text-3xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-red-400">
            Health Card
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/doctor/home"
            className="nav-link"
            aria-label="Go to Home page"
          >
            🏠 Home
          </Link>
          <Link
            to="/doctor/scheduled-appointments"
            className="nav-link"
            aria-label="View Scheduled Appointments"
          >
            📅 Scheduled Appointments
          </Link>
          <Link
            to="/doctor/notifications"
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
          <Link
            to="/doctor/about"
            className="nav-link"
            aria-label="About this application"
          >
            ℹ️ About
          </Link>

          {/* Profile Dropdown */}
          <ProfileDropdown />
          <button
            onClick={handleLogout}
            className="nav-link hover:text-red-400 font-semibold ml-4"
          >
            ⏻ Logout
          </button>
        </div>
      </div>

      {/* Tailwind nav-link styles */}
      <style>{`
        .nav-link {
          @apply text-white px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 shadow-md;
        }
        .nav-link:hover {
          @apply bg-indigo-600 bg-opacity-70 text-yellow-300 shadow-lg;
          transform: scale(1.05);
        }
      `}</style>
    </nav>
  );
};

export default DoctorHome;
