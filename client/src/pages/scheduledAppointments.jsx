// src/components/ScheduledAppointment.jsx
import React, { useEffect, useState } from "react";
import moment from "moment";
import api from '../api';
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

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found. Please login again.");
          return;
        }

        const res = await api.get(
          "/api/doctors/scheduled-appointments",
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

    fetchAppointments();
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
      await api.patch(
        `/api/doctors/appointments/${id}/status`,
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
    await api.patch(
      `/api/doctors/appointments/${id}/status`,
      { status: "Cancelled", reason: cancelReason },
      { headers: { Authorization: `Bearer ${token}` } }
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
  //     await api.patch(
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

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#6b8dd6] bg-fixed animate-gradient-xy">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {appointments.map((appt) => (
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
</div>


            <div className="mt-6 text-right">
              <Link
                to={`/doctor/patienthistory/${appt.patientRef || "unknown"}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-full shadow-lg transition-all duration-300"
              >
                <FaInfoCircle />
                View History
              </Link>
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
        ))}
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
    <span>
      <strong>{label}:</strong> {value}
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
