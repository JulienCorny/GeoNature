import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit
} from "@angular/core";
import { FormGroup } from "@angular/forms";

import { MapService } from "@geonature_common/map/map.service";
import { leafletDrawOption } from "@geonature_common/map/leaflet-draw.options";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { ModuleConfig } from "../module.config";
import { OcctaxFormService } from "./form/occtax-form.service";
import { CommonService } from "@geonature_common/service/common.service";
import { OcctaxService } from "../services/occtax.service";
import { DataFormService } from "@geonature_common/form/data-form.service";
import { MarkerComponent } from "@geonature_common/map/marker/marker.component";
import { LeafletDrawComponent } from "@geonature_common/map/leaflet-draw/leaflet-draw.component";

@Component({
  selector: "pnx-occtax-map-form",
  templateUrl: "./occtax-map-form.component.html",
  styleUrls: ["./occtax-map-form.component.scss"],
  providers: [MapService]
})
export class OcctaxMapFormComponent
  implements OnInit, OnDestroy, AfterViewInit {
  public leafletDrawOptions: any;
  private _sub: Subscription;
  public id: number;
  @ViewChild(MarkerComponent)
  public markerComponent: MarkerComponent;
  @ViewChild(LeafletDrawComponent)
  public leafletDrawComponent: LeafletDrawComponent;

  public occtaxConfig = ModuleConfig;
  constructor(
    private _ms: MapService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _commonService: CommonService,
    public fs: OcctaxFormService,
    private occtaxService: OcctaxService,
    private _dfs: DataFormService
  ) {}

  ngOnInit() {
    // overight the leaflet draw object to set options
    // examples: enable circle =>  leafletDrawOption.draw.circle = true;
    this.leafletDrawOptions = leafletDrawOption;
    // get the id from the route
    this._sub = this._route.params.subscribe(params => {
      this.id = +params["id"];

      // if its edition mode
      if (!isNaN(this.id)) {
        // set showOccurrence to false;
        this.fs.showOccurrence = false;
        this.fs.editionMode = true;
        // load one releve
        this.occtaxService.getOneReleve(this.id).subscribe(
          data => {
            data.releve.properties.observers = data.releve.properties.observers.map(
              obs => {
                obs["nom_complet"] = obs.nom_role + " " + obs.prenom_role;
                return obs;
              }
            );

            // pre fill the form
            this.fs.releveForm.patchValue({
              properties: data.releve.properties
            });

            (this.fs.releveForm.controls.properties as FormGroup).patchValue({
              date_min: this.fs.formatDate(data.releve.properties.date_min)
            });
            (this.fs.releveForm.controls.properties as FormGroup).patchValue({
              date_max: this.fs.formatDate(data.releve.properties.date_max)
            });
            const hour_min =
              data.releve.properties.hour_min === "None"
                ? null
                : data.releve.properties.hour_min;
            const hour_max =
              data.releve.properties.hour_max === "None"
                ? null
                : data.releve.properties.hour_max;
            (this.fs.releveForm.controls.properties as FormGroup).patchValue({
              hour_min: hour_min
            });
            (this.fs.releveForm.controls.properties as FormGroup).patchValue({
              hour_max: hour_max
            });

            const orderedCdNomList = [];
            data.releve.properties.t_occurrences_occtax.forEach(occ => {
              orderedCdNomList.push(occ.cd_nom);
              this._dfs.getTaxonInfo(occ.cd_nom).subscribe(taxon => {
                this.fs.taxonsList.push(taxon);
              });
            });

            // HACK to re order taxon list because of side effect of ajax
            // TODO: do it with async
            const reOrderTaxon = [];
            setTimeout(() => {
              for (let i = 0; i < orderedCdNomList.length; i++) {
                for (let j = 0; j < this.fs.taxonsList.length; j++) {
                  if (this.fs.taxonsList[j].cd_nom === orderedCdNomList[i]) {
                    reOrderTaxon.push(this.fs.taxonsList[j]);
                    break;
                  }
                }
              }
              this.fs.taxonsList = reOrderTaxon;
            }, 1500);

            // set the occurrence
            this.fs.indexOccurrence =
              data.releve.properties.t_occurrences_occtax.length;
            // push the geometry in releveForm
            this.fs.releveForm.patchValue({ geometry: data.releve.geometry });
            // load the geometry in the map

            //this._ms.loadGeometryReleve(data.releve, true);
            if (data.releve.geometry.type == "Point") {
              // set the input for the marker component
              this.fs.markerCoordinates = data.releve.geometry.coordinates;
              this._ms.map.setView(
                [
                  data.releve.geometry.coordinates[1],
                  data.releve.geometry.coordinates[0]
                ],
                15
              );
            } else {
              // set the input for leafletdraw component
              this.fs.geojsonCoordinates = data.releve.geometry;
            }

            this.fs.releveForm.patchValue({ geometry: data.releve.geometry });

            // activation of the output of markerComponent and leafletDraw to set altitude
            this.markerComponent.markerChanged.subscribe(geojson => {
              this._ms.setGeojsonCoord(geojson);
            });

            this.leafletDrawComponent.layerDrawed.subscribe(geojson => {
              this._ms.setGeojsonCoord(geojson);
            });
          },
          error => {
            this._commonService.translateToaster(
              "error",
              "Releve.DoesNotExist"
            );
            this._router.navigate(["/occtax"]);
          }
        ); // end subscribe
      }
    });
  }

  // ngAfterViewInit() {
  //   this.occtaxFormComponent.markerComponent
  // }

  sendGeoInfo(geojson) {
    this._ms.setGeojsonCoord(geojson);
  }

  ngOnDestroy() {
    this._sub.unsubscribe();
  }
}
