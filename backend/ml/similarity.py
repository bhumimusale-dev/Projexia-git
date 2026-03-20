import os
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

try:
    from sentence_transformers import SentenceTransformer, util
    HAS_BERT = True
except ImportError:
    HAS_BERT = False
    from sklearn.feature_extraction.text import TfidfVectorizer

# Global model cache to avoid re-loading on every call
_model = None

def get_model():
    global _model
    if _model is None:
        # 'all-MiniLM-L6-v2' is small (~80MB), fast, and great for sentence similarity
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def check_similarity(title, description):
    """
    Calculate similarity between submitted project and existing projects
    using BERT Embeddings (fallback to TF-IDF) + Cosine Similarity
    """

    BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # backend/
    csv_path = os.path.join(BASE_DIR, "dataset", "projexia.csv")

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

    if HAS_BERT:
        try:
            model = get_model()
            existing_embeddings = model.encode(existing_projects, convert_to_tensor=True)
            new_embedding = model.encode(new_project, convert_to_tensor=True)
            
            # Use SentenceTransformer's cosine_similarity utility
            similarities = util.cos_sim(new_embedding, existing_embeddings)
            max_similarity = similarities.max().item() * 100
            return round(max_similarity, 2)
            
        except Exception as e:
            print(f"BERT similarity failed: {e}. Falling back to TF-IDF.")

    # Fallback to TF-IDF
    texts = existing_projects + [new_project]
    vectorizer = TfidfVectorizer(stop_words="english")
    tfidf_matrix = vectorizer.fit_transform(texts)

    similarities = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1])
    max_similarity = similarities.max() * 100

    return round(max_similarity, 2)