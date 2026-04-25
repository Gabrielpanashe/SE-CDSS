# SE-CDSS Implementation Plan — Phase E onwards

**Project:** Sentiment-Enhanced Clinical Decision Support System  
**Author:** Panashe (Gabrielpanashe)  
**Supervisor:** Dr. M. Chinyuku  
**Institution:** Chinhoyi University of Technology · BSIT Final Year · 2026  
**Last updated:** 2026-04-25

---

## Current Status Snapshot

| Phase | Module | Status |
|-------|--------|--------|
| A | Data preprocessing (UCI 215,063 reviews) | ✅ Complete |
| B | Baseline model — TF-IDF + Logistic Regression | ✅ Complete |
| C | BioBERT fine-tuning (3 epochs, 40k samples, 108.3M params) | ✅ Complete |
| D1 | Baseline evaluation (accuracy 81.39%, weighted F1 79.09%) | ✅ Complete |
| D2 | Fair model comparison — Table 4.3 H1/H2 results | ✅ Complete |
| D3 | SHAP explainability | ❌ Stub only |
| E | FastAPI routes (feedback, recommend, trends) | ✅ Complete |
| F | Next.js frontend (Home, Patient, Clinician, About, How It Works) | ✅ Complete |
| — | Sentiment label mapping correction | ❌ Pending |
| — | Drug dropdown + condition-first UX | ❌ Pending |
| — | Docker containerization | ❌ Pending |
| — | PostgreSQL migration (via Docker, pgAdmin-compatible) | ❌ Pending |
| — | JWT Authentication (patient + clinician roles) | ❌ Pending |
| — | In-app alert notifications + follow-up reminders | ❌ Pending |
| — | SHAP explainability (H3 evidence) | ❌ Pending |
| — | Periodic retraining (continuous learning) | ❌ Pending |
| — | README + requirements.txt update | ❌ Pending (after each stage) |

---

## BioBERT Training Results — Chapter 4 Reference

### Training Configuration
- **Model:** `dmis-lab/biobert-base-cased-v1.2`
- **Parameters:** 108.3 million
- **Training samples:** 40,000 (stratified from UCI Drug Review corpus)
- **Epochs:** 3 | **Batch size:** 16 | **Learning rate:** 2e-5 (AdamW + linear warmup)
- **Hardware:** CPU-only | **Total training time:** ~24 hours
- **Loss curve:** 0.8371 (epoch 1) → 0.6050 (epoch 2) → 0.4452 (epoch 3)
- **Checkpoints:** `models/biobert_checkpoints/epoch_1/`, `epoch_2/`, `epoch_3/`

### BioBERT Standalone Evaluation (8,000 test samples)

| Class | Precision | Recall | F1-Score | Support |
|-------|-----------|--------|----------|---------|
| NEGATIVE | 0.749 | 0.752 | 0.750 | 1,745 |
| NEUTRAL | 0.352 | 0.517 | 0.419 | 962 |
| POSITIVE | 0.931 | 0.850 | 0.888 | 5,293 |
| **Weighted avg** | **0.821** | **0.789** | **0.802** | 8,000 |
| **Accuracy** | — | — | **78.85%** | 8,000 |

### Fair Comparative Evaluation — Table 4.3 (H1/H2)
Both models trained on identical 40k split. Only variable: model architecture.

| Metric | TF-IDF + LR (Baseline) | BioBERT | Delta |
|--------|------------------------|---------|-------|
| NEGATIVE F1 | 0.805 | 0.720 | −0.085 |
| NEUTRAL F1 | 0.476 | 0.367 | −0.109 |
| POSITIVE F1 | 0.908 | 0.890 | −0.018 |
| **Macro F1** | **0.730** | **0.659** | **−0.070** |
| **Weighted F1** | **0.834** | **0.790** | **−0.043** |
| **Accuracy** | **84.95%** | **79.15%** | **−5.80%** |

**H1** (BioBERT macro F1 ≥ 80%): **NOT MET** — 65.9% achieved on 40k sample  
**H2** (BioBERT macro F1 > Baseline): **NOT MET** — Baseline wins by 7 points on 40k sample

