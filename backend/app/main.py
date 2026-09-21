# backend/app/main.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import tensorflow as tf
import numpy as np
import os
import io
from PIL import Image

# ตั้งค่าตามที่คุณใช้ใน Tkinter
IMG_SIZE = (300, 300)
MODEL_PATH = "fine_tuned_ai_model.h5"
CLASS_NAMES = ['Fake (ภาพจาก AI)', 'Real (ภาพจริง)']

app = FastAPI(title="AI Image Detector API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # สำหรับ production ให้เปลี่ยนเป็นโดเมนของคุณ
    allow_methods=["*"],
    allow_headers=["*"],
)

# โหลดโมเดล (แบบเดียวกับที่ทำใน Tkinter)
if not os.path.exists(MODEL_PATH):
    raise RuntimeError(f"ไม่พบไฟล์โมเดล: {MODEL_PATH} — ใส่ไฟล์ .h5 ใน backend/")

model = tf.keras.models.load_model(MODEL_PATH)
# optional warmup
try:
    model.predict(np.zeros((1, IMG_SIZE[0], IMG_SIZE[1], 3)))
except Exception:
    pass

def preprocess_using_keras_utils(file_bytes: bytes):
    # *** ทำเหมือนโค้ด Tkinter ของคุณเป๊ะ ๆ ***
    img = tf.keras.utils.load_img(io.BytesIO(file_bytes), target_size=IMG_SIZE)
    arr = tf.keras.utils.img_to_array(img)          # (H, W, 3) float32
    arr = tf.expand_dims(arr, 0)                    # (1, H, W, 3)
    return arr

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        x = preprocess_using_keras_utils(contents)
        preds = model.predict(x)   # ตามที่คุณต้องการ
        # คาดว่าเป็น binary scalar แบบในโค้ด Tkinter (preds[0] เป็นค่าเดียว)
        score = float(preds[0][0]) if preds.ndim >= 2 else float(preds[0])
        if score > 0.5:
            label = CLASS_NAMES[1]
            conf = score
        else:
            label = CLASS_NAMES[0]
            conf = 1 - score
        return JSONResponse({"label": label, "score": score, "confidence": float(conf * 100)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), reload=True)
