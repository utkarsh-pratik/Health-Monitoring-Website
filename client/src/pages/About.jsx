import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const homePath = role === 'doctor' ? '/doctor/home' : '/patient/home';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white p-10 flex items-center justify-center">
      <div className="max-w-5xl w-full bg-white/10 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-white/20">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-pink-400 mb-8 tracking-wide">
          About Our Doctor’s Portal
        </h1>

        <p className="text-lg text-purple-100 leading-relaxed mb-6">
          At <span className="font-bold text-pink-400">HealthCard</span>, we believe that access to quality healthcare begins with <span className="text-white font-medium">trusted information and real connections</span>. Our Doctor’s Portal is designed to bridge the gap between <span className="font-medium text-white">healthcare professionals</span> and the communities they serve.
        </p>

        <h2 className="text-2xl text-pink-300 font-semibold mt-6 mb-2">🌟 Our Mission</h2>
        <p className="text-purple-100 mb-6">
          To empower patients with transparent access to experienced, verified, and compassionate healthcare providers — and to support doctors in building a stronger, digitally connected practice.
        </p>

        <h2 className="text-2xl text-pink-300 font-semibold mt-6 mb-2">👨‍⚕️ For Doctors</h2>
        <ul className="list-disc list-inside text-purple-100 space-y-2 mb-6">
          <li>Showcase your expertise, qualifications, and patient philosophy.</li>
          <li>Get discovered by patients looking for specific healthcare needs.</li>
          <li>Manage and update your professional profile with ease.</li>
          <li>Strengthen your online presence with trusted reviews and insights.</li>
        </ul>

        <h2 className="text-2xl text-pink-300 font-semibold mt-6 mb-2">💡 Why Join HealthCard?</h2>
        <ul className="grid md:grid-cols-2 gap-4 text-purple-100 mb-6">
          <li>🔍 <span className="font-semibold text-white">Enhanced Visibility</span> – Be part of a curated network searched by thousands.</li>
          <li>📢 <span className="font-semibold text-white">Professional Branding</span> – Highlight your services with rich profiles.</li>
          <li>🔐 <span className="font-semibold text-white">Verified & Secure</span> – We prioritize trust and data integrity.</li>
          <li>⚙️ <span className="font-semibold text-white">Simple Management</span> – Edit, update, and enhance your listing anytime.</li>
        </ul>

        <h2 className="text-2xl text-pink-300 font-semibold mt-6 mb-4">🤝 Building Trust. Saving Time. Supporting Health.</h2>
        <p className="text-purple-100 mb-10">
          With <span className="font-bold text-pink-400">HealthCard</span>, patients make informed decisions, and doctors grow with digital tools that <span className="text-white font-medium">put care at the center</span>. Our platform is more than a directory — it’s a community committed to better healthcare access and excellence in service.
        </p>

        {/* Back to Home Button */}
        <div className="flex justify-center">
          <Link
            to={homePath}
            className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition transform hover:scale-105"
          >
            ⬅️ Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
