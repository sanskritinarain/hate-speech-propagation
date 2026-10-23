from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_index():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "service" in data
    assert "api_endpoints" in data

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model_loaded" in data
    assert data["model_loaded"] is True
    assert data["mode"] == "real_model_inference"
