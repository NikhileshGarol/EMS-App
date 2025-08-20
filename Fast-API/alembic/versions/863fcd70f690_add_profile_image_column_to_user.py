from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '863fcd70f690'
down_revision = '4a7920d77ac4'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('User', sa.Column('profile_image', sa.String(length=255), nullable=True))

def downgrade():
    op.drop_column('User', 'profile_image')