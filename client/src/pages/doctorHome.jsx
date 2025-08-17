import React from 'react';
import { FaUserMd, FaCalendarAlt, FaClipboardList, FaHistory } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import HomeImage from '../assets/image.png'; // Placeholder for the image

const DoctorHome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-purple-700 to-blue-600 text-white font-sans">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-between px-10 py-20">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Welcome Back, Doctor!
          </h1>
          <p className="text-lg text-indigo-100">
            Stay updated with your appointments, review patient history, and manage your day efficiently. This is your medical command center.
          </p>
          <Link
            to="/doctor/scheduled-appointments"
            className="mt-6 inline-block bg-white text-indigo-700 font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-gray-100 transition duration-300"
          >
            View Appointments
          </Link>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img
            src={HomeImage}
            alt="Doctor"
            className="w-100 h-auto rounded-xl shadow-2xl"
          />
        </div>
      </div>

      {/* Dashboard Features */}
      <div className="bg-white rounded-t-3xl px-8 py-12 text-gray-800">
        <h2 className="text-3xl font-bold text-center mb-10">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <FeatureCard
            icon={<FaCalendarAlt size={32} />}
            title="Appointments"
            desc="View and manage all your upcoming appointments in one place."
            link="/doctor/scheduled-appointments"
          />
          <FeatureCard
            icon={<FaClipboardList size={32} />}
            title="Patient Records"
            desc="Access detailed medical histories and past diagnoses."
            link="/doctor/patientrecords"
          />
          <FeatureCard
            icon={<FaUserMd size={32} />}
            title="Profile"
            desc="Edit your profile, availability, and personal settings."
            link="/doctor/create-listing" 
          />
          <FeatureCard
            icon={<FaHistory size={32} />}
            title="History"
            desc="Track completed appointments and case follow-ups."
            link="/doctor/history"
          />
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, link }) => (
  <Link
    to={link}
    className="p-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
  >
    <div className="text-indigo-600 mb-3">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-sm text-gray-700">{desc}</p>
  </Link>
);

export default DoctorHome;
