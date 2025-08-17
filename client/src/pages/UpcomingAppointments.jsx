import { useEffect, useState } from 'react';
import PaymentComponent from '../components/PaymentComponent';
import api from '../api';

const UpcomingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [scrollY, setScrollY] = useState(0); // Track scroll position
  const [error, setError] = useState(null); // Handle errors
  const [loading, setLoading] = useState(true); // Handle loading state
  const [showPayment, setShowPayment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const token = localStorage.getItem('token');

  // Fetch the appointments
  const fetchAppointments = async () => {
    setLoading(true); // Show loading state
    try {
      const res = await api.get('/api/appointments/getmyappointments', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setAppointments(res.data);
    } catch (err) {
      // Check for different types of errors
      if (err.response) {
        setError(`Error: ${err.response.data.message || 'An unexpected error occurred.'}`);
      } else if (err.request) {
        setError('No response received. Please check your network connection.');
      } else {
        setError('An error occurred while setting up the request.');
      }
      console.error('Error fetching upcoming appointments:', err);
    } finally {
      setLoading(false); // Hide loading state once data is fetched
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return `${date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })} at ${date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })}`;
  };

  // Handle infinite scrolling
  const loadMoreAppointments = () => {
    if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
      // Implement infinite scroll logic if needed, for now, just fetch more appointments
      fetchAppointments();
    }
  };

  // Handle payment button click
  const handlePaymentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPayment(true);
  };

  // Handle successful payment
  const handlePaymentSuccess = (paymentId) => {
    setShowPayment(false);
    setSelectedAppointment(null);
    
    // Update the appointment payment status in local state
    setAppointments(prev => 
      prev.map(appt => 
        appt.appointmentId === selectedAppointment.appointmentId 
          ? { ...appt, paymentStatus: 'Paid', paymentId } 
          : appt
      )
    );
    
    // Refresh appointments from server
    fetchAppointments();
  };

  // Handle payment close
  const handlePaymentClose = () => {
    setShowPayment(false);
    setSelectedAppointment(null);
  };

  useEffect(() => {
    fetchAppointments();

    // Add event listener to track scrolling
    const handleScroll = () => {
      setScrollY(window.scrollY);
      loadMoreAppointments(); // Trigger loading more appointments when scrolled to the bottom
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-950 via-black to-violet-950 items-center px-6 pt-16 pb-8 relative transition-all duration-300">
      {/* Heading */}
      <h1 className="text-4xl font-extrabold mt-4 mb-8 text-center text-yellow-300 drop-shadow-lg tracking-wide max-w-4xl w-full">
        Your Upcoming Appointments 📅✨
      </h1>

      {/* Error Handling */}
      {error && <p className="text-red-600 text-center py-2">{error}</p>}

      {/* Loading State */}
      {loading && <p className="text-yellow-100 text-center py-10 text-xl">Loading your appointments...</p>}

      {/* Cards Container */}
      <div className="w-full max-w-6xl mx-auto px-6">
        {appointments.length === 0 && !loading ? (
          <p className="text-yellow-100 text-center py-10 text-xl">No upcoming appointments. 💤</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {appointments.map((appt) => (
              <li
                key={appt.appointmentId}
                className="relative bg-white bg-opacity-20 backdrop-blur-md border-l-8 border-gradient-to-b from-pink-400 via-yellow-400 to-green-400 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-transform duration-300 transform hover:-translate-y-2 cursor-pointer text-white drop-shadow-md"
                style={{ minWidth: '320px' }}
              >
                {/* Status Ribbon */}
                <span
                  className={`absolute top-20 right-5 px-4 py-1 rounded-full text-sm font-semibold select-none
                    ${appt.status === 'Confirmed' ? 'bg-green-500' : ''} 
                    ${appt.status === 'Pending' ? 'bg-yellow-400 text-gray-900' : ''} 
                    ${appt.status === 'Cancelled' ? 'bg-red-600' : ''} 
                    ${appt.status === 'Completed' ? 'bg-blue-600' : ''}
                    ${appt.status === 'Rejected' ? 'bg-red-500' : ''}
                    ${appt.status === 'No-show' ? 'bg-gray-400' : ''}`}
                >
                  {appt.status === 'Confirmed' && '✔️ Confirmed'}
                  {appt.status === 'Pending' && '⏳ Pending'}
                  {appt.status === 'Cancelled' && '❌ Cancelled'}
                  {appt.status === 'Completed' && '✅ Completed'}
                  {appt.status === 'Rejected' && '🚫 Rejected'}
                  {appt.status === 'No-show' && '🚫 No-show'}
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
                    <span>{formatDate(appt.date)}</span>
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
                  {(appt.status === 'Cancelled' || appt.status === 'Rejected') && appt.rejectionReason && (
                    <div
                      className="relative bg-gradient-to-r from-red-200 via-red-300 to-red-400 text-red-900 p-6 rounded-2xl border-2 border-red-600 shadow-lg shadow-red-500/50 font-semibold animate-pulse hover:scale-[1.05] transition-transform duration-300 ease-in-out cursor-help select-text"
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

                {/* Payment Section */}
                {appt.status === 'Confirmed' && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl border border-purple-400/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-purple-200">Consultation Fee:</span>
                      <span className="text-lg font-bold text-yellow-300">₹{appt.amount}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-purple-200">Payment Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        appt.paymentStatus === 'Paid' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-yellow-400 text-gray-900'
                      }`}>
                        {appt.paymentStatus === 'Paid' ? '✅ Paid' : '⏳ Pending'}
                      </span>
                    </div>

                    {appt.paymentStatus !== 'Paid' && (
                      <button
                        onClick={() => handlePaymentClick(appt)}
                        className="w-full mt-2 py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                      >
                        💳 Pay Now
                      </button>
                    )}

                    {appt.paymentStatus === 'Paid' && appt.paymentId && (
                      <div className="mt-2 text-xs text-green-300 text-center">
                        Payment ID: {appt.paymentId}
                      </div>
                    )}
                  </div>
                )}

                {/* Booked At Label */}
                <div className="text-sm text-white-300 mt-4 text-center">
                  <span className="font-semibold">Booked At: </span>
                  {appt.createdAt ? (
                    formatDate(appt.createdAt)
                  ) : (
                    <span>Appointment time not available</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && selectedAppointment && (
        <PaymentComponent
          appointmentId={selectedAppointment.appointmentId}
          doctorName={selectedAppointment.doctorName}
          amount={selectedAppointment.amount}
          onSuccess={handlePaymentSuccess}
          onClose={handlePaymentClose}
        />
      )}
    </div>
  );
};

export default UpcomingAppointments;
