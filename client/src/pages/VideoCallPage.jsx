import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoCall from '../components/VideoCall';

const VideoCallPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [callEnded, setCallEnded] = useState(false);

  const handleCallEnd = () => {
    setCallEnded(true);
    // Navigate back after a short delay
    setTimeout(() => {
      navigate('/upcoming-appointments');
    }, 2000);
  };

  if (callEnded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-white text-2xl mb-4">Call Ended</h2>
          <p className="text-gray-400 mb-4">Redirecting you back...</p>
          <button
            onClick={() => navigate('/upcoming-appointments')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Go Back Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <VideoCall 
      appointmentId={appointmentId} 
      onEnd={handleCallEnd}
    />
  );
};

export default VideoCallPage;
