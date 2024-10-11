import pytest
from unittest.mock import patch, MagicMock
from flask import Flask
from bson import ObjectId  # Import ObjectId from bson
from server.routes import api  # Adjust the import path as necessary

@pytest.fixture
def client():
    app = Flask(__name__)
    app.register_blueprint(api)
    app.config['TESTING'] = True
    client = app.test_client()
    yield client

# Update test for create_account route
@patch('server.routes.users_collection')
@patch('server.routes.accounts_collection')
def test_create_account(mock_accounts_collection, mock_users_collection, client):
    # Use a valid ObjectId
    valid_user_id = str(ObjectId())

    # Mock the user lookup to return a valid user with an ObjectId
    mock_users_collection.find_one.return_value = {"_id": valid_user_id}

    # Mock the account insertion
    mock_inserted_id = MagicMock()
    mock_inserted_id.inserted_id = "mock_account_id"
    mock_accounts_collection.insert_one.return_value = mock_inserted_id

    # Set the user_id as a cookie directly
    client.set_cookie('user_id', valid_user_id)

    # Send the POST request to create an account
    response = client.post('/api/create_account', json={
        'accountType': 'Savings',
        'balance': 1000.00
    })

    # Check that the response status code is 200
    assert response.status_code == 200
    assert response.get_json()['message'] == "Account created successfully!"
    assert response.get_json()['account_id'] == "mock_account_id"

# Update test for get_transaction_logs route
@patch('server.routes.transaction_logs_collection')
@patch('server.routes.accounts_collection')
def test_get_transaction_logs(mock_accounts_collection, mock_transaction_logs_collection, client):
    # Use a valid ObjectId
    valid_user_id = str(ObjectId())

    # Set the user_id as a cookie directly
    client.set_cookie('user_id', valid_user_id)

    # Mock the accounts lookup
    mock_accounts_collection.find.return_value = [{"_id": "mock_account_id"}]

    # Mock the transaction logs lookup
    mock_transaction_logs_collection.find.return_value = [{
        "Amount": 100.0,
        "Date": "2023-10-01",
        "Description": "Deposit",
        "AccountID": "mock_account_id"
    }]

    # Send the GET request to fetch transaction logs
    response = client.get('/api/transaction_logs')

    # Check that the response status code is 200
    assert response.status_code == 200
    data = response.get_json()

    # Validate the structure and content of the response
    assert isinstance(data, dict)  # Ensure the response is a dictionary
    assert 'TransactionLogs' in data
    assert isinstance(data['TransactionLogs'], list)  # Ensure TransactionLogs is a list
    assert 'Accounts' in data
    assert isinstance(data['Accounts'], list)  # Ensure Accounts is a list

    # Additional checks on the content of the response
    assert len(data['TransactionLogs']) > 0
    assert data['TransactionLogs'][0]['Amount'] == 100.0
    assert data['TransactionLogs'][0]['Description'] == "Deposit"
    assert data['TransactionLogs'][0]['AccountID'] == "mock_account_id"