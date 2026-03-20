import os

filepath = r"c:\Users\BHUMI M\OneDrive\Desktop\Codequest\Projecxia\backend\app.py"

with open(filepath, "r", encoding="utf-8") as f:
    text = f.read()

broken_target = """        return jsonify({"msg": "Failed to generate AI response. Please try again later."}), 500

@jwt_required()
def teachers_status():"""

correct_replacement = """        return jsonify({"msg": "Failed to generate AI response. Please try again later."}), 500

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
def teachers_status():"""

text_n = text.replace('\r\n', '\n')
broken_n = broken_target.replace('\r\n', '\n')
correct_n = correct_replacement.replace('\r\n', '\n')

print("Target found:", broken_n in text_n)

if broken_n in text_n:
    text_n = text_n.replace(broken_n, correct_n)
    text_n = text_n.replace('\n', '\r\n')
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(text_n)
    print("Fixed successfully!")
else:
    print("Broken target not found.")
