def get_auth_headers(client, email: str, password: str = "password123"):
    """Helper para registrar, loguear y obtener headers de autorización JWT"""
    client.post("/register", json={"email": email, "password": password})
    response = client.post("/login", data={"username": email, "password": password})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def create_sample_job(client, headers, company="Stripe", position="QA Automation Engineer"):
    """Helper para crear una vacante de prueba"""
    payload = {
        "company": company,
        "position": position,
        "status": "Applied",
        "application_date": "2026-11-04",
    }
    res = client.post("/jobs", json=payload, headers=headers)
    assert res.status_code == 200
    return res.json()["id"]


def test_job_creation_creates_initial_timeline_event(client):
    headers = get_auth_headers(client, "timeline_user1@example.com")
    job_id = create_sample_job(client, headers, company="Linear", position="Test Lead")

    # 1. Consultar el timeline del trabajo
    res = client.get(f"/jobs/{job_id}/timeline", headers=headers)
    assert res.status_code == 200
    events = res.json()
    assert len(events) == 1
    initial = events[0]
    assert initial["stage"] == "Applied"
    assert initial["date"] == "2026-11-04"
    assert initial["notes"] == "Application submitted"
    assert initial["job_id"] == job_id
    assert "id" in initial

    # 2. Verificar que el evento viene embebido en GET /jobs
    jobs_res = client.get("/jobs", headers=headers)
    assert jobs_res.status_code == 200
    job_item = jobs_res.json()[0]
    assert len(job_item["timeline_events"]) == 1
    assert job_item["timeline_events"][0]["id"] == initial["id"]


def test_status_change_creates_timeline_milestone(client):
    headers = get_auth_headers(client, "timeline_user2@example.com")
    job_id = create_sample_job(client, headers, company="Datadog")

    # Cambiar estado a Interview vía PATCH
    patch_res = client.patch(f"/jobs/{job_id}", json={"status": "Interview"}, headers=headers)
    assert patch_res.status_code == 200

    timeline_res = client.get(f"/jobs/{job_id}/timeline", headers=headers)
    assert timeline_res.status_code == 200
    events = timeline_res.json()
    assert len(events) == 2
    assert events[0]["stage"] == "Applied"
    assert events[1]["stage"] == "Interview"
    assert "Moved to Interview" in events[1]["notes"]

    # Cambiar estado a Offer
    patch_res2 = client.patch(f"/jobs/{job_id}", json={"status": "Offer"}, headers=headers)
    assert patch_res2.status_code == 200

    events2 = client.get(f"/jobs/{job_id}/timeline", headers=headers).json()
    assert len(events2) == 3
    assert events2[2]["stage"] == "Offer"


def test_manual_create_and_order_timeline_events(client):
    headers = get_auth_headers(client, "timeline_user3@example.com")
    job_id = create_sample_job(client, headers)

    # Crear hito manual fechado el 2026-11-10
    event_payload = {
        "stage": "Interview",
        "date": "2026-11-10",
        "notes": "Technical Loop - System Design & Coding",
    }
    create_res = client.post(f"/jobs/{job_id}/timeline", json=event_payload, headers=headers)
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["stage"] == "Interview"
    assert created["date"] == "2026-11-10"
    assert created["notes"] == event_payload["notes"]

    # Crear hito fechado con fecha intermedia (ej. 2026-11-07)
    intermediate_payload = {
        "stage": "Interview",
        "date": "2026-11-07",
        "notes": "Recruiter Screening Call",
    }
    client.post(f"/jobs/{job_id}/timeline", json=intermediate_payload, headers=headers)

    # Verificar orden cronológico ascendente (Applied: 11-04 -> Recruiter: 11-07 -> Tech: 11-10)
    timeline = client.get(f"/jobs/{job_id}/timeline", headers=headers).json()
    assert len(timeline) == 3
    assert timeline[0]["date"] == "2026-11-04"
    assert timeline[1]["date"] == "2026-11-07"
    assert timeline[2]["date"] == "2026-11-10"


