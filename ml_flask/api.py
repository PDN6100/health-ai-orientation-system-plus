from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import random

# Try to import the real ML stack; if unavailable, we fall back to a lightweight mock predictor
REAL_MODEL = False
model = None
symptom_weights = None
description_df = None
precaution_df = None

try:
    import joblib
    import numpy as np
    import pandas as pd
    base = os.path.dirname(__file__)
    # Load model and CSVs if present
    model_path = os.path.join(base, "predictModel.joblib")
    if os.path.exists(model_path):
        model = joblib.load(model_path)
        symptom_weights = pd.read_csv(os.path.join(base, "Symptom-severity-adjusted.csv"))
        description_df = pd.read_csv(os.path.join(base, "symptom_Description.csv"))
        precaution_df = pd.read_csv(os.path.join(base, "symptom_precaution.csv"))
        REAL_MODEL = True
        print("ML model and supporting CSVs loaded — running in REAL_MODEL mode")
    else:
        print("Model file not found, switching to mock mode")
except Exception as e:
    print("Real ML stack unavailable or failed to load — using mock predictor.", e)
    REAL_MODEL = False

app = Flask(__name__)
CORS(app)

# Load disease advice from backend (used by mock mode for descriptions/precautions)
_disease_data = {}
_disease_list = []
try:
    backend_json = os.path.join(os.path.dirname(__file__), '..', 'backend', 'data', 'diseaseAdvice.json')
    backend_json = os.path.normpath(backend_json)
    with open(backend_json, 'r', encoding='utf-8') as f:
        _disease_data = json.load(f)
        _disease_list = list(_disease_data.keys())
        print(f"Loaded {_disease_list.__len__()} diseases from backend data for mock predictions")
except Exception as e:
    print("Could not load backend diseaseAdvice.json for mock descriptions:", e)
    _disease_list = [
        "Impetigo", "Hypertension", "Diabete", "Migraine", "Asthme",
        "InfectionRespiratoire", "Malaria", "Dengue", "Tuberculosis", "Pneumonia"
    ]

def _encode_symptoms_for_model(symptoms):
    # Mirror prior encoding logic used by the model (if available)
    symptoms_encoded = []
    for symptom in symptoms:
        if symptom in symptom_weights['Symptom'].values:
            weight = symptom_weights.loc[symptom_weights['Symptom'] == symptom, 'weight'].values[0]
            symptoms_encoded.append(weight)
        else:
            symptoms_encoded.append(0)
    while len(symptoms_encoded) < 17:
        symptoms_encoded.append(0)
    return np.array(symptoms_encoded).reshape(1, -1)

def _mock_predict(symptoms):
    # Deterministic mock: pick a disease based on the symptoms list contents
    if not symptoms:
        return {
            "disease": "Unknown",
            "confidence": 0.0,
            "description": "Aucun symptôme fourni.",
            "precautions": []
        }
    key = sum(len(s) for s in symptoms) % len(_disease_list)
    disease = _disease_list[key]
    confidence = 0.6 + (min(len(symptoms), 4) * 0.1)
    disease_info = _disease_data.get(disease, {})
    description = disease_info.get("fullDescription", disease_info.get("overview", ""))
    precautions = disease_info.get("practicalTips", disease_info.get("prevention", []))
    return {
        "disease": disease,
        "confidence": round(confidence, 2),
        "description": description,
        "precautions": precautions
    }


@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json() or {}
    symptoms = data.get('symptoms', [])
    if not isinstance(symptoms, list):
        return jsonify({"error": "Les symptômes doivent être fournis sous forme de liste"}), 400

    if REAL_MODEL:
        try:
            processed_symptoms = [symptom.replace(' ', '_') for symptom in symptoms]
            encoded = _encode_symptoms_for_model(processed_symptoms)
            probabilities = model.predict_proba(encoded)[0]
            prediction = model.predict(encoded)[0]
            predicted_probability = float(probabilities[model.classes_.tolist().index(prediction)])
            description = description_df.loc[description_df['Disease'] == prediction, 'Description'].values[0]
            precautions = precaution_df.loc[precaution_df['Disease'] == prediction].iloc[0, 1:].dropna().tolist()
            return jsonify({
                "disease": prediction,
                "confidence": predicted_probability,
                "description": description,
                "precautions": precautions
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify(_mock_predict(symptoms))


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "mode": "real" if REAL_MODEL else "mock"})


if __name__ == '__main__':
    # Bind to all interfaces to be reachable from the frontend and backend
    app.run(host='0.0.0.0', port=5000, debug=True)
