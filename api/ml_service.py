# api/ml_service.py

import os
import sys
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from ml.model_predictor import extract_text, clean_ocr_text, extract_fields

# --- Flask App Initialization ---
app = Flask(__name__)

# --- Load Models ---
# Construct absolute paths to model files to ensure they are found in production
base_dir = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(base_dir, 'rf_model.joblib')
LABEL_ENCODER_PATH = os.path.join(base_dir, 'label_encoder.joblib')

try:
    model = joblib.load(MODEL_PATH)
    le = joblib.load(LABEL_ENCODER_PATH)
    # Print to stderr for Render logs
    print("✅ ML Model and Label Encoder loaded successfully.", file=sys.stderr)
except Exception as e:
    print(f"❌ CRITICAL ERROR: Could not load ML models. {e}", file=sys.stderr)
    model = None
    le = None

# --- API Endpoint for Analysis ---
@app.route('/analyze', methods=['POST'])
def analyze_report():
    if model is None or le is None:
        return jsonify({"error": "ML model is not available due to a server error"}), 503

    if 'report' not in request.files:
        return jsonify({"error": "No report file provided in the request"}), 400

    file = request.files['report']
    
    # Use a temporary directory for file operations
    temp_path = os.path.join("/tmp", file.filename)
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
        # Clean up the temporary file to save disk space
        if os.path.exists(temp_path):
            os.remove(temp_path)

# --- Health Check Endpoint for Render ---
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    # This part is for local testing; Gunicorn will be used in production
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5001)))
    