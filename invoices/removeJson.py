import firebase_admin
from firebase_admin import credentials, firestore
import json, os

SERVICE_ACCOUNT_PATH = 'backend/hugo/hacktech-cce3f-firebase-adminsdk-fbsvc-16eecb3f3c.json'

cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
firebase_admin.initialize_app(cred)   # ← no databaseURL needed

fs = firestore.client()

def load_json(fn):
    with open(fn) as f:
        return json.load(f)

def delete_docs(collection, ids):
    for doc_id in ids:
        fs.collection(collection).document(doc_id).delete()
        print(f"Deleted {collection}/{doc_id}")

orders = load_json('orders.json')
parts  = load_json('parts.json')
sales  = load_json('sales.json')

delete_docs('orders', orders.keys())
delete_docs('parts',  parts.keys())
delete_docs('sales',  sales.keys())
