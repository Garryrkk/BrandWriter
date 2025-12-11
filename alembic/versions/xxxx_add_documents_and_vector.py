"""
add document_chunks table with vector

Revision ID: 0003_add_document_chunks
Revises: 0002_add_documents_table_pgvector
Create Date: 2025-12-05 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision = "0003_add_document_chunks"
down_revision = "0002_add_documents_table_pgvector"
branch_labels = None
depends_on = None


def upgrade():
    # Ensure pgvector enabled
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    # Create document_chunks table
    op.create_table(
        "document_chunks",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column(
            "document_id",
            sa.Integer,
            sa.ForeignKey("documents.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "brand_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("brands.id", ondelete="CASCADE"),
            nullable=True,
        ),
        sa.Column("chunk_text", sa.Text(), nullable=False),
        sa.Column("chunk_meta", postgresql.JSONB, nullable=True),
        sa.Column("embedding", Vector(1536)),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
        ),
    )

    # Indexes
    op.create_index(
        "ix_document_chunks_brand_id",
        "document_chunks",
        ["brand_id"],
    )
    op.create_index(
        "ix_document_chunks_document_id",
        "document_chunks",
        ["document_id"],
    )


def downgrade():
    op.drop_index("ix_document_chunks_document_id", table_name="document_chunks")
    op.drop_index("ix_document_chunks_brand_id", table_name="document_chunks")
    op.drop_table("document_chunks")
