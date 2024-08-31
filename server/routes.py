from flask import Blueprint, jsonify
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import os

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Create a blueprint
api = Blueprint('api', __name__)

# Get MongoDB URI from environment variables
uri = os.getenv("MONGO_URI")
if not uri:
    raise ValueError("No MONGO_URI found in environment variables")

# Connect to MongoDB
client = MongoClient(uri, server_api=ServerApi('1'))

# Choose the database and collection
db = client["sample_analytics"]
collection = db["accounts"]

# Define an example route
@api.route('/api/data', methods=['GET'])
def get_data():
    try:
        # Fetch data from MongoDB
        data = list(collection.find({}, {'_id': 0}))
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching data: {e}")
        return jsonify({"error": "An error occurred while fetching data"}), 500