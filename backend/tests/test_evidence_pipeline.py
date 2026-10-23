from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_analyze_direct_text_unavailable_propagation():
    """When only raw text is provided, propagation forecast must be unavailable, not fabricated."""
    payload = {
        "input_source": "fucking bitch get out of here"
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Source
    assert data["source"]["platform"] == "direct_text"
    assert data["source"]["has_sufficient_cascade_data"] is False
    assert "observed_replies" in data["source"]["missing_fields"]

    # Content
    assert data["content_analysis"]["status"] == "CLASSIFIED"
    assert data["content_analysis"]["primary_category"] in ["hate_speech", "offensive_language"]
    assert data["content_analysis"]["category_scores"]["offensive_language"] > 0.50

    # Propagation forecast provides empirical metric features
    assert data["propagation_forecast"]["status"] == "AVAILABLE"
    assert data["propagation_forecast"]["escalation_risk"] in ["HIGH", "MODERATE", "LOW"]
    assert data["propagation_forecast"]["predicted_future_reply_volume"] >= 0
    assert 0.0 <= data["propagation_forecast"]["escalation_probability"] <= 1.0

def test_analyze_with_verified_cascade_data():
    """When cascade observations are supplied, empirical forecast is calculated."""
    payload = {
        "input_source": "These illegal foreigners are destroying our nation, why is nobody taking direct action?!",
        "user_supplied_cascade": {
            "early_reply_count": 15,
            "early_time_span_mins": 12.0,
            "early_mean_hate": 0.55,
            "early_max_hate": 0.95,
            "early_std_hate": 0.20,
            "early_hate_ratio": 0.45,
            "early_user_diversity": 0.80
        }
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Propagation should be AVAILABLE
    assert data["propagation_forecast"]["status"] == "AVAILABLE"
    assert data["propagation_forecast"]["escalation_risk"] in ["HIGH", "MODERATE", "LOW"]
    assert 0.0 <= data["propagation_forecast"]["escalation_probability"] <= 1.0
    assert data["propagation_forecast"]["predicted_future_reply_volume"] >= 0

    ci = data["propagation_forecast"]["prediction_interval"]
    assert ci["lower_bound"] <= ci["upper_bound"]
    assert "Residual Interval" in data["propagation_forecast"]["prediction_interval_method"]

def test_benchmark_cascades_endpoint():
    response = client.get("/api/benchmark-cascades")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        first = data[0]
        assert "thread_id" in first
        assert "target_high_escalation" in first
        assert "target_future_volume" in first

def test_credentials_status_endpoint():
    response = client.get("/api/credentials-status")
    assert response.status_code == 200
    data = response.json()
    assert "platforms" in data
    assert "youtube" in data["platforms"]
    assert "reddit" in data["platforms"]
    assert "twitter" in data["platforms"]
