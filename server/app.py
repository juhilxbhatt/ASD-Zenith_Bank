import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
from datetime import datetime  # Added datetime for date handling
from bson import ObjectId  # Import ObjectId for serialization and validation
import json  # Import json for custom encoding
from routes import api

# Load environment variables from .env file
load_dotenv()

# Custom JSON Encoder for handling ObjectId
class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)  # Convert ObjectId to string
        return super().default(o)

app = Flask(__name__)
app.json_encoder = JSONEncoder  # Use the custom encoder
CORS(app)

# Get the Mongo URI from the environment variables
uri = os.getenv("MONGO_URI")
if not uri:
    raise ValueError("No MONGO_URI found in environment variables")

# Connect to MongoDB
client = MongoClient(uri, server_api=ServerApi('1'))
db = client['your_db_name']  # Replace with your database name

# Test the MongoDB connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

# Example route for fetching user transactions
@app.route('/api/user/<user_id>/transactions', methods=['GET'])
def get_user_transactions(user_id):
    try:
        # Validate if user_id can be converted to ObjectId
        try:
            user_object_id = ObjectId(user_id)
        except Exception as e:
            print(f"Invalid ObjectId for user_id: {user_id}, error: {str(e)}")
            return jsonify({"error": "Invalid user_id format"}), 400

        month = request.args.get('month', None)
        print(f"Fetching transactions for user: {user_id}, month: {month}")

        # Query transactions from MongoDB
        transactions = list(db.transactions.find({"user_id": user_object_id}))

        # Optionally filter by month
        if month:
            transactions = [
                txn for txn in transactions if datetime.strptime(txn['date'], "%Y-%m-%d").strftime('%B') == month
            ]

        return jsonify(transactions), 200
    except Exception as e:
        print(f"Error fetching transactions: {str(e)}")
        return jsonify({"error": "An error occurred while fetching transactions"}), 500

# Register other routes from the routes module
app.register_blueprint(api)

if __name__ == "__main__":
    app.run(debug=True)