def test_register_user_success(client):
    response = client.post(
        "/register",
        json={"email": "tester@example.com", "password": "securepassword123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "tester@example.com"
    assert "id" in data


def test_register_duplicate_email_fails(client):
    # Registrar primer usuario
    client.post(
        "/register",
        json={"email": "duplicate@example.com", "password": "password123"},
    )

    # Intentar registrar el mismo email de nuevo
    response = client.post(
        "/register",
        json={"email": "duplicate@example.com", "password": "anotherpassword"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"


def test_login_success_returns_jwt(client):
    # Primero registrar el usuario
    client.post(
        "/register",
        json={"email": "loginuser@example.com", "password": "mypassword123"},
    )

    # Intentar login con formulario OAuth2 (data en vez de json)
    response = client.post(
        "/login",
        data={"username": "loginuser@example.com", "password": "mypassword123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password_fails(client):
    client.post(
        "/register",
        json={"email": "wrongpwd@example.com", "password": "correctpassword"},
    )

    response = client.post(
        "/login",
        data={"username": "wrongpwd@example.com", "password": "WRONGpassword"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_delete_current_user_unauthorized(client):
    # Intentar eliminar usuario sin token debe devolver 401
    response = client.delete("/users/me")
    assert response.status_code == 401


def test_delete_current_user_success(client):
    email = "delete_me@example.com"
    password = "password123"

    # Registrar usuario
    reg_res = client.post("/register", json={"email": email, "password": password})
    assert reg_res.status_code == 200

    # Iniciar sesión y obtener token
    login_res = client.post(
        "/login",
        data={"username": email, "password": password},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Crear una postulación con nota inicial para verificar borrado en cascada
    job_res = client.post(
        "/jobs",
        json={
            "company": "Cascade Tech",
            "position": "SDET",
            "status": "Applied",
            "application_date": "2026-11-13",
            "notes": "Testing cascade deletion",
        },
        headers=headers,
    )
    assert job_res.status_code == 200

    # Eliminar al usuario a través del endpoint /users/me
    delete_res = client.delete("/users/me", headers=headers)
    assert delete_res.status_code == 200
    assert delete_res.json()["message"] == "User deleted successfully"

    # Verificar que el token ya no sea válido porque el usuario ya no existe
    verify_res = client.get("/jobs", headers=headers)
    assert verify_res.status_code == 401

    # Verificar que el usuario no pueda volver a loguearse
    relogin_res = client.post(
        "/login",
        data={"username": email, "password": password},
    )
    assert relogin_res.status_code == 401

