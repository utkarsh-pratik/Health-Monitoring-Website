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

# Ensure proper stdout encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# === Configurations ===
POPPLER_PATH = r"C:\poppler-24.08.0\Library\bin"
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
MODEL_PATH = r"C:\Users\sarthak\OneDrive\Desktop\sarthakkartesummertraining\summer_training-\api\rf_model.joblib"
LABEL_ENCODER_PATH = r"C:\Users\sarthak\OneDrive\Desktop\sarthakkartesummertraining\summer_training-\api\label_encoder.joblib"

# Configure pytesseract
pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

def is_pdf(file_path):
    ext = os.path.splitext(file_path)[-1].lower()
    mime, _ = mimetypes.guess_type(file_path)
    if ext == ".pdf" or mime == "application/pdf":
        return True
    # Check file header for PDF magic number '%PDF'
    try:
        with open(file_path, "rb") as f:
            header = f.read(4)
            if header == b"%PDF":
                return True
    except Exception:
        pass
    return False

def extract_text(path):
    try:
        print(f"📁 File received: {path}", file=sys.stderr)

        if is_pdf(path):
            print("📄 Detected PDF. Converting to images...", file=sys.stderr)
            pages = convert_from_path(path, poppler_path=POPPLER_PATH)
            print(f"✅ Converted {len(pages)} page(s) to images.", file=sys.stderr)
            text = "\n".join(pytesseract.image_to_string(img) for img in pages)
        else:
            print("🖼️ Detected image file. Extracting text...", file=sys.stderr)
            try:
                image = Image.open(path)
                text = pytesseract.image_to_string(image)
            except UnidentifiedImageError:
                raise Exception("Unrecognized image format. Ensure it is a valid image or PDF.")

        print("🔍 OCR Text Preview:\n", text[:300], "...", file=sys.stderr)
        return text

    except Exception as e:
        print(json.dumps({
            "error": f"Failed to extract text from file: {str(e)}",
            "trace": traceback.format_exc()
        }))
        sys.exit(1)

def clean_ocr_text(text):
    replacements = {
        # RBC and WBC units variations normalization
        r"cells\s*/\s*[pPμµuU]?[lL]": "cells/µL",  # cells/pL, cells/uL, cells/μL, with optional spaces
        r"cells\s*/\s*ul": "cells/µL",
        r"cells\s*/\s*μl": "cells/µL",
        r"cells\s*/\s*µl": "cells/µL",
        r"cells\s*/\s*Ul": "cells/µL",
        r"cells\s*/\s*PL": "cells/µL",

        r"million\s*/\s*[pPμµuU]?[lL]": "million/µL",  # million/yL variations
        r"million\s*/\s*ul": "million/µL",
        r"million\s*/\s*μl": "million/µL",
        r"million\s*/\s*µl": "million/µL",
        r"million\s*/\s*Ul": "million/µL",
        r"million\s*/\s*PL": "million/µL",

        # MCV units normalization (fL)
        r"MCV\s*\([\£fF][lL]\)": "MCV (fL)",
        r"MCV\s*\([fF1Il|]+\)": "MCV (fL)",
        r"\bfl\b": "fL",
        r"\bFl\b": "fL",
        r"\bFL\b": "fL",
        r"£L": "fL",

        # General unit fixes
        r"\bpL\b": "µL",
        r"\bpl\b": "µL",
        r"\bPL\b": "µL",
        r"\byL\b": "µL",
        r"\bul\b": "µL",
        r"\bUL\b": "µL",
        r"\bUl\b": "µL",
        r"μL": "µL",
        r"μl": "µL",
        r"µl": "µL",

        # Remove extra spaces around slashes
        r"cells\s*/\s*µL": "cells/µL",
        r"million\s*/\s*µL": "million/µL",
    }

    for wrong, right in replacements.items():
        text = re.sub(wrong, right, text, flags=re.IGNORECASE)

    return text

def extract_fields(text, columns):
    fields = []
    for field in columns:
        # escape for regex, but accept both µ or u in units inside parentheses
        escaped_field = re.escape(field)
        # replace (µ or u) in regex to accept both
        escaped_field = re.sub(r"\\\(µ", r"(?:µ|u)", escaped_field)
        # allow optional spaces around colon or dash after field name
        pattern = rf"{escaped_field}[:\-]?\s*([\d\.]+)"
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                val = float(match.group(1))
                print(f"✅ Found value for '{field}': {val}", file=sys.stderr)
                fields.append(val)
            except ValueError:
                print(f"⚠️ Invalid number for field: {field}", file=sys.stderr)
                fields.append(None)
        else:
            print(f"❌ Missing value for: {field}", file=sys.stderr)
            fields.append(None)
    return fields

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

    # Run OCR
    text = extract_text(file_path)
    text = clean_ocr_text(text)
    input_vals = extract_fields(text, model.feature_names_in_)

    # Handle missing fields
    if None in input_vals:
        print(json.dumps({
            "error": "Missing values for some fields.",
            "fields": dict(zip(model.feature_names_in_, input_vals))
        }))
        sys.exit(1)

    # Predict
    try:
        input_df = pd.DataFrame([input_vals], columns=model.feature_names_in_)
        prediction = model.predict(input_df)[0]
        severity = le.inverse_transform([prediction])[0]
    except Exception as e:
        print(json.dumps({"error": f"Prediction failed: {str(e)}"}))
        sys.exit(1)

    print(json.dumps({"severity": severity}))
