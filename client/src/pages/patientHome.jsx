import React from "react";

const PatientHome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-indigo-900 to-black text-white px-6 py-12 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full text-center space-y-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-pink-400 drop-shadow-lg">
          Welcome to HealthCard, Your Gateway to Better Health 🩺
        </h1>

        <p className="text-lg md:text-xl text-purple-200 leading-relaxed">
          HealthCard helps you find and connect with trusted doctors in your area. Book appointments, check reviews, and manage your health — all in one place.
        </p>
      </div>
    </div>
  );
};

export default PatientHome;
