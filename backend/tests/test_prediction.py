from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_prediction_valid_high_risk():
    payload = {
        "root_text": "These illegal foreigners are destroying our nation, why is nobody taking direct action?!",
        "root_hate_score": 0.75,
        "early_reply_count": 15,
        "early_time_span_mins": 15.0,
        "early_mean_hate": 0.52,
        "early_max_hate": 0.95,
        "early_std_hate": 0.25,
        "early_hate_ratio": 0.50,
        "early_user_diversity": 0.80
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["mode"] == "real_model_inference"
    assert data["escalation_risk"] in ["HIGH", "MODERATE", "LOW"]
    assert 0.0 <= data["escalation_probability"] <= 1.0
    assert data["predicted_future_reply_volume"] >= 0
    assert data["estimated_total_cascade_size"] >= payload["early_reply_count"]
    assert len(data["contributing_factors"]) > 0
    assert len(data["timeline_projection"]) == 6
    assert "caveats_and_responsible_use" in data

def test_prediction_valid_benign():
    payload = {
        "root_text": "Public library hours are extending this summer for student study sessions.",
        "root_hate_score": 0.01,
        "early_reply_count": 10,
        "early_time_span_mins": 60.0,
        "early_mean_hate": 0.04,
        "early_max_hate": 0.10,
        "early_std_hate": 0.02,
        "early_hate_ratio": 0.0,
        "early_user_diversity": 0.95
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["escalation_risk"] in ["LOW", "MODERATE"]
    assert data["escalation_probability"] < 0.60

def test_prediction_validation_failure():
    # Invalid: text too short (<3 chars) and early_reply_count = 0 (ge=1 required)
    payload = {
        "root_text": "a",
        "early_reply_count": 0
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422  # Unprocessable Entity

def test_sample_presets():
    response = client.get("/api/sample-presets")
    assert response.status_code == 200
    presets = response.json()
    assert isinstance(presets, list)
    assert len(presets) >= 3
    for p in presets:
        assert "id" in p
        assert "title" in p
        assert "data" in p
