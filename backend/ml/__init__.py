import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def find_similar(user_text):
    user_vec = vectorizer.transform([user_text])
    similarity_scores = cosine_similarity(user_vec, vectors)[0]

    top_indexes = similarity_scores.argsort()[-5:][::-1]

    results = []

    for i in top_indexes:
        results.append({
            "title": df.iloc[i]["Project_Title"],
            "domain": df.iloc[i]["Domain"],
            "score": float(similarity_scores[i])
        })

    return results