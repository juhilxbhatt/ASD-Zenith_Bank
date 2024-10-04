from flask import Blueprint, request, jsonify
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId

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

from datetime import datetime

# Route to handle user login
@api.route('/api/LoginPage', methods=['POST'])
def login():
    try:
        # Get data from the POST request
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({"error": "Username and password are required!"}), 400

        # Find the user in the 'users' collection
        user = users_collection.find_one({"username": username})
        if not user:
            return jsonify({"error": "Invalid username or password!"}), 401

        # Check if the password matches
        if not check_password_hash(user['password'], password):
            return jsonify({"error": "Invalid username or password!"}), 401

        # Return a success message
        return jsonify({"message": "Login successful!", "user_id": str(user['_id'])}), 200

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
        # new transaction log
        #new_transaction_log = {
        #    "UserID": "66dba291464bf428046deaf2",
        #    "AccountID": "66daff5b464bf428046deaf0",
        #    "CategoryID": "Water Bill",
        #    "Amount": 100.00,
        #    "Date": datetime.now(),  # Store date as an ISODate
        #    "Description": "Payment"
        #}

        # Insert into MongoDB
        #result = transaction_logs_collection.insert_one(new_transaction_log)
        #print(result)

        # Extract UserID from query parameters
        user_id = hardcoded_user_id
        if not user_id:
            print("UserID not provided in the request")  # Debugging message
            return jsonify({"error": "UserID is required"}), 400

        # Fetch only the Amount, Date, and Description for the specific UserID
        transaction_logs = list(transaction_logs_collection.find(
            {"UserID": user_id},
            {'Amount': 1, 'Date': 1, 'Description': 1, '_id': 0}
        ))  # Project specific fields

        if not transaction_logs:
            return jsonify({"message": "No transaction logs found for this UserID"}), 404

        return jsonify(transaction_logs), 200

    except Exception as e:
        print(f"Error fetching transaction logs: {e}")  # Debugging error message
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