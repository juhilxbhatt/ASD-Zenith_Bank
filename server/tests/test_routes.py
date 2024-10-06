import pytest
from server.routes import api  # Adjust this to the actual import path in your project
from flask import Flask

@pytest.fixture
def client():
    app = Flask(__name__)
    app.register_blueprint(api)
    app.config['TESTING'] = True
    client = app.test_client()

    yield client

def test_create_account(client):
    # Assuming your /api/create_account route takes accountType and balance
    response = client.post('/api/create_account', json={
        'accountType': 'Savings',
        'balance': 1000.00
    })
    assert response.status_code == 200
    assert 'Account created successfully!' in response.get_json()['message']

def test_get_transaction_logs(client):
    response = client.get('/api/transaction_logs')
    assert response.status_code == 200
    assert isinstance(response.get_json(), list)  # Assuming it returns a list of logs