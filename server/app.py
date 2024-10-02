import os
from flask import Flask, jsonify, request 
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
from datetime import datetime  # Added datetime for date handling
from routes import api

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Get the Mongo URI from the env
uri = os.getenv("MONGO_URI")
if not uri:
    raise ValueError("No MONGO_URI found in environment variables")

# Connect to MongoDB
client = MongoClient(uri, server_api=ServerApi('1'))

# Define the database and collections
db = client['zenith_bank']  # Replace 'zenith_bank' with your database name
transactions_collection = db['transactions']  # Define the transactions collection
users_collection = db['users']  # Define the users collection (if necessary)

# Test the MongoDB connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

# API Endpoint to fetch user transactions
@app.route('/api/user/<user_id>/transactions', methods=['GET'])
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
@app.route('/api/user/<user_id>/transaction', methods=['POST'])
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

# Define routes
app.register_blueprint(api)

if __name__ == "__main__":
    app.run(debug=True)