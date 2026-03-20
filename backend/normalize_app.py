import os

filepath = r"c:\Users\BHUMI M\OneDrive\Desktop\Codequest\Projecxia\backend\app.py"

with open(filepath, "r", encoding="utf-8") as f:
    text = f.read()

lines = text.splitlines()

# 1. Clean up Sparseness (Every other empty line)
clean_lines = []
i = 0
while i < len(lines):
    clean_lines.append(lines[i])
    # detect pattern where next line is blank, and line after that is not blank
    if i + 1 < len(lines) and lines[i+1].strip() == "":
        if i + 2 < len(lines) and lines[i+2].strip() != "":
            i += 1 # skip the injected blank line
    i += 1

restored_text = "\n".join(clean_lines)

# 2. Inject Grace Fallback for AI Recommendations
target_block = """    except Exception as e:
        print(f"Gemini Error: {e}")
        return jsonify({"msg": "Failed to generate AI response. Please try again later."}), 500"""

fallback_replacement = """    except Exception as e:
        print(f"Gemini Error: {e}")
        error_str = str(e)
        # Check quota or frequency limit (HTTP 429)
        if "429" in error_str or "Quota" in error_str or "ResourceExhausted" in error_str:
            try:
                from ml.recommender import get_recommendations
                rec_list = get_recommendations(prompt.split())
                if rec_list:
                    response_text = "⚠️ Gemini API Quota Exceeded. Here are local project suggestions using our local BERT model:\\n\\n"
                    response_text += "\\n".join([f"- {r}" for r in rec_list])
                    return jsonify({"recommendation": response_text}), 200
            except:
                pass
                
        return jsonify({"msg": f"Failed to generate AI response: {error_str[:100]}"}), 500"""

if target_block in restored_text:
    restored_text = restored_text.replace(target_block, fallback_replacement)
    print("Fallback injected!")
else:
    print("Grace fallback target not found exactly. Code fallback skipped.")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(restored_text + "\n")

print(f"File updated. New line count: {len(restored_text.splitlines())}")
