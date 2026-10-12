import gradio as gr
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import os

# Define the local model path
MODEL_PATH = "models/coconut_disease_efficientnet.keras"

print("Loading model...")
# Load the trained model
try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    exit()

# These are the exact class names detected during your Colab training!
CLASS_NAMES = [
    "Caterpillars (CCI)",
    "Leaflets (CCI)",
    "Healthy",
    "Drying of Leaflets (WCLWD)",
    "Flaccidity (WCLWD)",
    "Yellowing (WCLWD)",
    "Unknown (sample_data error)"
]

# Provide fallback if model output shape doesn't match our guess
num_classes = model.output_shape[-1]
if len(CLASS_NAMES) != num_classes:
    CLASS_NAMES = [f"Class {i}" for i in range(num_classes)]

def predict_image(img):
    if img is None:
        return {"Error": 1.0}
        
    # Resize to match EfficientNetB0 expected input (224x224)
    img = img.resize((224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    
    # Predict
    predictions = model.predict(img_array)[0]
    
    # Format output for Gradio (dictionary of {class_name: probability})
    confidences = {CLASS_NAMES[i]: float(predictions[i]) for i in range(num_classes)}
    return confidences

# Build the Gradio interface
interface = gr.Interface(
    fn=predict_image,
    inputs=gr.Image(type="pil"),
    outputs=gr.Label(num_top_classes=num_classes),
    title="🥥 Coconut Disease Detection (Local Test)",
    description="Upload a picture of a coconut leaf to predict the disease. \n\n**Note**: Class names might need adjusting in `test_local.py` if they don't match your actual training data.",
    flagging_mode="never"
)

if __name__ == "__main__":
    print("\nStarting local web server for testing...")
    # launch the app
    interface.launch(share=False)
