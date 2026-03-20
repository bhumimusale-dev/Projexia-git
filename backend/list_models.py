import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    with open("models_list.txt", "w") as f:
        f.write("API Key not found in .env")
    exit(1)

genai.configure(api_key=api_key)

try:
    with open("models_list.txt", "w") as f:
        f.write("Listing models:\n")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                f.write(m.name + "\n")
except Exception as e:
    with open("models_list.txt", "w") as f:
        f.write(f"Error listing models: {e}")
