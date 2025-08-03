import React, { useState, useEffect } from "react";

const daysOrder = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const ProfileSettings = () => {
  const [availableSlots, setAvailableSlots] = useState([{ day: "", start: "", end: "" }]);
  const [message, setMessage] = useState("");
  const [allSlots, setAllSlots] = useState([]);

  // Fetch all slots on mount
 
  useEffect(() => {
    const fetchAllSlots = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/doctors/my-profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setAllSlots(data.availability || []);
      } catch (err) {
        setMessage("Failed to load slots");
      }
    };
    fetchAllSlots();
  }, []);

  const handleAddSlot = () => {
    setAvailableSlots([...availableSlots, { day: "", start: "", end: "" }]);
  };

  const handleSlotChange = (index, field, value) => {
    const newSlots = [...availableSlots];
    newSlots[index][field] = value;
    setAvailableSlots(newSlots);
  };

  const handleDeleteSlot = (index) => {
    const newSlots = availableSlots.filter((_, i) => i !== index);
    setAvailableSlots(newSlots);
  };

  const handleDeleteSetSlot = async (day, start, end) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/doctors/delete-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ day, start, end }),
      });
      const respData = await response.json();
      setMessage(respData.message || "Slot deleted successfully");
    // Refresh all slots
    const res = await fetch("http://localhost:5000/api/doctors/my-profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setAllSlots(data.availability || []);
  } catch (error) {
    setMessage("Failed to delete slot. Please try again.");
  }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      // 1. Fetch current slots
      const res = await fetch("http://localhost:5000/api/doctors/my-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      let existing = [];
      if (data.availability) {
        data.availability.forEach(daySlot => {
          daySlot.slots.forEach(slot => {
            existing.push({ day: daySlot.day, start: slot.start, end: slot.end });
          });
        });
      }

      // 2. Merge new and existing slots, avoiding duplicates
      const allSlots = [...existing, ...availableSlots];
      const uniqueSlots = [];
      const seen = new Set();
      for (const slot of allSlots) {
        const key = `${slot.day}-${slot.start}-${slot.end}`;
        if (!seen.has(key)) {
          uniqueSlots.push(slot);
          seen.add(key);
        }
      }

      // 3. Group by day for backend format
      const grouped = {};
      uniqueSlots.forEach(({ day, start, end }) => {
        if (!day || !start || !end) return;
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push({ start, end });
      });
      const availability = Object.entries(grouped).map(([day, slots]) => ({ day, slots }));

      // 4. Save merged slots
      const response = await fetch("http://localhost:5000/api/doctors/set-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ availability }),
      });

      const respData = await response.json();
      setMessage(respData.message || "Slots saved successfully");
    } catch (error) {
      setMessage("Failed to save slots. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-blue-900 p-10 text-white">
      <h1 className="text-2xl font-bold mb-6">Set Your Available Time Slots</h1>

      {/* Show upcoming slots */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2 text-yellow-300">Your Upcoming Slots</h2>
        {allSlots.length === 0 ? (
          <p className="text-gray-300">No slots set.</p>
        ) : (
          <ul>
            {allSlots
              .slice()
              .sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day))
              .map(daySlot => (
                <li key={daySlot.day} className="mb-2">
                  <span className="font-bold">{daySlot.day}:</span>{" "}
                  {daySlot.slots
                    .slice()
                    .sort((a, b) => a.start.localeCompare(b.start))
                    .map((slot, idx) => (
                      <span key={idx} className="inline-flex items-center bg-blue-900 text-white px-2 py-1 rounded mr-2">
                        {slot.start} - {slot.end}
                        <button
                          onClick={() => handleDeleteSetSlot(daySlot.day, slot.start, slot.end)}
                          className="ml-2 p-1 rounded hover:bg-white/10 transition"
                          title="Delete Slot"
                          type="button"
                          style={{ background: "transparent" }}
                        >
                          {/* White trash icon SVG */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="white"
                            strokeWidth={2}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m2 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7h12z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6m4-6v6" />
                          </svg>
                        </button>
                      </span>
                    ))}
                </li>
              ))}
          </ul>
        )}
      </div>

      {availableSlots.map((slot, index) => (
        <div key={index} className="flex space-x-4 mb-3 items-center">
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
          <button
            onClick={() => handleDeleteSlot(index)}
            className="bg-red-600 hover:bg-red-800 text-white px-2 py-1 rounded"
            title="Delete Slot"
            type="button"
          >
            ✕
          </button>
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