**Dissertation argument:** Both hypotheses are tested honestly. The results indicate that on a 40,000-sample subset, TF-IDF+LR achieves higher raw accuracy — a well-documented phenomenon where transformer models require larger datasets to realise their full potential (Sun et al., 2019). BioBERT's value lies in biomedical language understanding (clinical terminology, drug names, symptom phrasing) that a bag-of-words model misses. The weak NEUTRAL class (F1 < 0.48 for both models) reflects the inherent ambiguity of mid-range ratings in patient-reported outcomes — a known challenge in clinical NLP. With the full 172k training corpus, BioBERT is expected to close the gap and demonstrate its contextual advantage.

---

## Implementation Modules — Ordered Execution Plan

Each module follows: **Implement → Test → Confirm results → Push to GitHub → Next**

---

### Module 1 — Sentiment Label Mapping Correction

**Priority:** High (foundational — affects retraining and documentation)  
**Effort:** 30 minutes  
**File:** `src/preprocessing/preprocess.py`

**Problem:** Current mapping bins rating 4 as NEUTRAL. Rating 4 on a 10-point scale represents dissatisfaction and should be NEGATIVE.

**Correct mapping (3 clean classes):**
```
1, 2, 3, 4  → NEGATIVE
5, 6        → NEUTRAL  
7, 8, 9, 10 → POSITIVE
```

**Change:** In `assign_sentiment_label()`, change threshold from `>= 4` to `>= 5` for NEUTRAL.

**Impact:** Affects future preprocessing runs and the next retraining cycle. Does not invalidate the current trained models — they were trained on the previous mapping and their results stand as documented. The correction applies from this point forward.

**Test:** Run preprocessing on a small sample CSV and verify label distribution.

**Documentation note:** Record old and new mapping in Chapter 4, Section 4.x (Data Labelling Strategy). The boundary adjustment is justified by clinical reasoning: a patient rating a drug 4/10 is expressing dissatisfaction, not neutrality.

---

### Module 2 — Drug Dropdown + Condition-First UX

**Priority:** High (directly improves patient usability, important for Chapter 4 UI design section)  
**Effort:** 2–3 hours  
**Files:** `frontend-next/app/patient/page.tsx`

**Current state:** Patient manually types condition and drug name — error-prone and unrealistic for a deployed health system.

**New flow:**
1. Patient selects **Condition** from dropdown (5 options: hypertension, diabetes, depression, malaria, respiratory)
2. Patient writes **Review text** (1,000 char max, existing validation)
3. **Drug Name** dropdown auto-populates with the 5 drugs for the selected condition
4. After sentiment analysis, recommendations are pre-ranked for that condition + sentiment
5. Patient ID auto-validated with `P-XXXXX` format

**Backend:** No changes needed. `DRUG_MAP` in `src/config.py` already has the condition→drugs mapping. The frontend will use a static copy of this map.

**API change (minor):** The `/api/feedback` POST already accepts `condition` and `drug_name` — fields will now be populated from validated dropdowns instead of free text.

**Test:** Submit a review for each condition, verify correct drug list populates, verify API receives correct values.

**Diagram needed:** UI input design mockup (annotated screenshot or draw.io wireframe) for Chapter 4 Input Design section.

---

### Module 3 — Docker Containerisation + PostgreSQL

**Priority:** High (required for professional deployment, Chapter 4 deployment section)  
**Effort:** 3–4 hours  
**New files:** `Dockerfile`, `frontend-next/Dockerfile`, `docker-compose.yml`, `.env.example` update

#### Architecture

```
docker-compose up
├── service: api          (FastAPI, port 8000)
├── service: frontend     (Next.js, port 3000)
└── service: db           (PostgreSQL 15, port 5432)
```

The PostgreSQL service exposes port 5432 to localhost, making it directly connectable from pgAdmin on the host machine.

#### pgAdmin Connection Settings (after `docker-compose up`)
```
Host:     localhost
Port:     5432
Database: se_cdss
Username: se_cdss_user
Password: (set in docker-compose.yml)
```

#### Files to create

**`Dockerfile`** (FastAPI):
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**`frontend-next/Dockerfile`** (Next.js):
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
CMD ["node", "server.js"]
```

**`docker-compose.yml`**:
```yaml
version: "3.9"
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: se_cdss
      POSTGRES_USER: se_cdss_user
      POSTGRES_PASSWORD: se_cdss_pass
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U se_cdss_user -d se_cdss"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://se_cdss_user:se_cdss_pass@db:5432/se_cdss
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./models:/app/models
      - ./data:/app/data

  frontend:
    build: ./frontend-next
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    depends_on:
      - api

