import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Header1 from './header1';
import api from '../api';

const fields = [
  { key: "age", label: "Age", type: "number" },
  { key: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
  { key: "contactNumber", label: "Contact Number", type: "text" },
  { key: "address", label: "Address", type: "text" },
  { key: "bloodGroup", label: "Blood Group", type: "text" },
  { key: "emergencyContact", label: "Emergency Contact", type: "text" },
  { key: "allergies", label: "Allergies", type: "textarea" },
  { key: "chronicIllnesses", label: "Chronic Illnesses", type: "textarea" },
  { key: "currentMedications", label: "Current Medications", type: "textarea" },
];

const defaultAvatar = "https://api.dicebear.com/7.x/adventurer/svg?seed=patient";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userRes = await api.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userRes.data);

        if (userRes.data.role === "patient") {
          const patientRes = await api.get("/api/patient/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setPatient(patientRes.data);
          setForm(patientRes.data);
          setPhotoPreview(patientRes.data.photo || defaultAvatar);
          localStorage.setItem('patientId', patientRes.data._id);
        }
      } catch (err) {
        setError("Failed to fetch profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEdit = () => {
    console.log("Edit clicked");
    setEditMode(true);
  };

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

  const handleSave = async (e) => {
    e.preventDefault();
    console.log("Save clicked");
    setMsg("");
    setError("");
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      fields.forEach((field) => data.append(field.key, form[field.key] || ""));
      if (photoFile) data.append("photo", photoFile);

      const res = await axios.put("/api/patient/profile", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatient(res.data);
      setForm(res.data);
      setEditMode(false);
      setMsg("Profile updated successfully!");
      setPhotoFile(null);
      setPhotoPreview(res.data.photo || defaultAvatar);
    } catch (err) {
      setError("Failed to update profile.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-purple-900">
        <span className="text-2xl text-white animate-pulse">Loading...</span>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-purple-900">
        <span className="text-2xl text-red-400">{error}</span>
      </div>
    );

  return (
    <>
        <Header1 />
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-black to-purple-900 px-4 py-16">
      <div className="bg-white/90 rounded-3xl shadow-2xl p-10 max-w-xl w-full flex flex-col items-center">
        {/* Profile Photo */}
        <div className="relative mb-6">
          <img
            src={photoPreview || defaultAvatar}
            alt="Profile"
            className="w-40 h-40 rounded-full border-4 border-purple-400 shadow-lg object-cover bg-white"
          />
          {editMode && (
            <button
              type="button"
              className="absolute bottom-2 right-2 bg-purple-600 text-white rounded-full p-2 shadow-lg hover:bg-purple-800 transition"
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

        {/* Name, Email, Role */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-purple-700 mb-2">{user.name}</h2>
          <p className="text-gray-600 font-medium">{user.email}</p>
          <span className="inline-block mt-2 px-4 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm shadow">
            {user.role}
          </span>
        </div>

        {/* Profile Details */}
{!editMode ? (
  <>
    <div className="w-full grid grid-cols-1 gap-5 mb-8">
      {fields.map((field) => (
        <div key={field.key} className="flex flex-col items-start">
          <label className="text-purple-700 font-semibold mb-1">{field.label}:</label>
          <div className="bg-purple-50 rounded-lg px-3 py-2 text-gray-700 shadow-inner min-h-[40px] w-full">
            {patient && patient[field.key]
              ? patient[field.key]
              : <span className="text-gray-400">Not set</span>}
          </div>
        </div>
      ))}
    </div>
    <div className="flex justify-center mt-10">
      <button
        type="button"
        onClick={handleEdit}
        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
      >
        Edit Profile
      </button>
    </div>
  </>
) : (
  <form onSubmit={handleSave}
    onKeyDown={e => {
      if (e.key === "Enter" && e.target.type !== "textarea") {
        e.preventDefault();
      }
    }}
    className="w-full"
  >
    <div className="grid grid-cols-1 gap-5">
      {fields.map((field) => (
        <div key={field.key} className="flex flex-col items-start">
          <label className="text-purple-700 font-semibold mb-1">{field.label}:</label>
          {field.type === "select" ? (
            <select
              name={field.key}
              value={form[field.key] || ""}
              onChange={handleChange}
              className="w-full p-2 rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-400"
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
              className="w-full p-2 rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-400"
            />
          ) : (
            <input
              type={field.type}
              name={field.key}
              value={form[field.key] || ""}
              onChange={handleChange}
              className="w-full p-2 rounded-lg border border-purple-300 focus:ring-2 focus:ring-purple-400"
            />
          )}
        </div>
      ))}
    </div>
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
          setForm(patient);
          setPhotoFile(null);
          setPhotoPreview(patient?.photo || defaultAvatar);
        }}
        className="px-8 py-3 bg-gradient-to-r from-gray-400 to-gray-600 text-white font-bold rounded-xl shadow-lg hover:from-gray-500 hover:to-gray-700 transition-all duration-300"
      >
        Cancel
      </button>
    </div>
    {msg && <div className="text-green-600 font-semibold text-center mt-4">{msg}</div>}
    {error && <div className="text-red-600 font-semibold text-center mt-4">{error}</div>}
  </form>
)}
      </div>
    </div>
    </>
  );
};

export default Profile;
