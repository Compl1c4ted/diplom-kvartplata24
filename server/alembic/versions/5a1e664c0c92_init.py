"""init

Revision ID: 5a1e664c0c92
Revises: 751e89423629
Create Date: 2025-04-20 00:03:23.009968

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5a1e664c0c92'
down_revision: Union[str, None] = '751e89423629'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('payments',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=True),
    sa.Column('payment_date', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
    sa.Column('status', sa.String(length=20), nullable=True),
    sa.Column('payment_method', sa.String(length=50), nullable=True),
    sa.Column('transaction_id', sa.String(length=100), nullable=True),
    sa.Column('transaction_date', sa.DateTime(), nullable=False),
    sa.Column('paid', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('transaction_id')
    )
    op.create_table('receipts',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('transaction_number', sa.String(length=50), nullable=False),
    sa.Column('transaction_date', sa.Date(), nullable=False),
    sa.Column('amount', sa.Numeric(), nullable=False),
    sa.Column('status', sa.String(), nullable=False),
    sa.Column('property_id', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['property_id'], ['properties.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('transaction_number')
    )
    op.create_index(op.f('ix_receipts_id'), 'receipts', ['id'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_receipts_id'), table_name='receipts')
    op.drop_table('receipts')
    op.drop_table('payments')
    # ### end Alembic commands ###
