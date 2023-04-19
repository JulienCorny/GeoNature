"""alter gn_commons.t_modules.module_group column

Revision ID: 73503c6a90bd
Revises: 3eca0edf1c00
Create Date: 2023-04-19 17:06:45.275536

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "73503c6a90bd"
down_revision = "3eca0edf1c00"
branch_labels = None
depends_on = "3eca0edf1c00"


def upgrade():
    op.execute(
        """
    ALTER TABLE gn_commons.t_modules RENAME module_group TO id_module_group;

    ALTER TABLE gn_commons.t_modules ALTER column id_module_group TYPE integer USING id_module_group::integer;

    ALTER TABLE gn_commons.t_modules ADD CONSTRAINT fk_bib_module_groups FOREIGN KEY ( id_module_group ) REFERENCES gn_commons.bib_module_groups( id_module_group ) ON UPDATE CASCADE ON DELETE NO ACTION;

    """
    )


def downgrade():
    op.execute(
        """
    ALTER TABLE gn_commons.t_modules RENAME id_module_group TO module_group;
    
    ALTER TABLE gn_commons.t_modules DROP CONSTRAINT fk_bib_module_groups;
    
    ALTER TABLE gn_commons.t_modules ALTER COLUMN module_group TYPE varchar(50);
    """
    )