volumes:
  pgdata:
```

**Key decisions:**
- `healthcheck` on db ensures API only starts after PostgreSQL is ready — prevents startup race condition
- `volumes: pgdata` persists database data across container restarts
- Models and data are mounted as volumes so they don't need to be inside the container image (keeps image small)
- Port 5432 is exposed to host so pgAdmin connects directly

**`.env` update:**
```
DATABASE_URL=postgresql://se_cdss_user:se_cdss_pass@db:5432/se_cdss
```

**For local development (without Docker):**
```
DATABASE_URL=postgresql://se_cdss_user:se_cdss_pass@localhost:5432/se_cdss
```

**Schema creation:** `init_db()` in `api/main.py` lifespan already calls `Base.metadata.create_all()` — this will auto-create all tables in PostgreSQL on first startup. No Alembic needed at this stage.

**Test:** `docker-compose up --build` → verify all 3 services healthy → connect pgAdmin to localhost:5432 → confirm tables created → POST to `/api/feedback` → verify row appears in pgAdmin.

**dependencies to add:** `psycopg2-binary` to `requirements.txt`

---

### Module 4 — JWT Authentication

**Priority:** High (health system security, Chapter 4 security design section)  
**Effort:** 4–6 hours  
**New files:** `api/routes/auth.py`, `src/database/users.py`, `frontend-next/app/login/page.tsx`, `frontend-next/app/register/page.tsx`, `frontend-next/lib/auth.ts`

#### Design

Two roles: `patient` and `clinician`

**Flow:**
1. User registers with email, password, and role selection
2. Password is hashed with `bcrypt` before storage — never stored in plain text
3. On login, server verifies password hash and returns a signed JWT token (24-hour expiry)
4. Frontend stores token in `localStorage` and sends it as `Authorization: Bearer <token>` header
5. Protected API routes verify the token and check role before responding

#### New database table: `users`
```
id          (integer, primary key)
email       (string, unique, indexed)
password    (string — bcrypt hash)
role        (enum: "patient" | "clinician")
patient_id  (string, nullable — links to EHR if role=patient, e.g. "P-00001")
created_at  (datetime)
```

#### New API routes (`api/routes/auth.py`)
```
POST /auth/register   → { email, password, role, patient_id? } → { message }
POST /auth/login      → { email, password } → { access_token, token_type, role }
GET  /auth/me         → (requires token) → { email, role, patient_id }
```

#### Route protection
```
/api/feedback       → requires: authenticated (any role)
/api/recommend      → requires: role = clinician
/api/trends/{id}    → requires: authenticated; patients can only view their own
/admin/retrain      → requires: role = clinician
```

#### Frontend changes
- `/login` page: email + password form → calls `/auth/login` → stores token → redirects
- `/register` page: email + password + role + optional patient_id form
- `Sidebar.tsx`: Show logged-in user name and role; logout button
- `patient/page.tsx`: Patient ID auto-filled from JWT `patient_id` claim (not manually entered)
- `clinician/page.tsx`: Redirect to login if token missing or role ≠ clinician
- `lib/auth.ts`: Helper functions — `getToken()`, `getRole()`, `logout()`, `isAuthenticated()`

#### New dependencies
```
python-jose[cryptography]    # JWT creation and verification
passlib[bcrypt]              # Password hashing
python-multipart             # Form data parsing
```

**Security diagram needed:** Authentication flow diagram (sequence diagram) for Chapter 4 Security Design section. Shows: register → login → token issued → protected request → token verified → response.

**Test:** Register patient + clinician accounts → login as each → verify role-based access → verify patient cannot access `/api/recommend` → verify clinician can.

---

### Module 5 — In-App Alert Notifications + Follow-Up Reminders

**Priority:** Medium (demonstrates end-to-end clinical workflow)  
**Effort:** 4–5 hours  
**New files:** `api/routes/notifications.py`, `src/database/notifications.py`, frontend notification components

#### Concept
```
Patient submits review → notification created for all clinicians
Clinician views notification → marks as reviewed → sends recommendation back
System sets a follow-up reminder for patient (configurable days)
Patient logs in after X days → sees follow-up prompt → submits updated review
```

#### New database table: `notifications`
```
id              (integer, primary key)
type            (enum: "new_review" | "clinician_response" | "followup_reminder")
from_user_id    (integer, FK → users)
to_user_id      (integer, FK → users, nullable — null = broadcast to all clinicians)
prediction_log_id (integer, FK → prediction_logs, nullable)
message         (text)
is_read         (boolean, default false)
created_at      (datetime)
followup_due_at (datetime, nullable — set for followup_reminder type)
```

#### New API routes (`api/routes/notifications.py`)
```
GET  /notifications           → (authenticated) list my unread notifications
POST /notifications/{id}/read → mark notification as read
POST /notifications/respond   → clinician sends response to patient (creates clinician_response notification)
```

#### Follow-up reminder logic
- When a `prediction_log` is created, also insert a `notifications` row with `type="followup_reminder"` and `followup_due_at = now + 7 days`
- On patient login, API checks for any `followup_due_at <= now` and `is_read=false` → returns prompt

#### Frontend changes
- `Sidebar.tsx`: Notification bell icon with unread count badge
- `clinician/page.tsx`: Notification panel showing new patient reviews
- `patient/page.tsx`: Banner if follow-up reminder is due

**Test:** Submit review as patient → login as clinician → verify notification appears → mark read → verify patient gets response notification → verify follow-up due date is set in DB.

---

### Module 6 — SHAP Explainability (H3 Evidence)

**Priority:** Medium (proves H3: explainability of model predictions)  
**Effort:** 3–4 hours  
**Files:** `src/explainability/shap_explainer.py`, `api/routes/feedback.py` (add explanation field)

#### What SHAP does
SHAP (SHapley Additive exPlanations) identifies which words in a review contributed most to the sentiment prediction. This provides clinical explainability — a clinician can see *why* the model flagged a review as high risk.

#### Implementation approach
- Use `shap.Explainer` with the baseline TF-IDF+LR model (faster than BERT SHAP)
- For BioBERT: use `shap.Explainer` with `transformers` pipeline (slower, optional)
- Return top 5 positive contributors and top 5 negative contributors as word lists
- Include in `/api/feedback` response as `explanation: { top_positive: [...], top_negative: [...] }`

#### Frontend changes
- `patient/page.tsx`: Show explanation section after prediction — "Words that influenced this result"
- Highlight contributing words visually (teal = positive influence, red = negative)

**Test:** Submit review with known adverse keywords → verify SHAP highlights those words → verify explanation appears in API response.

---

### Module 7 — Periodic Retraining (Continuous Learning)

**Priority:** Medium (proves system learns from real usage)  
**Effort:** 3–4 hours  
**New files:** `scripts/retrain_trigger.py`, `api/routes/admin.py`

#### Design
True real-time weight updates (online learning) are research-level complexity. The adopted approach is **periodic batch retraining** — the industry standard for production ML systems.

#### Mechanism
1. Every new review submitted via `/api/feedback` is stored in `prediction_logs` (already happening)
2. When the accumulated new reviews count crosses a threshold (default: 500), a retraining flag is set in a `system_config` table
3. A `POST /admin/retrain` endpoint (clinician role only) triggers retraining:
   - Exports all `prediction_logs` reviews + labels to a new training CSV
   - Merges with original training data
   - Retrains TF-IDF+LR baseline (fast, < 5 minutes)
   - Optionally fine-tunes BioBERT from `epoch_3` checkpoint (slow, background job)
   - Saves new model artifacts and records `last_retrained` timestamp
4. Frontend shows "Last retrained: X days ago" and "New reviews since last retrain: N" on the About/clinician pages

#### New database table: `system_config`
```
key    (string, primary key)
value  (text)
```
Stores: `last_retrained_at`, `reviews_since_last_retrain`, `retrain_threshold`

#### New API routes
```
GET  /admin/status   → { last_retrained_at, reviews_since_retrain, retrain_threshold, needs_retrain: bool }
POST /admin/retrain  → (clinician only) triggers retraining job → { status, message }
```

**Test:** Insert 5 fake reviews → call `/admin/retrain` → verify new model files saved → verify `last_retrained_at` updated in DB → verify API uses new model on next prediction.

---

### Module 8 — README + requirements.txt Update

**Priority:** After each module  
**Files:** `README.md`, `requirements.txt`

#### README sections to update
- Stack (add PostgreSQL, Docker, JWT, SHAP)
- Architecture diagram reference
- Docker quickstart: `docker-compose up --build`
- Development setup with venv (keep existing venv instructions)
- New API endpoints (auth, notifications, admin)
- pgAdmin connection guide
- Environment variables table

#### requirements.txt additions (cumulative)
```
psycopg2-binary       # PostgreSQL adapter
python-jose[cryptography]  # JWT
passlib[bcrypt]       # Password hashing
python-multipart      # Form parsing for auth
shap                  # Explainability (already present — verify)
```

---

## Chapter 4 Documentation Reference

### Diagrams Required

| Diagram | Type | Purpose | Tool |
|---------|------|---------|------|
| System Architecture | Block diagram | Overall component view | draw.io (exists) |
| Implementation Flow | Flowchart | 9-phase development | draw.io (exists) |
| Data Flow (DFD L0) | DFD | Context diagram — external entities | draw.io (new) |
| Data Flow (DFD L1) | DFD | Internal process decomposition | draw.io (new) |
| Database ERD | ER diagram | All tables + relationships | draw.io (exists) |
| Authentication Flow | Sequence diagram | Register/login/token/protect | draw.io (new) |
| Notification Flow | Sequence diagram | Review → notify → respond → remind | draw.io (new) |
| Retraining Flow | Flowchart | Trigger → export → train → deploy | draw.io (new) |
| Input Design | UI wireframe | Patient and Clinician page annotated | Screenshots + draw.io |

### Key Metrics for Chapter 4

| Metric | Value | Source |
|--------|-------|--------|
| Training samples | 40,000 | `train_biobert.py` |
| Full dataset size | 215,063 reviews | UCI Drug Review corpus |
| BioBERT parameters | 108.3 million | Model card |
| BioBERT accuracy | 78.85% | `biobert_metrics.csv` |
| BioBERT weighted F1 | 0.802 | `biobert_metrics.csv` |
| Baseline accuracy (full data) | 81.39% | `baseline_metrics.csv` |
| Baseline accuracy (fair, 40k) | 84.95% | `model_comparison.csv` |
| Conditions covered | 5 | `config.py` |
| Drugs covered | 25 | `config.py` |
| Simulated patients | 50 | `patients.json` |
| Training time (CPU) | ~24 hours | `train_biobert_log.txt` |

### Why 50 Simulated Patients — Documentation Statement
The 50-patient EHR cohort is a controlled simulation designed to demonstrate the system's personalisation layer, not to substitute for real clinical data. The distribution (10 patients per condition × 5 conditions) provides sufficient variation to validate condition-specific drug ranking, allergy-aware filtering, and patient-history integration. The core sentiment intelligence is derived from 215,063 real drug reviews. In a production deployment, this module would interface with an institutional EHR system via HL7 FHIR standards.

---

## Execution Order

```
[1] Sentiment label mapping fix         ~30 min   → test → push
[2] Drug dropdown + condition-first UX  ~3 hrs    → test → push
[3] Docker + PostgreSQL (+ pgAdmin)     ~4 hrs    → test → push
[4] JWT Authentication                  ~6 hrs    → test → push
[5] In-app notifications + reminders    ~5 hrs    → test → push
[6] SHAP explainability                 ~4 hrs    → test → push
[7] Periodic retraining endpoint        ~4 hrs    → test → push
[8] README + requirements.txt           ongoing   → push after each module
```

**Total estimated effort:** ~27 hours across modules

---

## Notes for Future Reference

- BioBERT final weights are in `models/biobert_checkpoints/epoch_3/` — copy to `models/biobert_sentiment/` before Docker build so the API can load them
- The `se_cdss.db` SQLite file will be replaced by PostgreSQL; keep it for local fallback during transition
- All API responses already include the mandatory disclaimer — do not remove it
- Never commit real patient data, `.env` files, or model `.safetensors` weights to GitHub
- venv must be activated before any `pip install` or `python` command: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
- The `NEXT_PUBLIC_API_URL` env var must be set for the frontend to reach the API in Docker
