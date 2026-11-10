def get_auth_headers(client, email: str, password: str = "password123"):
    """Helper para registrar, loguear y obtener headers de autorización JWT"""
    client.post("/register", json={"email": email, "password": password})
    response = client.post("/login", data={"username": email, "password": password})
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def create_sample_job(client, headers, company="Netflix", position="QA Automation Engineer"):
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


def test_create_and_get_job_notes(client):
    headers = get_auth_headers(client, "notes_user1@example.com")
    job_id = create_sample_job(client, headers)

    # 1. Crear primera nota
    note1_payload = {
        "title": "HR Call Screening",
        "content": "Discussed expected salary range of 3500 USD and remote setup.",
    }
    res1 = client.post(f"/jobs/{job_id}/notes", json=note1_payload, headers=headers)
    assert res1.status_code == 200
    note1_data = res1.json()
    assert note1_data["title"] == "HR Call Screening"
    assert note1_data["content"] == note1_payload["content"]
    assert note1_data["job_id"] == job_id
    assert "id" in note1_data
    assert "created_at" in note1_data

    # 2. Crear segunda nota
    note2_payload = {
        "title": "Technical Challenge Prep",
        "content": "Focus on Playwright Page Object Model and multi-threading resilience.",
    }
    res2 = client.post(f"/jobs/{job_id}/notes", json=note2_payload, headers=headers)
    assert res2.status_code == 200
    note2_data = res2.json()

    # 3. Obtener todas las notas del trabajo y verificar orden LIFO (más reciente primero)
    get_res = client.get(f"/jobs/{job_id}/notes", headers=headers)
    assert get_res.status_code == 200
    notes_list = get_res.json()
    assert len(notes_list) == 2
    assert notes_list[0]["id"] == note2_data["id"]  # La segunda nota creada debe ir primero
    assert notes_list[1]["id"] == note1_data["id"]

    # 4. Verificar que al consultar el empleo GET /jobs, las notas vengan embebidas
    jobs_res = client.get("/jobs", headers=headers)
    assert jobs_res.status_code == 200
    jobs = jobs_res.json()
    assert len(jobs[0]["notes"]) == 2


def test_update_job_note(client):
    headers = get_auth_headers(client, "notes_user2@example.com")
    job_id = create_sample_job(client, headers)

    # Crear nota
    note_payload = {
        "title": "Initial draft",
        "content": "Draft content to be updated.",
    }
    create_res = client.post(f"/jobs/{job_id}/notes", json=note_payload, headers=headers)
    note_id = create_res.json()["id"]

    # Actualizar nota
    update_payload = {
        "title": "Refined Interview Notes",
        "content": "Updated content with final feedback.",
    }
    update_res = client.put(
        f"/jobs/{job_id}/notes/{note_id}",
        json=update_payload,
        headers=headers,
    )
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["title"] == "Refined Interview Notes"
    assert updated_data["content"] == "Updated content with final feedback."


def test_delete_job_note(client):
    headers = get_auth_headers(client, "notes_user3@example.com")
    job_id = create_sample_job(client, headers)

    # Crear nota
    create_res = client.post(
        f"/jobs/{job_id}/notes",
        json={"title": "To Delete", "content": "Will be removed soon."},
        headers=headers,
    )
    note_id = create_res.json()["id"]

    # Eliminar nota
    del_res = client.delete(f"/jobs/{job_id}/notes/{note_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["message"] == "Note deleted successfully"

    # Verificar que el listado de notas quede vacío
    get_res = client.get(f"/jobs/{job_id}/notes", headers=headers)
    assert get_res.status_code == 200
    assert len(get_res.json()) == 0


def test_cascade_delete_notes_when_job_deleted(client):
    """Verifica que al eliminar un empleo, se eliminen automáticamente sus notas en cascada"""
    headers = get_auth_headers(client, "notes_user4@example.com")
    job_id = create_sample_job(client, headers)

    # Crear nota asociada al empleo
    client.post(
        f"/jobs/{job_id}/notes",
        json={"title": "Cascade Note", "content": "Should vanish with the job."},
        headers=headers,
    )

    # Eliminar el empleo
    del_job_res = client.delete(f"/jobs/{job_id}", headers=headers)
    assert del_job_res.status_code == 200

    # Consultar notas del empleo eliminado debe responder 404 Not Found
    get_notes_res = client.get(f"/jobs/{job_id}/notes", headers=headers)
    assert get_notes_res.status_code == 404


def test_multi_tenancy_notes_isolation(client):
    """Verifica que el Usuario B no pueda ver, agregar, modificar ni borrar notas de una vacante del Usuario A"""
    headers_user_a = get_auth_headers(client, "notes_owner@example.com")
    headers_user_b = get_auth_headers(client, "notes_attacker@example.com")

    # Usuario A crea su empleo y su nota
    job_a_id = create_sample_job(client, headers_user_a, company="Secret Startup")
    note_a_res = client.post(
        f"/jobs/{job_a_id}/notes",
        json={"title": "Confidential Note", "content": "Top secret offer."},
        headers=headers_user_a,
    )
    note_a_id = note_a_res.json()["id"]

    # 1. Usuario B intenta leer las notas del Usuario A -> 404 Not Found
    res_get = client.get(f"/jobs/{job_a_id}/notes", headers=headers_user_b)
    assert res_get.status_code == 404

    # 2. Usuario B intenta agregar una nota a la vacante del Usuario A -> 404 Not Found
    res_post = client.post(
        f"/jobs/{job_a_id}/notes",
        json={"title": "Hacked", "content": "Injected note"},
        headers=headers_user_b,
    )
    assert res_post.status_code == 404

    # 3. Usuario B intenta editar la nota del Usuario A -> 404 Not Found
    res_put = client.put(
        f"/jobs/{job_a_id}/notes/{note_a_id}",
        json={"title": "Defaced", "content": "Tampered"},
        headers=headers_user_b,
    )
    assert res_put.status_code == 404

    # 4. Usuario B intenta borrar la nota del Usuario A -> 404 Not Found
    res_del = client.delete(f"/jobs/{job_a_id}/notes/{note_a_id}", headers=headers_user_b)
    assert res_del.status_code == 404

    # Confirmar que la nota original del Usuario A sigue intacta
    get_owner = client.get(f"/jobs/{job_a_id}/notes", headers=headers_user_a)
    assert get_owner.status_code == 200
    assert len(get_owner.json()) == 1
    assert get_owner.json()[0]["title"] == "Confidential Note"

