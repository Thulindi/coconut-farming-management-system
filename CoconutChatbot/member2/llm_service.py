"""
Member 2: LLM Service & NLP Layer
- Bilingual support (Sinhala Unicode + English) using Groq Llama 3.3 70B.
- Tasks: Language detection, Greeting/Off-topic filtering, Response generation.
"""

import os, re
import sys
from groq import Groq

# Add parent dir to path to import other members' modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from member1.rag_engine import get_context, check_is_off_topic_context

# -- Config --
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
MODEL_NAME = 'llama-3.3-70b-versatile'

_client = None
def _get_client():
    global _client
    if _client is None:
        _client = Groq(api_key=GROQ_API_KEY)
    return _client

# ─── Language Detection ────────────────────────────────────────────────────────

def _is_sinhala(text: str) -> bool:
    """True ONLY if the query contains Sinhala Unicode characters.
    Singlish (Roman-script) is treated as English.
    """
    return bool(re.search(r'[\u0d80-\u0dff]', text))

def _build_english_search_query(query: str) -> str:
    """Member 2's NLP Bridge: Convert Sinhala Unicode to English keywords for Vector Search."""
    sinhala_map = {
        'පොල්': 'coconut', 'පැල': 'seedling plant', 'සිටුවන්නේ': 'planting',
        'සිටුවීම': 'planting', 'හිටුවන්නේ': 'planting', 'නිවැරදිව': 'correctly properly',
        'කෙසේද': 'how to', 'වල': 'pit hole', 'වලවල්': 'pits holes',
        'පොහොර': 'fertilizer', 'ලෙඩ': 'disease', 'රෝග': 'disease',
        'අස්වැන්න': 'harvest yield', 'ගස': 'tree', 'වගාව': 'cultivation',
        'ප්‍රභේද': 'varieties', 'වර්ග': 'varieties', 'කොළ': 'leaf leaves',
        'ජලය': 'water irrigation', 'කෘමි': 'pest insect', 'රතු': 'red',
        'පරිසරය': 'environment climate', 'ගෙඩි': 'nuts fruits',
    }
    t = query
    for k, v in sinhala_map.items():
        t = t.replace(k, v)
    # Strip remaining Sinhala Unicode chars
    t = re.sub(r'[\u0d80-\u0dff]+', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t or 'coconut farming'

# ─── Main LLM call ────────────────────────────────────────────────────────────

def run_gemini(query: str, model: str = MODEL_NAME) -> tuple[str, str]:
    """Bilingual (Sinhala Unicode / English) RAG pipeline. Returns (answer, context)."""
    client = _get_client()
    is_sinhala = _is_sinhala(query)

    # 1. Greeting check
    greet = is_greeting(query)
    if greet:
        return greet, ''

    # 2. Off-topic check
    if is_off_topic(query):
        return get_off_topic_message(query), ''

    # 3. Get Context from Member 1 (The RAG Specialist)
    search_q = _build_english_search_query(query) if is_sinhala else query
    ctx = get_context(search_q, k=3)

    # 4. Prompt Engineering (Member 2's AI Core)
    # Key fixes in both prompts:
    #   a) NEVER tell user to "contact the Coconut Research Institute" (PDF boilerplate)
    #   b) Use own expert knowledge if reference info is insufficient
    #   c) No repetition of question, short & direct answers
    if is_sinhala:
        system_msg = (
            "You are an expert Coconut Farming Assistant in Sri Lanka.\n\n"
            "STRICT RULES:\n"
            "1. Reply ONLY in proper Sinhala script (Unicode සිංහල). Example: 'පොල් ගසට...'\n"
            "2. NEVER use Roman/English letters in your answer.\n"
            "3. Do NOT repeat the question. Start directly with the answer.\n"
            "4. Keep the answer short and clear (3-5 sentences maximum).\n"
            "5. Use facts from the Reference Information if it is helpful.\n"
            "6. If the Reference Information is NOT helpful or says to 'contact an officer', "
            "IGNORE IT and answer from your OWN expert knowledge about coconut farming.\n"
            "7. NEVER say 'contact the Coconut Research Institute' or 'contact an officer'. "
            "Always give a direct, useful answer.\n\n"
            "EXAMPLE of a CORRECT response:\n"
            "User: පොල් ගසට දාන්නේ මොන පොහොරද?\n"
            "Assistant: වැඩෙන පොල් ගසකට YPM පොහොර මිශ්‍රණය කිලෝ 3-5 ක් වසරකට යොදන්න. "
            "පස තෙතමනය ඇති කාලය වඩාත් සුදුසුය."
        )
    else:
        system_msg = (
            "You are an expert Coconut Farming Assistant.\n\n"
            "STRICT RULES:\n"
            "1. Reply in English.\n"
            "2. Do NOT repeat the user's question. Start directly with the answer.\n"
            "3. Keep the answer short and clear (3-5 sentences maximum).\n"
            "4. Use facts from the Reference Information if it is helpful.\n"
            "5. If the Reference Information is NOT helpful or says to 'contact an officer', "
            "IGNORE IT and answer from your OWN expert knowledge about coconut farming.\n"
            "6. NEVER say 'contact the Coconut Research Institute' or refer the user to an officer. "
            "Always give a direct, useful answer.\n"
        )

    user_msg = f"Reference Information:\n{ctx}\n\nQuestion: {query}"

    # temperature=0.4 for Sinhala: prevents repetition loops that occur at lower temps
    # max_tokens=512: hard stop to prevent runaway generation
    temp = 0.4 if is_sinhala else 0.25
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {'role': 'system', 'content': system_msg},
                {'role': 'user',   'content': user_msg},
            ],
            temperature=temp,
            max_tokens=512,
        )
        answer = response.choices[0].message.content.strip()
        display_ctx = ctx if 'No context found' not in ctx else ''
        return answer, display_ctx
    except Exception as e:
        print(f'[ERROR] LLM: {e}')
        err = 'සමාවන්න, දෝෂයක් සිදු විය. නැවත උත්සාහ කරන්න.' if is_sinhala else 'Sorry, an error occurred. Please try again.'
        return err, ''

