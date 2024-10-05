import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
from datetime import datetime  # Added datetime for date handling
from bson import ObjectId  # Import ObjectId for serialization
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

# Define an example route for fetching user transactions
@app.route('/api/user/<user_id>/transactions', methods=['GET'])
def get_user_transactions(user_id):
    try:
        transactions = list(db.transactions.find({"user_id": ObjectId(user_id)}))
        return jsonify(transactions)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Register other routes from the routes module
app.register_blueprint(api)

if __name__ == "__main__":
    app.run(debug=True)
