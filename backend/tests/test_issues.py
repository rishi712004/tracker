import pytest


@pytest.fixture
def project(client):
    return client.post("/api/projects/", json={"name": "Test Project"}).get_json()


@pytest.fixture
def issue(client, project):
    return client.post(
        f"/api/projects/{project['id']}/issues/",
        json={"title": "Sample bug", "priority": "medium"},
    ).get_json()


def test_new_issue_starts_open(client, project):
    resp = client.post(
        f"/api/projects/{project['id']}/issues/",
        json={"title": "Login broken", "priority": "high"},
    )
    assert resp.status_code == 201
    assert resp.get_json()["status"] == "open"


def test_bad_priority_rejected(client, project):
    resp = client.post(
        f"/api/projects/{project['id']}/issues/",
        json={"title": "thing", "priority": "urgent"},
    )
    assert resp.status_code == 422


def test_blank_title_rejected(client, project):
    resp = client.post(
        f"/api/projects/{project['id']}/issues/",
        json={"title": "   "},
    )
    assert resp.status_code == 422


def test_move_to_in_progress(client, issue, project):
    resp = client.post(
        f"/api/projects/{project['id']}/issues/{issue['id']}/transition",
        json={"status": "in_progress"},
    )
    assert resp.status_code == 200
    assert resp.get_json()["status"] == "in_progress"


def test_cant_skip_to_resolved(client, issue, project):
    resp = client.post(
        f"/api/projects/{project['id']}/issues/{issue['id']}/transition",
        json={"status": "resolved"},
    )
    assert resp.status_code == 422


def test_full_happy_path(client, project):
    iss = client.post(
        f"/api/projects/{project['id']}/issues/",
        json={"title": "full lifecycle"},
    ).get_json()

    pid, iid = project["id"], iss["id"]
    base = f"/api/projects/{pid}/issues/{iid}/transition"

    assert client.post(base, json={"status": "in_progress"}).status_code == 200
    assert client.post(base, json={"status": "resolved"}).status_code == 200
    assert client.post(base, json={"status": "closed"}).status_code == 200
    # closed is terminal
    assert client.post(base, json={"status": "open"}).status_code == 422


def test_closed_cant_reopen(client, issue, project):
    base = f"/api/projects/{project['id']}/issues/{issue['id']}/transition"
    client.post(base, json={"status": "closed"})
    assert client.post(base, json={"status": "open"}).status_code == 422


def test_transitions_endpoint(client, issue, project):
    resp = client.get(f"/api/projects/{project['id']}/issues/{issue['id']}/transitions")
    data = resp.get_json()
    assert data["current"] == "open"
    assert set(data["allowed"]) == {"in_progress", "closed"}


def test_deleting_project_removes_issues(client):
    proj = client.post("/api/projects/", json={"name": "doomed"}).get_json()
    client.post(f"/api/projects/{proj['id']}/issues/", json={"title": "orphan"})
    client.delete(f"/api/projects/{proj['id']}")
    assert client.get(f"/api/projects/{proj['id']}/issues/").status_code == 404
