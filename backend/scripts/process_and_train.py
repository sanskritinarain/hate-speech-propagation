"""
Calibrated Data Processing, Feature Engineering, and Model Training Pipeline
Dataset Source: DRAGNET Research Benchmark (LCS2 IIITD / Meng et al., KBS 2023)
Proactive Prediction of Hate Speech Propagation and Escalation
"""

import os
import glob
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.ensemble import HistGradientBoostingClassifier, HistGradientBoostingRegressor
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix,
    mean_absolute_error, mean_squared_error, r2_score
)
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELS_DIR = os.path.join(BASE_DIR, "models")
SOURCE_DATA_DIR = r"C:\Users\sanskriti narain\.gemini\antigravity\scratch\temp_dragnet\data\data_anti_racism"

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

CUTOFF_EARLY_REPLIES = 15  # Observation window cutoff: first 15 replies
MIN_TOTAL_REPLIES = 20      # Minimum replies needed to evaluate future cascade
HATE_THRESHOLD = 0.40       # Davidson toxicity threshold

def extract_features(source_dir, max_files=2200):
    files = glob.glob(os.path.join(source_dir, "thread_*.csv"))
    print(f"Scanning up to {max_files} of {len(files)} conversation thread files...")
    
    records = []
    
    for fpath in files[:max_files]:
        try:
            fname = os.path.basename(fpath)
            parts = fname.replace(".csv", "").split("_")
            thread_id = parts[1] if len(parts) > 1 else fname
            
            df = pd.read_csv(fpath)
            if len(df) < MIN_TOTAL_REPLIES + 1:
                continue
            
            root_row = df.iloc[0]
            root_text = str(root_row.get("text", ""))
            root_hate = float(root_row.get("davidson", 0.0))
            if np.isnan(root_hate):
                root_hate = 0.0
                
            replies = df.iloc[1:].copy()
            replies["time_num"] = pd.to_numeric(replies["time"], errors="coerce")
            replies = replies.sort_values(by="time_num").reset_index(drop=True)
            
            early = replies.iloc[:CUTOFF_EARLY_REPLIES]
            future = replies.iloc[CUTOFF_EARLY_REPLIES:]
            
            if len(future) == 0:
                continue
                
            # Early temporal dynamics
            t_min = early["time_num"].min()
            t_max = early["time_num"].max()
            time_span_secs = max(float(t_max - t_min), 1.0)
            time_span_mins = time_span_secs / 60.0
            
            early_count = len(early)
            reply_velocity = early_count / max(time_span_mins, 0.1)
            
            # Early toxicity statistics
            early_davidson = early["davidson"].astype(float).fillna(0.0)
            early_mean_hate = float(early_davidson.mean())
            early_max_hate = float(early_davidson.max())
            early_std_hate = float(early_davidson.std() if len(early_davidson) > 1 else 0.0)
            if np.isnan(early_std_hate):
                early_std_hate = 0.0
            early_hate_count = int((early_davidson >= HATE_THRESHOLD).sum())
            early_hate_ratio = float(early_hate_count / early_count)
            
            # User diversity
            unique_early_users = early["userid"].nunique()
            early_user_diversity = float(unique_early_users / early_count)
            
            # Root tweet linguistic features
            root_len = len(root_text)
            root_words = len(root_text.split())
            root_has_question = 1 if "?" in root_text else 0
            root_has_exclamation = 1 if "!" in root_text else 0
            
            # Escalation delta between early comments and root post
            escalation_delta = early_mean_hate - root_hate
            
            # Future target calculation
            future_davidson = future["davidson"].astype(float).fillna(0.0)
            future_mean_hate = float(future_davidson.mean())
            future_hateful_ratio = float((future_davidson >= HATE_THRESHOLD).mean())
            
            # Calibrated High Escalation Target (top quartile toxic propagation)
            is_high_escalation = int((future_mean_hate >= 0.24) or (future_hateful_ratio >= 0.22))
            
            records.append({
                "thread_id": thread_id,
                "root_hate_score": root_hate,
                "root_char_len": root_len,
                "root_word_count": root_words,
                "root_has_question": root_has_question,
                "root_has_exclamation": root_has_exclamation,
                "early_reply_count": early_count,
                "early_time_span_mins": min(time_span_mins, 1440.0),
                "early_reply_velocity": min(reply_velocity, 100.0),
                "early_mean_hate": early_mean_hate,
                "early_max_hate": early_max_hate,
                "early_std_hate": early_std_hate,
                "early_hate_ratio": early_hate_ratio,
                "early_user_diversity": early_user_diversity,
                "escalation_delta": escalation_delta,
                "future_mean_hate": future_mean_hate,
                "future_hateful_ratio": future_hateful_ratio,
                "target_high_escalation": is_high_escalation,
                "target_future_volume": int(len(future))
            })
        except Exception:
            continue
            
    return pd.DataFrame(records)

