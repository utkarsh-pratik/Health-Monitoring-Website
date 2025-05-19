import React, { useState, useEffect } from "react";
import axios from "axios";

const questions = [
  "Do you have any allergies?",
  "Are you currently taking any medications (if any, write below)?",
  "Do you have any chronic illnesses?",
  "Have you had any surgeries before?"
];

const PatientDashboard = () => {
  const [answers, setAnswers] = useState({});
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [input, setInput] = useState("");
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timeout = setTimeout(() => setAnimate(false), 500);
    return () => clearTimeout(timeout);
  }, [currentQIndex]);

  const handleAnswer = () => {
    if (input.trim() === "") return;

    setAnswers(prev => ({
      ...prev,
      [questions[currentQIndex]]: input.trim()
    }));

    setInput("");

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      saveMedicalHistory();
    }
  };

  
const saveMedicalHistory = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post("/api/patient/post-history",
      { answers },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    alert("Medical history saved! Thank you.");
    setCurrentQIndex(0);
    setAnswers({});
  } catch (err) {
    console.error("Error saving medical history:", err);
    alert("An error occurred while saving your data.");
  }
};

  const progressPercent = ((currentQIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-md mx-auto mt-32 p-8 bg-gradient-to-br from-purple-200 via-pink-300 to-red-200 rounded-3xl shadow-2xl dark:from-gray-800 dark:via-gray-900 dark:to-black">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-purple-800 dark:text-pink-400 drop-shadow-md">
        Medical History Chatbot
      </h2>

      <div className="w-full bg-purple-200 dark:bg-pink-900 rounded-full h-2 mb-6 overflow-hidden shadow-inner">
        <div
          className="bg-purple-600 dark:bg-pink-500 h-2 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div
        className={`relative mb-8 px-6 py-5 rounded-3xl max-w-full mx-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg transition-transform duration-500 ease-out ${
          animate ? "scale-105 opacity-100" : "scale-95 opacity-70"
        }`}
        style={{ willChange: "transform, opacity" }}
      >
        <p className="text-xl font-semibold">{questions[currentQIndex]}</p>
        <div className="absolute -bottom-6 left-10 w-6 h-6 bg-white dark:bg-gray-800 rotate-45 shadow-md"></div>
      </div>

      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleAnswer()}
        placeholder="Type your answer..."
        className="w-full rounded-xl border border-purple-300 dark:border-pink-600 px-4 py-3 text-lg focus:outline-none focus:ring-4 focus:ring-purple-400 dark:focus:ring-pink-500 transition duration-300 shadow-md"
        autoFocus
      />

      <div className="flex justify-between mt-8">
        <button
          onClick={() => {
            setCurrentQIndex(0);
            setAnswers({});
            setInput("");
          }}
          className="text-purple-700 dark:text-pink-400 hover:text-purple-900 dark:hover:text-pink-600 font-semibold transition"
          aria-label="Reset answers"
        >
          Reset
        </button>

        <button
          onClick={handleAnswer}
          className="bg-purple-700 dark:bg-pink-500 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-purple-800 dark:hover:bg-pink-600 transition-all duration-300 font-bold select-none"
          aria-label={currentQIndex < questions.length - 1 ? "Next question" : "Submit answers"}
        >
          {currentQIndex < questions.length - 1 ? "Next" : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default PatientDashboard;
