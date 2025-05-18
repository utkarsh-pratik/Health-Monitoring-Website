import React, { useState } from "react";

const ProfileSettings = () => {
  const [availableSlots, setAvailableSlots] = useState([
    { day: "", start: "", end: "" },
  ]);
  const [message, setMessage] = useState("");

  const handleAddSlot = () => {
    setAvailableSlots([...availableSlots, { day: "", start: "", end: "" }]);
  };

  const handleSlotChange = (index, field, value) => {
    const newSlots = [...availableSlots];
    newSlots[index][field] = value;
    setAvailableSlots(newSlots);
  };

  const convertToGroupedAvailability = (slots) => {
    const grouped = {};

    slots.forEach(({ day, start, end }) => {
      if (!day || !start || !end) return; // skip incomplete
      if (!grouped[day]) {
        grouped[day] = [];
      }
      grouped[day].push({ start, end });
    });

    return Object.entries(grouped).map(([day, slots]) => ({ day, slots }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("You must be logged in.");
        return;
      }

      const availability = convertToGroupedAvailability(availableSlots);

      const response = await fetch("http://localhost:5000/api/doctors/set-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ availability }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Saved Slots:", data);
      setMessage(data.message || "Slots saved successfully");
    } catch (error) {
      console.error("Error saving time slots:", error);
      setMessage("Failed to save slots. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-blue-900 p-10 text-white">
      <h1 className="text-2xl font-bold mb-6">Set Your Available Time Slots</h1>

      {availableSlots.map((slot, index) => (
        <div key={index} className="flex space-x-4 mb-3">
          <select
            value={slot.day}
            onChange={(e) => handleSlotChange(index, "day", e.target.value)}
            className="p-2 bg-blue-800 text-white rounded-md"
          >
            <option value="">Select Day</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
          </select>
          <input
            type="time"
            value={slot.start}
            onChange={(e) => handleSlotChange(index, "start", e.target.value)}
            className="p-2 bg-blue-800 text-white rounded-md"
          />
          <input
            type="time"
            value={slot.end}
            onChange={(e) => handleSlotChange(index, "end", e.target.value)}
            className="p-2 bg-blue-800 text-white rounded-md"
          />
        </div>
      ))}

      <button
        onClick={handleAddSlot}
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
      >
        Add Time Slot
      </button>

      <button
        onClick={handleSave}
        className="mt-4 ml-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
      >
        Save Slots
      </button>

      {message && <p className="mt-4 text-yellow-300">{message}</p>}
    </div>
  );
};

export default ProfileSettings;
