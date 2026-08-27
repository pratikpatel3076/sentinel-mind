import sys
import os
import tempfile
import numpy as np
import cv2
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from detection.pipeline import get_face_stress, get_voice_stress, fuse_scores

client = MongoClient("mongodb://localhost:27017")
db = client["sentinelmind"]
scores_col = db["scores"]
students_col = db["students"]

app = FastAPI(title="SentinelMind API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze/{student_id}")
async def analyze_student(student_id: str, frame: UploadFile = File(...), audio: UploadFile = File(...)):
    try:
        frame_bytes = await frame.read()
        np_arr = np.frombuffer(frame_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        face_score = get_face_stress(img)

        audio_bytes = await audio.read()
        suffix = ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(audio_bytes)
            tmp_path = tmp.name
        try:
            voice_score = get_voice_stress(tmp_path)
        finally:
            os.unlink(tmp_path)

        stress_index = fuse_scores(face_score, voice_score)
        alert = stress_index > 70
        now = datetime.utcnow()

        scores_col.insert_one({
            "student_id": student_id,
            "stress_index": stress_index,
            "timestamp": now,
            "alert": alert,
        })

        students_col.update_one(
            {"student_id": student_id},
            {"$set": {
                "student_id": student_id,
                "name": f"Student {student_id}",
                "latest_score": stress_index,
                "alert": alert,
                "last_updated": now,
            }},
            upsert=True,
        )

        return {
            "student_id": student_id,
            "stress_index": stress_index,
            "alert": alert,
            "timestamp": now.isoformat(),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/students")
async def get_students():
    try:
        docs = students_col.find().sort([("alert", -1), ("latest_score", -1)])
        result = []
        for doc in docs:
            doc.pop("_id", None)
            result.append(doc)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history/{student_id}")
async def get_history(student_id: str):
    try:
        docs = scores_col.find({"student_id": student_id}).sort("timestamp", -1).limit(20)
        result = []
        for doc in docs:
            result.append({
                "stress_index": doc["stress_index"],
                "timestamp": doc["timestamp"].isoformat(),
                "alert": doc["alert"],
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}
