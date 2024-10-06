import pytest
from unittest.mock import patch, MagicMock
from flask import Flask
from server.routes import api  # Adjust the import path as necessary

@pytest.fixture
def client():
    app = Flask(__name__)
    app.register_blueprint(api)
    app.config['TESTING'] = True
    client = app.test_client()
    yield client

@patch('server.routes.users_collection')
@patch('server.routes.accounts_collection')
def test_create_account(mock_accounts_collection, mock_users_collection, client):
    # Mock the user lookup to return a valid user
    mock_users_collection.find_one.return_value = {"_id": "hardcoded_user_id"}
    
    # Mock the account insertion
    mock_inserted_id = MagicMock()
    mock_inserted_id.inserted_id = "mock_account_id"
    mock_accounts_collection.insert_one.return_value = mock_inserted_id
    
    # Send the POST request to create an account
    response = client.post('/api/create_account', json={
        'accountType': 'Savings',
        'balance': 1000.00
    })
    
    # Check that the response status code is 200
    assert response.status_code == 200
    assert response.get_json()['message'] == "Account created successfully!"
    assert response.get_json()['account_id'] == "mock_account_id"

def test_get_transaction_logs(client):
    # Verify the /api/transaction_logs route works and returns expected data structure
    response = client.get('/api/transaction_logs')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, dict)  # Now checking if response is a dictionary
    assert 'TransactionLogs' in data
    assert isinstance(data['TransactionLogs'], list)  # Ensure TransactionLogs is a list