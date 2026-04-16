import json
import sys
from pathlib import Path

import joblib
import pandas as pd

def main():
    try:
        payload = json.loads(sys.stdin.read() or "{}")
        model_path = payload.get("modelPath")
        
        if not model_path:
            raise ValueError("modelPath is required")

        model_file = Path(model_path)
        if not model_file.exists():
            raise FileNotFoundError(f"Model file not found: {model_file}")

        model = joblib.load(model_file)
        
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
            print(json.dumps({"scores": scores}))
        else:
            print(json.dumps({"score": scores[0]}))
            
    except Exception as err:
        print(json.dumps({"error": str(err)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
