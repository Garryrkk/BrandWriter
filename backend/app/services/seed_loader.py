# app/services/seed_loader.py
from pathlib import Path

SEED_DIR = Path("app/seed_corpora")

def load_seed_corpus(brand_id: int, corpus_type: str) -> str:
    files = list(SEED_DIR.glob(f"brand_{brand_id}_{corpus_type}*.txt"))
    content = []
    for f in files:
        content.append(f.read_text(encoding="utf-8"))
    return "\n\n".join(content)