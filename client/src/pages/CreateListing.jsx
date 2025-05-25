// src/pages/CreateListing.jsx
import React, { useState } from 'react';

const CreateListing = () => {
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    description: '',
    consultationFees: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      setMessage('📸 Please upload a profile image of the doctor.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('🔐 You must be logged in to create a listing.');
        return;
      }

      const data = new FormData();
      data.append('name', formData.name);
      data.append('specialty', formData.specialty);
      data.append('description', formData.description);
      data.append('consultationFees', formData.consultationFees);
      data.append('image', imageFile);

      const response = await fetch('http://localhost:5000/api/doctors/create-listing', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('✅ Doctor listing created successfully!');
        setFormData({ name: '', specialty: '', description: '', consultationFees: '' });
        setImageFile(null);
      } else {
        setMessage(result.message || '❌ Failed to create listing.');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      setMessage('⚠️ An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-950 via-black to-purple-900 flex items-center justify-center px-4 py-16">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl max-w-2xl w-full p-10 text-white">
        <h1 className="text-4xl font-bold text-center text-cyan-300 drop-shadow mb-6">
          🏥 Add a Doctor to HealthCard
        </h1>
        <p className="text-center text-sm text-purple-200 mb-10">
          Boost your care team visibility. Add trusted professionals to your network today!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            name="name"
            placeholder="Full Name of the Doctor"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-white/10 placeholder-purple-300 text-white focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            required
          />

          <input
            type="text"
            name="specialty"
            placeholder="Medical Specialty (e.g., Cardiologist)"
            value={formData.specialty}
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-white/10 placeholder-purple-300 text-white focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            required
          />

          <textarea
            name="description"
            placeholder="Brief professional background or patient care philosophy"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full p-4 rounded-xl bg-white/10 placeholder-purple-300 text-white focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500 transition resize-none"
            required
          />

          <input
            type="number"
            name="consultationFees"
            placeholder="Consultation Fee (USD)"
            value={formData.consultationFees}
            onChange={handleChange}
            className="w-full p-4 rounded-xl bg-white/10 placeholder-purple-300 text-white focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
            required
            min="0"
            step="0.01"
          />

          <div>
            <label className="block mb-2 font-semibold text-cyan-400">
              Upload Doctor's Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
              className="text-purple-200"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 transition py-4 rounded-xl font-bold text-lg shadow-lg shadow-cyan-500/40"
          >
            ➕ Create Listing
          </button>
        </form>

        {message && (
          <p className="mt-6 text-center text-yellow-300 font-medium animate-pulse">{message}</p>
        )}
      </div>
    </div>
  );
};

export default CreateListing;
