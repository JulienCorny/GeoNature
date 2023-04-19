"""create table gn_commons.bib_module_groups

Revision ID: 3eca0edf1c00
Revises: e2a94808cf76
Create Date: 2023-04-19 17:02:13.676330

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "3eca0edf1c00"
down_revision = "e2a94808cf76"
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS gn_commons.bib_module_groups (
        id_module_group integer NOT NULL,
        group_name character varying(255) NOT NULL
        );

        ALTER TABLE ONLY gn_commons.bib_module_groups
            ADD CONSTRAINT pk_bib_module_groups PRIMARY KEY (id_module_group);
        
        ALTER TABLE ONLY gn_commons.bib_module_groups
            ADD CONSTRAINT unq_group_name UNIQUE ( group_name );

        CREATE SEQUENCE gn_commons.bib_module_groups_id_module_group_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        
        ALTER SEQUENCE gn_commons.bib_module_groups_id_module_group_seq OWNED BY gn_commons.bib_module_groups.id_module_group;
        ALTER TABLE ONLY gn_commons.bib_module_groups ALTER COLUMN id_module_group SET DEFAULT nextval('gn_commons.bib_module_groups_id_module_group_seq'::regclass);
        """
    )


def downgrade():
    op.execute(
        """
        DROP TABLE gn_commons.bib_module_groups;
        """
    )
