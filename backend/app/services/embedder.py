# app/services/embedder.py
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List

# choose model: "all-MiniLM-L6-v2" -> 384 dims, fast and small
_EMBED_MODEL = None

def load_model(name="all-MiniLM-L6-v2"):
    global _EMBED_MODEL
    if _EMBED_MODEL is None:
        _EMBED_MODEL = SentenceTransformer(name)
    return _EMBED_MODEL

def embed_texts(texts: List[str], model_name="all-MiniLM-L6-v2"):
    model = load_model(model_name)
    emb = model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
    # Normalize for cosine similarity queries (optional)
    norms = np.linalg.norm(emb, axis=1, keepdims=True)
    norms[norms == 0] = 1e-9
    emb = emb / norms
    return emb.tolist()  # list of vectors (floats)
