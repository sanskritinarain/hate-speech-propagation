# Hate Speech Propagation Prediction System

A research-oriented full-stack machine learning system designed to proactively forecast downstream toxicity escalation and conversation cascade diffusion in online discussion threads using early engagement signals.

Grounded in peer-reviewed research frameworks:
- **DRAGNET & DRAGNET++** (*"Predicting Hate Intensity of Twitter Conversation Threads"*, Meng et al., *Knowledge-Based Systems*, 2023)
- **HEAR Framework** (*"Early Prediction of Hate Speech Propagation"*, Lin et al., *IEEE International Conference on Data Mining Workshops - ICDMW*)

---

## 1. System Architecture

```text
[ Web Browser User ]
         │
         ▼
[ Frontend: Next.js 14 + TypeScript ] (Port 3000)
   • App Router & Tailwind CSS
   • Interactive Dynamic Recharts Curves
   • Live Preset Selector & Diagnostic Factor Cards
         │
         │ HTTP / REST API (JSON)
         ▼
[ Backend: Python & FastAPI ] (Port 8001)
   • Pydantic Request & Response Validation
   • Cross-Origin Resource Sharing (CORS) Middleware
   • Feature Engineering Pipeline & Temporal Velocity Calculator
         │
         ▼
[ ML Engine: scikit-learn Pipelines ]
   • HistGradientBoostingClassifier (Future Hate Escalation Risk)
   • HistGradientBoostingRegressor (Post-Cutoff Reply Volume)
   • Leakage-resistant thread-grouped validation
```

---

## 2. Directory Structure

```text
hate-speech-propagation/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI entry point & CORS configuration
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py            # API routes (/health, /model-info, /predict, /sample-presets)
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py            # Pydantic v2 application settings
│   │   ├── ml/
│   │   │   ├── __init__.py
│   │   │   ├── preprocessor.py      # Feature extraction & velocity computation
│   │   │   └── predictor.py         # Model loading, inference & confidence intervals
│   │   └── schemas/
│   │       ├── __init__.py
│   │       └── prediction.py        # Pydantic validation schemas
│   ├── data/                        # Processed thread samples (raw data excluded by .gitignore)
│   ├── models/
│   │   ├── classifier_pipeline.joblib  # Trained HistGradientBoosting classifier
│   │   ├── regressor_pipeline.joblib   # Trained HistGradientBoosting regressor
│   │   └── evaluation_metrics.json     # Empirical test-set evaluation results
│   ├── scripts/
│   │   └── process_and_train.py     # End-to-end dataset processing & training script
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_health.py           # Health and root index tests
│   │   ├── test_model_info.py       # Metadata endpoint tests
│   │   ├── test_prediction.py       # Prediction and validation failure tests
│   │   └── test_ml_pipeline.py      # Preprocessing and inference tests
│   ├── requirements.txt             # Python backend dependencies
│   └── venv/                        # Virtual environment (ignored by git)
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css          # Tailwind CSS styling
│   │   │   ├── layout.tsx           # Next.js root layout
│   │   │   └── page.tsx             # Research dashboard page
│   │   ├── components/
│   │   │   ├── Header.tsx           # Navigation & status indicators
│   │   │   ├── DemoModeBanner.tsx   # Verified model vs demo banner
│   │   │   ├── PredictionForm.tsx   # Early activity inputs & preset selector
│   │   │   ├── ResultsDashboard.tsx # Risk badges, confidence intervals, diagnostic factors
│   │   │   ├── PropagationCharts.tsx# Recharts cumulative cascade & toxicity curves
│   │   │   ├── ModelPerformanceSection.tsx # Empirical holdout test results table
│   │   │   ├── DatasetMethodology.tsx      # Scientific methodology & citations
│   │   │   └── ResponsibleUseModal.tsx     # Ethical AI & moderation guidelines
│   │   ├── lib/
│   │   │   └── api.ts               # REST API client
│   │   └── types/
│   │       └── prediction.ts        # TypeScript data contracts
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.mjs
│   ├── next.config.mjs
│   ├── .env.example
│   └── .env.local
│
├── .gitignore                       # Excludes node_modules, venvs, and private weights
└── README.md                        # Documentation
```

---

## 3. The Prediction Task & Methodology

Traditional toxicity detection tools operate **reactively** by analyzing isolated text in a single post *after* it has been submitted. In contrast, this system operates **proactively**:

1. **Early Observation Window ($T_{obs}$)**:
   - The system locks the observation cutoff at the arrival of the first **15 replies ($K=15$)** or the initial ~20–30 minutes of discussion.
2. **Features Extracted**:
   - `root_hate_score`: Baseline toxicity of the initial parent post.
   - `early_reply_velocity`: Reply arrival speed ($N_{early} / \Delta t$).
   - `early_mean_hate` & `early_max_hate`: Toxicity statistics across early replies (Davidson et al. scale).
   - `early_hate_ratio`: Percentage of early replies exceeding the toxic threshold ($\ge 0.40$).
   - `early_user_diversity`: Ratio of unique commenters to total early comments (measures coordinate astroturfing vs broad organic debate).
   - `escalation_delta`: Shift in toxicity between the root post and early comments.
3. **Targets**:
   - **Future Hate Escalation (Classification)**: Forecasts whether post-cutoff discussion will enter the top quartile of severe toxic escalation.
   - **Post-Cutoff Cascade Volume (Regression)**: Estimates the cumulative number of replies the thread will accumulate.
