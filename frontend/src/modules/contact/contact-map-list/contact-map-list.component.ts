import { Component, OnInit, OnDestroy } from '@angular/core';
import { Http } from '@angular/http';
import { AppConfig } from '../../../conf/app.config';
import { GeoJSON } from 'leaflet';
import { MapListService } from '../../../core/GN2Common/map-list/map-list.service';
import { Subscription } from 'rxjs/Subscription';
import { ContactService } from '../services/contact.service';
import { CommonService } from '../../../core/GN2Common/service/common.service';
import { AuthService } from '../../../core/components/auth/auth.service';
import { CookieService } from 'ng2-cookies';

@Component({
  selector: 'pnx-contact-map-list',
  templateUrl: 'contact-map-list.component.html'
})

export class ContactMapListComponent implements OnInit {
  public geojsonData: GeoJSON;
  public displayColumns: Array<any>;
  public pathEdit: string;
  public pathInfo: string;
  public idName: string;
  public apiEndPoint: string;
  constructor( private _http: Http, private _mapListService: MapListService, private _contactService: ContactService,
    private _commonService: CommonService, private _auth: AuthService
   , private _cookie: CookieService) { }

  ngOnInit() {
    // this._cookie.deleteAll();
    // reset the URL query parameter
    this._mapListService.urlQuery.delete('organism');
    const currentUser = this._auth.getCurrentUser();
    const userRight = currentUser.getRight(14);

    if ( userRight['R'] < AppConfig.RIGHTS.ALL_DATA ) {
      this._mapListService.urlQuery.set('organism', currentUser.organism.organismId.toString());
    }

  this.displayColumns = [
   {prop: 'taxons', name: 'Taxon', display: true},
   {prop: 'observateurs', 'name': 'Observateurs'},
  ];
  this.pathEdit = 'contact-form';
  this.pathInfo = 'contact/info';
  this.idName = 'id_releve_contact';
  this.apiEndPoint = 'contact/vreleve';

  this._mapListService.getData('contact/vreleve')
  .subscribe(res => {
    this._mapListService.page.totalElements = res.total;
    this.geojsonData = res.items;
  });

  }

   deleteReleve(id) {
    this._contactService.deleteReleve(id)
      .subscribe(status => {
        if (status === 200) {
          this._commonService.translateToaster('success', 'Releve.DeleteSuccessfully');
        } else {
          this._commonService.translateToaster('error', 'ErrorMessage');
        }
      });
   }

}

