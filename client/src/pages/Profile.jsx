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
      fields.forEach((f) => data.append(f.key, form[f.key] || ""));
      if (photoFile) data.append("photo", photoFile); // MUST be "photo"
      const res = await api.put("/api/patient/profile", data, {
        headers: { Authorization: `Bearer ${token}` },