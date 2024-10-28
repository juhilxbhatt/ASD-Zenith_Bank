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
transactions_collection = db['transactions']  # Define the transactions collection

# Helper function to serialize ObjectId
def serialize_document(document):
    if isinstance(document, ObjectId):
        return str(document)
    elif isinstance(document, list):
        return [serialize_document(item) for item in document]
    elif isinstance(document, dict):
        return {key: serialize_document(value) for key, value in document.items()}
    else:
        return document

# Helper function to get user_id from cookies
def get_user_id_from_cookies():
    user_id = request.cookies.get('user_id')
    if not user_id:
        raise ValueError("User ID not found in cookies!")
    try:
        return ObjectId(user_id)
    except Exception as e:
        print(f"Error converting user_id to ObjectId: {e}")
        raise ValueError("Invalid user ID format")

# Route for the Monthly Bank Statement with authentication check
@api.route('/api/monthly_statement', methods=['GET'])
def get_monthly_statement():
    try:
        # Ensure the user is authenticated
        user_id = get_user_id_from_cookies()
        
        # Get month and year parameters from query
        month = int(request.args.get('month', datetime.now().month))
        year = int(request.args.get('year', datetime.now().year))

        # Date range for the given month and year
        start_date = datetime(year, month, 1)
        end_date = datetime(year, month + 1, 1) if month < 12 else datetime(year + 1, 1, 1)
        
        # Find all accounts associated with the user
        accounts = list(accounts_collection.find({"userID": user_id}, {"_id": 1}))
        if not accounts:
            return jsonify({"error": "No accounts found for this user"}), 404

        # Extract account IDs for the user
        account_ids = [account["_id"] for account in accounts]

        # Query transactions within the date range for these accounts
        query = {
            "AccountID": {"$in": account_ids},
            "Date": {"$gte": start_date, "$lt": end_date}
        }
        transactions = list(transaction_logs_collection.find(query))

        # Process the transactions to build the monthly statement summary
        total_income = sum(txn['Amount'] for txn in transactions if txn['Amount'] > 0)
        total_expense = sum(abs(txn['Amount']) for txn in transactions if txn['Amount'] < 0)

        # Format the response with summarized information and details
        response = {
            "UserID": str(user_id),
            "Month": month,
            "Year": year,
            "TotalIncome": total_income,
            "TotalExpense": total_expense,
            "Transactions": [
                {
                    "Date": txn["Date"].strftime("%Y-%m-%d"),
                    "Description": txn.get("Description", ""),
                    "Amount": txn["Amount"],
                    "AccountID": str(txn["AccountID"])
                } for txn in transactions
            ]
        }

        return jsonify(response), 200

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        print(f"Error in get_monthly_statement: {e}")
        return jsonify({"error": "An error occurred while fetching the monthly statement"}), 500

# Route to handle user login
@api.route('/api/LoginPage', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = users_collection.find_one({'email': email})
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if check_password_hash(user['password'], password):
        return jsonify({
            'message': 'Login successful', 
            'user': {
                'id': str(user['_id']),
                'first_name': user['first_name'],
                'last_name': user['last_name'], 
                'email': user['email'], 
                'address': user.get('address', 'N/A')
            }
        }), 200
    else:
        return jsonify({'error': 'Invalid password'}), 401

# Additional API endpoints (not modified for the monthly statement functionality)

# Route to create a new user
@api.route('/api/create_user', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        if not all(field in data for field in ['first_name', 'last_name', 'email', 'password']):
            return jsonify({"error": "All fields are required!"}), 400

        hashed_password = generate_password_hash(data['password'])
        
        new_user = {
            "first_name": data['first_name'],
            "last_name": data['last_name'],
            "password": hashed_password,
            "email": data['email'],
            "address": data.get('address', "")
        }
        
        users_collection.insert_one(new_user)
        return jsonify({"message": "User created successfully!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/api/check_email', methods=['GET'])
def check_email():
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email is required!"}), 400

    existing_user = users_collection.find_one({"email": email})
    if existing_user:
        return jsonify({"exists": True}), 200
    else:
        return jsonify({"exists": False}), 200

@api.route('/api/create_account', methods=['POST'])
def create_account():
    try:
        data = request.get_json()
        user_id = request.cookies.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID not found in cookies!"}), 400

        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found!"}), 404

        new_account = {
            "userID": ObjectId(user_id),
            "accountType": data['accountType'],
            "balance": float(data['balance']),
            "status": 'Active'
        }
        result = accounts_collection.insert_one(new_account)
        return jsonify({"message": "Account created successfully!", "account_id": str(result.inserted_id)}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to fetch user transactions based on cookies
@api.route('/api/user/transactions', methods=['GET'])
def get_user_transactions():
    try:
        user_id = request.cookies.get('user_id')
        if not user_id:
            return jsonify({"error": "User not found in cookies"}), 400

        user_object_id = ObjectId(user_id)
        month = request.args.get('month', None)
        year = request.args.get('year', None)

        query = {"user_id": user_object_id}
        if month and year:
            start_date = datetime(int(year), int(month), 1)
            end_date = datetime(int(year), int(month) + 1, 1) if int(month) < 12 else datetime(int(year) + 1, 1, 1)
            query["date"] = {"$gte": start_date, "$lt": end_date}

        transactions = list(transactions_collection.find(query))
        serialized_transactions = serialize_document(transactions)
        return jsonify(serialized_transactions), 200
    except Exception as e:
        print(f"Error in get_user_transactions: {e}")
        return jsonify({"error": str(e)}), 500

# API Endpoint to add a transaction (Transfer/Deposit)
@api.route('/api/user/transaction', methods=['POST'])
def add_transaction():
    try:
        user_id = request.cookies.get('user_id')
        if not user_id:
            return jsonify({"error": "User not found in cookies"}), 400

        user_object_id = ObjectId(user_id)
        data = request.json
        new_transaction = {
            "user_id": user_object_id,
            "type": data['type'],
            "amount": data['amount'],
            "date": data['date'],
            "category": data['category'],
            "recipient": data.get('recipient', None)
        }
        transactions_collection.insert_one(new_transaction)
        return jsonify({"message": "Transaction added successfully"}), 201
    except Exception as e:
        print(f"Error in add_transaction: {e}")
        return jsonify({"error": str(e)}), 500

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
