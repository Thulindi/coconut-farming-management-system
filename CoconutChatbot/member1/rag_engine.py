"""
Member 1: RAG Engine
- Vector Database Management (ChromaDB)
- Structured Knowledge Lookup (JSON)
- Document Context Retrieval (Semantic Search)
"""

import os
import json
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

# -- Paths --
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'coconut_db')
FACTS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'coconut_facts.json')

_db = None
_facts = None

def get_db():
    """Load or return the ChromaDB instance."""
    global _db
    if _db is None:
        if not os.path.exists(DB_PATH):
            print(f'[ERROR] DB path does not exist: {DB_PATH}')
            return None
        print('[*] Loading vector DB:', DB_PATH)
        emb = HuggingFaceEmbeddings(model_name='all-MiniLM-L6-v2')
        _db = Chroma(persist_directory=DB_PATH, embedding_function=emb)
    return _db

def get_facts():
    """Load the structured JSON facts."""
    global _facts
    if _facts is None:
        if os.path.exists(FACTS_PATH):
            with open(FACTS_PATH, 'r', encoding='utf-8') as f:
                _facts = json.load(f)
        else:
            _facts = {}
    return _facts

def search_json_facts(query: str) -> str:
    """Keyword search in JSON facts for high-accuracy data."""
    facts = get_facts()
    found_facts = []
    q = query.lower()

    # Fertilizer keywords (English + Singlish + Sinhala)
    if any(kw in q for kw in ['fertilizer', 'pohora', 'පොහොර', 'manure', 'nutrient', 'ypm', 'apm']):
        found_facts.append(f"Fertilizer Recommendations: {facts.get('fertilizer', {})}")

    # Variety keywords
    if any(kw in q for kw in ['variety', 'varieties', 'warga', 'wargaya', 'ප්‍රභේද', 'wargayan', 'type', 'kinds', 'cric', 'txb']):
        found_facts.append(f"Coconut Varieties: {facts.get('varieties', {})}")

    # Disease keywords
    if any(kw in q for kw in ['disease', 'leda', 'රෝග', 'ලෙඩ', 'pest', 'weevil', 'bud rot', 'infection', 'roga']):
        found_facts.append(f"Diseases & Pests: {facts.get('diseases', {})}")

    # Planting keywords
    if any(kw in q for kw in ['plant', 'hitu', 'සිටුවීම', 'spacing', 'pit', 'wala', 'seedling', 'pale', 'grow']):
        found_facts.append(f"Planting Guide: {facts.get('planting', {})}")

    return "\n".join(found_facts) if found_facts else ""


def get_context(query: str, k: int = 2) -> str:
    """Retrieve top k document chunks + JSON facts relevant to the query."""
    # 1. Get JSON Facts (High reliability)
    json_ctx = search_json_facts(query)
    
    # 2. Get Vector DB context
    db = get_db()
    if db:
        docs = db.similarity_search(query, k=k)
        vector_ctx = ' '.join([d.page_content for d in docs]) if docs else ''
    else:
        vector_ctx = ''

    combined_ctx = f"{json_ctx}\n\n{vector_ctx}".strip()
    return combined_ctx if combined_ctx else 'No context found.'

def check_is_off_topic_context(query: str, threshold: float = 0.25) -> bool:
    """Check if the context score is below threshold, indicating off-topic."""
    db = get_db()
    if not db: return False
    results = db.similarity_search_with_relevance_scores(query, k=1)
    if not results:
        return True
    _doc, score = results[0]
    return score < threshold

