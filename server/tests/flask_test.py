import pytest
from flask import Flask
from routes import api
from unittest.mock import patch, MagicMock


@pytest.fixture
def client():
    # Create a Flask app instance for testing
    app = Flask(__name__)
    app.register_blueprint(api)
    app.config['TESTING'] = True
    client = app.test_client()
    yield client


@patch('routes.accounts_collection')
@patch('routes.users_collection')  # Mocking users_collection to check user existence
def test_create_account(mock_users_collection, mock_accounts_collection, client):
    # Mock data for creating an account
    data = {
        "userID": "66dba291464bf428046deaf2",  # Example ObjectID
        "transactionID": "66daff5b464bf428046deaf0",
        "accountType": "Saving",
        "balance": 1000.0,
        "status": "Active"
    }

    # Mock the user existence check
    mock_users_collection.find_one.return_value = {'_id': '66dba291464bf428046deaf2'}

    # Mock the insert_one method to return a successful result
    mock_result = MagicMock()
    mock_result.inserted_id = "66daff5b464bf428046deaf0"
    mock_accounts_collection.insert_one.return_value = mock_result

    # Perform the POST request to create an account
    response = client.post('/api/create_account', json=data, headers={'Cookie': 'userID=66dba291464bf428046deaf2'})
    
    # Assert the response status code and message
    assert response.status_code == 200
    assert b'Account created successfully!' in response.data


@patch('routes.accounts_collection')
@patch('routes.users_collection')  # Mocking users_collection
def test_create_account_user_not_found(mock_users_collection, mock_accounts_collection, client):
    # Mock data for creating an account
    data = {
        "userID": "66dba291464bf428046deaf2",  # Example ObjectID
        "transactionID": "66daff5b464bf428046deaf0",
        "accountType": "Saving",
        "balance": 1000.0,
        "status": "Active"
    }

    # Mock the user existence check to return None
    mock_users_collection.find_one.return_value = None

    # Perform the POST request to create an account
    response = client.post('/api/create_account', json=data)
    
    # Assert the response status code and message
    assert response.status_code == 404
    assert b'User not found!' in response.data


@patch('routes.request.cookies.get')
@patch('routes.accounts_collection')
@patch('routes.users_collection')
def test_create_account_invalid_data(mock_users_collection, mock_accounts_collection, mock_cookies, client):
    # Mock the cookie to return the userID
    mock_cookies.return_value = '66dba291464bf428046deaf2'

    # Mock data for creating an account with invalid balance
    data = {
        "userID": "66dba291464bf428046deaf2",  # Example ObjectID
        "transactionID": "66daff5b464bf428046deaf0",
        "accountType": "Saving",
        "balance": "invalid_balance",  # Invalid balance
        "status": "Active"
    }

    # Mock the user existence check
    mock_users_collection.find_one.return_value = {'_id': '66dba291464bf428046deaf2'}

    # Perform the POST request to create an account
    response = client.post('/api/create_account', json=data)

    # Assert the response status code and error message (update based on your API's error handling)
    assert response.status_code == 400  # Assuming you handle invalid data as a 400 error
    assert b'Invalid data provided!' in response.data


@patch('routes.accounts_collection')
@patch('routes.users_collection')  # Mocking users_collection
def test_create_account_database_insertion_failure(mock_users_collection, mock_accounts_collection, client):
    # Mock data for creating an account
    data = {
        "userID": "66dba291464bf428046deaf2",  # Example ObjectID
        "transactionID": "66daff5b464bf428046deaf0",
        "accountType": "Saving",
        "balance": 1000.0,
        "status": "Active"
    }

    # Mock the user existence check
    mock_users_collection.find_one.return_value = {'_id': '66dba291464bf428046deaf2'}

    # Mock the insert_one method to raise an error
    mock_accounts_collection.insert_one.side_effect = Exception("Database insertion failed")

    # Perform the POST request to create an account
    response = client.post('/api/create_account', json=data)

    # Assert the response status code and message
    assert response.status_code == 500
    assert b'Something went wrong!' in response.data
