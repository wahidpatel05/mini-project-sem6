from flask import Flask, request, jsonify
import joblib
import pandas as pd
from pathlib import Path
from werkzeug.exceptions import BadRequest
import os
from sklearn.linear_model import SGDClassifier
import numpy as np

app = Flask(__name__)

# Paths to models
BASE_DIR = Path(__dirname__).parent.absolute() if '__dirname__' in globals() else Path(__file__).parent.absolute()
BATCH_MODEL_PATH = BASE_DIR / "task_recommendation_model.pkl"
REAL_TIME_MODEL_PATH = BASE_DIR / "real_time_model.pkl"

# Initialize real-time model if not exists
def init_real_time_model():
    if not REAL_TIME_MODEL_PATH.exists():
        model = SGDClassifier(loss='log_loss', random_state=42)
        dummy_X = np.zeros((2, 7))
        dummy_y = np.array([0, 1])
        model.partial_fit(dummy_X, dummy_y, classes=np.array([0, 1]))
        joblib.dump(model, REAL_TIME_MODEL_PATH)

init_real_time_model()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "ML Microservice is running"})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        payload = request.get_json()
        if not payload:
            raise BadRequest("Invalid JSON payload")

        # By default use the batch trained model unless specified
        model_path = BATCH_MODEL_PATH
        if not model_path.exists():
            return jsonify({"error": f"Model file not found: {model_path.name}"}), 500

        model = joblib.load(model_path)
        
        features_list = payload.get("featuresList")
        is_batch = True
        
        if features_list is None:
            is_batch = False
            features_list = [payload.get("features", {})]

        rows = []
        for features in features_list:
            rows.append({
                "employee_completion_rate": float(features.get("employee_completion_rate", 0.5)),
                "employee_failure_rate": float(features.get("employee_failure_rate", 0.1)),
                "employee_rejection_rate": float(features.get("employee_rejection_rate", 0.1)),
                "current_active_tasks": int(features.get("current_active_tasks", 0)),
                "task_priority": int(features.get("task_priority", 2)),
                "category_match_rate": float(features.get("category_match_rate", 0.5)),
                "high_priority_success_rate": float(features.get("high_priority_success_rate", 0.5)),
            })

        frame = pd.DataFrame(rows)
        probs = model.predict_proba(frame)
        
        scores = [round(float(p[1]) * 100, 2) for p in probs]

        if is_batch:
            return jsonify({"scores": scores})
        else:
            return jsonify({"score": scores[0]})
            
    except Exception as err:
        return jsonify({"error": str(err)}), 400

@app.route('/learn', methods=['POST'])
def learn_real_time():
    try:
        payload = request.get_json()
        if not payload:
            raise BadRequest("Invalid JSON payload")
            
        employee_metrics = payload.get("features", {})
        task_priority = int(payload.get("task_priority", 2))
        actual_outcome = int(payload.get("actual_outcome", 0)) # 1 for success, 0 for failure

        init_real_time_model()
        model = joblib.load(REAL_TIME_MODEL_PATH)
        
        X = np.array([[
            float(employee_metrics.get('employee_completion_rate', 0.5)),
            float(employee_metrics.get('employee_failure_rate', 0.1)),
            float(employee_metrics.get('employee_rejection_rate', 0.1)),
            float(employee_metrics.get('current_active_tasks', 0)),
            task_priority,
            float(employee_metrics.get('category_match_rate', 0.5)),
            float(employee_metrics.get('high_priority_success_rate', 0.5))
        ]])
        y = np.array([actual_outcome])

        model.partial_fit(X, y)
        joblib.dump(model, REAL_TIME_MODEL_PATH)
        
        return jsonify({"message": f"Real-time model updated successfully with outcome: {actual_outcome}"})

    except Exception as err:
        return jsonify({"error": str(err)}), 400

if __name__ == '__main__':
    # Use port 5001 or environment port
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port)