// client/src/pages/Favorites.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { FaHeart, FaCalendarCheck } from 'react-icons/fa';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch favorites from the API on component mount
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/api/patient/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(res.data.favorites || []);
      } catch (err) {
        setError('Failed to load your favorite doctors.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  // Handle removing a doctor from favorites
  const handleRemoveFromFavorites = async (e, doctorId) => {
    e.stopPropagation(); // Prevent navigation when clicking the heart icon
    try {
      const token = localStorage.getItem('token');
      await api.post('/api/patient/favorites/remove', { doctorId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update state immediately for a responsive UI
      setFavorites(prev => prev.filter(d => d._id !== doctorId));
    } catch (err) {
      console.error('Remove favorite failed', err);
      alert('Failed to remove favorite. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-950 to-black py-16 px-6 md:px-12 font-sans">
      <div className="text-center mb-14">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mt-4 select-none">
          Your Favorite Doctors
        </h1>
      </div>

      {loading && (
        <p className="text-center text-white/90 col-span-full text-lg">Loading...</p>
      )}
      {error && (
        <p className="text-center text-red-400 col-span-full text-lg">{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {!loading && favorites.length === 0 ? (
          <p className="text-center text-white/90 col-span-full text-lg font-semibold drop-shadow-lg">
            You haven't added any doctors to your favorites yet.
          </p>
        ) : (
          favorites.map((doc) => (
            <div
              key={doc._id}
              className="cursor-pointer bg-black bg-opacity-40 rounded-3xl shadow-lg shadow-purple-900/60 hover:shadow-purple-700/80 transform hover:-translate-y-2 transition-all duration-300 border border-purple-700 flex flex-col"
            >
              <img
                src={doc.imageUrl || 'https://api.dicebear.com/7.x/adventurer/svg?seed=doctor'}
                alt={doc.name}
                className="rounded-t-3xl h-56 w-full object-cover border-b border-purple-700"
              />
              <div className="p-5 text-white flex flex-col flex-grow">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-[#a855f7] to-[#d8b4fe] bg-clip-text text-transparent select-none">
                    {doc.name}
                  </h2>
                  <button
                    onClick={(e) => handleRemoveFromFavorites(e, doc._id)}
                    title="Remove from Favorites"
                  >
                    <FaHeart className="text-red-500" size={24} />
                  </button>
                </div>
                <p className="text-sm text-purple-300 italic mt-1 select-none">{doc.specialty}</p>
                <p className="mt-3 font-semibold text-purple-400 select-none">
                  Fee: ₹{doc.consultationFees}
                </p>
                <div className="mt-auto pt-4">
                  <Link
                    to="/patient/appointments"
                    state={{ doctorId: doc._id }} // Pass doctorId to pre-select on the booking page
                    className="mt-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-700 to-blue-600 hover:from-purple-800 hover:to-blue-700 py-2 rounded-xl text-white shadow-md transition"
                  >
                    <FaCalendarCheck /> Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
