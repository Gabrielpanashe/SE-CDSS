"""
Seed the SE-CDSS database with realistic prediction history for all 50 EHR patients.

Run once to populate the clinician dashboard with trend data:
    python scripts/seed_patients.py

Each patient gets 3-8 entries spanning the past 90 days, with sentiments and
risk levels that reflect a believable clinical trajectory for their condition.
"""

import json
import os
import random
import sys
from datetime import datetime, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src import config
from src.database.db import SessionLocal, PredictionLog, init_db

RANDOM_SEED = 42
random.seed(RANDOM_SEED)

# Realistic review templates per condition
REVIEWS_BY_CONDITION = {
    "hypertension": [
        ("positive", "My blood pressure is finally under control. Feeling much better with this medication."),
        ("positive", "No side effects at all. My readings have improved significantly since starting."),
        ("neutral",  "Medication seems to be working but I get mild headaches in the morning."),
        ("neutral",  "Blood pressure is okay but not great. Doctor adjusted the dose recently."),
        ("negative", "I stopped taking it because of severe dizziness every time I stood up."),
        ("negative", "Having chest pain and swelling in my ankles. Very concerned about this reaction."),
    ],
    "diabetes": [
        ("positive", "Blood sugar levels are well controlled. This medication has changed my life."),
        ("positive", "Great results with my glucose readings. No significant side effects."),
        ("neutral",  "Works reasonably well but I sometimes feel nauseous after taking it."),
        ("neutral",  "Sugar levels are borderline. Not sure if the dose needs adjusting."),
        ("negative", "Severe stomach pain and I had to go to the hospital after taking this."),
        ("negative", "Stopped taking after an allergic reaction — rash all over my body."),
    ],
    "depression": [
        ("positive", "Feeling so much better after 6 weeks. My mood has improved tremendously."),
        ("positive", "This medication gave me my life back. No major side effects to report."),
        ("neutral",  "It helps somewhat but I still have bad days. Adjustment period continues."),
        ("neutral",  "Some improvement in mood but experiencing insomnia as a side effect."),
        ("negative", "Feeling worse than before. Experiencing severe anxiety and stopped taking it."),
        ("negative", "Had a very bad reaction — difficulty breathing and had to go to emergency."),
    ],
    "malaria": [
        ("positive", "Recovered fully within 5 days. The treatment was very effective."),
        ("positive", "No symptoms after completing the course. Felt much better by day 3."),
        ("neutral",  "Treatment worked but experienced mild nausea and fatigue throughout."),
        ("neutral",  "Took longer than expected to recover. Still feeling weak after 2 weeks."),
        ("negative", "Severe reaction after second dose — vomiting and stopped taking immediately."),
        ("negative", "Had allergic reaction with rash and swelling. Required hospital treatment."),
    ],
    "respiratory": [
        ("positive", "Breathing improved dramatically after starting this. Really effective."),
        ("positive", "Inhaler works great. No more wheezing episodes at night."),
        ("neutral",  "Helps with breathing but causes slight tremors in my hands."),
        ("neutral",  "Some improvement but still getting breathless with light exercise."),
        ("negative", "Difficulty breathing got worse after taking this. Very concerning."),
        ("negative", "Had chest tightness and emergency visit was required after first dose."),
    ],
}

RISK_MAP = {
    "positive": "Mild Concern",
    "neutral":  "Moderate Risk",
    "negative": "Severe Adverse Reaction",
}

CONFIDENCE_RANGES = {
    "positive": (0.72, 0.98),
    "neutral":  (0.55, 0.76),
    "negative": (0.68, 0.92),
}


def seed() -> None:
    init_db()
    db = SessionLocal()

    # clear only seed rows (keep any real user submissions)
    existing = db.query(PredictionLog).filter(PredictionLog.patient_id.like("P-000%")).all()
    if existing:
        print(f"Found {len(existing)} existing seed rows — deleting and re-seeding...")
        for row in existing:
            db.delete(row)
        db.commit()

    ehr_path = config.SIMULATED_EHR_PATH
    with open(ehr_path) as f:
        patients = json.load(f)

    total_inserted = 0
    base_date = datetime.now() - timedelta(days=90)

    for patient in patients:
        pid       = patient["patient_id"]
        condition = patient["condition"]
        drug      = patient.get("current_medications", ["Unknown"])[0]
        reviews   = REVIEWS_BY_CONDITION.get(condition, REVIEWS_BY_CONDITION["hypertension"])

        num_entries = random.randint(3, 8)
        day_offsets = sorted(random.sample(range(1, 90), num_entries))

        for offset in day_offsets:
            review_tuple = random.choice(reviews)
            sentiment, review_text = review_tuple

            # apply keyword escalation for negative reviews mentioning adverse keywords
            risk = RISK_MAP[sentiment]
            adverse_kws = ["emergency", "hospital", "allergic", "stopped taking",
                           "chest pain", "difficulty breathing", "severe", "rash", "swelling"]
            if any(kw in review_text.lower() for kw in adverse_kws):
                risk = "Severe Adverse Reaction"

            conf = round(random.uniform(*CONFIDENCE_RANGES[sentiment]), 4)

            ts = base_date + timedelta(days=offset, hours=random.randint(7, 18),
                                       minutes=random.randint(0, 59))

            record = PredictionLog(
                raw_review=review_text,
                cleaned_review=review_text.lower(),
                sentiment=sentiment,
                confidence=conf,
                risk_level=risk,
                patient_id=pid,
                drug_name=drug,
                condition=condition,
                timestamp=ts,
            )
            db.add(record)
            total_inserted += 1

    db.commit()
    db.close()
    print(f"Seeded {total_inserted} prediction records for {len(patients)} patients.")
    print("All patient IDs from P-00001 to P-00050 now have trend data.")


if __name__ == "__main__":
    seed()
