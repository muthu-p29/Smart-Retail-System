# 🛒 Smart Retail System

A **cashierless smart retail platform** that eliminates the need for checkout workers. Customers can shop independently using two modes — a **QR Scan mode** for quick purchases and a **Smart Trolley mode** with AI-powered camera detection for bulk shopping.

---

## 🎯 How It Works

### Mode 1 — QR Scan (Small Purchases)
1. Customer enters the shop and opens the web app on their phone
2. Scans the QR code on any product
3. Product is added to their cart (price + quantity auto-calculated)
4. Customer pays through the app
5. An **Exit QR** is generated — scanned at the gate to leave

### Mode 2 — Smart Trolley (Bulk Purchases)
1. Customer picks up a **camera-equipped smart trolley**
2. Camera (YOLOv8 + OpenCV) detects products placed into the trolley → **auto-added to cart**
3. If a product is removed from the trolley → **auto-removed from cart**
4. Customer pays through the app
5. **Exit QR** is generated to exit the shop

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Customer Phone                    │
│              React.js Web App (PWA)                 │
│         QR Scanner  │  Cart  │  Payment             │
└────────────┬────────────────────────────────────────┘
             │ REST API (JSON)
┌────────────▼────────────────────────────────────────┐
│               FastAPI Backend (Python)               │
│   Auth  │  Products  │  Cart  │  Payment  │  Exit QR │
└────────────┬──────────────────┬─────────────────────┘
             │                  │
    ┌────────▼──────┐  ┌────────▼──────────────────┐
    │   Database    │  │   Smart Trolley Service    │
    │  (mongodb     │  │  YOLOv8 + OpenCV Camera   │
    │    
    └───────────────┘  └───────────────────────────┘
```

---

## 🧰 Tech Stack

| Layer              | Technology                          |
|--------------------|-------------------------------------|
| Frontend           | React.js (PWA), CSS                 |
| Backend            | Python, FastAPI                     |
| QR Detection       | `html5-qrcode` (browser-based)      |
| Trolley Detection  | YOLOv8, OpenCV, Python              |
| Database           | MongoDB                             |
| Payment            | Phonepay react demo stimulation
| Exit Gate          | QR Code generation (`qrcode` lib)   |


---

---

## ⚙️ Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+ and npm
- Webcam (for trolley detection testing)

---

### 🖥️ Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy env file and configure
cp .env.example .env

# Run the server
uvicorn main:app --reload --port 8000
```

API will be live at: `http://localhost:8000`  
Interactive API docs: `http://localhost:8000/docs`

---

### 🌐 Frontend Setup

```bash
cd frontend

npm install
npm start
```

Frontend will be live at: `http://localhost:3000`

---

### 📷 Smart Trolley (Camera Detection)

```bash
cd backend/trolley

# Install YOLOv8
pip install ultralytics opencv-python

# Run trolley detection (connects to backend cart API)
python detect.py --session-id <cart_session_id>
```

---

## 🔧 Environment Variables

Create a `.env` file in `backend/`:

```env
SECRET_KEY=your_secret_key_here
DATABASE_URL=sqlite:///./retail.db
PAYMENT_GATEWAY_KEY=your_razorpay_or_stripe_key
EXIT_QR_SECRET=your_exit_qr_signing_secret
CAMERA_INDEX=0
YOLO_MODEL=yolov8n.pt
```

---

## 📡 API Reference

### Products
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/products`           | List all products        |
| GET    | `/products/{qr_code}` | Get product by QR code   |

### Cart
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/cart/{session_id}`  | View cart                |
| POST   | `/cart/add`           | Add product to cart      |
| DELETE | `/cart/remove`        | Remove product from cart |

### Payment & Exit
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| POST   | `/payment/initiate`   | Start payment            |
| POST   | `/payment/confirm`    | Confirm payment          |
| GET    | `/exit/{session_id}`  | Generate exit QR         |
| POST   | `/exit/verify`        | Verify exit QR at gate   |

---

## 🔒 Exit Gate Logic

```
Customer pays
    ↓
Backend generates signed Exit QR (JWT-based, expires in 30 mins)
    ↓
Customer shows QR at gate scanner
    ↓
Gate system verifies signature → opens gate
```

If payment is **not completed**, no Exit QR is issued — customer cannot leave.

---

## 🛠️ YOLOv8 Trolley Detection Logic

```python
# Simplified flow
while camera_is_on:
    frame = camera.read()
    detections = yolo_model(frame)

    for item in detections:
        if item newly_appeared_in_frame:
            cart.add(item)         # Product placed in trolley
        if item disappeared_from_frame:
            cart.remove(item)      # Product taken out
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push and open a Pull Request

---

## 👤 Author

**muthu-p29**  
GitHub: [@muthu-p29](https://github.com/muthu-p29)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
