import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def check_similarity(title, description):
    BASE_DIR = os.path.dirname(os.path.dirname(__file__))
    csv_path = os.path.join(BASE_DIR, "dataset", "projexia.csv")

    if not os.path.exists(csv_path):
        return 0.0

    try:
        df = pd.read_csv(csv_path)
        existing_projects = (df["Project_Title"].astype(str) + " " + df["Abstract"].astype(str)).tolist()
        
        texts = existing_projects + [f"{title} {description}"]
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf_matrix = vectorizer.fit_transform(texts)

        # Compare last document against all historical records
        similarities = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1])
        return round(float(similarities.max() * 100), 2)
    except:
        return 0.0