// src/components/DashboardDropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DashboardDropdown = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block text-left w-max z-50">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-700 via-pink-600 to-red-500
                   text-white font-semibold px-6 py-2 rounded-2xl shadow-lg
                   hover:brightness-110 hover:scale-105 transition-transform duration-200 select-none w-full"
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
      >
        🚀 Dashboard
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      <div
        className={`absolute left-0 mt-1 w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-300 dark:border-gray-700
                    backdrop-blur-sm bg-opacity-90 dark:bg-opacity-80
                    transition-all duration-200 ease-in-out
                    transform origin-top-left
                    ${dropdownOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"}`}
      >
        <button
          onClick={() => {
            navigate("/patient/post-history");
            setDropdownOpen(false);
          }}
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-purple-700 dark:text-pink-400
                     hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800 dark:hover:to-pink-800
                     rounded-2xl transition-colors duration-200 w-full select-none whitespace-nowrap"
        >
          <span className="text-base w-5 flex-shrink-0">📝</span>
          Post History
        </button>
        <button
          onClick={() => {
            
            setDropdownOpen(false);
          }}
          className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-purple-700 dark:text-pink-400
                     hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800 dark:hover:to-pink-800
                     rounded-2xl transition-colors duration-200 w-full select-none whitespace-nowrap"
        >
          <span className="text-base w-5 flex-shrink-0">📝</span>
          dummy
        </button>
      </div>
    </div>
  );
};

export default DashboardDropdown;
