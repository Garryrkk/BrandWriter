"""add documents and document_chunks with vector

Revision ID: add_documents_vector
Revises: <prev>
Create Date: 2025-12-03 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision = 'add_documents_vector'
down_revision = '<prev>'
branch_labels = None
depends_on = None

def upgrade():
    # create documents table
    op.create_table(
        'documents',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('brand_id', sa.Integer, sa.ForeignKey('brands.id', ondelete='CASCADE')),
        sa.Column('filename', sa.String(), nullable=True),
        sa.Column('source_url', sa.String(), nullable=True),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('meta', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )

    # create chunks table
    op.create_table(
        'document_chunks',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('document_id', sa.Integer, sa.ForeignKey('documents.id', ondelete='CASCADE')),
        sa.Column('brand_id', sa.Integer, sa.ForeignKey('brands.id', ondelete='CASCADE')),
        sa.Column('chunk_text', sa.Text(), nullable=False),
        sa.Column('chunk_meta', sa.JSON(), nullable=True),
        sa.Column('embedding', Vector(1536)),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now())
    )

def downgrade():
    op.drop_table('document_chunks')
    op.drop_table('documents')