4. **Anti-Leakage Grouping**:
   - Split strictly by `thread_id` (70% Train, 15% Validation, 15% Test) to ensure comments from the same thread never cross train and test sets.

---

## 4. Empirical Evaluation Results (Holdout Test Set)

Evaluated on 324 unseen conversation threads from the DRAGNET benchmark (2,157 total threads analyzed):

| Model Architecture | Task | Primary Metric | ROC-AUC / RMSE | Precision | Recall |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression (Baseline)** | Future Hate Escalation | F1: `0.5824` | ROC-AUC: `0.7650` | `49.4%` | `71.0%` |
| **HistGradientBoosting (Deployed)** | Future Hate Escalation | F1: `0.5612` | ROC-AUC: `0.7196` | `61.8%` | `51.4%` |
| **Ridge Regression (Baseline)** | Future Reply Volume | MAE: `41.37` | RMSE: `57.20` | $R^2$: `0.1225` | — |
| **HistGradientBoosting (Deployed)** | Future Reply Volume | MAE: `41.88` | RMSE: `57.59` | $R^2$: `0.1104` | — |

*Note: Models and metrics reflect real benchmark data; illustrative demo mode is visibly flagged if model weights are absent.*

---

## 5. Local Setup & Execution Instructions

### Prerequisites
- Python 3.10 to 3.13
- Node.js v18+ and npm
- Git

### Step 1: Clone or Navigate to the Workspace
```powershell
cd "C:\Users\sanskriti narain\.gemini\antigravity\scratch\hate-speech-propagation"
```

### Step 2: Start the Backend (FastAPI)
Open a terminal in `backend/`:
```powershell
cd backend
# Create virtual environment (already created)
python -m venv venv
# Activate virtual environment
.\venv\Scripts\Activate.ps1
# Install dependencies
pip install -r requirements.txt
# Run the FastAPI server on port 8001
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```
The backend will be available at:
- API Index: `http://127.0.0.1:8001/`
- Interactive Swagger API Documentation: `http://127.0.0.1:8001/docs`
- Health check: `http://127.0.0.1:8001/api/health`

### Step 3: Run Backend Tests
In your activated backend terminal:
```powershell
pytest -v
```
All 10 unit tests covering health, model info, preprocessing, presets, and prediction validation will execute.

### Step 4: Start the Frontend (Next.js)
Open a second terminal in `frontend/`:
```powershell
cd frontend
# Install dependencies (already installed)
npm install
# Start local development server
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 6. API Reference

### Health Check
`GET /api/health`
```json
{
  "status": "healthy",
  "service": "Hate Speech Propagation Prediction API",
  "model_loaded": true,
  "mode": "real_model_inference",
  "version": "1.0.0"
}
```

### Model Information & Empirical Metrics
`GET /api/model-info`
Returns training provenance, dataset sample size, grouped split counts, classification and regression test metrics, and feature importances.

### Sample Presets
`GET /api/sample-presets`
Returns curated real-world presets (`Severe Xenophobic Escalation`, `Subtle Dogwhistle`, `Benign Civic Policy Discussion`).

### Prediction Inference
`POST /api/predict`
Request payload:
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
Response:
```json
{
  "mode": "real_model_inference",
  "model_source": "HistGradientBoosting Pipeline (scikit-learn 1.9)",
  "dataset_provenance": "DRAGNET Research Benchmark (2,157 Conversation Threads, LCS2 IIITD)",
  "escalation_risk": "HIGH",
  "escalation_probability": 0.9566,
  "predicted_future_reply_volume": 120,
  "estimated_total_cascade_size": 135,
  "cascade_reach_tier": "Moderate Cascade (60-180 replies)",
  "confidence_interval": {
    "lower_bound": 85,
    "upper_bound": 165
  },
  "contributing_factors": [ ... ],
  "timeline_projection": [ ... ],
  "caveats_and_responsible_use": "Responsible Use Notice: Predictions reflect statistical correlations..."
}
```

---

## 7. Vercel Deployment Guide (Frontend)

The frontend is fully prepped for zero-configuration Vercel deployment:

1. Push this repository to your GitHub account:
   ```powershell
   git add .
   git commit -m "feat: complete hate speech propagation prediction system"
   git remote add origin https://github.com/<your-username>/hate-speech-propagation.git
   git push -u origin master
   ```
2. In the [Vercel Dashboard](https://vercel.com):
   - Click **Add New Project** and select your repository.
   - Set the **Root Directory** to `frontend`.
   - In **Environment Variables**, add:
     - Name: `NEXT_PUBLIC_API_URL`
     - Value: `https://<your-hosted-backend-api-domain>/api`
   - Click **Deploy**.
3. During initial local testing, the frontend automatically falls back to `http://localhost:8001/api`.

---

## 8. Responsible Use & Ethical Governance

1. **Decision Support, Not Autonomous Moderation**: Forecasts reflect statistical dynamics and should inform human content review queues or rate-limiting measures rather than autonomous speech removal.
2. **Context & Counter-Speech**: High early activity often features civil counter-speech opposing harassment. Context must be evaluated before applying punitive actions.
3. **Platform Differences**: Cascade velocity thresholds differ across platforms (e.g., Reddit threaded trees vs. Twitter microblogs vs. YouTube comments).
