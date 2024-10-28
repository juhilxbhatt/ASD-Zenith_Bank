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
payees_collection = db["addPayee"]
payment_collection = db["Payment"]

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


@api.route('/api/create_account', methods=['POST'])
def create_account():
    try:
        # Get data from the POST request
        data = request.get_json()

        # Log the received data
        print("Received data:", data)  # Add logging for debugging

        # Get user_id from the cookies
        user_id = request.cookies.get('user_id')
        print("User ID from cookie:", user_id)  # Log user ID

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
        print(f"Error in create_account: {str(e)}")  # Log the exception message
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
    
# Route to fetch account details by account IDs
@api.route('/api/account_details', methods=['GET'])
def get_account_details():
    try:
        # Get user_id from the cookies
        user_id = request.cookies.get('user_id')

        if not user_id:
            return jsonify({"error": "User ID not found in cookies!"}), 400

        # Convert the user_id to an ObjectId
        user_id = ObjectId(user_id)

        # Get account IDs from query parameters
        account_ids = request.args.getlist('account_ids')  # List of account IDs

        # Convert account IDs to ObjectId
        object_ids = [ObjectId(account_id) for account_id in account_ids]

        # Find accounts by IDs
        accounts = list(accounts_collection.find({"_id": {"$in": object_ids}, "userID": user_id}))

        if not accounts:
            return jsonify({"message": "No accounts found for the provided IDs."}), 404

        # Serialize account data
        serialized_accounts = []
        for account in accounts:
            serialized_accounts.append({
                "id": str(account["_id"]),
                "userID": str(account["userID"]),
                "accountType": account["accountType"],
                "balance": account["balance"],
                "status": account["status"]
            })

        return jsonify(serialized_accounts), 200

    except Exception as e:
        print(f"Error fetching account details: {e}")
        return jsonify({"error": str(e)}), 500
    
# API Endpoint to fetch user transactions based on cookies
@api.route('/api/user/transactions', methods=['GET'])
def get_user_transactions():
    try:
        # Get the user_id from the cookies
        user_id = request.cookies.get('user_id')
        if not user_id:
            return jsonify({"error": "User not found in cookies"}), 400

        # Convert user_id to ObjectId
        user_object_id = ObjectId(user_id)

        # Get the month filter if provided
        month = request.args.get('month', None)
        year = request.args.get('year', None)  # Optional year filter

        # Build the query to fetch user transactions
        query = {"user_id": user_object_id}

        if month and year:
            # Create date range for the given month and year
            start_date = datetime(int(year), int(month), 1)
            end_date = datetime(int(year), int(month) + 1, 1) if int(month) < 12 else datetime(int(year) + 1, 1, 1)
            query["date"] = {"$gte": start_date, "$lt": end_date}

        # Fetch transactions from MongoDB
        transactions = list(transactions_collection.find(query))

        return jsonify(transactions), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API Endpoint to add a transaction (Transfer/Deposit)
@api.route('/api/user/transaction', methods=['POST'])
def add_transaction():
    try:
        # Get user_id from cookies
        user_id = request.cookies.get('user_id')
        if not user_id:
            return jsonify({"error": "User not found in cookies"}), 400

        # Convert user_id to ObjectId
        user_object_id = ObjectId(user_id)

        data = request.json
        new_transaction = {
            "user_id": user_object_id,
            "type": data['type'],  # Either 'deposit' or 'transfer'
            "amount": data['amount'],
            "date": data['date'],  # Expected format 'YYYY-MM-DD'
            "category": data['category'],
            "recipient": data.get('recipient', None)  # Only relevant for transfers
        }
        transactions_collection.insert_one(new_transaction)

        return jsonify({"message": "Transaction added successfully"}), 201
    except Exception as e:
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




import logging
from flask import request, jsonify

# Configure logging
logging.basicConfig(level=logging.DEBUG)
    # Route to add a new payee
