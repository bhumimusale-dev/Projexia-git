import os
import pandas as pd

try:
    from sentence_transformers import SentenceTransformer, util
    HAS_BERT = True
except ImportError:
    HAS_BERT = False

_model = None

def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer('all-MiniLM-L6-v2')
    return _model

def get_recommendations(interest_tags):
    """
    Get recommendations based on interest tags using BERT semantic understanding,
    falling back to keyword matching.
    """
    BASE_DIR = os.path.dirname(os.path.dirname(__file__))
    csv_path = os.path.join(BASE_DIR, "dataset", "projexia.csv")

    if not os.path.exists(csv_path):
        return []

    try:
        df = pd.read_csv(csv_path)

        # Fallback keyword match just in case
        def keyword_fallback():
            mask = df['Student_Interest_Tags'].str.contains('|'.join(interest_tags), case=False, na=False)
            return df[mask]['Project_Title'].head(5).tolist()

        if not HAS_BERT:
            return keyword_fallback()

        # Combine titles and tags/abstracts for better semantic context
        df['Search_Text'] = df['Project_Title'].astype(str) + " " + df['Student_Interest_Tags'].astype(str)
        existing_projects = df['Search_Text'].tolist()

        # Combine interest tags as the query
        user_query = " ".join(interest_tags)

        model = get_model()
        existing_embeddings = model.encode(existing_projects, convert_to_tensor=True)
        query_embedding = model.encode(user_query, convert_to_tensor=True)

        similarities = util.cos_sim(query_embedding, existing_embeddings)[0]

        # Get top indices based on similarity score
        top_indices = similarities.argsort(descending=True)[:5].tolist()
        recommendations = df.iloc[top_indices]['Project_Title'].tolist()

        return recommendations

    except Exception as e:
        print(f"Extraction Recommendation Error: {e}")
        try:
            return keyword_fallback()
        except:
            return []