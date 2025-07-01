"""add tariff column to meters

Revision ID: ddc742aa4736
Revises: 1c4161428fb4
Create Date: 2025-07-01 17:54:46.838798

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ddc742aa4736'
down_revision: Union[str, None] = '1c4161428fb4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Сначала добавляем колонку как NULLABLE
    op.add_column('meters', sa.Column('tariff', sa.Numeric(precision=10, scale=2), nullable=True))
    
    # Устанавливаем дефолтное значение для существующих записей
    op.execute("UPDATE meters SET tariff = 0 WHERE tariff IS NULL")
    
    # Затем меняем на NOT NULL
    op.alter_column('meters', 'tariff', nullable=False)

def downgrade():
    op.drop_column('meters', 'tariff')