import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api';

export default function Analyze() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState("");
  const [showBotMessage, setShowBotMessage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (result === "Low" || result === "Mild") {
      setShowBotMessage(true);
      const timeout = setTimeout(() => {
        const iframe = document.querySelector('iframe[src*="chatling.ai"]');
        if (iframe) {
          iframe.style.animation = "pulseScale 2.5s ease-in-out infinite";
          iframe.style.transformOrigin = "center";
        }
      }, 1000);
      return () => {
        clearTimeout(timeout);
        const iframe = document.querySelector('iframe[src*="chatling.ai"]');
        if (iframe) {
          iframe.style.animation = "";
        }
      };
    } else {
      setShowBotMessage(false);
      const iframe = document.querySelector('iframe[src*="chatling.ai"]');
      if (iframe) {
        iframe.style.animation = "";
      }
    }
  }, [result]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setShowBotMessage(false);

    const formData = new FormData(e.target);

    try {
      const res = await api.post("/api/patient/analyze-report", formData);
      // wraps the response in a `data` object
      const data = res.data; 
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data.severity);
    } catch (err) {
      // FIX: Provide a clearer message for the 503 Service Unavailable error.
      if (err.response?.status === 503) {
        setError("This feature is currently under maintenance. Please try again later.");
      } else {
        setError(err.response?.data?.error || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Maximum size is 5MB.");
      e.target.value = null;
      setFileName("");
      return;
    }

    if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
      alert("Unsupported file type. Upload PDF or image (JPG, PNG).");
      e.target.value = null;
      setFileName("");
      return;
    }

    setFileName(file.name);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #2e0854 0%, #000000 50%, #3b0a70 100%)",
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        position: "relative",
      }}
    >
      <form
        onSubmit={handleUpload}
        className="relative bg-black bg-opacity-50 backdrop-blur-lg border border-purple-700 rounded-2xl p-10 shadow-2xl text-center text-gray-200 z-10 max-w-lg w-full"
      >
        <h2 style={{ marginBottom: "25px", fontWeight: "700", fontSize: "28px", color: "#d7caff" }}>
          Upload Your Medical Report
        </h2>

        <input
          type="file"
          name="report"
          accept=".pdf,.jpeg,.jpg,.png"
          required
          onChange={handleFileChange}
          style={{
            marginBottom: "15px",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            cursor: "pointer",
            borderRadius: "8px",
            border: "2px dashed #7b5fc5",
            padding: "20px",
            width: "100%",
            fontSize: "16px",
            color: "#c1b6e8",
            backgroundColor: "#2f2257",
            transition: "border-color 0.3s ease, background-color 0.3s ease",
          }}
        />

        {fileName && (
          <p style={{ color: "#c1b6e8", marginBottom: "20px", fontSize: "14px" }}>
            Selected File: {fileName}
          </p>
        )}

        {result === "Severe" && (
          <p style={{ color: "#ff4d4d", fontWeight: "700", fontSize: "20px", marginBottom: "20px" }}>
            Severity status : Severe
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: loading ? "#a38be0" : "#7b5fc5",
            color: "white",
            border: "none",
            padding: "14px 0",
            borderRadius: "10px",
            cursor: loading ? "not-allowed" : "pointer",
            width: "100%",
            fontWeight: "700",
            fontSize: "18px",
            transition: "background-color 0.3s ease",
            marginTop: result === "Severe" ? "0px" : "20px",
          }}
          onMouseEnter={(e) =>
            !loading && (e.currentTarget.style.backgroundColor = "#593ba8")
          }
          onMouseLeave={(e) =>
            !loading && (e.currentTarget.style.backgroundColor = "#7b5fc5")
          }
        >
          {loading ? "Analyzing..." : "Analyze Report"}
        </button>

        {result && result !== "Severe" && (
          <p
            style={{
              marginTop: "25px",
              fontWeight: "700",
              color: result === "High" ? "#ff4d4d" : "#81d882",
              fontSize: "20px",
              userSelect: "text",
            }}
          >
            Severity Status : {result}
          </p>
        )}

        {(result === "High" || result === "Severe") && (
          <button
            type="button"
            onClick={() => navigate("/patient/appointments")}
            style={{
              marginTop: "15px",
              backgroundColor: "red", // purple
              color: "white",
              border: "none",
              padding: "12px 0",
              borderRadius: "10px",
              cursor: "pointer",
              width: "100%",
              fontWeight: "700",
              fontSize: "18px",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#593ba8")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#7b5fc5")}
          >
            Consult a Doctor
          </button>
        )}

        {error && (
          <p style={{ color: "#ff6f6f", marginTop: "20px", fontWeight: "700", fontSize: "15px" }}>
            Error: {error}
          </p>
        )}
      </form>

      {showBotMessage && (
        <div
          id="bot-message"
          style={{
            position: "fixed",
            bottom: "100px",
            right: "20px",
            background: "rgba(255, 255, 255, 0.9)",
            padding: "14px 28px",
            borderRadius: "24px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            border: "2px solid #a38be0",
            fontWeight: "600",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            color: "#4a148c",
            zIndex: 9999,
            textAlign: "center",
            animation: "boxPulse 3s ease-in-out infinite",
            maxWidth: "280px",
            fontSize: "18px",
          }}
        >
          Solve health queries with our bot
        </div>
      )}

      <style>{`
        @keyframes pulseScale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes boxPulse {
          0%, 100% {
            transform: scale(1);
            border-color: #a38be0;
            box-shadow: 0 2px 12px rgba(0,0,0,0.15);
          }
          50% {
            transform: scale(1.05);
            border-color: #7b5fc5;
            box-shadow: 0 4px 20px rgba(163, 139, 224, 0.6);
          }
        }
      `}</style>
    </div>
  );
}
