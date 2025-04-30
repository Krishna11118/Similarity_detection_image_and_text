from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
from datetime import datetime
from pymongo import MongoClient
from utils import generate_uid  # Your custom UID generation logic
from dotenv import load_dotenv
import traceback

# Load environment variables
load_dotenv()

app = FastAPI()

# ---------------- CORS Middleware ---------------- #
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://3000-krishna1111-textandimag-t1nngtux0hh.ws-us118.gitpod.io",
        "http://localhost:5173",
        "*"  # Optional wildcard (less secure, allow for dev only)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- MongoDB Connection ---------------- #
mongo_uri = os.getenv("MONGODB_URI")
if not mongo_uri:
    raise ValueError("MongoDB connection string is missing in environment variables.")

client = MongoClient(mongo_uri)
db = client.form_db

# ---------------- File Upload Directory ---------------- #
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ---------------- Form Endpoint ---------------- #
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
    try:
        # Generate UID
        uid = generate_uid(db)

        # Prepare form data
        form_data = {
            "uid": uid,
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

        # Save before pictures
        for picture in beforePictures:
            if picture.filename:
                file_path = f"{UPLOAD_DIR}/{datetime.now().timestamp()}_before_{picture.filename}"
                with open(file_path, "wb") as f:
                    f.write(await picture.read())
                form_data["beforePicturePaths"].append(file_path)

        # Save after pictures
        for picture in afterPictures:
            if picture.filename:
                file_path = f"{UPLOAD_DIR}/{datetime.now().timestamp()}_after_{picture.filename}"
                with open(file_path, "wb") as f:
                    f.write(await picture.read())
                form_data["afterPicturePaths"].append(file_path)

        # Insert to MongoDB
        result = db.forms.insert_one(form_data)

        return {
            "message": "Form created successfully",
            "uid": uid,
            "id": str(result.inserted_id)
        }

    except Exception as e:
        print("🚨 Error occurred:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal server error")

# ---------------- Dev Server Entry Point ---------------- #
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
