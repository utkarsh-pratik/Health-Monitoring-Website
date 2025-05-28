import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import joblib

df = pd.read_csv("api/cbc_health_severity_dataset.csv")

X = df.drop(columns=["PatientID", "Severity"])
y = df["Severity"]

le = LabelEncoder()
y_encoded = le.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

joblib.dump(model, "api/rf_model.joblib")
joblib.dump(le, "api/label_encoder.joblib")

print("Model and label encoder saved!")
