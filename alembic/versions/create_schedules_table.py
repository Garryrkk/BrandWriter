from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql as pg

revision = "create_schedules_table"
down_revision = "<your_previous_revision>"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "schedules",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("brand_id", pg.UUID, sa.ForeignKey("brands.id")),
        sa.Column("platform", sa.String),
        sa.Column("category", sa.String),
        sa.Column("post_id", sa.Integer),
        sa.Column("basket_id", sa.Integer),
        sa.Column("draft_id", sa.Integer),
        sa.Column("content", sa.Text),
        sa.Column("assets", pg.JSONB),
        sa.Column("scheduled_date", sa.Date),
        sa.Column("scheduled_time", sa.Time),
        sa.Column("timezone", sa.String),
        sa.Column("posting_options", pg.JSONB),
        sa.Column("posting_status", sa.String),
        sa.Column("attempt_count", sa.Integer),
        sa.Column("max_attempts", sa.Integer),
        sa.Column("error_message", sa.Text),
        sa.Column("error_details", pg.JSONB),
        sa.Column("last_attempt_at", sa.DateTime),
        sa.Column("published_url", sa.String),
        sa.Column("platform_post_id", sa.String),
        sa.Column("meta_data", pg.JSONB),
        sa.Column("notes", sa.Text),
        sa.Column("created_at", sa.DateTime),
        sa.Column("updated_at", sa.DateTime),
        sa.Column("posted_at", sa.DateTime)
    )

def downgrade():
    op.drop_table("schedules")
