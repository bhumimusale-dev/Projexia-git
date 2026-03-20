import os
from sentence_transformers import SentenceTransformer

print("Pre-loading SentenceTransformer model: all-MiniLM-L6-v2")
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("Model downloaded and cached successfully!")
except Exception as e:
    print(f"Model download failed: {e}")
