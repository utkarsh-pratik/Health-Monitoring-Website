import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import {
  FaUserAlt,
  FaPhoneAlt,
  FaClock,
  FaInfoCircle,
  FaCalendarCheck,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ScheduledAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please login again.');
          return;
        }

        const res = await axios.get(
          'http://localhost:5000/api/doctors/scheduled-appointments',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        setAppointments(res.data.appointments);
        setError(null);
      } catch (error) {
        if (error.response) {
          setError(
            `Failed to load appointments: ${error.response.data.message || 'Server error'}`
          );
        } else if (error.request) {
          setError('No response from server. Please try again later.');
        } else {
          setError('Error: ' + error.message);
        }
      }
    };

    fetchAppointments();
  }, []);

  if (error) {
    return (
      <div className="p-8 text-center text-red-600 font-semibold text-lg bg-red-100 rounded-lg shadow-md">
        {error}
      </div>
    );
  }

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
        {appointments.map((appt, index) => (
          <div
            key={index}
            className="relative bg-white/30 backdrop-blur-md border border-white/10 shadow-2xl rounded-3xl p-6 hover:scale-[1.02] transition-transform duration-300 hover:shadow-indigo-300"
          >
            {/* Status Badge - Top Right */}
            <div className="absolute top-20  right-12 z-10">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold shadow-md ${statusBadge(appt.status)}`}
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
              <InfoRow icon={<FaInfoCircle />} label="Reason" value={appt.reason || 'N/A'} />
              <InfoRow
                icon={<FaClock />}
                label="Time"
                value={moment(appt.appointmentTime).format('MMMM Do YYYY, h:mm A')}
              />
              <InfoRow
                icon={<FaCalendarCheck />}
                label="Created"
                value={moment(appt.createdAt).format('DD/MM/YYYY')}
              />
            </div>

            <div className="mt-6 text-right">
              <Link
                to={`/doctor/patienthistory/${appt.patientRef?._id || 'unknown'}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-full shadow-lg transition-all duration-300"
              >
                <FaInfoCircle />
                View History
              </Link>
            </div>
          </div>
        ))}
      </div>
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
    case 'Pending':
      return 'bg-yellow-300 text-yellow-900';
    case 'Confirmed':
      return 'bg-green-300 text-green-900';
    case 'Cancelled':
      return 'bg-red-300 text-red-900';
    case 'Completed':
      return 'bg-blue-300 text-blue-900';
    default:
      return 'bg-gray-300 text-gray-900';
  }
};

export default ScheduledAppointment;
