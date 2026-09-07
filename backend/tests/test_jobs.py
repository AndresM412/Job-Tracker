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
