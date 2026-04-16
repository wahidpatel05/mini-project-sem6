import pandas as pd
import numpy as np

def generate_dataset(num_samples=5000):
    np.random.seed(42)
    
    # Simulating Employee historical metrics
    employee_completion_rate = np.random.uniform(0.3, 1.0, num_samples)
    employee_failure_rate = np.random.uniform(0.0, 0.4, num_samples)
    employee_rejection_rate = np.random.uniform(0.0, 0.3, num_samples)
    
    # Ensure rates sum up to <= 1 logically
    for i in range(num_samples):
        total = employee_completion_rate[i] + employee_failure_rate[i] + employee_rejection_rate[i]
        if total > 1.0:
            employee_completion_rate[i] /= total
            employee_failure_rate[i] /= total
            employee_rejection_rate[i] /= total

    # Current Workload
    current_active_tasks = np.random.randint(0, 15, num_samples) # How many tasks they currently have
    
    # Task specific metrics
    # Priority (Low=1, Medium=2, High=3, Critical=4)
    task_priority = np.random.choice([1, 2, 3, 4], num_samples)
    
    # Employee's historical success rate in the specific task category
    category_match_rate = np.random.uniform(0.1, 1.0, num_samples)
    
    # Employee's historical success rate with high-priority tasks
    high_priority_success_rate = np.random.uniform(0.2, 1.0, num_samples)

    # Creating the target variable: Will they complete this specific task successfully?
    # We will simulate a logical outcome with some random noise.
    
    # Logic base score (similar to old system)
    base_calc = (
        (employee_completion_rate * 40) - 
        (employee_failure_rate * 30) - 
        (employee_rejection_rate * 20) + 
        (category_match_rate * 30) + 
        (np.where(task_priority >= 3, high_priority_success_rate * 20, 10)) - 
        (current_active_tasks * 3) # Penalty for too many tasks
    )
    
    # Normalize between 0 and 1 roughly
    max_possible = 40 + 30 + 20
    normalized_score = base_calc / max_possible
    
    # Adding noise to the data to make the model learn rather than memorize an exact formula
    noise = np.random.normal(0, 0.15, num_samples)
    final_prob = np.clip(normalized_score + noise, 0, 1)
    
    # Target: 1 if successful completion, 0 if failure/rejection/overdue
    target_completed_successfully = (final_prob > 0.5).astype(int)

    df = pd.DataFrame({
        'employee_completion_rate': np.round(employee_completion_rate, 3),
        'employee_failure_rate': np.round(employee_failure_rate, 3),
        'employee_rejection_rate': np.round(employee_rejection_rate, 3),
        'current_active_tasks': current_active_tasks,
        'task_priority': task_priority,
        'category_match_rate': np.round(category_match_rate, 3),
        'high_priority_success_rate': np.round(high_priority_success_rate, 3),
        'is_successful': target_completed_successfully
    })
    
    return df

if __name__ == "__main__":
    print("Generating synthetic dataset...")
    df = generate_dataset(5000)
    df.to_csv("employee_tasks_dataset.csv", index=False)
    print(f"Dataset generated successfully with {len(df)} records.")
    print("Preview:")
    print(df.head())
