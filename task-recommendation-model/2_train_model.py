import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

def main():
    print("Loading dataset...")
    try:
        df = pd.read_csv('employee_tasks_dataset.csv')
    except FileNotFoundError:
        print("Error: Dataset not found. Please run 1_generate_dataset.py first.")
        return

    # Define features (X) and target variable (y)
    X = df.drop('is_successful', axis=1)
    y = df['is_successful']

    # Split the data into train and test sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"Training on {len(X_train)} samples, validating on {len(X_test)} samples.")

    # Initialize and train the Random Forest model
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    
    print("Training model...")
    model.fit(X_train, y_train)

    # Evaluate the model
    print("Evaluating model...")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\nModel Accuracy: {accuracy * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    # Save the trained model for later use in prediction
    print("Saving model to 'task_recommendation_model.pkl'...")
    joblib.dump(model, 'task_recommendation_model.pkl')
    print("Model saved successfully!")

if __name__ == "__main__":
    main()
