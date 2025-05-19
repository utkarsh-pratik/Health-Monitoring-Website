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
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-600 via-blue-500 to-purple-600 flex flex-col items-center py-12 px-6">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-yellow-300 drop-shadow-lg tracking-wide max-w-4xl w-full">
        Your Upcoming Appointments 📅✨
      </h1>

      <div className="w-full max-w-4xl">
        {appointments.length === 0 ? (
          <p className="text-yellow-100 text-center text-xl">No upcoming appointments. 💤</p>
        ) : (
          <ul className="space-y-8">
            {appointments.map((appt, index) => (
              <li
                key={index}
                className="relative bg-white bg-opacity-20 backdrop-blur-md border-l-8 border-gradient-to-b from-pink-400 via-yellow-400 to-green-400 rounded-3xl p-8 shadow-xl hover:shadow-3xl transition-transform duration-300 transform hover:-translate-y-2 cursor-pointer text-white drop-shadow-md"
              >
                {/* Status Ribbon */}
                <span className={`absolute top-6 right-6 px-4 py-1 rounded-full text-sm font-semibold
                  ${
                    appt.status === 'Confirmed' ? 'bg-green-500' :
                    appt.status === 'Pending' ? 'bg-yellow-400 text-gray-900' :
                    appt.status === 'Cancelled' ? 'bg-red-600' :
                    appt.status === 'Completed' ? 'bg-blue-600' :
                    'bg-gray-400'
                  }
                  before:absolute before:content-[""] before:left-[-10px] before:top-0 before:h-full before:w-2 before:bg-opacity-90 before:rounded-l-full
                `}>
                  {appt.status === 'Confirmed' && '✔️ Confirmed'}
                  {appt.status === 'Pending' && '⏳ Pending'}
                  {appt.status === 'Cancelled' && '❌ Cancelled'}
                  {appt.status === 'Completed' && '✅ Completed'}
                  {!['Confirmed','Pending','Cancelled','Completed'].includes(appt.status) && appt.status}
                </span>

                <div className="mb-6">
                  <h2 className="text-3xl font-extrabold tracking-wide mb-1">
                    Dr. {appt.doctorName} 👨‍⚕️
                  </h2>
                  {appt.doctorSpecialty && (
                    <p className="italic font-semibold text-lg">🩺 {appt.doctorSpecialty}</p>
                  )}
                </div>

                <div className="space-y-5 text-lg font-semibold">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📅</span>
                    <span>
                      {new Date(appt.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⏰</span>
                    <span>
                      {new Date(appt.date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </div>

                  {appt.reason && (
                    <div className="bg-white bg-opacity-25 rounded-2xl p-4 border border-white border-opacity-40 shadow-inner italic font-semibold text-black">
                      <span role="img" aria-label="reason">📝</span> Reason: {appt.reason}
                    </div>
                  )}
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
