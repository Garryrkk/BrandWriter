# app/services/ingest_service.py
from app.services.chunker import chunk_text
from app.services.embedder import embed_texts
from app.db.database import SessionLocal
from app.models.document import Document
from sqlalchemy.orm import Session
from typing import List

def ingest_raw_text_for_brand(brand_id: int, source: str, text: str, metadata: dict = None, db: Session = None):
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True
    try:
        chunks = chunk_text(text, chunk_size=1200, overlap=200)
        embeddings = embed_texts(chunks)  # ensure embedding dim matches Document.embedding
        docs = []
        for chunk, emb in zip(chunks, embeddings):
            doc = Document(
                brand_id=brand_id,
                source=source,
                content=chunk,
                metadata=metadata or {},
                embedding=emb
            )
            db.add(doc)
            docs.append(doc)
        db.commit()
        for d in docs:
            db.refresh(d)
        return docs
    finally:
        if close_db:
            db.close()
