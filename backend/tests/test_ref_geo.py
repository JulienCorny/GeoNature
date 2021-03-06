import pytest

from flask import url_for

from .bootstrap_test import app, post_json, json_of_response


geojson = {"geometry": {"type": "Point", "coordinates": [6.181660294532777, 45.94283270493131]}}

@pytest.mark.usefixtures('client_class')
class TestRefGeo:
    def test_geoinfo(self):
        response = post_json(
            self.client,
            url_for('ref_geo.getGeoInfo'),
            geojson
        )

        assert response.status_code == 200
        data = json_of_response(response)
        assert data['municipality'][0]['area_name'] == 'Villaz'
        assert data.get('altitude') is not None

    def test_area_intersection(self):
        response = post_json(
            self.client,
            url_for('ref_geo.getAreasIntersection'),
            geojson
        )

        assert response.status_code == 200
        data = json_of_response(response)
        assert data['101']['areas'][0]['area_name'] == 'Villaz'

    def test_municipalities(self):
        query_string = {'nom_com': 'Villaz'}
        response = self.client.get(
            url_for('ref_geo.get_municipalities'),
            query_string=query_string
        )
        assert response.status_code == 200
        data = json_of_response(response)
        assert data[0]['nom_com'] == 'Villaz'


        
