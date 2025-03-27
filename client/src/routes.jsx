import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import Header1 from "./pages/header1";
import Header2 from "./pages/header2";
import LandingPage from "./pages/LandingPage";
import DoctorProfile from "./pages/doctorProfile";
import ProfileSettings from './components/ProfileSettings';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/header1" element={<Header1 />} />
            <Route path="/header2" element={<Header2 />} />
            <Route path="/doctor/profile" element={<DoctorProfile doctorId="doctor123" />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
        </Routes> 
    );
};

export default AppRoutes;
