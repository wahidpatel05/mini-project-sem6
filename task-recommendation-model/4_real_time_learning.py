import pandas as pd
import numpy as np
from sklearn.linear_model import SGDClassifier
import joblib
import os

MODEL_PATH = 'real_time_model.pkl'

def initialize_real_time_model():
    """
    Initializes a model capable of 'online learning' (learning one row at a time).
    We use SGDClassifier with log_loss to get probability outputs.
    """
    model = SGDClassifier(loss='log_loss', random_state=42)
    # We must do an initial partial_fit to define the classes (0 = failure, 1 = success)
    # We'll just give it dummy data with both classes to initialize it.
    dummy_X = np.zeros((2, 7))
    dummy_y = np.array([0, 1])
    model.partial_fit(dummy_X, dummy_y, classes=np.array([0, 1]))
    
    joblib.dump(model, MODEL_PATH)
    print("Real-time model initialized.")

def predict_real_time(employee_metrics, task_priority):
    """Predict using the real-time model."""
    if not os.path.exists(MODEL_PATH):
        initialize_real_time_model()
        
    model = joblib.load(MODEL_PATH)
    
    X = np.array([[
        employee_metrics['employee_completion_rate'],
        employee_metrics['employee_failure_rate'],
        employee_metrics['employee_rejection_rate'],
        employee_metrics['current_active_tasks'],
        task_priority,
        employee_metrics['category_match_rate'],
        employee_metrics['high_priority_success_rate']
    ]])
    
    # Predict probability of success
    success_prob = model.predict_proba(X)[0][1]
    return round(success_prob * 100, 2)

def update_model(employee_metrics, task_priority, actual_outcome):
    """
    This is where the REAL-TIME learning happens!
    We update the weights of the model based on the actual outcome of a single task.
    """
    model = joblib.load(MODEL_PATH)
    
    X = np.array([[
        employee_metrics['employee_completion_rate'],
        employee_metrics['employee_failure_rate'],
        employee_metrics['employee_rejection_rate'],
        employee_metrics['current_active_tasks'],
        task_priority,
        employee_metrics['category_match_rate'],
        employee_metrics['high_priority_success_rate']
    ]])
    y = np.array([actual_outcome]) # 1 for success, 0 for failure

    # partial_fit updates the model with just this one new piece of data
    model.partial_fit(X, y)
    
    # Save the updated model
    joblib.dump(model, MODEL_PATH)
    print(f"Model updated in real-time! Learned from outcome: {'Success' if actual_outcome == 1 else 'Failure'}")


if __name__ == "__main__":
    print("--- Simulating Real-Time Learning ---\n")
    
    # Ensure a fresh model for the demo
    if os.path.exists(MODEL_PATH):
        os.remove(MODEL_PATH)
    initialize_real_time_model()

    # Suppose a new employee is hired and assigned a task.
    # At first, they look like a moderate employee.
    employee_state = {
        'employee_completion_rate': 0.50,
        'employee_failure_rate': 0.10,
        'employee_rejection_rate': 0.10,
        'current_active_tasks': 1,
        'category_match_rate': 0.50,
        'high_priority_success_rate': 0.50
    }
    task_priority = 3 # High
    
    # 1. Ask the model for a prediction BEFORE the task happens
    initial_score = predict_real_time(employee_state, task_priority)
    print(f"\n[Before] Initial Prediction Score for employee: {initial_score} / 100")
    
    # 2. Let's simulate that the employee unexpectedly FAILED the task.
    # We feedback this actual outcome to the model instantly.
    print("\nSimulating real-world event: Employee FAILED the task (Outcome = 0)...")
    update_model(employee_state, task_priority, actual_outcome=0)
    
    # 3. Ask the exact same question again to see if the model learned from that failure
    new_score = predict_real_time(employee_state, task_priority)
    print(f"\n[After 1 Failure] New Prediction Score: {new_score} / 100")
    
    # 4. Let's simulate them failing 5 more times in a row in real-time
    print("\nSimulating real-world event: Employee fails 5 more similar tasks...")
    for _ in range(5):
        update_model(employee_state, task_priority, actual_outcome=0)
        
    final_score = predict_real_time(employee_state, task_priority)
    print(f"\n[After 6 Failures] Final Prediction Score: {final_score} / 100")
    print("\nNotice how the model dynamically drastically reduced its confidence in them without needing a full dataset retraining!")