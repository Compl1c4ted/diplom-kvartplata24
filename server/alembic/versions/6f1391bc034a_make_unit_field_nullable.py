"""make unit field nullable

Revision ID: 6f1391bc034a
Revises: 2ce28be6cc72
Create Date: 2025-04-01 19:46:49.558609

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6f1391bc034a'
down_revision: Union[str, None] = '2ce28be6cc72'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
