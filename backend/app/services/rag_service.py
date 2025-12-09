from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from typing import List, Optional, Dict, Any
from uuid import UUID
import numpy as np
from sentence_transformers import SentenceTransformer
from app.models.document import Document
from app.core.config import settings
import os
class RAGService:
    """Service layer for RAG (Retrieval Augmented Generation) operations"""
    
    def __init__(self):
        hf_token = os.environ.get("HF_TOKEN")  # safer than hardcoding
        self.embedding_model = SentenceTransformer(
            settings.EMBEDDING_MODEL,
            use_auth_token=hf_token
        )
        self.chunk_size = settings.CHUNK_SIZE
        self.chunk_overlap = settings.CHUNK_OVERLAP
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for text"""
        embedding = self.embedding_model.encode(text, convert_to_numpy=True)
        return embedding.tolist()
    
    def chunk_text(self, text: str) -> List[str]:
        """Split text into chunks with overlap"""
        words = text.split()
        chunks = []
        
        i = 0
        while i < len(words):
            chunk = ' '.join(words[i:i + self.chunk_size])
            chunks.append(chunk)
            i += self.chunk_size - self.chunk_overlap
            
            if i >= len(words):
                break
        
        return chunks
    
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
        """Add a document and create embeddings for its chunks"""
        # Create parent document
        parent_doc = Document(
            brand_id=brand_id,
            title=title,
            source=source,
            document_type=document_type,
            content=content,
            full_text=content,
            is_chunk=False,
            metadata=metadata or {},
            category=category,
            word_count=len(content.split()),
            char_count=len(content)
        )
        db.add(parent_doc)
        await db.flush()  # Get the parent ID
        
        # Chunk the document
        chunks = self.chunk_text(content)
        chunk_docs = []
        
        for i, chunk_text in enumerate(chunks):
            # Generate embedding
            embedding = self.generate_embedding(chunk_text)
            
            # Create chunk document
            chunk_doc = Document(
                brand_id=brand_id,
                title=f"{title} - Chunk {i+1}",
                source=source,
                document_type=document_type,
                content=chunk_text,
                chunk_text=chunk_text,
                full_text=content,
                is_chunk=True,
                parent_document_id=parent_doc.id,
                chunk_index=i,
                total_chunks=len(chunks),
                embedding=embedding,
                embedding_model=settings.EMBEDDING_MODEL,
                metadata=metadata or {},
                category=category,
                word_count=len(chunk_text.split()),
                char_count=len(chunk_text)
            )
            chunk_docs.append(chunk_doc)
            db.add(chunk_doc)
        
        await db.commit()
        
        # Refresh all documents
        await db.refresh(parent_doc)
        for chunk_doc in chunk_docs:
            await db.refresh(chunk_doc)
        
        return [parent_doc] + chunk_docs
    
    async def search_similar_documents(
        self,
        db: AsyncSession,
        brand_id: UUID,
        query: str,
        limit: int = 5,
        category: Optional[str] = None,
        similarity_threshold: float = 0.7
    ) -> List[tuple[Document, float]]:
        """Search for similar documents using vector similarity"""
        # Generate query embedding
        query_embedding = self.generate_embedding(query)
        
        # Build the query
        # Using pgvector's cosine similarity operator (<=>)
        query_text = """
            SELECT id, title, content, chunk_text, source, metadata, category,
                   1 - (embedding <=> :query_embedding) as similarity
            FROM documents
            WHERE brand_id = :brand_id
              AND is_chunk = true
              AND (1 - (embedding <=> :query_embedding)) >= :threshold
        """
        
        if category:
            query_text += " AND category = :category"
        
        query_text += " ORDER BY similarity DESC LIMIT :limit"
        
        params = {
            "query_embedding": str(query_embedding),
            "brand_id": str(brand_id),
            "threshold": similarity_threshold,
            "limit": limit
        }
        
        if category:
            params["category"] = category
        
        result = await db.execute(text(query_text), params)
        rows = result.fetchall()
        
        # Convert to Document objects with similarity scores
        documents_with_scores = []
        for row in rows:
            doc = await db.get(Document, row.id)
            if doc:
                documents_with_scores.append((doc, row.similarity))
        
        return documents_with_scores
    
    async def get_context_for_generation(
        self,
        db: AsyncSession,
        brand_id: UUID,
        query: str,
        max_context_length: int = 2000,
        category: Optional[str] = None
    ) -> str:
        """Get relevant context for content generation"""
        # Search for similar documents
        similar_docs = await self.search_similar_documents(
            db, brand_id, query, limit=10, category=category
        )
        
        if not similar_docs:
            return ""
        
        # Build context from most relevant chunks
        context_parts = []
        current_length = 0
        
        for doc, similarity in similar_docs:
            content = doc.chunk_text or doc.content
            content_length = len(content)
            
            if current_length + content_length > max_context_length:
                # Add partial content if it fits
                remaining = max_context_length - current_length
                if remaining > 100:  # Only add if meaningful amount remains
                    context_parts.append(content[:remaining] + "...")
                break
            
            context_parts.append(content)
            current_length += content_length
        
        return "\n\n".join(context_parts)
    
    async def delete_document(
        self,
        db: AsyncSession,
        document_id: UUID
    ) -> bool:
        """Delete a document and all its chunks"""
        doc = await db.get(Document, document_id)
        if not doc:
            return False
        
        # If it's a parent document, delete all chunks
        if not doc.is_chunk:
            await db.execute(
                text("DELETE FROM documents WHERE parent_document_id = :parent_id"),
                {"parent_id": str(document_id)}
            )
        
        # Delete the document itself
        await db.delete(doc)
        await db.commit()
        return True
    
    async def get_document_stats(
        self,
        db: AsyncSession,
        brand_id: UUID
    ) -> Dict[str, Any]:
        """Get statistics about documents"""
        # Total documents (non-chunks)
        total_docs_result = await db.execute(
            select(func.count(Document.id))
            .where(
                and_(
                    Document.brand_id == brand_id,
                    Document.is_chunk == False
                )
            )
        )
        total_docs = total_docs_result.scalar() or 0
        
        # Total chunks
        total_chunks_result = await db.execute(
            select(func.count(Document.id))
            .where(
                and_(
                    Document.brand_id == brand_id,
                    Document.is_chunk == True
                )
            )
        )
        total_chunks = total_chunks_result.scalar() or 0
        
        # By category
        category_result = await db.execute(
            select(
                Document.category,
                func.count(Document.id).label('count')
            )
            .where(
                and_(
                    Document.brand_id == brand_id,
                    Document.is_chunk == False
                )
            )
            .group_by(Document.category)
        )
        by_category = {row.category or 'uncategorized': row.count for row in category_result}
        
        return {
            'total_documents': total_docs,
            'total_chunks': total_chunks,
            'by_category': by_category
        }