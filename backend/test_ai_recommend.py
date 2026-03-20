import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("API Key not found in .env")
    exit(1)

genai.configure(api_key=api_key)

try:
    # Use the EXACT model from app.py
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    system_instruction = "You are a helpful academic advisor for a Final year CS student. The student wants project ideas. Generate 3 unique, innovative project ideas related to their prompt."
    full_prompt = f"{system_instruction}\nStudent Request: IoT based smart irrigation"

    print("Generating content...")
    response = model.generate_content(full_prompt)
    print("Response text:\n", response.text)

except Exception as e:
    print("\n[EXC] Gemini Error Exception Details:")
    print(e)
