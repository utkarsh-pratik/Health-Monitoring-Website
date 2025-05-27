// src/components/ProfileDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileDropdown = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center text-white hover:bg-blue-800/50 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none"
      >
        <span className="text-orange-400 mr-2">⚙️</span> Settings 
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-900 text-white rounded-md shadow-lg ring-1 ring-black ring-opacity-30 z-[9999] backdrop-blur-sm"
          style={{ minWidth: '200px' }}
        >
          <button
            onClick={() => {
              setOpen(false);
              navigate('/doctor/set-availability');
            }}
            className="block w-full text-left px-4 py-2 hover:bg-blue-800 transition-colors duration-200"
          >
            Set Available Time Slots
          </button>
          <button
            onClick={() => {
              setOpen(false);
              // Navigate to your create listing page or placeholder
              navigate('/doctor/create-listing');
            }}
            className="block w-full text-left px-4 py-2 hover:bg-blue-800 transition-colors duration-200"
          >
            Create Listing of Yourself
          </button>
          <button
            onClick={() => {
              setOpen(false);
              // Add more options here if needed
              alert('Other option clicked');
            }}
            className="block w-full text-left px-4 py-2 hover:bg-blue-800 transition-colors duration-200"
          >
            Other
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
