// src/components/ScheduledAppointment.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import {
  FaUserAlt,
  FaPhoneAlt,
  FaClock,
  FaInfoCircle,
  FaCalendarCheck,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ScheduledAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [loadingIds, setLoadingIds] = useState([]); // track loading for specific appts
  const [rescheduleId, setRescheduleId] = useState(null);
  const [newDate, setNewDate] = useState(new Date());
  const [cancelReason, setCancelReason] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState('all'); // 'all', 'paid', 'pending'
  const [currentTime, setCurrentTime] = useState(new Date()); // Track current time for real-time updates

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please login again.");
        return;
      }

      const res = await axios.get(
        "http://localhost:5000/api/doctors/scheduled-appointments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setAppointments(res.data.appointments);
      setError(null);
    } catch (error) {
      if (error.response) {
        setError(
          `Failed to load appointments: ${
            error.response.data.message || "Server error"
          }`
        );
      } else if (error.request) {
        setError("No response from server. Please try again later.");
      } else {
        setError("Error: " + error.message);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAppointments();
    
    // Auto-refresh every 30 seconds to catch payment updates
    const interval = setInterval(() => {
      fetchAppointments();
    }, 30000);

    // Update current time every minute for real-time video call button updates
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  // Helper to toggle loading for a particular appointment id
  const setLoading = (id, val) => {
    setLoadingIds((prev) =>
      val ? [...prev, id] : prev.filter((loadingId) => loadingId !== id)
    );
  };

  // Accept appointment
  const handleAccept = async (id) => {
    setLoading(id, true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:5000/api/doctors/appointments/${id}/status`,
        { status: "Confirmed" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === id ? { ...appt, status: "Confirmed" } : appt
        )
      );
    } catch {
      alert("Failed to accept appointment");
    }
    setLoading(id, false);
  };

  const handleCancel = async (id) => {
  if (!cancelReason.trim()) {
    alert("Please enter a reason for cancellation");
    return;
  }
  setLoading(id, true);
  try {
    const token = localStorage.getItem("token");
    await axios.patch(
      `http://localhost:5000/api/doctors/appointments/${id}/status`,
      { status: "Cancelled",
        reason: cancelReason
       }, // Send status explicitly
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setAppointments((prev) =>
      prev.map((appt) =>
        appt._id === id ? { ...appt, status: "Cancelled" } : appt
      )
    );
    setCancelReason("");
  } catch (error) {
    console.error(error);
    alert("Failed to cancel appointment");
  }
  setLoading(id, false);
};


  // Open reschedule modal
  // const openReschedule = (appt) => {
  //   setRescheduleId(appt._id);
  //   setNewDate(new Date(appt.appointmentTime));
  // };

  // Confirm reschedule
  // const confirmReschedule = async () => {
  //   if (!newDate || newDate < new Date()) {
  //     alert("Please select a valid future date and time");
  //     return;
  //   }
  //   setLoading(rescheduleId, true);
  //   try {
  //     const token = localStorage.getItem("token");
  //     await axios.patch(
  //       `http://localhost:5000/api/doctors/appointments/${rescheduleId}/reschedule`,
  //       { newTime: newDate.toISOString() },
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );
  //     setAppointments((prev) =>
  //       prev.map((appt) =>
  //         appt._id === rescheduleId
  //           ? { ...appt, appointmentTime: newDate.toISOString(), status: "Pending" }
  //           : appt
  //       )
  //     );
  //     setRescheduleId(null);
  //   } catch {
  //     alert("Failed to reschedule appointment");
  //   }
  //   setLoading(rescheduleId, false);
  // };

  // if () {
  //   return (
  //     <div className="p-8 text-center text-red-600 font-semibold text-lg bg-red-100 rounded-lg shadow-md">
  //       {error}
  //     </div>
  //   );
  // }

  if (appointments.length === 0) {
    return (
      <div className="p-8 text-center text-gray-600 font-medium text-lg bg-yellow-50 rounded-lg shadow-md">
        No scheduled appointments found.
      </div>
    );
  }

  // Filter appointments based on payment status
  const filteredAppointments = appointments.filter(appt => {
    if (paymentFilter === 'all') return true;
    if (paymentFilter === 'paid') return appt.paymentStatus === 'Paid';
    if (paymentFilter === 'pending') return appt.status === 'Confirmed' && appt.paymentStatus !== 'Paid';
    return true;
  });

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#6b8dd6] bg-fixed animate-gradient-xy">
      {/* Payment Statistics Summary */}
      <div className="mb-8 bg-white/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">📊 Appointment & Payment Overview</h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
          >
            <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-300">
              {appointments.length}
            </div>
            <div className="text-sm text-white">Total Appointments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-300">
              {appointments.filter(appt => appt.status === 'Confirmed').length}
            </div>
            <div className="text-sm text-white">Confirmed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-300">
              {appointments.filter(appt => appt.paymentStatus === 'Paid').length}
            </div>
            <div className="text-sm text-white">Paid</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-300">
              ₹{appointments
                .filter(appt => appt.paymentStatus === 'Paid')
                .reduce((total, appt) => total + (appt.amount || 0), 0)
              }
            </div>
            <div className="text-sm text-white">Total Earnings</div>
          </div>
        </div>
      </div>

      {/* Payment Filter */}
      <div className="mb-6 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span className="text-white font-semibold">Filter by Payment:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPaymentFilter('all')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                paymentFilter === 'all' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              All ({appointments.length})
            </button>
            <button
              onClick={() => setPaymentFilter('paid')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                paymentFilter === 'paid' 
                  ? 'bg-green-500 text-white shadow-lg' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Paid ({appointments.filter(appt => appt.paymentStatus === 'Paid').length})
            </button>
            <button
              onClick={() => setPaymentFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                paymentFilter === 'pending' 
                  ? 'bg-yellow-500 text-white shadow-lg' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Pending ({appointments.filter(appt => appt.status === 'Confirmed' && appt.paymentStatus !== 'Paid').length})
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredAppointments.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-white mb-2">
                No appointments found
              </h3>
              <p className="text-white/70">
                {paymentFilter === 'all' 
                  ? 'No appointments to display' 
                  : `No ${paymentFilter} appointments found`}
              </p>
            </div>
          </div>
        ) : (
          filteredAppointments.map((appt) => (
          <div
            key={appt._id}
            className="relative bg-white/30 backdrop-blur-md border border-white/10 shadow-2xl rounded-3xl p-6 hover:scale-[1.02] transition-transform duration-300 hover:shadow-indigo-300"
          >
            {/* Status Badge - Top Right */}
            <div className="absolute top-20 right-12 z-10">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold shadow-md ${statusBadge(
                  appt.status
                )}`}
              >
                {appt.status}
              </span>
            </div>

            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-center rounded-xl py-2 mb-4 shadow-md">
              <h2 className="text-xl font-bold flex items-center justify-center gap-2">
                <FaUserAlt />
                {appt.patientName}
              </h2>
            </div>

            {/* Payment Summary - Only show for confirmed appointments */}
            {appt.status === 'Confirmed' && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-3 mb-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-semibold text-gray-700">Fee: </span>
                    <span className="text-lg font-bold text-green-600">₹{appt.amount || 'Not set'}</span>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                      appt.paymentStatus === 'Paid' 
                        ? 'bg-green-500 text-white animate-pulse' 
                        : 'bg-yellow-400 text-gray-900'
                    }`}>
                      {appt.paymentStatus === 'Paid' ? '💰 PAID' : '⏳ PENDING'}
                    </span>
                  </div>
                </div>
                {appt.paymentStatus === 'Paid' && appt.paymentId && (
                  <div className="mt-2 text-xs text-green-600 text-center font-mono">
                    Payment ID: {appt.paymentId}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2 text-black">
  <InfoRow icon={<FaPhoneAlt />} label="Phone" value={appt.patientContact} />
  <InfoRow icon={<FaInfoCircle />} label="Reason" value={appt.reason || "N/A"} />
  <InfoRow
    icon={<FaClock />}
    label="Time"
    value={
      appt.appointmentTime && moment(appt.appointmentTime).isValid()
        ? moment(appt.appointmentTime).format("MMMM Do YYYY, h:mm A")
        : "N/A"
    }
  />
  <InfoRow
    icon={<FaCalendarCheck />}
    label="Created"
    value={
      appt.createdAt && moment(appt.createdAt).isValid()
        ? moment(appt.createdAt).format("DD/MM/YYYY")
        : "N/A"
    }
  />
  
  {/* Payment Information */}
  {appt.status === 'Confirmed' && (
    <>
      <InfoRow
        icon={<span>💰</span>}
        label="Consultation Fee"
        value={`₹${appt.amount || 'Not set'}`}
      />
      <InfoRow
        icon={<span>💳</span>}
        label="Payment Status"
        value={
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            appt.paymentStatus === 'Paid' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {appt.paymentStatus === 'Paid' ? '✅ Paid' : '⏳ Pending'}
          </span>
        }
      />
      {appt.paymentStatus === 'Paid' && appt.paymentId && (
        <InfoRow
          icon={<span>🧾</span>}
          label="Payment ID"
          value={
            <span className="text-xs text-green-600 font-mono">
              {appt.paymentId}
            </span>
          }
        />
      )}
    </>
  )}
</div>


            <div className="mt-6 text-right">
              <div className="flex gap-2 justify-end">
                <Link
                  to={`/doctor/patienthistory/${appt.patientRef?._id || "unknown"}`}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-full shadow-lg transition-all duration-300"
                >
                  <FaInfoCircle />
                  View History
                </Link>
                
                {/* Video Call Button - Only show if appointment is confirmed, paid, and within time window */}
                {appt.status === 'Confirmed' && appt.paymentStatus === 'Paid' && (() => {
                  const appointmentTime = new Date(appt.appointmentTime);
                  const timeDiffMinutes = (appointmentTime.getTime() - currentTime.getTime()) / (1000 * 60);
                  
                  // Show button 15 minutes before appointment until 2 hours after
                  const isTimeForCall = timeDiffMinutes <= 15 && timeDiffMinutes >= -120;
                  
                  if (!isTimeForCall) {
                    return (
                      <div className="inline-flex items-center gap-2 bg-gray-400 text-white font-semibold px-4 py-2 rounded-full shadow-lg opacity-75">
                        {timeDiffMinutes > 15 
                          ? `📅 Available in ${Math.ceil(timeDiffMinutes - 15)} min`
                          : '⏰ Call ended'
                        }
                      </div>
                    );
                  }
                  
                  return (
                    <button
                      onClick={() => window.open(`/video-call/${appt._id}`, '_blank')}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-full shadow-lg transition-all duration-300 animate-pulse"
                    >
                      📹 Start Video Call
                      {timeDiffMinutes <= 0 && timeDiffMinutes >= -5 && (
                        <span className="ml-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
                          LIVE
                        </span>
                      )}
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* Action Buttons */}
            {appt.status === "Pending" && (
              <div className="mt-6 flex flex-col gap-3">
                <button
                  disabled={loadingIds.includes(appt._id)}
                  onClick={() => handleAccept(appt._id)}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg shadow-md transition"
                >
                  Accept
                </button>

                {/* <button
                  disabled={loadingIds.includes(appt._id)}
                  onClick={() => openReschedule(appt)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg shadow-md transition"
                >
                  Reschedule
                </button> */}

                <textarea
                  placeholder="Cancellation reason (required)"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="border p-2 rounded resize-none text-sm"
                  rows={2}
                  disabled={loadingIds.includes(appt._id)}
                />
                <button
                  disabled={loadingIds.includes(appt._id)}
                  onClick={() => handleCancel(appt._id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg shadow-md transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          ))
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center">Reschedule Appointment</h3>
            <DatePicker
              selected={newDate}
              onChange={(date) => setNewDate(date)}
              showTimeSelect
              dateFormat="Pp"
              className="border p-2 rounded w-full"
              minDate={new Date()}
            />
            <div className="mt-4 flex justify-between">
              <button
                onClick={confirmReschedule}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
              <button
                onClick={() => setRescheduleId(null)}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="text-white">{icon}</span>
    <span className="flex items-center gap-2">
      <strong>{label}:</strong> 
      {typeof value === 'string' ? value : <span>{value}</span>}
    </span>
  </div>
);

const statusBadge = (status) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-300 text-yellow-900";
    case "Confirmed":
      return "bg-green-300 text-green-900";
    case "Cancelled":
      return "bg-red-300 text-red-900";
    case "Completed":
      return "bg-blue-300 text-blue-900";
    default:
      return "bg-gray-300 text-gray-900";
  }
};

export default ScheduledAppointment;
