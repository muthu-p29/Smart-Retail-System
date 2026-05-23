from flask import Blueprint, request, jsonify
import requests
import logging
from database import get_db
from bson import ObjectId

# Setup logging
logging.basicConfig(level=logging.INFO)

# Create a Blueprint
scanned_products_bp = Blueprint("scanned_products", __name__)

# Database connection
db = get_db()
customers_collection = db["customers"]

# ✅ Submit Scanned Product
@scanned_products_bp.route("/api/submit_qr_product", methods=["POST"])
def submit_qr_product():
    try:
        data = request.json
        phone = data.get("phone")
        product_name = data.get("product")
        price = data.get("price", 0)

        if not phone or not product_name:
            return jsonify({"success": False, "message": "Missing phone or product"}), 400

        # 🔵 Fetch product location
        try:
            response = requests.post("http://127.0.0.1:5001/api/product_location", json={"product_name": product_name})
            product_data = response.json()
            location = product_data.get("location", "Location not found")
        except Exception as e:
            logging.error(f"Error fetching product location: {str(e)}")
            location = "Error fetching location"

        # 🔵 Save product for customer with a unique ID for each product
        product_id = str(ObjectId())  # Generate a unique ID for the product
        customers_collection.update_one(
            {"phone": phone},
            {
                "$push": {"scanned_products": {
                    "id": product_id,
                    "name": product_name, 
                    "price": price, 
                    "location": location
                }},
                "$inc": {"total_amount": price}
            },
            upsert=True
        )

        return jsonify({"success": True, "message": "Product added!", "location": location, "total_amount": price}), 200
    except Exception as e:
        logging.error(f"Error in submit_qr_product: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

# ✅ Get Customer's Scanned Products
@scanned_products_bp.route("/api/get_customer_items", methods=["GET"])
def get_customer_items():
    try:
        phone = request.args.get("phone")
        if not phone:
            return jsonify({"success": False, "message": "Missing phone number"}), 400

        customer = customers_collection.find_one({"phone": phone}, {"_id": 0, "scanned_products": 1})
        if customer:
            return jsonify({"success": True, "scanned_products": customer.get("scanned_products", [])}), 200
        else:
            return jsonify({"success": False, "message": "Customer not found"}), 404
    except Exception as e:
        logging.error(f"Error in get_customer_items: {str(e)}")
        return jsonify({"success": False, "message": "Internal server error"}), 500

# ✅ Delete Product Endpoint
@scanned_products_bp.route("/api/delete_product", methods=["DELETE"])
def delete_product():
    try:
        data = request.json
        phone = data.get("phone")
        product_id = data.get("product_id")
        
        if not phone or not product_id:
            return jsonify({"success": False, "message": "Missing phone or product ID"}), 400
        
        # First, get the product to determine its price for updating total_amount
        customer = customers_collection.find_one(
            {"phone": phone, "scanned_products.id": product_id},
            {"_id": 0, "scanned_products.$": 1}
        )
        
        if not customer or not customer.get("scanned_products"):
            return jsonify({"success": False, "message": "Product not found"}), 404
            
        # Get the price of the product to be deleted
        product_price = customer["scanned_products"][0]["price"]
        
        # Remove the product and update the total amount
        result = customers_collection.update_one(
            {"phone": phone},
            {
                "$pull": {"scanned_products": {"id": product_id}},
                "$inc": {"total_amount": -product_price}  # Decrease total_amount by the product price
            }
        )
        
        if result.modified_count > 0:
            return jsonify({
                "success": True, 
                "message": "Product deleted successfully"
            }), 200
        else:
            return jsonify({"success": False, "message": "Failed to delete product"}), 400
            
    except Exception as e:
        logging.error(f"Error in delete_product: {str(e)}")
        return jsonify({"success": False, "message": f"Internal server error: {str(e)}"}), 500

# ✅ Checkout Endpoint