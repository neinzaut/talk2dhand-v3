import cv2
import time

def try_open(idx, backend=None):
    try:
        cap = cv2.VideoCapture(idx, backend) if backend is not None else cv2.VideoCapture(idx)
        if not cap or not cap.isOpened():
            return None
        # try forcing MJPG (helps on some Windows webcams)
        cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*'MJPG'))
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        time.sleep(0.2)
        ret, frame = cap.read()
        return (cap, ret, frame)
    except Exception as e:
        print("open error:", e)
        return None

# Try backends and indices
backends = [cv2.CAP_DSHOW, cv2.CAP_MSMF, None]  # None -> default
max_index = 2

for backend in backends:
    print("Trying backend:", backend)
    for idx in range(0, max_index+1):
        res = try_open(idx, backend)
        if res is None:
            print(f" index {idx}: cannot open")
            continue
        cap, ret, frame = res
        print(f" index {idx}: ret={ret}, frame is None? {frame is None}")
        if ret and frame is not None:
            print("  frame shape:", getattr(frame, "shape", None))
            cv2.imwrite("camera_test_frame.jpg", frame)
            print("  wrote camera_test_frame.jpg - open that image to inspect content")
            cap.release()
            raise SystemExit(0)
        cap.release()

print("All trials finished - no usable frame captured.")