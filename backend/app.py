from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId

import joblib
import pandas as pd
import numpy as np

# --------------------------------------------------
# APP INIT
# --------------------------------------------------

app = FastAPI()
model = joblib.load("ML/rf_synthetic_model.pkl")

# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# HELPERS
# --------------------------------------------------

def parse_browser_family(user_agent: str):
    ua = user_agent.lower()
    if "chrome" in ua and "edg" not in ua:
        return "Chrome"
    if "firefox" in ua:
        return "Firefox"
    if "safari" in ua and "chrome" not in ua:
        return "Safari"
    if "edg" in ua:
        return "Edge"
    return "Other"


def parse_os_family(platform: str):
    p = platform.lower()
    if "win" in p:
        return "Windows"
    if "mac" in p:
        return "MacOS"
    if "linux" in p:
        return "Linux"
    if "android" in p:
        return "Android"
    if "iphone" in p or "ipad" in p:
        return "iOS"
    return "Other"


def parse_device_type(screen_width: int):
    if screen_width <= 768:
        return "Mobile"
    if screen_width <= 1024:
        return "Tablet"
    return "Desktop"

# --------------------------------------------------
# MONGODB
# --------------------------------------------------

client = MongoClient("YOUR_MONGODB_CONNECTION_STRING")
db = client["uidai_bot_detection"]
collection = db["user_sessions"]

latest_data = None


def make_json_safe(document):
    if isinstance(document, dict):
        safe_doc = {}
        for key, value in document.items():
            if isinstance(value, ObjectId):
                safe_doc[key] = str(value)
            elif isinstance(value, datetime):
                safe_doc[key] = value.isoformat()
            else:
                safe_doc[key] = value
        return safe_doc
    return document


# --------------------------------------------------
# ROOT
# --------------------------------------------------

@app.get("/")
def home():
    if latest_data:
        return {"latest_received_data": make_json_safe(latest_data)}
    return {"message": "No data received yet."}


# --------------------------------------------------
# COLLECT
# --------------------------------------------------

@app.post("/collect")
async def collect(request: Request):
    global latest_data

    try:
        data = await request.json()
        latest_data = data

        # Remove Aadhaar for privacy
        data.pop("aadhaar", None)

        data["user_id"] = "Person_14"
        data["received_at"] = datetime.utcnow()
        data["label"] = "human"  # Change manually during dataset collection

        env = data.get("env", {})
        env["browserFamily"] = parse_browser_family(env.get("browser", ""))
        env["osFamily"] = parse_os_family(env.get("platform", ""))
        env["deviceType"] = parse_device_type(env.get("screenWidth", 0))
        data["env"] = env

        result = collection.insert_one(data)

        return {
            "status": "success",
            "inserted_id": str(result.inserted_id),
        }

    except Exception as e:
        return {"status": "error", "details": str(e)}


# --------------------------------------------------
# PREDICT (CLEAN BINARY VERSION)
# --------------------------------------------------
    

@app.post("/predict")
def predict(data: dict):
    try:
        features = {
            "env.screenWidth": data["env"]["screenWidth"],
            "env.screenHeight": data["env"]["screenHeight"],
            "env.hardwareConcurrency": data["env"]["hardwareConcurrency"],

            "metrics.mouseMoves": data["metrics"]["mouseMoves"],
            "metrics.scrollEvents": data["metrics"]["scrollEvents"],
            "metrics.keyboardEvents": data["metrics"]["keyboardEvents"],
            "metrics.clicks": data["metrics"]["clicks"],
            "metrics.timeOnPage": data["metrics"]["timeOnPage"],
            "metrics.idleTime": data["metrics"]["idleTime"],
            "metrics.focusChanges": data["metrics"]["focusChanges"],
            "metrics.typingSpeedVariance": data["metrics"]["typingSpeedVariance"],

            "metrics.avgMouseSpeed": data["metrics"]["avgMouseSpeed"],
            "metrics.maxMouseSpeed": data["metrics"]["maxMouseSpeed"],
            "metrics.mouseJitter": data["metrics"]["mouseJitter"],
            "metrics.directionChanges": data["metrics"]["directionChanges"],
            "metrics.straightness": data["metrics"]["straightness"],
            "metrics.pathVariance": data["metrics"]["pathVariance"],

            "metrics.avgKeyInterval": data["metrics"]["avgKeyInterval"],
            "metrics.burstTypingRatio": data["metrics"]["burstTypingRatio"],
            "metrics.pauseVariance": data["metrics"]["pauseVariance"],

            "metrics.scrollVelocity": data["metrics"]["scrollVelocity"],
            "metrics.scrollAcceleration": data["metrics"]["scrollAcceleration"],
            "metrics.scrollJitter": data["metrics"]["scrollJitter"],
        }
        CAP_VALUE = 10000

        for col in [
        "metrics.scrollVelocity",
        "metrics.scrollAcceleration",
        "metrics.scrollJitter"
        ]:
            if col in features:
                features[col] = min(features[col], CAP_VALUE)
                features[col] = np.log1p(features[col])

        df = pd.DataFrame([features])
        df = df.reindex(columns=model.feature_names_in_, fill_value=0)
        

        # Get probabilities
        print("LIVE FEATURE VALUES:")
        print(df.to_dict(orient="records")[0])

        proba = model.predict_proba(df)[0]
        classes = model.classes_

        print("========== DEBUG ==========")
        print("INPUT FEATURES:")
        print(df)
        print("PROBABILITIES:", proba)
        print("CLASSES:", classes)
        print("===========================")

        human_index = list(classes).index("human")
        bot_index = list(classes).index("bot")

        human_conf = float(proba[human_index])
        bot_conf = float(proba[bot_index])

        # 🔥 CONFIDENCE MARGIN VERSION

        if human_conf >= 0.7:
            verdict = "HUMAN"
            confidence = human_conf
        elif bot_conf >= 0.6:
            verdict = "BOT"
            confidence = bot_conf
        else:
            verdict = "HUMAN"
            confidence = human_conf

        return {
            "verdict": verdict,
            "confidence": round(confidence * 100, 2),
            "human_confidence": round(human_conf * 100, 2),
            "bot_confidence": round(bot_conf * 100, 2),
        }
    except Exception as e:
        return {"error": str(e)}
