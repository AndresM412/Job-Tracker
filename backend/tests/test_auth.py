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
