"""
add documents table with pgvector

Revision ID: 0002_add_documents_table_pgvector
Revises: 0001_init
Create Date: 2025-12-04 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "0002_add_documents_table_pgvector"
down_revision = "0001_init"
branch_labels = None
depends_on = None


def upgrade():
    # Enable pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    # Create documents table
    op.create_table(
        "documents",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "brand_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("brands.id", ondelete="CASCADE"),
            index=True,
            nullable=True,
        ),
        sa.Column("source", sa.String(), nullable=True),
        sa.Column("url", sa.String(), nullable=True),
        sa.Column("title", sa.String(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("meta_data", postgresql.JSONB, nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
        ),
        sa.Column("embedding", sa.types.UserDefinedType(), nullable=True),
    )

    # Correct vector dimension
    op.execute("ALTER TABLE documents ALTER COLUMN embedding TYPE vector(1536);")


def downgrade():
    op.drop_table("documents")
