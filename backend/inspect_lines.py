import os

filepath = r"c:\Users\BHUMI M\OneDrive\Desktop\Codequest\Projecxia\backend\app.py"

with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if "Gemini Error" in l:
        print(f"Line {i+1}: {repr(l)}")
        # Print lines before and after
        if i > 0:
            print(f"Line {i}: {repr(lines[i-1])}")
        if i < len(lines) - 1:
            print(f"Line {i+2}: {repr(lines[i+1])}")
