from database import users_collection
from flask_bcrypt import generate_password_hash, check_password_hash

ALLOWED_STUDENT_DOMAIN = "@pvppcoe.ac.in"
ALLOWED_TEACHER_DOMAIN = "@gmail.com"


def get_role_from_email(email):
    """Returns role based on email domain, or None if domain is invalid."""
    if email.endswith(ALLOWED_STUDENT_DOMAIN):
        return "student"
    elif email.endswith(ALLOWED_TEACHEaR_DOMAIN):
        return "teacher"
    return None


def login_user(email, password):
    # Enforce domain restriction upfront — reject all other domains immediately
    allowed_role = get_role_from_email(email)
    if allowed_role is None:
        return {"error": "invalid_domain"}

    user = users_collection.find_one({"email": email})

    # Auto-create new user if not found
    if not user:
        hashed_password = generate_password_hash(password).decode("utf-8")
        users_collection.insert_one({
            "email": email,
            "password": hashed_password,
            "role": allowed_role
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