@api.route('/api/new_payee', methods=['POST'])
def new_payee():
    data = request.json
    required_fields = ['firstName', 'lastName', 'bankName', 'accountNumber', 'accountBSB']

    # Validate the required fields
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    payee = {
        'first_name': data['firstName'],
        'last_name': data['lastName'],
        'bank_name': data['bankName'],
        'account_number': data['accountNumber'],
        'account_bsb': data['accountBSB']
    }

    try:
        payees_collection.insert_one(payee)
        return jsonify({'message': 'Payee successfully added!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/api/payees', methods=['GET'])
def get_payees():
    try:
        payees = list(payees_collection.find())

        for payee in payees:
            payee["_id"] = str(payee["_id"])  # Convert ObjectId to string

        if not payees:
            return jsonify({"message": "No payees found."}), 404

        return jsonify(payees), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# Route to delete payees
@api.route('/api/delete_payees', methods=['POST'])
def delete_payees():
    data = request.json
    payee_ids = data.get('ids')

    if not payee_ids:
        return jsonify({'error': 'No payee IDs provided'}), 400

    try:
        result = payees_collection.delete_many({'_id': {'$in': [ObjectId(id) for id in payee_ids]}})
        return jsonify({'message': f'Deleted {result.deleted_count} payee(s)'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route to edit a payee
@api.route('/api/edit_payee/<payee_id>', methods=['PUT'])
def edit_payee(payee_id):
    data = request.json
    required_fields = ['firstName', 'lastName', 'bankName', 'accountNumber', 'accountBSB']

    # Validate the required fields
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    payee_update = {
        'first_name': data['firstName'],
        'last_name': data['lastName'],
        'bank_name': data['bankName'],
        'account_number': data['accountNumber'],
        'account_bsb': data['accountBSB'],
        "date_added": datetime.now()
    }

    try:
        result = payees_collection.update_one({'_id': ObjectId(payee_id)}, {'$set': payee_update})

        if result.modified_count == 0:
            return jsonify({'error': 'Payee not found or no changes made'}), 404

        return jsonify({'message': 'Payee successfully updated!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/api/schedule_payment', methods=['POST'])
def schedule_payment():
    try:
        # Extract payment_data from the request
        payment_data = request.json
        
        # Validate required fields (example)
        required_fields = ['amount', 'payee', 'paymentType', 'selectedDate']  # Change 'transferTo' to 'payee'
        for field in required_fields:
            if field not in payment_data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Save payment data to the database
        result = payment_collection.insert_one(payment_data)

        if result.inserted_id:
            return jsonify({"message": "Payment scheduled successfully!"}), 201
        else:
            return jsonify({"error": "Failed to schedule payment."}), 400

    except Exception as e:
        print(f"An error occurred while scheduling the payment: {str(e)}")  # Log the full error
        return jsonify({"error": str(e)}), 500
    
@api.route('/api/scheduled_payments', methods=['GET'])
def get_scheduled_payments():
            try:
                # Query the database to get all scheduled payments
                payments = list(payment_collection.find())

                # Prepare the data to return in a JSON-friendly format
                payment_list = []
                for payment in payments:
                    payment_list.append({
                        "_id": str(payment["_id"]),
                        "amount": payment["amount"],
                        "payee": payment["payee"],
                        "payment_type": payment["paymentType"],
                        "selected_date": payment["selectedDate"],
                        "recurrence": payment.get("recurrence", None),  # Use .get() to handle optional fields
                        "end_date": payment.get("endDate", None),
                        "is_indefinite": payment.get("isIndefinite", False)
        })

                return jsonify(payment_list), 200

            except Exception as e:
                print(f"An error occurred while fetching scheduled payments: {str(e)}")
                return jsonify({"error": str(e)}), 500



    # Route to delete a scheduled payment
@api.route('/api/delete_payment/<payment_id>', methods=['DELETE'])
def delete_payment(payment_id):
    try:
        result = payment_collection.delete_one({'_id': ObjectId(payment_id)})

        if result.deleted_count == 0:
            return jsonify({'error': 'Payment not found'}), 404

        return jsonify({'message': 'Payment successfully deleted!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500