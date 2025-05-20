import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LandingPage from "./pages/LandingPage";
import DoctorProfile from "./pages/doctorProfile";
import ProfileSettings from "./components/ProfileSettings";
import BookAppointment from "./pages/BookAppointment";
import CreateListing from "./pages/CreateListing";
import About from "./pages/About";
import DoctorHome from "./pages/doctorHome";
import PatientHome from "./pages/patientHome";

import DoctorLayout from "./layouts/DoctorLayout";
import PatientLayout from "./layouts/PatientLayout";
import UpcomingAppointments from "./pages/UpcomingAppointments";
import PatientDashboard from "./components/patientDashboard";
import ScheduledAppointment from "./pages/scheduledAppointments";
import PatientHistory from "./pages/PatientHistory";
import { useState, useEffect } from "react";


const AppRoutes = () => {
  const role = localStorage.getItem("role"); // "doctor" or "patient"

  return (
    <Routes>
      {/* Redirect root based on role */}
      <Route
        path="/"
        element={
          role === "doctor" ? (
            <Navigate to="/doctor/home" replace />
          ) : role === "patient" ? (
            <Navigate to="/patient/home" replace />
          ) : (
            <LandingPage />
          )
        }
      />

      {/* Doctor routes with DoctorLayout */}
      <Route path="/doctor" element={<DoctorLayout />}>
        <Route path="home" element={<DoctorHome />} />
        <Route path="profile" element={<DoctorProfile doctorId="doctor123" />} />
        <Route path="scheduled-appointments" element={<ScheduledAppointment />}/>  
        <Route path="/doctor/patienthistory/:id" element={<PatientHistory />} />
       
        <Route path="set-availability" element={<ProfileSettings />} />

        

        <Route path="about" element={<About />} />
        <Route path="create-listing" element={<CreateListing />} />

      </Route>

      {/* Patient routes with PatientLayout */}
      <Route path="/patient" element={<PatientLayout />}>
        <Route path="home" element={<PatientHome />} />
        <Route path="appointments" element={<BookAppointment />} />
        <Route  path="post-history" element={<PatientDashboard />} />
        <Route path="about" element={<About />} />
         <Route path="appointments/upcoming" element={<UpcomingAppointments />} />

      </Route>

      {/* Auth and other routes without layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
  
      

      {/* Fallback: redirect unknown routes to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
