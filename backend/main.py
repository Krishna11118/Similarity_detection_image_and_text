from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
from utils import generate_uid  # Import the utility function

load_dotenv()

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://cautious-engine-r6q7q4gv74q3x447-5173.app.github.dev",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection
mongo_uri = os.getenv("MONGODB_URI")
if not mongo_uri:
    raise ValueError("MongoDB connection string is missing in environment variables.")

client = MongoClient(mongo_uri)
db = client.form_db

# Ensure uploads directory exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/api/form")
async def create_form(
    projectName: str = Form(...),
    formTheme: str = Form(...),
    dateOfIdentification: str = Form(...),
    location: str = Form(...),
    gembaUnit: str = Form(...),
    category: str = Form(...),
    subCategory: str = Form(...),
    department: str = Form(...),
    currentSituation: str = Form(...),
    rootCause: str = Form(...),
    actionTaken: str = Form(...),
    standardization: str = Form(...),
    dateOfCompletion: str = Form(...),
    beforePictures: List[UploadFile] = File([]),
    afterPictures: List[UploadFile] = File([])   
):
    # Generate unique UID
    uid = generate_uid(db)

    form_data = {
        "uid": uid,  # Store the generated UID
        "projectName": projectName,
        "formTheme": formTheme,
        "dateOfIdentification": dateOfIdentification,
        "location": location,
        "gembaUnit": gembaUnit,
        "category": category,
        "subCategory": subCategory,
        "department": department,
        "currentSituation": currentSituation,
        "rootCause": rootCause,
        "actionTaken": actionTaken,
        "standardization": standardization,
        "dateOfCompletion": dateOfCompletion,
        "beforePicturePaths": [],
        "afterPicturePaths": [],
        "createdAt": datetime.utcnow()
    }

    # Handle before pictures
    if beforePictures:
        for picture in beforePictures:
            if picture.filename:  # Ensure it's not an empty file
                file_path = f"{UPLOAD_DIR}/{datetime.now().timestamp()}_before_{picture.filename}"
                with open(file_path, "wb") as f:
                    content = await picture.read()
                    f.write(content)
                form_data["beforePicturePaths"].append(file_path)

    # Handle after pictures
    if afterPictures:
        for picture in afterPictures:
            if picture.filename:
                file_path = f"{UPLOAD_DIR}/{datetime.now().timestamp()}_after_{picture.filename}"
                with open(file_path, "wb") as f:
                    content = await picture.read()
                    f.write(content)
                form_data["afterPicturePaths"].append(file_path)

    # Save to MongoDB
    result = db.forms.insert_one(form_data)
    return {"message": "Form created successfully", "uid": uid, "id": str(result.inserted_id)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
