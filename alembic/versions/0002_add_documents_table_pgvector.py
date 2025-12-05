"""add documents table with pgvector

Revision ID: 0002_add_documents_table_pgvector
Revises: None
Create Date: 2025-12-04 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0002_add_documents_table_pgvector"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # ensure the vector extension exists
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    # create documents table
    op.create_table(
        "documents",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("brand_id", sa.Integer(), sa.ForeignKey("brands.id", ondelete="CASCADE"), index=True, nullable=True),
        sa.Column("source", sa.String(), nullable=True),
        sa.Column("url", sa.String(), nullable=True),
        sa.Column("title", sa.String(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("metadata", sa.JSON(), nullable=True),
        # adjust dim to your embedder (example uses 384)
        sa.Column("embedding", sa.dialects.postgresql.ARRAY(sa.Float), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )

    # If you use native pgvector via the pgvector package, use:
    # op.execute("ALTER TABLE documents ADD COLUMN embedding vector(384);")
    # but above we created embedding as ARRAY(float) to be portable if pgvector not available.

def downgrade():
    op.drop_table("documents")
    # leave extension in place (optional)
