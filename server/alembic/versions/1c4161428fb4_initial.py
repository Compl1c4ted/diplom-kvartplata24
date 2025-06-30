"""initial

Revision ID: 1c4161428fb4
Revises: 8c6da9fe0e4a
Create Date: 2025-06-30 23:43:50.213040

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1c4161428fb4'
down_revision: Union[str, None] = '8c6da9fe0e4a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
