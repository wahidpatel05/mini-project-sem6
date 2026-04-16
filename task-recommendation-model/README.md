# Task Recommendation Machine Learning Model

This directory contains logic to transition the project's task recommendation system from purely rule-based (`logic`) to a data-driven Machine Learning approach.

It generates synthetic data based on historical employee metrics, trains a Random Forest Classifier model, and enables probability predictions acting as "Suitability Scores" (1-100).

## Folder Structure
- `requirements.txt`: Python package requirements.
- `1_generate_dataset.py`: Python script simulating historical employee data and performance. Creates an `employee_tasks_dataset.csv`.
- `2_train_model.py`: Script to ingest the CSV, train a scikit-learn Random Forest model, evaluate it, and save the binary model (`task_recommendation_model.pkl`).
- `3_predict.py`: Demonstration script showing how to load the `.pkl` model and generate a prediction score based on live metrics from an employee.

## How to run (A to Z)

1. **Install python requirements**:
Make sure you have python installed natively or use a virtual environment, then execute:
```bash
pip install -r requirements.txt
```

2. **Generate the Historical Dataset**:
```bash
python 1_generate_dataset.py
```
This simulates thousands of historical tasks completed/failed by employees mirroring your current logic but adding variance (noise) to look more realistic.

3. **Train the ML Model**:
```bash
python 2_train_model.py
```
This will train the `RandomForestClassifier`. It will output the accuracy and create `task_recommendation_model.pkl`.

4. **Test the Prediction**:
```bash
python 3_predict.py
```
This loads the `.pkl` model and provides an example predicting scores natively for "Good" and "Bad" employees simulating real-time use. It returns a score out of 100 on how suitable an employee is for a task based on previous behavior.

5. **Simulate True Real-Time Online Learning**:
```bash
python 4_real_time_learning.py
```
Random Forests (script 2 and 3) cannot easily learn "one row at a time". They must be retrained completely. If you want the model to adjust dynamically the second an employee hits "Complete" or "Failed" without retraining on all historical data, you need an "Online Learning" model (like `SGDClassifier`). This script demonstrates exactly how that works in real-time.

## Future Next Steps for Integration into the Project

When you are ready to integrate this into the main project:
1. **Python API / Child Process**: You will need to execute the ML model predictions from the Express Node.js Backend. 
2. **Implementation strategies**:
   - Save the model, create a lightweight Python Flask/FastAPI microservice in this folder to accept `POST` requests and return the ML model's prediction score.
   - Alternatively, use Node's `child_process.spawn()` inside `utils/analyticsHelper.js` to execute `predict.py` directly by passing in stringified arguments and collecting the standard output.
   - Another alternative is using `onnx` or a javascript port (like `ml-random-forest`) to load tree-based models natively in Node.js. 
