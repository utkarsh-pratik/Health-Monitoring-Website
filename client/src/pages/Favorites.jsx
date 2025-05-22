import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';  // Make sure to import axios
import notsuccess from '/src/assets/notifysuccess.png';  // Replace with your success notification icon path
import noterror from '/src/assets/notifyerror.png';  // Replace with your error notification icon path

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form, setForm] = useState({
    patientName: '',
    patientContact: '',
    appointmentTime: new Date().toISOString().slice(0, 16),
    reason: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(storedFavorites);
  }, []);

  const handleRemoveFromFavorites = (doctorId) => {
    const updatedFavorites = favorites.filter((doctor) => doctor._id !== doctorId);
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor); // Set the selected doctor when clicking "Book Appointment"
  };

  // Validate if the date/time chosen is in the future
  const isValidDate = (date) => {
    const appointmentDate = new Date(date);
    return appointmentDate > new Date();  // Make sure the appointment is in the future
  };

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
      navigate('/patient/favorites'); // Redirect to appointments page after booking
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
      <div className="text-center mb-14">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text text-white mt-4 select-none">
          Your Favorites
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl">
        {favorites.length === 0 ? (
          <p className="text-center text-white/90 col-span-full text-lg font-semibold drop-shadow-lg">
            No doctors added to favorites yet.
          </p>
        ) : (
          favorites.map((doc) => (
            <div
              key={doc._id}
              className="cursor-pointer bg-black bg-opacity-60 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-105 transition-transform duration-300 ease-in-out transform -mt-9"
            >
              <img
                src={doc.imageUrl || '/default-doctor.jpg'}
                alt={doc.name}
                className="rounded-t-3xl h-80 w-full object-cover border-b border-purple-700"
              />
              <div className="p-4 text-white">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-[#a855f7] to-[#7e22ce] bg-clip-text text-transparent drop-shadow-md select-none">
                  {doc.name}
                </h2>
                <p className="text-sm text-purple-300 italic mt-1 select-none">{doc.specialty}</p>
                <p className="mt-3 font-semibold text-purple-400 select-none">
                  Consultation Fee: ₹{doc.consultationFees}
                </p>

                {/* Book Appointment Button */}
                <button
                  onClick={() => handleBookAppointment(doc)}
                  className="mt-4 w-full bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-3 rounded-xl shadow-md hover:bg-green-800 transition duration-300"
                >
                  Book Appointment
                </button>

                {/* Remove from Favorites Button */}
                <button
                  onClick={() => handleRemoveFromFavorites(doc._id)}
                  className="mt-4 w-full bg-gradient-to-r from-red-500 to-red-700 text-white font-bold py-3 rounded-xl shadow-md hover:bg-red-800 transition duration-300"
                >
                  Remove from Favorites
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Appointment Booking Modal */}
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

export default FavoritesPage;
