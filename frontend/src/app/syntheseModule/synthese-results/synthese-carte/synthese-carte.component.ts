import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { GeoJSON } from 'leaflet';
import { MapListService } from '@geonature_common/map-list/map-list.service';
import { MapService } from '@geonature_common/map/map.service';

@Component({
    selector: 'pnx-synthese-carte',
    templateUrl: 'synthese-carte.component.html',
    styleUrls: ['synthese-carte.component.scss'],
    providers: [MapService],
})

export class SyntheseCarteComponent implements OnInit, AfterViewInit {
    @Input() inputSyntheseData: GeoJSON;
    constructor(
        public mapListService: MapListService,
        private _ms: MapService
    ) { }

    ngOnInit() { }

    ngAfterViewInit() {
        // event from the list
        this.mapListService.enableMapListConnexion(this._ms.getMap());
    }

    onEachFeature(feature, layer) {
        // event from the map
        this.mapListService.layerDict[feature.id] = layer;
        layer.on({
            click: (e) => {
                // toggle style
                this.mapListService.toggleStyle(layer);
                // observable
                this.mapListService.mapSelected.next(feature.id);
                // open popup
                // layer.bindPopup(feature.properties.leaflet_popup).openPopup();
            }
        });
    }
}