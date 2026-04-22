def test_create_project(client):
    resp = client.post("/api/projects/", json={"name": "Alpha", "description": "first one"})
    assert resp.status_code == 201
    body = resp.get_json()
    assert body["name"] == "Alpha"
    assert "id" in body


def test_blank_name_rejected(client):
    resp = client.post("/api/projects/", json={"name": "   "})
    assert resp.status_code == 422


def test_missing_name_rejected(client):
    resp = client.post("/api/projects/", json={"description": "no name here"})
    assert resp.status_code == 422


def test_list_returns_all(client):
    client.post("/api/projects/", json={"name": "A"})
    client.post("/api/projects/", json={"name": "B"})
    resp = client.get("/api/projects/")
    assert len(resp.get_json()) == 2


def test_get_single_project(client):
    proj = client.post("/api/projects/", json={"name": "Gamma"}).get_json()
    resp = client.get(f"/api/projects/{proj['id']}")
    assert resp.status_code == 200
    assert resp.get_json()["name"] == "Gamma"


def test_get_missing_project(client):
    assert client.get("/api/projects/9999").status_code == 404


def test_update_name(client):
    proj = client.post("/api/projects/", json={"name": "Old"}).get_json()
    resp = client.patch(f"/api/projects/{proj['id']}", json={"name": "New"})
    assert resp.get_json()["name"] == "New"


def test_delete_project(client):
    proj = client.post("/api/projects/", json={"name": "Temp"}).get_json()
    assert client.delete(f"/api/projects/{proj['id']}").status_code == 204
    assert client.get(f"/api/projects/{proj['id']}").status_code == 404
