import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileDropdown from '../components/ProfileDropdown';
import { Link } from 'react-router-dom';

const DoctorHome = () => {
    const navigate = useNavigate();

    const handleNavigateToAvailability = () => {
        navigate('/set-availability');
    };

    return (
        <nav className="relative z-10 bg-blue-950/70 backdrop-blur-sm border-b border-blue-800/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-2xl font-bold text-orange-400">Health Monitor</span>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                        <a
                             href="doctor/home"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/doctor/home');
                            }}
                            className="text-white hover:bg-blue-800/50 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                        >
                            Home
                        </a>
                        <Link to="/doctor/scheduled-appointments"
                         className="text-white hover:bg-blue-800/50 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                            Scheduled Appointments
                        </Link>
                          
                        
                        <a
                            href="#"
                            className="text-white hover:bg-blue-800/50 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
                        >
                            Notifications & Reminders
                            <span className="ml-2 text-orange-400">🔔</span>
                        </a>
                        <a
                            href="/about"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/doctor/about');
                            }}
                            className="text-white hover:bg-blue-800/50 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                        >
                            About
                        </a>

                        {/* Navigate to Set Availability Page */}
                        {/* <button
                            onClick={handleNavigateToAvailability}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-md text-sm font-medium transition"
                        >
                            Set Available Time Slots
                        </button> */}

                        {/* Profile Dropdown */}
                        <ProfileDropdown />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default DoctorHome;
