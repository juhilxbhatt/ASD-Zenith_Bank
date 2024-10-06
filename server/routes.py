from flask import Blueprint, request, jsonify
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

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

hardcoded_user_id = ObjectId("66dba291464bf428046deaf2") # Replace this with the user ID from Login
hardcoded_transaction_id = ObjectId("66daff5b464bf428046deaf0") # Replace this with the trasnaction ID from Login
hardcoded_account_id = ObjectId("66dc239b9e87d6406371e602") # Replace this with the account ID from Login

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

# Route to create a new account
@api.route('/api/create_account', methods=['POST'])
def create_account():
    try:
        # Get data from the POST request
        data = request.get_json()

        # Check if the user exists in the 'users' collection
        user = users_collection.find_one({"_id": hardcoded_user_id})
        if not user:
            return jsonify({"error": "User not found!"}), 404

        # Prepare the account data
        new_account = {
            "userID": hardcoded_user_id,
            "transactionID": hardcoded_transaction_id,
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

# Route to get All Transaction Logs
@api.route('/api/transaction_logs', methods=['GET'])
def get_transaction_logs():
    try:
        # Use hardcoded user ID
        user_id = hardcoded_user_id
        
        # Get date range from query parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        # Create query filters
        query = {"UserID": user_id}

        if start_date and end_date:
            # Convert date strings to datetime objects
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%d")

            # Add date range filter to the query
            query["Date"] = {"$gte": start_date_obj, "$lte": end_date_obj}

        # Fetch the filtered transaction logs
        transaction_logs = list(transaction_logs_collection.find(
            query,
            {'Amount': 1, 'Date': 1, 'Description': 1, '_id': 0}
        ))

        if not transaction_logs:
            return jsonify({"message": "No transaction logs found"}), 404

        # Return the User ID, Account ID, Transaction ID, and logs
        response = {
            "UserID": str(user_id),
            "AccountID": str(hardcoded_account_id),
            "TransactionID": str(hardcoded_transaction_id),
            "TransactionLogs": transaction_logs
        }

        return jsonify(response), 200

    except Exception as e:
        print(f"Error fetching transaction logs: {e}")
        return jsonify({"error": str(e)}), 500

# API Endpoint to fetch user transactions
@api.route('/api/user/<user_id>/transactions', methods=['GET'])
def get_user_transactions(user_id):
    month = request.args.get('month', None)  # Optional query param for month filter
    user_transactions = list(transactions_collection.find({"user_id": user_id}))

    # Optionally filter by month
    if month:
        user_transactions = [
            txn for txn in user_transactions if datetime.strptime(txn['date'], "%Y-%m-%d").strftime('%B') == month
        ]

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