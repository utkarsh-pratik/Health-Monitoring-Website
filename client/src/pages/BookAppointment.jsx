import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // Import React Icons
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import notsuccess from '../assets/notifysuccess.png';
import noterror from '../assets/notifyerror.png';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form, setForm] = useState({
    patientName: '',
    patientContact: '',
    appointmentTime: new Date().toISOString().slice(0, 16), // Default to current date and time
    reason: '',
  });

  const [filters, setFilters] = useState({
    name: '',
    specialty: '',
    maxFee: '',
    day: '',
  });

  const [loading, setLoading] = useState(false); // Loading state for doctors
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorites')) || []); // State to manage favorites

  const navigate = useNavigate(); // Hook for redirection

  // Fetch doctors based on filters
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [filters]);

  // Date validation
  const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  // Add doctor to favorites in localStorage
  const addToFavorites = (doctor) => {
    let updatedFavorites = [...favorites];
    if (!updatedFavorites.some((fav) => fav._id === doctor._id)) {
      updatedFavorites.push(doctor);
      setFavorites(updatedFavorites); // Update state
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites)); // Save to localStorage
    } else {
      updatedFavorites = updatedFavorites.filter((fav) => fav._id !== doctor._id); // Remove from favorites
      setFavorites(updatedFavorites);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites)); // Save to localStorage
    }
  };

  // Check if doctor is in favorites
  const isFavorite = (doctorId) => {
    return favorites.some((fav) => fav._id === doctorId);
  };

  // Handle form submission for booking an appointment
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidDate(form.appointmentTime)) {
      alert('Please select a valid appointment time.');
      return;
    }

    // Request notification permission if not granted
    if (Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/appointments/book-appointment/${selectedDoctor._id}`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
          ContentType: 'application/json',
        }
      );

      // Show success notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification('Appointment booked!', {
          body: `Your appointment with Dr. ${selectedDoctor.name} is confirmed.`,
          icon: notsuccess,
        });
      } else {
        alert('Appointment booked!');
      }

      setSelectedDoctor(null);
      setForm({ patientName: '', patientContact: '', appointmentTime: '', reason: '' });
      navigate('/patient/appointments'); // Redirect to appointments page after booking
    } catch (err) {
      console.error('Booking failed:', err);

      // Show error notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification('Booking failed', {
          body: 'There was an error booking your appointment. Please try again.',
          icon: noterror,
        });
      } else {
        alert('Booking failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-950 to-black py-16 px-6 md:px-12 font-sans">
      {/* Title */}
      <div className="text-center mb-14">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text text-white mt-4 select-none">
          Available Doctors
        </h1>
      </div>

      {/* Filters */}
      <div className="relative z-10 mb-20 - mt-20 position:relative bottom-14 flex flex-wrap gap-4 max-w-6xl w-full mx-auto justify-center">
        <input
          type="text"
          placeholder="Search by Name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          className="px-4 py-2 rounded-lg border border-purple-700 bg-[#2e1a58] text-white"
        />
        <input
          type="text"
          placeholder="Specialty"
          value={filters.specialty}
          onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
          className="px-4 py-2 rounded-lg border border-purple-700 bg-[#2e1a58] text-white"
        />
        <input
          type="number"
          placeholder="Max Consultation Fee"
          value={filters.maxFee}
          onChange={(e) => setFilters({ ...filters, maxFee: e.target.value })}
          className="px-4 py-2 rounded-lg border border-purple-700 bg-[#2e1a58] text-white"
        />
        {/* <input
          type="date"
          value={filters.day}
          onChange={(e) => setFilters({ ...filters, day: e.target.value })}
          className="px-4 py-2 rounded-lg border border-purple-700 bg-[#2e1a58] text-white"
        /> */}
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <div className="text-center text-white">Loading doctors...</div>
      ) : (
        <div className="grid grid-cols-1 -mt-28 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl">
          {doctors.length === 0 ? (
            <p className="text-center text-white/90 col-span-full text-lg font-semibold drop-shadow-lg">
              No available doctors at the moment.
            </p>
          ) : (
            doctors.map((doc) => (
              <div
                key={doc._id}
                onClick={() => {
                  setSelectedDoctor(doc); // Set the selected doctor here
                }}
                className="cursor-pointer bg-black bg-opacity-40 rounded-3xl shadow-lg shadow-purple-900/60 hover:shadow-purple-700/80 transform hover:-translate-y-4 transition-transform duration-300 border border-purple-700"
              >
                <img
                  src={doc.imageUrl || '/default-doctor.jpg'}
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

                  {/* Add to Favorites Button */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the button click from propagating to parent click
                      addToFavorites(doc); // Pass the correct doctor here
                    }}
                    className="mt-5 flex justify-end"
                  >
                    {isFavorite(doc._id) ? (
                      <FaHeart className="text-red-500" size={24} /> // Filled heart (favorite)
                    ) : (
                      <FaRegHeart className="text-white" size={24} /> // Outline heart (not favorite)
                    )}
                  </div>

                  {/* Book Appointment Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDoctor(doc); 
                    }}
                    className="mt-5 w-full bg-gradient-to-r from-purple-700 via-purple-900 to-purple-800 hover:from-purple-900 hover:via-purple-700 hover:to-purple-800 py-2 rounded-xl text-white shadow-md transition"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Booking Form */}
      {selectedDoctor && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-70 z-50">
          <div className="bg-white rounded-lg w-96 p-6">
            <h3 className="text-xl font-semibold mb-4">Book an Appointment with {selectedDoctor.name}</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Your Name"
                value={form.patientName}
                onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                className="w-full p-2 mb-3 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Contact Number"
                value={form.patientContact}
                onChange={(e) => setForm({ ...form, patientContact: e.target.value })}
                className="w-full p-2 mb-3 border rounded-lg"
                required
              />
              <input
                type="datetime-local"
                value={form.appointmentTime}
                onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })}
                className="w-full p-2 mb-3 border rounded-lg"
                required
              />
              <textarea
                placeholder="Reason for Visit"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full p-2 mb-4 border rounded-lg"
              />
              <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg">
                Confirm Appointment
              </button>
            </form>
            <button
              onClick={() => setSelectedDoctor(null)}
              className="mt-4 text-red-500 w-full py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;

