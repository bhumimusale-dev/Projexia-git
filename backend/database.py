from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")

# Create / Use database
db = client["projexia"]

# Collections
users_collection = db["users"]
projects_collection = db["projects"]
settings_collection = db["settings"]