# app.py

from flask import Flask, Response, request, jsonify
from flask_cors import CORS
import threading
import cv2
from database import get_db
from qr_scanner import scan_qr
from scanned_products import scanned_products_bp
from trolly import process_camera, products 
from message import send_sms   # ✅ Import from message.py

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Global QR Code Data
scanned_data = ""
lock = threading.Lock()

# Database connection
db = get_db()
products_collection = db["product_location"]

@app.route('/')
def home():
    return "Welcome to the Smart Shopping API!"


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

def generate_frames():
    global scanned_data
    while True:
        frame, qr_data = scan_qr()  # Scan QR Code
        if frame is None:
            break

        if qr_data:
            with lock:
                scanned_data = qr_data  # Store latest QR data

        _, buffer = cv2.imencode('.jpg', frame)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

@app.route("/video_feed")
def video_feed_qr():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route("/get_qr_data")
def get_qr_data():
    global scanned_data
    with lock:
        data = scanned_data
        scanned_data = ""  # Clear after sending
        return jsonify({"qr_data": data})

@app.route('/video_feed/<int:cam_id>')
def video_feed(cam_id):
    return Response(process_camera(cam_id), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/get_products')
def get_products():
    """Returns detected products."""
    return jsonify(products)

@app.route("/submit", methods=["POST"])
def submit_dzata():
    try:
        db = get_db()
        collection = db["customers"]

        data = request.get_json()
        if not data or "phone" not in data:
            return jsonify({"error": "Invalid data"}), 400

        collection.update_one({"phone": data["phone"]}, {"$set": data}, upsert=True)
        return jsonify({"message": "Data saved successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ SMS Sending API (use function from message.py)
@app.route('/send-sms', methods=['POST'])
def send_sms_route():
    data = request.get_json()
    message_text = data.get('message')

    if not message_text:
        return jsonify({'error': 'Message is required'}), 400

    try:
        sid = send_sms(message_text)   # 💬 Call imported send_sms
        return jsonify({'message': 'SMS sent successfully', 'sid': sid})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Register Blueprints
app.register_blueprint(scanned_products_bp)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
