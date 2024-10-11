from flask import Blueprint, request, jsonify
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

# Create a blueprint for the API routes
api = Blueprint('api', __name__)

# Get MongoDB URI from environment variables
uri = os.getenv("MONGO_URI")
if not uri:
    raise ValueError("No MONGO_URI found in environment variables")

# Connect to MongoDB using the provided URI
client = MongoClient(uri, server_api=ServerApi('1'))

# Select the database and collection
db = client["ZenithBank"]
accounts_collection = db["Account"]
users_collection = db["User"]
transaction_logs_collection = db["TransactionLog"]
transactions_collection = db['transactions']  # Define the transactions collection

# Route to handle user login
@api.route('/api/LoginPage', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')  # Capture email from request
    password = data.get('password')

    # Find the user by email
    user = users_collection.find_one({'email': email})

    if not user:
        return jsonify({'error': 'User not found'}), 404  # User not found

    # Check the password
    if check_password_hash(user['password'], password):
        return jsonify({
            'message': 'Login successful', 
            'user': {
                'id': str(user['_id']),  # Convert ObjectId to string for JSON serialization
                'first_name': user['first_name'],
                'last_name': user['last_name'], 
                'email': user['email'], 
                'address': user.get('address', 'N/A')
            }
        }), 200  # Login successful
    else:
        return jsonify({'error': 'Invalid password'}), 401  # Invalid password

@api.route('/api/create_user', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(field in data for field in ['first_name', 'last_name', 'email', 'password']):
            return jsonify({"error": "All fields are required!"}), 400

        # Hash the password
        hashed_password = generate_password_hash(data['password'])
        
        # Create a new user with first name, last name, and hashed password
        new_user = {
            "first_name": data['first_name'],
            "last_name": data['last_name'],
            "password": hashed_password,  # Store the hashed password
            "email": data['email'],
            "address": data.get('address', "")  # Default to empty string if address not provided
        }
        
        # Insert the new user into the 'users' collection
        users_collection.insert_one(new_user)

        return jsonify({"message": "User created successfully!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@api.route('/api/check_email', methods=['GET'])
def check_email():
    email = request.args.get('email')  # Get the email from the query parameter

    if not email:
        return jsonify({"error": "Email is required!"}), 400

    # Check if the email already exists in the 'users' collection
    existing_user = users_collection.find_one({"email": email})

    if existing_user:
        return jsonify({"exists": True}), 200  # Email exists
    else:
        return jsonify({"exists": False}), 200  # Email does not exist


# Route to create a new account
@api.route('/api/create_account', methods=['POST'])
def create_account():
    try:
        # Get data from the POST request
        data = request.get_json()

        # Get user_id from the cookies
        user_id = request.cookies.get('user_id')

        if not user_id:
            return jsonify({"error": "User ID not found in cookies!"}), 400

        # Check if the user exists in the 'users' collection
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found!"}), 404

        # Prepare the account data
        new_account = {
            "userID": ObjectId(user_id),  # Use user_id from cookies
            "accountType": data['accountType'],
            "balance": float(data['balance']),
            "status": 'Active'
        }

        # Insert the new account into the 'accounts' collection
        result = accounts_collection.insert_one(new_account)

        # Return a success message with the inserted ID
        return jsonify({"message": "Account created successfully!", "account_id": str(result.inserted_id)}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to fetch all accounts
@api.route('/api/transaction_logs', methods=['GET'])
def get_transaction_logs():
    try:
        # Get user_id from the cookies
        user_id = request.cookies.get('user_id')

        if not user_id:
            return jsonify({"error": "User ID not found in cookies!"}), 400

        # Convert the user_id to an ObjectId
        user_id = ObjectId(user_id)

        # Find all accounts associated with the user
        accounts = list(accounts_collection.find({"userID": user_id}, {"_id": 1}))

        if not accounts:
            return jsonify({"message": "No accounts found for this user"}), 404

        # Extract account IDs
        account_ids = [account["_id"] for account in accounts]

        # Create query filters for transactions (multiple accounts)
        query = {"AccountID": {"$in": account_ids}}  # Match any of the user's accounts

        # Fetch the filtered transaction logs
        transaction_logs = list(transaction_logs_collection.find(
            query,
            {'Amount': 1, 'Date': 1, 'Description': 1, 'AccountID': 1, '_id': 0}
        ))

        # Create a function to serialize ObjectId
        def serialize(data):
            if isinstance(data, ObjectId):
                return str(data)
            if isinstance(data, list):
                return [serialize(item) for item in data]
            if isinstance(data, dict):
                return {key: serialize(value) for key, value in data.items()}
            return data

        # Serialize transaction logs and accounts
        serialized_transaction_logs = serialize(transaction_logs)
        serialized_accounts = serialize(accounts)

        # Create response object
        response = {
            "UserID": str(user_id),
            "TransactionLogs": serialized_transaction_logs,
            "Accounts": serialized_accounts
        }

        return jsonify(response), 200

    except Exception as e:
        print(f"Error fetching transaction logs: {e}")
        return jsonify({"error": str(e)}), 500
    
# API Endpoint to fetch user transactions
@api.route('/api/user/<user_id>/transactions', methods=['GET'])
def get_user_transactions(user_id):
    month = request.args.get('month', None)  # Optional query param for month filter
    print(f"Received request to get transactions for user: {user_id} with month filter: {month}")

    user_transactions = list(transactions_collection.find({"user_id": user_id}))
    print(f"Fetched transactions for user {user_id}: {user_transactions}")

    # Optionally filter by month
    if month:
        user_transactions = [
            txn for txn in user_transactions if datetime.strptime(txn['date'], "%Y-%m-%d").strftime('%B') == month
        ]
        print(f"Filtered transactions for month {month}: {user_transactions}")

    return jsonify(user_transactions)

# API Endpoint to add a transaction (Transfer/Deposit)
@api.route('/api/user/<user_id>/transaction', methods=['POST'])
def add_transaction(user_id):
    data = request.json
    new_transaction = {
        "user_id": user_id,
        "type": data['type'],  # Either 'deposit' or 'transfer'
        "amount": data['amount'],
        "date": data['date'],  # Expected format 'YYYY-MM-DD'
        "category": data['category'],
        "recipient": data.get('recipient', None)  # Only relevant for transfers
    }
    transactions_collection.insert_one(new_transaction)
    return jsonify({"message": "Transaction added successfully"}), 201

# Route to get all users
@api.route('/api/users', methods=['GET'])
def get_all_users():
    try:
        # Fetch all users from the 'users' collection
        users = list(users_collection.find({}, {'_id': 0}))  # Exclude the '_id' field for cleaner output

        if not users:
            return jsonify({"message": "No users found."}), 404

        return jsonify(users), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to get all AccountIDs by UserID
@api.route('/api/get_accounts_by_user', methods=['GET'])
def get_accounts_by_user():
    try:
        # Get user_id from the cookies
        user_id = request.cookies.get('user_id')

        if not user_id:
            return jsonify({"error": "User ID not found in cookies!"}), 400

        # Convert the user_id to an ObjectId (assuming MongoDB stores user IDs as ObjectIds)
        user_id = ObjectId(user_id)

        # Query the accounts collection for all accounts associated with this user
        accounts = list(accounts_collection.find({"userID": user_id}))

        if not accounts:
            return jsonify({"message": "No accounts found for this user"}), 404

        # Extract all AccountIDs and return them
        account_ids = [str(account["_id"]) for account in accounts]

        response = {
            "UserID": str(user_id),
            "AccountIDs": account_ids  # List of all associated account IDs
        }

        return jsonify(response), 200

    except Exception as e:
        print(f"Error fetching accounts by user_id: {e}")
        return jsonify({"error": str(e)}), 500
