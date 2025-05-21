import { useEffect, useState } from 'react';
import axios from 'axios';

const UpcomingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [scrollY, setScrollY] = useState(0); // Track scroll position
  const token = localStorage.getItem('token');

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/appointments/getmyappointments', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching upcoming appointments:', err);
    }
  };

  useEffect(() => {
    fetchAppointments();

    // Add event listener to track scrolling
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [token]);

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-b from-purple-950 via-black to-violet-950 items-center px-6 pt-16 pb-8 relative transition-all duration-300"
    >
      {/* Heading */}
      <h1 className="text-4xl font-extrabold mt-4 mb-8 text-center text-yellow-300 drop-shadow-lg tracking-wide max-w-4xl w-full">
        Your Upcoming Appointments 📅✨
      </h1>

      {/* Cards Container */}
      <div className="w-full max-w-6xl mx-auto px-6">
        {appointments.length === 0 ? (
          <p className="text-yellow-100 text-center py-10 text-xl">No upcoming appointments. 💤</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {appointments.map((appt, index) => (
              <li
                key={index}
                className="relative bg-white bg-opacity-20 backdrop-blur-md border-l-8 border-gradient-to-b from-pink-400 via-yellow-400 to-green-400 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-transform duration-300 transform hover:-translate-y-2 cursor-pointer text-white drop-shadow-md"
                style={{ minWidth: '320px' }}
              >
                {/* Status Ribbon */}
                <span
                  className={`absolute top-20 right-5 px-4 py-1 rounded-full text-sm font-semibold select-none
                    ${
                      appt.status === 'Confirmed'
                        ? 'bg-green-500'
                        : appt.status === 'Pending'
                        ? 'bg-yellow-400 text-gray-900'
                        : appt.status === 'Cancelled'
                        ? 'bg-red-600'
                        : appt.status === 'Completed'
                        ? 'bg-blue-600'
                        : appt.status === 'Rejected'
                        ? 'bg-red-500'
                        : 'bg-gray-400'
                    }
                  `}
                >
                  {appt.status === 'Confirmed' && '✔️ Confirmed'}
                  {appt.status === 'Pending' && '⏳ Pending'}
                  {appt.status === 'Cancelled' && '❌ Cancelled'}
                  {appt.status === 'Completed' && '✅ Completed'}
                  {appt.status === 'Rejected' && '🚫 Rejected'}
                  {!['Confirmed', 'Pending', 'Cancelled', 'Completed', 'Rejected'].includes(appt.status) && appt.status}
                </span>

                {/* Doctor Info */}
                <div className="mb-6">
                  <h2 className="text-3xl font-extrabold tracking-wide mb-2">
                    Dr. {appt.doctorName} 👨‍⚕️
                  </h2>
                  {appt.doctorSpecialty && (
                    <p className="italic font-semibold text-lg">🩺 {appt.doctorSpecialty}</p>
                  )}
                </div>

                {/* Appointment Details */}
                <div className="space-y-4 text-lg font-semibold">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">📅</span>
                    <span>
                      {new Date(appt.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-3xl">⏰</span>
                    <span>
                      {new Date(appt.date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </div>

                  {/* Rejection / Cancel Reason */}
                  {(appt.status === 'Cancelled' || appt.status === 'Rejected') && appt.reason && (
                    <div
                      className="relative bg-gradient-to-r from-red-200 via-red-300 to-red-400 text-red-900 p-6 rounded-2xl border-2 border-red-600 shadow-lg shadow-red-500/50 font-semibold
                        animate-pulse
                        hover:scale-[1.05] transition-transform duration-300 ease-in-out cursor-help select-text"
                      title="Reason for cancellation or rejection"
                    >
                      <div className="flex items-center gap-4 mb-2">
                        <svg
                          className="w-7 h-7 text-red-700 flex-shrink-0 animate-bounce"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
                        </svg>
                        <span className="text-xl font-bold tracking-wide">Reason:</span>
                      </div>
                      <p className="text-red-900 text-md leading-relaxed">{appt.rejectionReason}</p>
                    </div>
                  )}
                </div>

                {/* Booked At Label */}
                <div className="text-sm text-white-300 mt-4 text-center">
                  <span className="font-semibold">Booked At : </span>
                  {new Date(appt.createdAt).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  at{' '}
                  {new Date(appt.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UpcomingAppointments;
