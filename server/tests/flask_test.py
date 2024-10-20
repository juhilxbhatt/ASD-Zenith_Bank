import pytest
from unittest.mock import patch, MagicMock
from flask import Flask
from bson import ObjectId  # Import ObjectId from bson
from routes import api  # Assuming this is where your blueprint is registered

@pytest.fixture
def client():
    app = Flask(__name__)
    app.register_blueprint(api)
    app.config['TESTING'] = True
    client = app.test_client()
    yield client

# 1. Test case for missing user ID in cookies
def test_create_account_missing_user_id(client):
    # Mock data for creating an account
    data = {
        "accountType": "Savings",
        "balance": 1000.00
    }

    # Send POST request without user_id cookie
    response = client.post('/api/create_account', json=data)

    # Assert that the response status is 400 (Bad Request) and the appropriate message is returned
    assert response.status_code == 400
    assert b"User ID not found in cookies!" in response.data

# 2. Test case for successful account creation
@patch('routes.accounts_collection')
@patch('routes.users_collection')
def test_create_account_success(mock_users_collection, mock_accounts_collection, client):
    # Mock the user lookup to return a valid user
    user_id = str(ObjectId())
    mock_users_collection.find_one.return_value = {"_id": user_id}

    # Mock the account insertion
    mock_result = MagicMock()
    mock_result.inserted_id = ObjectId()
    mock_accounts_collection.insert_one.return_value = mock_result

    # Mock data for creating an account
    data = {
        "accountType": "Savings",
        "balance": 1000.00
    }

    # Set the user_id as a cookie directly
    client.set_cookie('localhost', 'user_id', user_id)

    # Send the POST request to create an account
    response = client.post('/api/create_account', json=data)

    # Assert that the response status is 200 (OK) and the success message is returned
    assert response.status_code == 200
    assert b"Account created successfully!" in response.data
    assert b"account_id" in response.data

# 3. Test case for user not found
@patch('routes.accounts_collection')
@patch('routes.users_collection')
def test_create_account_user_not_found(mock_users_collection, mock_accounts_collection, client):
    # Mock the user lookup to return None (user not found)
    mock_users_collection.find_one.return_value = None

    # Mock data for creating an account
    data = {
        "accountType": "Savings",
        "balance": 1000.00
    }

    # Set a valid user_id as a cookie
    client.set_cookie('localhost', 'user_id', str(ObjectId()))

    # Send the POST request to create an account
    response = client.post('/api/create_account', json=data)

    # Assert that the response status is 404 (Not Found) and the appropriate message is returned
    assert response.status_code == 404
    assert b"User not found!" in response.data

# 4. Test case for invalid balance (non-numeric value)
@patch('routes.accounts_collection')
@patch('routes.users_collection')
def test_create_account_invalid_balance(mock_users_collection, mock_accounts_collection, client):
    # Mock the user lookup to return a valid user
    mock_users_collection.find_one.return_value = {"_id": str(ObjectId())}

    # Mock data for creating an account with invalid balance (non-numeric)
    data = {
        "accountType": "Savings",
        "balance": "invalid_balance"
    }

    # Set a valid user_id as a cookie
    client.set_cookie('localhost', 'user_id', str(ObjectId()))

    # Send the POST request to create an account
    response = client.post('/api/create_account', json=data)

    # Assert that the response status is 500 (Internal Server Error) due to invalid balance
    assert response.status_code == 500
    assert b"could not convert string to float" in response.data  # Error message from Python's float() function

# 5. Test case for database insertion failure
@patch('routes.accounts_collection')
@patch('routes.users_collection')
def test_create_account_db_insertion_failure(mock_users_collection, mock_accounts_collection, client):
    # Mock the user lookup to return a valid user
    mock_users_collection.find_one.return_value = {"_id": str(ObjectId())}

    # Mock the account insertion to raise an exception
    mock_accounts_collection.insert_one.side_effect = Exception("Database insertion failed")

    # Mock data for creating an account
    data = {
        "accountType": "Savings",
        "balance": 1000.00
    }

    # Set a valid user_id as a cookie
    client.set_cookie('localhost', 'user_id', str(ObjectId()))

    # Send the POST request to create an account
    response = client.post('/api/create_account', json=data)

    # Assert that the response status is 500 (Internal Server Error) due to database error
    assert response.status_code == 500
    assert b"Database insertion failed" in response.data