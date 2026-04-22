import pandas as pd
import joblib
import numpy as np

# Load trained model
model = joblib.load("rf_model.pkl")

# 🔥 Check class order
classes = model.classes_
print("Model classes:", classes)

# Load test data
test_df = pd.read_csv("test.csv")

# Prepare features
X = test_df.drop(columns=["label", "user_id"], errors="ignore")
X = X.select_dtypes(include=["number"])

# Align features with training model
model_features = model.feature_names_in_
X = X.reindex(columns=model_features, fill_value=0)

# Predict probabilities and labels
proba = model.predict_proba(X)
pred  = model.predict(X)

# 🔥 Dynamically get correct indexes
human_index = list(classes).index("human")
bot_index   = list(classes).index("bot")

print("\n🔐 SAMPLE VERDICTS\n")

for i in range(5):
    human_conf = round(float(proba[i][human_index]) * 100, 2)
    bot_conf   = round(float(proba[i][bot_index]) * 100, 2)

    if human_conf >= 70:
        verdict = "HUMAN"
    elif bot_conf >= 70:
        verdict = "BOT"
    else:
        verdict = "SUSPECT"

    print({
        "actual": test_df.iloc[i]["label"],
        "predicted": pred[i],
        "verdict": verdict,
        "human_confidence_%": human_conf,
        "bot_confidence_%": bot_conf
    })


print("\n🔐 SAMPLE CONFIDENCE SCORES\n")

for i in range(5):
    print({
        "actual": test_df.iloc[i]["label"],
        "predicted": pred[i],
        "confidence_%": round(float(np.max(proba[i])) * 100, 2)
    })
