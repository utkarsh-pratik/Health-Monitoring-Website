import React, { useState, useEffect, useRef } from 'react';
import { connect, createLocalVideoTrack } from 'twilio-video';
import axios from 'axios';

const VideoCall = ({ appointmentId, onEnd }) => {
  const [room, setRoom] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [remoteParticipants, setRemoteParticipants] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    joinRoom();
    
    return () => {
      if (room) {
        room.disconnect();
      }
      if (localVideoTrack) {
        localVideoTrack.stop();
      }
    };
  }, [appointmentId]);

  const joinRoom = async () => {
    try {
      setLoading(true);
      setError('');

      // Get room details
      const token = localStorage.getItem('token');
      const appointmentResponse = await axios.get(
        `http://localhost:5000/api/video-call/appointment/${appointmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { roomName, userName } = appointmentResponse.data;

      // Get Twilio token
      const tokenResponse = await axios.post(
        'http://localhost:5000/api/video-call/get-twilio-token',
        { roomName, userName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const twilioToken = tokenResponse.data.token;

      // Create local video track
      const videoTrack = await createLocalVideoTrack({
        width: 640,
        height: 480,
      });
      setLocalVideoTrack(videoTrack);

      // Attach local video to DOM
      if (localVideoRef.current) {
        videoTrack.attach(localVideoRef.current);
      }

      // Connect to room
      const connectedRoom = await connect(twilioToken, {
        name: roomName,
        tracks: [videoTrack],
        video: true,
        audio: true,
      });

      setRoom(connectedRoom);
      setConnected(true);
      setLoading(false);

      // Handle existing participants
      connectedRoom.participants.forEach(participantConnected);

      // Handle new participants
      connectedRoom.on('participantConnected', participantConnected);
      connectedRoom.on('participantDisconnected', participantDisconnected);

    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join video call: ' + err.message);
      setLoading(false);
    }
  };

  const participantConnected = (participant) => {
    console.log('Participant connected:', participant.identity);
    
    setRemoteParticipants(prev => new Map(prev.set(participant.sid, participant)));

    participant.tracks.forEach(publication => {
      if (publication.isSubscribed) {
        trackSubscribed(publication.track);
      }
    });

    participant.on('trackSubscribed', trackSubscribed);
    participant.on('trackUnsubscribed', trackUnsubscribed);
  };

  const participantDisconnected = (participant) => {
    console.log('Participant disconnected:', participant.identity);
    setRemoteParticipants(prev => {
      const newMap = new Map(prev);
      newMap.delete(participant.sid);
      return newMap;
    });
  };

  const trackSubscribed = (track) => {
    if (track.kind === 'video' && remoteVideoRef.current) {
      track.attach(remoteVideoRef.current);
    }
  };

  const trackUnsubscribed = (track) => {
    track.detach();
  };

  const endCall = () => {
    if (room) {
      room.disconnect();
      setRoom(null);
    }
    if (localVideoTrack) {
      localVideoTrack.stop();
      setLocalVideoTrack(null);
    }
    setConnected(false);
    if (onEnd) onEnd();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Joining video call...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-xl mb-4">Unable to join video call</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Video Consultation</h1>
        <div className="flex items-center gap-4">
          <span className={`flex items-center gap-2 ${connected ? 'text-green-400' : 'text-red-400'}`}>
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
          <button
            onClick={endCall}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <span>📞</span>
            End Call
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative">
        {/* Remote Video (Main) */}
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          {remoteParticipants.size > 0 ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">👨‍⚕️</div>
              <p className="text-xl">Waiting for other participant...</p>
            </div>
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-64 h-48 bg-gray-700 rounded-lg overflow-hidden shadow-lg border-2 border-gray-600">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
            You
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex justify-center gap-4">
        <button
          onClick={() => {
            if (localVideoTrack) {
              if (localVideoTrack.isEnabled) {
                localVideoTrack.disable();
              } else {
                localVideoTrack.enable();
              }
            }
          }}
          className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full"
        >
          📹
        </button>
        <button
          onClick={() => {
            // Toggle audio (you'd need to track audio track similarly)
          }}
          className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full"
        >
          🎤
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
