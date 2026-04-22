BotShield — AI-Powered Bot Detection for UIDAI
OVERVIEW:-
BotShield is an AI/ML based bot detection system built for UIDAI's Aadhaar portals. It replaces the traditional CAPTCHA method with a seamless, invisible detection system that identifies bots based on user behavior and environment data — without interrupting the user experience.
Problem Statement
CAPTCHAs create friction for real users and are increasingly being bypassed by bots. UIDAI's Aadhaar portals needed a smarter, privacy-friendly solution that could detect bots accurately while keeping the experience smooth for genuine users and protecting the system from DoS attacks.

TECH STACK:-
Python — backend and ML model
JavaScript — frontend data collection
Scikit-learn — model training and evaluation
Flask / FastAPI — backend API
Pandas & NumPy — data processing
HTML/CSS — frontend components

APPROACH:-
Frontend Data Collection — captured minimal user interaction signals like mouse movement, keypress patterns, scroll behavior and device environment data silently using JavaScript
Data Preprocessing — cleaned and structured the collected behavioral data for model input
Model Training — trained a flexible ML classifier to distinguish human users from bots based on behavioral features
Bot Detection API — built a backend API to receive frontend signals and return a real-time human/bot decision
Security & Privacy — designed the entire pipeline with minimal data collection and no storage of personal information

Results

Successfully replaced CAPTCHA with an invisible and seamless bot detection flow
ML model accurately classifies bots based on behavioral signals
System protects Aadhaar portals from DoS attacks without affecting real user experience
