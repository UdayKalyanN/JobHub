from fastapi import FastAPI, HTTPException,Form,UploadFile,File
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, auth,db,storage
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Firebase credentials setup
cred = credentials.Certificate("jobhunt-2002d-firebase-adminsdk-au353-75dc61f025.json")
#firebase_admin.initialize_app(cred)


firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://jobhunt-2002d-default-rtdb.firebaseio.com/',
    'storageBucket': 'jobhunt-2002d.appspot.com'
})
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

@app.post("/signup")
async def signup(email: str = Form(...),password: str = Form(...)):
    print(email,password,"nanda")
    try:
        user_record = auth.create_user(
            email=email,
            password=password
        )
        return {"message": "User created successfully", "user_id": user_record.uid}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/signin")
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
        raise HTTPException(status_code=401, detail=str(e))
    
@app.post("/updateAdditionalDetails")
async def updateDetails(Name: str=Form(...),
        Email: str=Form(...),
        YOE: str=Form(...),
        PCN:  str=Form(...),
        ECTC:  str=Form(...)):
    try:
        ref = db.reference('/users')

        # Push user data to the database
        new_user_ref = ref.push({
            "Name": Name,
            "Email": Email,
        "YOE": YOE,
        "PCN": PCN,
        "ECTC":  ECTC
        })

        return {"message": "User data stored successfully", "user_id": new_user_ref.key}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@app.post("/upload")
async def upload_pdf(email: str = Form(...), file: UploadFile = File(...)):
    try:
        metadata = None
        if email:
            metadata = {"email": email}
        blob = bucket.blob(file.filename)
        blob.metadata = metadata
        blob.upload_from_file(file.file)

        return {"message": f"File {file.filename} uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {e}")


# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)
