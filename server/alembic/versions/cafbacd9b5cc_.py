"""empty message

Revision ID: cafbacd9b5cc
Revises: 6f1391bc034a
Create Date: 2025-04-19 21:01:25.481980

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cafbacd9b5cc'
down_revision: Union[str, None] = '6f1391bc034a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
