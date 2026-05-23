from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_db

app = Flask(__name__)

# Allow CORS for all origins (frontend communication)
CORS(app, resources={r"/api/*": {"origins": "*"}})

db = get_db()
products_collection = db["product_location"]

@app.route("/api/product_location", methods=["POST"])
def find_product_location():
    data = request.json
    product_name = data.get("product_name", "").strip()

    if not product_name:
        return jsonify({"error": "Product name is required"}), 400

    product = products_collection.find_one(
        {"product": {"$regex": f"^{product_name}$", "$options": "i"}},
        {"_id": 0}
    )

    if product:
        return jsonify({
            "product": product["product"],
            "location": f"Block {product['location'].get('block', 'Unknown')}, "
                        f"Shelf {product['location'].get('shelf', 'Unknown')}, "
                        f"Row {product['location'].get('row', 'Unknown')}"
        }), 200
    else:
        return jsonify({"message": "Product not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)  # Running on port 5001
