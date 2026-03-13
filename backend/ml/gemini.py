# ml/innovation.py (Example placeholder for advanced keyword analysis)
import nltkt
from rake_nltk import Rake # You may need: pip install rake-nltk

def extract_keywords(text):
    r = Rake()
    r.extract_keywords_from_text(text)
    return r.get_ranked_phrases()[:5]