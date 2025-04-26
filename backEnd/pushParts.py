import json
import firebase_admin
from firebase_admin import credentials, firestore

def main():
    # TODO: replace with the path to your service account key
    cred = credentials.Certificate("path/to/serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    # Load the JSON array of supplier offers from supply.json
    with open("supply.json", "r") as f:
        offers = json.load(f)

    # Group offers by part_id
    parts = {}
    for o in offers:
        pid = o["part_id"]
        entry = {
            "supplier_id":       o["supplier_id"],
            "price_per_unit":    o["price_per_unit"],
            "lead_time_days":    o["lead_time_days"],
            "min_order_qty":     o["min_order_qty"],
            "reliability_rating": o["reliability_rating"]
        }
        parts.setdefault(pid, []).append(entry)

    # Write each part document under parts/{part_id}
    for part_id, suppliers in parts.items():
        doc_ref = db.collection("parts").document(part_id)
        doc_ref.set({ "suppliers": suppliers })
        print(f"➡️  parts/{part_id}  ({len(suppliers)} suppliers)")

if __name__ == "__main__":
    main()
