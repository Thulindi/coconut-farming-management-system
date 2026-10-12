from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import io
from PIL import Image

app = FastAPI(title="Coconut Disease Detection API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model
MODEL_PATH = "models/coconut_disease_efficientnet.keras"
try:
    model = load_model(MODEL_PATH)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Class names exactly as trained
CLASS_NAMES = [
    "Caterpillars (CCI)",
    "Leaflets (CCI)",
    "Healthy",
    "Drying of Leaflets (WCLWD)",
    "Flaccidity (WCLWD)",
    "Yellowing (WCLWD)",
    "Unknown (sample_data error)"
]

def prepare_image(img_bytes):
    img = Image.open(io.BytesIO(img_bytes))
    if img.mode != "RGB":
        img = img.convert("RGB")
    img = img.resize((224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

class PredictionResult(BaseModel):
    disease: str
    confidence: float
    error: str = None

@app.post("/predict", response_model=PredictionResult)
async def predict(file: UploadFile = File(...)):
    if model is None:
        return PredictionResult(disease="Error", confidence=0.0, error="Model not loaded.")
        
    try:
        contents = await file.read()
        processed_image = prepare_image(contents)
        
        predictions = model.predict(processed_image)
        predicted_class_index = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_index])
        
        predicted_class_name = CLASS_NAMES[predicted_class_index]
        
        # Original logic for Unknown class
        if predicted_class_name == "Unknown (sample_data error)":
            predictions[0][predicted_class_index] = -1 
            predicted_class_index = np.argmax(predictions[0])
            predicted_class_name = CLASS_NAMES[predicted_class_index]
            confidence = float(predictions[0][predicted_class_index])
            
        return PredictionResult(
            disease=predicted_class_name,
            confidence=confidence
        )
    except Exception as e:
        return PredictionResult(disease="Error", confidence=0.0, error=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
