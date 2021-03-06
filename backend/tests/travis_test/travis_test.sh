#!/bin/bash


sudo mkdir /etc/geonature
sudo mkdir /etc/geonature/mods-enabled
sudo mkdir /etc/geonature/mods-available

mkdir $TRAVIS_BUILD_DIR/frontend/src/external_assets

sudo sed -i "s/SQLALCHEMY_DATABASE_URI = .*$/SQLALCHEMY_DATABASE_URI = \"postgresql:\/\/$db_user:$db_pass@test.ecrins-parcnational.net:5432\/$db_name\"/" $TRAVIS_BUILD_DIR/backend/tests/travis_test/geonature_config_tests.toml

sudo cp $TRAVIS_BUILD_DIR/backend/tests/travis_test/geonature_config_tests.toml $TRAVIS_BUILD_DIR/config/geonature_config.toml

export PGPASSWORD=$db_pass;psql -U $db_user -h test.ecrins-parcnational.net -d $db_name -c "DELETE FROM gn_commons.t_modules WHERE module_name = 'occtax'"

python ../../../geonature_cmd.py install_command

geonature install_gn_module $TRAVIS_BUILD_DIR/contrib/occtax occtax --build=false








