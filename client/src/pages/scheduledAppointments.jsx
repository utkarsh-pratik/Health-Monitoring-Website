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
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {appointments.map((appt, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 shadow-lg rounded-2xl p-6 transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <FaUserAlt className="text-blue-500" />
              <h2 className="text-xl font-bold text-gray-800">{appt.patientName}</h2>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-1">
              <FaPhoneAlt />
              <span>{appt.patientContact}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700 mt-3">
              <FaInfoCircle />
              <span>
                <strong>Reason:</strong> {appt.reason || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700 mt-1">
              <FaClock />
              <span>
                <strong>Time:</strong>{' '}
                {moment(appt.appointmentTime).format('MMMM Do YYYY, h:mm A')}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700 mt-1">
              <FaCalendarCheck />
              <span>
                <strong>Created:</strong>{' '}
                {moment(appt.createdAt).format('DD/MM/YYYY')}
              </span>
            </div>
            <div className="mt-4">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusBadge(appt.status)}`}
              >
                {appt.status}
              </span>
            </div>
          </div>

          <div className="mt-6 text-right">
            <Link
              to={`/doctor/patient-history/${appt.patientRef?._id || 'unknown'}`}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-full shadow-md transition duration-300 ease-in-out"
            >
              <FaInfoCircle className="text-white" />
              Past History
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

const statusBadge = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'Confirmed':
      return 'bg-green-100 text-green-700';
    case 'Cancelled':
      return 'bg-red-100 text-red-700';
    case 'Completed':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

export default ScheduledAppointment;
