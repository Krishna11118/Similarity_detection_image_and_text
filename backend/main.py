from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import json
from datetime import datetime
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = MongoClient(os.getenv("MONGODB_URI", "mongodb+srv://adminamlgo:amlgogo@cluster0.0bcnc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"))
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
    beforePictures: list[UploadFile] = File(None),
    afterPictures: list[UploadFile] = File(None)   
):
    # Create document for MongoDB
    form_data = {
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
    for picture in beforePictures:
        file_path = f"{UPLOAD_DIR}/{datetime.now().timestamp()}_before_{picture.filename}"
        with open(file_path, "wb") as f:
            content = await picture.read()
            f.write(content)
        form_data["beforePicturePaths"].append(file_path)

    # Handle after pictures
    for picture in afterPictures:
        file_path = f"{UPLOAD_DIR}/{datetime.now().timestamp()}_after_{picture.filename}"
        with open(file_path, "wb") as f:
            content = await picture.read()
            f.write(content)
        form_data["afterPicturePaths"].append(file_path)

    # Save to MongoDB
    result = db.form.insert_one(form_data)
    
    return {"message": "Form created successfully", "id": str(result.inserted_id)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)