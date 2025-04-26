import json
import firebase_admin
from firebase_admin import credentials, firestore, _apps
from dotenv import load_dotenv
import getpass
import os

# ——— Load .env and grab your service account file path —————————————
load_dotenv(override=True)
SERVICE_ACCOUNT_PATH = os.getenv("SERVICE_ACCOUNT_PATH")
if not SERVICE_ACCOUNT_PATH:
    SERVICE_ACCOUNT_PATH = getpass.getpass(
        "Enter SERVICE_ACCOUNT_PATH for Firebase service account: "
    )

# ——— Paths to your local JSON files —————————————————————————————
SALES_JSON_PATH  = 'data/sales_orders.json'
ORDERS_JSON_PATH = 'data/orders.json'
PARTS_JSON_PATH  = 'data/parts.json'
SUPPLY_JSON_PATH = 'data/supply.json'
SPEC_JSON_PATH   = 'data/specs.json'

def initialize_firebase():
    """
    Initialize the default Firebase app only once, then return Firestore client.
    """
    if not _apps:  # no apps have been initialized yet
        cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
        firebase_admin.initialize_app(cred)
    return firestore.client()

def upload_sales_orders(db):
    with open(SALES_JSON_PATH, 'r') as f:
        orders = json.load(f)

    for order in orders:
        sales_id = order.get('sales_order_id')
        if not sales_id:
            print("Skipping entry without 'sales_order_id'", order)
            continue

        db.collection('sales').document(sales_id).set({
            k: v for k, v in order.items() if k != 'sales_order_id'
        })
        print(f"Uploaded sales/{sales_id}")

def upload_orders(db):
    with open(ORDERS_JSON_PATH, 'r') as f:
        text = f.read().replace('NaN', 'null')
        orders = json.loads(text)

    for order in orders:
        order_id = order.get('order_id')
        if not order_id:
            print("Skipping entry without 'order_id'", order)
            continue

        db.collection('orders').document(order_id).set({
            k: v for k, v in order.items() if k != 'order_id'
        })
        print(f"Uploaded orders/{order_id}")

def upload_parts(db):
    with open(PARTS_JSON_PATH, 'r') as f:
        text = f.read().replace('NaN', 'null')
        parts = json.loads(text)

    for part in parts:
        part_id = part.get('part_id')
        if not part_id:
            print("Skipping entry without 'part_id'", part)
            continue

        db.collection('parts').document(part_id).set({
            k: v for k, v in part.items() if k != 'part_id'
        })
        print(f"Uploaded parts/{part_id}")

def upload_supply(db):
    with open(SUPPLY_JSON_PATH, 'r') as f:
        supply = json.load(f)

    for entry in supply:
        supplier_id = entry.get('supplier_id')
        part_id     = entry.get('part_id')
        if not supplier_id or not part_id:
            print("Skipping entry without supplier or part ID", entry)
            continue

        doc_id = f"{supplier_id}_{part_id}"
        db.collection('supply').document(doc_id).set({
            k: v for k, v in entry.items()
            if k not in ['supplier_id', 'part_id']
        })
        print(f"Uploaded supply/{doc_id}")

def upload_specs(db):
    with open(SPEC_JSON_PATH, 'r') as f:
        specs = json.load(f)

    for entry in specs:
        spec_name = entry.get('spec_name')
        if not spec_name:
            print("Skipping entry without 'spec_name'", entry)
            continue

        db.collection('specs').document(spec_name).set({
            k: v for k, v in entry.items() if k != 'spec_name'
        })
        print(f"Uploaded specs/{spec_name}")

def main():
    db = initialize_firebase()
    upload_sales_orders(db)
    upload_orders(db)
    upload_parts(db)
    upload_supply(db)
    upload_specs(db)

if __name__ == '__main__':
    main()
