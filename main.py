from fastapi import FastAPI, HTTPException, Form, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, auth, db, storage
from firebase_admin._auth_utils import EmailAlreadyExistsError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from io import BytesIO
from datetime import datetime, timedelta
from mangum import Mangum
import os

app = FastAPI()

# Firebase credentials setup
# cred = credentials.Certificate("jobhunt-2002d-firebase-adminsdk-au353-75dc61f025.json")
#firebase_admin.initialize_app(cred)

# cred = credentials.Certificate("jobhub-e44c7-firebase-adminsdk-c3swq-626457c1f4.json") #UdayChange

cred = credentials.Certificate({
    "type": os.environ["FIREBASE_TYPE"],
    "project_id": os.environ["FIREBASE_PROJECT_ID"],
    "private_key_id": os.environ["FIREBASE_PRIVATE_KEY_ID"],
    "private_key": os.environ["FIREBASE_PRIVATE_KEY"].replace("\\n", "\n"),
    "client_email": os.environ["FIREBASE_CLIENT_EMAIL"],
    "client_id": os.environ["FIREBASE_CLIENT_ID"],
    "auth_uri": os.environ["FIREBASE_AUTH_URI"],
    "token_uri": os.environ["FIREBASE_TOKEN_URI"],
    "auth_provider_x509_cert_url": os.environ["FIREBASE_AUTH_PROVIDER_X509_CERT_URL"],
    "client_x509_cert_url": os.environ["FIREBASE_CLIENT_X509_CERT_URL"]
})

firebase_admin.initialize_app(cred, {
    'databaseURL': os.environ["FIREBASE_DATABASE_URL"],
    'storageBucket': os.environ["FIREBASE_STORAGE_BUCKET"]
})

# firebase_admin.initialize_app(cred, {
#     'databaseURL': 'https://jobhub-e44c7-default-rtdb.firebaseio.com/',  #UdayChange
#     'storageBucket': 'jobhub-e44c7.appspot.com'
# })

# firebase_admin.initialize_app(cred, {
#     'databaseURL': 'https://jobhunt-2002d-default-rtdb.firebaseio.com/',
#     'storageBucket': 'jobhunt-2002d.appspot.com'
# })
bucket = storage.bucket()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:3001","*"],  # Replace with your frontend URL
    allow_credentials=True,
    allow_methods=["GET","POST"],
    allow_headers=["*"],
)

class User(BaseModel):
    email: str
    password: str

@app.post("/api/signup")
async def signup(email: str = Form(...),password: str = Form(...)):
    print(email,password)
    try:
        user_record = auth.create_user(
            email=email,
            password=password
        )
        return {"message": "User created successfully", "user_id": user_record.uid}
    except EmailAlreadyExistsError:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/signin")
async def signin(email: str = Form(...),password: str = Form(...)):
    try:
        user_info = auth.get_user_by_email(email)
        print(user_info)
        print(user_info.uid)
        if user_info.uid:
            # Implement your sign-in logic here, such as generating tokens, etc.
            return {"message": "Signin successful", "user_id": user_info.uid}
        else:
            raise HTTPException(status_code=401, detail="Email not verified")
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=401, detail=str(e))
    
@app.post("/api/insertData")
async def insertData(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    degree: str = Form(None),
    college: str = Form(None),
    projectTitle: str = Form(None),
    projectDescription: str = Form(None),
    skills: str = Form(None),
    gender: str = Form(...),
    hasExperience: bool = Form(...),
    previousCompanyName: str = Form(None),
    previousCTC: str = Form(None),
    expectingCTC: str = Form(None),
    job_id: str = Form(...)
):
    try:
        encoded_email = email.replace(".", ",").replace("@", "*")

        # Check if user with the provided email has already applied
        existing_user_data = db.reference(f'/users/{encoded_email}').get()

        # if existing_user_data:
        #     raise HTTPException(status_code=400, detail="User with this email has already applied")

        # Validate required fields
        if not name:
            raise HTTPException(status_code=422, detail="Name is required")
        if not email:
            raise HTTPException(status_code=422, detail="Email is required")
        if not phone:
            raise HTTPException(status_code=422, detail="Phone is required")
        if not gender:
            raise HTTPException(status_code=422, detail="Gender is required")

        # Additional validation for experience fields
        if hasExperience:
            if not previousCompanyName:
                raise HTTPException(status_code=422, detail="Previous Company Name is required")
            if not previousCTC:
                raise HTTPException(status_code=422, detail="Previous CTC is required")
            if not expectingCTC:
                raise HTTPException(status_code=422, detail="Expecting CTC is required")
        else:
            # Additional validation for fresher fields
            if not degree:
                raise HTTPException(status_code=422, detail="Degree is required")
            if not college:
                raise HTTPException(status_code=422, detail="College is required")
            if not projectTitle:
                raise HTTPException(status_code=422, detail="Project Title is required")
            if not projectDescription:
                raise HTTPException(status_code=422, detail="Project Description is required")
            if not skills:
                raise HTTPException(status_code=422, detail="Skills are required")

        user_data = {
            "name": name,
            "email": email,
            "phone": phone,
            "degree": degree,
            "college": college,
            "projectTitle": projectTitle,
            "projectDescription": projectDescription,
            "skills": skills,
            "gender": gender,
            "hasExperience": hasExperience,
            "previousCompanyName": previousCompanyName,
            "previousCTC": previousCTC,
            "expectingCTC": expectingCTC,
            "job_id": job_id
        }

        db.reference(f'/users/{encoded_email}').set(user_data)

        return {"success": True, "message": "Data inserted successfully"}
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error inserting data: {str(e)}")


@app.post("/api/upload")
async def upload_pdf(email: str = Form(...), file: UploadFile = File(...)):
    try:
        if not email:
            raise HTTPException(status_code=422, detail="Email is required")
        print(email)
        metadata = {"email": email}
        blob = bucket.blob(file.filename)
        blob.metadata = metadata
        blob.upload_from_file(file.file)
        print(file.filename)
        return {"message": f"File {file.filename} uploaded successfully"}
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=500, detail=f"Error uploading file: {e}")


# ... (existing code) ...

@app.get("/api/getUserData")
async def get_user_data(email: str, job_id: str):
    print(f"Received request for user data with email: {email} and job ID: {job_id}")
    try:
        encoded_email = email.replace(".", ",").replace("@", "*")
        user_data = db.reference(f'/users/{encoded_email}').get()

        if user_data and user_data.get("job_id") == job_id:
            print(f"User data retrieved from Firebase: {user_data}")
            return user_data
        else:
            print("User data not found or job ID does not match")
            return {"message": "User data not found or job ID does not match"}
    except Exception as e:
        print(f"Error retrieving user data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving user data: {str(e)}")

@app.get("/api/getResume")
async def get_resume(email: str):
    print(f"Received request for resume with email: {email}")
    try:
        blobs = bucket.list_blobs()

        for blob in blobs:
            if blob.metadata and blob.metadata.get('email') == email:
                print(f"Resume found: {blob.name}")
                resume_url = blob.generate_signed_url(timedelta(minutes=10), method='GET')
                return {"resume_url": resume_url}

        print("Resume not found")
        return {"message": "Resume not found"}
    except Exception as e:
        print(f"Error retrieving resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving resume: {str(e)}")

def handler(event, context):
    return app(event, context)

handler = Mangum(app)


# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)