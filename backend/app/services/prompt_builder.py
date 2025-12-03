# app/services/prompt_builder.py
from typing import List, Dict

def build_rag_prompt(brand, user_instruction: str, retrieved_passages: List[Dict], tone: str, template_instructions: str = "") -> str:
    """
    Compose a system+user prompt for the LLM that includes retrieved context.
    Keep retrieved passages short and numbered.
    """
    system = f"You are the brand voice for {brand.name}. Follow these style guidelines:\n{brand.style_guidelines}\nTone preset: {tone}\n\n"
    # build context block
    ctx = []
    for i, p in enumerate(retrieved_passages, start=1):
        snippet = p.get("content", "")[:1200]  # truncate long passages
        ctx.append(f"[{i}] {snippet}")
    context_block = "\n\n".join(ctx) if ctx else "No brand memory available."
    template_block = template_instructions or ""
    user = f"""User task:
{user_instruction}

Relevant brand memory (use these facts as context, cite passage numbers if needed):
{context_block}

Instructions: {template_block}

Return three distinct variations labelled Variation 1 / Variation 2 / Variation 3. Keep outputs focused and ready to post. Don't invent facts outside the provided context unless asked.
"""
    return system + user
