import pytest
from flask import Flask
from server.routes import api
from unittest.mock import patch, MagicMock

@pytest.fixture
def client():
    # Create a Flask app instance for testing
    app = Flask(__name__)
    app.register_blueprint(api)
    app.config['TESTING'] = True
    client = app.test_client()
    yield client

@patch('server.routes.accounts_collection')
def test_create_account(mock_accounts_collection, client):
    # Mock data for creating an account
    data = {
        "userID": "66dba291464bf428046deaf2",  # Example ObjectID
        "transactionID": "66daff5b464bf428046deaf0",
        "accountType": "Saving",
        "balance": 1000.0,
        "status": "Active"
    }

    # Mock the insert_one method to return a successful result
    mock_result = MagicMock()
    mock_result.inserted_id = "66daff5b464bf428046deaf0"
    mock_accounts_collection.insert_one.return_value = mock_result

    # Perform the POST request to create an account
    response = client.post('/api/create_account', json=data)
    
    # Assert the response status code and message
    assert response.status_code == 200
    assert b'Account created successfully!' in response.data

@patch('server.routes.accounts_collection')
def test_get_accounts(mock_accounts_collection, client):
    # Mock the find method to return fake account data
    mock_accounts_collection.find.return_value = [
        {
            "accountType": "Saving",
            "balance": 1000.0,
            "status": "Active"
        }
    ]

    # Perform the GET request to fetch accounts
    response = client.get('/api/accounts')
    
    # Assert the response status code and content
    assert response.status_code == 200
    assert b'Saving' in response.data
    assert b'1000.0' in response.data