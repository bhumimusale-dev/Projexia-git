import os

filepath = r"c:\Users\BHUMI M\OneDrive\Desktop\Codequest\Projecxia\backend\app.py"

with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

with open("headers_list.txt", "w") as f:
    f.write(f"Total lines: {len(lines)}\n")
    for i, l in enumerate(lines):
        if l.strip().startswith("# ====="):
            f.write(f"Line {i+1}: {repr(l.strip())}\n")
