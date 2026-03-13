from database import users_collection
from flask_bcrypt import generate_password_hash, check_password_hash


def login_user(email, password):

    user = users_collection.find_one({"email": email})

    # If user does not exist → create based on domain
    if not user:

        if email.endswith("@pvppcoe.ac.in"):
            role = "student"

        elif email.endswith("@gmail.com"):
            role = "teacher"

        else:
            return None

        hashed_password = generate_password_hash(password).decode("utf-8")

        users_collection.insert_one({
            "email": email,
            "password": hashed_password,
            "role": role
        })

        user = users_collection.find_one({"email": email})

    # Verify password
    if check_password_hash(user["password"], password):

        return {
            "id": str(user["_id"]),
            "email": user["email"],
            "role": user["role"]
        }

    return None