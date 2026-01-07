# app/writers/base_writer.py
from abc import ABC, abstractmethod
from app.services.ai_service import AIService

class BaseWriter(ABC):
    def __init__(self, brand, seed_corpus: str):
        self.brand = brand
        self.seed_corpus = seed_corpus
        self.llm = AIService()

    @abstractmethod
    def build_prompt(self, **kwargs) -> str:
        pass

    def write(self, **kwargs):
        prompt = self.build_prompt(**kwargs)
        output = self.llm.generate(prompt)
        return self.parse_output(output)

    def parse_output(self, raw_output: str):
        return raw_output.strip()