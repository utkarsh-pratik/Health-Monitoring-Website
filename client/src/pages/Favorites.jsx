import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';  // Make sure to import axios
import notsuccess from '/src/assets/notifysuccess.png';  // Replace with your success notification icon path
import noterror from '/src/assets/notifyerror.png';  // Replace with your error notification icon path
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [form, setForm] = useState({
    patientName: '',
    patientContact: '',
    appointmentTime: new Date().toISOString().slice(0, 16),
    reason: '',
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10));
  const [doctorSlots, setDoctorSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    setFavorites(storedFavorites);
  }, []);

  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;
    const fetchSlots = async () => {
      const res = await axios.get(`/api/doctors/${selectedDoctor._id}/slots`, {
        params: { date: selectedDate }
      });
      setDoctorSlots(res.data.slots || []);
      setBookedSlots(res.data.booked || []);
      setSelectedSlot(""); // Reset slot selection on date change
    };
    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  const handleRemoveFromFavorites = (doctorId) => {
    const updatedFavorites = favorites.filter((doctor) => doctor._id !== doctorId);
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor); // Set the selected doctor when clicking "Book Appointment"
  };

  const isFavorite = (doctorId) => {
    return favorites.some((fav) => fav._id === doctorId);
  };

  // Validate if the date/time chosen is in the future
  const isValidDate = (date) => {
    const appointmentDate = new Date(date);
    return appointmentDate > new Date();  // Make sure the appointment is in the future
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      alert("Please select a slot.");
      return;
    }
    const appointmentTime = `${selectedDate}T${selectedSlot}:00`;

    if (!isValidDate(appointmentTime)) {
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
        { ...form, appointmentTime },
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
                    e.stopPropagation();
                    addToFavorites(doc);
                  }}
                  className="mt-5 flex justify-end"
                >
                  {isFavorite(doc._id) ? (
                    <FaHeart className="text-red-500" size={24} />
                  ) : (
                    <FaRegHeart className="text-white" size={24} />
                  )}
                </div>
                {/* View Details Button */}
                <button
                  onClick={() => setSelectedDoctor(doc)}
                  className="mt-5 w-full bg-gradient-to-r from-purple-700 via-purple-900 to-purple-800 hover:from-purple-900 hover:via-purple-700 hover:to-purple-800 py-2 rounded-xl text-white shadow-md transition"
                >
                  View Details & Book
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Appointment Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-all">
          <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-100 rounded-3xl shadow-2xl w-full max-w-3xl p-8 animate-fade-in">
            {/* Close Button */}
            <button
              onClick={() => setSelectedDoctor(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-xl font-semibold mb-4 text-center">Dr. {selectedDoctor.name}</h3>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left Column: Doctor Info, Date, Slots */}
              <div className="flex-1 min-w-[220px]">
                {/* Doctor Info */}
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={selectedDoctor.imageUrl || "/default-doctor.jpg"}
                    alt={selectedDoctor.name}
                    className="w-16 h-16 rounded-full border-4 border-purple-200 shadow-lg object-cover"
                  />
                  <div>
                    <div className="text-lg font-bold text-purple-800">{selectedDoctor.name}</div>
                    <div className="text-purple-500 font-medium">{selectedDoctor.specialty}</div>
                    {selectedDoctor.qualifications && (
                      <div className="text-base font-medium text-gray-700">{selectedDoctor.qualifications}</div>
                    )}
                    {selectedDoctor.yearsOfExperience && (
                      <div className="text-base font-medium text-gray-700">{selectedDoctor.yearsOfExperience} yrs exp.</div>
                    )}
                    {(selectedDoctor.clinicName || selectedDoctor.clinicAddress) && (
                      <div className="text-xs text-purple-700 mt-2">
                        <span className="font-semibold">Clinic Address:</span>{" "}
                        {selectedDoctor.clinicName ? `${selectedDoctor.clinicName}, ` : ""}
                        {selectedDoctor.clinicAddress}
                      </div>
                    )}
                    {selectedDoctor.awards && (
                      <div className="text-xs text-purple-700 mt-2">
                        <span className="font-semibold">Recognitions:</span> {selectedDoctor.awards}
                      </div>
                    )}
                    {selectedDoctor.services && (
                      <div className="text-xs text-purple-700 mt-2">
                        <span className="font-semibold">Services:</span> {selectedDoctor.services}
                      </div>
                    )}
                    <div className="text-sm text-gray-500 mt-2">
                      Fee: ₹{selectedDoctor.consultationFees}
                    </div>
                  </div>
                </div>
                {/* Date Picker */}
                <label className="block text-sm font-semibold text-purple-700 mb-1">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().slice(0,10)}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 mb-4 rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-400 transition"
                />
                {/* Slot Picker */}
                <label className="block text-sm font-semibold text-purple-700 mb-1">Available Slots</label>
                <div className="flex flex-wrap gap-2 mb-2 max-h-48 overflow-y-auto">
                  {doctorSlots.length === 0 ? (
                    <span className="text-gray-400 italic">No slots for this day</span>
                  ) : (
                    doctorSlots
                      .slice()
                      .sort((a, b) => a.start.localeCompare(b.start))
                      .map(slot => {
                        const isBooked = bookedSlots.includes(slot.start);
                        return (
                          <button
                            key={slot.start}
                            type="button"
                            disabled={isBooked}
                            onClick={() => setSelectedSlot(slot.start)}
                            className={`px-4 py-2 rounded-lg border font-semibold shadow-sm transition
                              ${isBooked
                                ? "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
                                : selectedSlot === slot.start
                                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white border-purple-700 scale-105"
                                  : "bg-white text-purple-700 border-purple-300 hover:bg-purple-100"}
                            `}
                            style={{ minWidth: 70 }}
                            title={isBooked ? "Already booked" : "Book this slot"}
                          >
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                              {slot.start}
                            </span>
                          </button>
                        );
                      })
                  )}
                </div>
              </div>
              {/* Right Column: Patient Details */}
              <div className="flex-1 min-w-[220px]">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-purple-700 mb-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={form.patientName}
                      onChange={e => setForm({ ...form, patientName: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-400 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-purple-700 mb-1">Contact Number</label>
                    <input
                      type="text"
                      placeholder="Enter contact number"
                      value={form.patientContact}
                      onChange={e => setForm({ ...form, patientContact: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-400 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-purple-700 mb-1">Selected Slot</label>
                    <input
                      type="text"
                      value={
                        selectedDate && selectedSlot
                          ? `${selectedDate} | ${selectedSlot}`
                          : "Select a slot on left"
                      }
                      readOnly
                      className="w-full px-4 py-2 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-purple-700 mb-1">Reason for Visit</label>
                    <textarea
                      placeholder="Describe your reason for visit"
                      value={form.reason}
                      onChange={e => setForm({ ...form, reason: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-400 transition"
                      rows={2}
                    />
                  </div>
                  <div className="flex flex-col gap-2 mt-6">
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold shadow-lg hover:from-purple-700 hover:to-blue-600 transition disabled:opacity-60"
                      disabled={!selectedSlot}
                    >
                      Confirm Appointment
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDoctor(null)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-gray-400 to-gray-600 text-white font-bold shadow-lg hover:from-gray-500 hover:to-gray-700 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
