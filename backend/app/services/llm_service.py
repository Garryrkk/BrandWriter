# app/services/llm_service.py
import os
import httpx
from dotenv import load_dotenv

load_dotenv()
OLLAMA_URL = os.getenv("OLLAMA_URL")  # e.g., http://localhost:11434/api/generate
MODEL_NAME = os.getenv("MODEL_NAME", "Nous-Hermes")

async def call_hermes(prompt: str, temperature: float = 0.6, max_tokens: int = 512):
    """
    For Ollama, the exact request shape may vary. This is a general example.
    We'll request `n=3` via 3 calls with different temperature seeds (safer), or if ollama supports n, use that.
    """
    async with httpx.AsyncClient(timeout=60) as client:
        # Option A: single call with n=1 but call 3 times with different temps for variation
        results = []
        temps = [temperature, max(0.2, temperature - 0.15), min(1.0, temperature + 0.15)]
        for t in temps:
            payload = {
                "model": MODEL_NAME,
                "prompt": prompt,
                "max_tokens": max_tokens,
                "temperature": t,
                # other fields depending on your Ollama endpoint
            }
            r = await client.post(OLLAMA_URL, json=payload)
            r.raise_for_status()
            j = r.json()
            # Adjust to actual response shape
            text = j.get("response") or j.get("text") or j.get("output") or ""
            results.append({"temperature": t, "text": text})
        return results
