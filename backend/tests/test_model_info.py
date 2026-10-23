from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_model_info_endpoint():
    response = client.get("/api/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["mode"] == "real_model_inference"
    assert "DRAGNET" in data["dataset_name"]
    assert data["cutoff_early_replies"] == 15
    assert data["total_threads_analyzed"] > 0
    assert "classification_metrics" in data
    assert "f1_score" in data["classification_metrics"]
    assert "roc_auc" in data["classification_metrics"]
    assert len(data["feature_importances"]) > 0
