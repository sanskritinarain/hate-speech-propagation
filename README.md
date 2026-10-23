# Hate Speech Propagation Prediction System

A research-oriented, full-stack machine learning system that **proactively forecasts** downstream toxicity escalation and reply-cascade growth in online discussion threads, using only early engagement signals.

**Live demo (frontend):** [frontend-seven-navy-16.vercel.app](https://frontend-seven-navy-16.vercel.app)

![Python](https://img.shields.io/badge/Python-3.10--3.13-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?logo=scikitlearn&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Research Background](#2-research-background)
3. [Key Features](#3-key-features)
4. [System Architecture](#4-system-architecture)
5. [Tech Stack](#5-tech-stack)
6. [Directory Structure](#6-directory-structure)
7. [Prediction Task & Methodology](#7-prediction-task--methodology)
8. [Evaluation Results](#8-evaluation-results)
9. [Getting Started](#9-getting-started)
10. [Retraining the Models](#10-retraining-the-models)
11. [API Reference](#11-api-reference)
12. [Deployment](#12-deployment)
13. [Limitations](#13-limitations)
14. [Responsible Use & Ethical Governance](#14-responsible-use--ethical-governance)
15. [References](#15-references)

---

## 1. Overview

Most toxicity-detection tools are **reactive**: they score a single post *after* it has been submitted. This project is **proactive**. Given a discussion's root post and a short early observation window (the first ~15 replies, or the first ~20–30 minutes), it predicts:

- **Will the thread escalate into severe toxicity?** (binary classification with a probability and risk tier)
- **How large will the cascade become?** (regression on post-cutoff reply volume, with a confidence interval)

The output is meant to help human moderators prioritise review queues, not to remove content automatically.

## 2. Research Background

The system is grounded in two published research frameworks:

- **DRAGNET & DRAGNET++**: *"Predicting Hate Intensity of Twitter Conversation Threads"*, Meng et al., *Knowledge-Based Systems*, 2023. Source of the benchmark dataset (2,157 conversation threads, LCS2 IIIT-Delhi).
- **HEAR Framework**: *"Early Prediction of Hate Speech Propagation"*, Lin et al., *IEEE International Conference on Data Mining Workshops (ICDMW)*.

## 3. Key Features

- Early-signal prediction of **future hate escalation risk** (LOW / MEDIUM / HIGH with probability)
- **Cascade volume forecast** with a confidence interval and a reach tier (e.g. *Moderate Cascade, 60–180 replies*)
- **Interactive dashboard** with cumulative cascade and toxicity curves (Recharts)
- **Diagnostic factor cards** explaining which features drove a prediction
- **Preset scenarios**: *Severe Xenophobic Escalation*, *Subtle Dogwhistle*, *Benign Civic Policy Discussion*
- **Leakage-resistant evaluation**: splits grouped strictly by `thread_id`
- **Transparent mode flag**: the UI visibly marks illustrative *demo mode* if trained model weights are absent, versus verified *real model inference*
- **Responsible-use modal** and methodology section built into the UI
- Typed request/response validation (Pydantic v2) and a backend test suite (10 tests)

## 4. System Architecture

```text
[ Web Browser User ]
        │
        ▼
[ Frontend: Next.js 14 + TypeScript ]            (Port 3000)
  • App Router & Tailwind CSS
  • Interactive Recharts curves
  • Preset selector & diagnostic factor cards
        │
        │  HTTP / REST (JSON)
        ▼
[ Backend: Python & FastAPI ]                    (Port 8001)
  • Pydantic request & response validation
  • CORS middleware
  • Feature engineering & temporal velocity calculator
        │
        ▼
[ ML Engine: scikit-learn pipelines ]
  • HistGradientBoostingClassifier  → future hate escalation risk
  • HistGradientBoostingRegressor   → post-cutoff reply volume
  • Thread-grouped, leakage-resistant validation
```

## 5. Tech Stack

| Layer | Technologies |
| :--- | :--- |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts |
| Backend | Python, FastAPI, Uvicorn, Pydantic v2 |
| ML | scikit-learn (HistGradientBoosting, Logistic Regression, Ridge), joblib |
| Testing | pytest |
| Hosting | Vercel (frontend) |

## 6. Directory Structure

```text
hate-speech-propagation/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI entry point & CORS configuration
│   │   ├── api/routes.py           # /health, /model-info, /predict, /sample-presets
│   │   ├── core/config.py          # Pydantic v2 application settings
│   │   ├── ml/
│   │   │   ├── preprocessor.py     # Feature extraction & velocity computation
│   │   │   └── predictor.py        # Model loading, inference & confidence intervals
│   │   └── schemas/prediction.py   # Pydantic validation schemas
│   ├── data/                       # Processed thread samples (raw data git-ignored)
│   ├── models/
│   │   ├── classifier_pipeline.joblib   # Trained HistGradientBoosting classifier
│   │   ├── regressor_pipeline.joblib    # Trained HistGradientBoosting regressor
│   │   └── evaluation_metrics.json      # Held-out test-set results
│   ├── scripts/process_and_train.py     # End-to-end data processing & training
│   ├── tests/                      # test_health, test_model_info, test_prediction, test_ml_pipeline
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/                    # globals.css, layout.tsx, page.tsx (dashboard)
│   │   ├── components/
│   │   │   ├── Header.tsx                  # Navigation & status indicators
│   │   │   ├── DemoModeBanner.tsx          # Verified model vs demo banner
│   │   │   ├── PredictionForm.tsx          # Early-activity inputs & preset selector
│   │   │   ├── ResultsDashboard.tsx        # Risk badges, CIs, diagnostic factors
│   │   │   ├── PropagationCharts.tsx       # Cascade & toxicity curves
│   │   │   ├── ModelPerformanceSection.tsx # Held-out test results table
│   │   │   ├── DatasetMethodology.tsx      # Methodology & citations
│   │   │   └── ResponsibleUseModal.tsx     # Ethical AI & moderation guidelines
│   │   ├── lib/api.ts              # REST API client
│   │   └── types/prediction.ts     # TypeScript data contracts
│   ├── package.json, tsconfig.json, tailwind.config.ts
│   ├── postcss.config.mjs, next.config.mjs
│   └── .env.example
│
├── .gitignore
└── README.md
```

## 7. Prediction Task & Methodology

### Observation window

The observation cutoff (`T_obs`) is fixed at the arrival of the first **15 replies (K = 15)**, or roughly the first 20–30 minutes of discussion, whichever the thread data supports.

### Engineered features

| Feature | Description |
| :--- | :--- |
| `root_hate_score` | Baseline toxicity of the initial parent post |
| `early_reply_velocity` | Reply arrival speed (`N_early / Δt`) |
| `early_mean_hate` | Mean toxicity across early replies (Davidson et al. scale) |
| `early_max_hate` | Peak toxicity among early replies |
| `early_std_hate` | Spread of toxicity across early replies |
| `early_hate_ratio` | Share of early replies above the toxic threshold (≥ 0.40) |
| `early_user_diversity` | Unique commenters ÷ total early comments (coordinated activity vs broad organic debate) |
| `escalation_delta` | Shift in toxicity between the root post and early replies |

### Targets

- **Future Hate Escalation (classification):** whether post-cutoff discussion enters the top quartile of severe toxic escalation.
- **Post-Cutoff Cascade Volume (regression):** cumulative number of replies the thread will accumulate after the cutoff.

### Anti-leakage splitting

Data is split strictly by `thread_id` (**70% train / 15% validation / 15% test**) so comments from the same thread never appear on both sides of a split.

## 8. Evaluation Results

Evaluated on **324 unseen conversation threads** held out from the DRAGNET benchmark (2,157 threads in total).

**Classification: Future Hate Escalation**

| Model | F1 | ROC-AUC | Precision | Recall |
| :--- | :--- | :--- | :--- | :--- |
| Logistic Regression (baseline) | 0.5824 | 0.7650 | 49.4% | 71.0% |
| **HistGradientBoosting (deployed)** | 0.5612 | 0.7196 | 61.8% | 51.4% |

**Regression: Future Reply Volume**

| Model | MAE | RMSE | R² |
| :--- | :--- | :--- | :--- |
| Ridge Regression (baseline) | 41.37 | 57.20 | 0.1225 |
| **HistGradientBoosting (deployed)** | 41.88 | 57.59 | 0.1104 |

> **How to read these results:** The deployed gradient-boosting models trade recall for precision on the classification task, which means fewer false alarms but more missed escalations. On both tasks the simple linear baselines score slightly better on aggregate metrics, and the volume regressor explains only about 11% of variance. These are honest, modest results on a hard early-prediction problem. See [Limitations](#13-limitations).

## 9. Getting Started

### Prerequisites

- Python 3.10 to 3.13
- Node.js 18+ and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/sanskritinarain/hate-speech-propagation.git
cd hate-speech-propagation
```

### 2. Start the backend (FastAPI)

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1
# macOS / Linux
source venv/bin/activate

# Install dependencies and run on port 8001
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

Once running:

- API index: http://127.0.0.1:8001/
- Swagger docs: http://127.0.0.1:8001/docs
- Health check: http://127.0.0.1:8001/api/health

### 3. Run backend tests

```bash
pytest -v
```

The 10 unit tests cover health, model info, preprocessing, presets and prediction validation.

### 4. Start the frontend (Next.js)

In a second terminal:

```bash
cd frontend
cp .env.example .env.local     # optional; see below
npm install
npm run dev
```

Open http://localhost:3000.

If `NEXT_PUBLIC_API_URL` is not set, the frontend falls back to `http://localhost:8001/api`.

## 10. Retraining the Models

Training is handled end to end by a single script:

```bash
cd backend
python scripts/process_and_train.py
```

It processes the thread data, builds the early-window features, performs the thread-grouped split, trains the classifier and regressor pipelines, and writes `classifier_pipeline.joblib`, `regressor_pipeline.joblib` and `evaluation_metrics.json` to `backend/models/`. Raw datasets are excluded from version control via `.gitignore`, so place the DRAGNET data where the script expects it before running.

## 11. API Reference

Base path: `/api`

| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| GET | `/api/health` | Service status and whether a real model is loaded |
| GET | `/api/model-info` | Training provenance, split counts, test metrics, feature importances |
| GET | `/api/sample-presets` | Curated example scenarios |
| POST | `/api/predict` | Run escalation and cascade prediction |

### `GET /api/health`

```json
{
  "status": "healthy",
  "service": "Hate Speech Propagation Prediction API",
  "model_loaded": true,
  "mode": "real_model_inference",
  "version": "1.0.0"
}
```

### `POST /api/predict`

Request:

```json
{
  "root_text": "These illegal foreigners are destroying our nation, why is nobody taking action?!",
  "root_hate_score": 0.72,
  "early_reply_count": 15,
  "early_time_span_mins": 20.0,
  "early_mean_hate": 0.46,
  "early_max_hate": 0.92,
  "early_std_hate": 0.22,
  "early_hate_ratio": 0.45,
  "early_user_diversity": 0.80
}
```

Response (abridged):

```json
{
  "mode": "real_model_inference",
  "model_source": "HistGradientBoosting Pipeline (scikit-learn)",
  "dataset_provenance": "DRAGNET Research Benchmark (2,157 Conversation Threads, LCS2 IIITD)",
  "escalation_risk": "HIGH",
  "escalation_probability": 0.9566,
  "predicted_future_reply_volume": 120,
  "estimated_total_cascade_size": 135,
  "cascade_reach_tier": "Moderate Cascade (60-180 replies)",
  "confidence_interval": { "lower_bound": 85, "upper_bound": 165 },
  "contributing_factors": [ "..." ],
  "timeline_projection": [ "..." ],
  "caveats_and_responsible_use": "Responsible Use Notice: Predictions reflect statistical correlations..."
}
```

## 12. Deployment

### Frontend on Vercel

1. Push the repository to GitHub.
2. In the Vercel dashboard, choose **Add New Project** and select the repository.
3. Set **Root Directory** to `frontend`.
4. Add an environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://<your-backend-host>/api`
5. Click **Deploy**.

### Backend

The FastAPI backend must be hosted separately (for example on Render, Railway or a VPS) and its URL supplied through `NEXT_PUBLIC_API_URL`. Make sure the backend's CORS configuration in `app/main.py` allows your deployed frontend origin.

## 13. Limitations

- **Modest predictive power.** ROC-AUC is about 0.72 for escalation and R² about 0.11 for volume; early signals alone explain only part of cascade behaviour.
- **Single benchmark dataset.** Results come from DRAGNET (Twitter conversation threads) and may not transfer to Reddit, YouTube or other platforms with different thread structures and velocity norms.
- **Toxicity scores as inputs.** Features depend on upstream hate/toxicity scores (Davidson et al. scale), so errors in that scoring propagate to predictions.
- **Correlation, not causation.** Forecasts reflect statistical patterns in past threads, not intent or guaranteed outcomes.

## 14. Responsible Use & Ethical Governance

1. **Decision support, not autonomous moderation.** Forecasts should inform human review queues or rate-limiting, not automated speech removal.
2. **Context and counter-speech.** High early activity often includes civil counter-speech opposing harassment. Context must be assessed before any punitive action.
3. **Platform differences.** Cascade velocity thresholds differ across platforms (Reddit threaded trees vs Twitter microblogs vs YouTube comments); recalibrate before applying elsewhere.

## 15. References

- Meng et al. (2023). *Predicting Hate Intensity of Twitter Conversation Threads.* Knowledge-Based Systems. (DRAGNET / DRAGNET++)
- Lin et al. *Early Prediction of Hate Speech Propagation.* IEEE ICDMW. (HEAR framework)
- Davidson et al. Hate speech and offensive language scale used for toxicity scoring.

---

**Author:** [Sanskriti Narain](https://github.com/sanskritinarain)
