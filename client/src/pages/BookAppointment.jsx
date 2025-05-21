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

  const [filters, setFilters] = useState({
    name: '',
    specialty: '',
    maxFee: '',
    day: '',
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const params = {};
        if (filters.name) params.name = filters.name;
        if (filters.specialty) params.specialty = filters.specialty;
        if (filters.maxFee) params.maxFee = filters.maxFee;
        if (filters.day) params.day = filters.day;

        const res = await axios.get('/api/doctors/available', { params });
        setDoctors(res.data);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      }
    };
    fetchDoctors();
  }, [filters]);

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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-950 to-black py-16 px-6 md:px-12 font-sans">
      {/* Title */}
      <div className="text-center mb-14">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text text-white mt-4  select-none">
          Available Doctors
        </h1>
      </div>

      {/* Filters */}
      <div className="relative z-10 postion:relative bottom-9  mb-5 mt-1 flex flex-wrap gap-4 max-w-6xl w-full mx-auto justify-center">
        <input
          type="text"
          placeholder="Name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          className="min-w-[120px] px-4 py-2 rounded-full shadow-md border border-transparent bg-black bg-opacity-80 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm transition duration-300"
        />
        <select
          value={filters.specialty}
          onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
          className="min-w-[140px] px-4 py-2 rounded-full shadow-md border border-transparent bg-black bg-opacity-80 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm transition duration-300"
        >
          <option value="" className="text-gray-400">Specialty</option>
          <option value="Cardiologist">Cardiologist</option>
          <option value="Dermatologist">Dermatologist</option>
          <option value="Neurologist">Neurologist</option>
        </select>
        <input
          type="number"
          placeholder="Max Fee"
          value={filters.maxFee}
          onChange={(e) => setFilters({ ...filters, maxFee: e.target.value })}
          className="min-w-[100px] px-4 py-2 rounded-full shadow-md border border-transparent bg-black bg-opacity-80 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm transition duration-300"
        />
        <select
          value={filters.day}
          onChange={(e) => setFilters({ ...filters, day: e.target.value })}
          className="min-w-[110px] px-4 py-2 rounded-full shadow-md border border-transparent bg-black bg-opacity-80 text-white focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm transition duration-300"
        >
          <option value="" className="text-gray-400">Day</option>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>

        <button
          onClick={() => setFilters({ name: '', specialty: '', maxFee: '', day: '' })}
          className="px-5 py-2 bg-black bg-opacity-90 hover:bg-purple-800 text-white font-semibold rounded-full shadow-lg text-sm transition duration-400 whitespace-nowrap"
          aria-label="Reset filters"
        >
          Reset
        </button>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 -mt-9  md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl">
        {doctors.length === 0 ? (
          <p className="text-center text-white/90 col-span-full text-lg font-semibold drop-shadow-lg">
            No available doctors at the moment.
          </p>
        ) : (
          doctors.map((doc) => (
            <div
              key={doc._id}
              onClick={() => setSelectedDoctor(doc)}
              className="cursor-pointer bg-black bg-opacity-40 rounded-3xl shadow-lg shadow-purple-900/60 hover:shadow-purple-700/80 transform hover:-translate-y-4 transition-transform duration-300 border border-purple-700"
            >
              <img
                src={doc.imageUrl}
                alt={doc.name}
                className="rounded-t-3xl h-56 w-full object-cover border-b border-purple-700"
              />
              <div className="p-2 text-white">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#a855f7] to-[#7e22ce] bg-clip-text text-transparent drop-shadow-md select-none">
                  {doc.name}
                </h2>
                <p className="text-sm text-purple-300 italic mt-1 select-none">{doc.specialty}</p>
                <p className="mt-3 font-semibold text-purple-400 select-none">
                  Consultation Fee: ₹{doc.consultationFees}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDoctor(doc);
                  }}
                  className="mt-5 w-full bg-gradient-to-r from-purple-700 via-purple-900 to-purple-800 hover:from-purple-900 hover:via-purple-700 hover:to-purple-900 text-white font-bold py-3 rounded-xl shadow-md transition duration-300 select-none"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Fullscreen Modal Form */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50 px-4">
          <div className="bg-[#1e0f3a] rounded-3xl max-w-lg w-full p-8 shadow-2xl relative border border-purple-700 animate-fadeIn">
            <button
              onClick={() => setSelectedDoctor(null)}
              className="absolute top-6 right-6 text-purple-400 hover:text-purple-700 text-3xl font-bold transition select-none"
              aria-label="Close form"
            >
              &times;
            </button>
            <h2 className="text-3xl font-extrabold mb-6 text-purple-400 text-center select-none">
              Book Appointment with Dr. {selectedDoctor.name}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                placeholder="Patient Name"
                value={form.patientName}
                onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                className="w-full border border-purple-700 rounded-xl p-3 bg-[#2e1a58] placeholder-purple-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
              <input
                type="text"
                placeholder="Email"
                value={form.patientContact}
                onChange={(e) => setForm({ ...form, patientContact: e.target.value })}
                className="w-full border border-purple-700 rounded-xl p-3 bg-[#2e1a58] placeholder-purple-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
              <input
                type="datetime-local"
                value={form.appointmentTime}
                onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })}
                className="w-full border border-purple-700 rounded-xl p-3 bg-[#2e1a58] placeholder-purple-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                required
              />
              <input
                type="text"
                placeholder="Reason (optional)"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full border border-purple-700 rounded-xl p-3 bg-[#2e1a58] placeholder-purple-300 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-700 via-purple-900 to-purple-800 hover:from-purple-900 hover:via-purple-700 hover:to-purple-900 text-white font-bold py-3 rounded-xl shadow-md transition duration-300"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Animation Styles */}
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
