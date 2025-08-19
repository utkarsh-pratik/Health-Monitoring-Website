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
    replacements = {
        # Terminology variations and common OCR mistakes
        r"\bHaemoglobin\b": "Hemoglobin",
        r"\bPlatelets?\b": "Platelet Count",
        r"\bPCV\b": "Hematocrit",
        r"\bPacked\s*Cell\s*Volume\b": "Hematocrit",
        r"\bWBC\s*Count\b": "WBC",
        r"\bRBC\s*Count\b": "RBC",
        # General unit fixes and common OCR mistakes for units
        r"g/d[lL1I]": "g/dL",
        r"g/[dD]L": "g/dL",
        r"f[lL1I]": "fL",
        r"p[gq]": "pg",
        r"cells\s*/\s*[pPyYμµuU]?[lL1I]": "cells/µL",
        r"million\s*/\s*[pPyYμµuU]?[lL1I]": "million/µL",
        # Normalize spacing and characters
        r"\s*[:\-=]\s*": " : ", # Standardize separators
        r"\s*\(\s*": " (",
        r"\s*\)\s*": ") ",
        r"(?<=\d)o(?=\d)": "0",
        r"(?<=\d)O(?=\d)": "0",
        r"(\d+),(\d{3})": r"\1\2", # Remove commas from numbers like 100,000
    }
    for wrong, right in replacements.items():
        text = re.sub(wrong, right, text, flags=re.IGNORECASE)
    return text

def extract_fields(text, columns):
    """
    Extracts numerical values for a given list of medical fields with a highly flexible regex.
    """
    fields = []
    for field in columns:
        # 1. Simplify the field name for a more robust search pattern.
        # Example: "Hemoglobin (g/dL)" -> "Hemoglobin"
        core_field = field.split('(')[0].strip()
        
        # 2. Create a more flexible regex pattern.
        # This pattern looks for the core field name, followed by almost any separator,
        # and then captures the first valid number it finds.
        # - (?i) makes it case-insensitive.
        # - \b ensures we match whole words.
        # - [\s:=-]* handles various separators (spaces, colons, hyphens, equals) and line breaks.
        # - ([\d,]+\.?\d*|\.?[\d]+) captures integers, floats, and numbers with commas.
        pattern = rf"(?i)\b{re.escape(core_field)}\b.*?([\d,]+\.?\d*|\.?[\d]+)"
        
        match = re.search(pattern, text, re.DOTALL)
        
        if match:
            try:
                # Clean the captured value (remove commas) and convert to float
                value_str = match.group(1).replace(',', '')
                val = float(value_str)
                print(f"✅ Found value for '{field}': {val}", file=sys.stderr)
                fields.append(val)
            except (ValueError, IndexError):
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

    try:
        model = joblib.load(MODEL_PATH)
        le = joblib.load(LABEL_ENCODER_PATH)
    except Exception as e:
        print(json.dumps({"error": f"Failed to load model or encoder: {str(e)}"}))
        sys.exit(1)

    text = extract_text(file_path)
    if text is None:
        print(json.dumps({"error": "Could not extract text from the provided file."}))
        sys.exit(1)
        
    cleaned_text = clean_ocr_text(text)
    input_vals = extract_fields(cleaned_text, model.feature_names_in_)

    if None in input_vals:
        missing_fields = [model.feature_names_in_[i] for i, v in enumerate(input_vals) if v is None]
        print(json.dumps({
            "error": "Could not extract all required fields from the report.",
            "details": f"Missing values for: {', '.join(missing_fields)}"
        }))
        sys.exit(1)

    try:
        input_df = pd.DataFrame([input_vals], columns=model.feature_names_in_)
        prediction = model.predict(input_df)[0]
        severity = le.inverse_transform([prediction])[0]
        print(json.dumps({"severity": severity}))
    except Exception as e:
        print(json.dumps({"error": f"An error occurred during prediction: {str(e)}"}))
        sys.exit(1)

