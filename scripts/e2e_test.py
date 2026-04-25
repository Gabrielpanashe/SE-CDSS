"""End-to-end test script — runs all API checks against a live server."""

import subprocess, sys, time, requests, os

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

proc = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8005", "--log-level", "error"],
    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
)

print("Waiting for server (BioBERT loads in ~10s)...")
for i in range(50):
    time.sleep(1)
    try:
        r = requests.get("http://localhost:8005/health", timeout=2)
        if r.status_code == 200:
            print("Server ready after {}s. BioBERT={}".format(i + 1, r.json().get("biobert_loaded")))
            break
    except Exception:
        pass
else:
    print("Server did not start!")
    proc.terminate()
    sys.exit(1)

BASE = "http://localhost:8005"
PASS = "TestE2E123!"
results = []

def ok(label, cond, detail=""):
    status = "PASS" if cond else "FAIL"
    results.append((status, label, detail))
    print("[{}] {}{}".format(status, label, "  -- " + str(detail) if detail else ""))

def jget(r):
    try:
        return r.json()
    except Exception:
        return {}

# 1. Health
r = requests.get(BASE + "/health", timeout=10)
j = jget(r)
ok("1.  Health check", r.status_code == 200 and j.get("status") == "ok",
   "BioBERT={} baseline={}".format(j.get("biobert_loaded"), j.get("baseline_loaded")))

# 2-3. Register
r = requests.post(BASE + "/auth/register",
    json={"email": "pat@e2e.test", "password": PASS, "role": "patient", "patient_id": "P-00001"}, timeout=10)
ok("2.  Register patient", r.status_code in (201, 409), "status=" + str(r.status_code))

r = requests.post(BASE + "/auth/register",
    json={"email": "doc@e2e.test", "password": PASS, "role": "clinician"}, timeout=10)
ok("3.  Register clinician", r.status_code in (201, 409), "status=" + str(r.status_code))

# 4-5. Login
r = requests.post(BASE + "/auth/login", json={"email": "pat@e2e.test", "password": PASS}, timeout=10)
ok("4.  Login (patient)", r.status_code == 200, "role=" + str(jget(r).get("role")))
ph = {"Authorization": "Bearer " + jget(r).get("access_token", "")}

r = requests.post(BASE + "/auth/login", json={"email": "doc@e2e.test", "password": PASS}, timeout=10)
ok("5.  Login (clinician)", r.status_code == 200, "role=" + str(jget(r).get("role")))
ch = {"Authorization": "Bearer " + jget(r).get("access_token", "")}

# 6. /auth/me
r = requests.get(BASE + "/auth/me", headers=ph, timeout=10)
j = jget(r)
ok("6.  GET /auth/me", r.status_code == 200,
   "email={} patient_id={}".format(j.get("email"), j.get("patient_id")))

# 7. Unauthenticated
r = requests.post(BASE + "/api/feedback", json={"review": "test"}, timeout=10)
ok("7.  Feedback blocked without token (401)", r.status_code == 401)

# 8-9. BioBERT + SHAP
r = requests.post(BASE + "/api/feedback", headers=ph, timeout=90, json={
    "review": "Amlodipine has really helped my blood pressure with no serious side effects over 3 months.",
    "patient_id": "P-00001", "drug_name": "Amlodipine", "condition": "hypertension"
})
j = jget(r)
ok("8.  Submit review — BioBERT live", r.status_code == 200,
   "sentiment={} conf={:.4f} risk={}".format(j.get("sentiment"), j.get("confidence", 0), j.get("risk_level")))
ok("9.  SHAP explanation populated", bool(j.get("explanation")), str(j.get("explanation", ""))[:90])

# 10. Adverse keyword escalation
r = requests.post(BASE + "/api/feedback", headers=ph, timeout=90, json={
    "review": "Severe allergic reaction with chest pain and difficulty breathing — stopped immediately.",
    "patient_id": "P-00001", "drug_name": "Losartan", "condition": "hypertension"
})
j = jget(r)
ok("10. Adverse keyword -> Severe Adverse Reaction", "Severe" in j.get("risk_level", ""),
   "risk=" + j.get("risk_level", "?"))

