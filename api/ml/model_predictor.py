# api/ml/model_predictor.py

import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import pytesseract
from pdf2image import convert_from_path
from PIL import Image, UnidentifiedImageError
import sys
import json
import os
import re
import io
import mimetypes
import traceback
from pdfminer.high_level import extract_text as pdf_extract_text

# Ensure proper stdout encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Get the directory where the script is located
script_dir = os.path.dirname(os.path.abspath(__file__))

# Use relative paths to load model files.
MODEL_PATH = os.path.join(script_dir, '..', 'rf_model.joblib')
LABEL_ENCODER_PATH = os.path.join(script_dir, '..', 'label_encoder.joblib')

def extract_text(path):
    """Extracts text from a given file path (PDF or image)."""
    file_type, _ = mimetypes.guess_type(path)
    text = ""
    try:
        if file_type == 'application/pdf':
            text = pdf_extract_text(path)
        elif file_type and file_type.startswith('image/'):
            text = pytesseract.image_to_string(Image.open(path))
        else:
            # Fallback for unidentified files, try opening as image
            text = pytesseract.image_to_string(Image.open(path))
    except (UnidentifiedImageError, pytesseract.TesseractError, Exception) as e:
        print(f"Error processing file {path}: {e}", file=sys.stderr)
        return None
    return text

def clean_ocr_text(text):
    """
    Cleans and normalizes text extracted from OCR.
    This function is crucial for improving regex matching accuracy.
    """
    # FIX: Expanded dictionary of common OCR errors and unit variations
    replacements = {
        # Terminology variations
        r"\bHaemoglobin\b": "Hemoglobin",
        r"\bPlatelets\b": "Platelet Count",
        r"\bPCV\b": "Hematocrit",
        r"\bPacked Cell Volume\b": "Hematocrit",
        # General unit fixes and common OCR mistakes for units
        r"g/d[lL1I]": "g/dL",
        r"g/[dD]L": "g/dL",
        r"f[lL1I]": "fL",
        r"p[gq]": "pg",
        r"cells\s*/\s*[pPyYμµuU]?[lL1I]": "cells/µL",
        r"million\s*/\s*[pPyYμµuU]?[lL1I]": "million/µL",
        # Normalize spacing around parentheses
        r"\s*\(\s*": " (",
        r"\s*\)\s*": ") ",
        # Correct common character misinterpretations
        r"(?<=\d)o(?=\d)": "0",  # e.g., 1o0 -> 100
        r"(?<=\d)O(?=\d)": "0",  # e.g., 1O0 -> 100
        r"(?<=\d)\s[oO]\s(?=\d)": " 0 ", # e.g., 1 0 0 -> 100
        r"(\d+),(\d+)": r"\1\2", # Remove commas from numbers, e.g., 10,000 -> 10000
    }
    for wrong, right in replacements.items():
        text = re.sub(wrong, right, text, flags=re.IGNORECASE)
    return text

def extract_fields(text, columns):
    """
    Extracts numerical values for a given list of medical fields.
    """
    fields = []
    for field in columns:
        # Escape field name for regex, but handle parentheses specially
        # This allows us to match units like (g/dL) more flexibly
        escaped_field = re.escape(field).replace(r'\(', r'\s*\(').replace(r'\)', r'\)\s*')
        
        # FIX: A more flexible and robust regex pattern
        # - Handles optional colons, hyphens, or even just spaces as separators.
        # - Handles line breaks between the field name and the value.
        # - Looks for a number (integer or float) immediately following the field name.
        # - Uses a positive lookahead to ignore trailing characters (like units or range indicators).
        pattern = rf"{escaped_field}\s*[:\-]?\s*([\d\.]+)(?=\s|$)"
        
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        
        if match:
            try:
                val = float(match.group(1))
                print(f"✅ Found value for '{field}': {val}", file=sys.stderr)
                fields.append(val)
            except ValueError:
                print(f"⚠️ Invalid number format for field '{field}': {match.group(1)}", file=sys.stderr)
                fields.append(None)
        else:
            print(f"❌ Missing value for: {field}", file=sys.stderr)
            fields.append(None)
    return fields

# Main execution block when run as a script
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "File path not provided."}))
        sys.exit(1)

    file_path = sys.argv[1]

    if not os.path.isfile(file_path):
        print(json.dumps({"error": "File not found."}))
        sys.exit(1)

    if not os.path.exists(MODEL_PATH) or not os.path.exists(LABEL_ENCODER_PATH):
        print(json.dumps({"error": "Model or label encoder file missing."}))
        sys.exit(1)

    try:
        model = joblib.load(MODEL_PATH)
        le = joblib.load(LABEL_ENCODER_PATH)
        print("✅ Model and label encoder loaded successfully.", file=sys.stderr)
    except Exception as e:
        print(json.dumps({"error": f"Failed to load model or encoder: {str(e)}"}))
        sys.exit(1)

    # Run the full pipeline
    text = extract_text(file_path)
    if text is None:
        print(json.dumps({"error": "Could not extract text from the provided file."}))
        sys.exit(1)
        
    cleaned_text = clean_ocr_text(text)
    input_vals = extract_fields(cleaned_text, model.feature_names_in_)

    # Handle missing fields
    if None in input_vals:
        print(json.dumps({
            "error": "Could not extract all required fields from the report.",
            "details": f"Missing values for: {[model.feature_names_in_[i] for i, v in enumerate(input_vals) if v is None]}"
        }))
        sys.exit(1)

    # Make prediction
    try:
        input_df = pd.DataFrame([input_vals], columns=model.feature_names_in_)
        prediction = model.predict(input_df)[0]
        severity = le.inverse_transform([prediction])[0]
        print(json.dumps({"severity": severity}))
    except Exception as e:
        print(json.dumps({"error": f"An error occurred during prediction: {str(e)}"}))
        sys.exit(1)

