import json
import firebase_admin
from firebase_admin import credentials, firestore

# Path to your service account key JSON file
SERVICE_ACCOUNT_PATH = '/home/bkhwaja/vscode/CalTech-Hacks/backEnd/hacktech-cce3f-firebase-adminsdk-fbsvc-16eecb3f3c.json'
# Paths to the JSON files
SALES_JSON_PATH = 'data/sales_orders.json'
ORDERS_JSON_PATH = 'data/orders.json'
PARTS_JSON_PATH = 'data/parts.json'
SUPPLY_JSON_PATH = 'data/supply.json'

def initialize_firebase():
    """
    Initialize Firebase app and return a Firestore client.
    """
    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)
    return firestore.client()


def upload_sales_orders(db):
    """
    Read sales_orders.json and upload each entry under 'sales/{sales_order_id}'.
    """
    with open(SALES_JSON_PATH, 'r') as f:
        orders = json.load(f)

    for order in orders:
        sales_id = order.get('sales_order_id')
        if not sales_id:
            print("Skipping entry without 'sales_order_id'", order)
            continue

        doc_ref = db.collection('sales').document(sales_id)
        data = {k: v for k, v in order.items() if k != 'sales_order_id'}
        doc_ref.set(data)
        print(f"Uploaded sales/{sales_id}")


def upload_orders(db):
    """
    Read orders.json (converting 'NaN' to null) and upload each entry under 'orders/{order_id}'.
    """
    with open(ORDERS_JSON_PATH, 'r') as f:
        text = f.read().replace('NaN', 'null')
        orders = json.loads(text)

    for order in orders:
        order_id = order.get('order_id')
        if not order_id:
            print("Skipping entry without 'order_id'", order)
            continue

        doc_ref = db.collection('orders').document(order_id)
        data = {k: v for k, v in order.items() if k != 'order_id'}
        doc_ref.set(data)
        print(f"Uploaded orders/{order_id}")


def upload_parts(db):
    """
    Read parts.json (converting 'NaN' to null) and upload each entry under 'parts/{part_id}'.
    """
    with open(PARTS_JSON_PATH, 'r') as f:
        text = f.read().replace('NaN', 'null')
        parts = json.loads(text)

    for part in parts:
        part_id = part.get('part_id')
        if not part_id:
            print("Skipping entry without 'part_id'", part)
            continue

        doc_ref = db.collection('parts').document(part_id)
        data = {k: v for k, v in part.items() if k != 'part_id'}
        doc_ref.set(data)
        print(f"Uploaded parts/{part_id}")


def upload_supply(db):
    """
    Read supply.json and upload each entry under 'supply/{supplier_id}_{part_id}'.
    """
    with open(SUPPLY_JSON_PATH, 'r') as f:
        supply = json.load(f)

    for entry in supply:
        supplier_id = entry.get('supplier_id')
        part_id = entry.get('part_id')
        if not supplier_id or not part_id:
            print("Skipping entry without supplier or part ID", entry)
            continue

        doc_id = f"{supplier_id}_{part_id}"
        doc_ref = db.collection('supply').document(doc_id)
        # Exclude the keys used in the document path
        data = {k: v for k, v in entry.items() if k not in ['supplier_id', 'part_id']}
        doc_ref.set(data)
        print(f"Uploaded supply/{doc_id}")


def main():
    db = initialize_firebase()
    upload_sales_orders(db)
    upload_orders(db)
    upload_parts(db)
    upload_supply(db)


if __name__ == '__main__':
    main()
