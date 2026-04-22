import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score, confusion_matrix, roc_curve
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
import matplotlib.pyplot as plt
import numpy as np
import shap

print("Loading dataset...")

df = pd.read_csv("synthetic_behavior_dataset.csv")

X = df.drop("label", axis=1)
y = df["label"]

le = LabelEncoder()
y = le.fit_transform(y)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

models = {
    "Logistic Regression": LogisticRegression(max_iter=2000),
    "SVM (RBF)": SVC(kernel="rbf", probability=True),
    "Random Forest": RandomForestClassifier(n_estimators=300, random_state=42),
    "XGBoost": XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.1,
        eval_metric="logloss",
        random_state=42
    )
}

print("\n📊 MODEL COMPARISON\n")

best_auc = 0
best_model = None
best_name = ""

for name, model in models.items():
    print("\n======================")
    print("Training:", name)
    print("======================")

    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    probs = model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, preds)
    auc = roc_auc_score(y_test, probs)

    print("Accuracy:", round(acc * 100, 2), "%")
    print("ROC-AUC :", round(auc, 4))

    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, preds))

    print("\nClassification Report:")
    print(classification_report(y_test, preds))

    fpr, tpr, _ = roc_curve(y_test, probs)
    plt.figure()
    plt.plot(fpr, tpr)
    plt.plot([0, 1], [0, 1], linestyle="--")
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title(f"ROC Curve - {name}")
    plt.show()

    if auc > best_auc:
        best_auc = auc
        best_model = model
        best_name = name

print("\n🏆 Best Model Selected:", best_name)

# -----------------------------
# 🔥 HYBRID RISK SCORING
# -----------------------------

print("\n🔷 HYBRID RISK SCORING\n")

ml_probs = best_model.predict_proba(X_test)[:, 1]

# Simulated rule-based score (normalized feature-based scoring)
rule_score = np.mean(X_test, axis=1)
rule_score = (rule_score - rule_score.min()) / (rule_score.max() - rule_score.min())

# Hybrid score formula
hybrid_score = (0.7 * ml_probs) + (0.3 * rule_score)

hybrid_auc = roc_auc_score(y_test, hybrid_score)

print("Hybrid ROC-AUC:", round(hybrid_auc, 4))

# Hybrid ROC Curve
fpr, tpr, _ = roc_curve(y_test, hybrid_score)
plt.figure()
plt.plot(fpr, tpr)
plt.plot([0, 1], [0, 1], linestyle="--")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC Curve - Hybrid Model")
plt.show()

# -----------------------------
# 🔥 SHAP EXPLAINABILITY
# -----------------------------

print("\n🔎 SHAP FEATURE IMPORTANCE\n")

explainer = shap.Explainer(best_model, X_train)
shap_values = explainer(X_test)

shap.summary_plot(shap_values, X_test)