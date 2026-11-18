def get_auth_headers(client, email: str, password: str = "password123"):
    """Helper para registrar, loguear y obtener headers de autorización JWT"""
    client.post("/register", json={"email": email, "password": password})
    response = client.post("/login", data={"username": email, "password": password})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_unauthenticated_jobs_request_fails(client):
    # Intentar acceder sin token debe devolver 401 Unauthorized
    response_get = client.get("/jobs")
    assert response_get.status_code == 401

    response_post = client.post(
        "/jobs",
        json={
            "company": "Cloud Inc",
            "position": "DevOps Engineer",
            "status": "Applied",
            "application_date": "2026-09-07",
        },
    )
    assert response_post.status_code == 401


def test_create_and_get_user_job(client):
    headers = get_auth_headers(client, "user1@example.com")

    # Crear una nueva postulación con el schema exacto de JobApplicationCreate
    new_job = {
        "company": "Google",
        "position": "QA Automation Engineer",
        "status": "Applied",
        "application_date": "2026-09-07",
        "notes": "Remote position",
    }
    create_res = client.post("/jobs", json=new_job, headers=headers)
    assert create_res.status_code == 200
    created_data = create_res.json()
    assert created_data["position"] == "QA Automation Engineer"
    assert created_data["company"] == "Google"
    assert "id" in created_data

    # Obtener el listado del usuario
    get_res = client.get("/jobs", headers=headers)
    assert get_res.status_code == 200
    jobs_list = get_res.json()
    assert len(jobs_list) == 1
    assert jobs_list[0]["id"] == created_data["id"]


