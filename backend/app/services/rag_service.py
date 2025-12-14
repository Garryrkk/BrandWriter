import os
from typing import List, Optional, Dict, Any
from uuid import UUID

import numpy as np
from llama_cpp import Llama
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text, func, and_
from sentence_transformers import SentenceTransformer
from huggingface_hub import login
from dotenv import load_dotenv

from app.models.document import Document
from app.core.config import settings

load_dotenv()  # Load environment variables early


class RAGService:
    def __init__(self):
        # --- Local GGUF LLaMA model for offline generation ---
        # Only load if model path is configured and exists
        self.local_llm = None
        if settings.LOCAL_LLM_PATH and os.path.exists(settings.LOCAL_LLM_PATH):
            try:
                self.local_llm = Llama(model_path=settings.LOCAL_LLM_PATH)
            except Exception as e:
                print(f"Warning: Could not load local LLM: {e}")

        # --- Voyage API for cloud embeddings ---
        self.voyage_api_key = settings.VOYAGE_API_KEY
        self.voyage_model = settings.VOYAGE_MODEL

        self.chunk_size = getattr(settings, "CHUNK_SIZE", 500)
        self.chunk_overlap = getattr(settings, "CHUNK_OVERLAP", 50)

    # -------------------- Embeddings --------------------
    def generate_embedding(self, text: str) -> list:
        """Generate embedding using Voyage API."""
        import requests

        headers = {"Authorization": f"Bearer {self.voyage_api_key}"}
        payload = {"model": self.voyage_model, "input": text}
        response = requests.post("https://api.voyage.xyz/embeddings", json=payload, headers=headers)
        response.raise_for_status()
        return response.json()["embedding"]
    # -------------------- Text Chunking --------------------
    def chunk_text(self, text: str) -> List[str]:
        """Split text into overlapping chunks."""
        words = text.split()
        chunks = []
        i = 0
        while i < len(words):
            chunk = " ".join(words[i:i + self.chunk_size])
            chunks.append(chunk)
            i += self.chunk_size - self.chunk_overlap
        return chunks

    # -------------------- Document Management --------------------
    async def add_document(
        self,
        db: AsyncSession,
        brand_id: UUID,
        title: str,
        content: str,
        source: str,
        document_type: str = "article",
        metadata: Optional[Dict[str, Any]] = None,
        category: Optional[str] = None
    ) -> List[Document]:
        """Add document, split into chunks, and generate embeddings."""
        metadata = metadata or {}

        # --- Parent document ---
        parent_doc = Document(
            brand_id=brand_id,
            title=title,
            source=source,
            document_type=document_type,
            content=content,
            full_text=content,
            is_chunk=False,
            doc_metadata=metadata,
            category=category,
            word_count=len(content.split()),
            char_count=len(content)
        )
        db.add(parent_doc)
        await db.flush()

        # --- Chunking and embeddings ---
        chunk_docs = []
        for idx, chunk_text in enumerate(self.chunk_text(content)):
            embedding = self.generate_embedding(chunk_text)
            chunk_doc = Document(
                brand_id=brand_id,
                title=f"{title} - Chunk {idx+1}",
                source=source,
                document_type=document_type,
                content=chunk_text,
                chunk_text=chunk_text,
                full_text=content,
                is_chunk=True,
                parent_document_id=parent_doc.id,
                chunk_index=idx,
                total_chunks=len(chunk_docs) + 1,
                embedding=embedding,
                embedding_model=settings.EMBEDDING_MODEL,
                doc_metadata=metadata,
                category=category,
                word_count=len(chunk_text.split()),
                char_count=len(chunk_text)
            )
            db.add(chunk_doc)
            chunk_docs.append(chunk_doc)

        await db.commit()
        await db.refresh(parent_doc)
        for c in chunk_docs:
            await db.refresh(c)

        return [parent_doc] + chunk_docs

    # -------------------- Similarity Search --------------------
    async def search_similar_documents(
        self,
        db: AsyncSession,
        brand_id: UUID,
        query: str,
        limit: int = 5,
        category: Optional[str] = None,
        similarity_threshold: float = 0.7
    ) -> List[tuple[Document, float]]:
        """Search for most similar document chunks."""
        query_embedding = self.generate_embedding(query)

        sql = """
        SELECT id, 1 - (embedding <=> :query_embedding) AS similarity
        FROM documents
        WHERE brand_id = :brand_id
          AND is_chunk = true
          AND (1 - (embedding <=> :query_embedding)) >= :threshold
        """
        if category:
            sql += " AND category = :category"
        sql += " ORDER BY similarity DESC LIMIT :limit"

        params = {
            "query_embedding": str(query_embedding),
            "brand_id": str(brand_id),
            "threshold": similarity_threshold,
            "limit": limit
        }
        if category:
            params["category"] = category

        result = await db.execute(text(sql), params)
        rows = result.fetchall()

        docs_with_scores = []
        for row in rows:
            doc = await db.get(Document, row.id)
            if doc:
                docs_with_scores.append((doc, row.similarity))

        return docs_with_scores

    # -------------------- Context for Generation --------------------
    async def get_context_for_generation(
        self,
        db: AsyncSession,
        brand_id: UUID,
        query: str,
        max_context_length: int = 2000,
        category: Optional[str] = None
    ) -> str:
        """Build context by concatenating top relevant chunks."""
        similar_docs = await self.search_similar_documents(
            db, brand_id, query, limit=10, category=category
        )
        if not similar_docs:
            return ""

        context_parts = []
        current_length = 0
        for doc, _ in similar_docs:
            content = doc.chunk_text or doc.content
            if current_length + len(content) > max_context_length:
                remaining = max_context_length - current_length
                if remaining > 50:
                    context_parts.append(content[:remaining] + "...")
                break
            context_parts.append(content)
            current_length += len(content)

        return "\n\n".join(context_parts)

    # -------------------- Generation using Local LLaMA --------------------
    def generate_with_local_llm(self, prompt: str) -> str:
        """Generate text offline using local GGUF LLaMA."""
        response = self.local_llm.create_chat_completion(
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message["content"]

    # -------------------- Deletion --------------------
    async def delete_document(self, db: AsyncSession, document_id: UUID) -> bool:
        """Delete a parent document and all its chunks."""
        doc = await db.get(Document, document_id)
        if not doc:
            return False

        if not doc.is_chunk:
            await db.execute(
                text("DELETE FROM documents WHERE parent_document_id = :pid"),
                {"pid": str(document_id)}
            )

        await db.delete(doc)
        await db.commit()
        return True

    # -------------------- Document Stats --------------------
    async def get_document_stats(self, db: AsyncSession, brand_id: UUID) -> Dict[str, Any]:
        """Return total documents, chunks, and category breakdown."""
        total_docs = (await db.execute(
            select(func.count(Document.id))
            .where(and_(Document.brand_id == brand_id, Document.is_chunk == False))
        )).scalar() or 0

        total_chunks = (await db.execute(
            select(func.count(Document.id))
            .where(and_(Document.brand_id == brand_id, Document.is_chunk == True))
        )).scalar() or 0

        by_category_result = await db.execute(
            select(Document.category, func.count(Document.id).label("count"))
            .where(and_(Document.brand_id == brand_id, Document.is_chunk == False))
            .group_by(Document.category)
        )
        by_category = {row.category or "uncategorized": row.count for row in by_category_result}

        return {
            "total_documents": total_docs,
            "total_chunks": total_chunks,
            "by_category": by_category
        }
