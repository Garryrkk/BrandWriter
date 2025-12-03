# app/services/chunker.py
import re
from typing import List

def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> List[str]:
    """
    Naive chunker based on sentences + token approx (chars).
    chunk_size: approximate characters per chunk (adjust)
    """
    # Split into sentences (simple)
    sentences = re.split(r'(?<=[.!?]) +', text)
    chunks = []
    cur = ""
    for s in sentences:
        if len(cur) + len(s) <= chunk_size:
            cur += " " + s if cur else s
        else:
            if cur:
                chunks.append(cur.strip())
            # if sentence larger than chunk_size, slice sentence
            if len(s) > chunk_size:
                for i in range(0, len(s), chunk_size - overlap):
                    chunks.append(s[i:i + chunk_size].strip())
                cur = ""
            else:
                cur = s
    if cur:
        chunks.append(cur.strip())
    return chunks
