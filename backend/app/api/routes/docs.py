from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.document import Document, DocumentChunk
from app.services.chunker import chunk_text
from app.services.embeddings import get_embedding
import aiofiles
import uuid
import httpx
from bs4 import BeautifulSoup

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload")
async def upload_doc(file: UploadFile = File(...), brand_id: int = Form(None), db: Session = Depends(get_db)):
    # save file temporarily and extract text (if plain text)
    contents = await file.read()
    text = None
    if file.content_type.startswith("text"):
        text = contents.decode("utf-8")
    else:
        # optionally handle PDF -> text with external libs. For MVP, reject binary uploads
        raise HTTPException(status_code=400, detail="Only text uploads supported in MVP. Add PDF parser later.")
    doc = Document(brand_id=brand_id, filename=file.filename, content=text)
    db.add(doc)
    db.commit()
    db.refresh(doc)

    chunks = chunk_text(text)
    # embed and store chunks
    for i, chunk in enumerate(chunks):
        emb = get_embedding(chunk)
        chunk_row = DocumentChunk(
            document_id=doc.id,
            brand_id=brand_id,
            chunk_text=chunk,
            chunk_meta={"chunk_index": i},
            embedding=emb
        )
        db.add(chunk_row)
    db.commit()
    return {"message": "uploaded", "document_id": doc.id, "chunks": len(chunks)}

@router.post("/scrape")
async def scrape_url(url: str = Form(...), brand_id: int = Form(None), db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        r = await client.get(url, timeout=20)
    if r.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to fetch URL")
    html = r.text
    soup = BeautifulSoup(html, "html.parser")
    # simple boilerplate removal: extract paragraphs
    paragraphs = [p.get_text(separator=" ", strip=True) for p in soup.find_all("p")]
    text = "\n\n".join([p for p in paragraphs if len(p) > 30])
    if not text:
        raise HTTPException(status_code=400, detail="No meaningful text found at URL")

    doc = Document(brand_id=brand_id, filename=url, source_url=url, content=text)
    db.add(doc)
    db.commit()
    db.refresh(doc)

    chunks = chunk_text(text)
    for i, chunk in enumerate(chunks):
        emb = get_embedding(chunk)
        chunk_row = DocumentChunk(
            document_id=doc.id,
            brand_id=brand_id,
            chunk_text=chunk,
            chunk_meta={"source_url": url, "chunk_index": i},
            embedding=emb
        )
        db.add(chunk_row)
    db.commit()
    return {"message": "scraped", "document_id": doc.id, "chunks": len(chunks)}

@router.get("/list")
def list_docs(brand_id: int = None, db: Session = Depends(get_db)):
    q = db.query(Document)
    if brand_id:
        q = q.filter(Document.brand_id == brand_id)
    docs = q.order_by(Document.created_at.desc()).all()
    return {"documents": [{"id": d.id, "filename": d.filename, "created_at": d.created_at} for d in docs]}
