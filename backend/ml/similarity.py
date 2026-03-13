import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def check_similarity(title, description):
    """
    Calculate similarity between submitted project and existing projects
    using TF-IDF + Cosine Similarity
    """

    # ✅ Absolute path to CSV
    BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # backend/
    csv_path = os.path.join(BASE_DIR, "dataset", "projexia.csv")

    # ✅ Safe file load
    if not os.path.exists(csv_path):
        print("CSV file not found, returning default similarity")
        return 20

    df = pd.read_csv(csv_path)

    # Combine existing text
    existing_projects = (
        df["Project_Title"].astype(str)
        + " "
        + df["Abstract"].astype(str)
    ).tolist()

    new_project = title + " " + description

    texts = existing_projects + [new_project]

    # TF-IDF
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(texts)

    # Similarity
    similarities = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1])

    max_similarity = similarities.max() * 100

    return round(max_similarity, 2)