def test_update_timeline_event(client):
    headers = get_auth_headers(client, "timeline_user4@example.com")
    job_id = create_sample_job(client, headers)

    create_res = client.post(
        f"/jobs/{job_id}/timeline",
        json={"stage": "Interview", "date": "2026-11-08", "notes": "Initial date"},
        headers=headers,
    )
    event_id = create_res.json()["id"]

    # Actualizar fecha y notas
    update_res = client.put(
        f"/jobs/{job_id}/timeline/{event_id}",
        json={"date": "2026-11-12", "notes": "Rescheduled with hiring manager"},
        headers=headers,
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["date"] == "2026-11-12"
    assert updated["notes"] == "Rescheduled with hiring manager"


def test_delete_timeline_event(client):
    headers = get_auth_headers(client, "timeline_user5@example.com")
    job_id = create_sample_job(client, headers)

    create_res = client.post(
        f"/jobs/{job_id}/timeline",
        json={"stage": "Interview", "date": "2026-11-08", "notes": "Will delete"},
        headers=headers,
    )
    event_id = create_res.json()["id"]

    # Eliminar evento
    del_res = client.delete(f"/jobs/{job_id}/timeline/{event_id}", headers=headers)
    assert del_res.status_code == 200

    # Comprobar que ya no aparece en el timeline
    timeline = client.get(f"/jobs/{job_id}/timeline", headers=headers).json()
    assert all(e["id"] != event_id for e in timeline)


def test_timeline_multi_tenant_isolation(client):
    headers_user_a = get_auth_headers(client, "timeline_userA@example.com")
    headers_user_b = get_auth_headers(client, "timeline_userB@example.com")

    job_a_id = create_sample_job(client, headers_user_a)
    timeline_a = client.get(f"/jobs/{job_a_id}/timeline", headers=headers_user_a).json()
    event_a_id = timeline_a[0]["id"]

    # Usuario B intenta ver el timeline del Usuario A -> 404
    assert client.get(f"/jobs/{job_a_id}/timeline", headers=headers_user_b).status_code == 404

    # Usuario B intenta crear evento en vacante de Usuario A -> 404
    post_res = client.post(
        f"/jobs/{job_a_id}/timeline",
        json={"stage": "Offer", "date": "2026-11-15"},
        headers=headers_user_b,
    )
    assert post_res.status_code == 404

    # Usuario B intenta modificar hito de Usuario A -> 404
    put_res = client.put(
        f"/jobs/{job_a_id}/timeline/{event_a_id}",
        json={"notes": "Hacked"},
        headers=headers_user_b,
    )
    assert put_res.status_code == 404

    # Usuario B intenta eliminar hito de Usuario A -> 404
    del_res = client.delete(
        f"/jobs/{job_a_id}/timeline/{event_a_id}",
        headers=headers_user_b,
    )
    assert del_res.status_code == 404


def test_timeline_notes_max_length_validation(client):
    headers = get_auth_headers(client, "timeline_maxlen@example.com")
    job_id = create_sample_job(client, headers)

    too_long_notes = "A" * 501
    res = client.post(
        f"/jobs/{job_id}/timeline",
        json={"stage": "Interview", "date": "2026-11-12", "notes": too_long_notes},
        headers=headers,
    )
    assert res.status_code == 422

    exact_limit_notes = "B" * 500
    ok_res = client.post(
        f"/jobs/{job_id}/timeline",
        json={"stage": "Interview", "date": "2026-11-12", "notes": exact_limit_notes},
        headers=headers,
    )
    assert ok_res.status_code == 200
    assert len(ok_res.json()["notes"]) == 500


def test_legacy_timeline_notes_over_500_serialize_without_500(client, db_session):
    from datetime import date as dt_date
    import uuid
    from app import models

    headers = get_auth_headers(client, "timeline_legacy@example.com")
    job_id = create_sample_job(client, headers)

    # Simular un registro histórico en BD guardado antes del límite de 500 caracteres
    legacy_notes = "L" * 750
    legacy_event = models.JobTimelineEvent(
        id=str(uuid.uuid4()),
        job_id=job_id,
        stage="Interview",
        date=dt_date(2026, 11, 10),
        notes=legacy_notes,
    )
    db_session.add(legacy_event)
    db_session.commit()

    jobs_res = client.get("/jobs", headers=headers)
    assert jobs_res.status_code == 200
    events = jobs_res.json()[0]["timeline_events"]
    assert any(e["notes"] == legacy_notes for e in events)


def test_timeline_max_10_milestones_limit(client):
    headers = get_auth_headers(client, "timeline_limit@example.com")
    job_id = create_sample_job(client, headers)  # Crea automáticamente el hito #1 (Applied)

    # Agregar 9 hitos más hasta alcanzar el tope de 10
    for idx in range(2, 11):
        res = client.post(
            f"/jobs/{job_id}/timeline",
            json={
                "stage": "Interview",
                "date": f"2026-11-{idx + 4:02d}",
                "notes": f"Round {idx}",
            },
            headers=headers,
        )
        assert res.status_code == 200

    # El hito #11 debe ser rechazado con 400
    over_limit = client.post(
        f"/jobs/{job_id}/timeline",
        json={"stage": "Interview", "date": "2026-11-20", "notes": "Round 11"},
        headers=headers,
    )
    assert over_limit.status_code == 400
    assert "Maximum of 10" in over_limit.json()["detail"]

    # Cambiar el estado de la vacante estando en el tope sigue funcionando sin romper ni pasar de 10
    patch_res = client.patch(f"/jobs/{job_id}", json={"status": "Offer"}, headers=headers)
    assert patch_res.status_code == 200
    assert len(patch_res.json()["timeline_events"]) == 10
