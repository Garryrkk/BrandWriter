from fastapi import APIRouter, HTTPException
from app.services.seed_loader import load_seed_corpus

router = APIRouter(prefix="/seed", tags=["Seed Loader"])


@router.post("/load/{brand_id}")
def load_corpus(brand_id: int):
    """
    Loads seed corpus for a brand and returns it as JSON (debug/testing only).
    """

    try:
        data = load_seed_corpus(brand_id)
        return {"brand_id": brand_id, "corpus": data}

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
