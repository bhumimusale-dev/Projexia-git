import os
import requests
import json

# Fetch first user from local test_users if it has one or just a mock
# In the project, creating auth header is easier if we just call local route or create token

# We can bypass route verification if we just import and call it directly!
# But testing the endpoint with requests captures any Flask routing crash!
# Since we need token, let's login first.

BASE_URL = "http://127.0.0.1:5000"

def test_route():
    # Login as student to get token
    try:
        # We need a student account, or inspect database.py
        # For simplicity, import create_access_token from app.py inside a script!
        print("Bypassing login by importing Flask app setup...")
        from app import app, get_recommendations
        # Use flask test client!
        with app.test_client() as client:
            # We must mock jwt_required() or get a token.
            # Easiest: create token using jwt_manager inside app context.
            from flask_jwt_extended import create_access_token
            with app.app_context():
                token = create_access_token(identity="student@pvppcoe.ac.in") # assume domain
                
            headers = {"Authorization": f"Bearer {token}"}
            payload = {"prompt": "IoT based irrigation", "mode": "ideas"}
            
            print("Sending request to /student/ai-recommend")
            res = client.post("/student/ai-recommend", json=payload, headers=headers)
            print("Status Code:", res.status_code)
            print("Response Data:", res.data.decode())
            
    except Exception as e:
        print("Error of test environment:", e)

test_route()
