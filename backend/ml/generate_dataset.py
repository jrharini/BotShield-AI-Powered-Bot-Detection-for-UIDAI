# generate_dataset.py

import pandas as pd
import numpy as np

np.random.seed(42)

def generate_human():
    return {
        "mouseMoves": np.random.randint(480, 980),
        "scrollEvents": np.random.randint(45, 135),
        "keyboardEvents": np.random.randint(18, 70),
        "clicks": np.random.randint(4, 20),
        "timeOnPage": np.random.randint(90, 360),
        "idleTime": np.random.randint(5, 28),
        "typingVariance": np.random.randint(650, 1900),
        "avgMouseSpeed": np.random.uniform(0.7, 2.6),
        "directionChanges": np.random.randint(75, 230),
        "straightness": np.random.uniform(0.05, 0.32),
        "avgKeyInterval": np.random.randint(240, 650),
        "burstRatio": np.random.uniform(0.3, 0.75),
        "scrollVelocity": np.random.uniform(0.14, 0.55),
        "label": "human"
    }

def generate_bot():
    return {
        "mouseMoves": np.random.randint(300, 900),
        "scrollEvents": np.random.randint(30, 120),
        "keyboardEvents": np.random.randint(10, 60),
        "clicks": np.random.randint(3, 18),
        "timeOnPage": np.random.randint(60, 320),
        "idleTime": np.random.randint(0, 25),
        "typingVariance": np.random.randint(200, 1500),
        "avgMouseSpeed": np.random.uniform(1.0, 3.0),
        "directionChanges": np.random.randint(40, 200),
        "straightness": np.random.uniform(0.2, 0.6),
        "avgKeyInterval": np.random.randint(100, 600),
        "burstRatio": np.random.uniform(0.1, 0.7),
        "scrollVelocity": np.random.uniform(0.1, 0.5),
        "label": "bot"
    }

data = []

for _ in range(3000):
    data.append(generate_human())

for _ in range(3000):
    data.append(generate_bot())

df = pd.DataFrame(data)
df = df.sample(frac=1).reset_index(drop=True)

# Add 10% noise to make it realistic
noise_fraction = 0.10
n_noise = int(len(df) * noise_fraction)
noise_indices = np.random.choice(df.index, n_noise, replace=False)

df.loc[noise_indices, "label"] = df.loc[noise_indices, "label"].apply(
    lambda x: "human" if x == "bot" else "bot"
)

df.to_csv("synthetic_behavior_dataset.csv", index=False)

print("✅ Dataset saved as synthetic_behavior_dataset.csv")