import pandas as pd
from sklearn.model_selection import train_test_split

# --------------------------------------------------
# STEP 1: LOAD RAW DATA (READ ONLY)
# --------------------------------------------------
df = pd.read_csv("../uidai_bot_dataset.csv")

print("Total rows:", len(df))

# --------------------------------------------------
# STEP 2: NORMALIZE LABELS
# --------------------------------------------------
df["label"] = df["label"].astype(str).str.strip().str.lower()

print(df["label"].value_counts())
print("Unique labels:", df["label"].unique())

# --------------------------------------------------
# STEP 3: HANDLE MISSING NUMERIC VALUES (DO NOT DROP ROWS)
# --------------------------------------------------
num_cols = df.select_dtypes(include=["number"]).columns
df[num_cols] = df[num_cols].fillna(0)

# --------------------------------------------------
# STEP 4: SEPARATE HUMAN & BOT
# --------------------------------------------------
human_df = df[df["label"] == "human"]
bot_df   = df[df["label"] == "bot"]

print("Human rows before split:", len(human_df))
print("Bot rows before split:", len(bot_df))

# --------------------------------------------------
# STEP 5: HUMAN SPLIT (BY USER ID — SAFE VERSION)
# --------------------------------------------------
human_users = human_df["user_id"].unique()

split_index = int(0.75 * len(human_users))

train_human_users = human_users[:split_index]
test_human_users  = human_users[split_index:]

train_humans = human_df[human_df["user_id"].isin(train_human_users)]
test_humans  = human_df[human_df["user_id"].isin(test_human_users)]

print("Human train rows:", len(train_humans))
print("Human test rows :", len(test_humans))

# --------------------------------------------------
# STEP 6: BOT SPLIT (RANDOM ROWS — NO IDENTITY)
# --------------------------------------------------
bot_train, bot_test = train_test_split(
    bot_df,
    test_size=0.2,
    random_state=42,
    shuffle=True
)

print("Bot train rows:", len(bot_train))
print("Bot test rows :", len(bot_test))

# --------------------------------------------------
# STEP 7: COMBINE TRAIN & TEST
# --------------------------------------------------
train_df = pd.concat([train_humans, bot_train], ignore_index=True)
test_df  = pd.concat([test_humans, bot_test], ignore_index=True)

# --------------------------------------------------
# STEP 8: SAVE FILES
# --------------------------------------------------
train_df.to_csv("train.csv", index=False)
test_df.to_csv("test.csv", index=False)

print("\n✅ FINAL SPLIT SUMMARY")
print("Train rows:", len(train_df))
print("Test rows :", len(test_df))
print("\nTrain label distribution:")
print(train_df["label"].value_counts())
print("\nTest label distribution:")
print(test_df["label"].value_counts())
