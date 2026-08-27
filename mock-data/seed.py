import random
import pymongo
from datetime import datetime, timedelta


def seed():
    client = pymongo.MongoClient("mongodb://localhost:27017")
    db = client["sentinelmind"]

    db.scores.drop()
    db.students.drop()

    students = [
        ("S001", "Arjun Mehta"),
        ("S002", "Priya Sharma"),
        ("S003", "Rahul Verma"),
        ("S004", "Sneha Patel"),
        ("S005", "Vikram Singh"),
        ("S006", "Ananya Gupta"),
        ("S007", "Rohit Nair"),
        ("S008", "Kavya Iyer"),
    ]

    now = datetime.utcnow()
    scores_docs = []
    student_data = []

    for sid, name in students:
        if sid in ("S001", "S002"):
            low, high = 65, 90
        elif sid in ("S003", "S004"):
            low, high = 35, 65
        else:
            low, high = 10, 40

        latest_score = None
        latest_alert = False
        latest_ts = None
        for i in range(30):
            ts = now - timedelta(days=7) + timedelta(hours=i * 5 + random.randint(0, 4))
            score = random.randint(low, high)
            alert = score > 70
            scores_docs.append({
                "student_id": sid,
                "stress_index": score,
                "timestamp": ts,
                "alert": alert,
            })
            if latest_ts is None or ts > latest_ts:
                latest_score = score
                latest_alert = alert
                latest_ts = ts

        student_data.append({
            "student_id": sid,
            "name": name,
            "latest_score": latest_score,
            "alert": latest_alert,
            "last_updated": latest_ts,
        })

    db.scores.insert_many(scores_docs)
    for s in student_data:
        db.students.insert_one(s)

    print(f"Seeded {len(scores_docs)} score documents for {len(student_data)} students")


if __name__ == "__main__":
    seed()
