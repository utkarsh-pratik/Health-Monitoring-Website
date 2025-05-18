import { useEffect, useState } from 'react';
import axios from 'axios';

const UpcomingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
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

    fetchAppointments();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Upcoming Appointments</h1>

      {appointments.length === 0 ? (
        <p className="text-gray-600">No upcoming appointments.</p>
      ) : (
        <ul className="space-y-4">
          {appointments.map((appt, index) => (
            <li
              key={index}
              className="bg-white shadow-md rounded-xl p-4 border border-gray-200"
            >
              <p>
                <strong>Doctor:</strong> {appt.doctorName}
              </p>
              <p>
                <strong>Specialty:</strong> {appt.specialty}
              </p>
              <p>
                <strong>Date:</strong>{' '}
                {new Date(appt.appointmentTime).toLocaleDateString()}
              </p>
              <p>
                <strong>Time:</strong>{' '}
                {new Date(appt.appointmentTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p>
                <strong>Status:</strong> {appt.status}
              </p>
              {appt.reason && (
                <p>
                  <strong>Reason:</strong> {appt.reason}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UpcomingAppointments;
