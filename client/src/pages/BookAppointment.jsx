import { useEffect, useState } from 'react';
import axios from 'axios';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form, setForm] = useState({
    patientName: '',
    patientContact: '',
    appointmentTime: '',
    reason: '',
  });

  useEffect(() => {
    axios
      .get('/api/doctors/available')
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error('Error fetching doctors:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/appointments/book-appointment/${selectedDoctor._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Appointment booked!');
      setSelectedDoctor(null);
      setForm({ patientName: '', patientContact: '', appointmentTime: '', reason: '' });
    } catch (err) {
      console.error('Booking failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-8">
      <h1 className="text-4xl font-extrabold text-center mb-10 text-purple-700 drop-shadow-lg">
        Available Doctors
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {doctors.map((doc) => (
          <div
            key={doc._id}
            onClick={() => setSelectedDoctor(doc)}
            className="cursor-pointer bg-white rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-transform duration-300 border border-purple-300"
          >
            <img
              src={doc.imageUrl}
              alt={doc.name}
              className="rounded-t-3xl h-56 w-full object-cover"
            />
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-purple-800">{doc.name}</h2>
              <p className="text-sm text-purple-600 italic">{doc.specialty}</p>
              <p className="mt-2 font-semibold text-purple-700">
                Consultation Fee: ₹{doc.consultationFees}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDoctor(doc);
                }}
                className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transition"
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Modal Form */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setSelectedDoctor(null)}
              className="absolute top-6 right-6 text-purple-600 hover:text-purple-900 text-3xl font-bold transition"
              aria-label="Close form"
            >
              &times;
            </button>
            <h2 className="text-3xl font-extrabold mb-6 text-purple-700 text-center">
              Book Appointment with Dr. {selectedDoctor.name}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                placeholder="Patient Name"
                value={form.patientName}
                onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                className="w-full border border-purple-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <input
                type="text"
                placeholder="Contact Number"
                value={form.patientContact}
                onChange={(e) => setForm({ ...form, patientContact: e.target.value })}
                className="w-full border border-purple-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <input
                type="datetime-local"
                value={form.appointmentTime}
                onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })}
                className="w-full border border-purple-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <input
                type="text"
                placeholder="Reason (optional)"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full border border-purple-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 rounded-xl shadow-lg transition"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default BookAppointment;
