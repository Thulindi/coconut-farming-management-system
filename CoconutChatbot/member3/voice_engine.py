import os
import sys
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException

# -- AI Voice Configuration (Member 3) --
router = APIRouter()

# 1. ADD FFMPEG TO PATH (Mandatory for Whisper processing)
FFMPEG_DIR = r"D:\ffmpeg\bin"

if os.path.exists(FFMPEG_DIR):
    if FFMPEG_DIR not in os.environ["PATH"]:
        os.environ["PATH"] += os.pathsep + FFMPEG_DIR
        print(f"[DEBUG] FFmpeg path added to env: {FFMPEG_DIR}")
else:
    print(f"[WARNING] FFmpeg not found at {FFMPEG_DIR}. Please ensure FFmpeg is installed on D: drive.")

# Global model instance
_whisper_model = None

def get_whisper_model():
    """ Load/Reference the local OpenAI Whisper model. 
        Will download ~140MB if not already present.
    """
    global _whisper_model
    if _whisper_model is None:
        try:
            import whisper
            print("[*] Loading AI Voice Model (Whisper base)...")
            # This loads the 'base' model for balanced speed/accuracy
            _whisper_model = whisper.load_model("base")
            print("[+] AI Voice Model loaded successfully.")
        except ImportError:
            print("[-] Error: 'openai-whisper' package missing. Run: pip install openai-whisper")
        except Exception as e:
            print(f"[-] Critical error loading Whisper: {e}")
    return _whisper_model


@router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Accepts an audio file and processes it via Member 3's AI Voice pipeline.
    Optimized for English transcription as requested.
    """
    model = get_whisper_model()
    if model is None:
        raise HTTPException(status_code=503, detail="AI Voice Engine is starting up or failed to load. Please wait or check logs.")

    if not audio.filename:
        raise HTTPException(status_code=400, detail="No audio file provided.")

    # Get extension or default to webm (common browser format)
    ext = os.path.splitext(audio.filename)[1] or ".webm"

    try:
        # 1. Create a safe temporary file for the model to read
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            contents = await audio.read()
            tmp.write(contents)
            tmp_path = tmp.name

        print(f"[*] AI Processing Audio File: {tmp_path}")

        # 2. Run AI Inference (Forcing English for Member 3 performance)
        result = model.transcribe(tmp_path, language='en')
        transcribed_text = result.get("text", "").strip()

        # 3. Cleanup
        os.remove(tmp_path)

        if not transcribed_text:
            return {"status": "success", "text": "(No clear audio detected)"}

        print(f"[+] AI Transcription Result: {transcribed_text}")
        return {"status": "success", "text": transcribed_text}

    except Exception as e:
        print(f"[ERROR] Voice Inference Failed: {e}")
        # Identify FFmpeg related failures
        error_msg = str(e).lower()
        if "ffmpeg" in error_msg:
             raise HTTPException(status_code=500, detail="FFmpeg processing error. Check if audio format is supported by local FFmpeg.")
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")

