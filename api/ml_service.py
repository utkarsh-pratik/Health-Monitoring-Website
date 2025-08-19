# api/ml_service.py

import os
import sys
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
# FIX: Use an absolute import path from the project root
from api.ml.model_predictor import extract_text, clean_ocr_text, extract_fields

# --- Flask App Initialization ---
app = Flask(__name__)

# --- Load Models ---
# Construct absolute paths to model files relative to this script
base_dir = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(base_dir, 'rf_model.joblib')
LABEL_ENCODER_PATH = os.path.join(base_dir, 'label_encoder.joblib')

try:
    model = joblib.load(MODEL_PATH)
    le = joblib.load(LABEL_ENCODER_PATH)
    print("✅ ML Model and Label Encoder loaded successfully.", file=sys.stderr)
except Exception as e:
    print(f"❌ CRITICAL ERROR: Could not load ML models. {e}", file=sys.stderr)
    model = None
    le = None

# --- API Endpoint for Analysis ---
@app.route('/analyze', methods=['POST'])
def analyze_report():
    if model is None or le is None:
        return jsonify({"error": "ML model is not available"}), 503

    if 'report' not in request.files:
        return jsonify({"error": "No report file provided"}), 400

    file = request.files['report']
    filename = secure_filename(file.filename)
    
    # Use a temporary directory for uploads
    temp_dir = "/tmp"
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)
    temp_path = os.path.join(temp_dir, filename)
    file.save(temp_path)

    try:
        # --- Run your existing ML logic ---
        text = extract_text(temp_path)
        text = clean_ocr_text(text)
        input_vals = extract_fields(text, model.feature_names_in_)

        if None in input_vals:
            return jsonify({
                "error": "Could not extract all required fields from the report.",
                "fields": dict(zip(model.feature_names_in_, input_vals))
            }), 400

        input_df = pd.DataFrame([input_vals], columns=model.feature_names_in_)
        prediction = model.predict(input_df)[0]
        severity = le.inverse_transform([prediction])[0]
        
        return jsonify({"severity": severity})

    except Exception as e:
        print(f"Analysis Error: {e}", file=sys.stderr)
        return jsonify({"error": f"An error occurred during analysis: {str(e)}"}), 500
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)

# --- Health Check Endpoint ---
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    # Gunicorn will be used in production
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5001)))

