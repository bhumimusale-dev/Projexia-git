import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

def classify_project(title, description):
    BASE_DIR = os.path.dirname(os.path.dirname(__file__)) 
    csv_path = os.path.join(BASE_DIR, "dataset", "projexia.csv")

    if not os.path.exists(csv_path):
        return "General Research"

    try:
        df = pd.read_csv(csv_path)
        # Using Title and Abstract columns from your dataset
        X = (df["Project_Title"].astype(str) + " " + df["Abstract"].astype(str)).tolist()
        y = df["Domain"].tolist()

        text_clf = Pipeline([
            ('tfidf', TfidfVectorizer(stop_words='english')),
            ('clf', MultinomialNB()),
        ])

        text_clf.fit(X, y)
        return text_clf.predict([f"{title} {description}"])[0]
    except:
        return "Other"