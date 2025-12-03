# app/api/routes/generate_rag.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.brand import Brand
from app.services.embedder import embed_texts
from app.services.retrieval import retrieve_top_k
from app.services.prompt_builder import build_rag_prompt
from app.services.llm_service import call_hermes
from pydantic import BaseModel

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class GenerateRequest(BaseModel):
    brand_id: int
    template_id: int = None
    instruction: str
    tone: str = "friendly"
    k: int = 4

@router.post("/generate_rag")
async def generate_rag(req: GenerateRequest, db: Session = Depends(get_db)):
    brand = db.query(Brand).filter(Brand.id == req.brand_id).first()
    if not brand:
        raise HTTPException(404, "Brand not found")
    # embed the user instruction to query similar docs
    q_emb = embed_texts([req.instruction])[0]  # list->vector
    retrieved = retrieve_top_k(brand_id=req.brand_id, query_embedding=q_emb, k=req.k)
    # Build prompt (optionally pull template instructions from Template table if template_id provided)
    template_instructions = ""
    if req.template_id:
        t = db.execute("SELECT instructions FROM templates WHERE id = :id", {"id": req.template_id}).fetchone()
        if t:
            template_instructions = t[0]
    prompt = build_rag_prompt(brand=brand, user_instruction=req.instruction, retrieved_passages=retrieved, tone=req.tone, template_instructions=template_instructions)
    # call LLM - this returns 3 variations
    variations = await call_hermes(prompt, temperature=0.7)
    # Optionally store generation in DB (Generation model)
    return {"variations": variations, "retrieved": retrieved}
