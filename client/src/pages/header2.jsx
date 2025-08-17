// client/src/pages/header2.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ProfileDropdown from '../components/ProfileDropdown';
import socket from '../socket';

const Header2 = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    const doctorId = localStorage.getItem('doctorId');
    if (doctorId) {
      socket.emit('registerDoctor', doctorId);
    }

    const handleNewAppointment = (data) => {
      const newNotification = {
        id: Date.now(),
        type: 'appointment',
        patientName: data.patientName,
        appointmentTime: data.appointmentTime,
        reason: data.reason,
        read: false,
        time: new Date().toLocaleTimeString(),
      };
      setNotifications(prev => [newNotification, ...prev]);
    };

    const handlePaymentReceived = (data) => {
        const newNotification = {
            id: Date.now() + 1,
            type: 'payment',
            message: `Payment of ₹${data.amount} received from ${data.patientName}`,
            read: false,
            time: new Date().toLocaleTimeString(),
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    socket.on('newAppointment', handleNewAppointment);
    socket.on('paymentReceived', handlePaymentReceived);

    return () => {
      socket.off('newAppointment', handleNewAppointment);
      socket.off('paymentReceived', handlePaymentReceived);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav
      className="bg-gray-800 text-white shadow-md fixed top-0 w-full z-50 transition-all duration-300"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl select-none">✨</span>
          <span className="text-3xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-red-400">
            Health Card
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <Link to="/doctor/home" className="nav-link" aria-label="Go to Home page">
            🏠 Home
          </Link>
          <Link to="/doctor/scheduled-appointments" className="nav-link" aria-label="View Scheduled Appointments">
            📅 Scheduled Appointments
          </Link>
          <Link to="/doctor/notifications" className="nav-link flex items-center gap-1 relative" aria-label="Notifications and Reminders">
            🔔 Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow animate-bounce" style={{minWidth:'1.5em',textAlign:'center'}}>
                {unreadCount}
              </span>
            )}
          </Link>
          <Link to="/doctor/about" className="nav-link" aria-label="About this application">
            ℹ️ About
          </Link>
          <ProfileDropdown />
          <button onClick={handleLogout} className="nav-link hover:text-red-400 font-semibold ml-4">
            ⏻ Logout
          </button>
        </div>
      </div>

      <style>{`
        .nav-link {
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.2s;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .nav-link:hover {
          background-color: rgba(75, 85, 99, 0.7);
          color: #FBBF24;
          box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
          transform: scale(1.05);
        }
      `}</style>
    </nav>
  );
};

export default Header2;