def main():
    print("="*65)
    print("Calibrated ML Pipeline: Proactive Hate Propagation Prediction")
    print("="*65)
    
    df = extract_features(SOURCE_DATA_DIR, max_files=2200)
    print(f"Extracted {len(df)} validated conversation threads.")
    
    feature_cols = [
        "root_hate_score",
        "root_char_len",
        "root_word_count",
        "root_has_question",
        "root_has_exclamation",
        "early_reply_count",
        "early_time_span_mins",
        "early_reply_velocity",
        "early_mean_hate",
        "early_max_hate",
        "early_std_hate",
        "early_hate_ratio",
        "early_user_diversity",
        "escalation_delta"
    ]
    
    pos_rate = df["target_high_escalation"].mean()
    print(f"Calibrated High Escalation Positives: {df['target_high_escalation'].sum()} ({pos_rate*100:.1f}%)")
    print(f"Future Reply Volume Mean: {df['target_future_volume'].mean():.1f}, Median: {df['target_future_volume'].median():.1f}")
    
    # Save processed sample
    sample_df = df.head(100).drop(columns=["future_mean_hate", "future_hateful_ratio"])
    sample_path = os.path.join(DATA_DIR, "processed_threads_sample.csv")
    sample_df.to_csv(sample_path, index=False)
    
    # Grouped split by thread_id to prevent data leakage
    threads = df["thread_id"].unique()
    train_threads, test_val_threads = train_test_split(threads, test_size=0.30, random_state=42)
    val_threads, test_threads = train_test_split(test_val_threads, test_size=0.50, random_state=42)
    
    train_df = df[df["thread_id"].isin(train_threads)]
    val_df = df[df["thread_id"].isin(val_threads)]
    test_df = df[df["thread_id"].isin(test_threads)]
    
    print(f"Split sizes: Train={len(train_df)}, Val={len(val_df)}, Test={len(test_df)}")
    
    X_train = train_df[feature_cols]
    y_clf_train = train_df["target_high_escalation"]
    y_reg_train = train_df["target_future_volume"]
    
    X_test = test_df[feature_cols]
    y_clf_test = test_df["target_high_escalation"]
    y_reg_test = test_df["target_future_volume"]
    
    # 1. Classification
    print("\n--- Training Classification Models ---")
    clf_base = Pipeline([
        ("scaler", StandardScaler()),
        ("model", LogisticRegression(class_weight="balanced", random_state=42, max_iter=1000))
    ])
    clf_base.fit(X_train, y_clf_train)
    y_pred_base = clf_base.predict(X_test)
    y_prob_base = clf_base.predict_proba(X_test)[:, 1]
    
    base_acc = accuracy_score(y_clf_test, y_pred_base)
    base_prec = precision_score(y_clf_test, y_pred_base, zero_division=0)
    base_rec = recall_score(y_clf_test, y_pred_base, zero_division=0)
    base_f1 = f1_score(y_clf_test, y_pred_base, zero_division=0)
    base_auc = roc_auc_score(y_clf_test, y_prob_base)
    base_pr_auc = average_precision_score(y_clf_test, y_prob_base)
    
    print(f"Baseline Logistic Regression -> F1: {base_f1:.4f}, AUC: {base_auc:.4f}, Prec: {base_prec:.4f}, Rec: {base_rec:.4f}")
    
    clf_strong = Pipeline([
        ("scaler", StandardScaler()),
        ("model", HistGradientBoostingClassifier(random_state=42, max_iter=120, learning_rate=0.06, min_samples_leaf=20))
    ])
    clf_strong.fit(X_train, y_clf_train)
    y_pred_strong = clf_strong.predict(X_test)
    y_prob_strong = clf_strong.predict_proba(X_test)[:, 1]
    
    strong_acc = accuracy_score(y_clf_test, y_pred_strong)
    strong_prec = precision_score(y_clf_test, y_pred_strong, zero_division=0)
    strong_rec = recall_score(y_clf_test, y_pred_strong, zero_division=0)
    strong_f1 = f1_score(y_clf_test, y_pred_strong, zero_division=0)
    strong_auc = roc_auc_score(y_clf_test, y_prob_strong)
    strong_pr_auc = average_precision_score(y_clf_test, y_prob_strong)
    cm = confusion_matrix(y_clf_test, y_pred_strong).tolist()
    
    print(f"HistGradientBoosting Classifier -> F1: {strong_f1:.4f}, AUC: {strong_auc:.4f}, Prec: {strong_prec:.4f}, Rec: {strong_rec:.4f}")
    
    # 2. Regression
    print("\n--- Training Regression Models ---")
    reg_base = Pipeline([
        ("scaler", StandardScaler()),
        ("model", Ridge(alpha=1.0))
    ])
    reg_base.fit(X_train, y_reg_train)
    y_reg_pred_base = np.maximum(reg_base.predict(X_test), 0.0)
    base_mae = mean_absolute_error(y_reg_test, y_reg_pred_base)
    base_rmse = np.sqrt(mean_squared_error(y_reg_test, y_reg_pred_base))
    base_r2 = r2_score(y_reg_test, y_reg_pred_base)
    
    print(f"Baseline Ridge Regressor -> MAE: {base_mae:.2f}, RMSE: {base_rmse:.2f}, R2: {base_r2:.4f}")
    
    reg_strong = Pipeline([
        ("scaler", StandardScaler()),
        ("model", HistGradientBoostingRegressor(random_state=42, max_iter=100, learning_rate=0.06))
    ])
    reg_strong.fit(X_train, y_reg_train)
    y_reg_pred_strong = np.maximum(reg_strong.predict(X_test), 0.0)
    strong_mae = mean_absolute_error(y_reg_test, y_reg_pred_strong)
    strong_rmse = np.sqrt(mean_squared_error(y_reg_test, y_reg_pred_strong))
    strong_r2 = r2_score(y_reg_test, y_reg_pred_strong)
    
    print(f"HistGradientBoosting Regressor -> MAE: {strong_mae:.2f}, RMSE: {strong_rmse:.2f}, R2: {strong_r2:.4f}")
    
    # Feature importances
    log_coefs = clf_base.named_steps["model"].coef_[0]
    feature_importance = [
        {"feature": feat, "importance": round(float(abs(c)), 4), "direction": "positive" if c > 0 else "negative"}
        for feat, c in zip(feature_cols, log_coefs)
    ]
    feature_importance.sort(key=lambda x: x["importance"], reverse=True)
    
    # Save artifacts
    clf_path = os.path.join(MODELS_DIR, "classifier_pipeline.joblib")
    reg_path = os.path.join(MODELS_DIR, "regressor_pipeline.joblib")
    joblib.dump(clf_strong, clf_path)
    joblib.dump(reg_strong, reg_path)
    
    metrics_summary = {
        "status": "trained_on_verified_dataset",
        "dataset_name": "DRAGNET Conversation Threads Benchmark (KBS 2023 / ICDMW)",
        "source_repository": "LCS2-IIITD/Predicting-Hate-Intensity",
        "cutoff_early_replies": CUTOFF_EARLY_REPLIES,
        "total_threads_analyzed": len(df),
        "split_sizes": {
            "train": len(train_df),
            "validation": len(val_df),
            "test": len(test_df)
        },
        "features_used": feature_cols,
        "classification": {
            "task": "Predict Future Hate Escalation (Severe Toxicity Cascade)",
            "positive_class_ratio": round(float(pos_rate), 4),
            "baseline_logistic_regression": {
                "accuracy": round(float(base_acc), 4),
                "precision": round(float(base_prec), 4),
                "recall": round(float(base_rec), 4),
                "f1_score": round(float(base_f1), 4),
                "roc_auc": round(float(base_auc), 4),
                "pr_auc": round(float(base_pr_auc), 4)
            },
            "stronger_hist_gradient_boosting": {
                "accuracy": round(float(strong_acc), 4),
                "precision": round(float(strong_prec), 4),
                "recall": round(float(strong_rec), 4),
                "f1_score": round(float(strong_f1), 4),
                "roc_auc": round(float(strong_auc), 4),
                "pr_auc": round(float(strong_pr_auc), 4),
                "confusion_matrix": cm
            }
        },
        "regression": {
            "task": "Predict Future Cascade Reply Volume (Post-Cutoff Total Replies)",
            "baseline_ridge": {
                "mae": round(float(base_mae), 2),
                "rmse": round(float(base_rmse), 2),
                "r2": round(float(base_r2), 4)
            },
            "stronger_hist_gradient_boosting": {
                "mae": round(float(strong_mae), 2),
                "rmse": round(float(strong_rmse), 2),
                "r2": round(float(strong_r2), 4)
            }
        },
        "feature_importances": feature_importance
    }
    
    metrics_path = os.path.join(MODELS_DIR, "evaluation_metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_summary, f, indent=2)
        
    print(f"\nAll models and evaluation metrics successfully serialized to {MODELS_DIR}")

if __name__ == "__main__":
    main()
