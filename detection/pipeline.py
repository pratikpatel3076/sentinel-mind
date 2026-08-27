import numpy as np
import librosa
import os
import cv2

face_cascade = None

def _get_face_cascade():
    global face_cascade
    if face_cascade is None:
        path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        face_cascade = cv2.CascadeClassifier(path)
    return face_cascade

def get_face_stress(frame):
    try:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        cascade = _get_face_cascade()
        faces = cascade.detectMultiScale(gray, 1.1, 5, minSize=(50, 50))
        if len(faces) == 0:
            return 0.5
        x, y, w, h = faces[0]
        face_roi = gray[y:y+h, x:x+w]
        laplacian_var = cv2.Laplacian(face_roi, cv2.CV_64F).var()
        laplacian_score = min(laplacian_var / 500, 1.0)
        hist = cv2.calcHist([face_roi], [0], None, [256], [0, 256])
        hist = hist / hist.sum()
        hist_entropy = -np.sum(hist * np.log2(hist + 1e-10))
        entropy_score = min(hist_entropy / 6.0, 1.0)
        edges = cv2.Canny(face_roi, 50, 150)
        edge_density = np.sum(edges > 0) / (w * h)
        edge_score = min(edge_density * 5, 1.0)
        face_score = (laplacian_score * 0.4) + (entropy_score * 0.3) + (edge_score * 0.3)
        return max(0.0, min(1.0, face_score))
    except Exception:
        return 0.5

def get_voice_stress(audio_path):
    try:
        y, sr = librosa.load(audio_path, sr=22050)
        rms = librosa.feature.rms(y=y)
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
        zcr = librosa.feature.zero_crossing_rate(y=y)
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        energy_score = min(float(np.mean(rms)) * 200, 1.0)
        centroid_score = min(float(np.mean(spectral_centroid)) / 8000, 1.0)
        zcr_score = min(float(np.mean(zcr)) * 10, 1.0)
        tempo_deviation = abs(float(tempo) - 80) / 80
        tempo_score = min(tempo_deviation, 1.0)
        voice_stress = (energy_score * 0.4) + (centroid_score * 0.2) + (zcr_score * 0.2) + (tempo_score * 0.2)
        return max(0.0, min(1.0, voice_stress))
    except Exception:
        return 0.5

def fuse_scores(face, voice, text=0.5):
    fused = (face * 0.55) + (voice * 0.30) + (text * 0.15)
    return max(0, min(100, round(fused * 100)))
