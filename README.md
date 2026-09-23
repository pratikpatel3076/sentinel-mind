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

Note: all Python dependencies — including FastAPI, Uvicorn, and PyMongo for the API layer — are declared together in `detection/requirements.txt`.

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

## API Endpoints

| Method | Endpoint              | Description                                          |
| ------ | --------------------- | ---------------------------------------------------- |
| POST   | `/analyze/{student_id}` | Upload an image frame and audio clip; returns stress index (0–100) with alert flag |
| GET    | `/students`           | List students sorted by alert status and latest score |
| GET    | `/history/{student_id}` | Last 20 stress readings for a student                |
| GET    | `/health`             | Health check                                         |

## Privacy

No raw video, audio, or identifiable biometric data is stored. Only numerical inference scores are persisted in the database.