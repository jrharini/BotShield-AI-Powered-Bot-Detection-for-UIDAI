import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
from sklearn.model_selection import train_test_split

# --------------------------------------------------
# LOAD SYNTHETIC DATA
# --------------------------------------------------
df = pd.read_csv("synthetic_behavior_dataset.csv")

print("Total rows:", len(df))
print(df["label"].value_counts())

# --------------------------------------------------
# SPLIT FEATURES & LABEL
# --------------------------------------------------
X = df.drop(columns=["label"])
y = df["label"]

# --------------------------------------------------
# TRAIN TEST SPLIT (80 / 20)
# --------------------------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# --------------------------------------------------
# TRAIN MODEL
# --------------------------------------------------
model = RandomForestClassifier(
    n_estimators=300,
    max_depth=None,
    random_state=42
)

model.fit(X_train, y_train)

# --------------------------------------------------
# EVALUATE
# --------------------------------------------------
train_acc = accuracy_score(y_train, model.predict(X_train))
test_acc  = accuracy_score(y_test, model.predict(X_test))

print("\n🔥 TRAIN ACCURACY:", round(train_acc * 100, 2), "%")
print("🔥 TEST ACCURACY :", round(test_acc * 100, 2), "%")

print("\n📊 CLASSIFICATION REPORT:")
print(classification_report(y_test, model.predict(X_test)))

# --------------------------------------------------
# FEATURE IMPORTANCE
# --------------------------------------------------
importances = sorted(
    zip(model.feature_importances_, X.columns),
    reverse=True
)

print("\nTop Important Features:")
for imp, name in importances[:10]:
    print(f"{name}: {round(imp, 4)}")

# --------------------------------------------------
# SAVE MODEL
# --------------------------------------------------
joblib.dump(model, "rf_synthetic_model.pkl")
print("\n✅ Synthetic model saved as rf_synthetic_model.pkl")
