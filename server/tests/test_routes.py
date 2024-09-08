import pytest
from flask import Flask
from server.routes import api  # Assuming routes.py is in server folder

@pytest.fixture
def client():
    app = Flask(__name__)
    app.register_blueprint(api)
    app.config['TESTING'] = True
    client = app.test_client()

    yield client


def test_create_account(client):
    # Mock data for creating an account
    data = {
        "userID": "66dba291464bf428046deaf2",  # Example ObjectID
        "transactionID": "66daff5b464bf428046deaf0",
        "accountType": "Saving",
        "balance": 1000.0,
        "status": "Active"
    }

    response = client.post('/api/create_account', json=data)
    
    assert response.status_code == 200
    assert b'Account created successfully!' in response.data


def test_get_accounts(client):
    response = client.get('/api/accounts')
    assert response.status_code == 200