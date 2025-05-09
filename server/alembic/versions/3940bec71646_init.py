"""init

Revision ID: 3940bec71646
Revises: 24a38886a632
Create Date: 2025-03-25 16:33:27.103935

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '3940bec71646'
down_revision: Union[str, None] = '24a38886a632'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('tariffs')
    op.drop_index('ix_receipts_id', table_name='receipts')
    op.drop_table('receipts')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('receipts',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('transaction_number', sa.VARCHAR(length=50), autoincrement=False, nullable=False),
    sa.Column('transaction_date', sa.DATE(), autoincrement=False, nullable=False),
    sa.Column('amount', sa.NUMERIC(), autoincrement=False, nullable=False),
    sa.Column('status', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('property_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('created_at', postgresql.TIMESTAMP(), server_default=sa.text('now()'), autoincrement=False, nullable=False),
    sa.Column('updated_at', postgresql.TIMESTAMP(), server_default=sa.text('now()'), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['property_id'], ['properties.id'], name='receipts_property_id_fkey'),
    sa.PrimaryKeyConstraint('id', name='receipts_pkey'),
    sa.UniqueConstraint('transaction_number', name='receipts_transaction_number_key')
    )
    op.create_index('ix_receipts_id', 'receipts', ['id'], unique=False)
    op.create_table('tariffs',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('type', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('rate', sa.NUMERIC(), autoincrement=False, nullable=False),
    sa.Column('created_at', postgresql.TIMESTAMP(), server_default=sa.text('now()'), autoincrement=False, nullable=False),
    sa.Column('updated_at', postgresql.TIMESTAMP(), server_default=sa.text('now()'), autoincrement=False, nullable=False),
    sa.PrimaryKeyConstraint('id', name='tariffs_pkey'),
    sa.UniqueConstraint('type', name='tariffs_type_key')
    )
    # ### end Alembic commands ###
