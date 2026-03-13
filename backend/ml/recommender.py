import os
import pandas as pd

def get_recommendations(interest_tags):
    BASE_DIR = os.path.dirname(os.path.dirname(__file__))
    csv_path = os.path.join(BASE_DIR, "dataset", "projexia.csv")

    if not os.path.exists(csv_path):
        return []

    try:
        df = pd.read_csv(csv_path)
        # Simple keyword filtering based on Student_Interest_Tags
        mask = df['Student_Interest_Tags'].str.contains('|'.join(interest_tags), case=False, na=False)
        recommendations = df[mask]['Project_Title'].head(5).tolist()
        return recommendations
    except:
        return []