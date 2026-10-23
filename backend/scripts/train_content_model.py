"""
Training script for Content Analysis NLP Model
Dataset: Davidson et al. (ICWSM 2017) "Automated Hate Speech Detection and the Problem of Offensive Language"
Taxonomy:
  Class 0: Hate Speech (Violent, incitement, dehumanizing speech targeting protected groups)
  Class 1: Offensive Language (Profanity, slurs, crude language without systemic targeted hate)
  Class 2: Neither (Neutral / Benign discourse)
"""

import os
import re
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix, f1_score, accuracy_score

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

DATASET_URL = "https://raw.githubusercontent.com/t-davidson/hate-speech-and-offensive-language/master/data/labeled_data.csv"

def clean_text(text: str) -> str:
    # Remove URLs, mentions, excessive whitespace
    text = re.sub(r"https?://\S+|www\.\S+", "", text)
    text = re.sub(r"@\w+", "", text)
    text = re.sub(r"#", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text.lower()

def main():
    print(f"Loading Davidson et al. dataset from {DATASET_URL}...")
    df = pd.read_csv(DATASET_URL)
    df["clean_tweet"] = df["tweet"].astype(str).apply(clean_text)
    
    # Save a cached copy to data/
    cache_path = os.path.join(DATA_DIR, "davidson_labeled_data.csv")
    df.to_csv(cache_path, index=False)
    print(f"Cached raw dataset to {cache_path}")
    
    X = df["clean_tweet"]
    y = df["class"]
    
    # Stratified 80/20 train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    print(f"Train samples: {len(X_train)}, Test samples: {len(X_test)}")
    
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=15000,
            min_df=3,
            sublinear_tf=True
        )),
        ("classifier", LogisticRegression(
            C=2.0,
            max_iter=1500,
            class_weight="balanced",
            random_state=42,
            solver="lbfgs"
        ))
    ])
    
    print("Fitting Content Analysis Pipeline...")
    pipeline.fit(X_train, y_train)
    
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)
    
    target_names = ["hate_speech", "offensive_language", "neither"]
    rep = classification_report(y_test, y_pred, target_names=target_names, output_dict=True)
    cm = confusion_matrix(y_test, y_pred).tolist()
    macro_f1 = f1_score(y_test, y_pred, average="macro")
    acc = accuracy_score(y_test, y_pred)
    
    print(f"Content Model Accuracy: {acc:.4f}, Macro F1: {macro_f1:.4f}")
    for name in target_names:
        print(f"  {name.upper()}: Precision={rep[name]['precision']:.4f}, Recall={rep[name]['recall']:.4f}, F1={rep[name]['f1-score']:.4f}")
        
    # Serialize model pipeline
    model_path = os.path.join(MODELS_DIR, "content_classifier.joblib")
    joblib.dump(pipeline, model_path)
    print(f"Saved content classifier to {model_path}")
    
    # Save evaluation report
    metrics_summary = {
        "status": "trained_on_verified_benchmark",
        "dataset_name": "Davidson et al. (ICWSM 2017) Hate Speech & Offensive Language Benchmark",
        "taxonomy": {
            "0": "hate_speech (violence, dehumanization, or incitement targeting protected attributes)",
            "1": "offensive_language (profanity, aggressive or crude phrasing not targeted at protected classes)",
            "2": "neither (neutral, civil or benign discourse)"
        },
        "sample_counts": {
            "total": int(len(df)),
            "train": int(len(X_train)),
            "test": int(len(X_test))
        },
        "overall_accuracy": round(float(acc), 4),
        "macro_f1": round(float(macro_f1), 4),
        "per_class_metrics": {
            name: {
                "precision": round(float(rep[name]["precision"]), 4),
                "recall": round(float(rep[name]["recall"]), 4),
                "f1_score": round(float(rep[name]["f1-score"]), 4),
                "support": int(rep[name]["support"])
            }
            for name in target_names
        },
        "confusion_matrix": cm,
        "limitations_and_bias_notes": (
            "Model is calibrated on Twitter discourse. Performance may degrade on platform-specific slang or long-form posts. "
            "Known risk: High-frequency African American Vernacular English (AAVE) terms may receive elevated false positive offensive scores "
            "as documented in Davidson et al. (2017) and Sap et al. (2019). Use for decision-support only."
        )
    }
    
    metrics_path = os.path.join(MODELS_DIR, "content_metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_summary, f, indent=2)
    print(f"Saved content metrics to {metrics_path}")

if __name__ == "__main__":
    main()
