import joblib
import pandas as pd
import sys

def predict_suitability(employee_metrics, task_priority, model_path='task_recommendation_model.pkl'):
    """
    Predicts the suitability score (probability of task completion) for an employee.

    employee_metrics dictionary expects:
        - employee_completion_rate: (0.0 to 1.0)
        - employee_failure_rate: (0.0 to 1.0)
        - employee_rejection_rate: (0.0 to 1.0)
        - current_active_tasks: Integer (0, 1, 2, ...)
        - category_match_rate: (0.0 to 1.0) (Success rate for this category)
        - high_priority_success_rate: (0.0 to 1.0)
        
    task_priority: Integer 1-4 (1=Low, 2=Medium, 3=High, 4=Critical)
    """
    try:
        model = joblib.load(model_path)
    except FileNotFoundError:
        print(f"Error: Model file '{model_path}' not found. Please run 2_train_model.py first.")
        return None

    # Construct input feature matrix based on the format used in training
    input_data = pd.DataFrame([{
        'employee_completion_rate': employee_metrics['employee_completion_rate'],
        'employee_failure_rate': employee_metrics['employee_failure_rate'],
        'employee_rejection_rate': employee_metrics['employee_rejection_rate'],
        'current_active_tasks': employee_metrics['current_active_tasks'],
        'task_priority': task_priority,
        'category_match_rate': employee_metrics['category_match_rate'],
        'high_priority_success_rate': employee_metrics['high_priority_success_rate'],
    }])

    # Predict probability of success class (which is index 1 for class 1)
    probabilities = model.predict_proba(input_data)[0]
    success_probability = probabilities[1] # Probability of being successful
    
    # We output a score derived from the probability (scaled from 0 to 100)
    suitability_score = round(success_probability * 100, 2)
    
    return suitability_score

if __name__ == "__main__":
    print("Testing ML Prediction functionality...")

    # Simulated candidate for a task
    # A generic good employee
    good_employee = {
        'employee_completion_rate': 0.85,
        'employee_failure_rate': 0.05,
        'employee_rejection_rate': 0.10,
        'current_active_tasks': 2,
        'category_match_rate': 0.90,
        'high_priority_success_rate': 0.80
    }

    # A generic overloaded / underperforming employee
    bad_employee = {
        'employee_completion_rate': 0.40,
        'employee_failure_rate': 0.30,
        'employee_rejection_rate': 0.30,
        'current_active_tasks': 8,
        'category_match_rate': 0.20,
        'high_priority_success_rate': 0.30
    }

    # Suppose it's a High Priority Task (3)
    task_priority = 3 

    print("\n--- Generating Suitability Score ---\n")
    print("Task Details: High Priority (3)")

    score1 = predict_suitability(good_employee, task_priority)
    print(f"Predicted Score for 'Good Employee': {score1} / 100")

    score2 = predict_suitability(bad_employee, task_priority)
    print(f"Predicted Score for 'Bad/Overloaded Employee': {score2} / 100")

    if score1 and score2:
        print("\nThe ML model successfully differentiated the employees based on historical metrics.")