# 11-14. Recommendations
r = requests.get(BASE + "/api/recommend", headers=ph, timeout=10,
    params={"condition": "hypertension", "patient_id": "P-00001", "sentiment": "positive"})
ok("11. Recommend denied for patient (403)", r.status_code == 403)

r = requests.get(BASE + "/api/recommend", headers=ch, timeout=10,
    params={"condition": "hypertension", "patient_id": "P-00001", "sentiment": "positive"})
j = jget(r)
recs = j.get("recommendations", [])
ok("12. Recommendations returned for clinician", r.status_code == 200 and len(recs) > 0,
   "{} drugs".format(len(recs)))
if recs:
    ok("13. Results ranked by composite score",
       recs[0]["recommendation_score"] >= recs[-1]["recommendation_score"],
       "top={} score={}".format(recs[0]["drug"], recs[0]["recommendation_score"]))
    ok("14. All score components present",
       all(k in recs[0] for k in ["guideline_score", "ehr_score", "sentiment_score"]))

# 15-17. Trends
r = requests.get(BASE + "/api/trends/P-00001", headers=ch, timeout=10)
j = jget(r)
ok("15. Trends: clinician accesses any patient", r.status_code == 200,
   str(j.get("total_entries")) + " entries")

r = requests.get(BASE + "/api/trends/P-00001", headers=ph, timeout=10)
ok("16. Trends: patient sees own data", r.status_code == 200)

r = requests.get(BASE + "/api/trends/P-00099", headers=ph, timeout=10)
ok("17. Trends: patient denied other patient (403)", r.status_code == 403)

# 18-20. Notifications
r = requests.get(BASE + "/notifications", headers=ch, timeout=10)
j = jget(r)
ok("18. Clinician sees new_review broadcasts", r.status_code == 200, str(len(j)) + " unread")
if j:
    r2 = requests.post(BASE + "/notifications/" + str(j[0]["id"]) + "/read", headers=ch, timeout=10)
    ok("19. Mark notification read (200)", r2.status_code == 200)

r = requests.get(BASE + "/notifications", headers=ph, timeout=10)
j = jget(r)
ok("20. Patient sees followup reminders", r.status_code == 200, str(len(j)) + " unread")

# 21-22. Admin
r = requests.get(BASE + "/admin/status", headers=ch, timeout=10)
j = jget(r)
ok("21. Admin status: clinician", r.status_code == 200,
   "reviews_since={} needs_retrain={}".format(j.get("reviews_since_retrain"), j.get("needs_retrain")))

r = requests.get(BASE + "/admin/status", headers=ph, timeout=10)
ok("22. Admin status denied for patient (403)", r.status_code == 403)

# 23-25. Validation
r = requests.post(BASE + "/auth/login", json={"email": "nobody@x.com", "password": "wrong"}, timeout=10)
ok("23. Login rejects bad credentials (401)", r.status_code == 401)

r = requests.get(BASE + "/api/recommend", headers=ch, timeout=10,
    params={"condition": "cancer", "patient_id": "P-00001", "sentiment": "positive"})
ok("24. Recommend rejects unknown condition (400)", r.status_code == 400)

r = requests.get(BASE + "/api/recommend", headers=ch, timeout=10,
    params={"condition": "hypertension", "patient_id": "P-00001", "sentiment": "excellent"})
ok("25. Recommend rejects invalid sentiment (400)", r.status_code == 400)

# Summary
print("")
passed = sum(1 for s, l, d in results if s == "PASS")
failed = sum(1 for s, l, d in results if s == "FAIL")
sep = "=" * 60
print(sep)
print("RESULTS: {} PASS  /  {} FAIL  /  {} total".format(passed, failed, len(results)))
print(sep)
if failed:
    print("FAILURES:")
    for s, l, d in results:
        if s == "FAIL":
            print("  FAIL: {}  [{}]".format(l, d))

proc.terminate()
proc.wait()
print("Server stopped.")
