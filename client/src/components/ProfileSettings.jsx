import React, { useState } from 'react';

const ProfileSettings = () => {
    const [showTimeSlotForm, setShowTimeSlotForm] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);

    const handleAddSlot = () => {
        setAvailableSlots([...availableSlots, { day: '', start: '', end: '' }]);
    };

    const handleSlotChange = (index, field, value) => {
        const newSlots = [...availableSlots];
        newSlots[index][field] = value;
        setAvailableSlots(newSlots);
    };

    const handleSave = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/doctors/set-availability", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}` // If authentication is needed
                },
                body: JSON.stringify({ slots: availableSlots }),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log("Saved Slots:", data);
        } catch (error) {
            console.error("Error saving time slots:", error);
        }
    };
    

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-black to-blue-900 p-10 text-white">
            <h1 className="text-2xl font-bold mb-6">Profile & Settings</h1>

            {/* Button to Show Time Slot Form */}
            {!showTimeSlotForm ? (
                <button 
                    onClick={() => setShowTimeSlotForm(true)} 
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg"
                >
                    Set Available Time
                </button>
            ) : (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Set Your Available Time Slots</h2>
                    
                    {availableSlots.map((slot, index) => (
                        <div key={index} className="flex space-x-4 mb-3">
                            <select 
                                value={slot.day}
                                onChange={(e) => handleSlotChange(index, 'day', e.target.value)}
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
                                onChange={(e) => handleSlotChange(index, 'start', e.target.value)}
                                className="p-2 bg-blue-800 text-white rounded-md"
                            />
                            <input 
                                type="time" 
                                value={slot.end} 
                                onChange={(e) => handleSlotChange(index, 'end', e.target.value)}
                                className="p-2 bg-blue-800 text-white rounded-md"
                            />
                        </div>
                    ))}

                    <button onClick={handleAddSlot} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
                        Add Time Slot
                    </button>

                    <button onClick={handleSave} className="mt-4 ml-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md">
                        Save Slots
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfileSettings;
