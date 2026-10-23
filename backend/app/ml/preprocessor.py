import re
import pandas as pd
import numpy as np
from app.schemas.prediction import EarlyPostAnalysisRequest

FEATURE_COLUMNS = [
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

# Simple lightweight toxicity keywords for heuristic estimate when pre-score is omitted
TOXIC_KEYWORDS = {
    "hate", "scum", "trash", "illegal", "filth", "vermin", "invaders", 
    "disgusting", "terrorist", "deport", "enemy", "destroy", "traitor",
    "corrupt", "kill", "attack", "racist", "clowns", "idiot", "shame"
}

def estimate_root_toxicity(text: str) -> float:
    text_lower = text.lower()
    words = re.findall(r"\b\w+\b", text_lower)
    if not words:
        return 0.05
    matches = sum(1 for w in words if w in TOXIC_KEYWORDS)
    score = min(0.10 + (matches * 0.20), 0.95)
    return round(score, 3)

def prepare_inference_features(req: EarlyPostAnalysisRequest) -> pd.DataFrame:
    # 1. Root text features
    text = req.root_text.strip()
    root_char_len = len(text)
    root_words = len(text.split())
    root_has_question = 1 if "?" in text else 0
    root_has_exclamation = 1 if "!" in text else 0
    
    # 2. Root hate score
    if req.root_hate_score is not None:
        root_hate = float(req.root_hate_score)
    else:
        root_hate = estimate_root_toxicity(text)
        
    # 3. Early temporal & velocity
    time_span = max(float(req.early_time_span_mins), 0.1)
    if req.early_reply_velocity is not None:
        velocity = float(req.early_reply_velocity)
    else:
        velocity = float(req.early_reply_count) / time_span
        
    # 4. Escalation delta
    escalation_delta = float(req.early_mean_hate) - root_hate
    
    feature_dict = {
        "root_hate_score": [root_hate],
        "root_char_len": [root_char_len],
        "root_word_count": [root_words],
        "root_has_question": [root_has_question],
        "root_has_exclamation": [root_has_exclamation],
        "early_reply_count": [req.early_reply_count],
        "early_time_span_mins": [time_span],
        "early_reply_velocity": [min(velocity, 100.0)],
        "early_mean_hate": [float(req.early_mean_hate)],
        "early_max_hate": [float(req.early_max_hate)],
        "early_std_hate": [float(req.early_std_hate)],
        "early_hate_ratio": [float(req.early_hate_ratio)],
        "early_user_diversity": [float(req.early_user_diversity)],
        "escalation_delta": [escalation_delta]
    }
    
    df = pd.DataFrame(feature_dict)
    return df[FEATURE_COLUMNS]
