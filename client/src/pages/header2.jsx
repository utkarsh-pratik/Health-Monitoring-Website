import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../components/ProfileDropdown';
import { Link } from 'react-router-dom';

const DoctorHome = () => {
  const navigate = useNavigate();

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
            className="nav-link flex items-center gap-1"
            aria-label="Notifications and Reminders"
          >
            🔔 Notifications
            <span className="ml-1 text-yellow-400 animate-bounce">🟡</span>
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
