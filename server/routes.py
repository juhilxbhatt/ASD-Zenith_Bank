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

hardcoded_user_id = ObjectId("66dba291464bf428046deaf2") # Replace this with the user ID from Login
hardcoded_transaction_id = ObjectId("66daff5b464bf428046deaf0") # Replace this with the trasnaction ID from Login

# Route to create a new account
@api.route('/api/create_account', methods=['POST'])
def create_account():
    print("Create Account Called")  # Debug: Endpoint is being called
    try:
        # Get data from the POST request
        data = request.get_json()
        print("Received Data:", data)  # Debug: Print the incoming data

        # Check if the user exists in the 'users' collection
        user = users_collection.find_one({"_id": hardcoded_user_id})
        
        if not user:
            print("User not found!")  # Debug: If user doesn't exist
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
        print("Account Inserted, ID:", result.inserted_id)  # Debug: Print inserted account ID

        # Return a success message with the inserted ID
        return jsonify({"message": "Account created successfully!", "account_id": str(result.inserted_id)}), 200

    except Exception as e:
        print("Error Occurred:", e)  # Debug: Print any exceptions encountered
        return jsonify({"error": str(e)}), 500