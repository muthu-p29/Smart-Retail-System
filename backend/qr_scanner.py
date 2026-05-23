import cv2
import numpy as np
from pyzbar.pyzbar import decode

camera = cv2.VideoCapture(1)  # Change to 0 if needed

def scan_qr():
    """Captures a frame and detects QR codes."""
    success, frame = camera.read()
    if not success:
        return None, None

    qr_data = None
    for barcode in decode(frame):
        qr_data = barcode.data.decode('utf-8')
        pts = np.array([point for point in barcode.polygon], np.int32)
        pts = pts.reshape((-1, 1, 2))
        cv2.polylines(frame, [pts], True, (0, 255, 0), 2)
        cv2.putText(frame, qr_data, (pts[0][0][0], pts[0][0][1] - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

    return frame, qr_data

# 🛑 Ensure camera is released when script exits
import atexit

def release_camera():
    print("📷 Releasing QR camera...")
    camera.release()

atexit.register(release_camera)
