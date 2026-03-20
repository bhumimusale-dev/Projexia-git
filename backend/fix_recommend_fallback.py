import os

filepath = r"c:\Users\BHUMI M\OneDrive\Desktop\Codequest\Projecxia\backend\app.py"

with open(filepath, "r", encoding="utf-8") as f:
    text = f.read()

target_block = """    except Exception as e:
        print(f"Gemini Error: {e}")
        return jsonify({"msg": "Failed to generate AI response. Please try again later."}), 500"""

fallback_replacement = """    except Exception as e:
        print(f"Gemini Error: {e}")
        error_str = str(e)
        if "429" in error_str or "Quota" in error_str or "ResourceExhausted" in error_str or "unsupported" in error_str.lower():
            try:
                from ml.recommender import get_recommendations
                # split prompt into list of query words
                rec_list = get_recommendations(prompt.split())
                if rec_list:
                    response_text = "⚠️ Gemini API Quota Exceeded / Issue. Here are similar top suggestions from our local project records (powered by BERT model):\n\n"
                    response_text += "\n".join([f"- {r}" for r in rec_list])
                    return jsonify({"recommendation": response_text}), 200
            except Exception as ml_err:
                print(f"Local Recommendations Fallback failed: {ml_err}")
                
        return jsonify({"msg": f"Failed to generate AI response. Error: {str(e)[:100]}"}), 500"""

# Normalize for secure string match
text_n = text.replace('\r\n', '\n')
target_n = target_block.replace('\r\n', '\n')
fallback_n = fallback_replacement.replace('\r\n', '\n')

print("Target found in app.py:", target_n in text_n)

if target_n in text_n:
    text_n = text_n.replace(target_n, fallback_n)
    # Restore defaults
    text_n = text_n.replace('\n', '\r\n')
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(text_n)
    print("Fallback fallback added successfully!")
else:
    print("Target block not found precisely. Could not inject fallback.")