def test_update_and_delete_user_job(client):
    headers = get_auth_headers(client, "user2@example.com")

    # Crear empleo inicial
    job_payload = {
        "company": "Startup XYZ",
        "position": "Backend Developer",
        "status": "Applied",
        "application_date": "2026-09-07",
    }
    create_res = client.post("/jobs", json=job_payload, headers=headers)
    assert create_res.status_code == 200
    job_id = create_res.json()["id"]

    # Actualizar estado a Interview
    updated_payload = {
        "company": "Startup XYZ",
        "position": "Senior Backend Developer",
        "status": "Interview",
        "application_date": "2026-09-07",
    }
    update_res = client.put(f"/jobs/{job_id}", json=updated_payload, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["position"] == "Senior Backend Developer"
    assert update_res.json()["status"] == "Interview"

    # Eliminar empleo
    delete_res = client.delete(f"/jobs/{job_id}", headers=headers)
    assert delete_res.status_code == 200
    assert delete_res.json()["message"] == "Job deleted successfully"

    # Confirmar que la lista queda vacía
    get_res = client.get("/jobs", headers=headers)
    assert len(get_res.json()) == 0


def test_user_isolation_multitenancy(client):
    """Verifica que el Usuario B no pueda ver, editar o eliminar las postulaciones del Usuario A"""
    headers_user_a = get_auth_headers(client, "usera@example.com")
    headers_user_b = get_auth_headers(client, "userb@example.com")

    # Usuario A crea una postulación
    job_a = client.post(
        "/jobs",
        json={
            "company": "Meta",
            "position": "QA Lead",
            "status": "Applied",
            "application_date": "2026-09-07",
        },
        headers=headers_user_a,
    ).json()
    job_id_a = job_a["id"]

    # Usuario B consulta sus empleos -> Debe estar vacío
    get_res_b = client.get("/jobs", headers=headers_user_b)
    assert get_res_b.status_code == 200
    assert len(get_res_b.json()) == 0

    # Usuario B intenta editar el empleo de Usuario A -> Debe dar 404 Not Found
    update_res_b = client.put(
        f"/jobs/{job_id_a}",
        json={
            "company": "Meta",
            "position": "Hacked Job",
            "status": "Rejected",
            "application_date": "2026-09-07",
        },
        headers=headers_user_b,
    )
    assert update_res_b.status_code == 404

    # Usuario B intenta eliminar el empleo de Usuario A -> Debe dar 404 Not Found
    delete_res_b = client.delete(f"/jobs/{job_id_a}", headers=headers_user_b)
    assert delete_res_b.status_code == 404


def test_get_jobs_returns_newest_created_first(client):
    headers = get_auth_headers(client, "lifo_user@example.com")

    # Creamos primero job 1 con fecha de postulación futura
    client.post(
        "/jobs",
        json={
            "company": "FirstCreated",
            "position": "Dev",
            "status": "Applied",
            "application_date": "2026-12-31",
        },
        headers=headers,
    )

    # Creamos después job 2 con fecha de postulación antigua
    client.post(
        "/jobs",
        json={
            "company": "SecondCreated",
            "position": "Dev",
            "status": "Applied",
            "application_date": "2026-01-01",
        },
        headers=headers,
    )

    get_res = client.get("/jobs", headers=headers)
    assert get_res.status_code == 200
    jobs = get_res.json()
    assert len(jobs) == 2
    # El más recientemente creado debe estar de primero (LIFO)
    assert jobs[0]["company"] == "SecondCreated"
    assert jobs[1]["company"] == "FirstCreated"
    assert "created_at" in jobs[0]


def test_create_job_with_extra_fields_and_url_normalization(client):
    """Verifica normalización automática de job_url sin protocolo y valores por defecto."""
    headers = get_auth_headers(client, "extra@example.com")

    payload = {
        "company": "Shopify",
        "position": "QA Automation",
        "status": "Applied",
        "application_date": "2026-11-11",
        "job_url": "careers.shopify.com/jobs/123",
        "location": "  Toronto, Canada  ",
        "work_mode": "Hybrid",
    }
    res = client.post("/jobs", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["job_url"] == "https://careers.shopify.com/jobs/123"
    assert data["priority"] == 0
    assert data["location"] == "Toronto, Canada"
    assert data["work_mode"] == "Hybrid"
    assert data["office_address"] is None


def test_job_url_rejects_unsafe_or_invalid_schemes(client):
    """Previene inyección XSS (javascript:, data:) y esquemas no HTTP/HTTPS."""
    headers = get_auth_headers(client, "security_url@example.com")

    bad_urls = [
        "javascript:alert(1)",
        "JAVASCRIPT:alert(1)",
        "data:text/html,<script>alert(1)</script>",
        "ftp://files.example.com/job",
        "//evil.com/phishing",
        "not a valid url",
        "justoneword",
    ]
    for bad_url in bad_urls:
        res = client.post(
            "/jobs",
            json={
                "company": "Acme",
                "position": "Tester",
                "status": "Applied",
                "application_date": "2026-11-11",
                "job_url": bad_url,
            },
            headers=headers,
        )
        assert res.status_code == 422, f"Expected 422 for URL: {bad_url}"


def test_patch_job_priority_and_office_preserves_other_fields(client):
    """Verifica actualizaciones parciales con PATCH, borrado selectivo con null y preservación en PUT."""
    headers = get_auth_headers(client, "patcher@example.com")

    job = client.post(
        "/jobs",
        json={
            "company": "Vercel",
            "position": "SDET",
            "status": "Interview",
            "application_date": "2026-11-11",
            "location": "San Francisco, US",
            "work_mode": "Remote",
        },
        headers=headers,
    ).json()
    job_id = job["id"]

    # 1. Calificar prioridad con PATCH sin afectar los demás campos
    patch_prio = client.patch(
        f"/jobs/{job_id}",
        json={"priority": 5},
        headers=headers,
    )
    assert patch_prio.status_code == 200
    assert patch_prio.json()["priority"] == 5
    assert patch_prio.json()["location"] == "San Francisco, US"
    assert patch_prio.json()["work_mode"] == "Remote"

    # 2. Guardar coordenadas de oficina cacheadas con PATCH
    patch_office = client.patch(
        f"/jobs/{job_id}",
        json={
            "office_address": "440 N Barranca Ave, Covina, CA",
            "office_lat": 34.09,
            "office_lng": -117.88,
        },
        headers=headers,
    )
    assert patch_office.status_code == 200
    assert patch_office.json()["office_address"] == "440 N Barranca Ave, Covina, CA"
    assert patch_office.json()["office_lat"] == 34.09
    assert patch_office.json()["priority"] == 5

    # 3. PUT enviando solo campos básicos del formulario no borra prioridad ni oficina
    put_res = client.put(
        f"/jobs/{job_id}",
        json={
            "company": "Vercel",
            "position": "Staff SDET",
            "status": "Interview",
            "application_date": "2026-11-11",
        },
        headers=headers,
    )
    assert put_res.status_code == 200
    assert put_res.json()["position"] == "Staff SDET"
    assert put_res.json()["priority"] == 5
    assert put_res.json()["office_address"] == "440 N Barranca Ave, Covina, CA"

    # 4. PATCH con null explícito limpia los campos opcionales de oficina
    clear_office = client.patch(
        f"/jobs/{job_id}",
        json={"office_address": None, "office_lat": None, "office_lng": None},
        headers=headers,
    )
    assert clear_office.status_code == 200
    assert clear_office.json()["office_address"] is None
    assert clear_office.json()["office_lat"] is None
    assert clear_office.json()["priority"] == 5


def test_patch_job_validation_and_multitenancy(client):
    """Rechaza tipos inválidos/nulos en campos no anulables y bloquea PATCH entre usuarios."""
    owner_headers = get_auth_headers(client, "owner_patch@example.com")
    other_headers = get_auth_headers(client, "other_patch@example.com")

    job_id = client.post(
        "/jobs",
        json={
            "company": "Stripe",
            "position": "QA",
            "status": "Applied",
            "application_date": "2026-11-11",
        },
        headers=owner_headers,
    ).json()["id"]

    # Validaciones negativas (422)
    assert client.patch(f"/jobs/{job_id}", json={"priority": None}, headers=owner_headers).status_code == 422
    assert client.patch(f"/jobs/{job_id}", json={"priority": 6}, headers=owner_headers).status_code == 422
    assert client.patch(f"/jobs/{job_id}", json={"priority": -1}, headers=owner_headers).status_code == 422
    assert client.patch(f"/jobs/{job_id}", json={"work_mode": "Freelance"}, headers=owner_headers).status_code == 422
    assert client.patch(f"/jobs/{job_id}", json={"office_lat": 95.0}, headers=owner_headers).status_code == 422

    # Multi-tenancy (404)
    assert client.patch(f"/jobs/{job_id}", json={"priority": 4}, headers=other_headers).status_code == 404
