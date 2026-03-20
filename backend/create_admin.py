from pymongo import MongoClient
from werkzeug.security import generate_password_hash

db = MongoClient('mongodb://localhost:27017/')['projexia']
db.users.update_one(
    {"email": "admin@pvppcoe.ac.in"},
    {"$set": {
        "name": "System Admin",
        "password": generate_password_hash("admin123"),
        "role": "admin",
        "department": "Administration"
    }},
    upsert=True
)
print("Admin seeded.")
