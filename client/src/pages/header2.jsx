import React from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorHome = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-blue-900">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-96 h-96 bg-blue-800 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
                <div className="absolute w-96 h-96 bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
                <div className="absolute w-96 h-96 bg-blue-950 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
            </div>

            {/* Navigation Bar */}
            <nav className="relative z-10 bg-blue-950/70 backdrop-blur-sm border-b border-blue-800/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <span className="text-2xl font-bold text-orange-400">Health Monitor</span>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <a href="#" className="text-white hover:bg-blue-800/50 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                                    Home
                                </a>
                                <a href="#" className="text-white hover:bg-blue-800/50 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                                    Scheduled Appointments
                                </a>
                                <a href="#" className="text-white hover:bg-blue-800/50 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center">
                                    Notifications & Reminders
                                    <span className="ml-2 text-orange-400">🔔</span>
                                </a>
                                <a href="#" className="text-white hover:bg-blue-800/50 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                                    About
                                </a>
                                <a href="#" onClick={() => navigate('/profile-settings')} className="text-white hover:bg-blue-800/50 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center">
                                    Profile & Settings
                                    <span className="ml-2 text-orange-400">⚙️</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-blue-950/50 backdrop-blur-sm rounded-lg p-8 border border-blue-800/30">
                        <h1 className="text-3xl font-bold text-white mb-4">Welcome back, Dr. Smith</h1>
                        <p className="text-blue-100">Here's your overview for today</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Today's Appointments */}
                    <div className="bg-blue-950/50 backdrop-blur-sm overflow-hidden shadow rounded-lg border border-blue-800/30">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-3xl">📅</span>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-blue-100 truncate">
                                            Today's Appointments
                                        </dt>
                                        <dd className="text-2xl font-semibold text-white">
                                            8
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Reports */}
                    <div className="bg-blue-950/50 backdrop-blur-sm overflow-hidden shadow rounded-lg border border-blue-800/30">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-3xl">📋</span>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-blue-100 truncate">
                                            Pending Reports
                                        </dt>
                                        <dd className="text-2xl font-semibold text-white">
                                            12
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* New Messages */}
                    <div className="bg-blue-950/50 backdrop-blur-sm overflow-hidden shadow rounded-lg border border-blue-800/30">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-3xl">💬</span>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-blue-100 truncate">
                                            New Messages
                                        </dt>
                                        <dd className="text-2xl font-semibold text-white">
                                            5
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Available Slots */}
                    <div className="bg-blue-950/50 backdrop-blur-sm overflow-hidden shadow rounded-lg border border-blue-800/30">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <span className="text-3xl">⏰</span>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-blue-100 truncate">
                                            Available Slots
                                        </dt>
                                        <dd className="text-2xl font-semibold text-white">
                                            3
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upcoming Appointments */}
                <div className="mt-8">
                    <div className="bg-blue-950/50 backdrop-blur-sm shadow rounded-lg border border-blue-800/30">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg font-medium text-white mb-4">Upcoming Appointments</h3>
                            <div className="space-y-4">
                                {/* Appointment Item */}
                                <div className="flex items-center justify-between p-4 bg-blue-900/30 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <span className="text-2xl">👤</span>
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="text-white font-medium">John Doe</h4>
                                            <p className="text-blue-100 text-sm">General Checkup</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-medium">10:00 AM</p>
                                        <p className="text-blue-100 text-sm">Today</p>
                                    </div>
                                </div>

                                {/* Appointment Item */}
                                <div className="flex items-center justify-between p-4 bg-blue-900/30 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <span className="text-2xl">👤</span>
                                        </div>
                                        <div className="ml-4">
                                            <h4 className="text-white font-medium">Jane Smith</h4>
                                            <p className="text-blue-100 text-sm">Follow-up</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-medium">11:30 AM</p>
                                        <p className="text-blue-100 text-sm">Today</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DoctorHome; 