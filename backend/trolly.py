import cv2
import numpy as np
import time
from ultralytics import YOLO
from pyzbar.pyzbar import decode

# Load YOLO model for object detection
model = YOLO("yolov8n.pt")  # Update path to your model

# Define trolley boundary
TROLLEY_X1, TROLLEY_Y1, TROLLEY_X2, TROLLEY_Y2 = 100, 100, 500, 400
tracked_objects = set()  
object_count = 0  

# Product storage for QR scanner
products = {}
last_seen = {}
DETECTION_TIMEOUT = 3  

def process_camera(cam_id):
    """Handles camera streaming: cam_id=1 (QR Scanner), cam_id=2 (Object Detection)"""
    global object_count

    cap = cv2.VideoCapture(cam_id)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        if cam_id == 2:
            # Object Detection
            results = model(frame, verbose=False)
            detected_object = None

            for r in results:
                for box in r.boxes:
                    class_id = int(box.cls[0])
                    if class_id == 0:  # Ignore 'person'
                        continue
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    if TROLLEY_X1 <= x1 <= TROLLEY_X2 and TROLLEY_Y1 <= y1 <= TROLLEY_Y2:
                        detected_object = class_id
                        break

            if detected_object and detected_object not in tracked_objects:
                tracked_objects.add(detected_object)
                object_count += 1

            cv2.rectangle(frame, (TROLLEY_X1, TROLLEY_Y1), (TROLLEY_X2, TROLLEY_Y2), (255, 0, 0), 2)
            cv2.putText(frame, f"Objects in trolley: {object_count}", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        elif cam_id == 1:
            # QR Scanner
            decoded_objects = decode(frame)
            current_time = time.time()

            for obj in decoded_objects:
                qr_data = obj.data.decode('utf-8')

                if qr_data not in last_seen or (current_time - last_seen[qr_data]) > DETECTION_TIMEOUT:
                    products[qr_data] = products.get(qr_data, 0) + 1
                    last_seen[qr_data] = current_time

                points = obj.polygon
                if len(points) == 4:
                    pts = np.array(points, dtype=np.int32).reshape((-1, 1, 2))
                    cv2.polylines(frame, [pts], True, (0, 255, 0), 3)

                cv2.putText(frame, f"Data: {qr_data}", (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                cv2.putText(frame, f"Count: {products[qr_data]}", (10, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        ret, jpeg = cv2.imencode('.jpg', frame)
        if not ret:
            break

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n\r\n')

    cap.release()