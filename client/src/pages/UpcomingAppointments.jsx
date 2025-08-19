// client/src/pages/UpcomingAppointments.jsx

import { useEffect, useState } from 'react';
import PaymentComponent from '../components/PaymentComponent';
import api from '../api';

const UpcomingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [updateKey, setUpdateKey] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const token = localStorage.getItem('token');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/patient/getmyappointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data);
    } catch (err) {
      if (err.response) {
        setError(`Error: ${err.response.data.message || 'An unexpected error occurred.'}`);
      } else if (err.request) {
        setError('No response received. Please check your network connection.');
      } else {
        setError('An error occurred while setting up the request.');
      }
      console.error('Error fetching upcoming appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  // FIX: The 'appt' variable was out of scope. This function now correctly uses the 'dateString' it receives.
  const formatDate = (dateString) => {
    if (!dateString) return 'No Date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return `${date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })}`;
  };

  const handlePaymentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (paymentId) => {
    setShowPayment(false);
    setAppointments(prev => 
      prev.map(appt => 
        appt._id === selectedAppointment?._id 
          ? { ...appt, paymentStatus: 'Paid', paymentId } 
          : appt
      )
    );
    setSelectedAppointment(null);
    setUpdateKey(prev => prev + 1);
  };

  const handlePaymentClose = () => {
    setShowPayment(false);
    setSelectedAppointment(null);
  };

  useEffect(() => {
    if (token) {
      fetchAppointments();
    } else {
      setError("Not logged in.");
      setLoading(false);
    }
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timeInterval);
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-950 via-black to-violet-950 items-center px-6 pt-16 pb-8">
      <h1 className="text-4xl font-extrabold mt-4 mb-8 text-center text-yellow-300 drop-shadow-lg tracking-wide max-w-4xl w-full">
        Your Upcoming Appointments 📅✨
      </h1>
      {error && <p className="text-red-500 text-center py-2">{error}</p>}
      {loading && <p className="text-yellow-100 text-center py-10 text-xl">Loading your appointments...</p>}
      <div className="w-full max-w-6xl mx-auto px-6">
        {!loading && appointments.length === 0 ? (
          <p className="text-yellow-100 text-center py-10 text-xl">No upcoming appointments. 💤</p>
        ) : (
          <ul key={updateKey} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {appointments.map((appt) => (
              <li key={appt._id} className="relative bg-white bg-opacity-20 backdrop-blur-md border-l-8 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-transform duration-300 transform hover:-translate-y-2">
                <span className={`absolute top-4 right-4 px-4 py-1 rounded-full text-sm font-semibold select-none ${appt.status === 'Confirmed' ? 'bg-green-500' : ''} ${appt.status === 'Pending' ? 'bg-yellow-400 text-gray-900' : ''} ${appt.status === 'Cancelled' ? 'bg-red-600' : ''} ${appt.status === 'Completed' ? 'bg-blue-600' : ''} ${appt.status === 'Rejected' ? 'bg-red-500' : ''}`}>
                  {appt.status}
                </span>
                <div className="mb-6">
                  <h2 className="text-3xl font-extrabold tracking-wide mb-2 text-white">Dr. {appt.doctorName}</h2>
                  {appt.doctorSpecialty && <p className="italic font-semibold text-lg text-purple-300">🩺 {appt.doctorSpecialty}</p>}
                </div>
                <div className="space-y-4 text-lg font-semibold text-white">
                  <div className="flex items-center gap-4"><span className="text-3xl">📅</span><span>{formatDate(appt.appointmentTime)}</span></div>
                  <div className="flex items-center gap-4"><span className="text-3xl">⏰</span><span>{new Date(appt.appointmentTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>
                </div>
                {appt.status === 'Confirmed' && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl border border-purple-400/30">
                    <div className="flex items-center justify-between mb-3"><span className="text-sm font-semibold text-purple-200">Consultation Fee:</span><span className="text-lg font-bold text-yellow-300">₹{appt.amount}</span></div>
                    <div className="flex items-center justify-between mb-3"><span className="text-sm font-semibold text-purple-200">Payment Status:</span><span className={`px-2 py-1 rounded-full text-xs font-semibold transition-all duration-500 ${appt.paymentStatus === 'Paid' ? 'bg-green-500 text-white animate-pulse' : 'bg-yellow-400 text-gray-900'}`}>{appt.paymentStatus}</span></div>
                    {appt.paymentStatus !== 'Paid' && <button onClick={() => handlePaymentClick(appt)} className="w-full mt-2 py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg">💳 Pay Now</button>}
                  </div>
                )}
                {appt.paymentStatus === 'Paid' && (() => {
                  const timeDiffMinutes = (new Date(appt.appointmentTime).getTime() - currentTime.getTime()) / 60000;
                  const isTimeForCall = timeDiffMinutes <= 15 && timeDiffMinutes >= -120;
                  if (!isTimeForCall) return <div className="w-full mt-3 py-2 px-4 bg-gray-400 text-white font-semibold rounded-lg text-center opacity-75">{timeDiffMinutes > 15 ? `Call available in ${Math.ceil(timeDiffMinutes - 15)} min` : 'Call window has ended'}</div>;
                  return <button onClick={() => window.open(`/video-call/${appt._id}`, '_blank')} className="w-full mt-3 py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg flex items-center justify-center gap-2 animate-pulse">📹 Join Video Call</button>;
                })()}
              </li>
            ))}
          </ul>
        )}
      </div>
      {showPayment && selectedAppointment && <PaymentComponent appointmentId={selectedAppointment._id} doctorName={selectedAppointment.doctorName} amount={selectedAppointment.amount} onSuccess={handlePaymentSuccess} onClose={handlePaymentClose} />}
    </div>
  );
};

export default UpcomingAppointments;
