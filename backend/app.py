import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from database import users_collection, projects_collection

# Import ML modules 
from ml.classifier import classify_project
from ml.similarity import check_similarity

app = Flask(__name__)
# Enhanced CORS to allow all headers and credentials for local dev
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# JWT CONFIG
app.config["JWT_SECRET_KEY"] = "projexia-super-secure-secret-key-123456"
jwt = JWTManager(app)

# ================= HELPER: SERIALIZATION =================
def transform_mongo_doc(doc):
    """Recursively converts MongoDB ObjectIds to strings for JSON responses."""
    if not doc:
        return None
    if isinstance(doc, list):
        return [transform_mongo_doc(d) for d in doc]
    if isinstance(doc, dict):
        doc["_id"] = str(doc["_id"]) if "_id" in doc else None
        return doc
    return doc

# ================= ROLE HELPERS =================
def get_current_user():
    email = get_jwt_identity()
    return users_collection.find_one({"email": email})

def is_teacher():
    user = get_current_user()
    return user and user["role"] == "teacher"

# ================= AUTH ROUTES =================
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if users_collection.find_one({"email": data["email"]}):
        return jsonify({"msg": "User already exists"}), 400

    users_collection.insert_one({
        "name": data["name"],
        "email": data["email"],
        "password": generate_password_hash(data["password"]),
        "role": data["role"],
        "branch": data.get("branch"),
        "year": data.get("year"),
        "department": data.get("department")
    })
    return jsonify({"msg": "Registered successfully"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = users_collection.find_one({"email": data["email"]})

    if not user or not check_password_hash(user["password"], data["password"]):
        return jsonify({"msg": "Invalid credentials"}), 401

    token = create_access_token(identity=user["email"])
    return jsonify({
        "token": token,
        "user": {
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "branch": user.get("branch"),
            "department": user.get("department")
        }
    }), 200

# ================= STUDENT LOGIC =================
@app.route("/student/submit", methods=["POST"])
@jwt_required()
def submit_project():
    user = get_current_user()
    if not user or user["role"] != "student":
        return jsonify({"msg": "Unauthorized"}), 403

    data = request.get_json()
    title = data.get("title")
    description = data.get("description")

    # Run ML analysis immediately on submission [cite: 94, 96, 98]
    domain = classify_project(title, description)
    similarity = check_similarity(title, description)

    project = {
        "student_email": user["email"],
        "student_name": user["name"],
        "title": title,
        "description": description,
        "domain": domain,
        "plagiarism_percentage": similarity,
        "status": "pending",
        "academic_year": user.get("year")
    }

    result = projects_collection.insert_one(project)
    project["_id"] = str(result.inserted_id)

    return jsonify(project), 201

@app.route("/student/projects", methods=["GET"])
@jwt_required()
def student_projects():
    user = get_current_user()
    projects = list(projects_collection.find({"student_email": user["email"]}))
    return jsonify(transform_mongo_doc(projects)), 200

# ================= TEACHER LOGIC =================
# ================= TEACHER PROJECTS =================
@app.route("/teacher/projects", methods=["GET"])
@jwt_required()
def teacher_projects():
    if not is_teacher():
        return jsonify({"msg": "Unauthorized"}), 403
    
    # Updated: Fetch all projects to ensure they show up on the dashboard
    projects = list(projects_collection.find())
    return jsonify(transform_mongo_doc(projects)), 200

# ================= UPDATE STATUS & AUTO-DELETE =================
@app.route("/teacher/update-status", methods=["POST"])
@jwt_required()
def update_status():
    if not is_teacher():
        return jsonify({"msg": "Unauthorized"}), 403

    data = request.get_json()
    title = data.get("title")
    status = data.get("status")

    if status == "rejected":
        # Requirement: Delete rejected projects immediately
        projects_collection.delete_one({"title": title})
        return jsonify({"msg": "Project rejected and deleted"}), 200
    
    # Otherwise, update to approved
    projects_collection.update_one(
        {"title": title},
        {"$set": {"status": status}}
    )
    return jsonify({"msg": f"Project {status}"}), 200

# FIXED: This route handles the "Analyze" button on the Teacher Dashboard
# ================= ANALYZE PLAGIARISM ROUTE =================
@app.route("/teacher/analyze-plagiarism", methods=["POST"])
@jwt_required()
def analyze_plagiarism():
    # 1. Verify user is a teacher [cite: 89, 156]
    if not is_teacher():
        return jsonify({"msg": "Unauthorized"}), 403

    data = request.get_json()
    title = data.get("title")
    
    # 2. Find project in MongoDB [cite: 129]
    project = projects_collection.find_one({"title": title})
    if not project:
        return jsonify({"msg": "Project not found"}), 404

    # 3. Trigger ML similarity logic [cite: 56, 94, 96]
    try:
        from ml.similarity import check_similarity
        similarity_score = check_similarity(title, project.get("description", ""))

        # 4. Update the database with the new score [cite: 129]
        projects_collection.update_one(
            {"title": title},
            {"$set": {"plagiarism_percentage": similarity_score}}
        )

        return jsonify({"similarity": similarity_score}), 200
    except Exception as e:
        print(f"ML Engine Error: {e}")
        return jsonify({"msg": str(e)}), 500

@app.route("/teacher/analytics", methods=["GET"])
@jwt_required()
def analytics():
    if not is_teacher():
        return jsonify({"msg": "Unauthorized"}), 403

    stats = {
        "total": projects_collection.count_documents({}),
        "approved": projects_collection.count_documents({"status": "approved"}),
        "pending": projects_collection.count_documents({"status": "pending"}),
        "rejected": projects_collection.count_documents({"status": "rejected"}),
    }
    
    # Domain Trend Analysis pipeline [cite: 98, 157]
    pipeline = [{"$group": {"_id": "$domain", "count": {"$sum": 1}}}]
    stats["domains"] = {item["_id"]: (item["_id"] if item["_id"] else "Unclassified") for item in projects_collection.aggregate(pipeline)}
    
    return jsonify(stats), 200

# ================= RUN =================
if __name__ == "__main__":
    app.run(debug=True, port=5000, use_reloader=False)