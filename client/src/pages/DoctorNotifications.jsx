import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../api'; 

const socket = io(SOCKET_URL);

const DoctorNotifications = () => {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('doctorNotifications');
    return saved ? JSON.parse(saved) : [];
  });
  const navigate = useNavigate();

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('doctorNotifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Register doctor socket connection
    const doctorId = localStorage.getItem('doctorId');
    if (doctorId) {
      socket.emit('registerDoctor', doctorId);
    }

    // Listen for new appointments
    socket.on('newAppointment', (data) => {
      const newNotification = {
        id: Date.now(),
        type: 'appointment',
        patientName: data.patientName,
        appointmentTime: data.appointmentTime,
        reason: data.reason,
        time: new Date().toLocaleTimeString(),
        read: false
      };
      // Always read latest from localStorage
      const saved = localStorage.getItem('doctorNotifications');
      const current = saved ? JSON.parse(saved) : [];
      const updated = [newNotification, ...current];
      setNotifications(updated);
      localStorage.setItem('doctorNotifications', JSON.stringify(updated));

      // Show browser notification if permission granted
      if (Notification.permission === "granted") {
        new Notification("New Appointment Request", {
          body: `${data.patientName} has requested an appointment`,
          icon: ""
        });
      }
    });

    // Listen for payment notifications
    socket.on('paymentReceived', (data) => {
      const newNotification = {
        id: Date.now(),
        type: 'payment',
        patientName: data.patientName,
        amount: data.amount,
        paymentId: data.paymentId,
        appointmentId: data.appointmentId,
        time: new Date().toLocaleTimeString(),
        read: false
      };
      // Always read latest from localStorage
      const saved = localStorage.getItem('doctorNotifications');
      const current = saved ? JSON.parse(saved) : [];
      const updated = [newNotification, ...current];
      setNotifications(updated);
      localStorage.setItem('doctorNotifications', JSON.stringify(updated));

      // Show browser notification if permission granted
      if (Notification.permission === "granted") {
        new Notification("Payment Received", {
          body: `Payment of ₹${data.amount} received from ${data.patientName}`,
          icon: ""
        });
      }
    });

    return () => {
      socket.off('newAppointment');
      socket.off('paymentReceived');
    };
  }, []);

  const handleNotificationClick = (notification) => {
    // Mark as read
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    navigate('/doctor/scheduled-appointments');
  };

  const handleRemoveNotification = (e, notificationId) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-950 to-black py-16 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Notifications</h1>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition ${!notification.read ? 'bg-yellow-50' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    {notification.type === 'appointment' ? (
                      <>
                        <h3 className="font-semibold text-lg text-gray-800">
                          New Appointment Request
                        </h3>
                        <p className="text-gray-600 mt-1">
                          Patient: {notification.patientName}
                        </p>
                        <p className="text-gray-600">
                          Time: {new Date(notification.appointmentTime).toLocaleString()}
                        </p>
                        {notification.reason && (
                          <p className="text-gray-600 mt-1">
                            Reason: {notification.reason}
                          </p>
                        )}
                      </>
                    ) : notification.type === 'payment' ? (
                      <>
                        <h3 className="font-semibold text-lg text-green-800">
                          💰 Payment Received
                        </h3>
                        <p className="text-gray-600 mt-1">
                          Patient: {notification.patientName}
                        </p>
                        <p className="text-green-600 font-semibold">
                          Amount: ₹{notification.amount}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Payment ID: {notification.paymentId}
                        </p>
                      </>
                    ) : null}
                    <p className="text-sm text-gray-400 mt-2">
                      {notification.time}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleRemoveNotification(e, notification.id)}
                    className="text-gray-400 hover:text-red-500 transition"
                  >
                    ✖
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorNotifications;