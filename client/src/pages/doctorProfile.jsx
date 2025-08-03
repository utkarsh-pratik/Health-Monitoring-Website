import React, { useState, useEffect } from "react";
import axios from "axios";

const DoctorProfile = ({ doctorId }) => {
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedDay, setSelectedDay] = useState("");
    const [selectedTime, setSelectedTime] = useState("");

    useEffect(() => {
        // Fetch doctor's current availability
        axios.get(`/api/doctors/${doctorId}`)
            .then(response => setAvailableSlots(response.data.availableSlots))
            .catch(error => console.error("Error fetching availability:", error));
    }, [doctorId]);

    const handleAddSlot = () => {
        if (!selectedDay || !selectedTime) return;
        const newSlots = [...availableSlots];
        const dayIndex = newSlots.findIndex(slot => slot.day === selectedDay);

        if (dayIndex >= 0) {
            newSlots[dayIndex].slots.push(selectedTime);
        } else {
            newSlots.push({ day: selectedDay, slots: [selectedTime] });
        }

        setAvailableSlots(newSlots);
    };

    const handleSave = () => {
        axios.post("/api/doctors/set-availability", { doctorId, availableSlots })
            .then(() => alert("Availability updated successfully"))
            .catch(error => console.error("Error updating availability:", error));
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Set Available Time</h2>
            
            <div className="flex gap-4 mb-4">
                <select onChange={e => setSelectedDay(e.target.value)}>
                    <option value="">Select Day</option>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                        <option key={day} value={day}>{day}</option>
                    ))}
                </select>
                <input type="time" onChange={e => setSelectedTime(e.target.value)} />
                <button onClick={handleAddSlot} className="bg-blue-500 text-white px-4 py-2 rounded">Add Slot</button>
            </div>

            <button onClick={handleSave} className="bg-green-500 text-white px-6 py-2 rounded">Save Availability</button>
        </div>
    );
};

export default DoctorProfile;
