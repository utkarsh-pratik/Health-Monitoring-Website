// src/pages/CreateListing.jsx
import React, { useState, useEffect, useRef } from "react";
import api from '../api';

const defaultAvatar = "https://api.dicebear.com/7.x/adventurer/svg?seed=doctor";

// All doctor profile fields
const doctorFields = [
  { key: "specialty", label: "Specialty", type: "text" },
  { key: "qualifications", label: "Qualifications", type: "text" },
  { key: "yearsOfExperience", label: "Years of Experience", type: "number" },
  { key: "contactNumber", label: "Contact Number", type: "text" },
  { key: "clinicName", label: "Clinic/Hospital Name", type: "text" },
  { key: "clinicAddress", label: "Clinic/Hospital Address", type: "text" },
  { key: "registrationNumber", label: "Registration Number", type: "text" },
  { key: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
  { key: "languages", label: "Languages Spoken (comma separated)", type: "text" },
  { key: "linkedIn", label: "LinkedIn/Profile Link", type: "text" },
  { key: "awards", label: "Awards/Recognitions", type: "textarea" },
  { key: "services", label: "Services Offered", type: "textarea" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "consultationFees", label: "Consultation Fee (₹)", type: "number" },
];

const CreateListing = () => {
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [form, setForm] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(defaultAvatar);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  // Fetch user and doctor profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        // Get user info (name, email)
        const userRes = await api.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        // Get doctor profile
        const docRes = await api.get("/api/doctors/my-profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.setItem('doctorId', docRes.data._id);
        setDoctor(docRes.data);
        setForm({
          ...docRes.data,
          name: docRes.data.name || userRes.data.name,
          languages: docRes.data.languages ? docRes.data.languages.join(", ") : "",
        });
        setPhotoPreview(docRes.data.imageUrl || defaultAvatar);
        setEditMode(false);
      } catch (err) {
        // If no profile, prefill name/email from user
        try {
          const token = localStorage.getItem("token");
          const userRes = await api.get("/api/auth/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(userRes.data);
          setForm({ name: userRes.data.name, email: userRes.data.email });
          setPhotoPreview(defaultAvatar);
          setEditMode(true);
        } catch {
          setError("Failed to fetch user info.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => setEditMode(true);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setError("");
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null) data.append(k, v);
      });
      if (photoFile) data.append("image", photoFile); // Doctor photo field is "image"
  
      let res;
      // Use the 'doctor' state to determine if we should update or create
      if (doctor && doctor._id) {
        // Profile exists, so update it
        res = await api.put("/api/doctors/my-profile", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMsg("Profile updated successfully!");
      } else {
        // Profile does not exist, so create it
        res = await api.post("/api/doctors/create-listing", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMsg("Profile created successfully!");
      }
  
      setDoctor(res.data);
      setForm({
        ...res.data,
        languages: res.data.languages ? res.data.languages.join(", ") : "",
      });
      setPhotoPreview(res.data.imageUrl || defaultAvatar);
      localStorage.setItem('doctorId', res.data._id);
      setEditMode(false);
      setPhotoFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile. Please ensure all required fields are filled.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-700 to-blue-600">
        <span className="text-2xl text-white animate-pulse">Loading...</span>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-700 to-blue-600 px-4 py-16">
      <div className="bg-white/90 rounded-3xl shadow-2xl p-10 max-w-2xl w-full flex flex-col items-center">
        {/* Profile Photo */}
        <div className="relative mb-6">
          <img
            src={photoPreview || defaultAvatar}
            alt="Doctor"
            className="w-40 h-40 rounded-full border-4 border-indigo-400 shadow-lg object-cover bg-white"
          />
          {editMode && (
            <button
              type="button"
              className="absolute bottom-2 right-2 bg-indigo-600 text-white rounded-full p-2 shadow-lg hover:bg-indigo-800 transition"
              onClick={() => fileInputRef.current.click()}
              title="Change Photo"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h6m2 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>

        <div className="flex flex-col items-start w-full">
          <label className="text-indigo-700 font-semibold mb-1">Name:</label>
          {editMode ? (
            <input
              type="text"
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              className="w-full p-2 rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-400"
              required
            />
          ) : (
            <div className="bg-indigo-50 rounded-lg px-3 py-2 text-gray-700 shadow-inner min-h-[40px] w-full">
              {doctor && doctor.name ? doctor.name : <span className="text-gray-400">Not set</span>}
            </div>
          )}
        </div>

        {/* Name, Email (non-editable) */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-indigo-700 mb-2">{user?.name}</h2>
          <p className="text-gray-600 font-medium">{user?.email}</p>
          <span className="inline-block mt-2 px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm shadow">
            Doctor
          </span>
        </div>

        {/* Profile Details */}
        {editMode ? (
          <form onSubmit={handleSave} className="w-full">
            <div className="grid grid-cols-1 gap-5">
              {doctorFields.map((field) => (
                <div key={field.key} className="flex flex-col items-start">
                  <label className="text-indigo-700 font-semibold mb-1">{field.label}:</label>
                  {field.type === "select" ? (
                    <select
                      name={field.key}
                      value={form[field.key] || ""}
                      onChange={handleChange}
                      className="w-full p-2 rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-400"
                    >
                      <option value="">Select</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      name={field.key}
                      value={form[field.key] || ""}
                      onChange={handleChange}
                      className="w-full p-2 rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-400"
                    />
                  ) : (
                    <input
                      type={field.type}
                      name={field.key}
                      value={form[field.key] || ""}
                      onChange={handleChange}
                      className="w-full p-2 rounded-lg border border-indigo-300 focus:ring-2 focus:ring-indigo-400"
                    />
                  )}
                </div>
              ))}
            </div>
            {/* Action Buttons */}
            <div className="flex justify-center gap-4 items-center mt-10">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-xl shadow-lg hover:from-green-600 hover:to-green-800 transition-all duration-300"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setForm(doctor || {});
                  setPhotoFile(null);
                  setPhotoPreview(doctor?.imageUrl || defaultAvatar);
                }}
                className="px-8 py-3 bg-gradient-to-r from-gray-400 to-gray-600 text-white font-bold rounded-xl shadow-lg hover:from-gray-500 hover:to-gray-700 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
            {msg && <div className="text-green-600 font-semibold text-center mt-4">{msg}</div>}
            {error && <div className="text-red-600 font-semibold text-center mt-4">{error}</div>}
          </form>
        ) : (
          <div className="w-full">
            <div className="grid grid-cols-1 gap-5">
              {doctorFields.map((field) => (
                <div key={field.key} className="flex flex-col items-start">
                  <label className="text-indigo-700 font-semibold mb-1">{field.label}:</label>
                  <div className="bg-indigo-50 rounded-lg px-3 py-2 text-gray-700 shadow-inner min-h-[40px] w-full">
                    {field.key === "languages"
                      ? (doctor && doctor.languages && doctor.languages.length
                          ? doctor.languages.join(", ")
                          : <span className="text-gray-400">Not set</span>)
                      : doctor && doctor[field.key]
                        ? doctor[field.key]
                        : <span className="text-gray-400">Not set</span>
                    }
                  </div>
                </div>
              ))}
            </div>
            {/* Action Buttons */}
            <div className="flex justify-center gap-4 items-center mt-10">
              <button
                type="button"
                onClick={handleEdit}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-bold rounded-xl shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300"
              >
                Edit Profile
              </button>
            </div>
            {msg && <div className="text-green-600 font-semibold text-center mt-4">{msg}</div>}
            {error && <div className="text-red-600 font-semibold text-center mt-4">{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateListing;
