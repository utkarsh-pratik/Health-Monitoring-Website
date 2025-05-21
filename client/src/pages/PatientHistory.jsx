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
  const [isEditing, setIsEditing] = useState(false); // Toggle for edit form visibility
  const [newHistory, setNewHistory] = useState(''); // State for new history input

  // Fetch the patient history from the server
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
      setError(err.response?.data?.message || 'Failed to fetch patient history.');
    } finally {
      setLoading(false);
    }
  };

  // Handle saving the new or updated history
  const handleSaveHistory = async (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!newHistory.trim()) {
      alert('Please provide your medical history');
      return;
    }

    setLoading(true); // Indicate that we're saving the data

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:5000/api/doctors/patient-history/${id}`,
        { history: newHistory }, // Send the new history
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHistory(res.data.history); // Update the history state with the newly saved data
      setNewHistory(''); // Reset the form input
      setIsEditing(false); // Close the form after saving
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save medical history.');
    } finally {
      setLoading(false);
    }
  };

  // Load patient history when the component is mounted
  useEffect(() => {
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
          <>
            {/* If no history exists, show a form to input the history */}
            <p className="text-center text-gray-600 italic text-lg mt-10">
              No medical history found. Please provide your medical history below.
            </p>

            {isEditing ? (
              <div className="mt-8">
                <form onSubmit={handleSaveHistory}>
                  <textarea
                    value={newHistory}
                    onChange={(e) => setNewHistory(e.target.value)}
                    className="w-full h-40 p-4 border rounded-lg text-lg"
                    placeholder="Enter your medical history..."
                    required
                  />
                  <div className="mt-4 text-center">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all duration-300"
                    >
                      Save History
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setIsEditing(true)} // Show form when clicked
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all duration-300"
                >
                  Add Your Medical History
                </button>
              </div>
            )}
          </>
        ) : (
          <>
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
                  <p className="text-gray-800 px-2 text-base leading-relaxed whitespace-pre-wrap">
                    A: {item.answer}
                  </p>
                  <p className="mt-5 text-sm text-indigo-400 italic tracking-wide">
                    {moment(item.createdAt).format('MMMM Do YYYY, h:mm A')}
                  </p>
                </li>
              ))}
            </ul>

            {/* Display the Update Button when there is history */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setIsEditing(true)} // Show form to update history
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all duration-300"
              >
                Update History
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
