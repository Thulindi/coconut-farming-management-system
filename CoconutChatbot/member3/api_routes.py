"""
Member 3: API Routes & Frontend Serving
- FastAPI endpoint definitions (chat, compare, health)
- Static file / frontend serving
- Request/response models
"""

import time
from fastapi import APIRouter
from fastapi.responses import FileResponse
from pydantic import BaseModel

# Import LLM service from member2
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from member2.llm_service import (
    run_gemini, is_greeting, is_off_topic,
    MODEL_NAME, get_off_topic_message,
)

router = APIRouter()


class Q(BaseModel):
    query: str


# -- Pages --
@router.get('/')
def index():
    return FileResponse('frontend/index.html')


@router.get('/health')
def health():
    return {'status': 'ok'}


# -- Chat endpoints --
@router.post('/chat/llama')
def chat_model1(req: Q):
    greeting = is_greeting(req.query)
    if greeting:
        return {'model': MODEL_NAME, 'answer': greeting, 'context': '', 'latency': 0.0}
    if is_off_topic(req.query):
        return {'model': MODEL_NAME, 'answer': get_off_topic_message(req.query), 'context': '', 'latency': 0.0}
    s = time.time()
    ans, ctx = run_gemini(req.query)
    return {'model': MODEL_NAME, 'answer': ans, 'context': ctx, 'latency': round(time.time() - s, 2)}


@router.post('/chat/qwen')
def chat_model2(req: Q):
    # Map qwen to gemini for now to avoid breaking frontend
    return chat_model1(req)


# -- Compare both models --
@router.post('/compare')
def compare(req: Q):
    greeting = is_greeting(req.query)
    if greeting:
        return {
            'query': req.query,
            'llama': {'answer': greeting, 'latency': 0.0},
            'qwen': {'answer': greeting, 'latency': 0.0},
            'context': '',
        }
    if is_off_topic(req.query):
        msg = get_off_topic_message(req.query)
        return {
            'query': req.query,
            'llama': {'answer': msg, 'latency': 0.0},
            'qwen': {'answer': msg, 'latency': 0.0},
            'context': '',
        }

    s = time.time()
    ans, ctx = run_gemini(req.query)
    lat = round(time.time() - s, 2)

    return {
        'query': req.query,
        'llama': {'answer': ans, 'latency': lat},
        'qwen': {'answer': ans, 'latency': lat},
        'context': ctx,
    }
