// frontend/src/pages/PatientHistory.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { FaArrowLeft, FaNotesMedical } from 'react-icons/fa';

export default function PatientHistory() {
  const { id } = useParams(); // patient ID from URL
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `http://localhost:5000/api/doctors/patient-history/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setHistory(res.data.history);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to fetch patient history.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [id]);

  return (
    <div className="min-h-screen p-10 bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900">
      <div className="max-w-4xl mx-auto bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-2xl ring-1 ring-indigo-400 p-10">
        <button
          className="mb-8 flex items-center gap-3 text-indigo-700 hover:text-indigo-900 transition-colors duration-300 font-semibold"
          onClick={() => navigate(-1)}
          aria-label="Back to Appointments"
        >
          <FaArrowLeft className="text-lg" />
          Back to Appointments
        </button>

        <h1 className="text-4xl font-extrabold mb-6 flex items-center gap-4 text-indigo-900 drop-shadow-md">
          <FaNotesMedical className="text-indigo-600 text-3xl" />
          Patient Medical History
        </h1>

        {loading ? (
          <p className="text-center text-indigo-700 font-medium text-lg animate-pulse">
            Loading patient history...
          </p>
        ) : error ? (
          <div className="text-red-700 bg-red-100 border border-red-300 p-5 rounded-lg shadow-md font-semibold text-center">
            {error}
          </div>
        ) : history.length === 0 ? (
          <p className="text-center text-gray-600 italic text-lg mt-10">
            No medical history found.
          </p>
        ) : (
          <ul className="space-y-8">
            {history.map((item, index) => (
              <li
                key={index}
                className="relative bg-white border border-indigo-300 rounded-2xl p-10 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-default overflow-visible"
              >
                <div className="absolute top-0  left-0  bg-indigo-700 text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-xl shadow-lg select-none">
                  Q{index + 1}
                </div>
                <p className="text-lg px-2 font-semibold text-indigo-900 mb-4">
                  Q: {item.question}
                </p>
                <p className="text-gray-800 px-2  text-base leading-relaxed whitespace-pre-wrap">
                  A: {item.answer}
                </p>
                <p className="mt-5 text-sm text-indigo-400 italic tracking-wide">
                  {moment(item.createdAt).format('MMMM Do YYYY, h:mm A')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
