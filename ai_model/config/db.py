import pymongo

def get_db():
    try:
        mongo_client = pymongo.MongoClient("mongodb+srv://adminamlgo:amlgogo@cluster0.0bcnc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
        db = mongo_client["form_db"]  
        print("MongoDB connected successfully!")
        return db
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        exit()

