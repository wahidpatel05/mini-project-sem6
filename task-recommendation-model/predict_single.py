import json
import sys
from pathlib import Path

import joblib
import pandas as pd


def main():
    try:
        payload = json.loads(sys.stdin.read() or "{}")
        model_path = payload.get("modelPath")
        features = payload.get("features", {})

        if not model_path:
            raise ValueError("modelPath is required")

        model_file = Path(model_path)
        if not model_file.exists():
            raise FileNotFoundError(f"Model file not found: {model_file}")

        model = joblib.load(model_file)

        row = {
            "employee_completion_rate": float(features.get("employee_completion_rate", 0.5)),
            "employee_failure_rate": float(features.get("employee_failure_rate", 0.1)),
            "employee_rejection_rate": float(features.get("employee_rejection_rate", 0.1)),
            "current_active_tasks": int(features.get("current_active_tasks", 0)),
            "task_priority": int(features.get("task_priority", 2)),
            "category_match_rate": float(features.get("category_match_rate", 0.5)),
            "high_priority_success_rate": float(features.get("high_priority_success_rate", 0.5)),
        }

        frame = pd.DataFrame([row])
        prob_success = float(model.predict_proba(frame)[0][1])
        score = round(prob_success * 100, 2)

        print(json.dumps({"score": score}))
    except Exception as err:
        print(json.dumps({"error": str(err)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
