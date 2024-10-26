from flask import Blueprint, request, jsonify
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os
from dotenv import load_dotenv
from bson.objectid import ObjectId
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
transactions_collection = db["Transfer"]  # Define the transactions collection specifically for transfers

# API Endpoint to add a transaction (Transfer/Deposit)
@api.route('/api/user/<user_id>/transaction', methods=['POST'])
def add_transaction(user_id):
    data = request.json
    try:
        # Validate the user's account
        sender_account_id = ObjectId(data.get('accountId'))
        sender_account = accounts_collection.find_one({"_id": sender_account_id, "userID": ObjectId(user_id)})

        if not sender_account:
            print("Sender account not found or does not belong to the user")
            return jsonify({"error": "Sender account not found or does not belong to the user"}), 404

        # If it's a transfer, verify recipient account
        recipient_account_id = data.get('recipient')
        if data['type'] == 'transfer' and recipient_account_id:
            recipient_account = accounts_collection.find_one({"_id": ObjectId(recipient_account_id)})
            if not recipient_account:
                print("Recipient account not found")
                return jsonify({"error": "Recipient account not found"}), 404

            # Check for sufficient funds if it's a transfer
            if sender_account["balance"] < data['amount']:
                print("Insufficient funds in sender's account")
                return jsonify({"error": "Insufficient funds"}), 400

        # Create the transaction log in the specific format required by MongoDB's Transfer collection
        new_transaction = {
            "AccountID": sender_account_id,
            "CategoryID": data.get('category', ""),
            "Date": datetime.strptime(data['date'], "%Y-%m-%d"),
            "Amount": data['amount'],
            "Description": data.get('description', ""),
            "recipient": ObjectId(recipient_account_id) if data['type'] == 'transfer' else None
        }

        # Insert the transaction into the 'Transfer' collection
        transactions_collection.insert_one(new_transaction)
        print("Transaction inserted successfully")

        # Optional: Update balances if necessary
        if data['type'] == 'transfer' and recipient_account_id:
            # Deduct from sender account
            accounts_collection.update_one({"_id": sender_account_id}, {"$inc": {"balance": -data['amount']}})
            # Add to recipient account
            accounts_collection.update_one({"_id": ObjectId(recipient_account_id)}, {"$inc": {"balance": data['amount']}})
            print("Balances updated successfully")

        return jsonify({"message": "Transaction added successfully"}), 201
    except Exception as e:
        print(f"Error in add_transaction: {e}")
        return jsonify({"error": "An error occurred while processing the transaction"}), 500



# Route to fetch payees for the logged-in user
@api.route('/api/user/payees', methods=['GET'])
def get_user_payees():
    try:
        # Get the user_id from the cookies
        user_id = request.cookies.get('user_id')
        if not user_id:
            return jsonify({"error": "User not found in cookies"}), 400

        # Convert user_id to ObjectId
        user_object_id = ObjectId(user_id)

        # Find the user by user_id
        user = users_collection.find_one({"_id": user_object_id})
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Retrieve the payees/recipients associated with the user
        payees = user.get("payees", [])

        return jsonify({"payees": payees}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to get all users
@api.route('/api/users', methods=['GET'])
def get_all_users():
    try:
        # Fetch all users from the 'users' collection
        users = list(users_collection.find({}, {'_id': 0}))
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

@api.route('/api/user_accounts', methods=['GET'])
def get_user_accounts():
    try:
        # Get user_id from the cookies
        user_id = request.cookies.get('user_id')

        if not user_id:
            return jsonify({"error": "User ID not found in cookies!"}), 400

        # Convert the user_id to an ObjectId
        user_id = ObjectId(user_id)

        # Find all accounts associated with the user
        accounts = list(accounts_collection.find({"userID": user_id}, {"_id": 1, "accountType": 1, "balance": 1}))
        if not accounts:
            return jsonify({"message": "No accounts found for this user"}), 404

        # Serialize accounts data to include account type and balance
        serialized_accounts = [
            {
                "id": str(account["_id"]),
                "accountType": account["accountType"],
                "balance": account["balance"]
            }
            for account in accounts
        ]

        return jsonify({"UserID": str(user_id), "Accounts": serialized_accounts}), 200

    except Exception as e:
        print(f"Error fetching user accounts: {e}")
        return jsonify({"error": str(e)}), 500
