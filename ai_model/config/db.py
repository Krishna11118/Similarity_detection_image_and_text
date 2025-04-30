import pymongo
from dotenv import load_dotenv
import os
load_dotenv()

def get_db():
    try:
        mongo_url = os.getenv("MONGODB_URI")
        mongo_client = pymongo.MongoClient(mongo_url)
        # mongo_client = pymongo.MongoClient("mongodb+srv://adminamlgo:amlgogo@cluster0.0bcnc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        db = mongo_client["form_db"]  
        print("MongoDB connected successfully!")
        return db
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        exit()

