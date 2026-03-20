from pymongo import MongoClient
from werkzeug.security import generate_password_hash

db = MongoClient('mongodb://localhost:27017/')['projexia']

# Create a clean test student account
email = "student@pvppcoe.ac.in"
password = "student123"

# Check if exists
existing = db.users.find_one({"email": email})

db.users.update_one(
    {"email": email},
    {"$set": {
        "name": "Test Student",
        "password": generate_password_hash(password),
        "role": "student", 
        "branch": "Computer Engineering",
        "year": "Final Year",
        "department": "Comps"
    }},
    upsert=True
)

print(f"✅ Test Student account seeded successfully!")
print(f"📧 Email: {email}")
print(f"🔑 Password: {password}")
print(f"🧑 Role: student")

# Dry-run Verification
import werkzeug.security
test_user = db.users.find_one({"email": email})
valid = werkzeug.security.check_password_hash(test_user["password"], password)
print(f"🔍 Backend Password Match Verification: {'SUCCESS' if valid else 'FAILED'}")
