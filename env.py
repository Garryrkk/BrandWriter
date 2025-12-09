

from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from backend.app.db.database import Base
from backend.app.models.user import User
from backend.app.models.brand import  Brand
from backend.app.models.brand_assets import BrandAsset
from backend.app.models.template import  Template
from backend.app.models.audit import  Audit


config = context.config
fileConfig(config.get_main_config_file_name())
target_metadata = Base.metadata


def run_migrations_offline():
    context.configure(url=config.get_main_option("sqlalchemy.url"), target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(
config.get_section(config.config_ini_section), prefix="sqlalchemy.", poolclass=pool.NullPool
)
with connectable.connect() as connection:
    context.configure(connection=connection, target_metadata=target_metadata)
with context.begin_transaction():
    context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()