import pandas as pd
import os

DATASET_PATH = os.path.join(os.path.dirname(__file__), '../dataset/Projecxia.csv')

def get_trending_analytics():
    df = pd.read_csv(DATASET_PATH)
    # Get top 5 domains and technologies
    top_domains = df['Domain'].value_counts().head(5).to_dict()
    top_tech = df['Technology'].value_counts().head(5).to_dict()
    
    return {
        "popular_domains": top_domains,
        "popular_tech": top_tech,
        "total_records": len(df)
    }