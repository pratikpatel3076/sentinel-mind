# SentinelMind

Real-time multimodal stress detection system for Indian college campuses. Analyzes facial expressions and voice tone via webcam/microphone to generate a stress index (0–100) per student. No raw video or audio is ever stored — only inference scores.

## Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB running on localhost:27017

## Backend Setup

```bash
cd detection
pip install -r requirements.txt
cd ..
uvicorn api.main:app --reload --port 8000
```

## Frontend Setup

```bash
cd dashboard
npm install
npm start
```

## Seed Mock Data

```bash
python mock-data/seed.py
```

## Usage

1. Open http://localhost:3000
2. Select a student from the sidebar
3. Click **Start Monitoring** to begin 10-second analysis cycles
4. View live stress scores, trend charts, and alert indicators

## Privacy

No raw video, audio, or identifiable biometric data is stored. Only numerical inference scores are persisted in the database.