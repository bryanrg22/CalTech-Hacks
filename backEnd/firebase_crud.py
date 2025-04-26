from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, firestore
from typing import Any, Dict

# Initialize FastAPI
app = FastAPI(title="Firestore CRUD API")

# Path to your service account key
SERVICE_ACCOUNT_PATH = 'hacktech-cce3f-firebase-adminsdk-fbsvc-16eecb3f3c.json'

# Initialize Firebase Admin SDK
cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
firebase_admin.initialize_app(cred)
db = firestore.client()

# Allowed collections
VALID_COLLECTIONS = {"sales", "orders", "parts", "supply"}

class DocumentData(BaseModel):
    data: Dict[str, Any]

@app.get("/api/{collection}/{doc_id}")
def get_document(collection: str, doc_id: str):
    if collection not in VALID_COLLECTIONS:
        raise HTTPException(status_code=400, detail="Invalid collection")
    doc_ref = db.collection(collection).document(doc_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc.to_dict()

@app.put("/api/{collection}/{doc_id}")
def create_or_overwrite(collection: str, doc_id: str, body: DocumentData):
    if collection not in VALID_COLLECTIONS:
        raise HTTPException(status_code=400, detail="Invalid collection")
    db.collection(collection).document(doc_id).set(body.data)
    return {"message": f"Document {collection}/{doc_id} created/overwritten."}

@app.patch("/api/{collection}/{doc_id}")
def update_fields(collection: str, doc_id: str, body: DocumentData):
    if collection not in VALID_COLLECTIONS:
        raise HTTPException(status_code=400, detail="Invalid collection")
    doc_ref = db.collection(collection).document(doc_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Document not found")
    doc_ref.update(body.data)
    return {"message": f"Document {collection}/{doc_id} updated."}

@app.delete("/api/{collection}/{doc_id}")
def delete_document(collection: str, doc_id: str):
    if collection not in VALID_COLLECTIONS:
        raise HTTPException(status_code=400, detail="Invalid collection")
    db.collection(collection).document(doc_id).delete()
    return {"message": f"Document {collection}/{doc_id} deleted."}

@app.post("/api/{collection}/{doc_id}")
def post_alias(collection: str, doc_id: str, body: DocumentData):
    # Alias for PUT
    return create_or_overwrite(collection, doc_id, body)
