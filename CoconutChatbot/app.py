"""
Coconut Farming Chatbot - Main Entry Point
===========================================
Member 1: RAG & Data Pipeline       (member1/)
Member 2: LLM Service & Evaluation  (member2/)
Member 3: API Routes & Frontend     (member3/)
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from member1.rag_engine import get_db
from member3.voice_engine import router as voice_router, get_whisper_model
from member3.api_routes import router as chat_router

# -- Preload Models at startup --
@asynccontextmanager
async def lifespan(application):
    # Member 1: Vector DB
    get_db()
    # Member 3: AI Voice Model (Downloads if missing)
    get_whisper_model()
    print('[OK] AI Models loaded - Assistant ready!')
    yield

app = FastAPI(title='Coconut Chatbot API', lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])

# Ensure the server starts even if local frontend is missing
if os.path.exists('frontend'):
    app.mount('/static', StaticFiles(directory='frontend'), name='static')
else:
    print("[INFO] Local 'frontend' directory not found. Skipping static mount.")

app.include_router(chat_router)
app.include_router(voice_router, prefix="/voice", tags=["Voice"])