# ─── Helper Functions ─────────────────────────────────────────────────────────

_COCONUT_KEYWORDS = (
    'coconut', 'palm', 'copra', 'coir', 'crop', 'farm', 'plant', 'soil',
    'fertiliz', 'pest', 'disease', 'harvest', 'seed', 'leaf', 'cultivation',
    'husk', 'kernel', 'shell', 'nut', 'flower', 'frond', 'weed',
    'පොල්', 'වගාව', 'පොහොර', 'ලෙඩ', 'රෝග', 'පැල', 'ගස', 'අස්වැන්න',
    'කොළ', 'ගෙඩි', 'ප්‍රභේද', 'වර්ග',
)

def is_greeting(text: str) -> str | None:
    t = text.strip().lower().rstrip('!?,.')
    greetings = {'hi', 'hello', 'hey', 'hii', 'morning', 'afternoon', 'හලෝ', 'හායි', 'ආයුබෝවන්'}
    if t in greetings:
        if _is_sinhala(text):
            return 'ආයුබෝවන්! මම පොල් වගාව පිළිබඳ ඔබේ සහායකයා. ඔබට කෙසේ උදව් කළ හැකිද?'
        return 'Hello! I am your Coconut Farming Assistant. How can I help you today?'

    thanks = {'thanks', 'thank you', 'ස්තුතියි', 'ස්තූතියි'}
    if any(w in t for w in thanks):
        if _is_sinhala(text):
            return 'ඔබට ස්තුතියි! තවත් ප්‍රශ්නයක් ඇත්නම් විමසන්න.'
        return 'You are welcome! Feel free to ask if you have more questions.'

    return None

def is_off_topic(query: str) -> bool:
    t = query.strip().lower()
    # Explicitly coconut-related → never off-topic
    if any(kw in t for kw in _COCONUT_KEYWORDS):
        return False
    # Check semantic relevance via Member 1's RAG engine
    search_q = _build_english_search_query(query) if _is_sinhala(query) else query
    return check_is_off_topic_context(search_q)

def get_off_topic_message(query: str) -> str:
    if _is_sinhala(query):
        return 'සමාවන්න, මට පිළිතුරු දිය හැක්කේ පොල් වගාවට අදාළ ප්‍රශ්න වලට පමණි.'
    return 'I am sorry, I can only assist with coconut farming related questions.'
