#!/usr/bin/env python3
# scripts/seed_ingest.py
import os
import sys
from app.db.database import SessionLocal
from app.services.ingest_service import ingest_raw_text_for_brand

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/seed_ingest.py <brand_id> [seed_dir]")
        sys.exit(1)
    brand_id = int(sys.argv[1])
    seed_dir = sys.argv[2] if len(sys.argv) > 2 else "app/templates/seed_corpora"
    if not os.path.exists(seed_dir):
        print("Seed directory not found:", seed_dir)
        sys.exit(2)
    db = SessionLocal()
    total = 0
    for fname in sorted(os.listdir(seed_dir)):
        if not fname.lower().endswith(".txt"):
            continue
        path = os.path.join(seed_dir, fname)
        with open(path, "r", encoding="utf-8") as f:
            text = f.read()
        docs = ingest_raw_text_for_brand(brand_id=brand_id, source=fname, text=text, db=db)
        print(f"Ingested {len(docs)} chunks from {fname}")
        total += len(docs)
    db.close()
    print("Total chunks ingested:", total)

if __name__ == "__main__":
    main()
