"""empty message

Revision ID: 07b4b6b9544c
Revises: ebd16663238c
Create Date: 2025-06-03 14:07:19.157097

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '07b4b6b9544c'
down_revision = 'ebd16663238c'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('request', schema=None) as batch_op:
        batch_op.add_column(sa.Column('supporting_documents', postgresql.JSONB(astext_type=sa.Text()), nullable=True))

    op.execute("UPDATE request SET supporting_documents = '{}' WHERE supporting_documents IS NULL")

    with op.batch_alter_table('request', schema=None) as batch_op:
        batch_op.alter_column('supporting_documents', nullable=False)

    with op.batch_alter_table('request_history', schema=None) as batch_op:
        batch_op.add_column(sa.Column('supporting_documents', postgresql.JSONB(astext_type=sa.Text()), autoincrement=False, nullable=True))

    op.execute("UPDATE request_history SET supporting_documents = '{}' WHERE supporting_documents IS NULL")

    with op.batch_alter_table('request_history', schema=None) as batch_op:
        batch_op.alter_column('supporting_documents', nullable=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('request_history', schema=None) as batch_op:
        batch_op.drop_column('supporting_documents')

    with op.batch_alter_table('request', schema=None) as batch_op:
        batch_op.drop_column('supporting_documents')

    # ### end Alembic commands ###
