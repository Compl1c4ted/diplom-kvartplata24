"""make unit field nullable

Revision ID: 2ce28be6cc72
Revises: 2430c86cccc1
Create Date: 2025-04-01 19:42:04.003672

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2ce28be6cc72'
down_revision: Union[str, None] = '2430c86cccc1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
