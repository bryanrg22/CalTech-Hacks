from flask import Flask, request, jsonify, abort
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv
import getpass
import os

# ——— Load .env and grab your service account file path —————————————
load_dotenv()
service_account_path = os.getenv("SERVICE_ACCOUNT_PATH")
if not service_account_path:
    service_account_path = getpass.getpass(
        "Enter SERVICE_ACCOUNT_PATH for Firebase service account: "
    )
VALID_COLLECTIONS = {"sales", "orders", "parts", "supply"}

# ——— Initialize Firebase —————————————————————————————————————————
cred = credentials.Certificate(service_account_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

# --- Flask App ---------------------------------------------------------------
app = Flask(__name__)
# adjust origins as needed
CORS(app, supports_credentials=True)

# --- Helper ------------------------------------------------------------------
def check_collection(coll_name):
    if coll_name not in VALID_COLLECTIONS:
        abort(400, description=f"Invalid collection '{coll_name}'")

# --- Routes ------------------------------------------------------------------
@app.route('/api/<collection>/<doc_id>', methods=['GET'])
def get_document(collection, doc_id):
    check_collection(collection)
    doc = db.collection(collection).document(doc_id).get()
    if not doc.exists:
        abort(404, description='Document not found')
    return jsonify(doc.to_dict())

@app.route('/api/<collection>/<doc_id>', methods=['PUT', 'POST'])
def create_or_overwrite(collection, doc_id):
    check_collection(collection)
    payload = request.get_json(silent=True) or {}
    data = payload.get('data')
    if not isinstance(data, dict):
        abort(400, description="Request body must be JSON with a top-level 'data' object")
    db.collection(collection).document(doc_id).set(data)
    return jsonify({
        'message': f"Document '{collection}/{doc_id}' created or overwritten"
    })

@app.route('/api/<collection>/<doc_id>', methods=['PATCH'])
def update_fields(collection, doc_id):
    check_collection(collection)
    payload = request.get_json(silent=True) or {}
    data = payload.get('data')
    if not isinstance(data, dict):
        abort(400, description="Request body must be JSON with a top-level 'data' object")
    doc_ref = db.collection(collection).document(doc_id)
    if not doc_ref.get().exists:
        abort(404, description='Document not found')
    doc_ref.update(data)
    return jsonify({
        'message': f"Fields updated in '{collection}/{doc_id}'"
    })

@app.route('/api/<collection>/<doc_id>', methods=['DELETE'])
def delete_document(collection, doc_id):
    check_collection(collection)
    db.collection(collection).document(doc_id).delete()
    return jsonify({
        'message': f"Document '{collection}/{doc_id}' deleted"
    })

# --- Entry Point -------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
