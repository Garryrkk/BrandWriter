# app/services/ai_service.py

class AIService:
    """
    Dummy AI Service placeholder.
    Replace this with real OpenAI / Gemini / custom model logic later.
    """

    def __init__(self):
        pass

    async def generate_text(self, prompt: str) -> str:
        """
        Simple placeholder generation function.
        """
        return f"[AI GENERATED TEXT BASED ON PROMPT]: {prompt}"

    async def generate_batch(self, prompts: list[str]) -> list[str]:
        """
        Generates multiple texts at once.
        """
        return [await self.generate_text(p) for p in prompts]
