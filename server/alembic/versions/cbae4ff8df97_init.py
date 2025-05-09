"""init

Revision ID: cbae4ff8df97
Revises: 7487181055e7
Create Date: 2025-03-23 14:36:30.709681

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cbae4ff8df97'
down_revision: Union[str, None] = '7487181055e7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('meters', sa.Column('property_id', sa.Integer(), nullable=False))
    op.drop_constraint('meters_user_id_fkey', 'meters', type_='foreignkey')
    op.create_foreign_key(None, 'meters', 'properties', ['property_id'], ['id'])
    op.drop_column('meters', 'user_id')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('meters', sa.Column('user_id', sa.INTEGER(), autoincrement=False, nullable=False))
    op.drop_constraint(None, 'meters', type_='foreignkey')
    op.create_foreign_key('meters_user_id_fkey', 'meters', 'users', ['user_id'], ['id'])
    op.drop_column('meters', 'property_id')
    # ### end Alembic commands ###
