# train_model.py

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.preprocessing import LabelEncoder
import joblib

# -----------------------------
# LOAD DATASET
# -----------------------------

df = pd.read_csv("synthetic_behavior_dataset.csv")

# -----------------------------
# PREPARE DATA
# -----------------------------

X = df.drop("label", axis=1)
y = df["label"]

le = LabelEncoder()
y_encoded = le.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded,
    test_size=0.2,
    stratify=y_encoded,
    random_state=42
)

# -----------------------------
# TRAIN MODEL
# -----------------------------

model = RandomForestClassifier(
    n_estimators=350,
    max_depth=14,
    min_samples_split=8,
    class_weight="balanced",
    random_state=42
)

model.fit(X_train, y_train)

# -----------------------------
# EVALUATION
# -----------------------------

preds = model.predict(X_test)
probs = model.predict_proba(X_test)[:, 1]

print("\n📊 CLASSIFICATION REPORT:")
print(classification_report(y_test, preds))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, preds))

print("\nROC-AUC:", roc_auc_score(y_test, probs))

cv_scores = cross_val_score(model, X, y_encoded, cv=5)
print("\n5-Fold CV Accuracy:", cv_scores.mean())

# -----------------------------
# SAVE MODEL
# -----------------------------

joblib.dump(model, "rf_model.pkl")
print("\n✅ Model saved as rf_model.pkl")