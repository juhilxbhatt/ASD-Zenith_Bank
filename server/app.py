import os
from flask import Flask
from flask_cors import CORS
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
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

# Test the MongoDB connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

# Define routes
app.register_blueprint(api)

if __name__ == "__main__":
    app.run(debug=True)