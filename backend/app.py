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
from database import users_collection, projects_collection, settings_collection
import os
from dotenv import load_dotenv
import google.generativeai as genai


# Load environment variables
load_dotenv()


# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)


# Import ML modules 
from ml.classifier import classify_project
from ml.similarity import check_similarity


app = Flask(__name__)
# Enhanced CORS to allow all headers and credentials for local dev
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


# File UPLOAD Config
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


from flask import send_from_directory
@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# JWT CONFIG
app.config["JWT_SECRET_KEY"] = "projexia-super-secure-secret-key-123456"
jwt = JWTManager(app)


# ================= HELPER: SERIALIZATION =================
def transform_mongo_doc(doc):
    """Recursively converts MongoDB ObjectIds to strings for JSON responses."""
    if doc is None:
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


def is_admin():
    user = get_current_user()
    return user and user.get("role") == "admin"


# ================= AUTH ROUTES =================
ALLOWED_DOMAINS = ["@pvppcoe.ac.in", "@gmail.com"]


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email", "")


    # Enforce college domain restriction
    if not any(email.endswith(d) for d in ALLOWED_DOMAINS):
        return jsonify({"msg": "Registration is only allowed with @pvppcoe.ac.in (students) or @gmail.com (teachers) email addresses."}), 403


    if users_collection.find_one({"email": email}):
        return jsonify({"msg": "User already exists"}), 400


    users_collection.insert_one({
        "name": data["name"],
        "email": email,
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
    email = data.get("email", "")


    # Enforce college domain restriction
    if not any(email.endswith(d) for d in ALLOWED_DOMAINS):
        return jsonify({"msg": "Login is only allowed with @pvppcoe.ac.in (students) or @gmail.com (teachers) email addresses."}), 403


    user = users_collection.find_one({"email": email})


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
        return jsonify({"msg": "Unauthorized: Student role required"}), 403


    data = request.get_json()
    title = data.get("title")
    description = data.get("description")
    teacher_email = data.get("teacher_email")
    group_members = data.get("group_members", [])

    if len(group_members) != 4:
        return jsonify({"msg": "A project group must consist of exactly 4 students."}), 400

    # Ensure a student cannot belong to more than one group
    for student_id in group_members:
        existing = projects_collection.find_one({"group_members": student_id})
        if existing:
            return jsonify({"msg": f"Student already assigned to a project ({student_id})."}), 400

    # Run ML analysis immediately on submission
    domain = classify_project(title, description)
    similarity = check_similarity(title, description)

    project = {
        "student_email": user["email"],
        "student_name": user["name"],
        "group_members": group_members,
        "title": title,
        "description": description,
        "teacher_email": teacher_email,
        "domain": domain,
        "plagiarism_percentage": similarity,
        "status": "pending",
        "academic_year": user.get("year"),
        "progress": 0,
        "tasks": [],
        "documents": {}
    }

    result = projects_collection.insert_one(project)
    project["_id"] = str(result.inserted_id)

    return jsonify(project), 201


@app.route("/student/projects", methods=["GET"])
@jwt_required()
def student_projects():
    user = get_current_user()
    projects = list(projects_collection.find({"$or": [{"student_email": user["email"]}, {"group_members": user["email"]}]}))
    
    # Strictly enforce confidentiality: DO NOT send evaluation marks to the student client
    for p in projects:
        p.pop("evaluations", None)
        p.pop("rubric", None)
        
    return jsonify(transform_mongo_doc(projects)), 200


# ================= PROJECT TASK MANAGEMENT =================
@app.route("/student/add-task", methods=["POST"])
@jwt_required()
def add_task():
    user = get_current_user()
    if not user or user["role"] != "student":
        return jsonify({"msg": "Unauthorized"}), 403

    
    data = request.get_json()
    title = data.get("title")
    task_text = data.get("task")

    
    if not task_text:
        return jsonify({"msg": "Task description required"}), 400


    projects_collection.update_one(
        {"student_email": user["email"], "title": title},
        {"$push": {"tasks": {"task": task_text, "completed": False}}}
    )
    return jsonify({"msg": "Task added successfully"}), 200


@app.route("/student/toggle-task", methods=["POST"])
@jwt_required()
def toggle_task():
    user = get_current_user()
    if not user or user["role"] != "student":
        return jsonify({"msg": "Unauthorized"}), 403

    
    data = request.get_json()
    title = data.get("title")
    task_text = data.get("task")
    completed = data.get("completed") # Expects Boolean


    project = projects_collection.find_one({"student_email": user["email"], "title": title})
    if not project:
        return jsonify({"msg": "Project not found"}), 404


    tasks = project.get("tasks", [])
    for t in tasks:
        if t.get("task") == task_text:
            t["completed"] = completed
            break


    completed_count = sum(1 for t in tasks if t.get("completed"))
    progress = int((completed_count / len(tasks)) * 100) if tasks else 0


    projects_collection.update_one(
        {"student_email": user["email"], "title": title},
        {"$set": {"tasks": tasks, "progress": progress}}
    )


    return jsonify({"msg": "Task updated", "progress": progress}), 200


@app.route("/student/update-progress", methods=["POST"])
@jwt_required()
def update_progress():
    user = get_current_user()
    if not user or user["role"] != "student":
        return jsonify({"msg": "Unauthorized"}), 403

        
    data = request.get_json()
    projects_collection.update_one(
        {"student_email": user["email"], "title": data.get("title")},
        {"$set": {"progress": int(data.get("progress", 0))}}
    )
    return jsonify({"msg": "Progress updated"}), 200


# ================= PROJECT FILE UPLOADS =================
@app.route("/student/upload-document", methods=["POST"])
@jwt_required()
def upload_document():
    # 1. Verify files part [cite: 5, 8, 12, 14]
    if "file" not in request.files:
        return jsonify({"msg": "No file included"}), 400

    
    file = request.files["file"]
    title = request.form.get("title")
    file_type = request.form.get("type") # synopsis, midterm, final


    if file.filename == "":
        return jsonify({"msg": "No folder item selected"}), 400


    if file:
        safe_title = "".join(c for c in title if c.isalnum())

        
        # Safe extension extraction
        ext = "pdf"
        if "." in file.filename:
            ext = file.filename.rsplit(".", 1)[1].lower()


        filename = f"{safe_title}_{file_type}.{ext}"
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)


        # Update absolute string references securely [cite: 129]
        projects_collection.update_one(
            {"title": title},
            {"$set": {f"documents.{file_type}": f"http://127.0.0.1:5000/uploads/{filename}"}}
        )


        return jsonify({"msg": f"{file_type.capitalize()} submitted successfully"}), 200


# ================= AI RECOMMENDATIONS =================
@app.route("/student/ai-recommend", methods=["POST"])
@jwt_required()
def ai_recommend():
    user = get_current_user()
    if not user or user["role"] != "student":
        return jsonify({"msg": "Unauthorized: Student role required"}), 403


    if not os.getenv("GEMINI_API_KEY"):
        return jsonify({"msg": "AI Recommendations are currently disabled securely. Missing API Key."}), 503


    data = request.get_json()
    prompt = data.get("prompt")
    mode = data.get("mode", "ideas") # "ideas" or "refine"


    branch = user.get("branch", "General Engineering")
    department = user.get("department", "General")
    year = user.get("year", "Final")


    try:
        model = genai.GenerativeModel('gemini-2.5-flash')

        
        if mode == "ideas":
            system_instruction = f"You are a helpful academic advisor for a {year} year {branch} ({department}) student. The student wants project ideas. Generate 3 unique, innovative project ideas related to their prompt. Format clearly."
            full_prompt = f"{system_instruction}\nStudent Request: {prompt}"
        else: # refine
            system_instruction = f"You are an academic reviewer. The student has written a rough draft of their project abstract. Refine it into a professional, well-structured academic abstract suitable for a university submission."
            full_prompt = f"{system_instruction}\nRough Draft:\n{prompt}"


        response = model.generate_content(full_prompt)
        return jsonify({"recommendation": response.text}), 200


    except Exception as e:
        print(f"Gemini Error: {e}")
        error_str = str(e)
        # Check quota or frequency limit (HTTP 429)
        if "429" in error_str or "Quota" in error_str or "ResourceExhausted" in error_str:
            try:
                from ml.recommender import get_recommendations
                rec_list = get_recommendations(prompt.split())
                if rec_list:
                    response_text = "⚠️ Gemini API Quota Exceeded. Here are local project suggestions using our local BERT model:\n\n"
                    response_text += "\n".join([f"- {r}" for r in rec_list])
                    return jsonify({"recommendation": response_text}), 200
            except:
                pass
                
        return jsonify({"msg": f"Failed to generate AI response: {error_str[:100]}"}), 500


@app.route("/student/local-recommend", methods=["POST"])
@jwt_required()
def local_recommend():
    user = get_current_user()
    if not user or user["role"] != "student":
        return jsonify({"msg": "Unauthorized: Student role required"}), 403


    data = request.get_json()
    interest_tags = data.get("interest_tags", [])
    if isinstance(interest_tags, str):
        interest_tags = interest_tags.split()


    from ml.recommender import get_recommendations
    recommendations = get_recommendations(interest_tags)
    return jsonify({"recommendations": recommendations}), 200


# ================= TEACHER LOGIC =================
@app.route("/teachers/status", methods=["GET"])
@jwt_required()
def teachers_status():
    teachers = list(users_collection.find({"role": "teacher"}, {"password": 0}))
    result = []
    for t in teachers:
        approved_count = projects_collection.count_documents({
            "teacher_email": t["email"],
            "status": "approved"
        })
        t["approved_count"] = approved_count
        result.append(t)
    return jsonify(transform_mongo_doc(result)), 200


# ================= TEACHER PROJECTS =================
@app.route("/teacher/projects", methods=["GET"])
@jwt_required()
def teacher_projects():
    if not is_teacher():
        return jsonify({"msg": "Unauthorized"}), 403

    
    user = get_current_user()
    projects = list(projects_collection.find({"teacher_email": user["email"]}))
    return jsonify(transform_mongo_doc(projects)), 200


# ================= UPDATE STATUS & AUTO-DELETE =================
@app.route("/teacher/update-status", methods=["POST"])
@jwt_required()
def update_status():
    if not is_teacher():
        return jsonify({"msg": "Unauthorized"}), 403


    user = get_current_user()
    data = request.get_json()
    title = data.get("title")
    status = data.get("status")


    if status == "approved":
        current_approved = projects_collection.count_documents({
            "teacher_email": user["email"],
            "status": "approved"
        })
        if current_approved >= 5:
            return jsonify({"msg": "Maximum Group Capacity (5/5) Reached."}), 400


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


# ================= MANUAL MULTI-TIER EVALUATIONS =================
@app.route("/teacher/save-evaluations", methods=["POST"])
@jwt_required()
def save_evaluations():
    if not is_teacher():
        return jsonify({"msg": "Unauthorized"}), 403

    data = request.get_json()
    title = data.get("title")
    evals = data.get("evaluations", {})

    project = projects_collection.find_one({"title": title})
    if not project:
        return jsonify({"msg": "Project not found"}), 404

    projects_collection.update_one(
        {"title": title},
        {"$set": {"evaluations": evals}}
    )
    return jsonify({"msg": "Evaluations saved successfully"}), 200


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
    stats["domains"] = { (item["_id"] if item["_id"] else "Unclassified"): item["count"] for item in projects_collection.aggregate(pipeline) }

    
    return jsonify(stats), 200


# ================= ADMIN FACULTY WORKLOAD =================
@app.route("/admin/faculty-workload", methods=["GET"])
@jwt_required()
def faculty_workload():
    if not is_admin():
        return jsonify({"msg": "Unauthorized: Admin role required"}), 403

    teachers = list(users_collection.find({"role": "teacher"}, {"password": 0}))
    workload = []
    
    for t in teachers:
        # Get all projects for this teacher
        teacher_projects = list(projects_collection.find({"teacher_email": t["email"]}))
        
        approved = [p for p in teacher_projects if p.get("status") == "approved"]
        pending = [p for p in teacher_projects if p.get("status") == "pending"]
        
        project_list = [{
            "title": p.get("title", "Untitled"), 
            "student_name": p.get("student_name", "Unknown"), 
            "group_members": p.get("group_members", []),
            "status": p.get("status", "pending"),
            "progress": p.get("progress", 0),
            "plagiarism_percentage": p.get("plagiarism_percentage", "--"),
            "evaluations": p.get("evaluations", {})
        } for p in teacher_projects]
        
        workload.append({
            "name": t.get("name", "Unknown Faculty"),
            "email": t.get("email"),
            "department": t.get("department", "General"),
            "approved_count": len(approved),
            "pending_count": len(pending),
            "total_count": len(teacher_projects),
            "approved_students_count": len(approved) * 4,
            "projects": project_list
        })
        
    # Sort workload descending by total_count so heavily loaded teachers are on top
    workload = sorted(workload, key=lambda x: x["total_count"], reverse=True)
    
    return jsonify(transform_mongo_doc(workload)), 200


# ================= CALENDAR ROUTES =================
@app.route("/calendar", methods=["GET"])
def get_calendar():
    cal = settings_collection.find_one({"type": "calendar"})
    if not cal:
        cal = {"synopsis": "", "midterm": "", "final": ""}
    return jsonify(transform_mongo_doc(cal)), 200


@app.route("/admin/calendar", methods=["POST"])
@jwt_required()
def update_calendar():
    if not is_admin():
        return jsonify({"msg": "Unauthorized: Admin role required"}), 403
    data = request.get_json()
    settings_collection.update_one(
        {"type": "calendar"},
        {"$set": {
            "synopsis": data.get("synopsis", ""),
            "midterm": data.get("midterm", ""),
            "final": data.get("final", "")
        }},
        upsert=True
    )
    return jsonify({"msg": "Calendar updated successfully"}), 200


# ================= RUN =================
if __name__ == "__main__":
    app.run(debug=True, port=5000, use_reloader=False)
